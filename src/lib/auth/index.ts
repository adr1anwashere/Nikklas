// Auth module isolating all sign-in and session logic
// Follows blueprint.md Section 4 & agent.md Section 3 & 6
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Profile, AppLocale } from '@/types/database';

export async function signInAsGuest() {
  const supabase = createBrowserClient();
  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) {
    throw error;
  }
  return data;
}

export async function signOut() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  const supabase = createBrowserClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return null;
  }
  return user;
}

export async function getUserProfile(userId?: string): Promise<Profile | null> {
  const supabase = createBrowserClient();
  let targetId = userId;
  if (!targetId) {
    const user = await getCurrentUser();
    if (!user) return null;
    targetId = user.id;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch user profile:', error.message);
    return null;
  }
  return data as Profile | null;
}

export async function saveUserProfile(data: {
  nickname: string;
  major: string;
  year: number;
  topic_tags: string[];
  locale?: AppLocale;
}): Promise<Profile> {
  const supabase = createBrowserClient();
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const payload = {
    id: user.id,
    nickname: data.nickname,
    major: data.major,
    year: data.year,
    topic_tags: data.topic_tags,
    locale: data.locale || 'id',
    updated_at: new Date().toISOString(),
  };

  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }
  return profile as Profile;
}
