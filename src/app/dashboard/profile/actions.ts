'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { calculateAge } from '@/lib/utils';

export type ProfileFormState = {
  errors?: Record<string, string>;
  success?: boolean;
  message?: string;
};

const VALID_BRANCHES = [
  'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI_ML', 'BIOTECH', 'CHEMICAL', 'OTHER',
];

const VALID_ACADEMIC_STATUS = ['STUDENT', 'WORKING_PROFESSIONAL', 'JOB_SEEKER'] as const;
type AcademicStatusValue = typeof VALID_ACADEMIC_STATUS[number];

export async function updateProfile(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const { userId } = await auth();
  if (!userId) return { errors: { _form: 'Not authenticated. Please sign in again.' } };

  // Pull values
  const name = String(formData.get('name') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const dateOfBirthStr = String(formData.get('dateOfBirth') ?? '').trim();
  const college = String(formData.get('college') ?? '').trim();
  const branch = String(formData.get('branch') ?? '').trim();
  const yearStr = String(formData.get('yearOfStudy') ?? '').trim();
  const academicStatus = String(formData.get('academicStatus') ?? '').trim();
  const avatarUrl = String(formData.get('avatarUrl') ?? '').trim();

  // Validate
  const errors: Record<string, string> = {};

  if (!name) errors.name = 'Required';
  else if (name.length < 2) errors.name = 'Too short';
  else if (name.length > 80) errors.name = 'Too long';

  // Indian phone: 10 digits, optional +91. Strip non-digits.
  const phoneDigits = phone.replace(/\D/g, '');
  if (!phone) {
    errors.phone = 'Required';
  } else if (phoneDigits.length < 10 || phoneDigits.length > 13) {
    errors.phone = 'Enter a valid 10-digit phone number';
  }

  let dateOfBirth: Date | null = null;
  if (!dateOfBirthStr) {
    errors.dateOfBirth = 'Required';
  } else {
    dateOfBirth = new Date(dateOfBirthStr);
    if (Number.isNaN(dateOfBirth.getTime())) {
      errors.dateOfBirth = 'Invalid date';
    } else {
      const age = calculateAge(dateOfBirth);
      if (age === null) {
        errors.dateOfBirth = 'Invalid date';
      } else if (age < 16) {
        errors.dateOfBirth = 'You must be at least 16 years old';
      } else if (age > 100) {
        errors.dateOfBirth = 'Please enter a valid date of birth';
      }
    }
  }

  if (!college) errors.college = 'Required';
  else if (college.length > 200) errors.college = 'Too long';

  if (!branch) errors.branch = 'Required';
  else if (!VALID_BRANCHES.includes(branch)) errors.branch = 'Invalid branch';

  const yearOfStudy = parseInt(yearStr, 10);
  if (!yearStr) {
    errors.yearOfStudy = 'Required';
  } else if (Number.isNaN(yearOfStudy) || yearOfStudy < 1 || yearOfStudy > 5) {
    errors.yearOfStudy = 'Select your year';
  }

  if (!academicStatus) {
    errors.academicStatus = 'Required';
  } else if (!VALID_ACADEMIC_STATUS.includes(academicStatus as AcademicStatusValue)) {
    errors.academicStatus = 'Invalid status';
  }

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // Persist
  try {
    await prisma.user.update({
      where: { clerkId: userId },
      data: {
        name,
        phone: phoneDigits,
        dateOfBirth: dateOfBirth!,
        college,
        branch,
        yearOfStudy,
        academicStatus: academicStatus as AcademicStatusValue,
        avatarUrl: avatarUrl || null,
      },
    });
  } catch (err) {
    console.error('Profile update failed:', err);
    return { errors: { _form: 'Could not save. Please try again.' } };
  }

  // Refresh server components that depend on user data
  revalidatePath('/dashboard');
  revalidatePath('/dashboard/profile');

  return { success: true, message: 'Profile saved' };
}
