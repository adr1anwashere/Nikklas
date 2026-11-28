'use client';
// Top bar for the signed-in tabs: the logo on the left, an optional greeting or action on the right.
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Link } from '@/i18n/navigation';

export default function AppHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between md:justify-end min-h-14 pt-2 pb-2">
      <Link href="/feed" className="inline-flex md:hidden items-center min-h-11 rounded-control">
        <Logo className="h-7 w-auto" />
      </Link>
      <div className="flex items-center gap-3">{right}<span className="md:hidden"><ThemeToggle /></span></div>
    </header>
  );
}
