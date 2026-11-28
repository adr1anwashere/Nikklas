'use client';
// Keeps <html lang> right after a client-side language switch, and plays the entry animation
// only the first time a page is opened (not again after a language or settings change).
import { useEffect } from 'react';
import { usePathname } from '@/i18n/navigation';

const seen = new Set<string>();

export default function HtmlLang({ locale }: { locale: string }) {
  const path = usePathname(); // without the locale prefix
  useEffect(() => {
    document.documentElement.lang = locale;
    requestAnimationFrame(() => window.dispatchEvent(new Event('nikklas:locale')));
  }, [locale]);
  useEffect(() => {
    const html = document.documentElement;
    if (seen.has(path)) html.dataset.still = '';
    else { seen.add(path); delete html.dataset.still; }
  }, [path]);
  return null;
}
