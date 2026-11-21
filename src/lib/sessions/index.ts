import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Course, SessionFeedItem } from '@/types/database';
import { getCurrentUser } from '@/lib/auth';

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

export async function fetchFeedSessions(): Promise<SessionFeedItem[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('sessions_feed')
    .select('*')
    .in('status', ['open', 'full'])
    .order('starts_at', { ascending: true });

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
