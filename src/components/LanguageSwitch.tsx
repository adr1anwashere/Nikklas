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
    <div role="group" aria-label="Bahasa / Language" className="flex items-center gap-1 p-1 bg-surface border border-edge rounded-control">
      <button
        type="button"
        onClick={() => switchLocale('id')}
        aria-pressed={currentLocale === 'id'}
        className={`min-w-11 h-9 px-3 text-[14px] font-semibold rounded-[12px] ${
          currentLocale === 'id'
            ? 'bg-peach text-on-peach'
            : 'text-muted hover:text-text'
        }`}
        aria-label="Ganti ke Bahasa Indonesia"
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => switchLocale('en')}
        aria-pressed={currentLocale === 'en'}
        className={`min-w-11 h-9 px-3 text-[14px] font-semibold rounded-[12px] ${
          currentLocale === 'en'
            ? 'bg-peach text-on-peach'
            : 'text-muted hover:text-text'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
