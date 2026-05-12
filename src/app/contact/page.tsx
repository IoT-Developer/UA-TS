import { StaticPageShell } from '@/components/marketing/page-shell';

export const metadata = {
  title: 'Contact — Unified Automation',
};

export default function ContactPage() {
  return (
    <StaticPageShell
      eyebrow="Contact"
      title={<>Get in <em className="font-normal italic text-ink-muted">touch</em></>}
      subtitle="Questions about a track, our internships, or partnership opportunities — pick the right channel below."
    >
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-2">
            <ContactCard
              eyebrow="01 / Admissions"
              heading="Course questions"
              body="Not sure which track fits your background? Curious about prerequisites, schedule, or hardware kits? Our admissions team replies on business days within 12 hours."
              email="admissions@unifiedautomation.in"
            />
            <ContactCard
              eyebrow="02 / Support"
              heading="Account & technical"
              body="Trouble signing in, payment issues, video playback problems, or certificate questions. Include screenshots if possible — speeds things up."
              email="support@unifiedautomation.in"
            />
            <ContactCard
              eyebrow="03 / Colleges"
              heading="Institutional partnerships"
              body="Bulk licenses for your department, faculty development programs, custom curricula, or internship pipelines. We work with 40+ engineering colleges across South India."
              email="partnerships@unifiedautomation.in"
            />
            <ContactCard
              eyebrow="04 / Press & media"
              heading="Media inquiries"
              body="Stories about engineering education, student outcomes, or our take on the upskilling space. We respond within 48 hours."
              email="press@unifiedautomation.in"
            />
          </div>
        </div>
      </section>

      {/* Address block */}
      <section className="border-t border-ink/10 bg-bg-alt/40 py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <div className="eyebrow mb-4">[ Office ]</div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                Coimbatore HQ
              </h3>
              <address className="mt-4 not-italic text-ink-muted">
                Unified Automation Pvt Ltd
                <br />
                Coimbatore, Tamil Nadu — 641018
                <br />
                India
              </address>
              <div className="mt-4 font-mono text-sm text-ink-muted">
                +91 XXXXX XXXXX
              </div>
            </div>
            <div>
              <div className="eyebrow mb-4">[ Hours ]</div>
              <h3 className="font-display text-2xl font-semibold tracking-tight">
                Office hours
              </h3>
              <div className="mt-4 space-y-1 font-mono text-sm text-ink-muted">
                <div>Mon – Fri · 09:30 – 18:30 IST</div>
                <div>Sat · 10:00 – 14:00 IST</div>
                <div>Sun · Closed</div>
              </div>
              <p className="mt-6 max-w-md text-sm text-ink-muted">
                Email is our preferred channel — replies arrive faster and we keep a
                complete record of your conversation.
              </p>
            </div>
          </div>
        </div>
      </section>
    </StaticPageShell>
  );
}

function ContactCard({
  eyebrow,
  heading,
  body,
  email,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  email: string;
}) {
  return (
    <div className="bg-bg p-8 lg:p-10">
      <div className="eyebrow mb-3">{eyebrow}</div>
      <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight">
        {heading}
      </h3>
      <p className="mt-4 text-base leading-relaxed text-ink-muted">{body}</p>
      <a
        href={`mailto:${email}`}
        className="mt-6 inline-flex items-center gap-2 font-mono text-sm text-ink underline decoration-accent decoration-2 underline-offset-4 transition hover:text-accent"
      >
        {email} →
      </a>
    </div>
  );
}
