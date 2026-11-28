'use server';
import { z } from 'zod';
import * as store from '@/lib/server/store';
import { requireViewer } from '@/lib/server/viewer';
import { meetingPlaceSchema } from '@/lib/validation/meeting-place';
import { MeetingPlace } from '@/types/database';

export interface MeetingPlaceWithAuthor extends MeetingPlace {
  author_nickname?: string;
}

const id = z.string().min(1).max(64);

export async function fetchMeetingPlace(sessionId: string): Promise<MeetingPlaceWithAuthor | null> {
  const viewer = await requireViewer();
  return store.getMeetingPlace(viewer, id.parse(sessionId)) as unknown as MeetingPlaceWithAuthor | null;
}

export async function upsertMeetingPlace(
  sessionId: string,
  description: string,
  mapUrl?: string
): Promise<MeetingPlaceWithAuthor> {
  const viewer = await requireViewer();
  const place = meetingPlaceSchema.parse({ description, map_url: mapUrl ?? '' });
  return store.saveMeetingPlace(
    viewer,
    id.parse(sessionId),
    place.description,
    place.map_url || null
  ) as unknown as MeetingPlaceWithAuthor;
}
