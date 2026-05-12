import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';
import { AdminPageHeader } from '@/components/admin/ui';
import { WebinarForm } from '../../new/webinar-form';

export const metadata = { title: 'Edit Webinar — Admin' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWebinarPage({ params }: PageProps) {
  const me = await requireInstructorOrAdmin();
  const { id } = await params;

  const [webinar, courses] = await Promise.all([
    prisma.webinar.findUnique({ where: { id } }),
    prisma.course.findMany({
      where: me.role === 'INSTRUCTOR' ? { instructorId: me.id } : {},
      select: { id: true, title: true },
      orderBy: { title: 'asc' },
    }),
  ]);

  if (!webinar) notFound();
  if (me.role === 'INSTRUCTOR' && webinar.hostId !== me.id) redirect('/admin/webinars');

  return (
    <>
      <AdminPageHeader
        eyebrow="Admin / Webinars / Edit"
        title={webinar.title}
        subtitle={`Scheduled for ${new Intl.DateTimeFormat('en-IN', {
          dateStyle: 'full',
          timeStyle: 'short',
        }).format(webinar.scheduledAt)}`}
      />
      <div className="mx-auto max-w-3xl px-6 py-8 lg:px-8">
        <WebinarForm mode="edit" courses={courses} webinar={webinar} />
      </div>
    </>
  );
}
