import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-ink/10">
      {/* Dotted grid background */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Schematic decoration: vertical rule on the right */}
      <div className="pointer-events-none absolute right-10 top-0 hidden h-full w-px bg-ink/15 lg:block" />
      <div className="pointer-events-none absolute right-10 top-1/3 hidden h-3 w-3 -translate-x-1/2 rounded-full border border-ink/30 bg-bg lg:block" />

      <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
        {/* Eyebrow row */}
        <div className="mb-10 flex flex-wrap items-center gap-x-6 gap-y-2 opacity-0 animate-fade-up">
          <span className="eyebrow">[Cohort 04 / Open]</span>
          <span className="hidden h-1 w-1 rounded-full bg-ink-subtle md:block" />
          <span className="eyebrow">Coimbatore · Hybrid</span>
          <span className="hidden h-1 w-1 rounded-full bg-ink-subtle md:block" />
          <span className="eyebrow">Next intake — Jun 03</span>
        </div>

        {/* Display headline */}
        <h1 className="max-w-5xl font-display text-display-1 font-semibold leading-[0.95] tracking-tight">
          <span className="block opacity-0 animate-fade-up delay-100">
            Engineering,
          </span>
          <span className="block opacity-0 animate-fade-up delay-200">
            <em className="font-normal italic text-ink-muted">trained</em>
          </span>
          <span className="block opacity-0 animate-fade-up delay-300">
            <span className="underline-accent">differently.</span>
          </span>
        </h1>

        {/* Two-column body: left = sub copy + CTAs, right = stats */}
        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="max-w-xl text-lg leading-relaxed text-ink-muted opacity-0 animate-fade-up delay-400 md:text-xl">
              Project-based tracks in industrial IoT, embedded systems, automation,
              and applied ML — taught through real hardware, simulators, and shipped
              code. No slide-deck theatre. No filler certificates.
            </p>

            <div className="mt-10 flex flex-col gap-3 opacity-0 animate-fade-up delay-500 sm:flex-row">
              <Link
                href="/courses"
                className="group inline-flex items-center justify-between gap-3 rounded-full bg-ink px-7 py-4 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent"
              >
                <span>Browse 12 tracks</span>
                <span className="transition group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="#how"
                className="group inline-flex items-center justify-center gap-3 rounded-full border border-ink/20 px-7 py-4 font-mono text-xs uppercase tracking-widest text-ink transition hover:border-ink hover:bg-ink hover:text-bg"
              >
                <span>How it works</span>
              </Link>
            </div>
          </div>

          {/* Stat block — schematic style */}
          <div className="opacity-0 animate-fade-up delay-500 lg:col-span-5 lg:pl-10">
            <div className="relative border-l border-ink/15 pl-8">
              <Stat label="Hands-on hours per track" value="120+" caption="vs ~20 in typical online courses" />
              <Stat label="Project portfolio on completion" value="04" caption="GitHub-documented, mentor-reviewed" />
              <Stat label="Last cohort placement assist" value="78%" caption="Includes referral and resume support" />
            </div>
          </div>
        </div>

        {/* Bottom credit strip */}
        <div className="mt-20 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-ink/10 pt-6">
          <span className="eyebrow text-ink-subtle">Built around real hardware</span>
          <span className="font-mono text-xs text-ink">ESP32</span>
          <span className="font-mono text-xs text-ink">STM32F4</span>
          <span className="font-mono text-xs text-ink">Siemens S7-1200</span>
          <span className="font-mono text-xs text-ink">Raspberry Pi</span>
          <span className="font-mono text-xs text-ink">TIA Portal</span>
          <span className="font-mono text-xs text-ink">Node-RED</span>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div className="mb-8 last:mb-0">
      <div className="eyebrow mb-1.5">{label}</div>
      <div className="font-display text-5xl font-semibold leading-none tracking-tight">
        {value}
      </div>
      <div className="mt-2 max-w-xs text-sm text-ink-muted">{caption}</div>
    </div>
  );
}
