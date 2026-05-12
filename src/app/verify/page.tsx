import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { StaticPageShell } from '@/components/marketing/page-shell';

export const metadata = {
  title: 'Verify Certificate — Unified Automation',
};

interface PageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function VerifyPage({ searchParams }: PageProps) {
  const { id } = await searchParams;
  const trimmedId = id?.trim().toUpperCase() || '';

  const certificate = trimmedId
    ? await prisma.certificate.findUnique({
        where: { certificateNo: trimmedId },
        include: {
          user: { select: { name: true } },
          course: { select: { title: true, slug: true } },
        },
      })
    : null;

  return (
    <StaticPageShell
      eyebrow="Verify"
      title={
        <>
          Certificate
          <br />
          <em className="font-normal italic text-ink-muted">verification</em>
        </>
      }
      subtitle="Recruiters: every Unified Automation certificate has a unique ID printed on the document. Enter it below to confirm authenticity."
    >
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-2xl px-6 lg:px-10">
          {/* Search form */}
          <form method="GET" className="rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8">
            <label htmlFor="cert-id" className="eyebrow mb-3 block">
              Certificate ID
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                id="cert-id"
                name="id"
                type="text"
                defaultValue={trimmedId}
                placeholder="UA-2026-A8X3K9"
                className="flex-1 rounded-full border border-ink/20 bg-bg px-5 py-3 font-mono text-sm uppercase tracking-wider placeholder:text-ink-subtle focus:border-ink focus:outline-none"
                autoComplete="off"
                required
              />
              <button
                type="submit"
                className="rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent"
              >
                Verify
              </button>
            </div>
          </form>

          {/* Result */}
          {trimmedId && (
            <div className="mt-8">
              {certificate ? (
                <div className="rounded-2xl border-2 border-accent bg-bg p-8">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-bg">
                      ✓
                    </span>
                    <span className="font-mono text-xs uppercase tracking-widest text-accent">
                      Verified · Authentic
                    </span>
                  </div>
                  <div className="space-y-4 border-t border-ink/10 pt-4">
                    <Field label="Holder" value={certificate.user.name || 'Anonymous'} />
                    <Field label="Track" value={certificate.course.title} />
                    <Field
                      label="Issued"
                      value={new Intl.DateTimeFormat('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }).format(certificate.issuedAt)}
                    />
                    <Field label="Certificate ID" value={certificate.certificateNo} mono />
                  </div>
                  <Link
                    href={`/courses/${certificate.course.slug}`}
                    className="mt-6 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
                  >
                    View track details →
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-ink/30 bg-bg p-8">
                  <div className="mb-3 font-mono text-xs uppercase tracking-widest text-ink-muted">
                    Not found
                  </div>
                  <p className="text-base text-ink-muted">
                    No certificate matches the ID{' '}
                    <code className="rounded bg-bg-alt px-2 py-0.5 font-mono">{trimmedId}</code>.
                  </p>
                  <p className="mt-3 text-sm text-ink-subtle">
                    Double-check for typos. IDs are case-insensitive and follow the format{' '}
                    <code className="font-mono">UA-YYYY-XXXXXX</code>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Help text */}
          <div className="mt-12 border-t border-ink/10 pt-8 text-sm text-ink-muted">
            <p>
              Suspect a forged certificate? Email{' '}
              <a
                href="mailto:verify@unifiedautomation.in"
                className="text-ink underline decoration-accent decoration-2 underline-offset-2 hover:text-accent"
              >
                verify@unifiedautomation.in
              </a>{' '}
              with the certificate image. We respond within one business day.
            </p>
          </div>
        </div>
      </section>
    </StaticPageShell>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="font-mono text-xs uppercase tracking-wider text-ink-subtle">
        {label}
      </span>
      <span className={mono ? 'font-mono text-sm' : 'font-medium text-ink'}>
        {value}
      </span>
    </div>
  );
}
