import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatRelativeTime } from '@/lib/utils';
import { requireInstructorOrAdmin } from '@/lib/admin';
import { AdminPageHeader, MetricCard, StatusBadge } from '@/components/admin/ui';

export default async function AdminOverviewPage() {
  const me = await requireInstructorOrAdmin();
  const isAdminUser = me.role === 'ADMIN';

  // Restrict instructor view to their own courses
  const courseFilter = isAdminUser ? {} : { instructorId: me.id };

  // Parallel data fetch
  const [
    userCount,
    studentCount,
    courseCount,
    publishedCourseCount,
    enrollmentCount,
    revenueAgg,
    recentSignups,
    recentOrders,
  ] = await Promise.all([
    isAdminUser ? prisma.user.count({ where: { deletedAt: null } }) : Promise.resolve(0),
    isAdminUser
      ? prisma.user.count({ where: { deletedAt: null, role: 'STUDENT' } })
      : Promise.resolve(0),
    prisma.course.count({ where: courseFilter }),
    prisma.course.count({ where: { ...courseFilter, status: 'PUBLISHED' } }),
    prisma.enrollment.count({
      where: { course: courseFilter },
    }),
    prisma.order.aggregate({
      where: { status: 'PAID', course: courseFilter },
      _sum: { finalInPaise: true },
    }),
    isAdminUser
      ? prisma.user.findMany({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, name: true, email: true, role: true, createdAt: true },
        })
      : Promise.resolve([]),
    prisma.order.findMany({
      where: { status: 'PAID', course: courseFilter },
      include: {
        user: { select: { name: true, email: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const totalRevenuePaise = revenueAgg._sum.finalInPaise || 0;

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin"
        title={isAdminUser ? 'Overview' : 'Instructor overview'}
        subtitle={
          isAdminUser
            ? 'Platform-wide metrics, signups, and revenue.'
            : 'Your published courses and their enrollments.'
        }
      />
      <div className="mx-auto max-w-screen-2xl space-y-10 px-6 py-10 lg:px-8">
        {/* Metrics */}
        <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {isAdminUser && (
            <>
              <MetricCard label="Total users" value={userCount} href="/admin/users" />
              <MetricCard
                label="Students"
                value={studentCount}
                href="/admin/users?role=STUDENT"
              />
            </>
          )}
          <MetricCard
            label="Courses"
            value={`${publishedCourseCount} / ${courseCount}`}
            delta="published / total"
            href="/admin/courses"
          />
          <MetricCard
            label="Enrollments"
            value={enrollmentCount}
            href="/admin/enrollments"
          />
          <MetricCard
            label="Revenue"
            value={formatPrice(totalRevenuePaise, { showZero: true })}
            delta="lifetime, paid orders"
            href="/admin/orders"
          />
        </div>

        {/* Two-column recent activity */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent signups (admin only) */}
          {isAdminUser && (
            <div className="rounded-2xl border border-ink/15 bg-bg">
              <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
                <h2 className="font-display text-lg font-semibold tracking-tight">
                  Recent signups
                </h2>
                <Link
                  href="/admin/users"
                  className="font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-ink"
                >
                  View all →
                </Link>
              </div>
              {recentSignups.length === 0 ? (
                <div className="p-6 text-sm text-ink-muted">No signups yet.</div>
              ) : (
                <ul>
                  {recentSignups.map((u, i) => (
                    <li
                      key={u.id}
                      className={`flex items-center justify-between px-6 py-4 ${
                        i < recentSignups.length - 1 ? 'border-b border-ink/5' : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/admin/users/${u.id}`}
                          className="block truncate font-medium text-ink hover:text-accent"
                        >
                          {u.name || u.email}
                        </Link>
                        <div className="mt-0.5 truncate font-mono text-xs text-ink-subtle">
                          {u.email}
                        </div>
                      </div>
                      <div className="ml-4 flex shrink-0 items-center gap-3">
                        <StatusBadge
                          status={u.role.toLowerCase()}
                          variant={u.role === 'ADMIN' ? 'accent' : 'neutral'}
                        />
                        <span className="font-mono text-xs text-ink-subtle">
                          {formatRelativeTime(u.createdAt)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Recent orders */}
          <div
            className={`rounded-2xl border border-ink/15 bg-bg ${
              !isAdminUser ? 'lg:col-span-2' : ''
            }`}
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <h2 className="font-display text-lg font-semibold tracking-tight">
                Recent orders
              </h2>
              <Link
                href="/admin/orders"
                className="font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-ink"
              >
                View all →
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="p-6 text-sm text-ink-muted">No paid orders yet.</div>
            ) : (
              <ul>
                {recentOrders.map((o, i) => (
                  <li
                    key={o.id}
                    className={`flex items-center justify-between px-6 py-4 ${
                      i < recentOrders.length - 1 ? 'border-b border-ink/5' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="truncate font-medium text-ink">
                        {o.user.name || o.user.email}
                      </div>
                      <div className="mt-0.5 truncate font-mono text-xs text-ink-subtle">
                        {o.course.title}
                      </div>
                    </div>
                    <div className="ml-4 flex shrink-0 items-center gap-3">
                      <span className="font-display text-sm font-semibold">
                        {formatPrice(o.finalInPaise)}
                      </span>
                      <span className="font-mono text-xs text-ink-subtle">
                        {formatRelativeTime(o.createdAt)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
