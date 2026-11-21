import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { MeetingPlace } from '@/types/database';
import { getCurrentUser } from '@/lib/auth';

export interface MeetingPlaceWithAuthor extends MeetingPlace {
  author_nickname?: string;
}

export async function fetchMeetingPlace(sessionId: string): Promise<MeetingPlaceWithAuthor | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('meeting_places')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  let authorNickname = 'Mahasiswa';
  if (data.updated_by) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', data.updated_by)
      .maybeSingle();

    if (profile?.nickname) {
      authorNickname = profile.nickname;
    }
  }

  return {
    ...data,
    author_nickname: authorNickname,
  };
}

export async function upsertMeetingPlace(
  sessionId: string,
  description: string,
  mapUrl?: string
): Promise<MeetingPlaceWithAuthor> {
  const supabase = createBrowserClient();
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const trimmedDesc = description.trim();
  const trimmedUrl = mapUrl && mapUrl.trim() ? mapUrl.trim() : null;

  if (!trimmedDesc || trimmedDesc.length < 2) {
    throw new Error('Description too short');
  }

  if (trimmedUrl && !/^https:\/\//i.test(trimmedUrl)) {
    throw new Error('Map URL must start with https://');
  }

  const payload = {
    session_id: sessionId,
    description: trimmedDesc,
    map_url: trimmedUrl,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('meeting_places')
    .upsert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  // Get current user profile nickname
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', user.id)
    .maybeSingle();

  return {
    ...data,
    author_nickname: profile?.nickname || 'Mahasiswa',
  };
}
