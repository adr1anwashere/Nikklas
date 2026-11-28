// Run: npm test   (access rules, validation constraints, and the last-seat race across processes)
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

process.env.NIKKLAS_DB ||= join(mkdtempSync(join(tmpdir(), 'nikklas-')), 'test.db');
const store = await import('../src/lib/server/store.ts');

if (process.env.RACE_USER) {
  // child process: wait for the shared start time, then take the last seat
  await new Promise((r) => setTimeout(r, Number(process.env.RACE_AT) - Date.now()));
  console.log(JSON.stringify(store.joinSession(process.env.RACE_USER, process.env.RACE_SESSION)));
  process.exit(0);
}

const guest = (nickname) => {
  const { id, token } = store.createGuest();
  store.saveProfile(id, { nickname, major: 'Informatika', year: 2, topic_tags: ['limit'], locale: 'id' });
  return { id, token };
};
const session = (hostId, max_size) =>
  store.createSession(hostId, {
    course_id: '10100000-0000-4000-8000-000000000101', section: 'k01', exam_period: 'uts',
    topic_tags: ['limit'], starts_at: new Date(Date.now() + 86_400_000).toISOString(), max_size,
  });

test('token identifies the guest and sign-out ends it', () => {
  const a = guest('Ana');
  assert.equal(store.userIdForToken(a.token), a.id);
  assert.equal(store.userIdForToken('wrong'), null);
  store.endSession(a.id);
  assert.equal(store.userIdForToken(a.token), null);
});

test('outsiders cannot read or write a room, or read a profile', () => {
  const host = guest('Host');
  const outsider = guest('Out');
  const s = session(host.id, 3);
  assert.equal(s.current_size, 1);
  assert.equal(s.section, 'K01');
  for (const call of [
    () => store.listMessages(outsider.id, s.id),
    () => store.addMessage(outsider.id, s.id, 'hi'),
    () => store.roomMembers(outsider.id, s.id),
    () => store.getMeetingPlace(outsider.id, s.id),
    () => store.saveMeetingPlace(outsider.id, s.id, 'Library', null),
  ]) assert.throws(call, /forbidden/);
  assert.equal(store.getProfile(outsider.id, host.id), null);
  assert.equal(store.joinSession(outsider.id, s.id).success, true);
  assert.equal(store.getProfile(outsider.id, host.id).nickname, 'Host');
  assert.equal(store.addMessage(outsider.id, s.id, 'hi').body, 'hi');
  assert.equal(store.roomMembers(host.id, s.id).filter((m) => m.is_host).length, 1);
});

test('database rejects bad values', () => {
  const host = guest('Rules');
  const s = session(host.id, 2);
  assert.throws(() => session(host.id, 9));
  assert.throws(() => store.addMessage(host.id, s.id, 'x'.repeat(1001)));
  assert.throws(() => store.saveMeetingPlace(host.id, s.id, 'Library', 'http://example.com'));
});

test('feed filters in the database and treats wildcards as text', () => {
  const host = guest('Feed');
  const s = session(host.id, 4);
  assert.ok(store.listFeed({ section: 'k0', tag: 'LIMIT', exam_period: 'uts' }).some((x) => x.id === s.id));
  assert.equal(store.listFeed({ section: '%' }).length, 0);
});

test('8 processes race for the last seat: exactly one wins', async () => {
  const host = guest('Race');
  const s = session(host.id, 2);
  const racers = Array.from({ length: 8 }, (_, i) => guest(`R${i}`));
  const at = String(Date.now() + 1500);
  const results = await Promise.all(
    racers.map(
      (r) =>
        new Promise((resolve, reject) => {
          const child = spawn(process.execPath, [import.meta.filename], {
            env: { ...process.env, RACE_USER: r.id, RACE_SESSION: s.id, RACE_AT: at, NODE_TEST_CONTEXT: '' },
          });
          let out = '';
          let err = '';
          child.stdout.on('data', (d) => (out += d));
          child.stderr.on('data', (d) => (err += d));
          child.on('close', (code) => (code ? reject(new Error(err)) : resolve(JSON.parse(out.trim().split('\n').pop()))));
        }),
    ),
  );
  assert.equal(results.filter((r) => r.success).length, 1);
  assert.ok(results.filter((r) => !r.success).every((r) => r.error === 'session_full'));
  const room = store.getRoom(host.id, s.id);
  assert.equal(room.current_size, 2);
  assert.equal(room.status, 'full');
});
