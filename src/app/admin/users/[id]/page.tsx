import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { calculateAge, formatPrice, formatRelativeTime } from '@/lib/utils';
import { AdminPageHeader, StatusBadge } from '@/components/admin/ui';
import { UserActions } from './user-actions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminUserDetail({ params }: PageProps) {
  const me = await requireAdmin();
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: { course: { select: { title: true, slug: true } } },
        orderBy: { enrolledAt: 'desc' },
      },
      orders: {
        include: { course: { select: { title: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { enrollments: true, certificates: true } },
    },
  });

  if (!user) notFound();

  const age = calculateAge(user.dateOfBirth);
  const totalPaid = user.orders
    .filter((o) => o.status === 'PAID')
    .reduce((sum, o) => sum + o.finalInPaise, 0);

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / User"
        title={user.name || user.email}
        subtitle={
          user.deletedAt
            ? `${user.email} · Soft-deleted ${formatRelativeTime(user.deletedAt)}`
            : `${user.email} · Joined ${formatRelativeTime(user.createdAt)}`
        }
        action={
          <UserActions
            userId={user.id}
            currentRole={user.role}
            isDeleted={!!user.deletedAt}
            isSelf={user.id === me.id}
          />
        }
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 px-6 py-8 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Profile */}
          <section className="rounded-2xl border border-ink/15 bg-bg p-6">
            <h2 className="eyebrow mb-4">[ Profile ]</h2>
            <dl className="space-y-3 text-sm">
              <Row label="Email" value={user.email} mono />
              <Row label="Phone" value={user.phone ? `+91 ${user.phone}` : '—'} />
              <Row label="DOB" value={user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : '—'} />
              <Row label="Age" value={age !== null ? `${age}` : '—'} />
              <Row label="College" value={user.college || '—'} />
              <Row label="Branch" value={user.branch || '—'} />
              <Row label="Year" value={user.yearOfStudy ? String(user.yearOfStudy) : '—'} />
              <Row label="Status" value={user.academicStatus?.replace(/_/g, ' ') || '—'} />
            </dl>
          </section>

          {/* Metrics */}
          <section className="rounded-2xl border border-ink/15 bg-bg p-6">
            <h2 className="eyebrow mb-4">[ Activity ]</h2>
            <dl className="space-y-4">
              <Stat label="Role" value={user.role.toLowerCase()} />
              <Stat label="Enrollments" value={String(user._count.enrollments)} />
              <Stat label="Certificates" value={String(user._count.certificates)} />
              <Stat label="Lifetime spend" value={formatPrice(totalPaid, { showZero: true })} />
              <Stat
                label="Email prefs"
                value={`${user.emailNotifications ? 'Course ✓' : 'Course ✗'} · ${
                  user.marketingEmails ? 'Marketing ✓' : 'Marketing ✗'
                }`}
              />
            </dl>
          </section>

          {/* Enrollments */}
          <section className="rounded-2xl border border-ink/15 bg-bg p-6">
            <h2 className="eyebrow mb-4">[ Enrollments ]</h2>
            {user.enrollments.length === 0 ? (
              <p className="text-sm text-ink-muted">No enrollments yet.</p>
            ) : (
              <ul className="space-y-3">
                {user.enrollments.map((e) => (
                  <li key={e.id} className="text-sm">
                    <Link
                      href={`/courses/${e.course.slug}`}
                      className="font-medium text-ink hover:text-accent"
                    >
                      {e.course.title}
                    </Link>
                    <div className="mt-1 flex items-center gap-3 font-mono text-xs text-ink-subtle">
                      <span>{e.progressPct}%</span>
                      <span>·</span>
                      <span>{formatRelativeTime(e.enrolledAt)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {/* Orders */}
        <section className="rounded-2xl border border-ink/15 bg-bg">
          <div className="border-b border-ink/10 px-6 py-4">
            <h2 className="font-display text-lg font-semibold tracking-tight">Orders</h2>
          </div>
          {user.orders.length === 0 ? (
            <div className="p-6 text-sm text-ink-muted">No orders.</div>
          ) : (
            <ul>
              {user.orders.map((o, i) => (
                <li
                  key={o.id}
                  className={`flex items-center justify-between px-6 py-4 ${
                    i < user.orders.length - 1 ? 'border-b border-ink/5' : ''
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate text-ink">{o.course.title}</div>
                    <div className="mt-1 font-mono text-xs text-ink-subtle">
                      {o.razorpayOrderId}
                    </div>
                  </div>
                  <div className="ml-4 flex shrink-0 items-center gap-4">
                    <span className="font-display font-semibold">{formatPrice(o.finalInPaise)}</span>
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
                    <span className="font-mono text-xs text-ink-subtle">
                      {formatRelativeTime(o.createdAt)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">{label}</dt>
      <dd className={`truncate text-right ${mono ? 'font-mono' : ''} text-ink`}>{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">{label}</dt>
      <dd className="mt-1 font-medium text-ink">{value}</dd>
    </div>
  );
}
