import { prisma } from '@/lib/prisma';
import type { Coupon } from '@prisma/client';

export interface CouponResult {
  valid: boolean;
  coupon?: Coupon;
  discountInPaise: number;
  error?: string;
}

/**
 * Validate a coupon code against a course price. Returns the discount amount
 * (in paise) if valid. Pure function — does NOT mutate usedCount; that happens
 * only after successful payment.
 */
export async function validateCoupon(
  code: string,
  amountInPaise: number
): Promise<CouponResult> {
  if (!code?.trim()) return { valid: false, discountInPaise: 0, error: 'Enter a code' };

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon) return { valid: false, discountInPaise: 0, error: 'Invalid code' };
  if (!coupon.isActive) return { valid: false, discountInPaise: 0, error: 'Code expired' };

  const now = new Date();
  if (coupon.validFrom && now < coupon.validFrom) {
    return { valid: false, discountInPaise: 0, error: 'Code not yet active' };
  }
  if (coupon.validUntil && now > coupon.validUntil) {
    return { valid: false, discountInPaise: 0, error: 'Code expired' };
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    return { valid: false, discountInPaise: 0, error: 'Code fully redeemed' };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.discountPct != null) {
    discount = Math.round((amountInPaise * coupon.discountPct) / 100);
  } else if (coupon.discountAmount != null) {
    discount = coupon.discountAmount;
  }

  // Don't allow discount to exceed the price
  discount = Math.min(discount, amountInPaise);

  return { valid: true, coupon, discountInPaise: discount };
}
