'use client';

import { useSyncExternalStore } from 'react';

// Theme choice: 'system' follows the device, 'light' and 'dark' are fixed. Stored in this browser only.
export type ThemeChoice = 'system' | 'light' | 'dark';
const KEY = 'nikklas-theme';

export function getTheme(): ThemeChoice {
  if (typeof window === 'undefined') return 'system';
  const v = window.localStorage.getItem(KEY);
  return v === 'light' || v === 'dark' ? v : 'system';
}

export function setTheme(choice: ThemeChoice) {
  if (choice === 'system') {
    window.localStorage.removeItem(KEY);
    delete document.documentElement.dataset.theme;
  } else {
    window.localStorage.setItem(KEY, choice);
    document.documentElement.dataset.theme = choice;
  }
  window.dispatchEvent(new Event(KEY));
}

function subscribe(onChange: () => void) {
  window.addEventListener(KEY, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(KEY, onChange);
    window.removeEventListener('storage', onChange);
  };
}

// The current choice; the server always renders 'system'.
export function useThemeChoice(): ThemeChoice {
  return useSyncExternalStore(subscribe, getTheme, () => 'system');
}

// Runs before paint (inlined in the layout) so a saved theme never flashes.
export const THEME_BOOT = `try{var t=localStorage.getItem('${KEY}');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}`;
