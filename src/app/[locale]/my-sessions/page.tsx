'use client';

import Icon from '@/components/Icon';
import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth';
import { fetchMySessions } from '@/lib/sessions';
import { SessionFeedItem, User } from '@/types/database';
import AppHeader from '@/components/AppHeader';
import SessionCard from '@/components/SessionCard';
import BottomNav from '@/components/BottomNav';

export default function MySessionsPage() {
  const t = useTranslations('mySessions');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
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
      <AppHeader />

      {/* Main Content */}
      <div className="space-y-4">
        <div className="space-y-0.5">
          <h1 className="font-display font-normal text-[30px] leading-[1.15] text-text">{t('title')}</h1>
          <p className="text-[15px] text-muted">{t('subtitle')}</p>
        </div>

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
            <div className="text-[32px] text-primary-text"><Icon name="seats" /></div>
            <h3 className="font-display font-semibold text-[18px] text-text">
              {t('empty')}
            </h3>
            <p className="text-[14px] text-muted max-w-[280px]">
              {tCommon('description')}
            </p>
            <button
              type="button"
              onClick={() => router.push('/feed')}
              className="mt-2 h-12 px-6 bg-primary text-on-primary font-semibold text-[15px] rounded-control cursor-pointer"
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
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
