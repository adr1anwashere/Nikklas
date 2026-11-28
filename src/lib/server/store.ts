// All SQL and all access rules. Server only. Every function takes the caller's user ID
// (from the session cookie, never from the browser) and checks what that user may see or change.
// Inputs are validated by the server actions before they arrive here.
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

type Row = Record<string, unknown>;

let handle: DatabaseSync | undefined;

export function db(): DatabaseSync {
  if (handle) return handle;
  const file = process.env.NIKKLAS_DB || join(process.cwd(), 'data', 'nikklas.db');
  mkdirSync(dirname(file), { recursive: true });
  const d = new DatabaseSync(file);
  d.exec('pragma busy_timeout = 5000; pragma journal_mode = wal; pragma foreign_keys = on;');
  d.exec(readFileSync(join(process.cwd(), 'db', 'schema.sql'), 'utf8'));
  return (handle = d);
}

const one = (sql: string, ...args: (string | number | null)[]) => {
  const row = db().prepare(sql).get(...args);
  return row ? ({ ...row } as Row) : null;
};
const all = (sql: string, ...args: (string | number | null)[]) =>
  db().prepare(sql).all(...args).map((row) => ({ ...row }) as Row);
const run = (sql: string, ...args: (string | number | null)[]) => db().prepare(sql).run(...args);
const now = () => new Date().toISOString();
const withTags = (row: Row) => ({ ...row, topic_tags: JSON.parse(row.topic_tags as string) as string[] });

function transaction<T>(work: () => T): T {
  db().exec('begin immediate'); // takes the write lock first, so two joins cannot both count the same seats
  try {
    const result = work();
    db().exec('commit');
    return result;
  } catch (err) {
    db().exec('rollback');
    throw err;
  }
}

// ---- guest accounts -------------------------------------------------------
const hash = (token: string) => createHash('sha256').update(token).digest('hex');

export function createGuest() {
  const id = randomUUID();
  const token = randomBytes(32).toString('base64url');
  run('insert into users (id, token_hash) values (?, ?)', id, hash(token));
  return { id, token };
}

export function userIdForToken(token: string): string | null {
  return (one('select id from users where token_hash = ?', hash(token))?.id as string) ?? null;
}

export function endSession(userId: string) {
  run('update users set token_hash = null where id = ?', userId);
}

// ---- rules ----------------------------------------------------------------
export const isMember = (userId: string, sessionId: string) =>
  !!one('select 1 as x from session_members where session_id = ? and user_id = ?', sessionId, userId);

function requireMember(userId: string, sessionId: string) {
  if (!isMember(userId, sessionId)) throw new Error('forbidden');
}

// ---- profiles -------------------------------------------------------------
export function getProfile(viewerId: string, targetId: string) {
  const row = one(
    `select * from profiles p where p.id = ?
       and (p.id = ? or exists (select 1 from session_members a join session_members b using (session_id)
                                 where a.user_id = ? and b.user_id = p.id))`,
    targetId, viewerId, viewerId,
  );
  return row && withTags(row);
}

export function saveProfile(
  userId: string,
  p: { nickname: string; major: string; year: number; topic_tags: string[]; locale: string },
) {
  run(
    `insert into profiles (id, nickname, major, year, topic_tags, locale, updated_at) values (?, ?, ?, ?, ?, ?, ?)
     on conflict (id) do update set nickname = excluded.nickname, major = excluded.major, year = excluded.year,
       topic_tags = excluded.topic_tags, locale = excluded.locale, updated_at = excluded.updated_at`,
    userId, p.nickname, p.major, p.year, JSON.stringify(p.topic_tags), p.locale, now(),
  );
  return getProfile(userId, userId)!;
}

// ---- courses and sessions -------------------------------------------------
export const listCourses = () => all('select * from courses order by code');

const FEED = `select s.*, c.code as course_code, c.name as course_name, c.campus as course_campus,
    (select count(*) from session_members m where m.session_id = s.id) as current_size
  from sessions s join courses c on c.id = s.course_id`;

export function listFeed(f: { course_id?: string; section?: string; exam_period?: string; tag?: string }) {
  const where = ["s.status in ('open', 'full')"];
  const args: string[] = [];
  if (f.course_id && f.course_id !== 'all') { where.push('s.course_id = ?'); args.push(f.course_id); }
  if (f.section?.trim()) {
    where.push("s.section like ? escape '\\'");
    args.push(`%${f.section.trim().replace(/[\\%_]/g, '\\$&')}%`);
  }
  if (f.exam_period && f.exam_period !== 'all') { where.push('s.exam_period = ?'); args.push(f.exam_period); }
  if (f.tag?.trim()) {
    where.push('exists (select 1 from json_each(s.topic_tags) where value = ?)');
    args.push(f.tag.trim().toLowerCase());
  }
  return all(`${FEED} where ${where.join(' and ')} order by s.starts_at`, ...args).map(withTags);
}

export function getRoom(userId: string, sessionId: string) {
  const row = one(`${FEED} where s.id = ?`, sessionId);
  if (!row) return null;
  const visible = row.status !== 'closed' || row.host_id === userId || isMember(userId, sessionId);
  return visible ? withTags(row) : null;
}

export const mySessionIds = (userId: string) =>
  all('select session_id from session_members where user_id = ?', userId).map((r) => r.session_id as string);

export const mySessions = (userId: string) =>
  all(`${FEED} where exists (select 1 from session_members m where m.session_id = s.id and m.user_id = ?)
       order by s.starts_at`, userId).map(withTags);

export function createSession(
  userId: string,
  s: { course_id: string; section: string; exam_period: string; topic_tags: string[]; starts_at: string; max_size: number },
) {
  return transaction(() => {
    const id = randomUUID();
    run(
      `insert into sessions (id, host_id, course_id, section, exam_period, topic_tags, starts_at, max_size)
       values (?, ?, ?, ?, ?, ?, ?, ?)`,
      id, userId, s.course_id, s.section.toUpperCase(), s.exam_period, JSON.stringify(s.topic_tags),
      new Date(s.starts_at).toISOString(), s.max_size,
    );
    run('insert into session_members (session_id, user_id) values (?, ?)', id, userId);
    return getRoom(userId, id)!;
  });
}

export function joinSession(userId: string, sessionId: string): { success: boolean; error?: string; member_count?: number } {
  return transaction(() => {
    const s = one('select status, max_size from sessions where id = ?', sessionId);
    if (!s) return { success: false, error: 'session_not_found' };
    if (s.status === 'full') return { success: false, error: 'session_full' };
    if (s.status !== 'open') return { success: false, error: 'session_not_open' };
    if (isMember(userId, sessionId)) return { success: false, error: 'already_joined' };
    const count = one('select count(*) as n from session_members where session_id = ?', sessionId)!.n as number;
    const max = s.max_size as number;
    if (count >= max) {
      run("update sessions set status = 'full', filled_at = coalesce(filled_at, ?) where id = ?", now(), sessionId);
      return { success: false, error: 'session_full' };
    }
    run('insert into session_members (session_id, user_id) values (?, ?)', sessionId, userId);
    if (count + 1 >= max) run("update sessions set status = 'full', filled_at = ? where id = ?", now(), sessionId);
    return { success: true, member_count: count + 1 };
  });
}

// ---- room (members only) --------------------------------------------------
export function roomMembers(userId: string, sessionId: string) {
  requireMember(userId, sessionId);
  return all(
    `select m.user_id, m.joined_at, coalesce(p.nickname, 'Mahasiswa') as nickname, coalesce(p.major, '-') as major,
            coalesce(p.year, 1) as year, m.user_id = s.host_id as is_host
       from session_members m join sessions s on s.id = m.session_id left join profiles p on p.id = m.user_id
      where m.session_id = ? order by m.joined_at, m.rowid`,
    sessionId,
  ).map((r) => ({ ...r, is_host: !!r.is_host }));
}

export function listMessages(userId: string, sessionId: string) {
  requireMember(userId, sessionId);
  return all('select * from messages where session_id = ? order by created_at, rowid', sessionId);
}

export function addMessage(userId: string, sessionId: string, body: string) {
  requireMember(userId, sessionId);
  const id = randomUUID();
  run('insert into messages (id, session_id, user_id, body, created_at) values (?, ?, ?, ?, ?)', id, sessionId, userId, body, now());
  return one('select * from messages where id = ?', id)!;
}

export function getMeetingPlace(userId: string, sessionId: string) {
  requireMember(userId, sessionId);
  return one(
    `select mp.*, coalesce(p.nickname, 'Mahasiswa') as author_nickname
       from meeting_places mp left join profiles p on p.id = mp.updated_by where mp.session_id = ?`,
    sessionId,
  );
}

export function saveMeetingPlace(userId: string, sessionId: string, description: string, mapUrl: string | null) {
  requireMember(userId, sessionId);
  run(
    `insert into meeting_places (session_id, description, map_url, updated_by, updated_at) values (?, ?, ?, ?, ?)
     on conflict (session_id) do update set description = excluded.description, map_url = excluded.map_url,
       updated_by = excluded.updated_by, updated_at = excluded.updated_at`,
    sessionId, description, mapUrl, userId, now(),
  );
  return getMeetingPlace(userId, sessionId)!;
}
