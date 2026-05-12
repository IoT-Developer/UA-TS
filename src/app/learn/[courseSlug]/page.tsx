import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateCurrentUser } from '@/lib/auth';

interface PageProps {
  params: Promise<{ courseSlug: string }>;
}

export default async function CourseLearnLanding({ params }: PageProps) {
  const { courseSlug } = await params;
  const user = await getOrCreateCurrentUser();
  if (!user) redirect(`/sign-in?redirect=/learn/${courseSlug}`);

  const course = await prisma.course.findUnique({
    where: { slug: courseSlug },
    select: {
      id: true,
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: { orderBy: { order: 'asc' }, select: { id: true } },
        },
      },
    },
  });
  if (!course) notFound();

  // Flatten lessons in order
  const allLessons = course.modules.flatMap((m) => m.lessons);
  if (allLessons.length === 0) {
    // No lessons yet — bounce to course page with a note
    redirect(`/courses/${courseSlug}?empty=1`);
  }

  // Find first incomplete lesson for this user
  const progress = await prisma.lessonProgress.findMany({
    where: { userId: user.id, completed: true, lesson: { module: { courseId: course.id } } },
    select: { lessonId: true },
  });
  const completedIds = new Set(progress.map((p) => p.lessonId));

  const nextLesson = allLessons.find((l) => !completedIds.has(l.id)) || allLessons[0];
  redirect(`/learn/${courseSlug}/${nextLesson.id}`);
}
