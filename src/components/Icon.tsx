// Line icons for Nikklas (1.75 px stroke, 24 px grid). Decorative: hidden from screen readers.
type IconName = 'book' | 'search' | 'users' | 'lock' | 'calendar' | 'chat' | 'smile' | 'sliders' | 'pin' | 'map' | 'compass' | 'seats' | 'user' | 'chevronDown' | 'arrowLeft' | 'external' | 'x' | 'plus' | 'minus';

const PATHS: Record<IconName, React.ReactNode> = {
  book: <><path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v15H7.5A2.5 2.5 0 0 0 5 20.5z" /><path d="M5 20.5A2.5 2.5 0 0 0 7.5 23H19" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></>,
  users: <><circle cx="9" cy="8.5" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><circle cx="17" cy="9.5" r="2.5" /><path d="M16.5 14.5A5 5 0 0 1 21.5 19.5" /></>,
  lock: <><rect x="5" y="11" width="14" height="10" rx="2.5" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2.5" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  chat: <path d="M6 4.5h12A2.5 2.5 0 0 1 20.5 7v8a2.5 2.5 0 0 1-2.5 2.5h-7L6.5 21v-3.5H6A2.5 2.5 0 0 1 3.5 15V7A2.5 2.5 0 0 1 6 4.5z" />,
  smile: <><circle cx="12" cy="12" r="8.5" /><path d="M8.5 14a4.5 4.5 0 0 0 7 0" /><path d="M9 9.5h.01M15 9.5h.01" /></>,
  sliders: <><path d="M4 7h9M17 7h3M4 17h3M11 17h9" /><circle cx="15" cy="7" r="2" /><circle cx="9" cy="17" r="2" /></>,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.25" /></>,
  map: <><path d="m3.5 6.5 5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2z" /><path d="M9 4.5v13M15 6.5v13" /></>,
  compass: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  seats: <><rect x="4" y="4" width="7" height="7" rx="2" /><rect x="13" y="4" width="7" height="7" rx="2" /><rect x="4" y="13" width="7" height="7" rx="2" /><rect x="13" y="13" width="7" height="7" rx="2" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  arrowLeft: <path d="M19 12H5m6-6-6 6 6 6" />,
  external: <><path d="M14 4h6v6" /><path d="M20 4 11 13" /><path d="M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" /></>,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
};

export default function Icon({ name, className = '' }: { name: IconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth={1.75}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
      className={`inline-block shrink-0 ${className}`}>
      {PATHS[name]}
    </svg>
  );
}
