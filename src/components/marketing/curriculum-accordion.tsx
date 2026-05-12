import { formatDuration } from '@/lib/utils';

interface Lesson {
  id: string;
  title: string;
  type: string;
  durationSeconds: number;
  isFreePreview: boolean;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CurriculumAccordionProps {
  modules: Module[];
}

export function CurriculumAccordion({ modules }: CurriculumAccordionProps) {
  if (modules.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink/20 p-8 text-center text-sm text-ink-muted">
        Curriculum coming soon.
      </div>
    );
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const totalSeconds = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.durationSeconds, 0),
    0
  );
  const totalMinutes = Math.round(totalSeconds / 60);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 font-mono text-xs uppercase tracking-wider text-ink-muted">
        <span>
          {modules.length} modules · {totalLessons} lessons
        </span>
        <span>Total: {formatDuration(totalMinutes)}</span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-ink/15">
        {modules.map((module, idx) => (
          <ModuleAccordion key={module.id} module={module} index={idx + 1} />
        ))}
      </div>
    </div>
  );
}

function ModuleAccordion({ module, index }: { module: Module; index: number }) {
  const moduleSeconds = module.lessons.reduce((s, l) => s + l.durationSeconds, 0);
  const moduleMinutes = Math.round(moduleSeconds / 60);

  return (
    <details className="group border-b border-ink/10 last:border-b-0 [&_summary::-webkit-details-marker]:hidden" open={index === 1}>
      <summary className="flex cursor-pointer items-center justify-between bg-bg p-5 transition hover:bg-bg-alt lg:p-6">
        <div className="flex items-baseline gap-4">
          <span className="font-mono text-xs text-ink-subtle">
            {String(index).padStart(2, '0')}
          </span>
          <h3 className="font-display text-lg font-semibold tracking-tight lg:text-xl">
            {module.title}
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-xs text-ink-subtle sm:inline">
            {module.lessons.length} lessons · {formatDuration(moduleMinutes)}
          </span>
          <span className="text-xl text-ink-muted transition group-open:rotate-45">
            +
          </span>
        </div>
      </summary>

      <div className="border-t border-ink/10 bg-bg-alt/40">
        {module.lessons.map((lesson, i) => (
          <LessonRow key={lesson.id} lesson={lesson} index={i + 1} />
        ))}
      </div>
    </details>
  );
}

function LessonRow({ lesson, index }: { lesson: Lesson; index: number }) {
  const minutes = Math.round(lesson.durationSeconds / 60);

  const typeIcon = {
    VIDEO: '▶',
    TEXT: '≡',
    PDF: '↓',
  }[lesson.type] || '·';

  return (
    <div className="flex items-center justify-between border-b border-ink/5 px-5 py-3.5 last:border-b-0 lg:px-6">
      <div className="flex items-baseline gap-4 min-w-0 flex-1">
        <span className="font-mono text-[0.65rem] text-ink-subtle">
          {String(index).padStart(2, '0')}
        </span>
        <span className="font-mono text-sm text-ink-muted shrink-0">{typeIcon}</span>
        <span className="text-sm text-ink truncate">{lesson.title}</span>
        {lesson.isFreePreview && (
          <span className="hidden shrink-0 rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-wider text-accent sm:inline">
            Preview
          </span>
        )}
      </div>
      <span className="ml-4 shrink-0 font-mono text-xs text-ink-subtle">
        {minutes}m
      </span>
    </div>
  );
}
