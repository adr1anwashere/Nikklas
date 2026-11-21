'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth';
import { fetchMySessions } from '@/lib/sessions';
import { SessionFeedItem } from '@/types/database';
import LanguageSwitch from '@/components/LanguageSwitch';
import SessionCard from '@/components/SessionCard';
import BottomNav from '@/components/BottomNav';

export default function MySessionsPage() {
  const t = useTranslations('mySessions');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [sessions, setSessions] = useState<SessionFeedItem[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/');
          return;
        }
        setCurrentUser(user);

        const mySessions = await fetchMySessions();
        setSessions(mySessions);
      } catch (err) {
        console.error('Error fetching my sessions:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

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
      <main className="space-y-4">
        <h2 className="font-display font-bold text-[22px] text-text">
          {t('title')}
        </h2>

        {/* 1. Loading Skeletons */}
        {isLoading && (
          <div className="space-y-3" role="status" aria-label="Loading my sessions">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="bg-surface border border-border rounded-card p-5 shadow-card space-y-3 animate-pulse"
              >
                <div className="h-5 bg-border/60 rounded-md w-3/4"></div>
                <div className="h-4 bg-border/40 rounded-md w-1/4"></div>
                <div className="h-10 bg-border/40 rounded-control w-full mt-2"></div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Empty State */}
        {!isLoading && sessions.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-surface border border-border rounded-card shadow-card space-y-3 my-6">
            <div className="text-3xl">🤝</div>
            <h3 className="font-display font-bold text-[18px] text-text">
              {t('empty')}
            </h3>
            <p className="text-[14px] text-muted max-w-[280px]">
              {tCommon('description')}
            </p>
            <button
              type="button"
              onClick={() => router.push('/feed')}
              className="mt-2 h-11 px-6 bg-primary text-on-primary font-semibold text-[14px] rounded-control shadow-sm hover:opacity-90 active:scale-95 transition-all cursor-pointer"
            >
              {t('findSessions')}
            </button>
          </div>
        )}

        {/* 3. My Sessions List */}
        {!isLoading && sessions.length > 0 && (
          <div className="space-y-3.5">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                currentUserId={currentUser?.id}
                isMember={true}
                onOpenRoomClick={(sessionId) => {
                  router.push(`/sessions/${sessionId}`);
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
