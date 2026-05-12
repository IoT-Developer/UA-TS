import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { AdminPageHeader } from '@/components/admin/ui';
import { CouponForm } from '../../coupon-form';

export const metadata = { title: 'Edit Coupon — Admin' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Coupons / Edit"
        title={coupon.code}
        subtitle={coupon.description || 'Edit discount coupon'}
      />
      <div className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
        <CouponForm mode="edit" coupon={coupon} />
      </div>
    </>
  );
}
