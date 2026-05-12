'use client';

import { useActionState, useState, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import {
  updatePreferences,
  exportUserData,
  deleteAccount,
  type SettingsFormState,
} from './actions';

interface Props {
  emailNotifications: boolean;
  marketingEmails: boolean;
  connectedProviders: string[];
}

export function SettingsForms({
  emailNotifications,
  marketingEmails,
  connectedProviders,
}: Props) {
  return (
    <div className="space-y-8">
      <PreferencesSection
        initialEmail={emailNotifications}
        initialMarketing={marketingEmails}
      />
      <ConnectedAccountsSection providers={connectedProviders} />
      <DataExportSection />
      <DangerZoneSection />
    </div>
  );
}

/* ---------------- Preferences ---------------- */

function PreferencesSection({
  initialEmail,
  initialMarketing,
}: {
  initialEmail: boolean;
  initialMarketing: boolean;
}) {
  const [state, formAction] = useActionState<SettingsFormState, FormData>(
    updatePreferences,
    {}
  );

  return (
    <SettingsCard number="01" title="Email preferences">
      <form action={formAction} className="space-y-5">
        <Toggle
          name="emailNotifications"
          defaultChecked={initialEmail}
          label="Course notifications"
          description="Lesson reminders, deadline alerts, cohort announcements. Recommended on."
        />
        <Toggle
          name="marketingEmails"
          defaultChecked={initialMarketing}
          label="Marketing & newsletters"
          description="New track launches, learning tips, success stories. Sent ~2x per month."
        />

        {state.success && (
          <p className="font-mono text-xs uppercase tracking-widest text-accent">
            ✓ {state.message || 'Saved'}
          </p>
        )}
        {state.errors?._form && (
          <p className="font-mono text-xs text-red-600">{state.errors._form}</p>
        )}

        <div className="flex justify-end border-t border-ink/10 pt-5">
          <SaveButton label="Save preferences" />
        </div>
      </form>
    </SettingsCard>
  );
}

function Toggle({
  name,
  defaultChecked,
  label,
  description,
}: {
  name: string;
  defaultChecked: boolean;
  label: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6">
      <div className="flex-1">
        <div className="font-medium text-ink">{label}</div>
        <div className="mt-1 text-sm text-ink-muted">{description}</div>
      </div>
      <div className="relative shrink-0 pt-1">
        <input
          type="checkbox"
          name={name}
          defaultChecked={defaultChecked}
          className="peer sr-only"
        />
        <div className="h-6 w-11 rounded-full bg-ink/20 transition peer-checked:bg-accent" />
        <div className="absolute left-0.5 top-1.5 h-5 w-5 rounded-full bg-bg transition peer-checked:translate-x-5" />
      </div>
    </label>
  );
}

/* ---------------- Connected accounts ---------------- */

function ConnectedAccountsSection({ providers }: { providers: string[] }) {
  return (
    <SettingsCard number="02" title="Connected accounts">
      <p className="mb-5 text-sm text-ink-muted">
        Manage social sign-in connections via the user menu (top right) — Clerk handles the OAuth flow securely.
      </p>
      {providers.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {providers.map((p) => (
            <span
              key={p}
              className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-bg-alt px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-ink"
            >
              ✓ {p}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-ink-subtle">No social accounts connected.</p>
      )}
    </SettingsCard>
  );
}

/* ---------------- Data export ---------------- */

function DataExportSection() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleExport() {
    setError(null);
    startTransition(async () => {
      const result = await exportUserData();
      if ('error' in result) {
        setError(result.error);
        return;
      }
      // Trigger download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = result.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  return (
    <SettingsCard number="03" title="Export your data">
      <p className="mb-5 text-sm text-ink-muted">
        Download a JSON file containing your profile, enrollments, learning progress,
        certificates, and payment history. As required under the DPDP Act 2023.
      </p>
      {error && <p className="mb-3 font-mono text-xs text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleExport}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-ink transition hover:border-ink hover:bg-ink hover:text-bg disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Preparing…' : 'Download data export'}
      </button>
    </SettingsCard>
  );
}

/* ---------------- Danger zone (delete account) ---------------- */

function DangerZoneSection() {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction] = useActionState<SettingsFormState, FormData>(
    deleteAccount,
    {}
  );

  return (
    <div className="rounded-2xl border border-red-300 bg-red-50/30 p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="font-mono text-xs text-red-600">04</span>
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Delete account
        </h2>
        <span className="h-px flex-1 bg-red-300" />
      </div>

      <p className="mb-5 max-w-2xl text-sm text-ink-muted">
        Permanently delete your account. Your authentication credentials are removed
        immediately. Personal identity data is anonymized within 90 days. Certificate
        records are preserved (in anonymized form) so employers can continue verifying
        them.
      </p>

      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="inline-flex items-center gap-2 rounded-full border border-red-600 bg-bg px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-red-700 transition hover:bg-red-600 hover:text-bg"
        >
          Delete my account
        </button>
      ) : (
        <form action={formAction} className="space-y-4">
          <p className="font-medium text-ink">
            This cannot be undone. Type <code className="rounded bg-bg-alt px-1.5 py-0.5 font-mono text-sm">DELETE</code>{' '}
            below to confirm.
          </p>
          <input
            type="text"
            name="confirmation"
            placeholder="DELETE"
            autoComplete="off"
            className={`w-full max-w-xs rounded-xl border bg-bg px-4 py-3 font-mono text-sm focus:outline-none ${
              state.errors?.confirmation
                ? 'border-red-500 focus:border-red-600'
                : 'border-ink/20 focus:border-ink'
            }`}
            required
          />
          {state.errors?.confirmation && (
            <p className="font-mono text-xs text-red-600">→ {state.errors.confirmation}</p>
          )}
          {state.errors?._form && (
            <p className="font-mono text-xs text-red-600">{state.errors._form}</p>
          )}
          <div className="flex flex-wrap gap-3">
            <DeleteButton />
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? 'Deleting…' : 'Permanently delete →'}
    </button>
  );
}

/* ---------------- Shared bits ---------------- */

function SettingsCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-ink/15 bg-bg p-6 lg:p-8">
      <div className="mb-6 flex items-center gap-4">
        <span className="font-mono text-xs text-accent">{number}</span>
        <h2 className="font-display text-lg font-semibold tracking-tight">{title}</h2>
        <span className="h-px flex-1 bg-ink/10" />
      </div>
      {children}
    </section>
  );
}

function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-widest text-bg transition hover:bg-accent disabled:opacity-50"
    >
      {pending ? 'Saving…' : label}
    </button>
  );
}
