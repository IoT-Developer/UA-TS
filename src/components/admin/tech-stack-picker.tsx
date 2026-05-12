'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  TECH_STACKS,
  CATEGORY_LABELS,
  type TechCategory,
  type StoredTechStack,
} from '@/lib/tech-stacks';
import { ImageUpload } from './image-upload';

interface Props {
  /** Hidden input name for form submission (JSON-stringified array). */
  name: string;
  /** Initial picked stacks. */
  initial: StoredTechStack[];
}

export function TechStackPicker({ name, initial }: Props) {
  const [picked, setPicked] = useState<StoredTechStack[]>(initial);
  const [search, setSearch] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customIconUrl, setCustomIconUrl] = useState<string | null>(null);

  const pickedSlugs = new Set(picked.map((p) => p.slug));

  const filteredAvailable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return TECH_STACKS.filter((t) => {
      if (pickedSlugs.has(t.slug)) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    });
  }, [search, pickedSlugs]);

  function addStack(item: { slug: string; name: string; iconUrl: string }) {
    if (pickedSlugs.has(item.slug)) return;
    setPicked([...picked, { slug: item.slug, name: item.name, iconUrl: item.iconUrl }]);
  }

  function removeStack(slug: string) {
    setPicked(picked.filter((p) => p.slug !== slug));
  }

  function addCustom() {
    if (!customName.trim() || !customIconUrl) return;
    const slug = `custom:${customName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    setPicked([...picked, { slug, name: customName.trim(), iconUrl: customIconUrl }]);
    setCustomName('');
    setCustomIconUrl(null);
    setShowCustom(false);
  }

  // Group available stacks by category
  const grouped = useMemo(() => {
    const groups: Record<string, typeof filteredAvailable> = {};
    for (const item of filteredAvailable) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredAvailable]);

  return (
    <div className="space-y-4">
      {/* Hidden input — submits as JSON */}
      <input type="hidden" name={name} value={JSON.stringify(picked)} />

      {/* Picked chips */}
      {picked.length > 0 && (
        <div>
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-ink-muted">
            Picked ({picked.length})
          </div>
          <div className="flex flex-wrap gap-2 rounded-xl border border-ink/15 bg-bg-alt/40 p-3">
            {picked.map((p) => (
              <div
                key={p.slug}
                className="group flex items-center gap-2 rounded-full border border-ink/20 bg-bg px-3 py-1.5"
              >
                <Image
                  src={p.iconUrl}
                  alt={p.name}
                  width={18}
                  height={18}
                  className="h-4 w-4 object-contain"
                  unoptimized
                />
                <span className="text-sm">{p.name}</span>
                <button
                  type="button"
                  onClick={() => removeStack(p.slug)}
                  className="ml-1 font-mono text-xs text-ink-subtle hover:text-red-600"
                  aria-label={`Remove ${p.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search + custom */}
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tech stack…"
          className="min-w-64 flex-1 rounded-full border border-ink/15 bg-bg px-4 py-2 text-sm focus:border-ink focus:outline-none"
        />
        <button
          type="button"
          onClick={() => setShowCustom((v) => !v)}
          className="rounded-full border border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink-muted hover:border-ink hover:text-ink"
        >
          {showCustom ? 'Cancel custom' : '+ Add custom'}
        </button>
      </div>

      {/* Custom upload form */}
      {showCustom && (
        <div className="space-y-3 rounded-xl border border-ink/15 bg-bg p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-ink-muted">
                Custom name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Our Proprietary SDK"
                className="w-full rounded-xl border border-ink/15 bg-bg px-3 py-2 text-sm focus:border-ink focus:outline-none"
              />
            </div>
            <div>
              <ImageUpload
                value={customIconUrl}
                onUploaded={(url) => setCustomIconUrl(url || null)}
                shape="logo"
                folder="tech-icons"
                label="Custom icon"
                maxSizeMB={1}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={addCustom}
            disabled={!customName.trim() || !customIconUrl}
            className="rounded-full bg-ink px-5 py-2 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add to picked →
          </button>
        </div>
      )}

      {/* Available — grouped by category */}
      <div className="space-y-4 rounded-xl border border-ink/10 bg-bg p-4 max-h-96 overflow-y-auto">
        {Object.keys(grouped).length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-muted">
            No matches.{' '}
            <button
              type="button"
              onClick={() => setSearch('')}
              className="underline hover:text-ink"
            >
              Clear search
            </button>
          </p>
        ) : (
          (Object.keys(grouped) as TechCategory[]).map((cat) => (
            <div key={cat}>
              <div className="mb-2 font-mono text-[0.65rem] uppercase tracking-widest text-ink-subtle">
                {CATEGORY_LABELS[cat] || cat}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {grouped[cat].map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => addStack(item)}
                    className="flex items-center gap-2 rounded-full border border-ink/10 bg-bg-alt/30 px-2.5 py-1.5 text-xs transition hover:border-accent hover:bg-accent/5"
                    title={item.slug}
                  >
                    <Image
                      src={item.iconUrl}
                      alt=""
                      width={16}
                      height={16}
                      className="h-4 w-4 object-contain"
                      unoptimized
                    />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
