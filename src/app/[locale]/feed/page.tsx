'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getCurrentUser, getUserProfile, signOut } from '@/lib/auth';
import { Profile } from '@/types/database';
import LanguageSwitch from '@/components/LanguageSwitch';
import BottomNav from '@/components/BottomNav';

export default function FeedPage() {
  const t = useTranslations('feed');
  const tCommon = useTranslations('common');
  const tProfile = useTranslations('profile');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    async function checkAuthAndProfile() {
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
        console.error('Error fetching feed user:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuthAndProfile();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        <p className="text-muted text-[15px] animate-pulse">{tCommon('loading')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-20">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="font-display font-bold text-[24px] text-primary-text leading-tight">
            Nikllas
          </h1>
          <p className="text-[14px] text-muted">
            {profile ? t('welcome', { name: profile.nickname }) : ''}
          </p>
        </div>
        <LanguageSwitch />
      </header>

      {/* Profile Summary Card (Phase 1 verification) */}
      {profile && (
        <section className="bg-surface border border-border rounded-card p-4 shadow-card mb-6 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[12px] font-semibold text-muted uppercase tracking-wider">
                {t('profileSummary')}
              </span>
              <h2 className="font-display font-bold text-[18px] text-text">
                {profile.nickname}
              </h2>
              <p className="text-[14px] text-muted">
                {profile.major} &bull; {tProfile('yearOption', { year: profile.year })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/setup')}
              className="px-3 py-1.5 bg-bg border border-border text-[13px] font-semibold text-text rounded-control hover:bg-surface active:scale-95 transition-all cursor-pointer"
            >
              {t('editProfile')}
            </button>
          </div>

          {/* Tags preview */}
          {profile.topic_tags && profile.topic_tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {profile.topic_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-tag-bg text-tag-text rounded-full text-[12px] font-semibold"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-border flex justify-end">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-[13px] font-semibold text-error-text hover:underline cursor-pointer"
            >
              {t('signOut')}
            </button>
          </div>
        </section>
      )}

      {/* Feed Placeholder Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-surface border border-border rounded-card shadow-card">
        <h3 className="font-display font-bold text-[18px] text-text mb-2">
          {t('title')}
        </h3>
        <p className="text-[14px] text-muted max-w-[280px] mb-4">
          {t('empty')}
        </p>
        <button
          type="button"
          disabled
          className="h-10 px-5 bg-primary/50 text-on-primary font-semibold text-[14px] rounded-control opacity-70 cursor-not-allowed"
        >
          {t('createSession')} (Phase 2)
        </button>
      </section>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
