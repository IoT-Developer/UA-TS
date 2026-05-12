'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export type CouponActionState = {
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
};

function parseCouponForm(formData: FormData) {
  const code = String(formData.get('code') ?? '').trim().toUpperCase();
  const description = String(formData.get('description') ?? '').trim();
  const discountType = String(formData.get('discountType') ?? 'PERCENT').trim();
  const discountValueStr = String(formData.get('discountValue') ?? '').trim();
  const maxUsesStr = String(formData.get('maxUses') ?? '').trim();
  const validFromStr = String(formData.get('validFrom') ?? '').trim();
  const validUntilStr = String(formData.get('validUntil') ?? '').trim();
  const isActive = formData.get('isActive') === 'on';

  return {
    code,
    description,
    discountType,
    discountValueStr,
    maxUsesStr,
    validFromStr,
    validUntilStr,
    isActive,
  };
}

function validateCouponData(data: ReturnType<typeof parseCouponForm>) {
  const errors: Record<string, string> = {};

  if (!data.code) errors.code = 'Required';
  else if (!/^[A-Z0-9_-]{2,30}$/.test(data.code)) {
    errors.code = 'Use 2–30 chars: A-Z, 0-9, hyphen, underscore';
  }

  const discountValue = parseInt(data.discountValueStr, 10);
  if (Number.isNaN(discountValue) || discountValue <= 0) {
    errors.discountValue = 'Enter a positive number';
  } else if (data.discountType === 'PERCENT' && discountValue > 100) {
    errors.discountValue = 'Percent max 100';
  } else if (data.discountType === 'FLAT' && discountValue > 100000) {
    errors.discountValue = 'Flat max ₹1,00,000';
  }

  let maxUses: number | null = null;
  if (data.maxUsesStr) {
    maxUses = parseInt(data.maxUsesStr, 10);
    if (Number.isNaN(maxUses) || maxUses < 1) errors.maxUses = 'Enter a number or leave blank';
  }

  let validFrom: Date | null = null;
  if (data.validFromStr) {
    validFrom = new Date(data.validFromStr);
    if (Number.isNaN(validFrom.getTime())) errors.validFrom = 'Invalid date';
  }

  let validUntil: Date | null = null;
  if (data.validUntilStr) {
    validUntil = new Date(data.validUntilStr);
    if (Number.isNaN(validUntil.getTime())) errors.validUntil = 'Invalid date';
  }

  if (validFrom && validUntil && validUntil.getTime() <= validFrom.getTime()) {
    errors.validUntil = 'Must be after Valid From';
  }

  return {
    errors,
    parsed: {
      discountValue,
      maxUses,
      validFrom,
      validUntil,
    },
  };
}

export async function createCoupon(
  _prev: CouponActionState,
  formData: FormData
): Promise<CouponActionState> {
  await requireAdmin();
  const data = parseCouponForm(formData);
  const { errors, parsed } = validateCouponData(data);
  if (Object.keys(errors).length > 0) return { errors };

  // Uniqueness check
  const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
  if (existing) return { errors: { code: 'This code already exists' } };

  try {
    await prisma.coupon.create({
      data: {
        code: data.code,
        description: data.description || null,
        discountPct: data.discountType === 'PERCENT' ? parsed.discountValue : null,
        discountAmount: data.discountType === 'FLAT' ? parsed.discountValue * 100 : null, // store in paise
        maxUses: parsed.maxUses,
        validFrom: parsed.validFrom,
        validUntil: parsed.validUntil,
        isActive: data.isActive,
      },
    });
  } catch (err) {
    console.error('Coupon create failed:', err);
    return { errors: { _form: 'Could not create coupon' } };
  }

  revalidatePath('/admin/coupons');
  redirect('/admin/coupons');
}

export async function updateCoupon(
  _prev: CouponActionState,
  formData: FormData
): Promise<CouponActionState> {
  await requireAdmin();
  const couponId = String(formData.get('couponId') ?? '').trim();
  if (!couponId) return { errors: { _form: 'Missing couponId' } };

  const data = parseCouponForm(formData);
  const { errors, parsed } = validateCouponData(data);
  if (Object.keys(errors).length > 0) return { errors };

  const existing = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!existing) return { errors: { _form: 'Coupon not found' } };

  // If code changed, check uniqueness
  if (existing.code !== data.code) {
    const conflict = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (conflict) return { errors: { code: 'Another coupon already uses this code' } };
  }

  try {
    await prisma.coupon.update({
      where: { id: couponId },
      data: {
        code: data.code,
        description: data.description || null,
        discountPct: data.discountType === 'PERCENT' ? parsed.discountValue : null,
        discountAmount: data.discountType === 'FLAT' ? parsed.discountValue * 100 : null,
        maxUses: parsed.maxUses,
        validFrom: parsed.validFrom,
        validUntil: parsed.validUntil,
        isActive: data.isActive,
      },
    });
  } catch (err) {
    console.error('Coupon update failed:', err);
    return { errors: { _form: 'Could not update coupon' } };
  }

  revalidatePath('/admin/coupons');
  revalidatePath(`/admin/coupons/${couponId}/edit`);
  return { success: true, message: 'Saved' };
}

export async function deleteCoupon(
  _prev: CouponActionState,
  formData: FormData
): Promise<CouponActionState> {
  await requireAdmin();
  const couponId = String(formData.get('couponId') ?? '').trim();
  if (!couponId) return { errors: { _form: 'Missing couponId' } };

  // Check usage — don't allow delete if orders reference it
  const orderCount = await prisma.order.count({ where: { couponId } });
  if (orderCount > 0) {
    return {
      errors: {
        _form: `${orderCount} order(s) used this coupon. Set inactive instead of deleting.`,
      },
    };
  }

  try {
    await prisma.coupon.delete({ where: { id: couponId } });
  } catch (err) {
    console.error('Coupon delete failed:', err);
    return { errors: { _form: 'Could not delete' } };
  }

  revalidatePath('/admin/coupons');
  redirect('/admin/coupons');
}

export async function toggleCouponActive(
  _prev: CouponActionState,
  formData: FormData
): Promise<CouponActionState> {
  await requireAdmin();
  const couponId = String(formData.get('couponId') ?? '').trim();
  if (!couponId) return { errors: { _form: 'Missing couponId' } };

  const existing = await prisma.coupon.findUnique({ where: { id: couponId } });
  if (!existing) return { errors: { _form: 'Not found' } };

  await prisma.coupon.update({
    where: { id: couponId },
    data: { isActive: !existing.isActive },
  });

  revalidatePath('/admin/coupons');
  return { success: true, message: existing.isActive ? 'Deactivated' : 'Activated' };
}
