'use client';

import React, { useState, useEffect, use } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth';
import {
  fetchRoomDetails,
  fetchRoomMembers,
  checkIsMember,
  RoomMember,
} from '@/lib/chat';
import { joinSession } from '@/lib/sessions';
import { SessionFeedItem } from '@/types/database';
import LanguageSwitch from '@/components/LanguageSwitch';
import MemberList from '@/components/MemberList';
import ChatPanel from '@/components/ChatPanel';

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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [session, setSession] = useState<SessionFeedItem | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    async function loadRoom() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          router.replace('/');
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
          const memberList = await fetchRoomMembers(sessionId, sessionData.host_id);
          setMembers(memberList);
        }
      } catch (err) {
        console.error('Error loading session room:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadRoom();
  }, [sessionId, router]);

  const handleJoinDirectly = async () => {
    setIsJoining(true);
    try {
      const res = await joinSession(sessionId);
      if (res.success || res.error === 'already_joined') {
        setIsMember(true);
        if (session) {
          const updatedMembers = await fetchRoomMembers(sessionId, session.host_id);
          setMembers(updatedMembers);
        }
      } else {
        alert(res.error === 'session_full' ? tSession('groupFull') : tCommon('error'));
        router.replace('/feed');
      }
    } catch (err) {
      console.error('Error joining directly from room:', err);
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

  if (!session) {
    return null;
  }

  // Format start time
  const formattedTime = (() => {
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

  const examLabel = {
    quiz: tSession('examPeriodQuiz'),
    uts: 'UTS',
    uas: 'UAS',
  }[session.exam_period] || session.exam_period.toUpperCase();

  // Non-member Access Notice (Privacy Gate)
  if (!isMember) {
    return (
      <div className="flex flex-col justify-between min-h-[calc(100vh-2rem)]">
        <header className="flex items-center justify-between pt-2 pb-4">
          <button
            type="button"
            onClick={() => router.push('/feed')}
            className="text-[14px] font-semibold text-primary-text hover:underline flex items-center gap-1 cursor-pointer"
          >
            &larr; {tCommon('back')}
          </button>
          <LanguageSwitch />
        </header>

        <div className="bg-surface border border-border rounded-card p-6 shadow-card text-center space-y-4 my-auto">
          <div className="text-4xl">🔒</div>
          <h2 className="font-display font-bold text-[20px] text-text">
            {t('notMemberTitle')}
          </h2>
          <p className="text-[14px] text-muted leading-relaxed max-w-[320px] mx-auto">
            {t('notMemberDesc')}
          </p>

          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={handleJoinDirectly}
              disabled={isJoining}
              className="w-full h-11 bg-primary text-on-primary font-semibold text-[14px] rounded-control hover:opacity-90 active:scale-95 transition-all shadow-xs cursor-pointer flex items-center justify-center"
            >
              {isJoining ? tSession('joining') : t('joinSessionFirst')}
            </button>
            <button
              type="button"
              onClick={() => router.push('/feed')}
              className="w-full h-11 bg-surface border border-border text-text font-semibold text-[14px] rounded-control hover:bg-bg active:scale-95 transition-all cursor-pointer"
            >
              {t('backToFeed')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-6 space-y-4">
      {/* Top Header */}
      <header className="flex items-center justify-between pt-2 pb-2 border-b border-border/60">
        <button
          type="button"
          onClick={() => router.push('/feed')}
          className="text-[14px] font-semibold text-primary-text hover:underline flex items-center gap-1 cursor-pointer"
        >
          &larr; {tCommon('back')}
        </button>
        <LanguageSwitch />
      </header>

      {/* Session Information Header per ui.md */}
      <section className="bg-surface border border-border rounded-card p-4 shadow-card space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display font-bold text-[20px] text-text leading-tight">
              {session.course_code} {session.course_name}
            </h1>
            <p className="text-[14px] font-semibold text-primary-text">
              Kelas {session.section} &bull; {examLabel}
            </p>
          </div>
          <span className="px-2.5 py-1 bg-tag-bg text-tag-text rounded-full text-[12px] font-semibold">
            {members.length}/{session.max_size}
          </span>
        </div>

        <div className="pt-1 flex items-center gap-3 text-[13px] text-muted">
          <span>📅 {formattedTime}</span>
        </div>

        {/* Topic tags */}
        {session.topic_tags && session.topic_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {session.topic_tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 bg-bg border border-border text-muted rounded-full text-[11px] font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Member List */}
      <MemberList members={members} maxSize={session.max_size} />

      {/* Meeting Place Card Placeholder (Phase 5) */}
      <div className="bg-surface border border-border rounded-card p-3 shadow-xs flex items-center justify-between text-[13px]">
        <div className="flex items-center gap-2 text-muted">
          <span>📍</span>
          <span>{t('meetingPlacePlaceholder')}</span>
        </div>
      </div>

      {/* Live Realtime Chat Panel */}
      <ChatPanel
        sessionId={sessionId}
        currentUserId={currentUser.id}
        members={members}
      />
    </div>
  );
}
