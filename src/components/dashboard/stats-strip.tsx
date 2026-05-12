import { formatDuration } from '@/lib/utils';
import type { DashboardStats } from '@/lib/dashboard-data';

export function StatsStrip({ stats }: { stats: DashboardStats }) {
  const items = [
    { label: 'Enrolled', value: String(stats.enrollments) },
    { label: 'Lessons done', value: String(stats.lessonsCompleted) },
    { label: 'Time invested', value: formatDuration(stats.minutesWatched) },
    { label: 'Certificates', value: String(stats.certificates) },
  ];

  return (
    <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-bg p-6 lg:p-7">
          <div className="eyebrow mb-2 text-ink-subtle">{item.label}</div>
          <div className="font-display text-3xl font-semibold leading-none tracking-tight lg:text-4xl">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
