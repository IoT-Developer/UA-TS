import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import { Fraunces, Geist, JetBrains_Mono } from 'next/font/google';
import './globals.css';

// Display: Fraunces — characterful, editorial, optical-size variable
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  axes: ['SOFT', 'WONK', 'opsz'],
});

// Body: Geist — clean, technical, distinctive
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

// Mono: JetBrains Mono — for technical labels and code
const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Unified Automation — Engineering, Trained Differently',
  description:
    'Project-based tracks in IoT, embedded systems, industrial automation, and applied ML — built for engineering students who want real skills, not slides.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Unified Automation',
    description: 'Engineering, trained differently.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${fraunces.variable} ${geist.variable} ${jetbrains.variable}`}
      >
        <body className="bg-bg text-ink antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
