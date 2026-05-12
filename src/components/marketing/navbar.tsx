import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { NavbarClient } from './navbar-client';

/**
 * Server wrapper for the navbar. Detects if the current user is admin/instructor
 * so we can show the "Admin" link to them only. Falls back gracefully for
 * unauthenticated visitors.
 */
export async function Navbar() {
  let role: string | null = null;
  let avatarUrl: string | null = null;
  let name: string | null = null;
  try {
    const { userId } = await auth();
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: userId },
        select: { role: true, avatarUrl: true, name: true },
      });
      role = user?.role || null;
      avatarUrl = user?.avatarUrl || null;
      name = user?.name || null;
    }
  } catch {
    // Don't let navbar break anything
  }

  return <NavbarClient role={role} avatarUrl={avatarUrl} name={name} />;
}
