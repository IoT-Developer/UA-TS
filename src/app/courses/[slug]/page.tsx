import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDuration } from '@/lib/utils';
import { Navbar } from '@/components/marketing/navbar';
import { CurriculumAccordion } from '@/components/marketing/curriculum-accordion';
import { CheckoutButton } from '@/components/checkout/checkout-button';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const course = await prisma.course.findUnique({
    where: { slug },
    select: { title: true, subtitle: true },
  });
  return {
    title: course ? `${course.title} — Unified Automation` : 'Course not found',
    description: course?.subtitle || undefined,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const { userId } = await auth();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      category: true,
      instructor: { select: { id: true, name: true, avatarUrl: true } },
      modules: {
        include: {
          lessons: {
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!course || course.status !== 'PUBLISHED') {
    notFound();
  }

  // Check if signed-in user is already enrolled
  let isEnrolled = false;
  if (userId) {
    const localUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (localUser) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: localUser.id, courseId: course.id } },
        select: { id: true },
      });
      isEnrolled = !!enrollment;
    }
  }

  const discountPct = course.mrpInPaise > 0
    ? Math.round((1 - course.priceInPaise / course.mrpInPaise) * 100)
    : 0;

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="border-b border-ink/10 bg-grid">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-20">
            <div className="grid gap-12 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <div className="mb-4 flex items-center gap-2 font-mono text-xs text-ink-subtle">
                  <Link href="/courses" className="transition hover:text-ink">
                    All tracks
                  </Link>
                  <span>/</span>
                  <Link
                    href={`/courses?cat=${course.category.slug}`}
                    className="transition hover:text-ink"
                  >
                    {course.category.name}
                  </Link>
                </div>
                <h1 className="font-display text-display-2 font-semibold tracking-tight">
                  {course.title}
                </h1>
                {course.subtitle && (
                  <p className="mt-4 text-xl leading-relaxed text-ink-muted">
                    {course.subtitle}
                  </p>
                )}

                {/* Cover image */}
                {course.coverImageUrl && (
                  <div className="mt-8 overflow-hidden rounded-2xl border border-ink/10">
                    <Image
                      src={course.coverImageUrl}
                      alt={course.title}
                      width={1280}
                      height={720}
                      className="h-auto w-full object-cover"
                      priority
                      unoptimized
                    />
                  </div>
                )}

                {/* Tech stack chips */}
                {Array.isArray(course.techStack) && (course.techStack as Array<{ slug: string; name: string; iconUrl: string }>).length > 0 && (
                  <div className="mt-6">
                    <div className="eyebrow mb-3">[ Tech stack ]</div>
                    <div className="flex flex-wrap gap-2">
                      {(course.techStack as Array<{ slug: string; name: string; iconUrl: string }>).map((t) => (
                        <div
                          key={t.slug}
                          className="flex items-center gap-2 rounded-full border border-ink/15 bg-bg px-3 py-1.5"
                        >
                          <Image
                            src={t.iconUrl}
                            alt={t.name}
                            width={18}
                            height={18}
                            className="h-4 w-4 object-contain"
                            unoptimized
                          />
                          <span className="text-sm">{t.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink-muted">
                  {course.description}
                </p>

                {/* Quick meta strip */}
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/10 pt-6 font-mono text-xs uppercase tracking-wider text-ink-muted">
                  <span>{formatDuration(course.durationMinutes)}</span>
                  <span className="h-1 w-1 rounded-full bg-ink-subtle" />
                  <span>{course.lessonCount} lessons</span>
                  <span className="h-1 w-1 rounded-full bg-ink-subtle" />
                  <span>{course.level.toLowerCase()}</span>
                  <span className="h-1 w-1 rounded-full bg-ink-subtle" />
                  <span>{course.language.toUpperCase()}</span>
                </div>
              </div>

              {/* Sticky enrollment card */}
              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-24 rounded-2xl border border-ink/15 bg-bg p-7 lg:p-8">
                  <div className="eyebrow mb-3">[ Enrollment ]</div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-4xl font-semibold tracking-tight">
                      {formatPrice(course.priceInPaise)}
                    </span>
                    {course.mrpInPaise > course.priceInPaise && (
                      <>
                        <span className="text-lg text-ink-subtle line-through">
                          {formatPrice(course.mrpInPaise)}
                        </span>
                        <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-accent">
                          −{discountPct}%
                        </span>
                      </>
                    )}
                  </div>

                  <div className="mt-6">
                    {isEnrolled ? (
                      <Link
                        href={`/learn/${course.slug}`}
                        className="block w-full rounded-full bg-accent px-6 py-3.5 text-center font-mono text-xs uppercase tracking-widest text-ink transition hover:bg-accent-glow"
                      >
                        ✓ Enrolled · Continue learning →
                      </Link>
                    ) : (
                      <CheckoutButton
                        courseId={course.id}
                        priceInPaise={course.priceInPaise}
                        isAuthenticated={!!userId}
                      />
                    )}
                  </div>

                  <div className="mt-6 space-y-3 border-t border-ink/10 pt-6 text-sm">
                    <Meta label="Duration" value={formatDuration(course.durationMinutes)} />
                    <Meta label="Lessons" value={String(course.lessonCount)} />
                    <Meta label="Modules" value={String(course.modules.length)} />
                    <Meta label="Level" value={course.level.toLowerCase()} />
                    <Meta label="Certificate" value="On completion" />
                  </div>

                  <div className="mt-6 border-t border-ink/10 pt-6">
                    <div className="eyebrow mb-3">[ 7-day refund ]</div>
                    <p className="text-xs leading-relaxed text-ink-muted">
                      Full refund within 7 days if less than 20% completed.{' '}
                      <Link href="/refunds" className="underline decoration-accent decoration-2 underline-offset-2 hover:text-ink">
                        Read policy
                      </Link>
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* What you'll learn */}
        {course.whatYoullLearn.length > 0 && (
          <section className="border-b border-ink/10 py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-4">
                  <div className="eyebrow mb-3">[ Outcomes ]</div>
                  <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
                    What you'll
                    <br />
                    <em className="font-normal italic text-ink-muted">build</em>.
                  </h2>
                </div>
                <div className="lg:col-span-8">
                  <ul className="space-y-4">
                    {course.whatYoullLearn.map((item, i) => (
                      <li key={i} className="flex gap-4 border-b border-ink/10 pb-4 last:border-b-0">
                        <span className="font-mono text-xs text-accent pt-1">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-base text-ink">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Curriculum */}
        <section className="border-b border-ink/10 bg-bg-alt/40 py-16 lg:py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-10">
            <div className="eyebrow mb-3">[ Curriculum ]</div>
            <h2 className="mb-10 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              The full <em className="font-normal italic text-ink-muted">syllabus</em>.
            </h2>
            <CurriculumAccordion modules={course.modules} />
          </div>
        </section>

        {/* Audience + prerequisites side by side */}
        <section className="border-b border-ink/10 py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-2">
              {course.targetAudience.length > 0 && (
                <div className="bg-bg p-8 lg:p-10">
                  <div className="eyebrow mb-3">[ Who this is for ]</div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">
                    Built for
                  </h3>
                  <ul className="mt-5 space-y-2">
                    {course.targetAudience.map((a, i) => (
                      <li key={i} className="text-ink-muted">— {a}</li>
                    ))}
                  </ul>
                </div>
              )}
              {course.prerequisites.length > 0 && (
                <div className="bg-bg p-8 lg:p-10">
                  <div className="eyebrow mb-3">[ Prerequisites ]</div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">
                    Bring with you
                  </h3>
                  <ul className="mt-5 space-y-2">
                    {course.prerequisites.map((p, i) => (
                      <li key={i} className="text-ink-muted">— {p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Instructor */}
        <section className="border-b border-ink/10 bg-bg-alt/40 py-16 lg:py-20">
          <div className="mx-auto max-w-4xl px-6 lg:px-10">
            <div className="eyebrow mb-3">[ Faculty ]</div>
            <h2 className="mb-10 font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Who teaches this
            </h2>

            <div className="flex flex-col gap-6 rounded-2xl border border-ink/15 bg-bg p-8 sm:flex-row sm:gap-8">
              <div className="shrink-0">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-bg-alt font-display text-2xl font-semibold text-ink">
                  {course.instructor.name?.charAt(0) || '?'}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-display text-xl font-semibold tracking-tight">
                  {course.instructor.name || 'Faculty'}
                </h3>
                <p className="mt-2 text-sm text-ink-muted">
                  Lead instructor for {course.category.name}. Teaches across our{' '}
                  cohort tracks and runs office hours twice weekly.
                </p>
                <Link
                  href="/mentors"
                  className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
                >
                  About our faculty →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-ink py-16 text-bg lg:py-20">
          <div className="mx-auto max-w-3xl px-6 text-center lg:px-10">
            <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              Ready to build something real?
            </h2>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-mono text-xs uppercase tracking-widest text-ink transition hover:bg-accent-glow"
              >
                Reserve a seat <span>→</span>
              </Link>
              <Link
                href="/courses"
                className="font-mono text-xs uppercase tracking-widest text-bg/60 hover:text-bg"
              >
                Compare other tracks
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-mono text-xs uppercase tracking-wider text-ink-subtle">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
