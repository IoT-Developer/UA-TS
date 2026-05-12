import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/marketing/navbar';
import { formatRelativeTime } from '@/lib/utils';

export const metadata = { title: 'Webinars — Unified Automation' };

export default async function StudentWebinarsPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) redirect('/sign-in?redirect=/dashboard/webinars');

  // Enrolled course IDs
  const enrolledCourses = await prisma.enrollment.findMany({
    where: { userId: user.id },
    select: { courseId: true },
  });
  const enrolledCourseIds = enrolledCourses.map((e) => e.courseId);

  // Visibility filter matches dashboard upcoming widget
  const visibilityFilter = {
    OR: [
      { enrolledOnly: false },
      { enrolledOnly: true, courseId: { in: enrolledCourseIds } },
      { enrolledOnly: true, courseId: null },
    ],
  };

  const now = new Date();
  const [upcoming, past] = await Promise.all([
    prisma.webinar.findMany({
      where: {
        ...visibilityFilter,
        scheduledAt: { gte: new Date(now.getTime() - 60 * 60_000) },
        status: { in: ['SCHEDULED', 'LIVE'] },
      },
      include: { course: { select: { title: true, slug: true } } },
      orderBy: { scheduledAt: 'asc' },
    }),
    prisma.webinar.findMany({
      where: {
        ...visibilityFilter,
        OR: [
          { status: 'COMPLETED' },
          { scheduledAt: { lt: new Date(now.getTime() - 60 * 60_000) }, status: { not: 'CANCELLED' } },
        ],
      },
      include: { course: { select: { title: true, slug: true } } },
      orderBy: { scheduledAt: 'desc' },
      take: 20,
    }),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-ink/10 bg-grid">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
            <div className="mb-4 flex items-center gap-2 font-mono text-xs text-ink-subtle">
              <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
              <span>/</span>
              <span>Webinars</span>
            </div>
            <h1 className="font-display text-display-2 font-semibold tracking-tight">
              Live <em className="font-normal italic text-ink-muted">sessions</em>
            </h1>
            <p className="mt-6 max-w-xl text-base text-ink-muted">
              Live Q&As, project walkthroughs, and cohort office hours from your instructors.
              "Join now" appears 15 minutes before each session.
            </p>
          </div>
        </section>

        {/* Upcoming */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Upcoming</h2>
              <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                {upcoming.length} scheduled
              </span>
            </div>

            {upcoming.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-ink/20 p-12 text-center">
                <div className="eyebrow mb-3">[ Nothing scheduled ]</div>
                <p className="text-sm text-ink-muted">
                  Check back later — new sessions are announced via email.
                </p>
              </div>
            ) : (
              <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 md:grid-cols-2">
                {upcoming.map((w) => (
                  <UpcomingWebinarCard key={w.id} webinar={w} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Past */}
        {past.length > 0 && (
          <section className="border-t border-ink/10 bg-bg-alt/40 py-12 lg:py-16">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="mb-6 flex items-baseline justify-between">
                <h2 className="font-display text-2xl font-semibold tracking-tight">Past sessions</h2>
                <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                  {past.length} total
                </span>
              </div>
              <div className="overflow-hidden rounded-2xl border border-ink/15 bg-bg">
                {past.map((w, i) => (
                  <PastWebinarRow key={w.id} webinar={w} isLast={i === past.length - 1} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}

interface Webinar {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  joinUrl: string;
  recordingUrl: string | null;
  status: string;
  course: { title: string; slug: string } | null;
}

function UpcomingWebinarCard({ webinar: w }: { webinar: Webinar }) {
  const startMs = w.scheduledAt.getTime();
  const endMs = startMs + w.durationMinutes * 60_000;
  const now = Date.now();
  const minsUntil = Math.round((startMs - now) / 60_000);
  const joinable = w.status === 'LIVE' || (now >= startMs - 15 * 60_000 && now < endMs);
  const isLiveNow = now >= startMs && now < endMs;

  return (
    <div className="bg-bg p-6 lg:p-7">
      <div className="mb-3 flex items-center gap-3">
        {isLiveNow ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-bg">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-bg" />
            Live now
          </span>
        ) : (
          <span className="rounded-full border border-ink/20 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-ink-muted">
            Upcoming
          </span>
        )}
        {w.course && (
          <span className="truncate font-mono text-xs text-ink-subtle">{w.course.title}</span>
        )}
      </div>

      <h3 className="font-display text-lg font-semibold leading-tight tracking-tight">
        {w.title}
      </h3>
      {w.description && (
        <p className="mt-2 line-clamp-2 text-sm text-ink-muted">{w.description}</p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-ink/10 pt-4 font-mono text-xs text-ink-muted">
        <span>
          {new Intl.DateTimeFormat('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }).format(w.scheduledAt)}
        </span>
        <span>
          {new Intl.DateTimeFormat('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).format(w.scheduledAt)} IST
        </span>
        <span>· {w.durationMinutes} min</span>
        {!isLiveNow && minsUntil > 0 && minsUntil < 60 * 24 && (
          <span className="text-accent">
            in {minsUntil < 60 ? `${minsUntil}m` : `${Math.round(minsUntil / 60)}h`}
          </span>
        )}
      </div>

      <div className="mt-5">
        {joinable ? (
          <a
            href={w.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-ink hover:bg-accent-glow"
          >
            {isLiveNow ? 'Join now' : 'Join meeting'} <span>↗</span>
          </a>
        ) : (
          <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-ink-muted">
            Opens 15 min before start
          </span>
        )}
      </div>
    </div>
  );
}

function PastWebinarRow({ webinar: w, isLast }: { webinar: Webinar; isLast: boolean }) {
  return (
    <div
      className={`flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between ${
        !isLast ? 'border-b border-ink/5' : ''
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-ink/15 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-ink-muted">
            {w.status === 'COMPLETED' ? 'Completed' : 'Past'}
          </span>
          <span className="truncate font-medium text-ink">{w.title}</span>
        </div>
        {w.course && (
          <div className="mt-1 truncate font-mono text-xs text-ink-subtle">
            {w.course.title}
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <span className="font-mono text-xs text-ink-subtle">
          {formatRelativeTime(w.scheduledAt)}
        </span>
        {w.recordingUrl ? (
          <a
            href={w.recordingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink hover:border-ink hover:bg-ink hover:text-bg"
          >
            Watch recording ↗
          </a>
        ) : (
          <span className="font-mono text-xs text-ink-subtle">No recording</span>
        )}
      </div>
    </div>
  );
}
