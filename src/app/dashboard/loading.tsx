import { Navbar } from '@/components/marketing/navbar';

export default function DashboardLoading() {
  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-ink/10 bg-grid">
          <div className="mx-auto max-w-7xl px-6 py-12 lg:px-10 lg:py-16">
            <div className="eyebrow mb-3 text-ink-subtle">[ Dashboard ]</div>
            <div className="h-14 w-2/3 max-w-2xl animate-pulse rounded-lg bg-ink/10" />
            <div className="mt-8 flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-4 w-24 animate-pulse rounded bg-ink/10" />
              ))}
            </div>
          </div>
        </section>

        <section className="py-10 lg:py-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="h-48 animate-pulse rounded-2xl bg-ink/10" />
          </div>
        </section>

        <section className="pb-10 lg:pb-14">
          <div className="mx-auto max-w-7xl px-6 lg:px-10">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-ink/15 bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-bg p-6 lg:p-7">
                  <div className="h-3 w-16 animate-pulse rounded bg-ink/10" />
                  <div className="mt-3 h-10 w-12 animate-pulse rounded bg-ink/10" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
