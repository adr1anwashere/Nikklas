'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getCurrentUser, getUserProfile, signOut } from '@/lib/auth';
import { fetchFeedSessions } from '@/lib/sessions';
import { Profile, SessionFeedItem } from '@/types/database';
import LanguageSwitch from '@/components/LanguageSwitch';
import SessionCard from '@/components/SessionCard';
import BottomNav from '@/components/BottomNav';

export default function FeedPage() {
  const t = useTranslations('feed');
  const tCommon = useTranslations('common');
  const tProfile = useTranslations('profile');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sessions, setSessions] = useState<SessionFeedItem[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/');
          return;
        }
        setCurrentUser(user);

        const userProfile = await getUserProfile(user.id);
        if (!userProfile) {
          router.replace('/setup');
          return;
        }
        setProfile(userProfile);

        // Fetch feed sessions
        const feedData = await fetchFeedSessions();
        setSessions(feedData);
      } catch (err) {
        console.error('Error loading feed data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-2 pb-4">
        <div>
          <h1 className="font-display font-bold text-[26px] text-primary-text leading-tight">
            Nikllas
          </h1>
          <p className="text-[13px] text-muted">
            {profile ? t('welcome', { name: profile.nickname }) : ''}
          </p>
        </div>
        <LanguageSwitch />
      </header>

      {/* Main Feed Content */}
      <main className="space-y-4">
        {/* Title & Subtitle */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-[22px] text-text">
              {t('title')}
            </h2>
            <p className="text-[13px] text-muted">
              {t('subtitle')}
            </p>
          </div>
        </div>

        {/* 1. Loading State: 3 Skeleton Cards with subtle pulse per ui.md */}
        {isLoading && (
          <div className="space-y-3" role="status" aria-label="Loading sessions">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-surface border border-border rounded-card p-5 shadow-card space-y-3 animate-pulse"
              >
                <div className="h-5 bg-border/60 rounded-md w-3/4"></div>
                <div className="h-4 bg-border/40 rounded-md w-1/4"></div>
                <div className="flex gap-2 pt-2">
                  <div className="h-6 bg-tag-bg/50 rounded-full w-16"></div>
                  <div className="h-6 bg-tag-bg/50 rounded-full w-20"></div>
                </div>
                <div className="h-10 bg-border/40 rounded-control w-full mt-2"></div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Empty State per ui.md */}
        {!isLoading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-surface border border-border rounded-card shadow-card space-y-3 my-4">
            <div className="text-3xl">📚</div>
            <h3 className="font-display font-bold text-[18px] text-text">
              {t('empty')}
            </h3>
            <p className="text-[14px] text-muted max-w-[280px]">
              {tCommon('description')}
            </p>
            <button
              type="button"
              onClick={() => router.push('/sessions/new')}
              className="mt-2 h-11 px-6 bg-primary text-on-primary font-semibold text-[14px] rounded-control shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              + {t('createSession')}
            </button>
          </div>
        )}

        {/* 3. Session Cards List */}
        {!isLoading && sessions.length > 0 && (
          <div className="space-y-3.5">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                currentUserId={currentUser?.id}
                onJoinClick={() => {
                  // Stub for Phase 3 Join flow
                  router.push(`/sessions/new`);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB): "Buat sesi" pinned above bottom nav */}
      {!isLoading && sessions.length > 0 && (
        <div className="fixed bottom-20 left-0 right-0 z-20 flex justify-center pointer-events-none px-4">
          <button
            type="button"
            onClick={() => router.push('/sessions/new')}
            className="pointer-events-auto h-12 px-6 bg-primary text-on-primary font-semibold text-[14px] rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <span className="text-lg leading-none">+</span>
            <span>{t('createSession')}</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
