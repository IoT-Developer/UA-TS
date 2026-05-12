import Link from 'next/link';
import Image from 'next/image';
import { formatDuration, formatRelativeTime } from '@/lib/utils';

interface EnrollmentCard {
  id: string;
  progressPct: number;
  course: {
    slug: string;
    title: string;
    durationMinutes: number;
    thumbnailUrl: string | null;
    coverImageUrl: string | null;
    category: { name: string } | null;
  };
}

export function EnrollmentsGrid({ enrollments }: { enrollments: EnrollmentCard[] }) {
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-2">
      {enrollments.map((e) => {
        const img = e.course.thumbnailUrl || e.course.coverImageUrl;
        return (
          <Link
            key={e.id}
            href={`/learn/${e.course.slug}`}
            className="group flex flex-col bg-bg transition hover:bg-bg-alt"
          >
            {img ? (
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={img}
                  alt={e.course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover transition group-hover:scale-105"
                  unoptimized
                />
              </div>
            ) : null}
            <div className="flex flex-1 flex-col p-7 lg:p-8">
              <div className="mb-4 flex items-baseline justify-between">
                <span className="font-mono text-xs text-ink-subtle">
                  {e.course.category?.name || 'Track'}
                </span>
                <span className="font-mono text-xs text-ink">{e.progressPct}%</span>
              </div>
              <h3 className="font-display text-xl font-semibold leading-tight tracking-tight transition group-hover:text-accent">
                {e.course.title}
              </h3>
              <div className="flex-1" />
              <div className="mt-6">
                <div className="h-1 overflow-hidden rounded-full bg-bg-alt">
                  <div
                    className="h-full bg-accent transition-all"
                    style={{ width: `${e.progressPct}%` }}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between font-mono text-xs text-ink-subtle">
                  <span>{formatDuration(e.course.durationMinutes)} total</span>
                  <span className="transition group-hover:translate-x-1 group-hover:text-accent">→</span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

interface SuggestedTrack {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: { name: string };
}

export function SuggestedTracks({ tracks }: { tracks: SuggestedTrack[] }) {
  if (tracks.length === 0) return null;
  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-3">
      {tracks.map((t, idx) => (
        <Link
          key={t.id}
          href={`/courses/${t.slug}`}
          className="group flex flex-col bg-bg p-6 transition hover:bg-bg-alt lg:p-7"
        >
          <div className="eyebrow mb-3">
            {String(idx + 1).padStart(2, '0')} / {t.category.name}
          </div>
          <h3 className="font-display text-lg font-semibold leading-tight tracking-tight transition group-hover:text-accent">
            {t.title}
          </h3>
          {t.subtitle && (
            <p className="mt-2 text-sm text-ink-muted line-clamp-2">{t.subtitle}</p>
          )}
          <div className="flex-1" />
          <div className="mt-5 font-mono text-xs uppercase tracking-wider text-ink-muted transition group-hover:text-accent">
            View track →
          </div>
        </Link>
      ))}
    </div>
  );
}

interface ActivityItem {
  id: string;
  completed: boolean;
  watchedSeconds: number;
  lastAccessAt: Date;
  lesson: {
    title: string;
    module: {
      course: { title: string; slug: string };
    };
  };
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-ink/15">
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`flex items-start justify-between gap-4 bg-bg p-5 ${
            i < items.length - 1 ? 'border-b border-ink/10' : ''
          }`}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-ink-subtle">
                {item.completed ? '✓' : '▶'}
              </span>
              <Link
                href={`/learn/${item.lesson.module.course.slug}`}
                className="truncate font-medium text-ink hover:text-accent"
              >
                {item.lesson.title}
              </Link>
            </div>
            <div className="ml-6 mt-1 truncate text-sm text-ink-muted">
              {item.lesson.module.course.title}
            </div>
          </div>
          <div className="shrink-0 font-mono text-xs text-ink-subtle">
            {formatRelativeTime(item.lastAccessAt)}
          </div>
        </div>
      ))}
    </div>
  );
}
