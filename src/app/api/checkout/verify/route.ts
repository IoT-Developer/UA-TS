import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateCurrentUser } from '@/lib/auth';
import { verifyPaymentSignature } from '@/lib/razorpay/server';

export async function POST(req: Request) {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  let body: {
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;

  if (!orderId || !paymentId || !signature) {
    return NextResponse.json({ error: 'Missing payment params' }, { status: 400 });
  }

  // 1. Verify HMAC signature — proves Razorpay sent this, not a forged request
  const valid = verifyPaymentSignature({ orderId, paymentId, signature });
  if (!valid) {
    console.warn('Invalid payment signature for order', orderId);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // 2. Locate our Order, ensuring it belongs to this user
  const order = await prisma.order.findUnique({
    where: { razorpayOrderId: orderId },
    include: { course: { select: { slug: true } } },
  });

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }
  if (order.userId !== user.id) {
    return NextResponse.json({ error: 'Order does not belong to you' }, { status: 403 });
  }

  // 3. Idempotency — if webhook already marked PAID and created enrollment, just succeed
  if (order.status === 'PAID') {
    return NextResponse.json({
      success: true,
      alreadyPaid: true,
      redirect: `/checkout/success?course=${order.course.slug}`,
    });
  }

  // 4. Mark paid + enroll, in a transaction
  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          razorpayPaymentId: paymentId,
          razorpaySignature: signature,
        },
      });

      // Create enrollment only if one doesn't exist (defensive against webhook race)
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

      // Increment coupon usage if any
      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { usedCount: { increment: 1 } },
        });
      }
    });
  } catch (err) {
    console.error('Order finalize failed:', err);
    return NextResponse.json({ error: 'Could not finalize order' }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    redirect: `/checkout/success?course=${order.course.slug}`,
  });
}
