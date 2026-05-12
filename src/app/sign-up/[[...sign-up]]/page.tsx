import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-grid p-6">
      <div className="w-full max-w-md">
        <a href="/" className="mb-8 block text-center font-display text-2xl font-semibold tracking-tight">
          Unified<span className="text-accent">/</span>Automation
        </a>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'bg-bg border border-ink/15 shadow-sm rounded-2xl',
              headerTitle: 'font-display text-2xl',
              formButtonPrimary: 'bg-ink hover:bg-accent transition',
            },
          }}
        />
      </div>
    </div>
  );
}
