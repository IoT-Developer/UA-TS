'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  createWebinar,
  updateWebinar,
  deleteWebinar,
  type WebinarActionState,
} from '../actions';

interface Course {
  id: string;
  title: string;
}

interface ExistingWebinar {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: Date;
  durationMinutes: number;
  joinUrl: string;
  recordingUrl: string | null;
  courseId: string | null;
  enrolledOnly: boolean;
  status: string;
}

interface Props {
  mode: 'create' | 'edit';
  courses: Course[];
  webinar?: ExistingWebinar;
}

export function WebinarForm({ mode, courses, webinar }: Props) {
  const action = mode === 'create' ? createWebinar : updateWebinar;
  const [state, formAction] = useActionState<WebinarActionState, FormData>(action, {});
  const [deleteState, deleteFormAction] = useActionState<WebinarActionState, FormData>(
    deleteWebinar,
    {}
  );
  const errors = state.errors || {};

  // Format scheduledAt for datetime-local input (YYYY-MM-DDTHH:mm)
  const defaultScheduledAt = webinar
    ? toDatetimeLocal(webinar.scheduledAt)
    : '';

  return (
    <div className="space-y-6">
      <form action={formAction} className="space-y-6 rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8" noValidate>
        {webinar && <input type="hidden" name="webinarId" value={webinar.id} />}

        {errors._form && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-3 font-mono text-xs text-red-700">
            {errors._form}
          </div>
        )}
        {state.success && (
          <div className="rounded-xl border-2 border-accent bg-accent/5 p-3 font-mono text-xs uppercase tracking-widest text-accent">
            ✓ {state.message}
          </div>
        )}

        <Field label="Title" name="title" error={errors.title}>
          <input
            type="text"
            name="title"
            required
            maxLength={200}
            defaultValue={webinar?.title || ''}
            placeholder="e.g. Live Q&A: STM32 debugging deep-dive"
            className={inputCls(!!errors.title)}
          />
        </Field>

        <Field label="Description" name="description">
          <textarea
            name="description"
            rows={3}
            defaultValue={webinar?.description || ''}
            placeholder="What will you cover? (optional)"
            className={`${inputCls(false)} resize-y`}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Date & time (IST)" name="scheduledAt" error={errors.scheduledAt}>
            <input
              type="datetime-local"
              name="scheduledAt"
              required
              defaultValue={defaultScheduledAt}
              className={inputCls(!!errors.scheduledAt)}
            />
          </Field>
          <Field label="Duration (minutes)" name="durationMinutes" error={errors.durationMinutes}>
            <input
              type="number"
              name="durationMinutes"
              min={5}
              max={600}
              step={5}
              required
              defaultValue={webinar?.durationMinutes || 60}
              className={inputCls(!!errors.durationMinutes)}
            />
          </Field>
        </div>

        <Field
          label="Meeting URL"
          name="joinUrl"
          error={errors.joinUrl}
          hint="Paste a Zoom, Google Meet, or Microsoft Teams URL"
        >
          <input
            type="url"
            name="joinUrl"
            required
            defaultValue={webinar?.joinUrl || ''}
            placeholder="https://us02web.zoom.us/j/12345 or https://meet.google.com/abc-defg-hij"
            className={`${inputCls(!!errors.joinUrl)} font-mono text-sm`}
          />
        </Field>

        {mode === 'edit' && (
          <Field
            label="Recording URL"
            name="recordingUrl"
            error={errors.recordingUrl}
            hint="Add after the webinar ends — students can rewatch"
          >
            <input
              type="url"
              name="recordingUrl"
              defaultValue={webinar?.recordingUrl || ''}
              placeholder="https://..."
              className={`${inputCls(!!errors.recordingUrl)} font-mono text-sm`}
            />
          </Field>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Course (optional)" name="courseId" hint="Leave blank for a standalone webinar">
            <select
              name="courseId"
              defaultValue={webinar?.courseId || ''}
              className={inputCls(false)}
            >
              <option value="">— Standalone —</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </Field>

          {mode === 'edit' && (
            <Field label="Status" name="status" error={errors.status}>
              <select
                name="status"
                defaultValue={webinar?.status || 'SCHEDULED'}
                className={inputCls(!!errors.status)}
              >
                <option value="SCHEDULED">Scheduled</option>
                <option value="LIVE">Live</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </Field>
          )}
        </div>

        <Field label="Access" name="enrolledOnly">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-ink/15 bg-bg-alt/40 p-4">
            <input
              type="checkbox"
              name="enrolledOnly"
              defaultChecked={webinar?.enrolledOnly ?? true}
              className="mt-1"
            />
            <span className="text-sm">
              <span className="block font-medium text-ink">
                Enrolled students only
              </span>
              <span className="mt-1 block text-ink-muted">
                Uncheck to make this webinar visible to all signed-in users (useful for promotional sessions).
              </span>
            </span>
          </label>
        </Field>

        <footer className="flex items-center justify-between border-t border-ink/10 pt-6">
          {mode === 'edit' && webinar && (
            <form action={deleteFormAction}>
              <input type="hidden" name="webinarId" value={webinar.id} />
              <DeleteButton />
            </form>
          )}
          {mode === 'create' && <span />}
          <SaveButton mode={mode} />
        </footer>

        {deleteState.errors?._form && (
          <p className="font-mono text-xs text-red-600">{deleteState.errors._form}</p>
        )}
      </form>
    </div>
  );
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function SaveButton({ mode }: { mode: 'create' | 'edit' }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-6 py-2.5 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent disabled:opacity-50"
    >
      {pending ? 'Saving…' : mode === 'create' ? 'Schedule →' : 'Save changes'}
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
        if (!confirm('Delete this webinar?')) e.preventDefault();
      }}
      className="rounded-full border border-red-300 bg-red-50 px-4 py-2 font-mono text-xs uppercase tracking-widest text-red-700 hover:bg-red-600 hover:text-bg disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Delete webinar'}
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
