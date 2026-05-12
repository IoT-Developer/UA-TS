import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';
import { formatPrice, formatDuration, formatRelativeTime } from '@/lib/utils';
import { AdminPageHeader, StatusBadge, PrimaryButton, EmptyState } from '@/components/admin/ui';
import type { Prisma } from '@prisma/client';

export const metadata = { title: 'Courses — Admin' };

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminCoursesPage({ searchParams }: PageProps) {
  const me = await requireInstructorOrAdmin();
  const params = await searchParams;
  const statusFilter = (params.status || '').toUpperCase();

  const where: Prisma.CourseWhereInput = {};
  // Instructors only see their own
  if (me.role === 'INSTRUCTOR') where.instructorId = me.id;
  if (['DRAFT', 'PUBLISHED', 'ARCHIVED'].includes(statusFilter)) {
    where.status = statusFilter as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      category: { select: { name: true } },
      instructor: { select: { name: true, email: true } },
      _count: { select: { enrollments: true, modules: true } },
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Courses"
        title="Courses"
        subtitle={
          me.role === 'INSTRUCTOR'
            ? `Your ${courses.length} ${courses.length === 1 ? 'course' : 'courses'}`
            : `${courses.length} ${courses.length === 1 ? 'course' : 'courses'} across the platform`
        }
        action={<PrimaryButton href="/admin/courses/new">+ New course</PrimaryButton>}
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 px-6 py-8 lg:px-8">
        {/* Filter pills */}
        <div className="flex flex-wrap gap-2">
          <FilterPill href="/admin/courses" active={!statusFilter}>
            All
          </FilterPill>
          <FilterPill href="/admin/courses?status=DRAFT" active={statusFilter === 'DRAFT'}>
            Drafts
          </FilterPill>
          <FilterPill href="/admin/courses?status=PUBLISHED" active={statusFilter === 'PUBLISHED'}>
            Published
          </FilterPill>
          <FilterPill href="/admin/courses?status=ARCHIVED" active={statusFilter === 'ARCHIVED'}>
            Archived
          </FilterPill>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            title="No courses here yet"
            body="Click + New course to create your first one. You can fully edit it before publishing."
            cta={{ href: '/admin/courses/new', label: 'Create your first course' }}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink/15 bg-bg">
            {courses.map((c, i) => (
              <Link
                key={c.id}
                href={`/admin/courses/${c.id}/edit`}
                className={`grid grid-cols-1 gap-4 px-6 py-5 transition hover:bg-bg-alt md:grid-cols-12 md:items-center ${
                  i < courses.length - 1 ? 'border-b border-ink/5' : ''
                }`}
              >
                <div className="md:col-span-5 min-w-0">
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={c.status.toLowerCase()}
                      variant={
                        c.status === 'PUBLISHED' ? 'success' : c.status === 'DRAFT' ? 'warning' : 'neutral'
                      }
                    />
                    <span className="truncate font-medium text-ink">{c.title}</span>
                  </div>
                  <div className="mt-1 truncate font-mono text-xs text-ink-subtle">
                    {c.category.name}
                    {me.role === 'ADMIN' && (
                      <>
                        {' · '}
                        {c.instructor.name || c.instructor.email}
                      </>
                    )}
                  </div>
                </div>
                <div className="md:col-span-2 font-mono text-xs text-ink-muted">
                  {c._count.modules} mods · {c.lessonCount} lessons
                </div>
                <div className="md:col-span-1 font-mono text-xs text-ink-muted">
                  {formatDuration(c.durationMinutes)}
                </div>
                <div className="md:col-span-1 font-mono text-xs text-ink-muted md:text-right">
                  {c._count.enrollments} enrolls
                </div>
                <div className="md:col-span-2 font-display text-sm font-semibold md:text-right">
                  {formatPrice(c.priceInPaise)}
                </div>
                <div className="md:col-span-1 font-mono text-xs text-ink-subtle md:text-right">
                  {formatRelativeTime(c.updatedAt)}
                </div>
              </Link>
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
