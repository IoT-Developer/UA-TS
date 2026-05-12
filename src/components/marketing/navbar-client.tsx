'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

interface Props {
  role: string | null;
  avatarUrl: string | null;
  name: string | null;
}

export function NavbarClient({ role, avatarUrl, name }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const canAdmin = role === 'ADMIN' || role === 'INSTRUCTOR';

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
        {/* Wordmark */}
        <Link href="/" className="group flex items-baseline gap-2" onClick={() => setMobileOpen(false)}>
          <span className="font-display text-xl font-semibold tracking-tight md:text-2xl">
            Unified
            <span className="ml-1 text-accent">/</span>
            Automation
          </span>
        </Link>

        {/* Desktop center nav */}
        <nav className="hidden items-center gap-10 md:flex">
          <NavLink href="/courses" label="Tracks" index="01" />
          <NavLink href="/internships" label="Internships" index="02" />
          <NavLink href="/about" label="About" index="03" />
          <NavLink href="/verify" label="Verify Cert" index="04" />
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-3 md:gap-4">
          <SignedOut>
            <Link
              href="/sign-in"
              className="hidden font-mono text-xs uppercase tracking-wider text-ink-muted transition hover:text-ink md:inline"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="group relative hidden items-center gap-2 rounded-full bg-ink px-5 py-2.5 font-mono text-xs uppercase tracking-wider text-bg transition hover:bg-accent md:inline-flex"
            >
              Enroll
              <span className="transition group-hover:translate-x-0.5">→</span>
            </Link>
          </SignedOut>
          <SignedIn>
            {canAdmin && (
              <Link
                href="/admin"
                className="hidden rounded-full bg-ink px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-bg transition hover:bg-accent md:inline-block"
              >
                Admin
              </Link>
            )}
            <Link
              href="/dashboard"
              className="hidden font-mono text-xs uppercase tracking-wider text-ink-muted transition hover:text-ink md:inline"
            >
              Dashboard
            </Link>
            {avatarUrl ? (
              <div className="flex items-center gap-2">
                <Link href="/dashboard/profile" title={name || 'Profile'}>
                  <Image
                    src={avatarUrl}
                    alt={name || 'You'}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover ring-1 ring-ink/20"
                    unoptimized
                  />
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: 'hidden',
                      userButtonTrigger: 'p-0 m-0',
                    },
                  }}
                />
              </div>
            ) : (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 ring-1 ring-ink/20',
                  },
                }}
              />
            )}
          </SignedIn>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/20 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-ink/10 bg-bg md:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-6 py-6">
            <MobileLink href="/courses" label="Tracks" index="01" onClick={() => setMobileOpen(false)} />
            <MobileLink href="/internships" label="Internships" index="02" onClick={() => setMobileOpen(false)} />
            <MobileLink href="/about" label="About" index="03" onClick={() => setMobileOpen(false)} />
            <MobileLink href="/verify" label="Verify Cert" index="04" onClick={() => setMobileOpen(false)} />
            <div className="my-4 border-t border-ink/10" />
            <SignedOut>
              <MobileLink href="/sign-in" label="Sign in" index="·" onClick={() => setMobileOpen(false)} />
              <Link
                href="/sign-up"
                onClick={() => setMobileOpen(false)}
                className="mt-3 flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 font-mono text-xs uppercase tracking-wider text-bg transition hover:bg-accent"
              >
                Enroll <span>→</span>
              </Link>
            </SignedOut>
            <SignedIn>
              <MobileLink href="/dashboard" label="Dashboard" index="·" onClick={() => setMobileOpen(false)} />
              <MobileLink href="/dashboard/profile" label="Edit profile" index="·" onClick={() => setMobileOpen(false)} />
              <MobileLink href="/dashboard/webinars" label="Webinars" index="·" onClick={() => setMobileOpen(false)} />
              <MobileLink href="/dashboard/orders" label="Orders" index="·" onClick={() => setMobileOpen(false)} />
              <MobileLink href="/dashboard/settings" label="Settings" index="·" onClick={() => setMobileOpen(false)} />
              {canAdmin && (
                <>
                  <div className="my-4 border-t border-ink/10" />
                  <MobileLink href="/admin" label="Admin panel" index="★" onClick={() => setMobileOpen(false)} />
                </>
              )}
            </SignedIn>
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, label, index }: { href: string; label: string; index: string }) {
  return (
    <Link
      href={href}
      className="group relative flex items-baseline gap-1.5 text-sm text-ink transition hover:text-accent"
    >
      <span className="font-mono text-[0.65rem] text-ink-subtle group-hover:text-accent">
        [{index}]
      </span>
      <span>{label}</span>
    </Link>
  );
}

function MobileLink({
  href,
  label,
  index,
  onClick,
}: {
  href: string;
  label: string;
  index: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-baseline gap-3 rounded-lg px-3 py-2.5 text-base text-ink transition hover:bg-bg-alt"
    >
      <span className="font-mono text-xs text-ink-subtle">[{index}]</span>
      <span>{label}</span>
    </Link>
  );
}
