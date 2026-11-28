'use server';
import { z } from 'zod';
import * as store from '@/lib/server/store';
import { requireViewer, viewerId } from '@/lib/server/viewer';
import { Message, SessionFeedItem } from '@/types/database';

export interface RoomMember {
  user_id: string;
  nickname: string;
  major: string;
  year: number;
  is_host: boolean;
  joined_at: string;
}

const id = z.string().min(1).max(64);

export async function fetchRoomDetails(sessionId: string): Promise<SessionFeedItem | null> {
  const viewer = await viewerId();
  return viewer ? (store.getRoom(viewer, id.parse(sessionId)) as unknown as SessionFeedItem | null) : null;
}

// Answers only about the caller; the second argument is kept so callers need no change.
export async function checkIsMember(sessionId: string, userId: string): Promise<boolean> {
  const viewer = await viewerId();
  return !!viewer && viewer === userId && store.isMember(viewer, id.parse(sessionId));
}

export async function fetchRoomMembers(sessionId: string): Promise<RoomMember[]> {
  const viewer = await requireViewer();
  return store.roomMembers(viewer, id.parse(sessionId)) as unknown as RoomMember[];
}

export async function fetchMessages(sessionId: string): Promise<Message[]> {
  const viewer = await requireViewer();
  return store.listMessages(viewer, id.parse(sessionId)) as unknown as Message[];
}

export async function sendMessage(sessionId: string, body: string): Promise<Message> {
  const viewer = await requireViewer();
  const trimmed = z.string().trim().min(1).max(1000).parse(body);
  return store.addMessage(viewer, id.parse(sessionId), trimmed) as unknown as Message;
}
