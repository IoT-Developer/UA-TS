import { ReactNode } from 'react';
import { Navbar } from './navbar';

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
}

/**
 * Reusable hero strip for legal/static pages.
 * Use inside pages that wrap their own <main>.
 */
export function PageHero({ eyebrow, title, subtitle }: PageHeroProps) {
  return (
    <section className="border-b border-ink/10 bg-grid">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="eyebrow mb-4">[ {eyebrow} ]</div>
        <h1 className="max-w-4xl font-display text-display-2 font-semibold tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Wrapper for prose-heavy pages (legal, about, etc.).
 * Provides good measure and vertical rhythm.
 */
export function ProseSection({ children }: { children: ReactNode }) {
  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-10">
        <div className="prose-content">{children}</div>
      </div>
    </section>
  );
}

/**
 * Standard page chrome: navbar + hero + content area.
 * For pages that don't need the marketing footer.
 */
export function StaticPageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main>
        <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
        {children}
      </main>
    </>
  );
}
