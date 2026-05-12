import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

/**
 * Check if an error is a Prisma "unique constraint failed" error (P2002).
 * Duck-typed to avoid depending on Prisma's exported error class.
 */
function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: unknown }).code === 'P2002'
  );
}

/**
 * Get the current user from our DB, creating or reconciling them from Clerk data
 * if needed. This is the single source of truth for "who is the current user."
 *
 * Three paths:
 *  1. Row exists with this clerkId → return it (fast path)
 *  2. No row with this clerkId, but a row exists with this email → "claim" it
 *     by updating its clerkId. Handles: user recreated Clerk account, signed up
 *     via different provider with same email, etc.
 *  3. No row at all → create it (handles missing webhook in local dev)
 *
 * Returns null only if not authenticated, or if the matching local row was
 * soft-deleted (account deletion requires re-signup).
 */
export async function getOrCreateCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  // Path 1: existing user, matched on clerkId
  const byClerkId = await prisma.user.findUnique({
    where: { clerkId: userId },
  });
  if (byClerkId) {
    if (byClerkId.deletedAt) return null;
    return byClerkId;
  }

  // Need Clerk data for paths 2 and 3
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress;
  if (!primaryEmail) return null;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || null;
  const avatarUrl = clerkUser.imageUrl || null;

  // Path 2: row exists with this email but a different clerkId
  // → reconcile by updating the clerkId. This is safe because email
  // uniqueness in our schema means there's only one User per email.
  const byEmail = await prisma.user.findUnique({
    where: { email: primaryEmail },
  });
  if (byEmail) {
    if (byEmail.deletedAt) {
      // Soft-deleted accounts can't be reclaimed via re-signup
      console.warn('Sign-in attempted for soft-deleted account:', primaryEmail);
      return null;
    }
    try {
      return await prisma.user.update({
        where: { id: byEmail.id },
        data: {
          clerkId: userId,
          name: byEmail.name || name,
          avatarUrl: byEmail.avatarUrl || avatarUrl,
        },
      });
    } catch (err) {
      console.error('User reconciliation failed:', err);
      return null;
    }
  }

  // Path 3: brand new user
  try {
    return await prisma.user.create({
      data: {
        clerkId: userId,
        email: primaryEmail,
        name,
        avatarUrl,
        role: 'STUDENT',
      },
    });
  } catch (err) {
    // Race condition: another concurrent request created the row between
    // our findUnique calls and this create. Retry the lookup once.
    if (isUniqueConstraintError(err)) {
      const retry = await prisma.user.findUnique({ where: { clerkId: userId } });
      if (retry && !retry.deletedAt) return retry;
      const retryByEmail = await prisma.user.findUnique({ where: { email: primaryEmail } });
      if (retryByEmail && !retryByEmail.deletedAt) {
        return prisma.user.update({
          where: { id: retryByEmail.id },
          data: { clerkId: userId },
        });
      }
    }
    console.error('User create failed:', err);
    return null;
  }
}
