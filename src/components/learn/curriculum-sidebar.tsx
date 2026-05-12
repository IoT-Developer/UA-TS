import Link from 'next/link';

interface SidebarLesson {
  id: string;
  title: string;
  type: string;
  durationSeconds: number;
  isFreePreview: boolean;
  order: number;
}

interface SidebarModule {
  id: string;
  title: string;
  order: number;
  lessons: SidebarLesson[];
  hasQuiz: boolean;
  quizPassed: boolean;
}

interface Props {
  courseSlug: string;
  courseTitle: string;
  modules: SidebarModule[];
  currentLessonId: string;
  completedLessonIds: Set<string>;
  progressPct: number;
}

export function CurriculumSidebar({
  courseSlug,
  courseTitle,
  modules,
  currentLessonId,
  completedLessonIds,
  progressPct,
}: Props) {
  return (
    <aside className="border-r border-ink/10 bg-bg-alt/40">
      {/* Course header */}
      <div className="sticky top-0 z-10 border-b border-ink/10 bg-bg-alt/95 px-5 py-4 backdrop-blur-sm">
        <Link
          href={`/courses/${courseSlug}`}
          className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle hover:text-ink"
        >
          ← Course page
        </Link>
        <h2 className="mt-2 font-display text-base font-semibold leading-tight tracking-tight">
          {courseTitle}
        </h2>
        <div className="mt-3">
          <div className="mb-1 flex items-baseline justify-between font-mono text-[0.65rem] uppercase tracking-wider">
            <span className="text-ink-muted">Progress</span>
            <span className="text-ink">{progressPct}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-ink/10">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Module + lesson tree */}
      <nav className="space-y-1 px-3 py-4">
        {modules.map((mod, mIdx) => (
          <ModuleSection
            key={mod.id}
            module={mod}
            index={mIdx + 1}
            courseSlug={courseSlug}
            currentLessonId={currentLessonId}
            completedLessonIds={completedLessonIds}
          />
        ))}
      </nav>
    </aside>
  );
}

function ModuleSection({
  module: mod,
  index,
  courseSlug,
  currentLessonId,
  completedLessonIds,
}: {
  module: SidebarModule;
  index: number;
  courseSlug: string;
  currentLessonId: string;
  completedLessonIds: Set<string>;
}) {
  const allLessonsComplete = mod.lessons.every((l) => completedLessonIds.has(l.id));
  const moduleHasCurrentLesson = mod.lessons.some((l) => l.id === currentLessonId);

  return (
    <details open={moduleHasCurrentLesson || !allLessonsComplete} className="group">
      <summary className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 hover:bg-bg [&::-webkit-details-marker]:hidden">
        <div className="flex items-baseline gap-3 min-w-0">
          <span className="font-mono text-[0.65rem] text-ink-subtle">
            {String(index).padStart(2, '0')}
          </span>
          <span className="truncate text-sm font-medium text-ink">{mod.title}</span>
        </div>
        <span className="ml-2 shrink-0 font-mono text-xs text-ink-muted transition group-open:rotate-90">
          ›
        </span>
      </summary>
      <ul className="mt-1 space-y-0.5">
        {mod.lessons.map((lesson, lIdx) => (
          <LessonItem
            key={lesson.id}
            lesson={lesson}
            index={lIdx + 1}
            courseSlug={courseSlug}
            isCurrent={lesson.id === currentLessonId}
            isComplete={completedLessonIds.has(lesson.id)}
          />
        ))}
        {mod.hasQuiz && (
          <li>
            <Link
              href={`/learn/${courseSlug}/quiz/${mod.id}`}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-bg`}
            >
              <span className="font-mono text-[0.65rem] text-accent">QZ</span>
              <span className="flex-1 truncate text-ink">Module quiz</span>
              {mod.quizPassed && (
                <span className="font-mono text-[0.65rem] text-accent">✓</span>
              )}
            </Link>
          </li>
        )}
      </ul>
    </details>
  );
}

function LessonItem({
  lesson,
  index,
  courseSlug,
  isCurrent,
  isComplete,
}: {
  lesson: SidebarLesson;
  index: number;
  courseSlug: string;
  isCurrent: boolean;
  isComplete: boolean;
}) {
  const minutes = Math.max(1, Math.round(lesson.durationSeconds / 60));
  const typeIcon = lesson.type === 'VIDEO' ? '▶' : lesson.type === 'PDF' ? '↓' : '≡';

  return (
    <li>
      <Link
        href={`/learn/${courseSlug}/${lesson.id}`}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
          isCurrent
            ? 'bg-ink text-bg'
            : 'text-ink-muted hover:bg-bg hover:text-ink'
        }`}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[0.6rem] ${
            isComplete
              ? 'bg-accent text-bg'
              : isCurrent
              ? 'bg-bg/20 text-bg'
              : 'bg-ink/10 text-ink-subtle'
          }`}
        >
          {isComplete ? '✓' : String(index).padStart(2, '0')}
        </span>
        <span className="font-mono text-xs">{typeIcon}</span>
        <span className="flex-1 truncate">{lesson.title}</span>
        <span className={`font-mono text-[0.65rem] ${isCurrent ? 'text-bg/60' : 'text-ink-subtle'}`}>
          {minutes}m
        </span>
      </Link>
    </li>
  );
}
