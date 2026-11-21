'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Message } from '@/types/database';
import { fetchMessages, sendMessage, RoomMember } from '@/lib/chat';

interface ChatPanelProps {
  sessionId: string;
  currentUserId: string;
  members: RoomMember[];
}

export default function ChatPanel({
  sessionId,
  currentUserId,
  members,
}: ChatPanelProps) {
  const t = useTranslations('room');
  const tCommon = useTranslations('common');

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const memberNicknameMap = new Map(members.map((m) => [m.user_id, m.nickname]));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Initial messages fetch
  useEffect(() => {
    async function initMessages() {
      try {
        const msgs = await fetchMessages(sessionId);
        setMessages(msgs);
      } catch (err) {
        console.error('Error fetching room messages:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initMessages();
  }, [sessionId]);

  // 2. Realtime WebSocket subscription
  useEffect(() => {
    const supabase = createBrowserClient();
    const channel = supabase
      .channel(`realtime_room_${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `session_id=eq.${sessionId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((prev) => {
            // Deduplicate
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // 3. Auto-scroll on new message
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = inputText.trim();

    if (!trimmed) {
      setErrorMsg(t('messageEmpty'));
      return;
    }

    if (trimmed.length > 1000) {
      setErrorMsg(t('messageLimit'));
      return;
    }

    setIsSending(true);
    try {
      const createdMsg = await sendMessage(sessionId, trimmed);
      setInputText('');
      // Optimistically append if realtime is slightly delayed
      setMessages((prev) => {
        if (prev.some((m) => m.id === createdMsg.id)) return prev;
        return [...prev, createdMsg];
      });
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setErrorMsg(err.message || tCommon('error'));
    } finally {
      setIsSending(false);
    }
  };

  // Format message timestamp in user's local time
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-[360px] bg-surface border border-border rounded-card shadow-card overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3 border-b border-border/70 flex items-center justify-between bg-bg/50">
        <h3 className="font-display font-bold text-[16px] text-text">
          💬 {t('chatTitle')}
        </h3>
        <span className="text-[12px] text-muted">Realtime</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[260px] max-h-[480px]">
        {/* 1. Loading Skeleton: 3 skeleton bubbles per ui.md */}
        {isLoading && (
          <div className="space-y-3 animate-pulse" role="status">
            <div className="h-10 bg-border/40 rounded-card w-3/5 mr-auto"></div>
            <div className="h-12 bg-primary/20 rounded-card w-2/5 ml-auto"></div>
            <div className="h-10 bg-border/40 rounded-card w-1/2 mr-auto"></div>
          </div>
        )}

        {/* 2. Empty Chat State per ui.md */}
        {!isLoading && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted my-auto">
            <span className="text-3xl mb-2">👋</span>
            <p className="text-[14px] font-medium">{t('emptyChat')}</p>
          </div>
        )}

        {/* 3. Messages List */}
        {!isLoading &&
          messages.map((msg) => {
            const isOwn = msg.user_id === currentUserId;
            const senderName = memberNicknameMap.get(msg.user_id) || 'Mahasiswa';

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Nickname (for other members) */}
                {!isOwn && (
                  <span className="text-[11px] font-semibold text-muted ml-2 mb-1">
                    {senderName}
                  </span>
                )}

                {/* Message Bubble per ui.md */}
                <div
                  className={`px-4 py-2.5 rounded-card text-[14px] leading-relaxed break-words max-w-[75%] shadow-xs ${
                    isOwn
                      ? 'bg-primary text-on-primary font-medium rounded-br-xs'
                      : 'bg-surface text-text border border-border rounded-bl-xs'
                  }`}
                >
                  {/* Strict plain text rendering, no dangerouslySetInnerHTML */}
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                </div>

                {/* Timestamp */}
                <span className="text-[10px] text-muted/70 px-1.5 mt-0.5">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            );
          })}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message alert */}
      {errorMsg && (
        <div className="px-4 py-1.5 bg-error-bg text-error-text text-[12px] font-medium border-t border-error-text/10">
          {errorMsg}
        </div>
      )}

      {/* Input Bar pinned at the bottom */}
      <form
        onSubmit={handleSend}
        className="p-3 border-t border-border bg-bg/40 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (errorMsg) setErrorMsg(null);
          }}
          placeholder={t('typeMessage')}
          maxLength={1000}
          disabled={isSending}
          className="flex-1 h-11 px-4 rounded-control border border-border bg-surface text-text text-[14px] placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary-text transition-all"
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="h-11 px-5 bg-primary text-on-primary font-semibold text-[14px] rounded-control hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all shadow-xs cursor-pointer flex items-center justify-center shrink-0"
        >
          {isSending ? '...' : t('send')}
        </button>
      </form>
    </div>
  );
}
