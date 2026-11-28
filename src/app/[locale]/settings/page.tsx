'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname, Link } from '@/i18n/navigation';
import { getCurrentUser, getUserProfile, signOut } from '@/lib/auth';
import { Profile } from '@/types/database';
import { smoothSwitch } from '@/components/LanguageSwitch';
import ConfirmDialog from '@/components/ConfirmDialog';
import { setTheme, useThemeChoice } from '@/lib/theme';
import AppHeader from '@/components/AppHeader';
import BottomNav from '@/components/BottomNav';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tProfile = useTranslations('profile');
  const tCommon = useTranslations('common');
  const tRoom = useTranslations('meetingPlace');
  const currentLocale = useLocale() as 'id' | 'en';
  const router = useRouter();
  const pathname = usePathname();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const themeChoice = useThemeChoice();

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
      smoothSwitch(() => router.replace(pathname, { locale: newLocale, scroll: false }));
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const handleSignOut = () => setConfirmOpen(true);
  const confirmSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace('/');
    } catch (err) {
      console.error('Error during sign out:', err);
      setIsSigningOut(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 md:pb-12 md:max-w-2xl">
      {/* Top Header */}
      <AppHeader />

      {/* Main Content */}
      <div className="space-y-5">
        <div className="space-y-0.5">
          <h1 className="font-display font-normal text-[30px] leading-[1.15] text-text">{t('title')}</h1>
          <p className="text-[15px] text-muted">{t('subtitle')}</p>
        </div>

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
                  <span className="text-[13px] font-semibold text-muted uppercase tracking-wider">
                    {t('profileSection')}
                  </span>
                  <h3 className="font-display font-semibold text-[20px] text-text mt-0.5">
                    {profile.nickname}
                  </h3>
                  <p className="text-[14px] text-muted mt-0.5">
                    {profile.major} • {tProfile('yearOption', { year: profile.year })}
                  </p>
                </div>
                <div aria-hidden="true" className="w-12 h-12 rounded-full bg-peach flex items-center justify-center text-on-peach font-display font-semibold text-[20px]">
                  {profile.nickname.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* Topic chips */}
              {profile.topic_tags && profile.topic_tags.length > 0 && (
                <div className="space-y-1.5 pt-1 border-t border-border/60">
                  <span className="text-[13px] font-semibold text-muted">
                    {tProfile('tagsLabel')}
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {profile.topic_tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full bg-sand text-text-2 text-[13px] font-semibold"
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
                  className="w-full flex items-center justify-center h-12 rounded-control bg-surface border border-edge text-text font-semibold text-[15px]"
                >
                  {t('editProfile')}
                </Link>
              </div>
            </section>

            {/* Language Selection Card */}
            <section className="bg-surface border border-border rounded-card p-5 shadow-card space-y-3">
              <div>
                <h3 className="font-display font-semibold text-[16px] text-text">
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
                  aria-pressed={currentLocale === 'id'}
                  lang="id"
                  className={`h-12 rounded-control font-semibold text-[15px] border flex items-center justify-center ${
                    currentLocale === 'id'
                      ? 'bg-peach text-on-peach border-peach'
                      : 'bg-surface text-text border-edge'
                  }`}
                >
                  <span>Bahasa Indonesia</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageChange('en')}
                  aria-pressed={currentLocale === 'en'}
                  lang="en"
                  className={`h-12 rounded-control font-semibold text-[15px] border flex items-center justify-center ${
                    currentLocale === 'en'
                      ? 'bg-peach text-on-peach border-peach'
                      : 'bg-surface text-text border-edge'
                  }`}
                >
                  <span>English</span>
                </button>
              </div>
            </section>


            {/* Appearance: system, light or dark */}
            <section className="bg-surface border border-border rounded-card p-5 shadow-card space-y-3">
              <div>
                <h3 className="font-display font-semibold text-[16px] text-text">{t('themeSection')}</h3>
                <p className="text-[13px] text-muted">{t('themeDesc')}</p>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-1" role="group" aria-label={t('themeSection')}>
                {(['system', 'light', 'dark'] as const).map((choice) => (
                  <button
                    key={choice}
                    type="button"
                    onClick={() => setTheme(choice)}
                    aria-pressed={themeChoice === choice}
                    className={`h-12 rounded-control font-semibold text-[15px] border flex items-center justify-center ${
                      themeChoice === choice ? 'bg-peach text-on-peach border-peach' : 'bg-surface text-text border-edge'
                    }`}
                  >
                    {t(choice === 'system' ? 'themeSystem' : choice === 'light' ? 'themeLight' : 'themeDark')}
                  </button>
                ))}
              </div>
            </section>

            {/* Prototype Guest Account Notice */}
            <section className="bg-sand rounded-card p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary-text">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <h3 className="font-display font-semibold text-[16px]">
                  {t('guestNoticeTitle')}
                </h3>
              </div>
              <p className="text-[15px] text-text-2 leading-relaxed">
                {t('guestNoticeBody')}
              </p>
            </section>

            {/* Sign Out Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="w-full h-12 rounded-control bg-surface border border-error-text/40 text-error-text font-semibold text-[15px] hover:bg-error-bg disabled:opacity-50 flex items-center justify-center"
              >
                {isSigningOut ? tCommon('loading') : t('signOut')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Pinned Bottom Navigation */}
      <BottomNav />
      <ConfirmDialog
        open={confirmOpen}
        title={t('signOutConfirm')}
        confirmLabel={t('signOut')}
        cancelLabel={tRoom('cancel')}
        busy={isSigningOut}
        danger
        onConfirm={confirmSignOut}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
