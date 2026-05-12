'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useTransition } from 'react';

interface Category {
  slug: string;
  name: string;
}

interface Props {
  categories: Category[];
  initialQuery: string;
  initialCategory: string;
}

export function CoursesFilter({ categories, initialQuery, initialCategory }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [query, setQuery] = useState(initialQuery);
  const activeCategory = initialCategory;

  // Debounce search input — update URL 300ms after typing stops
  useEffect(() => {
    if (query === initialQuery) return; // skip on first mount
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('q', query.trim());
      } else {
        params.delete('q');
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
    }, 300);
    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function setCategory(slug: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('cat', slug);
    } else {
      params.delete('cat');
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink-subtle"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tracks (e.g. STM32, MQTT, ladder logic)…"
          className="w-full rounded-full border border-ink/20 bg-bg py-3.5 pl-12 pr-5 text-sm text-ink placeholder:text-ink-subtle focus:border-ink focus:outline-none"
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs uppercase tracking-wider text-ink-subtle hover:text-ink"
            aria-label="Clear search"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip
          active={!activeCategory}
          onClick={() => setCategory(null)}
        >
          All tracks
        </Chip>
        {categories.map((cat) => (
          <Chip
            key={cat.slug}
            active={activeCategory === cat.slug}
            onClick={() => setCategory(cat.slug)}
          >
            {cat.name}
          </Chip>
        ))}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
        active
          ? 'border-ink bg-ink text-bg'
          : 'border-ink/20 bg-bg text-ink-muted hover:border-ink hover:text-ink'
      }`}
    >
      {children}
    </button>
  );
}
