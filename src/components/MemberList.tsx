'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { RoomMember } from '@/lib/chat';

interface MemberListProps {
  members: RoomMember[];
  maxSize: number;
}

export default function MemberList({ members, maxSize }: MemberListProps) {
  const t = useTranslations('room');
  const tProfile = useTranslations('profile');
  const tSession = useTranslations('session');

  return (
    <div className="bg-surface border border-border rounded-card p-4 shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-[16px] text-text">
          👥 {t('membersTitle')} ({members.length}/{maxSize})
        </h3>
        <span className="text-[12px] text-muted">
          {maxSize - members.length > 0
            ? tSession('seatsLeft', { seats: maxSize - members.length })
            : tSession('fullChip')}
        </span>
      </div>

      {/* Member Cards / Chips */}
      <div className="flex flex-wrap gap-2">
        {members.map((member) => (
          <div
            key={member.user_id}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-bg border border-border rounded-full text-[13px]"
          >
            <span className="font-semibold text-text">
              {member.nickname}
            </span>
            <span className="text-[11px] text-muted">
              ({member.major} &bull; {tProfile('yearOption', { year: member.year })})
            </span>
            {member.is_host && (
              <span className="px-1.5 py-0.2 bg-primary/25 text-primary-text rounded-full text-[10px] font-bold">
                Host
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
