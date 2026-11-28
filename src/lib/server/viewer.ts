// The signed-in user comes only from this httpOnly cookie.
import { cookies } from 'next/headers';
import { userIdForToken } from './store';

export const COOKIE = 'nikklas_guest';

export async function viewerId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  return token ? userIdForToken(token) : null;
}

export async function requireViewer(): Promise<string> {
  const id = await viewerId();
  if (!id) throw new Error('Not authenticated');
  return id;
}
