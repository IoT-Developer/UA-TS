'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';

export type QuizActionState = {
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
};

async function authorizeForModule(userId: string, role: string, moduleId: string) {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!mod) return null;
  if (role !== 'ADMIN' && mod.course.instructorId !== userId) return null;
  return mod;
}

export async function createQuiz(
  _prev: QuizActionState,
  formData: FormData
): Promise<QuizActionState> {
  const me = await requireInstructorOrAdmin();
  const moduleId = String(formData.get('moduleId') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const passingStr = String(formData.get('passingScore') ?? '60').trim();

  if (!moduleId) return { errors: { _form: 'Missing moduleId' } };
  if (!title || title.length < 3) return { errors: { title: 'Min 3 chars' } };

  const passingScore = parseInt(passingStr, 10);
  if (Number.isNaN(passingScore) || passingScore < 0 || passingScore > 100) {
    return { errors: { passingScore: '0–100' } };
  }

  const mod = await authorizeForModule(me.id, me.role, moduleId);
  if (!mod) return { errors: { _form: 'Module not found or not yours' } };

  // Enforce one quiz per module (current product decision)
  const existing = await prisma.quiz.findFirst({ where: { moduleId } });
  if (existing) {
    return { errors: { _form: 'This module already has a quiz' } };
  }

  const quiz = await prisma.quiz.create({
    data: { moduleId, title, passingScore },
  });

  revalidatePath(`/admin/courses/${mod.courseId}/edit`);
  redirect(`/admin/quizzes/${quiz.id}/edit`);
}

export async function updateQuizMeta(
  _prev: QuizActionState,
  formData: FormData
): Promise<QuizActionState> {
  const me = await requireInstructorOrAdmin();
  const quizId = String(formData.get('quizId') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const passingStr = String(formData.get('passingScore') ?? '60').trim();

  if (!quizId) return { errors: { _form: 'Missing quizId' } };
  if (!title || title.length < 3) return { errors: { title: 'Min 3 chars' } };

  const passingScore = parseInt(passingStr, 10);
  if (Number.isNaN(passingScore) || passingScore < 0 || passingScore > 100) {
    return { errors: { passingScore: '0–100' } };
  }

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: { include: { course: true } } },
  });
  if (!quiz) return { errors: { _form: 'Quiz not found' } };
  if (me.role !== 'ADMIN' && quiz.module.course.instructorId !== me.id) {
    return { errors: { _form: 'Not your course' } };
  }

  await prisma.quiz.update({
    where: { id: quizId },
    data: { title, passingScore },
  });

  revalidatePath(`/admin/quizzes/${quizId}/edit`);
  return { success: true, message: 'Saved' };
}

export async function deleteQuiz(
  _prev: QuizActionState,
  formData: FormData
): Promise<QuizActionState> {
  const me = await requireInstructorOrAdmin();
  const quizId = String(formData.get('quizId') ?? '').trim();
  if (!quizId) return { errors: { _form: 'Missing quizId' } };

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: { include: { course: true } } },
  });
  if (!quiz) return { errors: { _form: 'Not found' } };
  if (me.role !== 'ADMIN' && quiz.module.course.instructorId !== me.id) {
    return { errors: { _form: 'Not your course' } };
  }

  const courseId = quiz.module.courseId;
  await prisma.quiz.delete({ where: { id: quizId } });
  revalidatePath(`/admin/courses/${courseId}/edit`);
  redirect(`/admin/courses/${courseId}/edit`);
}

interface QuestionInput {
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  explanation?: string;
}

export async function addQuestion(
  _prev: QuizActionState,
  formData: FormData
): Promise<QuizActionState> {
  const me = await requireInstructorOrAdmin();
  const quizId = String(formData.get('quizId') ?? '').trim();
  const text = String(formData.get('text') ?? '').trim();
  const optA = String(formData.get('optionA') ?? '').trim();
  const optB = String(formData.get('optionB') ?? '').trim();
  const optC = String(formData.get('optionC') ?? '').trim();
  const optD = String(formData.get('optionD') ?? '').trim();
  const correct = String(formData.get('correct') ?? '').trim();
  const explanation = String(formData.get('explanation') ?? '').trim();

  const errors: Record<string, string> = {};
  if (!quizId) return { errors: { _form: 'Missing quizId' } };
  if (!text || text.length < 5) errors.text = 'Min 5 characters';
  if (!optA) errors.optionA = 'Required';
  if (!optB) errors.optionB = 'Required';
  if (!['a', 'b', 'c', 'd'].includes(correct)) errors.correct = 'Pick correct';
  if (correct === 'c' && !optC) errors.optionC = 'Required';
  if (correct === 'd' && !optD) errors.optionD = 'Required';
  if (Object.keys(errors).length > 0) return { errors };

  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: { module: { include: { course: true } } },
  });
  if (!quiz) return { errors: { _form: 'Quiz not found' } };
  if (me.role !== 'ADMIN' && quiz.module.course.instructorId !== me.id) {
    return { errors: { _form: 'Not your course' } };
  }

  const options = [
    { id: 'a', text: optA },
    { id: 'b', text: optB },
    ...(optC ? [{ id: 'c', text: optC }] : []),
    ...(optD ? [{ id: 'd', text: optD }] : []),
  ];

  const maxOrder = await prisma.question.findFirst({
    where: { quizId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  await prisma.question.create({
    data: {
      quizId,
      text,
      options,
      correctOptionId: correct,
      explanation: explanation || null,
      order: (maxOrder?.order ?? -1) + 1,
    },
  });

  revalidatePath(`/admin/quizzes/${quizId}/edit`);
  return { success: true, message: 'Question added' };
}

export async function deleteQuestion(
  _prev: QuizActionState,
  formData: FormData
): Promise<QuizActionState> {
  const me = await requireInstructorOrAdmin();
  const questionId = String(formData.get('questionId') ?? '').trim();
  if (!questionId) return { errors: { _form: 'Missing questionId' } };

  const q = await prisma.question.findUnique({
    where: { id: questionId },
    include: { quiz: { include: { module: { include: { course: true } } } } },
  });
  if (!q) return { errors: { _form: 'Not found' } };
  if (me.role !== 'ADMIN' && q.quiz.module.course.instructorId !== me.id) {
    return { errors: { _form: 'Not your course' } };
  }

  await prisma.question.delete({ where: { id: questionId } });
  revalidatePath(`/admin/quizzes/${q.quizId}/edit`);
  return { success: true, message: 'Question deleted' };
}
