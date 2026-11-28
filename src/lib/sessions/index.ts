'use server';
import { z } from 'zod';
import * as store from '@/lib/server/store';
import { requireViewer, viewerId } from '@/lib/server/viewer';
import { sessionSchema } from '@/lib/validation/session';
import { Course, SessionFeedItem } from '@/types/database';

export interface SessionFilters {
  course_id?: string;
  section?: string;
  exam_period?: string;
  tag?: string;
}

const text = z.string().max(100).optional();
const filtersSchema = z.object({ course_id: text, section: text, exam_period: text, tag: text });
const id = z.string().min(1).max(64);

export async function fetchCourses(): Promise<Course[]> {
  return (await viewerId()) ? (store.listCourses() as unknown as Course[]) : [];
}

export async function fetchFeedSessions(filters?: SessionFilters): Promise<SessionFeedItem[]> {
  if (!(await viewerId())) return [];
  return store.listFeed(filtersSchema.parse(filters ?? {})) as unknown as SessionFeedItem[];
}

export async function createSession(payload: {
  course_id: string;
  section: string;
  exam_period: 'quiz' | 'uts' | 'uas';
  topic_tags: string[];
  starts_at: string;
  max_size: number;
}): Promise<SessionFeedItem> {
  const viewer = await requireViewer();
  return store.createSession(viewer, sessionSchema.parse(payload)) as unknown as SessionFeedItem;
}

export async function joinSession(sessionId: string): Promise<{
  success: boolean;
  error?: string;
  member_count?: number;
}> {
  const viewer = await viewerId();
  if (!viewer) return { success: false, error: 'not_authenticated' };
  return store.joinSession(viewer, id.parse(sessionId));
}

export async function fetchUserJoinedSessionIds(): Promise<string[]> {
  const viewer = await viewerId();
  return viewer ? store.mySessionIds(viewer) : [];
}

export async function fetchMySessions(): Promise<SessionFeedItem[]> {
  const viewer = await viewerId();
  return viewer ? (store.mySessions(viewer) as unknown as SessionFeedItem[]) : [];
}
