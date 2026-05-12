'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  createCoupon,
  updateCoupon,
  deleteCoupon,
  type CouponActionState,
} from './actions';

interface ExistingCoupon {
  id: string;
  code: string;
  description: string | null;
  discountPct: number | null;
  discountAmount: number | null; // paise
  maxUses: number | null;
  usedCount: number;
  validFrom: Date | null;
  validUntil: Date | null;
  isActive: boolean;
}

function toDateInput(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function CouponForm({
  mode,
  coupon,
}: {
  mode: 'create' | 'edit';
  coupon?: ExistingCoupon;
}) {
  const action = mode === 'create' ? createCoupon : updateCoupon;
  const [state, formAction] = useActionState<CouponActionState, FormData>(action, {});
  const [deleteState, deleteFormAction] = useActionState<CouponActionState, FormData>(
    deleteCoupon,
    {}
  );

  // Discount type state for conditional label
  const initialType = coupon
    ? coupon.discountPct != null
      ? 'PERCENT'
      : 'FLAT'
    : 'PERCENT';
  const [discountType, setDiscountType] = useState<'PERCENT' | 'FLAT'>(initialType);

  const initialDiscountValue = coupon
    ? coupon.discountPct != null
      ? String(coupon.discountPct)
      : coupon.discountAmount != null
      ? String(coupon.discountAmount / 100)
      : ''
    : '';

  const errors = state.errors || {};

  return (
    <div className="space-y-6">
      <form
        action={formAction}
        className="space-y-6 rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8"
        noValidate
      >
        {coupon && <input type="hidden" name="couponId" value={coupon.id} />}

        {errors._form && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-3 font-mono text-xs text-red-700">
            {errors._form}
          </div>
        )}
        {state.success && (
          <div className="rounded-xl border-2 border-accent bg-accent/5 p-3 font-mono text-xs uppercase tracking-widest text-accent">
            ✓ {state.message}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-3">
          <Field label="Code" name="code" error={errors.code} hint="Uppercase letters, numbers, hyphens — what students will type at checkout">
            <input
              type="text"
              name="code"
              required
              maxLength={30}
              defaultValue={coupon?.code || ''}
              placeholder="LAUNCH50"
              autoComplete="off"
              className={inputCls(!!errors.code) + ' uppercase font-mono'}
            />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Description (admin-only)" name="description">
              <input
                type="text"
                name="description"
                maxLength={200}
                defaultValue={coupon?.description || ''}
                placeholder="e.g. Launch week — 50% off any track"
                className={inputCls(false)}
              />
            </Field>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Discount type" name="discountType">
            <div className="flex gap-3">
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-bg-alt/40 px-4 py-3">
                <input
                  type="radio"
                  name="discountType"
                  value="PERCENT"
                  checked={discountType === 'PERCENT'}
                  onChange={() => setDiscountType('PERCENT')}
                />
                <span className="text-sm">Percent (%)</span>
              </label>
              <label className="flex flex-1 cursor-pointer items-center gap-3 rounded-xl border border-ink/15 bg-bg-alt/40 px-4 py-3">
                <input
                  type="radio"
                  name="discountType"
                  value="FLAT"
                  checked={discountType === 'FLAT'}
                  onChange={() => setDiscountType('FLAT')}
                />
                <span className="text-sm">Flat amount (₹)</span>
              </label>
            </div>
          </Field>

          <Field
            label={discountType === 'PERCENT' ? 'Discount %' : 'Discount amount (₹)'}
            name="discountValue"
            error={errors.discountValue}
          >
            <input
              type="number"
              name="discountValue"
              required
              min={1}
              max={discountType === 'PERCENT' ? 100 : 100000}
              defaultValue={initialDiscountValue}
              placeholder={discountType === 'PERCENT' ? '50' : '500'}
              className={inputCls(!!errors.discountValue)}
            />
          </Field>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <Field
            label="Max uses (optional)"
            name="maxUses"
            error={errors.maxUses}
            hint="Leave empty for unlimited"
          >
            <input
              type="number"
              name="maxUses"
              min={1}
              defaultValue={coupon?.maxUses != null ? String(coupon.maxUses) : ''}
              placeholder="Unlimited"
              className={inputCls(!!errors.maxUses)}
            />
          </Field>
          <Field
            label="Valid from (optional)"
            name="validFrom"
            error={errors.validFrom}
            hint="Leave empty for immediate"
          >
            <input
              type="date"
              name="validFrom"
              defaultValue={coupon ? toDateInput(coupon.validFrom) : ''}
              className={inputCls(!!errors.validFrom)}
            />
          </Field>
          <Field
            label="Valid until (optional)"
            name="validUntil"
            error={errors.validUntil}
            hint="Leave empty for never"
          >
            <input
              type="date"
              name="validUntil"
              defaultValue={coupon ? toDateInput(coupon.validUntil) : ''}
              className={inputCls(!!errors.validUntil)}
            />
          </Field>
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/15 bg-bg-alt/40 p-4">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={coupon?.isActive ?? true}
            className="mt-1"
          />
          <span className="text-sm">
            <span className="block font-medium text-ink">Active</span>
            <span className="mt-1 block text-ink-muted">
              When inactive, this coupon won't work at checkout regardless of date.
              Use this as a kill switch.
            </span>
          </span>
        </label>

        {coupon && coupon.usedCount > 0 && (
          <div className="rounded-xl border border-ink/15 bg-bg-alt/40 p-4 font-mono text-xs text-ink-muted">
            ⓘ This coupon has been used <strong>{coupon.usedCount}</strong> time(s). Changing it
            won't affect past orders.
          </div>
        )}

        <footer className="flex items-center justify-between border-t border-ink/10 pt-6">
          {mode === 'edit' && coupon ? (
            <form action={deleteFormAction}>
              <input type="hidden" name="couponId" value={coupon.id} />
              <DeleteButton />
            </form>
          ) : (
            <span />
          )}
          <SaveButton mode={mode} />
        </footer>

        {deleteState.errors?._form && (
          <p className="font-mono text-xs text-red-600">{deleteState.errors._form}</p>
        )}
      </form>
    </div>
  );
}

function SaveButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent disabled:opacity-50"
    >
      {pending ? 'Saving…' : mode === 'create' ? 'Create coupon →' : 'Save changes'}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm('Delete this coupon? Past orders that used it will not be affected.')) {
          e.preventDefault();
        }
      }}
      className="rounded-full border border-red-300 bg-red-50 px-4 py-2 font-mono text-xs uppercase tracking-widest text-red-700 hover:bg-red-600 hover:text-bg disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete coupon'}
    </button>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block font-mono text-xs uppercase tracking-widest text-ink-muted">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 font-mono text-xs text-red-600">→ {error}</p>}
      {hint && !error && <p className="mt-1 text-xs text-ink-subtle">{hint}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border bg-bg px-4 py-2.5 text-sm placeholder:text-ink-subtle focus:outline-none ${
    hasError ? 'border-red-500 focus:border-red-600' : 'border-ink/20 focus:border-ink'
  }`;
}
