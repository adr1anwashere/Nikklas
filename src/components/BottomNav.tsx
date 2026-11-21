'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

export default function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navItems = [
    { href: '/feed', label: t('explore'), active: pathname.startsWith('/feed') },
    { href: '/my-sessions', label: t('mySessions'), active: pathname.startsWith('/my-sessions') },
    { href: '/settings', label: t('settings'), active: pathname.startsWith('/settings') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex justify-center shadow-md">
      <div className="w-full max-w-[480px] h-16 flex items-center justify-around px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1 text-[13px] font-semibold transition-colors ${
              item.active
                ? 'text-primary-text font-bold'
                : 'text-muted hover:text-text'
            }`}
          >
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
