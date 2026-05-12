import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { AdminPageHeader, StatusBadge, EmptyState } from '@/components/admin/ui';
import type { Prisma } from '@prisma/client';

export const metadata = { title: 'Orders — Admin' };

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const me = await requireInstructorOrAdmin();
  const params = await searchParams;
  const statusFilter = (params.status || '').toUpperCase();

  const where: Prisma.OrderWhereInput = {};
  if (me.role === 'INSTRUCTOR') where.course = { instructorId: me.id };
  if (['PAID', 'PENDING', 'FAILED', 'REFUNDED'].includes(statusFilter)) {
    where.status = statusFilter as 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  }

  const [orders, paidAgg] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    }),
    prisma.order.aggregate({
      where: { ...where, status: 'PAID' },
      _sum: { finalInPaise: true },
      _count: true,
    }),
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Orders"
        title="All orders"
        subtitle={`${paidAgg._count} paid · ${formatPrice(paidAgg._sum.finalInPaise || 0, {
          showZero: true,
        })} collected${statusFilter ? ` · filtered: ${statusFilter}` : ''}`}
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 px-6 py-8 lg:px-8">
        <div className="flex flex-wrap gap-2">
          <FilterPill href="/admin/orders" active={!statusFilter}>All</FilterPill>
          <FilterPill href="/admin/orders?status=PAID" active={statusFilter === 'PAID'}>Paid</FilterPill>
          <FilterPill href="/admin/orders?status=PENDING" active={statusFilter === 'PENDING'}>Pending</FilterPill>
          <FilterPill href="/admin/orders?status=FAILED" active={statusFilter === 'FAILED'}>Failed</FilterPill>
          <FilterPill href="/admin/orders?status=REFUNDED" active={statusFilter === 'REFUNDED'}>Refunded</FilterPill>
        </div>

        {orders.length === 0 ? (
          <EmptyState title="No orders match" body="Try a different status filter." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink/15 bg-bg">
            {orders.map((o, i) => (
              <div
                key={o.id}
                className={`grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-12 md:items-center ${
                  i < orders.length - 1 ? 'border-b border-ink/5' : ''
                }`}
              >
                <div className="md:col-span-3 min-w-0">
                  <Link
                    href={`/admin/users/${o.user.id}`}
                    className="block truncate font-medium text-ink hover:text-accent"
                  >
                    {o.user.name || o.user.email}
                  </Link>
                  <div className="mt-0.5 truncate font-mono text-xs text-ink-subtle">{o.user.email}</div>
                </div>
                <div className="md:col-span-4 min-w-0 truncate text-ink">
                  {o.course.title}
                </div>
                <div className="md:col-span-2 font-mono text-xs text-ink-subtle truncate">
                  {o.razorpayOrderId}
                </div>
                <div className="md:col-span-1 font-display font-semibold">
                  {formatPrice(o.finalInPaise)}
                </div>
                <div className="md:col-span-1">
                  <StatusBadge
                    status={o.status.toLowerCase()}
                    variant={
                      o.status === 'PAID'
                        ? 'success'
                        : o.status === 'FAILED'
                        ? 'danger'
                        : 'neutral'
                    }
                  />
                </div>
                <div className="md:col-span-1 font-mono text-xs text-ink-subtle md:text-right">
                  {formatRelativeTime(o.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
        active
          ? 'bg-ink text-bg'
          : 'border border-ink/15 text-ink-muted hover:border-ink hover:text-ink'
      }`}
    >
      {children}
    </Link>
  );
}
