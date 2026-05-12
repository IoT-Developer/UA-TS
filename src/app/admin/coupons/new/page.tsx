import { requireAdmin } from '@/lib/admin';
import { AdminPageHeader } from '@/components/admin/ui';
import { CouponForm } from '../coupon-form';

export const metadata = { title: 'New Coupon — Admin' };

export default async function NewCouponPage() {
  await requireAdmin();
  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Coupons / New"
        title="Create coupon"
        subtitle="Configure discount, validity window, and usage cap."
      />
      <div className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
        <CouponForm mode="create" />
      </div>
    </>
  );
}
