'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireInstructorOrAdmin } from '@/lib/admin';

export type WebinarActionState = {
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
};

const VALID_STATUSES = ['SCHEDULED', 'LIVE', 'COMPLETED', 'CANCELLED'] as const;
type WebinarStatusValue = (typeof VALID_STATUSES)[number];

function validateUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function validateZoomOrMeet(url: string): boolean {
  if (!validateUrl(url)) return false;
  const u = new URL(url);
  const host = u.hostname.toLowerCase();
  return (
    host.endsWith('zoom.us') ||
    host.endsWith('zoom.com') ||
    host.endsWith('meet.google.com') ||
    host.endsWith('teams.microsoft.com') ||
    host.endsWith('teams.live.com')
  );
}

export async function createWebinar(
  _prev: WebinarActionState,
  formData: FormData
): Promise<WebinarActionState> {
  const me = await requireInstructorOrAdmin();

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const scheduledAtStr = String(formData.get('scheduledAt') ?? '').trim();
  const durationStr = String(formData.get('durationMinutes') ?? '60').trim();
  const joinUrl = String(formData.get('joinUrl') ?? '').trim();
  const courseId = String(formData.get('courseId') ?? '').trim();
  const enrolledOnly = formData.get('enrolledOnly') === 'on';

  const errors: Record<string, string> = {};
  if (!title || title.length < 4) errors.title = 'Min 4 characters';
  if (title.length > 200) errors.title = 'Max 200 characters';

  const scheduledAt = scheduledAtStr ? new Date(scheduledAtStr) : null;
  if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) {
    errors.scheduledAt = 'Pick a valid date/time';
  } else if (scheduledAt.getTime() < Date.now() - 60_000) {
    errors.scheduledAt = 'Date must be in the future';
  }

  const durationMinutes = parseInt(durationStr, 10);
  if (Number.isNaN(durationMinutes) || durationMinutes < 5 || durationMinutes > 600) {
    errors.durationMinutes = '5–600 minutes';
  }

  if (!joinUrl) {
    errors.joinUrl = 'Required';
  } else if (!validateZoomOrMeet(joinUrl)) {
    errors.joinUrl = 'Must be a Zoom, Google Meet, or Teams URL';
  }

  if (courseId) {
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) errors.courseId = 'Course not found';
    else if (me.role === 'INSTRUCTOR' && course.instructorId !== me.id) {
      errors.courseId = 'Not your course';
    }
  }

  if (Object.keys(errors).length > 0) return { errors };

  try {
    await prisma.webinar.create({
      data: {
        title,
        description: description || null,
        scheduledAt: scheduledAt!,
        durationMinutes,
        joinUrl,
        courseId: courseId || null,
        hostId: me.id,
        enrolledOnly,
        status: 'SCHEDULED',
      },
    });
  } catch (err) {
    console.error('Webinar create failed:', err);
    return { errors: { _form: 'Could not create webinar.' } };
  }

  revalidatePath('/admin/webinars');
  revalidatePath('/dashboard');
  redirect('/admin/webinars');
}

export async function updateWebinar(
  _prev: WebinarActionState,
  formData: FormData
): Promise<WebinarActionState> {
  const me = await requireInstructorOrAdmin();
  const webinarId = String(formData.get('webinarId') ?? '').trim();
  if (!webinarId) return { errors: { _form: 'Missing webinarId' } };

  const existing = await prisma.webinar.findUnique({ where: { id: webinarId } });
  if (!existing) return { errors: { _form: 'Not found' } };
  if (me.role !== 'ADMIN' && existing.hostId !== me.id) {
    return { errors: { _form: 'You can only edit webinars you host.' } };
  }

  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const scheduledAtStr = String(formData.get('scheduledAt') ?? '').trim();
  const durationStr = String(formData.get('durationMinutes') ?? '60').trim();
  const joinUrl = String(formData.get('joinUrl') ?? '').trim();
  const recordingUrl = String(formData.get('recordingUrl') ?? '').trim();
  const courseId = String(formData.get('courseId') ?? '').trim();
  const status = String(formData.get('status') ?? 'SCHEDULED').trim();
  const enrolledOnly = formData.get('enrolledOnly') === 'on';

  const errors: Record<string, string> = {};
  if (!title || title.length < 4) errors.title = 'Min 4 characters';
  const scheduledAt = scheduledAtStr ? new Date(scheduledAtStr) : null;
  if (!scheduledAt || Number.isNaN(scheduledAt.getTime())) errors.scheduledAt = 'Invalid date';
  const durationMinutes = parseInt(durationStr, 10);
  if (Number.isNaN(durationMinutes) || durationMinutes < 5) errors.durationMinutes = 'Invalid duration';
  if (!joinUrl || !validateZoomOrMeet(joinUrl)) errors.joinUrl = 'Must be a Zoom/Meet/Teams URL';
  if (recordingUrl && !validateUrl(recordingUrl)) errors.recordingUrl = 'Invalid URL';
  if (!VALID_STATUSES.includes(status as WebinarStatusValue)) errors.status = 'Invalid status';

  if (Object.keys(errors).length > 0) return { errors };

  try {
    await prisma.webinar.update({
      where: { id: webinarId },
      data: {
        title,
        description: description || null,
        scheduledAt: scheduledAt!,
        durationMinutes,
        joinUrl,
        recordingUrl: recordingUrl || null,
        courseId: courseId || null,
        status: status as WebinarStatusValue,
        enrolledOnly,
      },
    });
  } catch (err) {
    console.error('Webinar update failed:', err);
    return { errors: { _form: 'Could not save.' } };
  }

  revalidatePath('/admin/webinars');
  revalidatePath('/dashboard');
  return { success: true, message: 'Saved' };
}

export async function deleteWebinar(
  _prev: WebinarActionState,
  formData: FormData
): Promise<WebinarActionState> {
  const me = await requireInstructorOrAdmin();
  const webinarId = String(formData.get('webinarId') ?? '').trim();
  if (!webinarId) return { errors: { _form: 'Missing webinarId' } };

  const existing = await prisma.webinar.findUnique({ where: { id: webinarId } });
  if (!existing) return { errors: { _form: 'Not found' } };
  if (me.role !== 'ADMIN' && existing.hostId !== me.id) {
    return { errors: { _form: 'Not your webinar.' } };
  }

  try {
    await prisma.webinar.delete({ where: { id: webinarId } });
  } catch (err) {
    console.error('Webinar delete failed:', err);
    return { errors: { _form: 'Could not delete.' } };
  }

  revalidatePath('/admin/webinars');
  redirect('/admin/webinars');
}
