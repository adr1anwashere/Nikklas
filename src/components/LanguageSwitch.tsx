'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitch() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(newLocale: 'id' | 'en') {
    if (newLocale !== currentLocale) {
      router.replace(pathname, { locale: newLocale });
    }
  }

  return (
    <div className="flex items-center gap-1.5 p-1 bg-surface border border-border rounded-control shadow-sm">
      <button
        type="button"
        onClick={() => switchLocale('id')}
        className={`px-3 py-1 text-xs font-semibold rounded-control transition-colors ${
          currentLocale === 'id'
            ? 'bg-primary text-on-primary'
            : 'text-muted hover:text-text'
        }`}
        aria-label="Ganti ke Bahasa Indonesia"
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => switchLocale('en')}
        className={`px-3 py-1 text-xs font-semibold rounded-control transition-colors ${
          currentLocale === 'en'
            ? 'bg-primary text-on-primary'
            : 'text-muted hover:text-text'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
