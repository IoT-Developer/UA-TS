import Link from 'next/link';

export function CtaFooter() {
  return (
    <>
      {/* Final CTA — dark inversion */}
      <section className="relative overflow-hidden bg-ink py-24 text-bg lg:py-32">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(244,241,234,0.4) 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-10">
          <div className="eyebrow mb-6 text-bg/60">[ Cohort 04 / Closes May 25 ]</div>
          <h2 className="mx-auto max-w-3xl font-display text-display-2 font-semibold tracking-tight">
            Ready to build something
            {' '}
            <em className="font-normal italic text-accent">recruiters notice?</em>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-bg/70">
            64 seats per cohort. We keep it small so mentors can actually mentor.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/sign-up"
              className="group inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 font-mono text-xs uppercase tracking-widest text-ink transition hover:bg-accent-glow"
            >
              <span>Reserve a seat</span>
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/courses"
              className="font-mono text-xs uppercase tracking-widest text-bg/60 transition hover:text-bg"
            >
              Browse tracks first
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-alt/60 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <span className="font-display text-2xl font-semibold tracking-tight">
                Unified<span className="text-accent">/</span>Automation
              </span>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-muted">
                Engineering education built around real hardware, real code, and real review.
                Coimbatore-headquartered. Cohorts run hybrid.
              </p>
              <div className="mt-6 eyebrow text-ink-subtle">
                Coimbatore, Tamil Nadu — IN
              </div>
            </div>

            <FooterCol
              heading="Learn"
              links={[
                { label: 'All tracks', href: '/courses' },
                { label: 'Internships', href: '/internships' },
                { label: 'For colleges', href: '/colleges' },
                { label: 'Verify certificate', href: '/verify' },
              ]}
            />
            <FooterCol
              heading="Company"
              links={[
                { label: 'About', href: '/about' },
                { label: 'Mentors', href: '/mentors' },
                { label: 'Careers', href: '/careers' },
                { label: 'Contact', href: '/contact' },
              ]}
            />
            <FooterCol
              heading="Legal"
              links={[
                { label: 'Terms', href: '/terms' },
                { label: 'Privacy', href: '/privacy' },
                { label: 'Refund policy', href: '/refunds' },
              ]}
            />
          </div>

          <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-ink/10 pt-8 md:flex-row md:items-center">
            <span className="font-mono text-xs text-ink-subtle">
              © {new Date().getFullYear()} Unified Automation Pvt Ltd. All rights reserved.
            </span>
            <span className="font-mono text-xs text-ink-subtle">
              v0.1.0 · Built in Coimbatore
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}

function FooterCol({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="lg:col-span-2">
      <div className="eyebrow mb-4">{heading}</div>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-sm text-ink-muted transition hover:text-ink"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
