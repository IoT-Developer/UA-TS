'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export type SettingsFormState = {
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
};

/**
 * Update email notification preferences.
 */
export async function updatePreferences(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const { userId } = await auth();
  if (!userId) return { errors: { _form: 'Not authenticated.' } };

  const emailNotifications = formData.get('emailNotifications') === 'on';
  const marketingEmails = formData.get('marketingEmails') === 'on';

  try {
    await prisma.user.update({
      where: { clerkId: userId },
      data: { emailNotifications, marketingEmails },
    });
  } catch (err) {
    console.error('Preferences update failed:', err);
    return { errors: { _form: 'Could not save. Please try again.' } };
  }

  revalidatePath('/dashboard/settings');
  return { success: true, message: 'Preferences saved' };
}

/**
 * Export the user's data as JSON. Returns a base64 data URL the client can download.
 * Covers DPDP Act 2023 right of access.
 */
export async function exportUserData(): Promise<
  { url: string; filename: string } | { error: string }
> {
  const { userId } = await auth();
  if (!userId) return { error: 'Not authenticated' };

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      enrollments: {
        include: { course: { select: { title: true, slug: true } } },
      },
      lessonProgress: {
        include: { lesson: { select: { title: true } } },
      },
      quizAttempts: {
        include: { quiz: { select: { title: true } } },
      },
      certificates: {
        include: { course: { select: { title: true, slug: true } } },
      },
      orders: true,
    },
  });

  if (!user) return { error: 'User not found' };

  // Strip internal fields, format dates as ISO
  const exportData = {
    exportedAt: new Date().toISOString(),
    profile: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth?.toISOString().split('T')[0] || null,
      college: user.college,
      branch: user.branch,
      yearOfStudy: user.yearOfStudy,
      academicStatus: user.academicStatus,
      createdAt: user.createdAt.toISOString(),
    },
    preferences: {
      emailNotifications: user.emailNotifications,
      marketingEmails: user.marketingEmails,
    },
    enrollments: user.enrollments.map((e) => ({
      courseTitle: e.course.title,
      courseSlug: e.course.slug,
      enrolledAt: e.enrolledAt.toISOString(),
      completedAt: e.completedAt?.toISOString() || null,
      progressPct: e.progressPct,
    })),
    lessonsCompleted: user.lessonProgress
      .filter((p) => p.completed)
      .map((p) => ({
        lessonTitle: p.lesson.title,
        watchedSeconds: p.watchedSeconds,
        lastAccessAt: p.lastAccessAt.toISOString(),
      })),
    quizAttempts: user.quizAttempts.map((q) => ({
      quizTitle: q.quiz.title,
      score: q.score,
      passed: q.passed,
      attemptedAt: q.attemptedAt.toISOString(),
    })),
    certificates: user.certificates.map((c) => ({
      certificateNo: c.certificateNo,
      courseTitle: c.course.title,
      issuedAt: c.issuedAt.toISOString(),
    })),
    paymentHistory: user.orders.map((o) => ({
      amountInPaise: o.finalInPaise,
      currency: o.currency,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
  };

  const json = JSON.stringify(exportData, null, 2);
  const base64 = Buffer.from(json).toString('base64');
  return {
    url: `data:application/json;base64,${base64}`,
    filename: `unified-automation-export-${user.id}.json`,
  };
}

/**
 * Delete user account.
 *  - Soft-deletes our local user (anonymizes within 90 days per privacy policy)
 *  - Deletes from Clerk (signs them out everywhere)
 *  - Redirects to homepage
 */
export async function deleteAccount(
  _prev: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const { userId } = await auth();
  if (!userId) return { errors: { _form: 'Not authenticated.' } };

  const confirmation = String(formData.get('confirmation') ?? '').trim();
  if (confirmation !== 'DELETE') {
    return { errors: { confirmation: 'Type DELETE to confirm' } };
  }

  try {
    // 1. Soft-delete locally — preserves enrollment/certificate history for legal records
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        deletedAt: new Date(),
        // Don't anonymize identity immediately — privacy policy gives us 90 days
      },
    });

    // 2. Delete from Clerk — kills their session everywhere
    const clerk = await clerkClient();
    await clerk.users.deleteUser(userId);
  } catch (err) {
    console.error('Account deletion failed:', err);
    return { errors: { _form: 'Could not delete account. Email support@unifiedautomation.in.' } };
  }

  redirect('/?deleted=1');
}
