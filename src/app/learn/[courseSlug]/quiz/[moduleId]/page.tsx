import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateCurrentUser } from '@/lib/auth';
import { QuizForm } from '@/components/learn/quiz-form';

interface PageProps {
  params: Promise<{ courseSlug: string; moduleId: string }>;
}

interface RawOption {
  id: string;
  text: string;
}

export default async function ModuleQuizPage({ params }: PageProps) {
  const { courseSlug, moduleId } = await params;
  const user = await getOrCreateCurrentUser();
  if (!user) redirect(`/sign-in?redirect=/learn/${courseSlug}/quiz/${moduleId}`);

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      course: { select: { id: true, slug: true, instructorId: true, title: true } },
      quizzes: {
        include: { questions: { orderBy: { order: 'asc' } } },
      },
    },
  });
  if (!mod) notFound();

  // Access check
  let allowed = user.role === 'ADMIN' || user.id === mod.course.instructorId;
  if (!allowed) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: mod.course.id } },
      select: { id: true },
    });
    allowed = !!enrollment;
  }
  if (!allowed) redirect(`/courses/${courseSlug}`);

  // Use the first quiz on the module (we only allow one per module for now)
  const quiz = mod.quizzes[0];
  if (!quiz) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <div className="eyebrow mb-3">[ No quiz yet ]</div>
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          This module doesn't have a quiz
        </h1>
        <p className="mt-4 text-ink-muted">
          The instructor hasn't added a quiz for "{mod.title}" yet.
        </p>
      </main>
    );
  }

  // Strip correct answers from the data sent to the client
  const safeQuestions = quiz.questions.map((q) => {
    let parsedOptions: RawOption[] = [];
    try {
      const raw = q.options as unknown;
      parsedOptions = Array.isArray(raw) ? (raw as RawOption[]) : [];
    } catch {
      parsedOptions = [];
    }
    return {
      id: q.id,
      text: q.text,
      options: parsedOptions.map((o) => ({ id: o.id, text: o.text })),
    };
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12 lg:px-10 lg:py-16">
      <QuizForm
        quizId={quiz.id}
        quizTitle={quiz.title || `${mod.title} — Quiz`}
        passingScore={quiz.passingScore}
        questions={safeQuestions}
        courseSlug={courseSlug}
        backHref={`/learn/${courseSlug}`}
      />
    </main>
  );
}
