'use client';
// A study session as a ticket: the course and its seats on the left, a torn-off date stub on the
// right. The seats are the logo's squares: taken ones filled, open ones outlined.
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
  const loc = locale === 'id' ? 'id-ID' : 'en-US';

  const isHost = currentUserId === session.host_id;
  const isFull = session.status === 'full' || session.current_size >= session.max_size;
  const seatsRemaining = Math.max(0, session.max_size - session.current_size);
  const inRoom = isHost || isMember;

  const d = new Date(session.starts_at);
  const valid = !isNaN(d.getTime());
  const fmt = (o: Intl.DateTimeFormatOptions) => (valid ? new Intl.DateTimeFormat(loc, o).format(d) : '');

  const examPeriodLabel = { quiz: t('examPeriodQuiz'), uts: 'UTS', uas: 'UAS' }[session.exam_period] || session.exam_period.toUpperCase();

  return (
    <article className={`ticket group h-full flex rounded-card bg-surface border border-border ${isFull && !inRoom ? 'is-full' : ''}`}>
      <div className="flex-1 min-w-0 p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold whitespace-nowrap">
          <span className="px-2 py-0.5 rounded-md bg-sand text-text tabular-nums">{session.course_code}</span>
          <span className="text-primary-text">{t('classSection', { section: session.section })}</span>
          <span className="text-muted">· {examPeriodLabel}</span>
          {isHost && <span className="ml-auto text-primary-text">{t('hostBadge')}</span>}
          {!isHost && isMember && <span className="ml-auto text-success-text">{t('alreadyMember')}</span>}
          {isFull && !inRoom && <span className="ml-auto text-error-text">{t('fullChip')}</span>}
        </div>

        <h2 className="font-display font-normal text-[22px] leading-[1.15] text-text">{session.course_name}</h2>

        {session.topic_tags?.length > 0 && (
          <p className="text-[14px] text-text-2 truncate">{session.topic_tags.map((x) => `#${x}`).join('  ')}</p>
        )}

        <div className="mt-auto flex items-center gap-3">
          <div className="seat-meter flex gap-1 shrink-0" aria-hidden="true" key={session.current_size}>
            {Array.from({ length: session.max_size }, (_, i) => (
              <span key={i} className={`seat ${i < session.current_size ? 'seat-on' : ''}`} style={{ animationDelay: `${i * 55}ms` }} />
            ))}
          </div>
          <span className="text-[13px] text-muted whitespace-nowrap">
            {isFull ? t('seatsTaken', { current: session.current_size, max: session.max_size }) : t('seatsLeft', { seats: seatsRemaining })}
          </span>
        </div>

        {inRoom ? (
          <button type="button" onClick={() => onOpenRoomClick?.(session.id)}
            className="self-start h-11 px-5 rounded-full border border-primary text-primary-text font-semibold text-[14px] inline-flex items-center gap-2 cursor-pointer hover:bg-sand">
            <Icon name="chat" /> {t('openRoom')}
          </button>
        ) : isFull ? (
          <p className="h-11 flex items-center text-[14px] text-muted">{t('fullNote')}</p>
        ) : (
          <button type="button" onClick={() => onJoinClick?.(session.id)} disabled={isJoining}
            aria-label={`${t('joinButton')}: ${session.course_code} ${session.course_name}, ${t('classSection', { section: session.section })}`}
            className="join-btn self-start h-11 pl-5 pr-4 rounded-full bg-primary text-on-primary font-semibold text-[14px] inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer">
            {isJoining ? t('joining') : t('joinButton')}
            <span className="join-seat" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* date stub, separated by a perforation */}
      <div className="stub w-[84px] shrink-0 flex flex-col items-center justify-center gap-1 text-center px-2">
        <span className="text-[12px] font-semibold uppercase text-muted">{fmt({ weekday: 'short' })}</span>
        <span className="font-display text-[38px] leading-none text-text tabular-nums">{fmt({ day: 'numeric' })}</span>
        <span className="text-[13px] font-semibold text-text-2">{fmt({ month: 'short' })}</span>
        <span className="mt-2 text-[13px] text-primary-text font-semibold tabular-nums">{fmt({ hour: '2-digit', minute: '2-digit' })}</span>
      </div>
    </article>
  );
}
