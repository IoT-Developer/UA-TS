import Link from 'next/link';

interface ContinueCardProps {
  data: {
    enrollment: {
      progressPct: number;
      course: { slug: string; title: string; category: { name: string } | null };
    };
    nextModule: { title: string; order: number };
    nextLesson: { title: string; order: number; durationSeconds: number };
  };
}

export function ContinueCard({ data }: ContinueCardProps) {
  const { enrollment, nextModule, nextLesson } = data;
  const minutes = Math.max(1, Math.round(nextLesson.durationSeconds / 60));

  return (
    <Link
      href={`/learn/${enrollment.course.slug}`}
      className="group block overflow-hidden rounded-2xl bg-ink text-bg transition hover:bg-ink/90"
    >
      <div className="relative grid gap-8 p-8 lg:grid-cols-12 lg:p-10">
        {/* Background dots */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(244,241,234,0.4) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative lg:col-span-8">
          <div className="eyebrow mb-3 text-bg/60">[ Continue where you left off ]</div>
          <h2 className="font-display text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
            {enrollment.course.title}
          </h2>
          <div className="mt-5 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-bg/70">
            <span>Module {String(nextModule.order + 1).padStart(2, '0')}</span>
            <span className="h-1 w-1 rounded-full bg-bg/40" />
            <span>{nextModule.title}</span>
          </div>
          <p className="mt-2 text-lg text-bg/90">
            Next: <span className="text-bg">{nextLesson.title}</span>{' '}
            <span className="font-mono text-sm text-bg/60">· {minutes}m</span>
          </p>
        </div>

        <div className="relative flex flex-col justify-between gap-6 lg:col-span-4 lg:items-end lg:text-right">
          <div className="w-full lg:max-w-xs">
            <div className="mb-2 flex items-baseline justify-between font-mono text-xs uppercase tracking-wider">
              <span className="text-bg/60">Track progress</span>
              <span className="text-bg">{enrollment.progressPct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-bg/15">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${enrollment.progressPct}%` }}
              />
            </div>
          </div>
          <span className="inline-flex items-center gap-3 rounded-full bg-accent px-6 py-3 font-mono text-xs uppercase tracking-widest text-ink transition group-hover:bg-accent-glow">
            Resume lesson
            <span className="transition group-hover:translate-x-0.5">→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
