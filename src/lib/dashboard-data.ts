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

export async function getContinueLearning(userId: string) {
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      userId,
      progressPct: { lt: 100 },
    },
    include: {
      course: {
        include: {
          category: true,
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
    orderBy: { enrolledAt: 'desc' },
  });

  if (!enrollment) return null;

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

export async function getEnrollments(userId: string) {
  return prisma.enrollment.findMany({
    where: { userId },
    include: { course: { include: { category: true } } },
    orderBy: { enrolledAt: 'desc' },
  });
}

export async function getSuggestedTracks(userId: string, limit = 3) {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    select: { courseId: true, course: { select: { categoryId: true } } },
  });

  if (enrollments.length === 0) return [];

  const categoryIds = [
    ...new Set(
      enrollments
        .map((e) => e.course.categoryId)
        .filter((id): id is string => Boolean(id))
    ),
  ];

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

export async function getUpcomingWebinars(userId: string, limit = 4) {
  const cutoff = new Date(Date.now() - 60 * 60_000);

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
        { enrolledOnly: false },
        { enrolledOnly: true, courseId: { in: enrolledCourseIds } },
        { enrolledOnly: true, courseId: null },
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