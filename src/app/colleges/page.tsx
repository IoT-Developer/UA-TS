import Link from 'next/link';
import { StaticPageShell } from '@/components/marketing/page-shell';

export const metadata = {
  title: 'For Colleges — Unified Automation',
};

export default function CollegesPage() {
  return (
    <StaticPageShell
      eyebrow="For colleges"
      title={
        <>
          Bring industry-grade
          <br />
          <em className="font-normal italic text-ink-muted">automation</em> training to your campus.
        </>
      }
      subtitle="Department-wide licenses, faculty development workshops, custom curricula aligned to AICTE/NBA outcomes, and a dedicated success manager. Working with 40+ engineering colleges across South India."
    >
      <section className="border-b border-ink/10 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="eyebrow mb-10">[ Programs ]</div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 lg:grid-cols-3">
            <Tile
              n="01"
              title="Bulk student licenses"
              body="Discounted access to any track for your entire batch. Single-sign-on with college email. Faculty dashboard to monitor progress and completion."
            />
            <Tile
              n="02"
              title="Faculty development"
              body="Train-the-trainer workshops for your faculty in IoT, embedded, and automation. NBA-compliant participation certificates."
            />
            <Tile
              n="03"
              title="Custom curriculum"
              body="Co-developed elective courses mapped to your university's outcome framework. Hardware kits shipped to your lab."
            />
          </div>
        </div>
      </section>

      <section className="bg-ink py-20 text-bg lg:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            Get a partnership proposal
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-bg/70">
            Our partnerships team puts together custom proposals based on your batch
            size, departments involved, and outcome targets. Initial call is 20 minutes.
          </p>
          <Link
            href="mailto:partnerships@unifiedautomation.in"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-mono text-xs uppercase tracking-widest text-ink transition hover:bg-accent-glow"
          >
            Request a proposal <span>→</span>
          </Link>
        </div>
      </section>
    </StaticPageShell>
  );
}

function Tile({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="bg-bg p-8 lg:p-10">
      <div className="font-mono text-xs text-accent">{n}</div>
      <h3 className="mt-4 font-display text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}
