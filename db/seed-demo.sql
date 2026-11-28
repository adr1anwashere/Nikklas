-- SAMPLE DEMO DATA. Apply with: npm run seed
-- Remove before a real pilot: delete from users where id like 'demo-%';  (cascades to everything below)

insert or ignore into users (id) values ('demo-budi'), ('demo-siti'), ('demo-rian'), ('demo-maya');

insert or ignore into profiles (id, nickname, major, year, topic_tags) values
  ('demo-budi', 'Budi', 'Teknik Informatika', 2, '["integral","python","array"]'),
  ('demo-siti', 'Siti', 'Farmasi', 1, '["stoikiometri","kimia-organik"]'),
  ('demo-rian', 'Rian', 'Teknik Elektro', 3, '["mekanika","fisika-kuantum"]'),
  ('demo-maya', 'Maya', 'Matematika', 2, '["kalkulus","limit","turunan"]');

insert or ignore into sessions (id, host_id, course_id, section, exam_period, topic_tags, starts_at, max_size, status, filled_at) values
  ('demo-s1', 'demo-budi', '10100000-0000-4000-8000-000000000101', 'K01', 'uts',  '["integral","limit"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','+26 hours'),  4, 'open', null),
  ('demo-s2', 'demo-budi', '10100000-0000-4000-8000-000000000103', 'K02', 'quiz', '["python","array"]',   strftime('%Y-%m-%dT%H:%M:%fZ','now','+48 hours'),  3, 'full', strftime('%Y-%m-%dT%H:%M:%fZ','now','-1 hour')),
  ('demo-s3', 'demo-rian', '10100000-0000-4000-8000-000000000102', 'K01', 'uts',  '["mekanika"]',         strftime('%Y-%m-%dT%H:%M:%fZ','now','+76 hours'),  5, 'open', null),
  ('demo-s4', 'demo-siti', '10100000-0000-4000-8000-000000000104', 'K03', 'quiz', '["stoikiometri"]',     strftime('%Y-%m-%dT%H:%M:%fZ','now','+30 hours'),  4, 'open', null),
  ('demo-s5', 'demo-maya', '10100000-0000-4000-8000-000000000101', 'K02', 'uas',  '["limit","integral"]', strftime('%Y-%m-%dT%H:%M:%fZ','now','+96 hours'),  4, 'open', null),
  ('demo-s6', 'demo-budi', '10100000-0000-4000-8000-000000000103', 'K01', 'uts',  '["python"]',           strftime('%Y-%m-%dT%H:%M:%fZ','now','+51 hours'),  6, 'open', null);

insert or ignore into session_members (session_id, user_id) values
  ('demo-s1', 'demo-budi'), ('demo-s1', 'demo-siti'),
  ('demo-s2', 'demo-budi'), ('demo-s2', 'demo-rian'), ('demo-s2', 'demo-maya'),
  ('demo-s3', 'demo-rian'), ('demo-s3', 'demo-siti'),
  ('demo-s4', 'demo-siti'),
  ('demo-s5', 'demo-maya'), ('demo-s5', 'demo-budi'),
  ('demo-s6', 'demo-budi');

insert or ignore into meeting_places (session_id, description, map_url, updated_by) values
  ('demo-s1', 'Perpustakaan Pusat Lantai 2, Meja Diskusi B', 'https://maps.google.com/?q=Perpustakaan+Pusat', 'demo-budi'),
  ('demo-s2', 'Lab Komputer Lantai 1', 'https://maps.google.com/?q=Lab+Komputer', 'demo-budi'),
  ('demo-s3', 'Selasar Gedung Fisika Barat', 'https://maps.google.com/?q=Gedung+Fisika', 'demo-rian');

insert or ignore into messages (id, session_id, user_id, body, created_at) values
  ('demo-m1', 'demo-s1', 'demo-budi', 'Halo! Ada yang sudah coba latihan soal integral tentu bab 4?', strftime('%Y-%m-%dT%H:%M:%fZ','now','-25 minutes')),
  ('demo-m2', 'demo-s1', 'demo-siti', 'Halo Budi! Baru nomor 1-5, kita bahas bareng ya pas ketemu di perpus.', strftime('%Y-%m-%dT%H:%M:%fZ','now','-18 minutes')),
  ('demo-m3', 'demo-s1', 'demo-budi', 'Siap Siti! Sampai ketemu besok jam 10.', strftime('%Y-%m-%dT%H:%M:%fZ','now','-10 minutes'));
