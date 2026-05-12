import Link from 'next/link';
import { StaticPageShell } from '@/components/marketing/page-shell';

export const metadata = {
  title: 'About — Unified Automation',
};

export default function AboutPage() {
  return (
    <StaticPageShell
      eyebrow="About"
      title={
        <>
          We teach engineering the way it's
          <br />
          <em className="font-normal italic text-ink-muted">actually practiced</em>.
        </>
      }
    >
      {/* Mission section */}
      <section className="border-b border-ink/10 py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <div className="eyebrow mb-4">[01] / Our position</div>
              <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
                Indian engineering students don't have a learning gap.
                <br />
                They have an <em className="font-normal italic text-ink-muted">application</em> gap.
              </h2>
            </div>
            <div className="lg:col-span-7 lg:pl-8">
              <div className="space-y-5 text-lg leading-relaxed text-ink-muted">
                <p>
                  After 4 years of college, most engineering graduates can derive Maxwell's
                  equations but have never wired up a working sensor network. They can write
                  bubble sort from memory but have never deployed code to a production
                  microcontroller. They have textbooks of theory and zero shipped projects.
                </p>
                <p>
                  That gap is what makes them feel "unemployable" — not a lack of intelligence,
                  curiosity, or ambition. It's a system problem, and it's what we exist to fix.
                </p>
                <p>
                  Unified Automation is a project-based engineering school. Every track ends
                  with code on your GitHub, hardware demos you can show recruiters, and
                  feedback from mentors who actually build things for a living.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats grid */}
      <section className="border-b border-ink/10 bg-bg-alt/40 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="eyebrow mb-10">[02] / By the numbers</div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
            <Stat n="2,400+" label="Students taught" />
            <Stat n="120+" label="Hours of hands-on per track" />
            <Stat n="78%" label="Last cohort placement assist rate" />
            <Stat n="04" label="Mentor-reviewed projects per track" />
          </div>
        </div>
      </section>

      {/* Story / origin */}
      <section className="border-b border-ink/10 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <div className="eyebrow mb-4">[03] / Origin</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            Started in a Coimbatore garage. Stayed there.
          </h2>
          <div className="mt-8 space-y-5 text-lg leading-relaxed text-ink-muted">
            <p>
              Unified Automation grew out of weekend workshops we ran for engineering
              students who would email us asking how we got into industrial automation
              and embedded work. We kept hearing the same thing: "My college doesn't
              teach this. YouTube is too scattered. Online courses just lecture at me."
            </p>
            <p>
              So we started shipping cohorts. Real hardware. Mentor reviews. Final
              projects that recruiters actually look at. We're still small, still based
              in Coimbatore, and still teaching the same way the founding team learned —
              by building things that broke until they didn't.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-20 text-bg lg:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            Ready to start building?
          </h2>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-mono text-xs uppercase tracking-widest text-ink transition hover:bg-accent-glow"
            >
              Browse tracks <span>→</span>
            </Link>
            <Link
              href="/contact"
              className="font-mono text-xs uppercase tracking-widest text-bg/60 transition hover:text-bg"
            >
              Talk to a mentor
            </Link>
          </div>
        </div>
      </section>
    </StaticPageShell>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="bg-bg p-8 lg:p-10">
      <div className="font-display text-5xl font-semibold leading-none tracking-tight">
        {n}
      </div>
      <div className="mt-3 font-mono text-xs uppercase tracking-wider text-ink-muted">
        {label}
      </div>
    </div>
  );
}
