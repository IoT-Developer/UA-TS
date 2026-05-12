'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';

export type CourseActionState = {
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
  courseId?: string;
};

const VALID_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
const VALID_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'] as const;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function parseStringArray(value: FormDataEntryValue | null): string[] {
  if (!value) return [];
  return String(value)
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createCourse(
  _prev: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  const me = await requireInstructorOrAdmin();

  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const level = String(formData.get('level') ?? '').trim();
  const categoryId = String(formData.get('categoryId') ?? '').trim();
  const priceStr = String(formData.get('priceInRupees') ?? '').trim();
  const mrpStr = String(formData.get('mrpInRupees') ?? '').trim();

  const errors: Record<string, string> = {};
  if (!title || title.length < 4) errors.title = 'Min 4 characters';
  if (title.length > 120) errors.title = 'Max 120 characters';
  if (!description || description.length < 20) errors.description = 'Min 20 characters';
  if (!VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) errors.level = 'Invalid level';
  if (!categoryId) errors.categoryId = 'Select a category';

  const priceInRupees = parseInt(priceStr || '0', 10);
  if (Number.isNaN(priceInRupees) || priceInRupees < 0) errors.priceInRupees = 'Invalid price';
  const mrpInRupees = parseInt(mrpStr || '0', 10);
  if (mrpInRupees < priceInRupees) errors.mrpInRupees = 'MRP must be >= price';

  if (Object.keys(errors).length > 0) return { errors };

  // Generate unique slug
  let baseSlug = slugify(title);
  if (!baseSlug) baseSlug = `course-${Date.now()}`;
  let slug = baseSlug;
  let counter = 1;
  while (await prisma.course.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter++}`;
    if (counter > 100) {
      return { errors: { _form: 'Could not generate a unique slug. Try a different title.' } };
    }
  }

  let course;
  try {
    course = await prisma.course.create({
      data: {
        slug,
        title,
        subtitle: subtitle || null,
        description,
        level: level as (typeof VALID_LEVELS)[number],
        status: 'DRAFT',
        priceInPaise: priceInRupees * 100,
        mrpInPaise: mrpInRupees * 100,
        categoryId,
        instructorId: me.id,
      },
    });
  } catch (err) {
    console.error('Course create failed:', err);
    return { errors: { _form: 'Could not create course.' } };
  }

  revalidatePath('/admin/courses');
  redirect(`/admin/courses/${course.id}/edit`);
}

export async function updateCourse(
  _prev: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  const me = await requireInstructorOrAdmin();
  const courseId = String(formData.get('courseId') ?? '').trim();
  if (!courseId) return { errors: { _form: 'Missing courseId' } };

  // Ownership check for instructors
  const existing = await prisma.course.findUnique({ where: { id: courseId } });
  if (!existing) return { errors: { _form: 'Course not found' } };
  if (me.role !== 'ADMIN' && existing.instructorId !== me.id) {
    return { errors: { _form: 'You can only edit your own courses' } };
  }

  const title = String(formData.get('title') ?? '').trim();
  const subtitle = String(formData.get('subtitle') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const level = String(formData.get('level') ?? '').trim();
  const status = String(formData.get('status') ?? '').trim();
  const categoryId = String(formData.get('categoryId') ?? '').trim();
  const priceStr = String(formData.get('priceInRupees') ?? '').trim();
  const mrpStr = String(formData.get('mrpInRupees') ?? '').trim();
  const whatYoullLearn = parseStringArray(formData.get('whatYoullLearn'));
  const prerequisites = parseStringArray(formData.get('prerequisites'));
  const targetAudience = parseStringArray(formData.get('targetAudience'));
  const coverImageUrl = String(formData.get('coverImageUrl') ?? '').trim();
  const thumbnailUrl = String(formData.get('thumbnailUrl') ?? '').trim();
  const techStackJson = String(formData.get('techStack') ?? '[]');

  let techStack: { slug: string; name: string; iconUrl: string }[] = [];
  try {
    const parsed = JSON.parse(techStackJson);
    if (Array.isArray(parsed)) {
      techStack = parsed.filter(
        (t) =>
          t &&
          typeof t.slug === 'string' &&
          typeof t.name === 'string' &&
          typeof t.iconUrl === 'string'
      );
    }
  } catch {
    techStack = [];
  }

  const errors: Record<string, string> = {};
  if (!title || title.length < 4) errors.title = 'Min 4 characters';
  if (!description || description.length < 20) errors.description = 'Min 20 characters';
  if (!VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) errors.level = 'Invalid level';
  if (!VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number])) errors.status = 'Invalid status';
  if (!categoryId) errors.categoryId = 'Required';

  const priceInRupees = parseInt(priceStr || '0', 10);
  if (Number.isNaN(priceInRupees) || priceInRupees < 0) errors.priceInRupees = 'Invalid price';
  const mrpInRupees = parseInt(mrpStr || '0', 10);
  if (mrpInRupees < priceInRupees) errors.mrpInRupees = 'MRP must be >= price';

  if (Object.keys(errors).length > 0) return { errors };

  try {
    await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        subtitle: subtitle || null,
        description,
        level: level as (typeof VALID_LEVELS)[number],
        status: status as (typeof VALID_STATUSES)[number],
        priceInPaise: priceInRupees * 100,
        mrpInPaise: mrpInRupees * 100,
        categoryId,
        whatYoullLearn,
        prerequisites,
        targetAudience,
        coverImageUrl: coverImageUrl || null,
        thumbnailUrl: thumbnailUrl || null,
        techStack: techStack,
        publishedAt:
          status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });
  } catch (err) {
    console.error('Course update failed:', err);
    return { errors: { _form: 'Could not update course.' } };
  }

  revalidatePath('/admin/courses');
  revalidatePath(`/admin/courses/${courseId}/edit`);
  revalidatePath(`/courses/${existing.slug}`);
  return { success: true, message: 'Course saved', courseId };
}

export async function deleteCourse(
  _prev: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  const me = await requireInstructorOrAdmin();
  const courseId = String(formData.get('courseId') ?? '').trim();
  if (!courseId) return { errors: { _form: 'Missing courseId' } };

  const existing = await prisma.course.findUnique({
    where: { id: courseId },
    include: { _count: { select: { enrollments: true } } },
  });
  if (!existing) return { errors: { _form: 'Course not found' } };
  if (me.role !== 'ADMIN' && existing.instructorId !== me.id) {
    return { errors: { _form: 'You can only delete your own courses' } };
  }
  if (existing._count.enrollments > 0) {
    return {
      errors: {
        _form: `Has ${existing._count.enrollments} enrollments. Archive instead of delete.`,
      },
    };
  }

  try {
    await prisma.course.delete({ where: { id: courseId } });
  } catch (err) {
    console.error('Course delete failed:', err);
    return { errors: { _form: 'Could not delete course.' } };
  }

  revalidatePath('/admin/courses');
  redirect('/admin/courses');
}

/* ------------ Modules + Lessons ------------ */

export async function createModule(
  _prev: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  const me = await requireInstructorOrAdmin();
  const courseId = String(formData.get('courseId') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  if (!courseId || !title) return { errors: { _form: 'Course and title required' } };

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) return { errors: { _form: 'Course not found' } };
  if (me.role !== 'ADMIN' && course.instructorId !== me.id) {
    return { errors: { _form: 'Not your course' } };
  }

  const maxOrder = await prisma.module.findFirst({
    where: { courseId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  await prisma.module.create({
    data: { courseId, title, order: (maxOrder?.order ?? -1) + 1 },
  });

  revalidatePath(`/admin/courses/${courseId}/edit`);
  return { success: true, message: 'Module added' };
}

export async function createLesson(
  _prev: CourseActionState,
  formData: FormData
): Promise<CourseActionState> {
  const me = await requireInstructorOrAdmin();
  const moduleId = String(formData.get('moduleId') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const type = String(formData.get('type') ?? 'VIDEO').trim();
  const videoId = String(formData.get('videoId') ?? '').trim();
  const durationStr = String(formData.get('durationSeconds') ?? '0').trim();
  const isFreePreview = formData.get('isFreePreview') === 'on';

  if (!moduleId || !title) return { errors: { _form: 'Module and title required' } };

  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!mod) return { errors: { _form: 'Module not found' } };
  if (me.role !== 'ADMIN' && mod.course.instructorId !== me.id) {
    return { errors: { _form: 'Not your course' } };
  }

  const maxOrder = await prisma.lesson.findFirst({
    where: { moduleId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });

  await prisma.lesson.create({
    data: {
      moduleId,
      title,
      type: type as 'VIDEO' | 'TEXT' | 'PDF',
      videoId: videoId || null,
      durationSeconds: parseInt(durationStr, 10) || 0,
      isFreePreview,
      order: (maxOrder?.order ?? -1) + 1,
    },
  });

  // Recompute course aggregates
  await recomputeCourseAggregates(mod.courseId);

  revalidatePath(`/admin/courses/${mod.courseId}/edit`);
  return { success: true, message: 'Lesson added' };
}

export async function deleteModule(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const me = await requireInstructorOrAdmin();
  const moduleId = String(formData.get('moduleId') ?? '').trim();
  if (!moduleId) return { errors: { _form: 'Missing moduleId' } };
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: { course: true },
  });
  if (!mod) return { errors: { _form: 'Not found' } };
  if (me.role !== 'ADMIN' && mod.course.instructorId !== me.id) {
    return { errors: { _form: 'Not your course' } };
  }
  await prisma.module.delete({ where: { id: moduleId } });
  await recomputeCourseAggregates(mod.courseId);
  revalidatePath(`/admin/courses/${mod.courseId}/edit`);
  return { success: true, message: 'Module deleted' };
}

export async function deleteLesson(_prev: CourseActionState, formData: FormData): Promise<CourseActionState> {
  const me = await requireInstructorOrAdmin();
  const lessonId = String(formData.get('lessonId') ?? '').trim();
  if (!lessonId) return { errors: { _form: 'Missing lessonId' } };
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: { module: { include: { course: true } } },
  });
  if (!lesson) return { errors: { _form: 'Not found' } };
  if (me.role !== 'ADMIN' && lesson.module.course.instructorId !== me.id) {
    return { errors: { _form: 'Not your course' } };
  }
  await prisma.lesson.delete({ where: { id: lessonId } });
  await recomputeCourseAggregates(lesson.module.courseId);
  revalidatePath(`/admin/courses/${lesson.module.courseId}/edit`);
  return { success: true, message: 'Lesson deleted' };
}

/**
 * Recompute cached lessonCount and durationMinutes on the course.
 */
async function recomputeCourseAggregates(courseId: string) {
  const lessons = await prisma.lesson.findMany({
    where: { module: { courseId } },
    select: { durationSeconds: true },
  });
  const totalSeconds = lessons.reduce((sum, l) => sum + l.durationSeconds, 0);
  await prisma.course.update({
    where: { id: courseId },
    data: {
      lessonCount: lessons.length,
      durationMinutes: Math.round(totalSeconds / 60),
    },
  });
}
