// Root shell. It sits above [locale], so switching language is a soft navigation, not a full reload.
import { Fraunces, Figtree } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { THEME_BOOT } from '@/lib/theme';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', axes: ['SOFT', 'opsz'], display: 'swap' });
const figtree = Figtree({ subsets: ['latin'], variable: '--font-figtree', weight: ['400', '500', '600'], display: 'swap' });

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFF8F2' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1615' },
  ],
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Nikklas: find your study people',
  description: 'Find or post a study session for your course, class section and exam. Groups of 2 to 8, no phone numbers.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${fraunces.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        {/* Static script, no user input: applies the saved theme before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
