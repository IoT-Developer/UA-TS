import { redirect } from 'next/navigation';
import { getOrCreateCurrentUser } from '@/lib/auth';
import type { User } from '@prisma/client';

/**
 * Server-side guard for admin routes. Redirects:
 *  - to /sign-in if not authenticated
 *  - to /dashboard if authenticated but not an admin
 * Returns the User if allowed.
 */
export async function requireAdmin(): Promise<User> {
  const user = await getOrCreateCurrentUser();
  if (!user) redirect('/sign-in?redirect=/admin');
  if (user.role !== 'ADMIN') redirect('/dashboard');
  return user;
}

/**
 * Allows ADMIN or INSTRUCTOR. Used for course CRUD.
 */
export async function requireInstructorOrAdmin(): Promise<User> {
  const user = await getOrCreateCurrentUser();
  if (!user) redirect('/sign-in?redirect=/admin');
  if (user.role !== 'ADMIN' && user.role !== 'INSTRUCTOR') {
    redirect('/dashboard');
  }
  return user;
}

export function isAdmin(user: User | null | undefined): boolean {
  return user?.role === 'ADMIN';
}

export function canManageCourses(user: User | null | undefined): boolean {
  return user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR';
}
