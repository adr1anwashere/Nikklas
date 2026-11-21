import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Course, SessionFeedItem } from '@/types/database';
import { getCurrentUser } from '@/lib/auth';

export interface SessionFilters {
  course_id?: string;
  section?: string;
  exam_period?: string;
  tag?: string;
}

export async function fetchCourses(): Promise<Course[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .order('code', { ascending: true });

  if (error) {
    console.error('Error fetching courses:', error.message);
    return [];
  }
  return data as Course[];
}

export async function fetchFeedSessions(filters?: SessionFilters): Promise<SessionFeedItem[]> {
  const supabase = createBrowserClient();
  let query = supabase
    .from('sessions_feed')
    .select('*')
    .in('status', ['open', 'full']);

  // Apply database-level filters
  if (filters?.course_id && filters.course_id !== 'all') {
    query = query.eq('course_id', filters.course_id);
  }
  if (filters?.section && filters.section.trim()) {
    query = query.ilike('section', `%${filters.section.trim()}%`);
  }
  if (filters?.exam_period && filters.exam_period !== 'all') {
    query = query.eq('exam_period', filters.exam_period);
  }
  if (filters?.tag && filters.tag.trim()) {
    query = query.contains('topic_tags', [filters.tag.trim().toLowerCase()]);
  }

  query = query.order('starts_at', { ascending: true });

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching feed sessions:', error.message);
    return [];
  }
  return data as SessionFeedItem[];
}

export async function createSession(payload: {
  course_id: string;
  section: string;
  exam_period: 'quiz' | 'uts' | 'uas';
  topic_tags: string[];
  starts_at: string;
  max_size: number;
}) {
  const supabase = createBrowserClient();
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const sessionRow = {
    host_id: user.id,
    course_id: payload.course_id,
    section: payload.section.toUpperCase(),
    exam_period: payload.exam_period,
    topic_tags: payload.topic_tags,
    starts_at: new Date(payload.starts_at).toISOString(),
    max_size: payload.max_size,
    status: 'open',
  };

  const { data, error } = await supabase
    .from('sessions')
    .insert(sessionRow)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function joinSession(sessionId: string): Promise<{
  success: boolean;
  error?: string;
  member_count?: number;
}> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.rpc('join_session', {
    p_session_id: sessionId,
  });

  if (error) {
    throw error;
  }
  return data as { success: boolean; error?: string; member_count?: number };
}

export async function fetchUserJoinedSessionIds(): Promise<string[]> {
  const supabase = createBrowserClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('session_members')
    .select('session_id')
    .eq('user_id', user.id);

  if (error || !data) {
    return [];
  }
  return data.map((row) => row.session_id);
}

export async function fetchMySessions(): Promise<SessionFeedItem[]> {
  const supabase = createBrowserClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const { data: memberRows, error: memErr } = await supabase
    .from('session_members')
    .select('session_id')
    .eq('user_id', user.id);

  if (memErr || !memberRows || memberRows.length === 0) {
    return [];
  }

  const sessionIds = memberRows.map((r) => r.session_id);

  const { data, error } = await supabase
    .from('sessions_feed')
    .select('*')
    .in('id', sessionIds)
    .order('starts_at', { ascending: true });

  if (error) {
    console.error('Error fetching my sessions:', error.message);
    return [];
  }
  return data as SessionFeedItem[];
}
