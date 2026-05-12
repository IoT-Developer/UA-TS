import Link from 'next/link';
import { ReactNode } from 'react';

export function AdminPageHeader({
  eyebrow,
  title,
  subtitle,
  action,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-b border-ink/10 bg-bg">
      <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="eyebrow mb-2">[ {eyebrow} ]</div>
            <h1 className="font-display text-3xl font-semibold tracking-tight lg:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm text-ink-muted">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      </div>
    </div>
  );
}

export function MetricCard({
  label,
  value,
  delta,
  href,
}: {
  label: string;
  value: string | number;
  delta?: string;
  href?: string;
}) {
  const body = (
    <div className="bg-bg p-6 transition group-hover:bg-bg-alt">
      <div className="eyebrow mb-3 text-ink-subtle">{label}</div>
      <div className="font-display text-3xl font-semibold leading-none tracking-tight lg:text-4xl">
        {value}
      </div>
      {delta && (
        <div className="mt-3 font-mono text-xs text-ink-muted">{delta}</div>
      )}
    </div>
  );
  if (href) {
    return (
      <Link href={href} className="group block">
        {body}
      </Link>
    );
  }
  return body;
}

export function EmptyState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta?: { href: string; label: string };
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ink/20 bg-bg p-12 text-center">
      <div className="eyebrow mb-3">[ Empty ]</div>
      <h3 className="font-display text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">{body}</p>
      {cta && (
        <Link
          href={cta.href}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent"
        >
          {cta.label} →
        </Link>
      )}
    </div>
  );
}

export function StatusBadge({
  status,
  variant = 'neutral',
}: {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'neutral' | 'accent';
}) {
  const styles: Record<string, string> = {
    success: 'bg-accent/15 text-accent',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-700',
    neutral: 'bg-ink/10 text-ink-muted',
    accent: 'bg-accent text-bg',
  };
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest ${styles[variant]}`}
    >
      {status}
    </span>
  );
}

export function PrimaryButton({
  href,
  children,
  type = 'button',
  disabled,
  onClick,
}: {
  href?: string;
  children: ReactNode;
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
}) {
  const classes =
    'inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed';
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

export function GhostButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink transition hover:border-ink hover:bg-ink hover:text-bg"
    >
      {children}
    </Link>
  );
}
