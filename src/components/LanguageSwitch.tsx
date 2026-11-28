'use client';
// ID / EN segmented switch: the thumb slides under the chosen language, the page cross-fades.
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

export default function LanguageSwitch() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isEn = currentLocale === 'en';

  function switchLocale(newLocale: 'id' | 'en') {
    if (newLocale === currentLocale) return;
    smoothSwitch(() => router.replace(pathname, { locale: newLocale, scroll: false }));
  }

  return (
    <div role="group" aria-label="Bahasa / Language" className="seg relative grid grid-cols-2 p-1 bg-surface border border-border rounded-full">
      <span aria-hidden="true" className="seg-thumb absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] rounded-full bg-peach"
        style={{ transform: `translateX(${isEn ? '100%' : '0'})` }} />
      {(['id', 'en'] as const).map((l) => (
        <button key={l} type="button" onClick={() => switchLocale(l)} aria-pressed={currentLocale === l}
          aria-label={l === 'id' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'}
          className={`relative z-10 min-w-11 h-9 px-3 text-[14px] font-semibold rounded-full transition-colors duration-300 ${currentLocale === l ? 'text-on-peach' : 'text-muted hover:text-text'}`}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

type VTDoc = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };

// Cross-fade with a short blur (View Transitions) while the page changes language; no reload.
export function smoothSwitch(go: () => void) {
  const doc = document as VTDoc;
  if (doc.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.dataset.vt = 'lang';
    // the new snapshot waits until the page in the new language has rendered (HtmlLang fires the event)
    const rendered = () => new Promise<void>((done) => {
      window.addEventListener('nikklas:locale', () => done(), { once: true });
      setTimeout(done, 1500);
      go();
    });
    doc.startViewTransition(rendered).finished.finally(() => delete document.documentElement.dataset.vt);
  } else {
    go();
  }
}
