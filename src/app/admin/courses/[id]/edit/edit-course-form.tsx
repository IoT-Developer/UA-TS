'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateCourse, deleteCourse, type CourseActionState } from '../../actions';
import { ImageUpload } from '@/components/admin/image-upload';
import { TechStackPicker } from '@/components/admin/tech-stack-picker';
import type { StoredTechStack } from '@/lib/tech-stacks';

interface Course {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  level: string;
  status: string;
  priceInPaise: number;
  mrpInPaise: number;
  categoryId: string;
  whatYoullLearn: string[];
  prerequisites: string[];
  targetAudience: string[];
  coverImageUrl: string | null;
  thumbnailUrl: string | null;
  techStack: StoredTechStack[];
}

interface Category {
  id: string;
  name: string;
}

export function EditCourseForm({ course, categories }: { course: Course; categories: Category[] }) {
  const [state, formAction] = useActionState<CourseActionState, FormData>(updateCourse, {});
  const [deleteState, deleteAction] = useActionState<CourseActionState, FormData>(deleteCourse, {});
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(course.coverImageUrl);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(course.thumbnailUrl);
  const errors = state.errors || {};

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8" noValidate>
      <input type="hidden" name="courseId" value={course.id} />

      <header className="flex items-center justify-between border-b border-ink/10 pb-4">
        <h2 className="font-display text-xl font-semibold tracking-tight">Course details</h2>
        <div className="flex items-center gap-3">
          {state.success && <span className="font-mono text-xs text-accent">✓ {state.message}</span>}
          {(errors._form || deleteState.errors?._form) && (
            <span className="font-mono text-xs text-red-600">
              {errors._form || deleteState.errors?._form}
            </span>
          )}
          <SaveButton />
        </div>
      </header>

      <Field label="Title" name="title" error={errors.title}>
        <input
          type="text"
          name="title"
          defaultValue={course.title}
          required
          maxLength={120}
          className={inputCls(!!errors.title)}
        />
      </Field>

      <Field label="Subtitle" name="subtitle">
        <input
          type="text"
          name="subtitle"
          defaultValue={course.subtitle || ''}
          maxLength={200}
          className={inputCls(false)}
        />
      </Field>

      <Field label="Description" name="description" error={errors.description}>
        <textarea
          name="description"
          required
          rows={5}
          defaultValue={course.description}
          className={`${inputCls(!!errors.description)} resize-y`}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Category" name="categoryId" error={errors.categoryId}>
          <select name="categoryId" required defaultValue={course.categoryId} className={inputCls(!!errors.categoryId)}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Level" name="level" error={errors.level}>
          <select name="level" required defaultValue={course.level} className={inputCls(!!errors.level)}>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </Field>

        <Field label="Status" name="status" error={errors.status}>
          <select name="status" required defaultValue={course.status} className={inputCls(!!errors.status)}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Price (₹)" name="priceInRupees" error={errors.priceInRupees}>
          <input
            type="number"
            name="priceInRupees"
            min={0}
            step={100}
            defaultValue={course.priceInPaise / 100}
            required
            className={inputCls(!!errors.priceInRupees)}
          />
        </Field>
        <Field label="MRP (₹)" name="mrpInRupees" error={errors.mrpInRupees}>
          <input
            type="number"
            name="mrpInRupees"
            min={0}
            step={100}
            defaultValue={course.mrpInPaise / 100}
            className={inputCls(!!errors.mrpInRupees)}
          />
        </Field>
      </div>

      <Field
        label="What you'll learn"
        name="whatYoullLearn"
        hint="One outcome per line"
      >
        <textarea
          name="whatYoullLearn"
          rows={5}
          defaultValue={course.whatYoullLearn.join('\n')}
          className={`${inputCls(false)} resize-y font-mono text-sm`}
          placeholder={'Build a multi-task firmware system\nWrite peripheral drivers from scratch'}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Prerequisites" name="prerequisites" hint="One per line">
          <textarea
            name="prerequisites"
            rows={4}
            defaultValue={course.prerequisites.join('\n')}
            className={`${inputCls(false)} resize-y font-mono text-sm`}
            placeholder="Solid C programming"
          />
        </Field>
        <Field label="Target audience" name="targetAudience" hint="One per line">
          <textarea
            name="targetAudience"
            rows={4}
            defaultValue={course.targetAudience.join('\n')}
            className={`${inputCls(false)} resize-y font-mono text-sm`}
            placeholder="ECE final-year students"
          />
        </Field>
      </div>

      {/* Images */}
      <div className="space-y-6 border-t border-ink/10 pt-6">
        <h3 className="font-display text-lg font-semibold tracking-tight">Images</h3>
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <input type="hidden" name="coverImageUrl" value={coverImageUrl || ''} />
            <ImageUpload
              value={coverImageUrl}
              onUploaded={(url) => setCoverImageUrl(url || null)}
              shape="cover"
              folder="courses/covers"
              label="Cover image (1280×720 recommended)"
              hint="Shown on course detail page hero. Will fall back to category color if empty."
              maxSizeMB={2}
            />
          </div>
          <div>
            <input type="hidden" name="thumbnailUrl" value={thumbnailUrl || ''} />
            <ImageUpload
              value={thumbnailUrl}
              onUploaded={(url) => setThumbnailUrl(url || null)}
              shape="cover"
              folder="courses/thumbnails"
              label="Thumbnail (640×360 recommended)"
              hint="Shown on course cards across the platform. Reuses cover if empty."
              maxSizeMB={1}
            />
          </div>
        </div>
      </div>

      {/* Tech stack */}
      <div className="space-y-3 border-t border-ink/10 pt-6">
        <div>
          <h3 className="font-display text-lg font-semibold tracking-tight">Tech stack</h3>
          <p className="mt-1 text-sm text-ink-muted">
            Pick the technologies students will use in this course. Shown as logo chips on the course page.
          </p>
        </div>
        <TechStackPicker name="techStack" initial={course.techStack} />
      </div>

      <footer className="flex items-center justify-between border-t border-ink/10 pt-6">
        <form action={deleteAction}>
          <input type="hidden" name="courseId" value={course.id} />
          <DeleteButton />
        </form>
        <SaveButton />
      </footer>
    </form>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent disabled:opacity-50"
    >
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!confirm('Delete this course? This cannot be undone.')) e.preventDefault();
      }}
      className="rounded-full border border-red-300 bg-red-50 px-4 py-2 font-mono text-xs uppercase tracking-widest text-red-700 hover:bg-red-600 hover:text-bg disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete course'}
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
