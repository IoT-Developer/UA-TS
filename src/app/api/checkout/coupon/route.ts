import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateCurrentUser } from '@/lib/auth';
import { validateCoupon } from '@/lib/coupons';

export async function POST(req: Request) {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  let body: { courseId?: string; code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { courseId, code } = body;
  if (!courseId || !code) {
    return NextResponse.json({ error: 'courseId and code required' }, { status: 400 });
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { priceInPaise: true },
  });
  if (!course) {
    return NextResponse.json({ error: 'Course not found' }, { status: 404 });
  }

  const result = await validateCoupon(code, course.priceInPaise);
  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 200 });
  }

  return NextResponse.json({
    valid: true,
    discountInPaise: result.discountInPaise,
    finalInPaise: course.priceInPaise - result.discountInPaise,
  });
}
