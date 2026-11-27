'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import LanguageSwitch from '@/components/LanguageSwitch';
import Logo from '@/components/Logo';
import { signInAsGuest, getCurrentUser, getUserProfile } from '@/lib/auth';

export default function LandingPage() {
  const t = useTranslations('common');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [failed, setFailed] = useState(false);

  // Check if user is already signed in
  useEffect(() => {
    async function checkExistingSession() {
      try {
        const user = await getCurrentUser();
        if (user) {
          const profile = await getUserProfile(user.id);
          if (profile) {
            router.replace('/feed');
            return;
          } else {
            router.replace('/setup');
            return;
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setCheckingAuth(false);
      }
    }

    checkExistingSession();
  }, [router]);

  const handleGuestEntry = async () => {
    setIsLoading(true);
    setFailed(false);
    try {
      const authData = await signInAsGuest();
      if (authData.user) {
        const profile = await getUserProfile(authData.user.id);
        if (profile) {
          router.push('/feed');
        } else {
          router.push('/setup');
        }
      }
    } catch (err) {
      console.error('Guest entry failed:', err);
      setFailed(true);
      setIsLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        <p className="text-muted text-[15px] animate-pulse">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-2rem)]">
      {/* Top Header with Language Switch */}
      <header className="flex justify-end pt-2 pb-4">
        <LanguageSwitch />
      </header>

      {/* Hero / Value Proposition */}
      <section className="flex flex-col items-center text-center my-auto">
        <h1 className="m-0 mb-8">
          <Logo className="block h-12 w-auto" title={t('appName')} />
        </h1>
        <h2 className="font-display font-normal text-[32px] leading-[1.12] text-text max-w-[300px]">
          {t('tagline')}
        </h2>
        <p className="mt-4 text-text-2 text-[16px] leading-[1.5] max-w-[320px]">
          {t('description')}
        </p>
      </section>

      {/* Guest Action & Friendly Notice */}
      <footer className="flex flex-col items-center space-y-3 pb-6 safe-bottom">
        {failed && (
          <p role="alert" className="w-full px-4 py-3 rounded-control bg-error-bg text-error-text text-[14px] text-center">{t('error')}</p>
        )}
        <button
          type="button"
          onClick={handleGuestEntry}
          disabled={isLoading}
          className="w-full h-12 bg-primary text-on-primary font-semibold text-[15px] rounded-control flex items-center justify-center shadow-sm disabled:opacity-50 transition-all cursor-pointer"
        >
          {isLoading ? t('enteringAsGuest') : t('continueAsGuest')}
        </button>
        <p className="text-[14px] text-muted text-center leading-relaxed px-4">
          {t('guestNote')}
        </p>
      </footer>
    </div>
  );
}
