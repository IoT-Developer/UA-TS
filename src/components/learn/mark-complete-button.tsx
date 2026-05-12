'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  lessonId: string;
  initiallyCompleted: boolean;
  nextLessonHref?: string;
}

export function MarkCompleteButton({
  lessonId,
  initiallyCompleted,
  nextLessonHref,
}: Props) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (completed) {
      // Already done — just navigate to next
      if (nextLessonHref) router.push(nextLessonHref);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/lessons/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, completed: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save progress');
      setCompleted(true);
      router.refresh(); // re-fetch the server data so sidebar shows ✓
      if (nextLessonHref) {
        // Slight delay so the success state is visible
        setTimeout(() => router.push(nextLessonHref), 400);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`inline-flex items-center gap-3 rounded-full px-6 py-3 font-mono text-xs uppercase tracking-widest transition disabled:opacity-50 ${
          completed
            ? 'bg-accent text-ink hover:bg-accent-glow'
            : 'bg-ink text-bg hover:bg-accent'
        }`}
      >
        {loading
          ? 'Saving…'
          : completed
          ? nextLessonHref
            ? 'Completed · Next →'
            : '✓ Completed'
          : nextLessonHref
          ? 'Mark complete & continue →'
          : 'Mark complete'}
      </button>
      {error && <p className="font-mono text-xs text-red-600">{error}</p>}
    </div>
  );
}
