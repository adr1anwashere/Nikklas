// Auth module isolating all sign-in and session logic
// Swap this module when transitioning from Guest to real university SSO / Google
import { createClient as createBrowserClient } from '@/lib/supabase/client';

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

export async function getSession() {
  const supabase = createBrowserClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return session;
}
