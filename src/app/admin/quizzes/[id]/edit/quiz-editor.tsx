'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  updateQuizMeta,
  addQuestion,
  deleteQuestion,
  deleteQuiz,
  type QuizActionState,
} from '../../actions';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

interface QuizData {
  id: string;
  title: string;
  passingScore: number;
  questions: Question[];
}

export function QuizEditor({ quiz }: { quiz: QuizData }) {
  return (
    <div className="space-y-6">
      <MetaForm quiz={quiz} />
      <QuestionsList quizId={quiz.id} questions={quiz.questions} />
      <AddQuestionForm quizId={quiz.id} />
      <DangerZone quizId={quiz.id} />
    </div>
  );
}

/* ------------- Meta ------------- */

function MetaForm({ quiz }: { quiz: QuizData }) {
  const [state, action] = useActionState<QuizActionState, FormData>(updateQuizMeta, {});
  const errors = state.errors || {};

  return (
    <form action={action} className="rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8" noValidate>
      <input type="hidden" name="quizId" value={quiz.id} />
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">Quiz settings</h2>
        <div className="flex items-center gap-3">
          {state.success && (
            <span className="font-mono text-xs text-accent">✓ {state.message}</span>
          )}
          {errors._form && (
            <span className="font-mono text-xs text-red-600">{errors._form}</span>
          )}
          <SaveButton />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-ink-muted">
            Title
          </label>
          <input
            type="text"
            name="title"
            defaultValue={quiz.title}
            required
            maxLength={120}
            className={cls(!!errors.title)}
          />
          {errors.title && <p className="mt-1 font-mono text-xs text-red-600">→ {errors.title}</p>}
        </div>
        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-ink-muted">
            Passing %
          </label>
          <input
            type="number"
            name="passingScore"
            min={0}
            max={100}
            defaultValue={quiz.passingScore}
            required
            className={cls(!!errors.passingScore)}
          />
          {errors.passingScore && (
            <p className="mt-1 font-mono text-xs text-red-600">→ {errors.passingScore}</p>
          )}
        </div>
      </div>
    </form>
  );
}

/* ------------- Question list ------------- */

function QuestionsList({ quizId, questions }: { quizId: string; questions: Question[] }) {
  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ink/15 bg-bg p-8 text-center">
        <div className="eyebrow mb-2">[ Empty ]</div>
        <p className="text-sm text-ink-muted">Add your first question below.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8">
      <h2 className="font-display text-lg font-semibold tracking-tight">
        Questions ({questions.length})
      </h2>
      <ul className="divide-y divide-ink/5">
        {questions.map((q, idx) => (
          <QuestionRow key={q.id} question={q} index={idx + 1} />
        ))}
      </ul>
    </div>
  );
}

function QuestionRow({ question, index }: { question: Question; index: number }) {
  const [state, action] = useActionState<QuizActionState, FormData>(deleteQuestion, {});
  const correctOption = question.options.find((o) => o.id === question.correctOptionId);

  return (
    <li className="py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-xs text-accent">
              {String(index).padStart(2, '0')}
            </span>
            <span className="text-sm font-medium text-ink">{question.text}</span>
          </div>
          <ul className="mt-2 ml-8 space-y-1">
            {question.options.map((opt) => (
              <li
                key={opt.id}
                className={`flex items-center gap-2 text-xs ${
                  opt.id === question.correctOptionId
                    ? 'font-medium text-accent'
                    : 'text-ink-muted'
                }`}
              >
                <span className="font-mono uppercase">[{opt.id}]</span>
                {opt.text}
                {opt.id === question.correctOptionId && (
                  <span className="font-mono">✓</span>
                )}
              </li>
            ))}
          </ul>
          {!correctOption && (
            <p className="mt-1 ml-8 font-mono text-xs text-red-600">
              ⚠ correctOptionId doesn't match any option
            </p>
          )}
        </div>
        <form action={action}>
          <input type="hidden" name="questionId" value={question.id} />
          <DeleteIcon />
        </form>
      </div>
      {state.errors?._form && (
        <p className="ml-8 mt-1 font-mono text-xs text-red-600">{state.errors._form}</p>
      )}
    </li>
  );
}

/* ------------- Add question form ------------- */

function AddQuestionForm({ quizId }: { quizId: string }) {
  const [state, action] = useActionState<QuizActionState, FormData>(addQuestion, {});
  const [resetKey, setResetKey] = useState(0);
  const errors = state.errors || {};

  // Reset form on success
  if (state.success && state.message && resetKey === 0) {
    // single-shot reset
  }

  return (
    <form
      key={resetKey}
      action={async (fd) => {
        await action(fd);
        setResetKey((k) => k + 1);
      }}
      className="rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8"
      noValidate
    >
      <input type="hidden" name="quizId" value={quizId} />
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">Add question</h2>
        {state.success && (
          <span className="font-mono text-xs text-accent">✓ {state.message}</span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-ink-muted">
            Question
          </label>
          <textarea
            name="text"
            rows={2}
            required
            placeholder="What does PLC stand for?"
            className={`${cls(!!errors.text)} resize-y`}
          />
          {errors.text && <p className="mt-1 font-mono text-xs text-red-600">→ {errors.text}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <OptionField name="optionA" letter="A" required error={errors.optionA} />
          <OptionField name="optionB" letter="B" required error={errors.optionB} />
          <OptionField name="optionC" letter="C" error={errors.optionC} />
          <OptionField name="optionD" letter="D" error={errors.optionD} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-ink-muted">
              Correct answer
            </label>
            <select name="correct" required defaultValue="" className={cls(!!errors.correct)}>
              <option value="" disabled>— Pick —</option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>
            {errors.correct && (
              <p className="mt-1 font-mono text-xs text-red-600">→ {errors.correct}</p>
            )}
          </div>
          <div>
            <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-ink-muted">
              Explanation (optional)
            </label>
            <input
              type="text"
              name="explanation"
              placeholder="Why this answer is correct"
              className={cls(false)}
            />
          </div>
        </div>

        {errors._form && (
          <p className="font-mono text-xs text-red-600">→ {errors._form}</p>
        )}

        <div className="flex justify-end border-t border-ink/10 pt-4">
          <AddButton />
        </div>
      </div>
    </form>
  );
}

function OptionField({
  name,
  letter,
  required,
  error,
}: {
  name: string;
  letter: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label className="mb-2 flex items-baseline gap-2 font-mono text-xs uppercase tracking-widest text-ink-muted">
        <span className="text-accent">{letter}</span>
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="text"
        name={name}
        required={required}
        placeholder={`Option ${letter}`}
        className={cls(!!error)}
      />
      {error && <p className="mt-1 font-mono text-xs text-red-600">→ {error}</p>}
    </div>
  );
}

/* ------------- Danger zone ------------- */

function DangerZone({ quizId }: { quizId: string }) {
  const [state, action] = useActionState<QuizActionState, FormData>(deleteQuiz, {});
  return (
    <form
      action={action}
      className="rounded-2xl border border-red-300 bg-red-50/30 p-6 lg:p-8"
    >
      <input type="hidden" name="quizId" value={quizId} />
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight">Delete quiz</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Removes the quiz and all its questions. Past attempts remain in the database.
          </p>
        </div>
        <button
          type="submit"
          onClick={(e) => {
            if (!confirm('Delete this quiz and all its questions?')) e.preventDefault();
          }}
          className="rounded-full border border-red-300 bg-red-50 px-5 py-2 font-mono text-xs uppercase tracking-widest text-red-700 hover:bg-red-600 hover:text-bg"
        >
          Delete quiz
        </button>
      </div>
      {state.errors?._form && (
        <p className="mt-3 font-mono text-xs text-red-600">{state.errors._form}</p>
      )}
    </form>
  );
}

/* ------------- Helpers ------------- */

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-5 py-2 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent disabled:opacity-50"
    >
      {pending ? '…' : 'Save'}
    </button>
  );
}

function AddButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent disabled:opacity-50"
    >
      {pending ? 'Adding…' : '+ Add question'}
    </button>
  );
}

function DeleteIcon() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm('Delete this question?')) e.preventDefault();
      }}
      className="font-mono text-xs uppercase tracking-wider text-ink-subtle hover:text-red-600"
    >
      ×
    </button>
  );
}

function cls(hasError: boolean) {
  return `w-full rounded-xl border bg-bg px-4 py-2.5 text-sm focus:outline-none ${
    hasError ? 'border-red-500 focus:border-red-600' : 'border-ink/20 focus:border-ink'
  }`;
}
