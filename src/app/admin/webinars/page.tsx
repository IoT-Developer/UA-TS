import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';
import { formatRelativeTime } from '@/lib/utils';
import {
  AdminPageHeader,
  StatusBadge,
  PrimaryButton,
  EmptyState,
} from '@/components/admin/ui';
import type { Prisma } from '@prisma/client';

export const metadata = { title: 'Webinars — Admin' };

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminWebinarsPage({ searchParams }: PageProps) {
  const me = await requireInstructorOrAdmin();
  const params = await searchParams;
  const statusFilter = (params.status || '').toUpperCase();

  const where: Prisma.WebinarWhereInput = {};
  if (me.role === 'INSTRUCTOR') where.hostId = me.id;
  if (['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'].includes(statusFilter)) {
    where.status = statusFilter as 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'CANCELLED';
  }

  const webinars = await prisma.webinar.findMany({
    where,
    include: {
      course: { select: { title: true } },
      host: { select: { name: true, email: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Webinars"
        title="Webinars"
        subtitle={`${webinars.length} ${
          webinars.length === 1 ? 'webinar' : 'webinars'
        } · paste a Zoom or Google Meet link per session`}
        action={<PrimaryButton href="/admin/webinars/new">+ Schedule webinar</PrimaryButton>}
      />

      <div className="mx-auto max-w-screen-2xl space-y-6 px-6 py-8 lg:px-8">
        <div className="flex flex-wrap gap-2">
          <FilterPill href="/admin/webinars" active={!statusFilter}>All</FilterPill>
          <FilterPill href="/admin/webinars?status=SCHEDULED" active={statusFilter === 'SCHEDULED'}>Scheduled</FilterPill>
          <FilterPill href="/admin/webinars?status=LIVE" active={statusFilter === 'LIVE'}>Live</FilterPill>
          <FilterPill href="/admin/webinars?status=COMPLETED" active={statusFilter === 'COMPLETED'}>Completed</FilterPill>
          <FilterPill href="/admin/webinars?status=CANCELLED" active={statusFilter === 'CANCELLED'}>Cancelled</FilterPill>
        </div>

        {webinars.length === 0 ? (
          <EmptyState
            title="No webinars scheduled yet"
            body="Add a webinar with a date/time and Zoom or Google Meet link. Enrolled students will see it on their dashboard."
            cta={{ href: '/admin/webinars/new', label: 'Schedule your first webinar' }}
          />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-ink/15 bg-bg">
            {webinars.map((w, i) => (
              <Link
                key={w.id}
                href={`/admin/webinars/${w.id}/edit`}
                className={`grid grid-cols-1 gap-3 px-6 py-4 transition hover:bg-bg-alt md:grid-cols-12 md:items-center ${
                  i < webinars.length - 1 ? 'border-b border-ink/5' : ''
                }`}
              >
                <div className="md:col-span-5 min-w-0">
                  <div className="flex items-center gap-3">
                    <StatusBadge
                      status={w.status.toLowerCase()}
                      variant={
                        w.status === 'LIVE'
                          ? 'accent'
                          : w.status === 'SCHEDULED'
                          ? 'success'
                          : w.status === 'CANCELLED'
                          ? 'danger'
                          : 'neutral'
                      }
                    />
                    <span className="truncate font-medium text-ink">{w.title}</span>
                  </div>
                  {w.course && (
                    <div className="mt-1 truncate font-mono text-xs text-ink-subtle">
                      Course: {w.course.title}
                    </div>
                  )}
                </div>
                <div className="md:col-span-3 font-mono text-xs text-ink-muted">
                  {new Intl.DateTimeFormat('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }).format(w.scheduledAt)}
                </div>
                <div className="md:col-span-2 font-mono text-xs text-ink-muted">
                  {w.durationMinutes}m
                </div>
                <div className="md:col-span-2 font-mono text-xs text-ink-subtle md:text-right truncate">
                  {w.host.name || w.host.email}
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
