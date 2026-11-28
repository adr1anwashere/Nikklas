'use client';

import Icon from '@/components/Icon';
import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
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

  // 1 and 2. Load messages, then poll every 3 seconds while the tab is visible
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const msgs = await fetchMessages(sessionId);
        // keep the same array when nothing is new, so the list does not auto-scroll on every poll
        if (active) setMessages((prev) => (msgs.length === prev.length ? prev : msgs));
      } catch (err) {
        console.error('Error fetching room messages:', err);
      } finally {
        if (active) setIsLoading(false);
      }
    }
    load();
    const timer = setInterval(() => {
      if (!document.hidden) load();
    }, 3000);
    return () => {
      active = false;
      clearInterval(timer);
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
      // Show it now instead of waiting for the next poll
      setMessages((prev) => {
        if (prev.some((m) => m.id === createdMsg.id)) return prev;
        return [...prev, createdMsg];
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setErrorMsg(t('sendFailed'));
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
        <h2 className="font-display font-semibold text-[17px] text-text flex items-center gap-2">
          <Icon name="chat" /> {t('chatTitle')}
        </h2>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-success-text font-semibold"><span className="w-2 h-2 rounded-full bg-success-text" aria-hidden="true" />{t('live')}</span>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 min-h-[260px] max-h-[60vh]" role="log" aria-live="polite" aria-label={t('chatTitle')}>
        {/* 1. Loading Skeleton: 3 skeleton bubbles per ui.md */}
        {isLoading && (
          <div className="space-y-3 animate-pulse" role="status">
            <div className="h-10 bg-border/40 rounded-card w-3/5 mr-auto"></div>
            <div className="h-12 bg-peach/40 rounded-card w-2/5 ml-auto"></div>
            <div className="h-10 bg-border/40 rounded-card w-1/2 mr-auto"></div>
          </div>
        )}

        {/* 2. Empty Chat State per ui.md */}
        {!isLoading && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted my-auto">
            <span className="text-[32px] mb-2 text-primary-text"><Icon name="smile" /></span>
            <p className="text-[14px] font-medium">{t('emptyChat')}</p>
          </div>
        )}

        {/* 3. Messages List */}
        {!isLoading &&
          messages.map((msg) => {
            const isOwn = msg.user_id === currentUserId;
            const senderName = memberNicknameMap.get(msg.user_id) || t('unknownMember');

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
              >
                {/* Sender Nickname (for other members) */}
                {!isOwn && (
                  <span className="text-[13px] font-semibold text-muted ml-2 mb-1">
                    {senderName}
                  </span>
                )}

                {/* Message Bubble per ui.md */}
                <div
                  className={`px-4 py-2.5 rounded-card text-[15px] leading-relaxed break-words max-w-[78%] ${
                    isOwn
                      ? 'bg-peach text-on-peach font-medium rounded-br-xs'
                      : 'bg-surface text-text border border-border rounded-bl-xs'
                  }`}
                >
                  {/* Strict plain text rendering, no dangerouslySetInnerHTML */}
                  <p className="whitespace-pre-wrap">{msg.body}</p>
                </div>

                {/* Timestamp */}
                <span className="text-[13px] text-muted px-1.5 mt-0.5">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            );
          })}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message alert */}
      {errorMsg && (
        <div role="alert" className="px-4 py-2 bg-error-bg text-error-text text-[14px] font-medium border-t border-error-text/10">
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
          aria-label={t('typeMessage')}
          enterKeyHint="send"
          autoComplete="off"
          maxLength={1000}
          disabled={isSending}
          className="flex-1 min-w-0 h-12 px-4 rounded-control border border-edge bg-surface text-text text-[16px] placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary-text transition-all"
        />
        <button
          type="submit"
          disabled={isSending || !inputText.trim()}
          className="h-12 px-5 bg-primary text-on-primary font-semibold text-[15px] rounded-control disabled:opacity-50 cursor-pointer flex items-center justify-center shrink-0"
        >
          {isSending ? t('sending') : t('send')}
        </button>
      </form>
    </div>
  );
}
