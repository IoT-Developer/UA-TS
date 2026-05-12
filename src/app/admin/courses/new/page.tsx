import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';
import { AdminPageHeader } from '@/components/admin/ui';
import { NewCourseForm } from './new-course-form';

export const metadata = { title: 'New Course — Admin' };

export default async function NewCoursePage() {
  await requireInstructorOrAdmin();
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    select: { id: true, name: true },
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Courses / New"
        title="Create a new course"
        subtitle="Start with the basics. You'll add modules, lessons, and full details on the next screen."
      />
      <div className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
        <NewCourseForm categories={categories} />
      </div>
    </>
  );
}
