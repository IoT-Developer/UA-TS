import { prisma } from '@/lib/prisma';
import type { User } from '@prisma/client';

export interface DashboardStats {
  enrollments: number;
  lessonsCompleted: number;
  minutesWatched: number;
  certificates: number;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [enrollments, lessons, watchAgg, certificates] = await Promise.all([
    prisma.enrollment.count({ where: { userId } }),
    prisma.lessonProgress.count({ where: { userId, completed: true } }),
    prisma.lessonProgress.aggregate({
      where: { userId },
      _sum: { watchedSeconds: true },
    }),
    prisma.certificate.count({ where: { userId } }),
  ]);

  return {
    enrollments,
    lessonsCompleted: lessons,
    minutesWatched: Math.round((watchAgg._sum.watchedSeconds || 0) / 60),
    certificates,
  };
}

/**
 * The student's most recent in-progress enrollment + next lesson to resume.
 * Returns null if no active enrollments or all are complete.
 */
export async function getContinueLearning(userId: string) {
  // Find most recent enrollment with progress < 100
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      progressPct: { lt: 100 },
    },
    include: {
      course: {
        include: {
          modules: {
            include: {
              lessons: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
      },
    },
    orderBy: { enrolledAt: 'desc' }, // proxy for last-accessed until we have lastAccessAt on enrollment
  });

  if (!enrollment) return null;

  // Find next incomplete lesson
  const completedIds = new Set(
    (
      await prisma.lessonProgress.findMany({
        where: { userId, completed: true },
        select: { lessonId: true },
      })
    ).map((p) => p.lessonId)
  );

  for (const mod of enrollment.course.modules) {
    for (const lesson of mod.lessons) {
      if (!completedIds.has(lesson.id)) {
        return {
          enrollment,
          nextModule: mod,
          nextLesson: lesson,
        };
      }
    }
  }

  return null;
}

/**
 * All active enrollments for the cards grid.
 */
export async function getEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: { course: { include: { category: true } } },
    orderBy: { enrolledAt: 'desc' },
  });
}

/**
 * Courses similar to what the user is enrolled in.
 * Strategy: same categories as enrolled courses, excluding already-enrolled.
 */
export async function getSuggestedTracks(userId: string, limit = 3) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true, course: { select: { categoryId: true } } },
  });

  if (enrollments.length === 0) return [];

  const categoryIds = [...new Set(enrollments.map((e) => e.course.categoryId))];
  const enrolledCourseIds = enrollments.map((e) => e.courseId);

  return prisma.course.findMany({
    where: {
      status: 'PUBLISHED',
      categoryId: { in: categoryIds },
      id: { notIn: enrolledCourseIds },
    },
    include: { category: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}

/**
 * Recent lesson activity (last N).
 */
export async function getRecentActivity(userId: string, limit = 5) {
  return prisma.lessonProgress.findMany({
    where: { userId },
    include: {
      lesson: {
        include: {
          module: {
            include: { course: { select: { title: true, slug: true } } },
          },
        },
      },
    },
    orderBy: { lastAccessAt: 'desc' },
    take: limit,
  });
}

/**
 * Upcoming webinars relevant to this user.
 *  - includes LIVE and SCHEDULED in the future or recently started
 *  - if `enrolledOnly` is true on the webinar, user must be enrolled in the linked course
 *  - if no linked course, visible to anyone signed in (admin's choice via enrolledOnly=false)
 */
export async function getUpcomingWebinars(userId: string, limit = 4) {
  // Cut-off for "upcoming or just-started": from 1h ago into the future
  const cutoff = new Date(Date.now() - 60 * 60_000);

  // Get user's enrolled course IDs (for filtering enrolledOnly webinars)
  const enrolledCourses = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true },
  });
  const enrolledCourseIds = enrolledCourses.map((e) => e.courseId);

  return prisma.webinar.findMany({
    where: {
      scheduledAt: { gte: cutoff },
      status: { in: ['SCHEDULED', 'LIVE'] },
      OR: [
        { enrolledOnly: false }, // open to anyone signed in
        { enrolledOnly: true, courseId: { in: enrolledCourseIds } }, // enrolled match
        { enrolledOnly: true, courseId: null }, // standalone enrolled-only — show to all (admin's call)
      ],
    },
    include: { course: { select: { title: true, slug: true } } },
    orderBy: { scheduledAt: 'asc' },
    take: limit,
  });
}

export function isUserActive(user: User) {
  return !user.deletedAt;
}
