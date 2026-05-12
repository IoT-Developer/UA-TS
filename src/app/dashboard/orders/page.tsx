import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/marketing/navbar';
import { formatPrice } from '@/lib/utils';

export const metadata = {
  title: 'Order History — Unified Automation',
};

export default async function OrdersPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) redirect('/sign-in');

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      course: { select: { title: true, slug: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-ink/10 bg-grid">
          <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
            <div className="mb-4 flex items-center gap-2 font-mono text-xs text-ink-subtle">
              <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
              <span>/</span>
              <span>Orders</span>
            </div>
            <h1 className="font-display text-display-2 font-semibold tracking-tight">
              Order <em className="font-normal italic text-ink-muted">history</em>
            </h1>
            <p className="mt-6 max-w-xl text-base text-ink-muted">
              All your enrollments and payments. Click any order for full details and
              tax invoice.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            {orders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink/20 p-16 text-center">
                <div className="eyebrow mb-3">[ No orders yet ]</div>
                <p className="mb-6 text-ink-muted">Your first enrollment will appear here.</p>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent"
                >
                  Browse tracks →
                </Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-ink/15">
                {orders.map((order, i) => (
                  <div
                    key={order.id}
                    className={`flex flex-col gap-4 bg-bg p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6 ${
                      i < orders.length - 1 ? 'border-b border-ink/10' : ''
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/courses/${order.course.slug}`}
                        className="font-medium text-ink hover:text-accent"
                      >
                        {order.course.title}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-ink-subtle">
                        <span>
                          {new Intl.DateTimeFormat('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }).format(order.createdAt)}
                        </span>
                        <span>·</span>
                        <span className="truncate">ID: {order.razorpayOrderId}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 sm:shrink-0">
                      <div className="text-right">
                        <div className="font-display text-lg font-semibold tracking-tight">
                          {formatPrice(order.finalInPaise)}
                        </div>
                        {order.discountInPaise > 0 && (
                          <div className="font-mono text-xs text-accent">
                            −{formatPrice(order.discountInPaise)}
                          </div>
                        )}
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PAID: 'bg-accent/15 text-accent',
    PENDING: 'bg-ink/10 text-ink-muted',
    FAILED: 'bg-red-100 text-red-700',
    REFUNDED: 'bg-ink/10 text-ink-muted',
  };
  return (
    <span
      className={`rounded-full px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest ${
        styles[status] || styles.PENDING
      }`}
    >
      {status.toLowerCase()}
    </span>
  );
}
