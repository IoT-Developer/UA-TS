import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { getOrCreateCurrentUser } from '@/lib/auth';
import { profileCompletionPct } from '@/lib/utils';
import { ProfileForm } from './profile-form';

export const metadata = {
  title: 'Your Profile — Unified Automation',
};

export default async function ProfilePage() {
  const user = await getOrCreateCurrentUser();
  if (!user) redirect('/sign-in');

  const clerkUser = await currentUser();

  const completion = profileCompletionPct(user);

  // Pre-fill form with existing data
  const initialData = {
    name: user.name || clerkUser?.firstName || '',
    email: user.email,
    phone: user.phone || '',
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().split('T')[0]
      : '',
    college: user.college || '',
    branch: user.branch || '',
    yearOfStudy: user.yearOfStudy ? String(user.yearOfStudy) : '',
    academicStatus: user.academicStatus || '',
    avatarUrl: user.avatarUrl || '',
  };

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="border-b border-ink/10 bg-grid">
          <div className="mx-auto max-w-5xl px-6 py-14 lg:px-10 lg:py-20">
            <div className="mb-4 flex items-center gap-2 font-mono text-xs text-ink-subtle">
              <Link href="/dashboard" className="hover:text-ink">
                Dashboard
              </Link>
              <span>/</span>
              <span>Profile</span>
            </div>
            <h1 className="font-display text-display-2 font-semibold tracking-tight">
              Your <em className="font-normal italic text-ink-muted">profile</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted">
              Complete your profile to start enrolling in tracks. Used only for
              placement coordination and personalized course recommendations.
            </p>

            {/* Completion meter */}
            <div className="mt-10 max-w-md">
              <div className="mb-2 flex items-baseline justify-between font-mono text-xs uppercase tracking-wider">
                <span className="text-ink-muted">Profile complete</span>
                <span className={completion === 100 ? 'text-accent' : 'text-ink'}>
                  {completion}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-bg-alt">
                <div
                  className={`h-full transition-all ${
                    completion === 100 ? 'bg-accent' : 'bg-ink'
                  }`}
                  style={{ width: `${completion}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Form */}
        <section className="bg-bg-alt/40 py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <ProfileForm initialData={initialData} />
          </div>
        </section>
      </main>
    </>
  );
}
