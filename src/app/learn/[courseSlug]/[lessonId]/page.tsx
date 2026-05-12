import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getOrCreateCurrentUser } from '@/lib/auth';
import { userCanAccessLesson, findAdjacentLessons } from '@/lib/lesson-access';
import { generateVdoCipherOtp } from '@/lib/vdocipher';
import { CurriculumSidebar } from '@/components/learn/curriculum-sidebar';
import { VideoPlayer } from '@/components/learn/video-player';
import { MarkCompleteButton } from '@/components/learn/mark-complete-button';

interface PageProps {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { lessonId } = await params;
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { title: true, module: { select: { course: { select: { title: true } } } } },
  });
  if (!lesson) return { title: 'Lesson — Unified Automation' };
  return { title: `${lesson.title} · ${lesson.module.course.title}` };
}

export default async function LessonViewPage({ params }: PageProps) {
  const { courseSlug, lessonId } = await params;
  const user = await getOrCreateCurrentUser();
  if (!user) redirect(`/sign-in?redirect=/learn/${courseSlug}/${lessonId}`);

  // Verify access (enrollment, free preview, admin, or instructor)
  const access = await userCanAccessLesson(user, lessonId);
  if (!access.allowed) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="eyebrow mb-3">[ Access required ]</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          {access.reason || 'Unable to access this lesson'}
        </h1>
        <Link
          href={access.courseSlug ? `/courses/${access.courseSlug}` : '/courses'}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent"
        >
          View course page →
        </Link>
      </main>
    );
  }

  // Fetch lesson with full course context (for sidebar + nav)
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              modules: {
                orderBy: { order: 'asc' },
                include: {
                  lessons: { orderBy: { order: 'asc' } },
                  quizzes: {
                    select: { id: true },
                    take: 1, // does this module have a quiz?
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!lesson) notFound();
  if (lesson.module.course.slug !== courseSlug) {
    // URL mismatch — redirect to canonical
    redirect(`/learn/${lesson.module.course.slug}/${lesson.id}`);
  }

  // Fetch user progress for sidebar checkmarks
  const allLessonIds = lesson.module.course.modules.flatMap((m) =>
    m.lessons.map((l) => l.id)
  );
  const progressRows = await prisma.lessonProgress.findMany({
    where: {
      userId: user.id,
      lessonId: { in: allLessonIds },
    },
    select: { lessonId: true, completed: true },
  });
  const completedLessonIds = new Set<string>(
    progressRows.filter((p) => p.completed).map((p) => p.lessonId)
  );

  // Current lesson's progress
  const currentProgress = progressRows.find((p) => p.lessonId === lessonId);
  const isComplete = currentProgress?.completed || false;

  // Enrollment progress for sidebar
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: lesson.module.course.id } },
    select: { progressPct: true },
  });

  // Quiz pass status per module (for sidebar checkmarks)
  const moduleQuizIds = lesson.module.course.modules
    .flatMap((m) => m.quizzes.map((q) => q.id));
  const passedQuizAttempts = await prisma.quizAttempt.findMany({
    where: { userId: user.id, quizId: { in: moduleQuizIds }, passed: true },
    select: { quizId: true },
    distinct: ['quizId'],
  });
  const passedQuizIds = new Set<string>(passedQuizAttempts.map((q) => q.quizId));

  // Adjacent lessons for prev/next nav
  const { prev, next } = findAdjacentLessons(
    lesson.module.course.modules.map((m) => ({
      order: m.order,
      lessons: m.lessons,
    })),
    lesson.id
  );

  // Generate VdoCipher OTP if it's a video lesson
  const otp =
    lesson.type === 'VIDEO' && lesson.videoId
      ? await generateVdoCipherOtp(lesson.videoId)
      : null;

  const nextLessonHref = next
    ? `/learn/${courseSlug}/${next.id}`
    : undefined;

  return (
    <div className="min-h-screen bg-bg">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[320px_1fr] xl:grid-cols-[360px_1fr]">
        <CurriculumSidebar
          courseSlug={courseSlug}
          courseTitle={lesson.module.course.title}
          modules={lesson.module.course.modules.map((m) => ({
            id: m.id,
            title: m.title,
            order: m.order,
            lessons: m.lessons.map((l) => ({
              id: l.id,
              title: l.title,
              type: l.type,
              durationSeconds: l.durationSeconds,
              isFreePreview: l.isFreePreview,
              order: l.order,
            })),
            hasQuiz: m.quizzes.length > 0,
            quizPassed: m.quizzes.length > 0 && m.quizzes.every((q) => passedQuizIds.has(q.id)),
          }))}
          currentLessonId={lesson.id}
          completedLessonIds={completedLessonIds}
          progressPct={enrollment?.progressPct ?? 0}
        />

        {/* Main content */}
        <div className="min-w-0">
          <div className="mx-auto max-w-4xl px-6 py-8 lg:px-10 lg:py-12">
            {/* Breadcrumb */}
            <div className="mb-3 flex flex-wrap items-center gap-2 font-mono text-xs text-ink-subtle">
              <span>Module {String(lesson.module.order + 1).padStart(2, '0')}</span>
              <span>·</span>
              <span className="truncate">{lesson.module.title}</span>
            </div>

            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
              {lesson.title}
            </h1>

            {/* Body — video or text or pdf */}
            <div className="mt-8">
              {lesson.type === 'VIDEO' && (
                <VideoPlayer
                  lessonId={lesson.id}
                  videoId={lesson.videoId}
                  otp={otp}
                  durationSeconds={lesson.durationSeconds}
                />
              )}

              {lesson.type === 'TEXT' && lesson.textContent && (
                <div className="prose-content rounded-2xl border border-ink/10 bg-bg p-8 lg:p-10">
                  {/* Server-rendered: text content is set by the instructor */}
                  {lesson.textContent.split('\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}

              {lesson.type === 'PDF' && lesson.pdfUrl && (
                <div className="rounded-2xl border border-ink/10 bg-bg-alt/40 p-8 text-center">
                  <div className="eyebrow mb-3">[ PDF resource ]</div>
                  <a
                    href={lesson.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent"
                  >
                    Open PDF ↗
                  </a>
                </div>
              )}

              {/* Empty fallback */}
              {((lesson.type === 'TEXT' && !lesson.textContent) ||
                (lesson.type === 'PDF' && !lesson.pdfUrl)) && (
                <div className="rounded-2xl border-2 border-dashed border-ink/15 p-8 text-center text-sm text-ink-muted">
                  Content coming soon.
                </div>
              )}
            </div>

            {/* Bottom navigation */}
            <div className="mt-12 grid gap-3 border-t border-ink/10 pt-8 sm:grid-cols-2">
              {/* Prev */}
              {prev ? (
                <Link
                  href={`/learn/${courseSlug}/${prev.id}`}
                  className="group flex flex-col items-start gap-1 rounded-2xl border border-ink/15 bg-bg p-5 transition hover:bg-bg-alt"
                >
                  <span className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
                    ← Previous
                  </span>
                  <span className="line-clamp-2 text-sm font-medium text-ink group-hover:text-accent">
                    {prev.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {/* Next or complete */}
              <div className="flex flex-col items-end justify-between gap-3 rounded-2xl border border-ink/15 bg-bg p-5">
                <div className="self-stretch">
                  <div className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle text-right">
                    {next ? 'Next up' : 'Last lesson'}
                  </div>
                  {next && (
                    <div className="line-clamp-2 text-right text-sm font-medium text-ink">
                      {next.title}
                    </div>
                  )}
                </div>
                {lesson.type !== 'VIDEO' || !lesson.videoId ? (
                  <MarkCompleteButton
                    lessonId={lesson.id}
                    initiallyCompleted={isComplete}
                    nextLessonHref={nextLessonHref}
                  />
                ) : isComplete && next ? (
                  <Link
                    href={`/learn/${courseSlug}/${next.id}`}
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-ink hover:bg-accent-glow"
                  >
                    Next lesson →
                  </Link>
                ) : (
                  <span className="font-mono text-xs text-ink-subtle">
                    {lesson.type === 'VIDEO'
                      ? 'Video auto-completes at 90%'
                      : 'Use mark-complete above'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
