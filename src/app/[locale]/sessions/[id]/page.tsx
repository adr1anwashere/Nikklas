'use client';

import Icon from '@/components/Icon';
import React, { useState, useEffect, use } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getCurrentUser, signInAsGuest, getUserProfile } from '@/lib/auth';
import {
  fetchRoomDetails,
  fetchRoomMembers,
  checkIsMember,
  RoomMember,
} from '@/lib/chat';
import {
  fetchMeetingPlace,
  MeetingPlaceWithAuthor,
} from '@/lib/meeting-place';
import { joinSession } from '@/lib/sessions';
import { SessionFeedItem, User } from '@/types/database';
import BackButton from '@/components/BackButton';
import MemberList from '@/components/MemberList';
import MeetingPlaceCard from '@/components/MeetingPlaceCard';
import ChatPanel from '@/components/ChatPanel';
import BottomNav from '@/components/BottomNav';

export default function SessionRoomPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const resolvedParams = use(params);
  const sessionId = resolvedParams.id;

  const t = useTranslations('room');
  const tSession = useTranslations('session');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [session, setSession] = useState<SessionFeedItem | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [meetingPlace, setMeetingPlace] = useState<MeetingPlaceWithAuthor | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isGuestSigningIn, setIsGuestSigningIn] = useState(false);
  const [lockError, setLockError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRoom() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          setIsMember(false);
          setIsLoading(false);
          return;
        }
        setCurrentUser(user);

        // Fetch session details
        const sessionData = await fetchRoomDetails(sessionId);
        if (!sessionData) {
          router.replace('/feed');
          return;
        }
        setSession(sessionData);

        // Check membership
        const memberStatus = await checkIsMember(sessionId, user.id);
        setIsMember(memberStatus);

        if (memberStatus) {
          const [memberList, placeData] = await Promise.all([
            fetchRoomMembers(sessionId),
            fetchMeetingPlace(sessionId),
          ]);
          setMembers(memberList);
          setMeetingPlace(placeData);
        }
      } catch (err) {
        console.error('Error loading session room:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRoom();
  }, [sessionId, router]);

  // Poll for meeting place changes and new members
  useEffect(() => {
    if (!isMember) return;
    const timer = setInterval(async () => {
      if (document.hidden) return;
      try {
        const [memberList, placeData] = await Promise.all([
          fetchRoomMembers(sessionId),
          fetchMeetingPlace(sessionId),
        ]);
        setMembers(memberList);
        setMeetingPlace(placeData);
      } catch (err) {
        console.error('Error refreshing the room:', err);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [sessionId, isMember]);

  // Handle guest sign-in directly from the lock screen
  const handleGuestEntryFromLock = async () => {
    setIsGuestSigningIn(true);
    try {
      const authData = await signInAsGuest();
      if (authData.user) {
        const profile = await getUserProfile(authData.user.id);
        if (!profile) {
          router.push('/setup');
          return;
        }
        setCurrentUser(authData.user);
        const sessionData = await fetchRoomDetails(sessionId);
        setSession(sessionData);
        const memberStatus = await checkIsMember(sessionId, authData.user.id);
        setIsMember(memberStatus);
        if (memberStatus && sessionData) {
          const [memberList, placeData] = await Promise.all([
            fetchRoomMembers(sessionId),
            fetchMeetingPlace(sessionId),
          ]);
          setMembers(memberList);
          setMeetingPlace(placeData);
        }
      }
    } catch (err) {
      console.error('Failed to sign in as guest:', err);
      setLockError(tCommon('error'));
    } finally {
      setIsGuestSigningIn(false);
    }
  };

  const handleJoinDirectly = async () => {
    setIsJoining(true);
    try {
      const res = await joinSession(sessionId);
      if (res.success || res.error === 'already_joined') {
        setIsMember(true);
        if (session) {
          const [updatedMembers, placeData] = await Promise.all([
            fetchRoomMembers(sessionId),
            fetchMeetingPlace(sessionId),
          ]);
          setMembers(updatedMembers);
          setMeetingPlace(placeData);
        }
      } else {
        setLockError(res.error === 'session_full' ? tSession('groupFull') : t('joinFailed'));
      }
    } catch (err) {
      console.error('Error joining directly from room:', err);
      setLockError(t('joinFailed'));
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
        <p className="text-muted text-[15px] animate-pulse">{tCommon('loading')}</p>
      </div>
    );
  }

  // Format start time
  const formattedTime = (() => {
    if (!session) return '';
    try {
      const d = new Date(session.starts_at);
      return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(d);
    } catch {
      return session.starts_at;
    }
  })();

  const examLabel = session
    ? {
        quiz: tSession('examPeriodQuiz'),
        uts: 'UTS',
        uas: 'UAS',
      }[session.exam_period] || session.exam_period.toUpperCase()
    : '';

  // Non-member or Unauthenticated Access Notice (Privacy Gate)
  if (!isMember) {
    return (
      <div className="flex flex-col justify-between min-h-[calc(100vh-2rem)]">
        <header className="flex items-center pt-1 pb-1">
          <BackButton label={tCommon('back')} onClick={() => router.push('/feed')} />
        </header>

        <div className="bg-surface border border-border rounded-card p-6 shadow-card text-center space-y-4 my-auto">
          <div className="text-[36px] text-primary-text flex justify-center"><Icon name="lock" /></div>
          <h1 className="font-display font-normal text-[26px] text-text">
            {t('notMemberTitle')}
          </h1>
          <p className="text-[15px] text-text-2 leading-relaxed max-w-[320px] mx-auto">
            {t('notMemberDesc')}
          </p>
          {lockError && <p role="alert" className="px-4 py-3 rounded-control bg-error-bg text-error-text text-[14px]">{lockError}</p>}

          <div className="pt-2 flex flex-col gap-2">
            {!currentUser ? (
              <button
                type="button"
                onClick={handleGuestEntryFromLock}
                disabled={isGuestSigningIn}
                className="w-full h-12 bg-primary text-on-primary font-semibold text-[15px] rounded-control cursor-pointer flex items-center justify-center"
              >
                {isGuestSigningIn ? tCommon('enteringAsGuest') : tCommon('continueAsGuest')}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleJoinDirectly}
                disabled={isJoining}
                className="w-full h-12 bg-primary text-on-primary font-semibold text-[15px] rounded-control cursor-pointer flex items-center justify-center"
              >
                {isJoining ? tSession('joining') : t('joinSessionFirst')}
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push('/feed')}
              className="w-full h-12 bg-surface border border-edge text-text font-semibold text-[15px] rounded-control cursor-pointer"
            >
              {t('backToFeed')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session || !currentUser) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen pb-6 gap-4 lg:grid lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-6 lg:items-start lg:content-start">
      {/* Top Header */}
      <header className="flex items-center pt-1 pb-1 lg:col-span-2">
          <BackButton label={tCommon('back')} onClick={() => router.push('/feed')} />
        </header>

      <div className="flex flex-col gap-4 lg:sticky lg:top-6">

      {/* Session Information Header per ui.md */}
      <section className="bg-surface border border-border rounded-card p-4 shadow-card space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-normal text-[26px] text-text leading-tight">
              {session.course_code} {session.course_name}
            </h1>
            <p className="text-[14px] font-semibold text-primary-text">
              {tSession('classSection', { section: session.section })} &bull; {examLabel}
            </p>
          </div>
          <span className="px-3 py-1 bg-sand text-text-2 rounded-full text-[13px] font-semibold" aria-label={`${members.length} / ${session.max_size}`}>
            {members.length}/{session.max_size}
          </span>
        </div>

        <div className="pt-1 flex items-center gap-3 text-[14px] text-muted">
          <span className="inline-flex items-center gap-1.5"><Icon name="calendar" /> {formattedTime}</span>
        </div>

        {/* Topic tags */}
        {session.topic_tags && session.topic_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {session.topic_tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-sand text-text-2 rounded-full text-[13px] font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Member List */}
      <MemberList members={members} maxSize={session.max_size} />

      {/* Meeting Place Card */}
      <MeetingPlaceCard
        sessionId={sessionId}
        meetingPlace={meetingPlace}
        onUpdated={(updated) => setMeetingPlace(updated)}
      />

      </div>

      {/* Chat: fills the right column on desktop */}
      <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-7.5rem)] lg:flex lg:flex-col">
        <ChatPanel
          sessionId={sessionId}
          currentUserId={currentUser.id}
          members={members}
        />
      </div>
      <BottomNav desktopOnly />
    </div>
  );
}
