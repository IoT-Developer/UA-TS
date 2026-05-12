export function WhyUs() {
  const pillars = [
    {
      number: '01',
      title: 'Hardware first, theory second',
      body: 'You touch real boards by week one. ESP32, STM32, PLC trainers — shipped to you, or run on simulator if remote. Theory is taught when it unblocks the build.',
    },
    {
      number: '02',
      title: 'Mentors who actually build things',
      body: 'No professional explainers. Every mentor ships embedded firmware, runs SCADA systems, or trains models for a living. Office hours twice weekly.',
    },
    {
      number: '03',
      title: 'GitHub-graded internship',
      body: 'Final track project goes through real code review. Pull-request comments. Architecture critique. The kind of feedback that makes you employable.',
    },
    {
      number: '04',
      title: 'Verifiable certificate, not a participation badge',
      body: 'Every certificate has a public URL anyone can check. Recruiters see your projects, your code, your reviews — not just a logo on a PDF.',
    },
  ];

  return (
    <section className="relative border-b border-ink/10 py-24 lg:py-32" id="how">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mb-16 grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <div className="eyebrow mb-4">[03] / How we're different</div>
            <h2 className="font-display text-display-2 font-semibold tracking-tight">
              Most "edtech" sells you slides.
              <br />
              <em className="font-normal italic text-ink-muted">We hand you tools.</em>
            </h2>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden border border-ink/15 bg-ink/15 sm:grid-cols-2">
          {pillars.map((p) => (
            <div key={p.number} className="bg-bg p-8 lg:p-12">
              <div className="mb-6 flex items-center gap-4">
                <span className="font-mono text-2xl text-accent">{p.number}</span>
                <span className="h-px flex-1 bg-ink/15" />
              </div>
              <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight lg:text-3xl">
                {p.title}
              </h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-ink-muted">
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
