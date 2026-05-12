import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { getOrCreateCurrentUser } from '@/lib/auth';
import {
  getDashboardStats,
  getContinueLearning,
  getEnrollments,
  getSuggestedTracks,
  getRecentActivity,
  getUpcomingWebinars,
} from '@/lib/dashboard-data';
import {
  calculateAge,
  isProfileComplete,
  profileCompletionPct,
} from '@/lib/utils';
import { StatsStrip } from '@/components/dashboard/stats-strip';
import { ContinueCard } from '@/components/dashboard/continue-card';
import {
  EnrollmentsGrid,
  SuggestedTracks,
  RecentActivity,
} from '@/components/dashboard/sections';
import { UpcomingWebinars } from '@/components/dashboard/upcoming-webinars';

export const metadata = {
  title: 'Dashboard — Unified Automation',
};

export default async function DashboardPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) redirect('/sign-in');

  const clerkUser = await currentUser();
  const profileDone = isProfileComplete(user);
  const completion = profileCompletionPct(user);
  const age = calculateAge(user.dateOfBirth);

  // Parallel data fetch — faster than waterfall
  const [stats, continueData, enrollments, recent, suggested, webinars] = await Promise.all([
    getDashboardStats(user.id),
    getContinueLearning(user.id),
    getEnrollments(user.id),
    getRecentActivity(user.id, 5),
    getSuggestedTracks(user.id, 3),
    getUpcomingWebinars(user.id, 4),
  ]);

  const hasEnrollments = enrollments.length > 0;
  const firstName = user.name?.split(' ')[0] || clerkUser?.firstName || 'engineer';

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="border-b border-ink/10 bg-grid">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
            <div className="eyebrow mb-3">[ Dashboard ]</div>
            <h1 className="font-display text-display-2 font-semibold tracking-tight">
              Welcome,{' '}
              <em className="font-normal italic text-ink-muted">{firstName}</em>.
            </h1>

            {profileDone && (
              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-wider text-ink-muted">
                {age !== null && <span>Age · <span className="text-ink">{age}</span></span>}
                {user.college && <span>College · <span className="text-ink">{user.college}</span></span>}
                {user.branch && <span>Branch · <span className="text-ink">{user.branch}</span></span>}
                {user.yearOfStudy && (
                  <span>Year · <span className="text-ink">{user.yearOfStudy === 5 ? 'PG' : user.yearOfStudy}</span></span>
                )}
                {user.academicStatus && (
                  <span>Status · <span className="text-ink">{formatStatus(user.academicStatus)}</span></span>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Profile completion banner */}
        {!profileDone && (
          <section className="border-b border-ink/10 bg-accent/5 py-8">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="eyebrow mb-2 text-accent">[ Action required ]</div>
                  <h2 className="font-display text-xl font-semibold tracking-tight lg:text-2xl">
                    Complete your profile to start enrolling
                  </h2>
                  <p className="mt-2 max-w-xl text-sm text-ink-muted">
                    We need a few details before you can enroll in tracks. Takes under a minute.
                  </p>
                  <div className="mt-4 max-w-sm">
                    <div className="mb-1 font-mono text-xs text-ink-muted">
                      {completion}% complete
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-ink/10">
                      <div className="h-full bg-accent transition-all" style={{ width: `${completion}%` }} />
                    </div>
                  </div>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent"
                >
                  Complete profile <span>→</span>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* MAIN LAYOUT: differs based on enrollment state */}
        {hasEnrollments ? (
          <ActiveLayout
            continueData={continueData}
            enrollments={enrollments}
            stats={stats}
            suggested={suggested}
            recent={recent}
            webinars={webinars}
          />
        ) : (
          <>
            <EmptyLayout profileDone={profileDone} />
            <UpcomingWebinars webinars={webinars} />
          </>
        )}

        {/* Account quick-links */}
        <section className="border-t border-ink/10 bg-bg-alt/40 py-12">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="eyebrow mb-6">[ Account ]</div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-5">
              <AccountLink href="/dashboard/profile" title="Edit profile" subtitle={profileDone ? 'All fields filled' : `${completion}% complete`} />
              <AccountLink href="/dashboard/webinars" title="Webinars" subtitle="Live sessions & recordings" />
              <AccountLink href="/dashboard/orders" title="Order history" subtitle="Payments and receipts" />
              <AccountLink href="/dashboard/settings" title="Settings" subtitle="Preferences and account" />
              <AccountLink href="/verify" title="Verify a certificate" subtitle="Look up any UA certificate" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function ActiveLayout({
  continueData,
  enrollments,
  stats,
  suggested,
  recent,
  webinars,
}: {
  continueData: Awaited<ReturnType<typeof getContinueLearning>>;
  enrollments: Awaited<ReturnType<typeof getEnrollments>>;
  stats: Awaited<ReturnType<typeof getDashboardStats>>;
  suggested: Awaited<ReturnType<typeof getSuggestedTracks>>;
  recent: Awaited<ReturnType<typeof getRecentActivity>>;
  webinars: Awaited<ReturnType<typeof getUpcomingWebinars>>;
}) {
  return (
    <>
      {/* Continue learning */}
      {continueData && (
        <section className="py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <ContinueCard data={continueData} />
          </div>
        </section>
      )}

      {/* Stats */}
      <section className={continueData ? 'pb-10 lg:pb-14' : 'py-10 lg:py-14'}>
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <StatsStrip stats={stats} />
        </div>
      </section>

      {/* Enrollments */}
      <section className="pb-12 lg:pb-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="mb-6 flex items-baseline justify-between">
            <h2 className="font-display text-2xl font-semibold tracking-tight">Your tracks</h2>
            <Link
              href="/courses"
              className="font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
            >
              Browse all →
            </Link>
          </div>
          <EnrollmentsGrid
            enrollments={enrollments.map((e) => ({
              id: e.id,
              progressPct: e.progressPct,
              course: {
                slug: e.course.slug,
                title: e.course.title,
                durationMinutes: e.course.durationMinutes,
                thumbnailUrl: e.course.thumbnailUrl,
                coverImageUrl: e.course.coverImageUrl,
                category: e.course.category ? { name: e.course.category.name } : null,
              },
            }))}
          />
        </div>
      </section>

      {/* Upcoming webinars */}
      <UpcomingWebinars webinars={webinars} />

      {/* Suggested */}
      {suggested.length > 0 && (
        <section className="border-t border-ink/10 bg-bg-alt/40 py-12 lg:py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="mb-6">
              <div className="eyebrow mb-2">[ Suggested ]</div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Other tracks you might like
              </h2>
            </div>
            <SuggestedTracks tracks={suggested} />
          </div>
        </section>
      )}

      {/* Recent activity */}
      {recent.length > 0 && (
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <div className="mb-6 flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-semibold tracking-tight">Recent activity</h2>
            </div>
            <RecentActivity items={recent} />
          </div>
        </section>
      )}
    </>
  );
}

function EmptyLayout({ profileDone }: { profileDone: boolean }) {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="rounded-2xl border border-dashed border-ink/20 p-12 text-center lg:p-16">
          <div className="eyebrow mb-4">[ No enrollments yet ]</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            Pick your first track.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-ink-muted">
            {profileDone
              ? 'Browse our catalog, pick a track that fits your goals, and start building real projects this week.'
              : 'Complete your profile, then browse the catalog. Each track ships you a portfolio of real projects.'}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={profileDone ? '/courses' : '/dashboard/profile'}
              className="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent"
            >
              {profileDone ? 'Browse tracks' : 'Complete profile'} <span>→</span>
            </Link>
            {profileDone && (
              <Link
                href="/internships"
                className="font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
              >
                Or learn about internships
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AccountLink({
  href,
  title,
  subtitle,
}: {
  href: string;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between bg-bg p-6 transition hover:bg-bg-alt"
    >
      <div>
        <div className="font-display text-lg font-semibold tracking-tight">{title}</div>
        <div className="mt-1 font-mono text-xs text-ink-muted">{subtitle}</div>
      </div>
      <span className="text-xl text-ink-muted transition group-hover:translate-x-1 group-hover:text-accent">
        →
      </span>
    </Link>
  );
}

function formatStatus(status: string): string {
  return (
    {
      STUDENT: 'Student',
      WORKING_PROFESSIONAL: 'Working Pro',
      JOB_SEEKER: 'Job Seeker',
    }[status] || status
  );
}
