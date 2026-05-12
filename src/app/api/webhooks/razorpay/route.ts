import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay/server';

/**
 * Razorpay webhook handler.
 *
 * Setup (after deployment):
 *   Razorpay Dashboard → Settings → Webhooks → Add new webhook
 *   URL: https://yourdomain.com/api/webhooks/razorpay
 *   Active events: payment.captured, payment.failed, order.paid
 *   Copy the signing secret into RAZORPAY_WEBHOOK_SECRET env var.
 *
 * This handler is the source of truth — even if the browser callback fails
 * (user closes tab, network glitch), this fires server-to-server and
 * guarantees enrollment.
 */
export async function POST(req: Request) {
  const headerStore = await headers();
  const signature = headerStore.get('x-razorpay-signature');

  // Read raw body (required for signature verification — JSON.stringify might reorder keys)
  const rawBody = await req.text();

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  if (!verifyWebhookSignature(rawBody, signature)) {
    console.warn('Razorpay webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: {
    event: string;
    payload?: {
      payment?: { entity?: { id?: string; order_id?: string; status?: string } };
      order?: { entity?: { id?: string; status?: string } };
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  console.log('Razorpay webhook event:', event.event);

  try {
    switch (event.event) {
      case 'payment.captured':
      case 'order.paid': {
        const paymentEntity = event.payload?.payment?.entity;
        const orderEntity = event.payload?.order?.entity;
        const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
        const paymentId = paymentEntity?.id;

        if (!razorpayOrderId) break;

        const order = await prisma.order.findUnique({
          where: { razorpayOrderId },
        });

        if (!order) {
          console.warn('Webhook: order not found for', razorpayOrderId);
          break;
        }

        // Idempotent — only act if order is still PENDING
        if (order.status === 'PENDING') {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: 'PAID',
                razorpayPaymentId: paymentId || undefined,
              },
            });

            const existing = await tx.enrollment.findUnique({
              where: { userId_courseId: { userId: order.userId, courseId: order.courseId } },
            });
            if (!existing) {
              await tx.enrollment.create({
                data: {
                  userId: order.userId,
                  courseId: order.courseId,
                  orderId: order.id,
                },
              });
            }

            if (order.couponId) {
              await tx.coupon.update({
                where: { id: order.couponId },
                data: { usedCount: { increment: 1 } },
              });
            }
          });
          console.log('Webhook: enrolled user', order.userId, 'in', order.courseId);
        }
        break;
      }

      case 'payment.failed': {
        const razorpayOrderId = event.payload?.payment?.entity?.order_id;
        if (!razorpayOrderId) break;
        await prisma.order.updateMany({
          where: { razorpayOrderId, status: 'PENDING' },
          data: { status: 'FAILED' },
        });
        break;
      }

      default:
        // Many other event types — we ignore them
        break;
    }
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
