import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';
import { AdminPageHeader } from '@/components/admin/ui';
import { QuizEditor } from './quiz-editor';

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata = { title: 'Edit Quiz — Admin' };

export default async function EditQuizPage({ params }: PageProps) {
  const me = await requireInstructorOrAdmin();
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: 'asc' } },
      module: { include: { course: true } },
    },
  });
  if (!quiz) notFound();
  if (me.role !== 'ADMIN' && quiz.module.course.instructorId !== me.id) {
    redirect('/admin/courses');
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Quiz"
        title={quiz.title || `${quiz.module.title} — Quiz`}
        subtitle={`${quiz.module.course.title} · ${quiz.module.title} · ${quiz.questions.length} questions`}
        action={
          <Link
            href={`/admin/courses/${quiz.module.courseId}/edit`}
            className="font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-ink"
          >
            ← Back to course
          </Link>
        }
      />
      <div className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
        <QuizEditor
          quiz={{
            id: quiz.id,
            title: quiz.title,
            passingScore: quiz.passingScore,
            questions: quiz.questions.map((q) => ({
              id: q.id,
              text: q.text,
              options: Array.isArray(q.options)
                ? (q.options as { id: string; text: string }[])
                : [],
              correctOptionId: q.correctOptionId,
            })),
          }}
        />
      </div>
    </>
  );
}
