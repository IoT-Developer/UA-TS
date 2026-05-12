import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

/**
 * Check if a user has access to a specific lesson.
 *  - Free preview lessons: anyone signed in
 *  - Other lessons: must have an Enrollment for the course
 *  - Admins always pass
 *  - The lesson's instructor always passes (so they can preview their own courses)
 */
export async function userCanAccessLesson(
  user: User | null,
  lessonId: string
): Promise<{ allowed: boolean; reason?: string; courseSlug?: string }> {
  if (!user) return { allowed: false, reason: 'Sign in to continue' };

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            select: { id: true, slug: true, instructorId: true },
          },
        },
      },
    },
  });
  if (!lesson) return { allowed: false, reason: 'Lesson not found' };

  const course = lesson.module.course;

  // Admins and the course instructor always allowed
  if (user.role === 'ADMIN' || user.id === course.instructorId) {
    return { allowed: true, courseSlug: course.slug };
  }

  // Free preview lessons accessible to any signed-in user
  if (lesson.isFreePreview) {
    return { allowed: true, courseSlug: course.slug };
  }

  // Otherwise, must be enrolled
  const enrollment = await prisma.enrollment.findUnique({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    select: { id: true },
  });
  if (enrollment) return { allowed: true, courseSlug: course.slug };

  return {
    allowed: false,
    reason: 'You need to enroll in this course to view this lesson',
    courseSlug: course.slug,
  };
}

/**
 * Find the next/previous lesson in course order.
 */
export function findAdjacentLessons<
  L extends { id: string; order: number; title: string },
  M extends { order: number; lessons: L[] }
>(modules: M[], currentLessonId: string): { prev: L | null; next: L | null } {
  // Flatten in course order
  const flat: L[] = [];
  for (const mod of modules) {
    for (const lesson of mod.lessons) {
      flat.push(lesson);
    }
  }
  const idx = flat.findIndex((l) => l.id === currentLessonId);
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
