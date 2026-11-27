'use client';
// Top bar for the signed-in tabs: the logo on the left, an optional greeting or action on the right.
import Logo from '@/components/Logo';
import { Link } from '@/i18n/navigation';

export default function AppHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="flex items-center justify-between min-h-14 pt-2 pb-2">
      <Link href="/feed" className="inline-flex items-center min-h-11 rounded-control">
        <Logo className="h-7 w-auto" />
      </Link>
      {right}
    </header>
  );
}
