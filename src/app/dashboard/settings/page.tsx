import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/marketing/navbar';
import { getOrCreateCurrentUser } from '@/lib/auth';
import { SettingsForms } from './settings-form';

export const metadata = {
  title: 'Settings — Unified Automation',
};

export default async function SettingsPage() {
  const user = await getOrCreateCurrentUser();
  if (!user) redirect('/sign-in');

  const clerkUser = await currentUser();

  // Detect which social providers are linked via Clerk
  const providers: string[] = [];
  if (clerkUser?.externalAccounts) {
    for (const acct of clerkUser.externalAccounts) {
      const provider = acct.provider?.replace(/^oauth_/, '');
      if (provider) providers.push(provider.charAt(0).toUpperCase() + provider.slice(1));
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-ink/10 bg-grid">
          <div className="mx-auto max-w-5xl px-6 py-12 lg:px-10 lg:py-16">
            <div className="mb-4 flex items-center gap-2 font-mono text-xs text-ink-subtle">
              <Link href="/dashboard" className="hover:text-ink">Dashboard</Link>
              <span>/</span>
              <span>Settings</span>
            </div>
            <h1 className="font-display text-display-2 font-semibold tracking-tight">
              <em className="font-normal italic text-ink-muted">Settings</em>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted">
              Manage email preferences, export your data, or delete your account.
              For profile details (name, college, status), use{' '}
              <Link
                href="/dashboard/profile"
                className="underline decoration-accent decoration-2 underline-offset-2 hover:text-ink"
              >
                Edit profile
              </Link>{' '}
              instead.
            </p>
          </div>
        </section>

        <section className="bg-bg-alt/40 py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-6 lg:px-10">
            <SettingsForms
              emailNotifications={user.emailNotifications}
              marketingEmails={user.marketingEmails}
              connectedProviders={providers}
            />
          </div>
        </section>
      </main>
    </>
  );
}
