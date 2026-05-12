import { StaticPageShell } from '@/components/marketing/page-shell';

export const metadata = {
  title: 'Mentors — Unified Automation',
};

export default function MentorsPage() {
  return (
    <StaticPageShell
      eyebrow="Mentors"
      title={
        <>
          Practitioners,
          <br />
          <em className="font-normal italic text-ink-muted">not</em> presenters.
        </>
      }
      subtitle="Every Unified Automation mentor ships embedded firmware, runs SCADA systems, or trains models for a living. They teach what they actually do — not what they remember from a textbook."
    >
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="eyebrow mb-4">[ How mentors work ]</div>
          <div className="mt-4 grid gap-12 lg:grid-cols-2">
            <div className="space-y-5 text-lg leading-relaxed text-ink-muted">
              <p>
                Each track has 2-3 mentors assigned. They run twice-weekly office hours,
                review your project pull requests, and respond to questions in cohort
                Discord within 24 hours.
              </p>
              <p>
                Mentor profiles are visible inside the cohort. We don't list them
                publicly here because most also hold full-time engineering roles and
                prefer not to be cold-pitched.
              </p>
            </div>
            <div className="rounded-2xl border border-ink/15 bg-bg-alt/40 p-8">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                Want to mentor with us?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                If you have 3+ years of relevant industry experience and 4-6 hours a
                week, we'd love to talk. Stipends are competitive; the work is
                meaningful.
              </p>
              <a
                href="mailto:mentors@unifiedautomation.in"
                className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink underline decoration-accent decoration-2 underline-offset-4 hover:text-accent"
              >
                mentors@unifiedautomation.in →
              </a>
            </div>
          </div>
        </div>
      </section>
    </StaticPageShell>
  );
}
