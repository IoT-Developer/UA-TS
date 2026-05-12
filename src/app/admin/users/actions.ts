'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export type AdminActionState = {
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
};

const VALID_ROLES = ['STUDENT', 'INSTRUCTOR', 'ADMIN'] as const;
type Role = typeof VALID_ROLES[number];

export async function updateUserRole(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const me = await requireAdmin();

  const userId = String(formData.get('userId') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim();

  if (!userId) return { errors: { _form: 'Missing userId' } };
  if (!VALID_ROLES.includes(role as Role)) return { errors: { _form: 'Invalid role' } };

  // Don't allow demoting yourself — protects against locking out the last admin
  if (userId === me.id && role !== 'ADMIN') {
    return { errors: { _form: "You can't change your own role away from ADMIN." } };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: role as Role },
    });
  } catch (err) {
    console.error('Role update failed:', err);
    return { errors: { _form: 'Could not update role.' } };
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true, message: 'Role updated' };
}

export async function softDeleteUser(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const me = await requireAdmin();
  const userId = String(formData.get('userId') ?? '').trim();
  if (!userId) return { errors: { _form: 'Missing userId' } };
  if (userId === me.id) {
    return { errors: { _form: "You can't delete your own account from here." } };
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });
  } catch (err) {
    console.error('Soft delete failed:', err);
    return { errors: { _form: 'Could not delete.' } };
  }

  revalidatePath('/admin/users');
  return { success: true, message: 'User soft-deleted' };
}

export async function restoreUser(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const userId = String(formData.get('userId') ?? '').trim();
  if (!userId) return { errors: { _form: 'Missing userId' } };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null },
    });
  } catch (err) {
    console.error('Restore failed:', err);
    return { errors: { _form: 'Could not restore.' } };
  }

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  return { success: true, message: 'User restored' };
}
