import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateCurrentUser } from '@/lib/auth';
import { userCanAccessLesson } from '@/lib/lesson-access';

export async function POST(req: Request) {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  let body: { lessonId?: string; watchedSeconds?: number; completed?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { lessonId, watchedSeconds, completed } = body;
  if (!lessonId || typeof lessonId !== 'string') {
    return NextResponse.json({ error: 'lessonId required' }, { status: 400 });
  }
  if (watchedSeconds != null && (typeof watchedSeconds !== 'number' || watchedSeconds < 0)) {
    return NextResponse.json({ error: 'invalid watchedSeconds' }, { status: 400 });
  }

  // Verify access
  const access = await userCanAccessLesson(user, lessonId);
  if (!access.allowed) {
    return NextResponse.json({ error: access.reason }, { status: 403 });
  }

  // Get the lesson for course context
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { id: true, module: { select: { courseId: true } } },
  });
  if (!lesson) return NextResponse.json({ error: 'not found' }, { status: 404 });

  // Upsert progress — only advance watchedSeconds (never go backwards),
  // and once completed, stay completed.
  const existing = await prisma.lessonProgress.findUnique({
    where: { userId_lessonId: { userId: user.id, lessonId } },
  });

  const nextWatched =
    watchedSeconds != null
      ? Math.max(existing?.watchedSeconds || 0, Math.floor(watchedSeconds))
      : existing?.watchedSeconds || 0;
  const nextCompleted = existing?.completed || completed === true;

  await prisma.lessonProgress.upsert({
    where: { userId_lessonId: { userId: user.id, lessonId } },
    create: {
      userId: user.id,
      lessonId,
      watchedSeconds: nextWatched,
      completed: nextCompleted,
      lastAccessAt: new Date(),
    },
    update: {
      watchedSeconds: nextWatched,
      completed: nextCompleted,
      lastAccessAt: new Date(),
    },
  });

  // Recompute course progress percentage on the enrollment
  await recomputeEnrollmentProgress(user.id, lesson.module.courseId);

  return NextResponse.json({ ok: true, completed: nextCompleted });
}

/**
 * Recompute the cached progressPct on the user's enrollment.
 * Counts how many of the course's lessons the user has marked complete.
 */
async function recomputeEnrollmentProgress(userId: string, courseId: string) {
  const [totalLessons, completed] = await Promise.all([
    prisma.lesson.count({ where: { module: { courseId } } }),
    prisma.lessonProgress.count({
      where: {
        userId,
        completed: true,
        lesson: { module: { courseId } },
      },
    }),
  ]);

  const pct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : 0;
  const completedAt = pct === 100 ? new Date() : null;

  await prisma.enrollment.updateMany({
    where: { userId, courseId },
    data: {
      progressPct: pct,
      // Only stamp completedAt the first time we hit 100
      ...(completedAt && { completedAt }),
    },
  });
}
