'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  createModule,
  createLesson,
  deleteModule,
  deleteLesson,
  type CourseActionState,
} from '../../actions';
import { createQuiz, type QuizActionState } from '@/app/admin/quizzes/actions';

interface Lesson {
  id: string;
  title: string;
  type: string;
  videoId: string | null;
  durationSeconds: number;
  isFreePreview: boolean;
  order: number;
}

interface ModuleQuiz {
  id: string;
  title: string;
  _count: { questions: number };
}

interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
  quizzes: ModuleQuiz[];
}

export function ModulesEditor({
  courseId,
  modules,
}: {
  courseId: string;
  modules: Module[];
}) {
  return (
    <section className="rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8">
      <header className="mb-6 flex items-center justify-between border-b border-ink/10 pb-4">
        <h2 className="font-display text-xl font-semibold tracking-tight">Curriculum</h2>
        <span className="font-mono text-xs text-ink-muted">
          {modules.length} {modules.length === 1 ? 'module' : 'modules'} ·{' '}
          {modules.reduce((sum, m) => sum + m.lessons.length, 0)} lessons
        </span>
      </header>

      <div className="space-y-4">
        {modules.length === 0 && (
          <p className="rounded-xl border border-dashed border-ink/15 p-6 text-center text-sm text-ink-muted">
            No modules yet. Add the first one below.
          </p>
        )}
        {modules.map((mod, idx) => (
          <ModuleCard key={mod.id} module={mod} index={idx + 1} />
        ))}

        <AddModuleForm courseId={courseId} />
      </div>
    </section>
  );
}

/* ---------------- Module ---------------- */

function ModuleCard({ module: mod, index }: { module: Module; index: number }) {
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [deleteState, deleteAction] = useActionState<CourseActionState, FormData>(
    deleteModule,
    {}
  );

  return (
    <div className="overflow-hidden rounded-xl border border-ink/15">
      <header className="flex items-center justify-between bg-bg-alt/60 px-5 py-3">
        <h3 className="font-display text-base font-semibold tracking-tight">
          <span className="mr-3 font-mono text-xs text-accent">{String(index).padStart(2, '0')}</span>
          {mod.title}
        </h3>
        <form action={deleteAction}>
          <input type="hidden" name="moduleId" value={mod.id} />
          <SmallDeleteButton
            confirm={
              mod.lessons.length > 0
                ? `Delete this module and its ${mod.lessons.length} lesson(s)?`
                : 'Delete this module?'
            }
          />
        </form>
      </header>

      {mod.lessons.length > 0 && (
        <ul className="divide-y divide-ink/5">
          {mod.lessons.map((lesson, i) => (
            <LessonRow key={lesson.id} lesson={lesson} index={i + 1} />
          ))}
        </ul>
      )}

      {/* Quiz section */}
      <QuizRow moduleId={mod.id} quiz={mod.quizzes[0]} />

      {showLessonForm ? (
        <div className="border-t border-ink/10 bg-bg-alt/40 p-4">
          <AddLessonForm
            moduleId={mod.id}
            onCancel={() => setShowLessonForm(false)}
          />
        </div>
      ) : (
        <div className="border-t border-ink/10 p-3">
          <button
            type="button"
            onClick={() => setShowLessonForm(true)}
            className="w-full rounded-lg border border-dashed border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink-muted hover:border-ink hover:bg-bg-alt hover:text-ink"
          >
            + Add lesson
          </button>
        </div>
      )}

      {deleteState.errors?._form && (
        <p className="border-t border-ink/10 bg-red-50 px-5 py-2 font-mono text-xs text-red-700">
          {deleteState.errors._form}
        </p>
      )}
    </div>
  );
}

/* ---------------- Lesson row ---------------- */

function LessonRow({ lesson, index }: { lesson: Lesson; index: number }) {
  const [deleteState, deleteAction] = useActionState<CourseActionState, FormData>(
    deleteLesson,
    {}
  );

  const typeIcon = lesson.type === 'VIDEO' ? '▶' : lesson.type === 'PDF' ? '↓' : '≡';
  const mins = Math.max(1, Math.round(lesson.durationSeconds / 60));

  return (
    <li className="flex items-center justify-between px-5 py-2.5">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className="font-mono text-[0.65rem] text-ink-subtle">
          {String(index).padStart(2, '0')}
        </span>
        <span className="font-mono text-sm text-ink-muted">{typeIcon}</span>
        <span className="truncate text-sm text-ink">{lesson.title}</span>
        {lesson.isFreePreview && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-accent">
            Preview
          </span>
        )}
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-3">
        {lesson.videoId && (
          <span className="hidden font-mono text-[0.6rem] text-ink-subtle sm:inline">
            video · {lesson.videoId.slice(0, 8)}…
          </span>
        )}
        <span className="font-mono text-xs text-ink-subtle">{mins}m</span>
        <form action={deleteAction}>
          <input type="hidden" name="lessonId" value={lesson.id} />
          <button
            type="submit"
            onClick={(e) => {
              if (!confirm('Delete this lesson?')) e.preventDefault();
            }}
            className="font-mono text-xs uppercase tracking-wider text-ink-subtle hover:text-red-600"
          >
            ×
          </button>
        </form>
        {deleteState.errors?._form && (
          <span className="font-mono text-xs text-red-600">{deleteState.errors._form}</span>
        )}
      </div>
    </li>
  );
}

/* ---------------- Add forms ---------------- */

function AddModuleForm({ courseId }: { courseId: string }) {
  const [state, action] = useActionState<CourseActionState, FormData>(createModule, {});

  return (
    <form action={action} className="flex items-center gap-3 rounded-xl border border-dashed border-ink/20 bg-bg-alt/30 p-3">
      <input type="hidden" name="courseId" value={courseId} />
      <input
        type="text"
        name="title"
        required
        maxLength={120}
        placeholder="New module title (e.g. Networking basics)"
        className="flex-1 rounded-lg border border-ink/15 bg-bg px-4 py-2 text-sm focus:border-ink focus:outline-none"
      />
      <AddSubmit label="Add module" />
      {state.errors?._form && (
        <span className="font-mono text-xs text-red-600">{state.errors._form}</span>
      )}
    </form>
  );
}

function AddLessonForm({ moduleId, onCancel }: { moduleId: string; onCancel: () => void }) {
  const [state, action] = useActionState<CourseActionState, FormData>(createLesson, {});

  if (state.success) {
    // After successful add, close the form so user sees clean state
    setTimeout(onCancel, 100);
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="moduleId" value={moduleId} />
      <div className="grid gap-3 sm:grid-cols-12">
        <input
          type="text"
          name="title"
          required
          placeholder="Lesson title"
          className="rounded-lg border border-ink/15 bg-bg px-3 py-2 text-sm focus:border-ink focus:outline-none sm:col-span-6"
        />
        <select
          name="type"
          defaultValue="VIDEO"
          className="rounded-lg border border-ink/15 bg-bg px-3 py-2 font-mono text-xs uppercase tracking-wider sm:col-span-2"
        >
          <option value="VIDEO">Video</option>
          <option value="TEXT">Text</option>
          <option value="PDF">PDF</option>
        </select>
        <input
          type="number"
          name="durationSeconds"
          min={0}
          defaultValue={0}
          placeholder="Seconds"
          className="rounded-lg border border-ink/15 bg-bg px-3 py-2 text-sm focus:border-ink focus:outline-none sm:col-span-2"
        />
        <label className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-ink-muted sm:col-span-2">
          <input type="checkbox" name="isFreePreview" />
          Preview
        </label>
      </div>
      <input
        type="text"
        name="videoId"
        placeholder="VdoCipher video ID (optional — paste after upload)"
        className="w-full rounded-lg border border-ink/15 bg-bg px-3 py-2 font-mono text-sm focus:border-ink focus:outline-none"
      />
      <div className="flex items-center justify-end gap-3">
        {state.errors?._form && (
          <span className="font-mono text-xs text-red-600">{state.errors._form}</span>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
        <AddSubmit label="Add lesson" />
      </div>
    </form>
  );
}

function AddSubmit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-4 py-2 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent disabled:opacity-50"
    >
      {pending ? '…' : label}
    </button>
  );
}

function SmallDeleteButton({ confirm: confirmMsg }: { confirm: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm(confirmMsg)) e.preventDefault();
      }}
      className="font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-red-600"
    >
      Delete
    </button>
  );
}

/* ---------------- Quiz row ---------------- */

function QuizRow({ moduleId, quiz }: { moduleId: string; quiz?: ModuleQuiz }) {
  const [showCreate, setShowCreate] = useState(false);
  const [state, action] = useActionState<QuizActionState, FormData>(createQuiz, {});

  if (quiz) {
    return (
      <div className="flex items-center justify-between border-t border-ink/10 bg-accent/5 px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-accent">QZ</span>
          <span className="text-sm">
            <span className="text-ink">{quiz.title}</span>
            <span className="ml-2 font-mono text-xs text-ink-subtle">
              · {quiz._count.questions} {quiz._count.questions === 1 ? 'question' : 'questions'}
            </span>
          </span>
        </div>
        <Link
          href={`/admin/quizzes/${quiz.id}/edit`}
          className="font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
        >
          Edit quiz →
        </Link>
      </div>
    );
  }

  if (showCreate) {
    return (
      <form action={action} className="border-t border-ink/10 bg-bg-alt/40 p-4">
        <input type="hidden" name="moduleId" value={moduleId} />
        <div className="grid gap-3 sm:grid-cols-12">
          <input
            type="text"
            name="title"
            required
            placeholder="Quiz title (e.g. Module review)"
            className="rounded-lg border border-ink/15 bg-bg px-3 py-2 text-sm focus:border-ink focus:outline-none sm:col-span-7"
            defaultValue=""
          />
          <input
            type="number"
            name="passingScore"
            min={0}
            max={100}
            defaultValue={60}
            placeholder="Pass %"
            className="rounded-lg border border-ink/15 bg-bg px-3 py-2 text-sm focus:border-ink focus:outline-none sm:col-span-2"
          />
          <div className="flex items-center justify-end gap-3 sm:col-span-3">
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
            <CreateQuizSubmit />
          </div>
        </div>
        {state.errors?._form && (
          <p className="mt-2 font-mono text-xs text-red-600">{state.errors._form}</p>
        )}
      </form>
    );
  }

  return (
    <div className="border-t border-ink/10 p-3">
      <button
        type="button"
        onClick={() => setShowCreate(true)}
        className="w-full rounded-lg border border-dashed border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink-muted hover:border-accent hover:bg-accent/5 hover:text-accent"
      >
        + Add quiz
      </button>
    </div>
  );
}

function CreateQuizSubmit() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-4 py-1.5 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent disabled:opacity-50"
    >
      {pending ? '…' : 'Create'}
    </button>
  );
}
