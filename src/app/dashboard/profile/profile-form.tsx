'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { updateProfile, type ProfileFormState } from './actions';
import { calculateAge } from '@/lib/utils';
import { ImageUpload } from '@/components/admin/image-upload';

interface InitialData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string; // YYYY-MM-DD
  college: string;
  branch: string;
  yearOfStudy: string;
  academicStatus: string;
  avatarUrl: string;
}

const BRANCH_OPTIONS = [
  { value: 'CSE', label: 'Computer Science & Engineering' },
  { value: 'IT', label: 'Information Technology' },
  { value: 'ECE', label: 'Electronics & Communication' },
  { value: 'EEE', label: 'Electrical & Electronics' },
  { value: 'MECH', label: 'Mechanical Engineering' },
  { value: 'CIVIL', label: 'Civil Engineering' },
  { value: 'AI_ML', label: 'AI / Machine Learning' },
  { value: 'BIOTECH', label: 'Biotechnology' },
  { value: 'CHEMICAL', label: 'Chemical Engineering' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'STUDENT', label: 'Student' },
  { value: 'WORKING_PROFESSIONAL', label: 'Working Professional' },
  { value: 'JOB_SEEKER', label: 'Job Seeker' },
];

export function ProfileForm({ initialData }: { initialData: InitialData }) {
  const [state, formAction] = useActionState<ProfileFormState, FormData>(
    updateProfile,
    {}
  );

  // Live age from DOB
  const [dob, setDob] = useState(initialData.dateOfBirth);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData.avatarUrl || null);
  const age = calculateAge(dob || null);

  const errors = state.errors || {};

  return (
    <form action={formAction} className="space-y-8" noValidate>
      {/* Success/error banner */}
      {state.success && (
        <div className="rounded-2xl border-2 border-accent bg-accent/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-bg">
              ✓
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-accent">
              {state.message || 'Saved'}
            </span>
          </div>
        </div>
      )}
      {errors._form && (
        <div className="rounded-2xl border border-red-600 bg-red-50 px-5 py-4 text-sm text-red-800">
          {errors._form}
        </div>
      )}

      {/* SECTION: Identity */}
      <FieldSet number="01" title="Identity">
        <input type="hidden" name="avatarUrl" value={avatarUrl || ''} />
        <Field label="Profile photo" name="avatarUrl" hint="Recommended: 400×400 square JPG/PNG, under 2 MB">
          <ImageUpload
            value={avatarUrl}
            onUploaded={(url) => setAvatarUrl(url || null)}
            shape="avatar"
            folder="avatars"
            maxSizeMB={2}
          />
        </Field>
        <Field label="Full name" name="name" error={errors.name}>
          <input
            type="text"
            name="name"
            defaultValue={initialData.name}
            placeholder="Logeshwaran J"
            className={inputClasses(errors.name)}
            maxLength={80}
            required
          />
        </Field>
        <Field label="Email" name="email">
          <div className="flex items-center justify-between rounded-xl border border-ink/10 bg-bg-alt/60 px-4 py-3">
            <span className="text-sm text-ink-muted">{initialData.email}</span>
            <span className="font-mono text-[0.6rem] uppercase tracking-widest text-ink-subtle">
              Verified · Clerk
            </span>
          </div>
        </Field>
      </FieldSet>

      {/* SECTION: Personal */}
      <FieldSet number="02" title="Personal">
        <Field label="Phone number" name="phone" error={errors.phone} hint="No SMS verification. We use this for placement coordination only.">
          <div className="flex">
            <span className="inline-flex items-center rounded-l-xl border border-r-0 border-ink/20 bg-bg-alt px-4 font-mono text-sm text-ink-muted">
              +91
            </span>
            <input
              type="tel"
              name="phone"
              defaultValue={initialData.phone}
              placeholder="9876543210"
              className={`flex-1 rounded-r-xl border border-ink/20 bg-bg px-4 py-3 text-sm focus:border-ink focus:outline-none ${errors.phone ? 'border-red-500' : ''}`}
              maxLength={13}
              required
            />
          </div>
        </Field>

        <Field label="Date of birth" name="dateOfBirth" error={errors.dateOfBirth}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="date"
              name="dateOfBirth"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              min="1900-01-01"
              className={inputClasses(errors.dateOfBirth) + ' sm:max-w-xs'}
              required
            />
            {age !== null && (
              <span className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-bg-alt px-4 py-2 font-mono text-xs text-ink-muted">
                <span className="text-ink-subtle">Age:</span>
                <span className="font-semibold text-ink">{age}</span>
              </span>
            )}
          </div>
        </Field>
      </FieldSet>

      {/* SECTION: Education */}
      <FieldSet number="03" title="Education">
        <Field label="College / University" name="college" error={errors.college}>
          <input
            type="text"
            name="college"
            defaultValue={initialData.college}
            placeholder="PSG College of Technology"
            className={inputClasses(errors.college)}
            maxLength={200}
            required
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="Branch" name="branch" error={errors.branch}>
            <select
              name="branch"
              defaultValue={initialData.branch}
              className={selectClasses(errors.branch)}
              required
            >
              <option value="">— Select —</option>
              {BRANCH_OPTIONS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Year of study" name="yearOfStudy" error={errors.yearOfStudy}>
            <select
              name="yearOfStudy"
              defaultValue={initialData.yearOfStudy}
              className={selectClasses(errors.yearOfStudy)}
              required
            >
              <option value="">— Select —</option>
              <option value="1">1st year</option>
              <option value="2">2nd year</option>
              <option value="3">3rd year</option>
              <option value="4">4th year</option>
              <option value="5">Postgraduate</option>
            </select>
          </Field>
        </div>
      </FieldSet>

      {/* SECTION: Status */}
      <FieldSet number="04" title="Status">
        <Field label="What describes you best?" name="academicStatus" error={errors.academicStatus}>
          <div className="grid gap-3 sm:grid-cols-3">
            {STATUS_OPTIONS.map((s) => (
              <label
                key={s.value}
                className="group cursor-pointer rounded-xl border border-ink/15 bg-bg p-4 transition has-[:checked]:border-accent has-[:checked]:bg-accent/5 hover:border-ink/40"
              >
                <input
                  type="radio"
                  name="academicStatus"
                  value={s.value}
                  defaultChecked={initialData.academicStatus === s.value}
                  className="sr-only"
                  required
                />
                <span className="block text-sm font-medium text-ink">{s.label}</span>
              </label>
            ))}
          </div>
        </Field>
      </FieldSet>

      {/* Submit */}
      <div className="flex flex-col-reverse items-stretch gap-3 border-t border-ink/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-ink-subtle">
          All fields are required to start enrolling in tracks.
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
      className="inline-flex items-center justify-center gap-3 rounded-full bg-ink px-7 py-3.5 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? (
        <>
          <Spinner /> Saving…
        </>
      ) : (
        <>
          Save profile <span>→</span>
        </>
      )}
    </button>
  );
}

function Spinner() {
  return (
    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-bg/30 border-t-bg" />
  );
}

function FieldSet({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="font-mono text-xs text-accent">{number}</span>
        <legend className="font-display text-lg font-semibold tracking-tight">{title}</legend>
        <span className="h-px flex-1 bg-ink/10" />
      </div>
      <div className="space-y-6">{children}</div>
    </fieldset>
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
      {error && (
        <p className="mt-2 font-mono text-xs text-red-600">→ {error}</p>
      )}
      {hint && !error && (
        <p className="mt-2 text-xs text-ink-subtle">{hint}</p>
      )}
    </div>
  );
}

function inputClasses(error?: string) {
  return `w-full rounded-xl border bg-bg px-4 py-3 text-sm placeholder:text-ink-subtle focus:outline-none ${
    error ? 'border-red-500 focus:border-red-600' : 'border-ink/20 focus:border-ink'
  }`;
}

function selectClasses(error?: string) {
  return `w-full appearance-none rounded-xl border bg-bg px-4 py-3 text-sm focus:outline-none ${
    error ? 'border-red-500 focus:border-red-600' : 'border-ink/20 focus:border-ink'
  }`;
}
