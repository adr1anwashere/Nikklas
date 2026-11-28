'use client';

import Icon from '@/components/Icon';
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getCurrentUser, getUserProfile } from '@/lib/auth';
import {
  fetchFeedSessions,
  fetchCourses,
  fetchUserJoinedSessionIds,
  joinSession,
  SessionFilters,
} from '@/lib/sessions';
import { Profile, SessionFeedItem, Course, User } from '@/types/database';
import AppHeader from '@/components/AppHeader';
import SessionCard from '@/components/SessionCard';
import FilterBar from '@/components/FilterBar';
import BottomNav from '@/components/BottomNav';

export default function FeedPage() {
  const t = useTranslations('feed');
  const tSession = useTranslations('session');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<SessionFeedItem[]>([]);
  const [joinedSessionIds, setJoinedSessionIds] = useState<string[]>([]);

  // Filter state
  const [activeFilters, setActiveFilters] = useState<SessionFilters>({});

  // Feedback toast state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const loadFeedData = useCallback(async (filters?: SessionFilters) => {
    try {
      const feedData = await fetchFeedSessions(filters);
      setSessions(feedData);
      const joinedIds = await fetchUserJoinedSessionIds();
      setJoinedSessionIds(joinedIds);
    } catch (err) {
      console.error('Error fetching filtered feed:', err);
    }
  }, []);

  useEffect(() => {
    async function init() {
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

        // Load courses for FilterBar
        const courseList = await fetchCourses();
        setCourses(courseList);

        // Initial feed query
        await loadFeedData();
      } catch (err) {
        console.error('Error initializing feed:', err);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [router, loadFeedData]);

  const handleFilterChange = async (newFilters: SessionFilters) => {
    setActiveFilters(newFilters);
    setIsLoading(true);
    await loadFeedData(newFilters);
    setIsLoading(false);
  };

  const handleClearFilters = () => {
    handleFilterChange({});
  };

  const handleJoinSession = async (sessionId: string) => {
    setJoiningId(sessionId);
    setToastMessage(null);
    try {
      const result = await joinSession(sessionId);
      if (result.success) {
        setToastMessage({ text: tSession('joinSuccess'), type: 'success' });
        // Refresh feed & joined list
        await loadFeedData(activeFilters);
      } else {
        if (result.error === 'session_full') {
          setToastMessage({ text: tSession('groupFull'), type: 'error' });
        } else if (result.error === 'already_joined') {
          setToastMessage({ text: tSession('alreadyJoined'), type: 'error' });
        } else {
          setToastMessage({ text: tCommon('error'), type: 'error' });
        }
        await loadFeedData(activeFilters);
      }
    } catch (err) {
      console.error('Error joining session:', err);
      setToastMessage({ text: tCommon('error'), type: 'error' });
    } finally {
      setJoiningId(null);
      // Auto-hide toast after 4s
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const hasFiltersApplied = Boolean(
    (activeFilters.course_id && activeFilters.course_id !== 'all') ||
    (activeFilters.exam_period && activeFilters.exam_period !== 'all') ||
    activeFilters.section ||
    activeFilters.tag
  );

  return (
    <div className="flex flex-col min-h-screen pb-40 md:pb-12">
      {/* Top Header */}
      <AppHeader right={profile ? <p className="text-[14px] text-muted">{t('welcome', { name: profile.nickname })}</p> : null} />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div
          aria-live="polite"
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-control text-[13px] font-semibold shadow-lg transition-all animate-in fade-in slide-in-from-top duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-success-bg text-success-text border border-success-text/20'
              : 'bg-error-bg text-error-text border border-error-text/20'
          }`}
          role="status"
        >
          {toastMessage.text}
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4">
        {/* Page Title & Subtitle */}
        <div className="flex items-end justify-between gap-6">
          <div className="space-y-0.5">
            <h1 className="font-display font-normal text-[30px] md:text-[40px] leading-[1.15] text-text">
              {t('title')}
            </h1>
            <p className="text-[15px] md:text-[16px] text-muted">
              {t('subtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/sessions/new')}
            className="hidden md:inline-flex lg:hidden h-12 px-5 items-center gap-2 bg-primary text-on-primary font-semibold text-[15px] rounded-control cursor-pointer shrink-0"
          >
            <Icon name="plus" /> {t('createSession')}
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:items-start">
        <div className="space-y-4 min-w-0">
        <div className="lg:hidden">
          <FilterBar
            key={JSON.stringify(activeFilters)}
            courses={courses}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* 1. Loading Skeletons */}
        {isLoading && (
          <div className="grid gap-3.5 md:grid-cols-2 min-[1800px]:grid-cols-3 pt-2" role="status" aria-label="Loading sessions">
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

        {/* 2. Empty Feed (No sessions exist at all) */}
        {!isLoading && sessions.length === 0 && !hasFiltersApplied && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-surface border border-border rounded-card shadow-card space-y-3 my-4">
            <div className="text-[32px] text-primary-text"><Icon name="book" /></div>
            <h3 className="font-display font-semibold text-[18px] text-text">
              {t('empty')}
            </h3>
            <p className="text-[14px] text-muted max-w-[280px]">
              {tCommon('description')}
            </p>
            <button
              type="button"
              onClick={() => router.push('/sessions/new')}
              className="mt-2 h-12 px-6 inline-flex items-center gap-2 bg-primary text-on-primary font-semibold text-[15px] rounded-control cursor-pointer"
            >
              <Icon name="plus" /> {t('createSession')}
            </button>
          </div>
        )}

        {/* 3. No Results for Active Filter (per ui.md spec) */}
        {!isLoading && sessions.length === 0 && hasFiltersApplied && (
          <div className="flex flex-col items-center justify-center text-center p-8 bg-surface border border-border rounded-card shadow-card space-y-3 my-4">
            <div className="text-[32px] text-primary-text"><Icon name="search" /></div>
            <h3 className="font-display font-semibold text-[18px] text-text">
              {t('noResults')}
            </h3>
            <p className="text-[13px] text-muted max-w-[280px]">
              {t('noResultsHint')}
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="mt-2 h-11 px-5 bg-surface border border-border text-text font-semibold text-[13px] rounded-control hover:bg-bg transition-all cursor-pointer"
            >
              {t('clearFilters')}
            </button>
          </div>
        )}

        {/* 4. Session Cards List */}
        {!isLoading && sessions.length > 0 && (
          <div className="grid gap-3.5 md:grid-cols-2 min-[1800px]:grid-cols-3 pt-1">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                currentUserId={currentUser?.id}
                isMember={joinedSessionIds.includes(session.id)}
                isJoining={joiningId === session.id}
                onJoinClick={handleJoinSession}
                onOpenRoomClick={(sessionId) => {
                  // Phase 4 Session Room navigation
                  router.push(`/sessions/${sessionId}`);
                }}
              />
            ))}
          </div>
        )}
        </div>
        <div className="hidden lg:block">
          <FilterBar
            key={JSON.stringify(activeFilters)}
            variant="panel"
            courses={courses}
            activeFilters={activeFilters}
            onFilterChange={handleFilterChange}
          />
        </div>
        </div>
      </div>

      {/* Floating Action Button: "Buat sesi" pinned above bottom nav */}
      {!isLoading && (
        <div className="md:hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-0 right-0 z-20 flex justify-center pointer-events-none px-4">
          <button
            type="button"
            onClick={() => router.push('/sessions/new')}
            className="pointer-events-auto h-12 px-6 bg-primary text-on-primary font-semibold text-[14px] rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Icon name="plus" className="text-[18px]" />
            <span>{t('createSession')}</span>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
