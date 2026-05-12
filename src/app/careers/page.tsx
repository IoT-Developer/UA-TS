import { StaticPageShell } from '@/components/marketing/page-shell';

export const metadata = {
  title: 'Careers — Unified Automation',
};

export default function CareersPage() {
  return (
    <StaticPageShell
      eyebrow="Careers"
      title={
        <>
          Build the kind of school
          <br />
          you <em className="font-normal italic text-ink-muted">wish</em> you'd had.
        </>
      }
      subtitle="We're a small team in Coimbatore, hiring deliberately. If teaching engineering well is something you care about, look below."
    >
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="rounded-2xl border border-dashed border-ink/20 p-10 text-center">
            <div className="eyebrow mb-3">[ No open roles right now ]</div>
            <p className="text-lg text-ink-muted">
              We're not actively hiring this quarter, but we keep a short list of
              people we'd love to talk to when we do.
            </p>
            <a
              href="mailto:careers@unifiedautomation.in?subject=Future%20careers%20%E2%80%94%20introduce%20yourself"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent"
            >
              Introduce yourself →
            </a>
          </div>

          <div className="mt-12 space-y-4 text-sm leading-relaxed text-ink-muted">
            <p>
              In your email: tell us what you do now, what you'd want to build here, and
              link to one thing you've made that you're proud of. No CVs needed at this
              stage; we'll ask if relevant.
            </p>
            <p>
              We're especially interested in: instructional designers with EE/ECE
              backgrounds, content producers who can explain hardware visually, and
              full-stack engineers who care about education products.
            </p>
          </div>
        </div>
      </section>
    </StaticPageShell>
  );
}
