import Link from 'next/link';
import { StaticPageShell } from '@/components/marketing/page-shell';

export const metadata = {
  title: 'Internships — Unified Automation',
};

export default function InternshipsPage() {
  return (
    <StaticPageShell
      eyebrow="Internships"
      title={
        <>
          Real briefs.
          <br />
          <em className="font-normal italic text-ink-muted">Real review.</em> Real letters.
        </>
      }
      subtitle="Our internship programs run alongside the tracks. You ship four mentor-graded projects, get them reviewed via pull request, and walk away with a verifiable internship letter — not a participation badge."
    >
      <section className="border-b border-ink/10 py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="eyebrow mb-10">[ How it works ]</div>
          <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 md:grid-cols-2 lg:grid-cols-4">
            <Step n="01" title="Pick a track" body="Each track has 3-4 internship project briefs aligned to the curriculum." />
            <Step n="02" title="Build & ship" body="Submit code via GitHub. Hardware demos via short video walkthroughs." />
            <Step n="03" title="Mentor review" body="Pull request comments, architecture critique, suggested improvements." />
            <Step n="04" title="Receive letter" body="Verifiable internship completion letter, indexed on our public verify page." />
          </div>
        </div>
      </section>

      {/* Featured briefs */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="eyebrow mb-4">[ Sample briefs ]</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            What you'll actually build
          </h2>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-2">
            <Brief
              tag="IoT TRACK"
              title="Multi-node soil moisture monitor"
              body="Build a network of 5 ESP32 nodes that pump data to a Mosquitto broker, visualize it in Node-RED, and send WhatsApp alerts when any node crosses a threshold."
              skills={['ESP32', 'MQTT', 'Node-RED']}
            />
            <Brief
              tag="EMBEDDED TRACK"
              title="STM32 traffic light controller with FreeRTOS"
              body="Implement a 4-way intersection controller using FreeRTOS tasks, with pedestrian button interrupts and a UART debug interface. Bonus: add CAN bus communication between two boards."
              skills={['STM32', 'FreeRTOS', 'CAN']}
            />
            <Brief
              tag="AUTOMATION TRACK"
              title="Bottle-filling line PLC simulation"
              body="Program a complete bottle-filling SCADA application in TIA Portal: conveyor control, fill-level detection, reject mechanism for under-filled bottles, HMI for operator override."
              skills={['Siemens TIA', 'Ladder', 'SCADA']}
            />
            <Brief
              tag="ML TRACK"
              title="Bearing fault classifier deployed on Pi"
              body="Train a model on the CWRU bearing dataset, optimize it with TensorFlow Lite, deploy to a Raspberry Pi, and demonstrate real-time classification using a USB accelerometer."
              skills={['TF Lite', 'Raspberry Pi', 'Time-series']}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink py-20 text-bg lg:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <div className="eyebrow mb-6 text-bg/60">[ Apply via track enrollment ]</div>
          <h2 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
            Internships are part of every track.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-bg/70">
            Enroll in any track and you're auto-enrolled in its internship program.
            No separate application, no surprise fees.
          </p>
          <Link
            href="/courses"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 font-mono text-xs uppercase tracking-widest text-ink transition hover:bg-accent-glow"
          >
            Browse tracks <span>→</span>
          </Link>
        </div>
      </section>
    </StaticPageShell>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="bg-bg p-8 lg:p-10">
      <div className="font-mono text-xs text-accent">{n}</div>
      <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  );
}

function Brief({
  tag,
  title,
  body,
  skills,
}: {
  tag: string;
  title: string;
  body: string;
  skills: string[];
}) {
  return (
    <div className="bg-bg p-8 lg:p-10">
      <div className="eyebrow mb-3">{tag}</div>
      <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{body}</p>
      <div className="mt-5 flex flex-wrap gap-2">
        {skills.map((s) => (
          <span key={s} className="rounded-full border border-ink/20 px-2.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-ink-muted">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
