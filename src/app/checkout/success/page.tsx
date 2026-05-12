import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateCurrentUser } from '@/lib/auth';
import { Navbar } from '@/components/marketing/navbar';
import { formatPrice, formatDuration } from '@/lib/utils';

export const metadata = {
  title: 'Enrolled — Unified Automation',
};

interface PageProps {
  searchParams: Promise<{ course?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const { course: courseSlug } = await searchParams;
  if (!courseSlug) redirect('/dashboard');

  const user = await getOrCreateCurrentUser();
  if (!user) redirect('/sign-in');

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      title: true,
      slug: true,
      subtitle: true,
      durationMinutes: true,
      lessonCount: true,
      modules: {
        select: { id: true, title: true, order: true },
        orderBy: { order: 'asc' },
        take: 3,
      },
    },
  });

  if (!course) redirect('/dashboard');

  // Verify the user actually has an enrollment (don't show success to randoms)
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    select: { id: true, enrolledAt: true },
  });
  if (!enrollment) redirect(`/courses/${course.slug}`);

  // Most recent order for this enrollment (for receipt info)
  const order = await prisma.order.findFirst({
    where: { userId: user.id, courseId: course.id, status: 'PAID' },
    orderBy: { createdAt: 'desc' },
    select: {
      finalInPaise: true,
      razorpayPaymentId: true,
      razorpayOrderId: true,
      createdAt: true,
    },
  });

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-ink/10 bg-grid">
          <div className="mx-auto max-w-3xl px-6 py-16 text-center lg:px-10 lg:py-24">
            <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent text-bg">
              <span className="text-2xl">✓</span>
            </div>
            <div className="eyebrow mb-3">[ Enrolled ]</div>
            <h1 className="font-display text-display-2 font-semibold leading-tight tracking-tight">
              You're <em className="font-normal italic text-ink-muted">in</em>.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-muted">
              Welcome to <strong className="text-ink">{course.title}</strong>. Your
              seat is reserved and the full curriculum is unlocked.
            </p>
          </div>
        </section>

        {/* Receipt + next steps */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl space-y-8 px-6 lg:px-10">
            {/* Receipt card */}
            {order && (
              <div className="rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8">
                <div className="eyebrow mb-4">[ Receipt ]</div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReceiptRow label="Course" value={course.title} />
                  <ReceiptRow label="Amount paid" value={formatPrice(order.finalInPaise)} />
                  {order.razorpayPaymentId && (
                    <ReceiptRow label="Payment ID" value={order.razorpayPaymentId} mono />
                  )}
                  <ReceiptRow label="Order ID" value={order.razorpayOrderId} mono />
                  <ReceiptRow
                    label="Date"
                    value={new Intl.DateTimeFormat('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }).format(order.createdAt)}
                  />
                  <ReceiptRow label="Status" value="Paid · Confirmed" highlight />
                </div>
                <p className="mt-6 border-t border-ink/10 pt-4 text-xs text-ink-subtle">
                  Email receipt arrives shortly. Save this page or screenshot for your records.
                </p>
              </div>
            )}

            {/* What's next */}
            <div className="rounded-2xl border border-ink/15 bg-bg-alt/50 p-6 lg:p-8">
              <div className="eyebrow mb-4">[ What's next ]</div>
              <h2 className="font-display text-2xl font-semibold tracking-tight">
                Your first three modules
              </h2>
              <ol className="mt-5 space-y-3">
                {course.modules.map((m, i) => (
                  <li key={m.id} className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-accent">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-ink">{m.title}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex items-center gap-3 border-t border-ink/10 pt-4 font-mono text-xs text-ink-muted">
                <span>{course.lessonCount} lessons</span>
                <span className="h-1 w-1 rounded-full bg-ink-subtle" />
                <span>{formatDuration(course.durationMinutes)}</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/learn/${course.slug}`}
                className="inline-flex items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent"
              >
                Start learning <span>→</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-3 rounded-full border border-ink/20 px-7 py-4 font-mono text-xs uppercase tracking-widest text-ink transition hover:border-ink hover:bg-ink hover:text-bg"
              >
                Go to dashboard
              </Link>
            </div>

            <p className="text-center font-mono text-xs text-ink-subtle">
              Questions about your enrollment?{' '}
              <a href="mailto:support@unifiedautomation.in" className="underline decoration-accent decoration-2 underline-offset-2 hover:text-ink">
                support@unifiedautomation.in
              </a>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

function ReceiptRow({
  label,
  value,
  mono,
  highlight,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">{label}</span>
      <span
        className={`text-sm ${mono ? 'font-mono' : ''} ${highlight ? 'font-semibold text-accent' : 'text-ink'} truncate`}
        title={value}
      >
        {value}
      </span>
    </div>
  );
}
