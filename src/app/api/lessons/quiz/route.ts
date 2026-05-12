import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrCreateCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  const user = await getOrCreateCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  let body: {
    quizId?: string;
    answers?: { questionId: string; selectedOptionId: string }[];
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  const { quizId, answers } = body;
  if (!quizId || !Array.isArray(answers)) {
    return NextResponse.json({ error: 'quizId and answers required' }, { status: 400 });
  }

  // Load quiz + questions + verify course access
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: true,
      module: { include: { course: { select: { id: true, instructorId: true } } } },
    },
  });
  if (!quiz) return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });

  // Access check: enrolled, admin, or course instructor
  let allowed = user.role === 'ADMIN' || user.id === quiz.module.course.instructorId;
  if (!allowed) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: quiz.module.course.id } },
      select: { id: true },
    });
    allowed = !!enrollment;
  }
  if (!allowed) return NextResponse.json({ error: 'Enrollment required' }, { status: 403 });

  // Score
  type Question = { id: string; correctOptionId: string };
  const questionMap = new Map<string, Question>(
    (quiz.questions as Question[]).map((q) => [q.id, q])
  );
  let correct = 0;
  const sanitizedAnswers: { questionId: string; selectedOptionId: string }[] = [];
  for (const a of answers) {
    if (!a?.questionId || !a?.selectedOptionId) continue;
    const q = questionMap.get(a.questionId);
    if (!q) continue;
    sanitizedAnswers.push({
      questionId: a.questionId,
      selectedOptionId: a.selectedOptionId,
    });
    if (q.correctOptionId === a.selectedOptionId) correct++;
  }

  const total = quiz.questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= quiz.passingScore;

  await prisma.quizAttempt.create({
    data: {
      userId: user.id,
      quizId,
      answers: sanitizedAnswers,
      score,
      passed,
    },
  });

  return NextResponse.json({
    score,
    passed,
    correct,
    total,
    passingScore: quiz.passingScore,
  });
}
