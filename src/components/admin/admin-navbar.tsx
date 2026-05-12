'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';

const links = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/courses', label: 'Courses' },
  { href: '/admin/enrollments', label: 'Enrollments' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/coupons', label: 'Coupons' },
  { href: '/admin/webinars', label: 'Webinars' },
];

export function AdminNavbar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + '/');
  }

  return (
    <header className="border-b border-ink/20 bg-ink text-bg">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-6 py-3 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/admin" className="font-display text-lg font-semibold tracking-tight">
            UA<span className="text-accent">/</span>Admin
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
                  isActive(l.href, l.exact)
                    ? 'bg-accent text-ink'
                    : 'text-bg/70 hover:bg-bg/10 hover:text-bg'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-4">
          <span className="hidden font-mono text-xs uppercase tracking-wider text-bg/50 md:inline">
            {userRole === 'ADMIN' ? '[ Admin ]' : '[ Instructor ]'}
          </span>
          <Link
            href="/dashboard"
            className="font-mono text-xs uppercase tracking-wider text-bg/70 transition hover:text-bg"
          >
            Exit admin →
          </Link>
          <UserButton
            appearance={{ elements: { avatarBox: 'w-8 h-8 ring-1 ring-bg/20' } }}
          />
        </div>
      </div>

      {/* Mobile nav — horizontal scroll */}
      <div className="border-t border-bg/10 md:hidden">
        <nav className="flex gap-1 overflow-x-auto px-6 py-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`shrink-0 rounded-full px-3 py-1.5 font-mono text-xs uppercase tracking-wider ${
                isActive(l.href, l.exact)
                  ? 'bg-accent text-ink'
                  : 'text-bg/70'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
