'use server';
// Auth module isolating all sign-in and session logic
// Follows blueprint.md Section 4 & agent.md Section 3 & 6
import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import * as store from '@/lib/server/store';
import { COOKIE, requireViewer, viewerId } from '@/lib/server/viewer';
import { profileSchema } from '@/lib/validation/profile';
import { Profile, AppLocale, User } from '@/types/database';

// ponytail: in-memory limit, resets on restart; move to the database if there is ever more than one process
const recent = new Map<string, number[]>();
const GUESTS_PER_HOUR = 60; // generous because a whole campus can share one address

export async function signInAsGuest(): Promise<{ user: User }> {
  const existing = await viewerId();
  if (existing) return { user: { id: existing } };

  const address = (await headers()).get('cf-connecting-ip') ?? 'local';
  const hourAgo = Date.now() - 3_600_000;
  const hits = (recent.get(address) ?? []).filter((t) => t > hourAgo);
  if (hits.length >= GUESTS_PER_HOUR) throw new Error('Too many new guests from this network');
  recent.set(address, [...hits, Date.now()]);

  const { id, token } = store.createGuest();
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  return { user: { id } };
}

export async function signOut(): Promise<void> {
  const id = await viewerId();
  if (id) store.endSession(id);
  (await cookies()).delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const id = await viewerId();
  return id ? { id } : null;
}

export async function getUserProfile(userId?: string): Promise<Profile | null> {
  const viewer = await viewerId();
  if (!viewer) return null;
  const target = userId === undefined ? viewer : z.string().parse(userId);
  return store.getProfile(viewer, target) as unknown as Profile | null;
}

export async function saveUserProfile(data: {
  nickname: string;
  major: string;
  year: number;
  topic_tags: string[];
  locale?: AppLocale;
}): Promise<Profile> {
  const viewer = await requireViewer();
  const profile = profileSchema.parse(data);
  const locale = z.enum(['id', 'en']).parse(data.locale ?? 'id');
  return store.saveProfile(viewer, { ...profile, locale }) as unknown as Profile;
}
