'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import Icon from '@/components/Icon';

export default function BottomNav() {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const navItems = [
    { href: '/feed', label: t('explore'), icon: 'compass' as const, active: pathname.startsWith('/feed') },
    { href: '/my-sessions', label: t('mySessions'), icon: 'seats' as const, active: pathname.startsWith('/my-sessions') },
    { href: '/settings', label: t('settings'), icon: 'user' as const, active: pathname.startsWith('/settings') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex justify-center shadow-md">
      <div className="w-full max-w-[480px] h-16 flex items-center justify-around px-4">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={item.active ? 'page' : undefined}
            className={`flex flex-col items-center justify-center gap-0.5 min-w-16 min-h-11 py-1 text-[13px] font-semibold transition-colors ${
              item.active
                ? 'text-primary-text font-semibold'
                : 'text-muted hover:text-text'
            }`}
          >
            <Icon name={item.icon} className="text-[22px]" />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
