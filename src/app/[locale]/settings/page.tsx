'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import { getCurrentUser, getUserProfile, signOut } from '@/lib/auth';
import { Profile } from '@/types/database';
import LanguageSwitch from '@/components/LanguageSwitch';
import BottomNav from '@/components/BottomNav';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tProfile = useTranslations('profile');
  const tCommon = useTranslations('common');
  const currentLocale = useLocale() as 'id' | 'en';
  const router = useRouter();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/');
          return;
        }

        const userProfile = await getUserProfile(user.id);
        if (!userProfile) {
          router.replace('/setup');
          return;
        }

        setProfile(userProfile);
      } catch (err) {
        console.error('Error loading profile in settings:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLanguageChange = (newLocale: 'id' | 'en') => {
    if (newLocale !== currentLocale) {
      router.replace(pathname, { locale: newLocale });
    }
  };

  const handleSignOut = async () => {
    if (window.confirm(t('signOutConfirm'))) {
      setIsSigningOut(true);
      try {
        await signOut();
        router.replace('/');
      } catch (err) {
        console.error('Error during sign out:', err);
        setIsSigningOut(false);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="font-display font-bold text-[24px] text-primary-text leading-tight">
            Nikllas
          </h1>
          <p className="text-[13px] text-muted">{t('subtitle')}</p>
        </div>
        <LanguageSwitch />
      </header>

      {/* Main Content */}
      <main className="space-y-5">
        <h2 className="font-display font-bold text-[22px] text-text">
          {t('title')}
        </h2>

        {/* 1. Loading Skeleton */}
        {isLoading && (
          <div className="space-y-4" role="status" aria-label="Loading settings">
            <div className="bg-surface border border-border rounded-card p-5 shadow-card space-y-3 animate-pulse">
              <div className="h-5 bg-border/60 rounded w-1/3" />
              <div className="h-4 bg-border/40 rounded w-1/2" />
              <div className="h-8 bg-border/40 rounded w-full" />
            </div>
            <div className="bg-surface border border-border rounded-card p-5 shadow-card space-y-3 animate-pulse">
              <div className="h-5 bg-border/60 rounded w-1/4" />
              <div className="h-10 bg-border/40 rounded w-full" />
            </div>
          </div>
        )}

        {/* 2. Loaded Content */}
        {!isLoading && profile && (
          <div className="space-y-4">
            {/* Student Profile Card */}
            <section className="bg-surface border border-border rounded-card p-5 shadow-card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">
                    {t('profileSection')}
                  </span>
                  <h3 className="font-display font-bold text-[20px] text-text mt-0.5">
                    {profile.nickname}
                  </h3>
                  <p className="text-[14px] text-muted mt-0.5">
                    {profile.major} • {currentLocale === 'id' ? `Angkatan ${profile.year}` : `Class of ${profile.year}`}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-text font-display font-bold text-lg">
                  {profile.nickname.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Topic chips */}
              {profile.topic_tags && profile.topic_tags.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-border/60">
                  <span className="text-[12px] font-semibold text-muted">
                    {tProfile('topicsLabel')}
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {profile.topic_tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-control bg-tag-bg text-tag-text text-[13px] font-semibold"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Profile Button */}
              <div className="pt-2">
                <Link
                  href="/setup"
                  className="w-full flex items-center justify-center h-12 rounded-control bg-surface border border-border text-text font-semibold text-[15px] hover:border-primary-text hover:text-primary-text transition-colors"
                >
                  {t('editProfile')}
                </Link>
              </div>
            </section>

            {/* Language Selection Card */}
            <section className="bg-surface border border-border rounded-card p-5 shadow-card space-y-3">
              <div>
                <h3 className="font-display font-bold text-[16px] text-text">
                  {t('languageSection')}
                </h3>
                <p className="text-[13px] text-muted">
                  {t('languageDesc')}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleLanguageChange('id')}
                  className={`h-12 rounded-control font-semibold text-[14px] border transition-colors flex items-center justify-center gap-2 ${
                    currentLocale === 'id'
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface text-text border-border hover:border-muted'
                  }`}
                >
                  <span>🇮🇩</span>
                  <span>Bahasa Indonesia</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  className={`h-12 rounded-control font-semibold text-[14px] border transition-colors flex items-center justify-center gap-2 ${
                    currentLocale === 'en'
                      ? 'bg-primary text-on-primary border-primary shadow-sm'
                      : 'bg-surface text-text border-border hover:border-muted'
                  }`}
                >
                  <span>🇬🇧</span>
                  <span>English</span>
                </button>
              </div>
            </section>

            {/* Prototype Guest Account Notice */}
            <section className="bg-surface/80 border border-border rounded-card p-5 shadow-card space-y-2">
              <div className="flex items-center gap-2 text-primary-text">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="font-display font-bold text-[16px]">
                  {t('guestNoticeTitle')}
                </h3>
              </div>
              <p className="text-[13px] text-muted leading-relaxed">
                {t('guestNoticeBody')}
              </p>
            </section>

            {/* Sign Out Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full h-12 rounded-control bg-error-bg/60 border border-error/20 text-error font-semibold text-[15px] hover:bg-error-bg hover:border-error transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSigningOut ? tCommon('loading') : t('signOut')}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Pinned Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
