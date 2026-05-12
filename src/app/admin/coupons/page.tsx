import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { formatPrice } from '@/lib/utils';
import {
  AdminPageHeader,
  StatusBadge,
  PrimaryButton,
  EmptyState,
} from '@/components/admin/ui';

export const metadata = { title: 'Coupons — Admin' };

export default async function AdminCouponsPage() {
  await requireAdmin();
  const coupons = await prisma.coupon.findMany({
    orderBy: [{ isActive: 'desc' }, { code: 'asc' }],
  });

  const now = new Date();

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Coupons"
        title="Discount coupons"
        subtitle={`${coupons.length} ${coupons.length === 1 ? 'coupon' : 'coupons'} configured · students enter at checkout`}
        action={<PrimaryButton href="/admin/coupons/new">+ New coupon</PrimaryButton>}
      />
      <div className="mx-auto max-w-screen-2xl space-y-6 px-6 py-8 lg:px-8">
        {coupons.length === 0 ? (
          <EmptyState
            title="No coupons yet"
            body="Create your first coupon to run promotions, partner discounts, or student offers."
            cta={{ href: '/admin/coupons/new', label: 'Create your first coupon' }}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink/15 bg-bg">
            <div className="hidden border-b border-ink/10 px-6 py-3 font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle md:grid md:grid-cols-12">
              <div className="col-span-3">Code</div>
              <div className="col-span-2">Discount</div>
              <div className="col-span-2">Used</div>
              <div className="col-span-3">Validity</div>
              <div className="col-span-2 text-right">Status</div>
            </div>
            {coupons.map((c, i) => {
              const expired = c.validUntil ? c.validUntil.getTime() < now.getTime() : false;
              const notStarted = c.validFrom ? c.validFrom.getTime() > now.getTime() : false;
              const exhausted = c.maxUses != null && c.usedCount >= c.maxUses;
              const effectivelyActive = c.isActive && !expired && !notStarted && !exhausted;

              return (
                <Link
                  key={c.id}
                  href={`/admin/coupons/${c.id}/edit`}
                  className={`grid grid-cols-1 gap-3 px-6 py-4 transition hover:bg-bg-alt md:grid-cols-12 md:items-center ${
                    i < coupons.length - 1 ? 'border-b border-ink/5' : ''
                  }`}
                >
                  <div className="md:col-span-3 min-w-0">
                    <div className="font-mono text-sm font-medium uppercase tracking-wider text-ink">
                      {c.code}
                    </div>
                    {c.description && (
                      <div className="mt-0.5 truncate text-xs text-ink-subtle">{c.description}</div>
                    )}
                  </div>
                  <div className="md:col-span-2 font-mono text-sm">
                    {c.discountPct != null
                      ? `${c.discountPct}% off`
                      : c.discountAmount != null
                      ? `${formatPrice(c.discountAmount)} off`
                      : '—'}
                  </div>
                  <div className="md:col-span-2 font-mono text-xs text-ink-muted">
                    {c.usedCount} {c.maxUses != null ? `/ ${c.maxUses}` : '(unlimited)'}
                  </div>
                  <div className="md:col-span-3 font-mono text-xs text-ink-muted">
                    {c.validFrom && (
                      <div>
                        From: {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(c.validFrom)}
                      </div>
                    )}
                    {c.validUntil && (
                      <div>
                        Until: {new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(c.validUntil)}
                      </div>
                    )}
                    {!c.validFrom && !c.validUntil && <span>Always valid</span>}
                  </div>
                  <div className="md:col-span-2 md:text-right">
                    {effectivelyActive ? (
                      <StatusBadge status="active" variant="success" />
                    ) : expired ? (
                      <StatusBadge status="expired" variant="danger" />
                    ) : notStarted ? (
                      <StatusBadge status="scheduled" variant="warning" />
                    ) : exhausted ? (
                      <StatusBadge status="redeemed" variant="neutral" />
                    ) : (
                      <StatusBadge status="inactive" variant="neutral" />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
