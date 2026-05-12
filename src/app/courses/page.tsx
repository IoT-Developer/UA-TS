import Link from 'next/link';
import Image from 'next/image';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { formatPrice, formatDuration } from '@/lib/utils';
import { Navbar } from '@/components/marketing/navbar';
import { CoursesFilter } from '@/components/marketing/courses-filter';

export const metadata = {
  title: 'All Tracks — Unified Automation',
};

interface PageProps {
  searchParams: Promise<{ q?: string; cat?: string }>;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const { q, cat } = await searchParams;
  const query = q?.trim() || '';
  const categorySlug = cat?.trim() || '';

  // Build dynamic where clause
  const where: Prisma.CourseWhereInput = {
    status: 'PUBLISHED',
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (query) {
    // Postgres ILIKE-style search across title, subtitle, description.
    // For real scale, swap to Meilisearch or Algolia (Phase 5+).
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { subtitle: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      where,
      include: { category: true },
      orderBy: { publishedAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ]);

  const activeCategoryName = categories.find((c) => c.slug === categorySlug)?.name;

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="border-b border-ink/10 bg-grid">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10 lg:py-28">
            <div className="eyebrow mb-4">[ Catalog ]</div>
            <h1 className="max-w-3xl font-display text-display-2 font-semibold tracking-tight">
              All tracks. <em className="font-normal italic text-ink-muted">Pick your build.</em>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-ink-muted">
              {courses.length === 0 && (query || categorySlug)
                ? 'No matches yet — try a broader search or different category.'
                : `${courses.length} ${courses.length === 1 ? 'track' : 'tracks'} live across ${categories.length} domains. New tracks ship monthly.`}
            </p>
          </div>
        </section>

        {/* Sticky filter bar */}
        <section className="sticky top-[73px] z-40 border-b border-ink/10 bg-bg/90 backdrop-blur-xl">
          <div className="mx-auto max-w-7xl px-6 py-5 lg:px-10">
            <CoursesFilter
              categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
              initialQuery={query}
              initialCategory={categorySlug}
            />
          </div>
        </section>

        {/* Results */}
        <section className="py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            {/* Result summary */}
            {(query || categorySlug) && (
              <div className="mb-8 flex items-baseline justify-between">
                <div className="font-mono text-xs uppercase tracking-wider text-ink-muted">
                  {courses.length} {courses.length === 1 ? 'result' : 'results'}
                  {query && (
                    <>
                      {' '}for "<span className="text-ink">{query}</span>"
                    </>
                  )}
                  {activeCategoryName && (
                    <>
                      {' '}in <span className="text-ink">{activeCategoryName}</span>
                    </>
                  )}
                </div>
                <Link
                  href="/courses"
                  className="font-mono text-xs uppercase tracking-wider text-ink-subtle hover:text-ink"
                >
                  Reset filters
                </Link>
              </div>
            )}

            {courses.length === 0 ? (
              <EmptyResult hasFilters={!!(query || categorySlug)} />
            ) : (
              <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course, idx) => {
                  const discountPct = course.mrpInPaise > 0
                    ? Math.round((1 - course.priceInPaise / course.mrpInPaise) * 100)
                    : 0;
                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.slug}`}
                      className="group flex flex-col bg-bg transition hover:bg-bg-alt"
                    >
                      {/* Thumbnail */}
                      {course.thumbnailUrl || course.coverImageUrl ? (
                        <div className="relative aspect-video w-full overflow-hidden">
                          <Image
                            src={(course.thumbnailUrl || course.coverImageUrl) as string}
                            alt={course.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 400px"
                            className="object-cover transition group-hover:scale-105"
                            unoptimized
                          />
                        </div>
                      ) : (
                        <div className="flex aspect-video w-full items-center justify-center bg-ink/5">
                          <span className="font-mono text-xs uppercase tracking-widest text-ink-subtle">
                            {course.category.name}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-1 flex-col p-8">
                        <div className="mb-5 flex items-baseline justify-between">
                          <span className="font-mono text-xs text-ink-subtle">
                            {String(idx + 1).padStart(2, '0')} / {course.category.name}
                          </span>
                          <span className="rounded-full border border-ink/20 px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-ink-muted">
                            {course.level.toLowerCase()}
                          </span>
                        </div>
                        <h2 className="font-display text-2xl font-semibold leading-tight tracking-tight transition group-hover:text-accent">
                          {course.title}
                        </h2>
                        {course.subtitle && (
                          <p className="mt-3 text-sm text-ink-muted">{course.subtitle}</p>
                        )}
                        <div className="flex-1" />
                        <div className="mt-6 flex items-end justify-between border-t border-ink/10 pt-4">
                          <div>
                            <div className="font-mono text-xs text-ink-subtle">
                              {formatDuration(course.durationMinutes)} · {course.lessonCount} lessons
                            </div>
                            <div className="mt-1 flex items-baseline gap-2">
                              <span className="font-display text-xl font-semibold">
                                {formatPrice(course.priceInPaise)}
                              </span>
                              {course.mrpInPaise > course.priceInPaise && (
                                <span className="font-mono text-[0.65rem] text-accent">
                                  −{discountPct}%
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xl text-ink transition group-hover:translate-x-1 group-hover:text-accent">→</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function EmptyResult({ hasFilters }: { hasFilters: boolean }) {
  if (hasFilters) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/20 p-16 text-center">
        <div className="eyebrow mb-3">[ No matches ]</div>
        <p className="mb-6 text-ink-muted">
          Try a different keyword or clear the filters to see all tracks.
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent"
        >
          Show all tracks →
        </Link>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-dashed border-ink/20 p-16 text-center">
      <div className="eyebrow mb-3">[ No tracks yet ]</div>
      <p className="text-ink-muted">
        Run <code className="rounded bg-bg-alt px-2 py-0.5 font-mono">npm run db:seed</code> to load sample tracks.
      </p>
    </div>
  );
}
