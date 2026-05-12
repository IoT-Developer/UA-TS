import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDuration } from '@/lib/utils';

export async function CourseTracks() {
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: 4,
  });

  return (
    <section className="border-b border-ink/10 bg-bg-alt/40 py-24 lg:py-32" id="tracks">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        {/* Section header */}
        <div className="mb-16 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <div className="eyebrow mb-4">[02] / Active tracks</div>
            <h2 className="font-display text-display-2 font-semibold tracking-tight">
              Tracks that ship <em className="font-normal italic text-ink-muted">portfolios</em>,
              not just certificates.
            </h2>
          </div>
          <div className="lg:col-span-5">
            <p className="max-w-md text-base leading-relaxed text-ink-muted">
              Every track ends with four mentor-reviewed projects on your GitHub.
              That's what gets interviews. Certificates are the bonus.
            </p>
          </div>
        </div>

        {/* Course grid */}
        {courses.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-2">
            {courses.map((course, idx) => (
              <CourseCard key={course.id} course={course} index={idx + 1} />
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href="/courses"
            className="group inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-ink transition hover:text-accent"
          >
            <span>View all 12 tracks</span>
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function CourseCard({
  course,
  index,
}: {
  course: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    level: string;
    durationMinutes: number;
    lessonCount: number;
    priceInPaise: number;
    mrpInPaise: number;
    category: { name: string };
  };
  index: number;
}) {
  const discountPct = course.mrpInPaise > 0
    ? Math.round((1 - course.priceInPaise / course.mrpInPaise) * 100)
    : 0;

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative flex flex-col bg-bg p-8 transition hover:bg-bg-alt lg:p-10"
    >
      {/* Index + category */}
      <div className="mb-6 flex items-baseline justify-between">
        <span className="font-mono text-xs text-ink-subtle">
          {String(index).padStart(2, '0')} / {course.category.name}
        </span>
        <span className="rounded-full border border-ink/20 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-ink-muted">
          {course.level.toLowerCase()}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight transition group-hover:text-accent lg:text-3xl">
        {course.title}
      </h3>
      {course.subtitle && (
        <p className="mt-3 text-sm leading-relaxed text-ink-muted lg:text-base">
          {course.subtitle}
        </p>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer meta */}
      <div className="mt-8 flex items-end justify-between border-t border-ink/10 pt-5">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-xs text-ink-subtle">
            {formatDuration(course.durationMinutes)} · {course.lessonCount} lessons
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-semibold tracking-tight">
              {formatPrice(course.priceInPaise)}
            </span>
            {course.mrpInPaise > course.priceInPaise && (
              <>
                <span className="text-sm text-ink-subtle line-through">
                  {formatPrice(course.mrpInPaise)}
                </span>
                <span className="font-mono text-[0.65rem] uppercase tracking-wider text-accent">
                  −{discountPct}%
                </span>
              </>
            )}
          </div>
        </div>
        <span className="text-2xl text-ink transition group-hover:translate-x-1 group-hover:text-accent">
          →
        </span>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-ink/20 bg-bg p-16 text-center">
      <div className="eyebrow mb-3">[ Database empty ]</div>
      <p className="text-ink-muted">
        Run <code className="rounded bg-bg-alt px-2 py-0.5 font-mono text-sm">npm run db:seed</code> to populate sample courses.
      </p>
    </div>
  );
}
