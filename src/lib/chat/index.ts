import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Message, SessionFeedItem } from '@/types/database';
import { getCurrentUser } from '@/lib/auth';

export interface RoomMember {
  user_id: string;
  nickname: string;
  major: string;
  year: number;
  is_host: boolean;
  joined_at: string;
}

export async function fetchRoomDetails(sessionId: string): Promise<SessionFeedItem | null> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('sessions_feed')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle();

  if (error || !data) {
    console.error('Error fetching room details:', error?.message);
    return null;
  }
  return data as SessionFeedItem;
}

export async function checkIsMember(sessionId: string, userId: string): Promise<boolean> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('session_members')
    .select('user_id')
    .eq('session_id', sessionId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) {
    return false;
  }
  return true;
}

export async function fetchRoomMembers(sessionId: string, hostId: string): Promise<RoomMember[]> {
  const supabase = createBrowserClient();

  // 1. Fetch user_ids in this session
  const { data: memberRows, error: memErr } = await supabase
    .from('session_members')
    .select('user_id, joined_at')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true });

  if (memErr || !memberRows || memberRows.length === 0) {
    return [];
  }

  const userIds = memberRows.map((m) => m.user_id);

  // 2. Fetch profiles for these users
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, nickname, major, year')
    .in('id', userIds);

  if (profErr || !profiles) {
    return memberRows.map((m) => ({
      user_id: m.user_id,
      nickname: 'Mahasiswa',
      major: '-',
      year: 1,
      is_host: m.user_id === hostId,
      joined_at: m.joined_at,
    }));
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return memberRows.map((m) => {
    const prof = profileMap.get(m.user_id);
    return {
      user_id: m.user_id,
      nickname: prof?.nickname || 'Mahasiswa',
      major: prof?.major || '-',
      year: prof?.year || 1,
      is_host: m.user_id === hostId,
      joined_at: m.joined_at,
    };
  });
}

export async function fetchMessages(sessionId: string): Promise<Message[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error.message);
    return [];
  }
  return data as Message[];
}

export async function sendMessage(sessionId: string, body: string): Promise<Message> {
  const supabase = createBrowserClient();
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  const trimmed = body.trim();
  if (!trimmed || trimmed.length === 0) {
    throw new Error('Message cannot be empty');
  }
  if (trimmed.length > 1000) {
    throw new Error('Message cannot exceed 1000 characters');
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      body: trimmed,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }
  return data as Message;
}
