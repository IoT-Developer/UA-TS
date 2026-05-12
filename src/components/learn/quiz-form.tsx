'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuizQuestion {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  // Note: correctOptionId is NOT sent to the client. Server scores attempts.
}

interface Props {
  quizId: string;
  quizTitle: string;
  passingScore: number;
  questions: QuizQuestion[];
  courseSlug: string;
  backHref: string;
}

type Result = {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  passingScore: number;
};

export function QuizForm({
  quizId,
  quizTitle,
  passingScore,
  questions,
  courseSlug,
  backHref,
}: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = questions.every((q) => answers[q.id]);

  async function handleSubmit() {
    if (!allAnswered) {
      setError('Answer every question first.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/lessons/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId,
          answers: Object.entries(answers).map(([questionId, selectedOptionId]) => ({
            questionId,
            selectedOptionId,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setResult(data);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-2xl border-2 border-ink/15 bg-bg p-8 lg:p-12">
        <div className="text-center">
          <div
            className={`mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
              result.passed ? 'bg-accent text-bg' : 'bg-red-100 text-red-700'
            }`}
          >
            {result.passed ? '✓' : '✗'}
          </div>
          <div className="eyebrow mb-3">
            [ {result.passed ? 'Passed' : 'Did not pass'} ]
          </div>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            {result.score}% · {result.correct} / {result.total} correct
          </h2>
          <p className="mt-4 text-base text-ink-muted">
            {result.passed
              ? `Above the ${result.passingScore}% passing threshold.`
              : `You need ${result.passingScore}% to pass. Review the lessons and try again.`}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={backHref}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent"
            >
              Back to course →
            </Link>
            {!result.passed && (
              <button
                type="button"
                onClick={() => {
                  setAnswers({});
                  setResult(null);
                }}
                className="font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
              >
                Retake quiz
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8">
        <div className="eyebrow mb-2">[ Quiz ]</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">{quizTitle}</h1>
        <p className="mt-3 text-sm text-ink-muted">
          {questions.length} questions · {passingScore}% to pass · unlimited attempts
        </p>
      </div>

      {questions.map((q, idx) => (
        <QuestionCard
          key={q.id}
          question={q}
          index={idx + 1}
          selected={answers[q.id]}
          onSelect={(optId) => setAnswers((prev) => ({ ...prev, [q.id]: optId }))}
        />
      ))}

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 font-mono text-xs text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-ink/10 pt-6">
        <Link
          href={backHref}
          className="font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
        >
          ← Back to course
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!allAnswered || submitting}
          className="inline-flex items-center gap-3 rounded-full bg-ink px-7 py-3 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit answers →'}
        </button>
      </div>
    </div>
  );
}

function QuestionCard({
  question,
  index,
  selected,
  onSelect,
}: {
  question: QuizQuestion;
  index: number;
  selected: string | undefined;
  onSelect: (optionId: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8">
      <div className="mb-4 flex items-baseline gap-3">
        <span className="font-mono text-xs text-accent">
          {String(index).padStart(2, '0')}
        </span>
        <h3 className="text-lg font-medium text-ink">{question.text}</h3>
      </div>
      <div className="space-y-2">
        {question.options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <label
              key={opt.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                isSelected
                  ? 'border-accent bg-accent/5'
                  : 'border-ink/15 hover:border-ink/40'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={opt.id}
                checked={isSelected}
                onChange={() => onSelect(opt.id)}
                className="mt-1 accent-accent"
              />
              <span className="text-sm text-ink">{opt.text}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
