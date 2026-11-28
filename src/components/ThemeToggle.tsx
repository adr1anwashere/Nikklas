'use client';
// Light / dark toggle: the new theme spreads as a circle from the button, the sun turns into the moon. Settings still offers "System".
import { useSyncExternalStore } from 'react';
import { setTheme, useThemeChoice } from '@/lib/theme';

const dark = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
};
const subscribe = (cb: () => void) => {
  const mq = matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', cb);
  window.addEventListener('nikklas-theme', cb);
  return () => { mq.removeEventListener('change', cb); window.removeEventListener('nikklas-theme', cb); };
};

export default function ThemeToggle({ className = '' }: { className?: string }) {
  useThemeChoice();
  const isDark = useSyncExternalStore(subscribe, dark, () => false);

  // The new theme spreads as a circle from the button (View Transitions); nothing else moves.
  const toggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const next = isDark ? 'light' : 'dark';
    const html = document.documentElement;
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
    if (!doc.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      html.dataset.themeFade = '';
      setTheme(next);
      window.setTimeout(() => delete html.dataset.themeFade, 500);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    html.dataset.vt = 'theme';
    const vt = doc.startViewTransition(() => setTheme(next));
    vt.ready.then(() => {
      html.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.65,0,.35,1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
    vt.finished.finally(() => delete html.dataset.vt);
  };

  return (
    <button type="button" onClick={toggle} aria-pressed={isDark} aria-label={isDark ? 'Light mode' : 'Dark mode'}
      className={`theme-toggle w-11 h-11 rounded-full bg-surface border border-border text-text flex items-center justify-center cursor-pointer ${className}`}>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" aria-hidden="true"
        className="theme-icon" data-dark={isDark || undefined}>
        <mask id="moon-cut"><rect width="24" height="24" fill="#fff" /><circle className="moon-bite" cx="18" cy="6" r="6" fill="#000" /></mask>
        <circle className="sun-core" cx="12" cy="12" r="4.5" fill="currentColor" stroke="none" mask="url(#moon-cut)" />
        <g className="sun-rays">
          <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
        </g>
      </svg>
    </button>
  );
}
