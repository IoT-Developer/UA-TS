import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';
import { AdminPageHeader } from '@/components/admin/ui';
import { EditCourseForm } from './edit-course-form';
import { ModulesEditor } from './modules-editor';

export const metadata = { title: 'Edit Course — Admin' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCoursePage({ params }: PageProps) {
  const me = await requireInstructorOrAdmin();
  const { id } = await params;

  const [course, categories] = await Promise.all([
    prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: {
            lessons: { orderBy: { order: 'asc' } },
            quizzes: { select: { id: true, title: true, _count: { select: { questions: true } } } },
          },
          orderBy: { order: 'asc' },
        },
      },
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ]);

  if (!course) notFound();

  // Ownership check for instructors
  if (me.role === 'INSTRUCTOR' && course.instructorId !== me.id) {
    redirect('/admin/courses');
  }

  // Normalize techStack JSON
  const techStackArr = Array.isArray(course.techStack)
    ? (course.techStack as { slug: string; name: string; iconUrl: string }[]).filter(
        (t) => t && typeof t.slug === 'string' && typeof t.name === 'string' && typeof t.iconUrl === 'string'
      )
    : [];

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Courses / Edit"
        title={course.title}
        subtitle={`Status: ${course.status} · ${course.lessonCount} lessons · /${course.slug}`}
        action={
          <Link
            href={`/courses/${course.slug}`}
            className="font-mono text-xs uppercase tracking-wider text-ink-muted hover:text-ink"
            target="_blank"
          >
            View public page ↗
          </Link>
        }
      />

      <div className="mx-auto max-w-5xl space-y-8 px-6 py-8 lg:px-8">
        <EditCourseForm
          course={{
            id: course.id,
            slug: course.slug,
            title: course.title,
            subtitle: course.subtitle,
            description: course.description,
            level: course.level,
            status: course.status,
            priceInPaise: course.priceInPaise,
            mrpInPaise: course.mrpInPaise,
            categoryId: course.categoryId,
            whatYoullLearn: course.whatYoullLearn,
            prerequisites: course.prerequisites,
            targetAudience: course.targetAudience,
            coverImageUrl: course.coverImageUrl,
            thumbnailUrl: course.thumbnailUrl,
            techStack: techStackArr,
          }}
          categories={categories}
        />
        <ModulesEditor courseId={course.id} modules={course.modules} />
      </div>
    </>
  );
}
