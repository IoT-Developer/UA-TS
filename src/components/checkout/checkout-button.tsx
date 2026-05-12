'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';

interface CheckoutButtonProps {
  courseId: string;
  priceInPaise: number;
  isAuthenticated: boolean;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Razorpay's checkout.js exposes a global Razorpay constructor
declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutButton({ courseId, priceInPaise, isAuthenticated }: CheckoutButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponPreview, setCouponPreview] = useState<{
    discount: number;
    final: number;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponChecking, setCouponChecking] = useState(false);
  const scriptLoadedRef = useRef(false);

  async function loadRazorpayScript(): Promise<boolean> {
    if (scriptLoadedRef.current && window.Razorpay) return true;
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        scriptLoadedRef.current = true;
        resolve(true);
      };
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  async function checkCoupon() {
    if (!couponCode.trim()) {
      setCouponPreview(null);
      setCouponError(null);
      return;
    }
    setCouponChecking(true);
    setCouponError(null);
    try {
      const res = await fetch('/api/checkout/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, code: couponCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.valid) {
        setCouponPreview(null);
        setCouponError(data.error || 'Invalid code');
        return;
      }
      setCouponPreview({ discount: data.discountInPaise, final: data.finalInPaise });
      setCouponError(null);
    } catch {
      setCouponError('Could not check code. Try again.');
    } finally {
      setCouponChecking(false);
    }
  }

  async function handleCheckout() {
    if (!isAuthenticated) {
      router.push(`/sign-in?redirect=/courses`);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // 1. Ask server to create the Razorpay order
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, couponCode: couponCode.trim() || undefined }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.redirect) {
          router.push(data.redirect);
          return;
        }
        setError(data.error || 'Could not start checkout. Try again.');
        return;
      }

      // 2. Free enrollment — server already enrolled, just redirect
      if (data.free) {
        router.push(data.redirect);
        return;
      }

      // 3. Load Razorpay script
      const ok = await loadRazorpayScript();
      if (!ok || !window.Razorpay) {
        setError('Could not load payment gateway. Check your connection and try again.');
        return;
      }

      // 4. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amountInPaise,
        currency: data.currency,
        order_id: data.razorpayOrderId,
        name: 'Unified Automation',
        description: data.courseTitle,
        prefill: data.prefill,
        theme: { color: '#FF5A1F' },
        handler: async (response: RazorpayResponse) => {
          // 5. Verify the payment server-side
          try {
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(response),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              router.push(verifyData.redirect);
            } else {
              setError(verifyData.error || 'Payment verification failed. Contact support.');
            }
          } catch {
            setError('Could not verify payment. Check your email — if money was deducted, we will reconcile.');
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });

      rzp.open();
    } catch (err) {
      console.error('Checkout error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const displayPrice = couponPreview?.final ?? priceInPaise;

  return (
    <div className="space-y-4">
      {/* Coupon input */}
      <div>
        <label htmlFor="coupon" className="mb-2 block font-mono text-xs uppercase tracking-widest text-ink-muted">
          Have a coupon?
        </label>
        <div className="flex gap-2">
          <input
            id="coupon"
            type="text"
            value={couponCode}
            onChange={(e) => {
              setCouponCode(e.target.value.toUpperCase());
              setCouponPreview(null);
              setCouponError(null);
            }}
            placeholder="STUDENT100"
            autoComplete="off"
            className="flex-1 rounded-xl border border-ink/20 bg-bg px-3 py-2.5 font-mono text-sm uppercase tracking-wider placeholder:text-ink-subtle focus:border-ink focus:outline-none"
            maxLength={30}
          />
          <button
            type="button"
            onClick={checkCoupon}
            disabled={couponChecking || !couponCode.trim()}
            className="rounded-xl border border-ink/20 px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-ink-muted transition hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {couponChecking ? '…' : 'Apply'}
          </button>
        </div>
        {couponError && (
          <p className="mt-2 font-mono text-xs text-red-600">→ {couponError}</p>
        )}
        {couponPreview && (
          <p className="mt-2 font-mono text-xs text-accent">
            ✓ {formatPrice(couponPreview.discount)} off applied
          </p>
        )}
      </div>

      {/* Price summary */}
      <div className="rounded-xl border border-ink/10 bg-bg-alt/50 p-4">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">Total</span>
          <div className="flex items-baseline gap-2">
            {couponPreview && (
              <span className="text-sm text-ink-subtle line-through">
                {formatPrice(priceInPaise)}
              </span>
            )}
            <span className="font-display text-2xl font-semibold tracking-tight">
              {formatPrice(displayPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Main button */}
      <button
        type="button"
        onClick={handleCheckout}
        disabled={loading}
        className="w-full rounded-full bg-ink px-6 py-4 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Loading payment…' : isAuthenticated ? 'Enroll now →' : 'Sign in to enroll →'}
      </button>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 font-mono text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Trust signal */}
      <div className="flex items-center justify-center gap-2 font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
        <span>🔒</span>
        <span>Secured by Razorpay · UPI, Cards, Netbanking</span>
      </div>
    </div>
  );
}
