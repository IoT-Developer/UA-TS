import Link from 'next/link';

interface Webinar {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  joinUrl: string;
  status: string;
  course: { title: string; slug: string } | null;
}

export function UpcomingWebinars({ webinars }: { webinars: Webinar[] }) {
  if (webinars.length === 0) return null;

  return (
    <section className="border-t border-ink/10 bg-bg-alt/40 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-6 flex items-baseline justify-between">
          <div>
            <div className="eyebrow mb-2">[ Live sessions ]</div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Upcoming webinars
            </h2>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 md:grid-cols-2">
          {webinars.map((w) => (
            <WebinarCard key={w.id} webinar={w} />
          ))}
        </div>
      </div>
    </section>
  );
}

function WebinarCard({ webinar: w }: { webinar: Webinar }) {
  const startMs = w.scheduledAt.getTime();
  const endMs = startMs + w.durationMinutes * 60_000;
  const now = Date.now();
  const minsUntil = Math.round((startMs - now) / 60_000);

  // Show "Join now" button if:
  //  - status is LIVE, OR
  //  - we're within 15 min before scheduled start AND not past end
  const joinable =
    w.status === 'LIVE' || (now >= startMs - 15 * 60_000 && now < endMs);

  // Live label if we're between start and end
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
          <span className="truncate font-mono text-xs text-ink-subtle">
            {w.course.title}
          </span>
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
          {new Intl.DateTimeFormat('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          }).format(w.scheduledAt)}
        </span>
        <span>
          {new Intl.DateTimeFormat('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          }).format(w.scheduledAt)}{' '}
          IST
        </span>
        <span>· {w.durationMinutes} min</span>
        {!isLiveNow && minsUntil > 0 && minsUntil < 60 * 24 && (
          <span className="text-accent">in {minsUntil < 60 ? `${minsUntil}m` : `${Math.round(minsUntil / 60)}h`}</span>
        )}
      </div>

      <div className="mt-5">
        {joinable ? (
          <a
            href={w.joinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-ink transition hover:bg-accent-glow"
          >
            {isLiveNow ? 'Join now' : 'Join (opens 15 min before)'} <span>↗</span>
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
