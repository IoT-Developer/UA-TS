import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind classes, resolving conflicts.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format paise (e.g. 99900) → "₹999".
 * All money in the DB is stored as paise (Int) to avoid float bugs.
 */
export function formatPrice(paise: number, options?: { showZero?: boolean }) {
  if (paise === 0 && !options?.showZero) return 'Free';
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rupees);
}

/**
 * Format minutes → "31h 12m" or "45m".
 */
export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

/**
 * Human relative time: "just now", "5m ago", "2h ago", "yesterday", "3d ago", "May 4".
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHr = Math.floor(diffMs / 3_600_000);
  const diffDay = Math.floor(diffMs / 86_400_000);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric' }).format(d);
}

/**
 * Generate a public certificate number like "UA-2026-A8X3K9".
 */
export function generateCertificateNo() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // unambiguous chars
  let suffix = '';
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `UA-${year}-${suffix}`;
}

/**
 * Compute age in years from a date of birth.
 * Returns null if no DOB provided. Never store the result — recompute on read.
 */
export function calculateAge(dob: Date | string | null | undefined): number | null {
  if (!dob) return null;
  const date = typeof dob === 'string' ? new Date(dob) : dob;
  if (Number.isNaN(date.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

/**
 * Required profile fields for a student to start enrolling.
 * Keep in sync with the form on /dashboard/profile.
 */
export interface ProfileFields {
  name: string | null;
  phone: string | null;
  dateOfBirth: Date | null;
  college: string | null;
  branch: string | null;
  yearOfStudy: number | null;
  academicStatus: string | null;
}

export function isProfileComplete(user: ProfileFields | null | undefined): boolean {
  if (!user) return false;
  return Boolean(
    user.name?.trim() &&
    user.phone?.trim() &&
    user.dateOfBirth &&
    user.college?.trim() &&
    user.branch?.trim() &&
    user.yearOfStudy &&
    user.academicStatus
  );
}

/**
 * Percentage of profile fields completed (0-100). Useful for the completion banner.
 */
export function profileCompletionPct(user: ProfileFields | null | undefined): number {
  if (!user) return 0;
  const fields = [
    user.name?.trim(),
    user.phone?.trim(),
    user.dateOfBirth,
    user.college?.trim(),
    user.branch?.trim(),
    user.yearOfStudy,
    user.academicStatus,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}
