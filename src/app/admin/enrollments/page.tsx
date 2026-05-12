import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';
import { formatRelativeTime } from '@/lib/utils';
import { AdminPageHeader, EmptyState } from '@/components/admin/ui';
import type { Prisma } from '@prisma/client';

export const metadata = { title: 'Enrollments — Admin' };

interface PageProps {
  searchParams: Promise<{ q?: string; courseId?: string }>;
}

export default async function AdminEnrollmentsPage({ searchParams }: PageProps) {
  const me = await requireInstructorOrAdmin();
  const params = await searchParams;
  const query = (params.q || '').trim();
  const courseId = (params.courseId || '').trim();

  const where: Prisma.EnrollmentWhereInput = {};
  if (me.role === 'INSTRUCTOR') where.course = { instructorId: me.id };
  if (courseId) where.courseId = courseId;
  if (query) {
    where.user = {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    };
  }

  const [enrollments, courses] = await Promise.all([
    prisma.enrollment.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { title: true, slug: true } },
      },
      orderBy: { enrolledAt: 'desc' },
      take: 100,
    }),
    prisma.course.findMany({
      where: me.role === 'INSTRUCTOR' ? { instructorId: me.id } : {},
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Enrollments"
        title="All enrollments"
        subtitle={`${enrollments.length} ${
          enrollments.length === 1 ? 'enrollment' : 'enrollments'
        } shown${enrollments.length === 100 ? ' (max 100 — refine filters)' : ''}`}
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 px-6 py-8 lg:px-8">
        <form className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/15 bg-bg p-4">
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search students by name or email..."
            className="min-w-64 flex-1 rounded-full border border-ink/15 bg-bg px-4 py-2 text-sm focus:border-ink focus:outline-none"
          />
          <select
            name="courseId"
            defaultValue={courseId}
            className="rounded-full border border-ink/15 bg-bg px-4 py-2 text-sm"
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full bg-ink px-5 py-2 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent"
          >
            Filter
          </button>
          <Link
            href="/admin/enrollments"
            className="font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-ink"
          >
            Reset
          </Link>
        </form>

        {enrollments.length === 0 ? (
          <EmptyState title="No enrollments match" body="Try clearing filters or check back later." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink/15 bg-bg">
            {enrollments.map((e, i) => (
              <div
                key={e.id}
                className={`grid grid-cols-1 gap-3 px-6 py-4 md:grid-cols-12 md:items-center ${
                  i < enrollments.length - 1 ? 'border-b border-ink/5' : ''
                }`}
              >
                <div className="md:col-span-4 min-w-0">
                  <Link
                    href={`/admin/users/${e.user.id}`}
                    className="block truncate font-medium text-ink hover:text-accent"
                  >
                    {e.user.name || e.user.email}
                  </Link>
                  <div className="mt-0.5 truncate font-mono text-xs text-ink-subtle">{e.user.email}</div>
                </div>
                <div className="md:col-span-4 min-w-0">
                  <Link
                    href={`/courses/${e.course.slug}`}
                    className="block truncate text-ink hover:text-accent"
                  >
                    {e.course.title}
                  </Link>
                </div>
                <div className="md:col-span-2 font-mono text-xs">
                  <div className="text-ink">{e.progressPct}%</div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-bg-alt">
                    <div className="h-full bg-accent" style={{ width: `${e.progressPct}%` }} />
                  </div>
                </div>
                <div className="md:col-span-2 font-mono text-xs text-ink-subtle md:text-right">
                  {formatRelativeTime(e.enrolledAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
