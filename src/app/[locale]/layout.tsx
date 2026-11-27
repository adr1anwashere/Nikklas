import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Fraunces, Figtree } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import '../globals.css';
import { THEME_BOOT } from '@/lib/theme';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  axes: ['SOFT', 'opsz'],
  display: 'swap',
});

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  weight: ['400', '500', '600'],
  display: 'swap',
});

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

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as 'id' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${fraunces.variable} ${figtree.variable}`} suppressHydrationWarning>
      <head>
        {/* Static script, no user input: applies the saved theme before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="antialiased min-h-screen">
        <NextIntlClientProvider messages={messages}>
          <div className="min-h-screen flex flex-col items-center">
            <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-surface focus:px-4 focus:py-2 focus:rounded-control">{(messages as { common?: { skip?: string } }).common?.skip}</a>
            <main id="main" className="w-full max-w-[480px] min-h-screen flex flex-col px-5 py-4">
              {children}
            </main>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
