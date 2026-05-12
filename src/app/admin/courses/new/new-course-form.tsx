'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createCourse, type CourseActionState } from '../actions';

interface Props {
  categories: { id: string; name: string }[];
}

export function NewCourseForm({ categories }: Props) {
  const [state, formAction] = useActionState<CourseActionState, FormData>(createCourse, {});
  const errors = state.errors || {};

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-ink/15 bg-bg p-8" noValidate>
      {errors._form && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-3 font-mono text-xs text-red-700">
          {errors._form}
        </div>
      )}

      <Field label="Course title" name="title" error={errors.title}>
        <input
          type="text"
          name="title"
          required
          maxLength={120}
          placeholder="e.g. Embedded C on STM32 with FreeRTOS"
          className={inputCls(!!errors.title)}
        />
      </Field>

      <Field label="Subtitle (optional)" name="subtitle">
        <input
          type="text"
          name="subtitle"
          maxLength={200}
          placeholder="Short hook line — appears below the title"
          className={inputCls(false)}
        />
      </Field>

      <Field label="Description" name="description" error={errors.description}>
        <textarea
          name="description"
          required
          rows={5}
          placeholder="What is this course about? Who is it for? What will students build?"
          className={`${inputCls(!!errors.description)} resize-y`}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Category" name="categoryId" error={errors.categoryId}>
          <select name="categoryId" required defaultValue="" className={inputCls(!!errors.categoryId)}>
            <option value="" disabled>
              — Select —
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Level" name="level" error={errors.level}>
          <select name="level" required defaultValue="BEGINNER" className={inputCls(!!errors.level)}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Price (₹)" name="priceInRupees" error={errors.priceInRupees} hint="Enter 0 for free">
          <input
            type="number"
            name="priceInRupees"
            min={0}
            step={100}
            required
            placeholder="1499"
            className={inputCls(!!errors.priceInRupees)}
          />
        </Field>
        <Field label="MRP (₹)" name="mrpInRupees" error={errors.mrpInRupees} hint="Strikethrough price; >= price">
          <input
            type="number"
            name="mrpInRupees"
            min={0}
            step={100}
            placeholder="4999"
            className={inputCls(!!errors.mrpInRupees)}
          />
        </Field>
      </div>

      <div className="flex items-center justify-between border-t border-ink/10 pt-6">
        <p className="font-mono text-xs text-ink-subtle">
          Course will be created as DRAFT — not visible to students.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-6 py-3 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent disabled:opacity-50"
    >
      {pending ? 'Creating…' : 'Create course →'}
    </button>
  );
}

function Field({
  label,
  name,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block font-mono text-xs uppercase tracking-widest text-ink-muted">
        {label}
      </label>
      {children}
      {error && <p className="mt-2 font-mono text-xs text-red-600">→ {error}</p>}
      {hint && !error && <p className="mt-2 text-xs text-ink-subtle">{hint}</p>}
    </div>
  );
}

function inputCls(hasError: boolean) {
  return `w-full rounded-xl border bg-bg px-4 py-3 text-sm placeholder:text-ink-subtle focus:outline-none ${
    hasError ? 'border-red-500 focus:border-red-600' : 'border-ink/20 focus:border-ink'
  }`;
}
