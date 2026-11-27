'use client';

import Icon from '@/components/Icon';
import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { SessionFeedItem } from '@/types/database';

interface SessionCardProps {
  session: SessionFeedItem;
  currentUserId?: string;
  isMember?: boolean;
  isJoining?: boolean;
  onJoinClick?: (sessionId: string) => void;
  onOpenRoomClick?: (sessionId: string) => void;
}

export default function SessionCard({
  session,
  currentUserId,
  isMember = false,
  isJoining = false,
  onJoinClick,
  onOpenRoomClick,
}: SessionCardProps) {
  const t = useTranslations('session');
  const locale = useLocale();

  const isHost = currentUserId === session.host_id;
  const isFull = session.status === 'full' || session.current_size >= session.max_size;
  const seatsRemaining = Math.max(0, session.max_size - session.current_size);

  // Format date in user's local time
  const formattedDate = (() => {
    try {
      const date = new Date(session.starts_at);
      return new Intl.DateTimeFormat(locale === 'id' ? 'id-ID' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return session.starts_at;
    }
  })();

  const examPeriodLabel = {
    quiz: t('examPeriodQuiz'),
    uts: 'UTS',
    uas: 'UAS',
  }[session.exam_period] || session.exam_period.toUpperCase();

  return (
    <article className="bg-surface border border-border rounded-card p-5 shadow-card flex flex-col justify-between space-y-4">
      {/* 1. Header: Course Title & Section */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-display font-semibold text-[18px] text-text leading-snug">
            {session.course_code} {session.course_name}
          </h2>
          <p className="text-[14px] font-semibold text-primary-text">
            {t('classSection', { section: session.section })}
          </p>
        </div>

        {/* Status / Host Badge */}
        <div className="flex flex-col items-end gap-1">
          {isHost && (
            <span className="px-2.5 py-0.5 bg-sand text-primary-text rounded-full text-[13px] font-semibold">
              {t('hostBadge')}
            </span>
          )}
          {!isHost && isMember && (
            <span className="px-2.5 py-0.5 bg-success-bg text-success-text rounded-full text-[13px] font-semibold">
              {t('alreadyMember')}
            </span>
          )}
          {isFull && (
            <span className="px-2.5 py-0.5 bg-error-bg text-error-text rounded-full text-[13px] font-semibold">
              {t('fullChip')}
            </span>
          )}
        </div>
      </div>

      {/* 2. Chips: Exam Period & Topic Tags */}
      <div className="flex flex-wrap gap-1.5">
        <span className="px-3 py-1 bg-sand text-text rounded-full text-[13px] font-semibold">
          {examPeriodLabel}
        </span>
        {session.topic_tags?.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 bg-sand text-text-2 rounded-full text-[13px] font-semibold"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* 3. Time & Seats Left */}
      <div className="pt-1 border-t border-border/50 flex items-center justify-between text-[13px] text-muted">
        <span className="flex items-center gap-1 font-medium">
          <Icon name="calendar" /> {formattedDate}
        </span>
        <span className="font-semibold text-text">
          {t('seatsTaken', { current: session.current_size, max: session.max_size })}{' '}
          {!isFull && (
            <span className="text-muted font-normal">
              ({t('seatsLeft', { seats: seatsRemaining })})
            </span>
          )}
        </span>
      </div>

      {/* 4. Action Button */}
      <div className="pt-1">
        {isHost || isMember ? (
          <button
            type="button"
            onClick={() => onOpenRoomClick && onOpenRoomClick(session.id)}
            className="w-full h-12 bg-surface border border-primary text-primary-text rounded-control font-semibold text-[15px] hover:bg-sand flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icon name="chat" /> {t('openRoom')}
          </button>
        ) : isFull ? (
          <p className="h-12 flex items-center justify-center rounded-control bg-sand text-text-2 text-[15px] font-medium">
            {t('fullNote')}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => onJoinClick && onJoinClick(session.id)}
            disabled={isJoining}
            aria-label={`${t('joinButton')}: ${session.course_code} ${session.course_name}, ${t('classSection', { section: session.section })}`}
            className="w-full h-12 bg-primary text-on-primary rounded-control font-semibold text-[15px] disabled:opacity-60 flex items-center justify-center cursor-pointer"
          >
            {isJoining ? t('joining') : t('joinButton')}
          </button>
        )}
      </div>
    </article>
  );
}
