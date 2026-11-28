'use client';
// App navigation for every window size (Material 3 adaptive navigation):
// phone: bottom bar · tablet (768 px+): navigation rail · desktop (1024 px+): sidebar with the create button.
// data-app-nav tells globals.css to make room for the rail or sidebar.
import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitch from '@/components/LanguageSwitch';

export default function BottomNav({ desktopOnly = false }: { desktopOnly?: boolean }) {
  const t = useTranslations('nav');
  const tFeed = useTranslations('feed');
  const pathname = usePathname();
  // Rendered into <body>: an animated page (transform, filter) would otherwise pin the fixed bars to itself.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  const navItems = [
    { href: '/feed', label: t('explore'), icon: 'compass' as const, active: pathname.startsWith('/feed') || pathname.startsWith('/sessions/') && !pathname.endsWith('/new') },
    { href: '/my-sessions', label: t('mySessions'), icon: 'seats' as const, active: pathname.startsWith('/my-sessions') },
    { href: '/settings', label: t('settings'), icon: 'user' as const, active: pathname.startsWith('/settings') },
  ];

  return (
    <>
      <span data-app-nav hidden />
      {mounted && createPortal(
    <>
      {!desktopOnly && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-border flex justify-center">
          <div className="w-full max-w-[480px] h-16 flex items-center justify-around px-4 safe-bottom">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-16 min-h-11 py-1 text-[13px] font-semibold ${
                  item.active ? 'text-primary-text' : 'text-muted hover:text-text'
                }`}
              >
                <Icon name={item.icon} className="text-[22px]" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      <nav
        data-app-nav-bar
        aria-label={t('explore')}
        className="hidden md:flex fixed inset-y-0 left-0 z-30 w-[88px] lg:w-[256px] flex-col bg-surface border-r border-border px-3 lg:px-5 py-6"
      >
        <Link href="/feed" className="flex items-center justify-center lg:justify-start min-h-11 lg:px-2 mb-8 rounded-control">
          <Logo className="h-7 w-auto hidden lg:block" />
          <span className="lg:hidden font-display text-[26px] text-primary-text leading-none" aria-hidden="true">N</span>
          <span className="sr-only lg:hidden">Nikklas</span>
        </Link>

        <Link
          href="/sessions/new"
          className="mb-6 h-12 rounded-control bg-primary text-on-primary font-semibold text-[15px] flex items-center justify-center gap-2"
          aria-label={tFeed('createSession')}
        >
          <Icon name="plus" className="text-[20px]" />
          <span className="hidden lg:inline">{tFeed('createSession')}</span>
        </Link>

        <ul className="side-list relative flex flex-col gap-1" style={{ ['--i' as string]: Math.max(0, navItems.findIndex((x) => x.active)) }}>
          {navItems.some((x) => x.active) && <li aria-hidden="true" className="side-marker" />}
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={item.active ? 'page' : undefined}
                className={`side-item relative z-10 flex flex-col lg:flex-row items-center gap-1 lg:gap-3 h-14 lg:h-12 px-2 lg:px-4 rounded-control text-[12px] lg:text-[15px] font-semibold ${
                  item.active ? 'is-on text-primary-text' : 'text-text-2 hover:text-text'
                }`}
              >
                <Icon name={item.icon} className="text-[22px] mt-2 lg:mt-0" />
                <span className="text-center pb-1 lg:pb-0">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* the room's corner: theme and language live here on tablet and desktop */}
        <div className="mt-auto flex flex-col lg:flex-row items-center gap-2">
          <ThemeToggle />
          <div className="hidden lg:block"><LanguageSwitch /></div>
        </div>
      </nav>
    </>,
    document.body,
      )}
    </>
  );
}
