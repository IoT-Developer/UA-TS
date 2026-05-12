'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  updateUserRole,
  softDeleteUser,
  restoreUser,
  type AdminActionState,
} from '../actions';

interface Props {
  userId: string;
  currentRole: string;
  isDeleted: boolean;
  isSelf: boolean;
}

export function UserActions({ userId, currentRole, isDeleted, isSelf }: Props) {
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleState, roleAction] = useActionState<AdminActionState, FormData>(
    updateUserRole,
    {}
  );
  const [deleteState, deleteAction] = useActionState<AdminActionState, FormData>(
    softDeleteUser,
    {}
  );
  const [restoreState, restoreAction] = useActionState<AdminActionState, FormData>(
    restoreUser,
    {}
  );

  // Close role form on success
  if (roleState.success && showRoleForm) {
    setShowRoleForm(false);
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap gap-2">
        {!showRoleForm && !isDeleted && (
          <button
            type="button"
            onClick={() => setShowRoleForm(true)}
            className="rounded-full border border-ink/20 px-4 py-2 font-mono text-xs uppercase tracking-widest text-ink hover:border-ink hover:bg-ink hover:text-bg"
            disabled={isSelf}
            title={isSelf ? "Can't change your own role" : undefined}
          >
            Change role
          </button>
        )}

        {!isDeleted && !isSelf && (
          <form action={deleteAction}>
            <input type="hidden" name="userId" value={userId} />
            <DangerButton label="Soft-delete" pending={false} />
          </form>
        )}

        {isDeleted && (
          <form action={restoreAction}>
            <input type="hidden" name="userId" value={userId} />
            <RestoreButton />
          </form>
        )}
      </div>

      {showRoleForm && (
        <form action={roleAction} className="flex items-center gap-2 rounded-full bg-bg-alt p-1">
          <input type="hidden" name="userId" value={userId} />
          <select
            name="role"
            defaultValue={currentRole}
            className="rounded-full bg-bg px-3 py-1 font-mono text-xs uppercase tracking-widest"
          >
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Admin</option>
          </select>
          <SaveButton />
          <button
            type="button"
            onClick={() => setShowRoleForm(false)}
            className="px-2 font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink"
          >
            Cancel
          </button>
        </form>
      )}

      {(roleState.errors?._form || deleteState.errors?._form || restoreState.errors?._form) && (
        <p className="font-mono text-xs text-red-600">
          {roleState.errors?._form || deleteState.errors?._form || restoreState.errors?._form}
        </p>
      )}
      {(roleState.success || deleteState.success || restoreState.success) && (
        <p className="font-mono text-xs text-accent">
          ✓{' '}
          {roleState.message || deleteState.message || restoreState.message}
        </p>
      )}
    </div>
  );
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-ink px-3 py-1 font-mono text-xs uppercase tracking-widest text-bg hover:bg-accent disabled:opacity-50"
    >
      {pending ? '…' : 'Save'}
    </button>
  );
}

function DangerButton({ label }: { label: string; pending: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-red-300 bg-red-50 px-4 py-2 font-mono text-xs uppercase tracking-widest text-red-700 hover:bg-red-600 hover:text-bg disabled:opacity-50"
    >
      {pending ? '…' : label}
    </button>
  );
}

function RestoreButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-accent/40 bg-accent/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-accent hover:bg-accent hover:text-ink disabled:opacity-50"
    >
      {pending ? '…' : 'Restore'}
    </button>
  );
}
