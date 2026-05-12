import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateCurrentUser } from '@/lib/auth';
import { isProfileComplete } from '@/lib/utils';
import { getRazorpay } from '@/lib/razorpay/server';
import { validateCoupon } from '@/lib/coupons';

export async function POST(req: Request) {
  // 1. Auth
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  // 2. Profile must be complete before enrollment (per Phase 2.5 decision)
  if (!isProfileComplete(user)) {
    return NextResponse.json(
      { error: 'Complete your profile before enrolling', redirect: '/dashboard/profile' },
      { status: 400 }
    );
  }

  // 3. Parse request
  let body: { courseId?: string; couponCode?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { courseId, couponCode } = body;
  if (!courseId) {
    return NextResponse.json({ error: 'courseId required' }, { status: 400 });
  }

  // 4. Fetch course
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      priceInPaise: true,
    },
  });
  if (!course || course.status !== 'PUBLISHED') {
    return NextResponse.json({ error: 'Course not available' }, { status: 404 });
  }

  // 5. Already enrolled?
  const existingEnrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
  });
  if (existingEnrollment) {
    return NextResponse.json(
      { error: 'You are already enrolled', redirect: `/learn/${course.slug}` },
      { status: 409 }
    );
  }

  // 6. Apply coupon if any
  let discountInPaise = 0;
  let couponId: string | undefined;
  if (couponCode?.trim()) {
    const result = await validateCoupon(couponCode, course.priceInPaise);
    if (!result.valid) {
      return NextResponse.json({ error: result.error || 'Invalid coupon' }, { status: 400 });
    }
    discountInPaise = result.discountInPaise;
    couponId = result.coupon?.id;
  }

  const finalInPaise = Math.max(0, course.priceInPaise - discountInPaise);

  // 7. Free enrollment — no Razorpay needed, enroll immediately
  if (finalInPaise === 0) {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: user.id,
          courseId: course.id,
          amountInPaise: course.priceInPaise,
          discountInPaise,
          finalInPaise: 0,
          couponId,
          razorpayOrderId: `free_${Date.now()}_${user.id.slice(-6)}`,
          status: 'PAID',
        },
      });
      await tx.enrollment.create({
        data: {
          userId: user.id,
          courseId: course.id,
          orderId: order.id,
        },
      });
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }
    });
    return NextResponse.json({
      free: true,
      redirect: `/checkout/success?course=${course.slug}`,
    });
  }

  // 8. Create Razorpay order
  let razorpayOrder;
  try {
    razorpayOrder = await getRazorpay().orders.create({
      amount: finalInPaise, // already in paise
      currency: 'INR',
      receipt: `course_${course.id.slice(-8)}_${user.id.slice(-6)}`,
      notes: {
        userId: user.id,
        courseId: course.id,
        courseTitle: course.title,
      },
    });
  } catch (err) {
    console.error('Razorpay order creation failed:', err);
    return NextResponse.json(
      { error: 'Could not initialize payment. Please try again.' },
      { status: 502 }
    );
  }

  // 9. Persist pending Order in our DB
  try {
    await prisma.order.create({
      data: {
        userId: user.id,
        courseId: course.id,
        amountInPaise: course.priceInPaise,
        discountInPaise,
        finalInPaise,
        couponId,
        razorpayOrderId: razorpayOrder.id,
        status: 'PENDING',
      },
    });
  } catch (err) {
    console.error('Order persist failed:', err);
    return NextResponse.json(
      { error: 'Could not save order. Please try again.' },
      { status: 500 }
    );
  }

  // 10. Return what the browser needs to open Razorpay checkout
  return NextResponse.json({
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    razorpayOrderId: razorpayOrder.id,
    amountInPaise: finalInPaise,
    currency: 'INR',
    courseTitle: course.title,
    courseSlug: course.slug,
    prefill: {
      name: user.name || '',
      email: user.email,
      contact: user.phone || '',
    },
  });
}
