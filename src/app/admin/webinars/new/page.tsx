import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';
import { AdminPageHeader } from '@/components/admin/ui';
import { WebinarForm } from './webinar-form';

export const metadata = { title: 'New Webinar — Admin' };

export default async function NewWebinarPage() {
  const me = await requireInstructorOrAdmin();
  const courses = await prisma.course.findMany({
    where: me.role === 'INSTRUCTOR' ? { instructorId: me.id } : {},
    select: { id: true, title: true },
    orderBy: { title: 'asc' },
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Webinars / New"
        title="Schedule a webinar"
        subtitle="Add the meeting URL once — students enrolled in the linked course see it on their dashboard."
      />
      <div className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
        <WebinarForm mode="create" courses={courses} />
      </div>
    </>
  );
}
