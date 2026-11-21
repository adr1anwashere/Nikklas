-- Seed data for Nikllas: Phase 6
-- Follows blueprint.md Section 7 & Section 8

-- =========================================================================
-- 1. BASE COURSES (Always kept)
-- =========================================================================
insert into public.courses (code, name, campus)
select 'MK101', 'Kalkulus', 'Kampus Contoh'
where not exists (select 1 from public.courses where code = 'MK101');

insert into public.courses (code, name, campus)
select 'MK102', 'Fisika Dasar', 'Kampus Contoh'
where not exists (select 1 from public.courses where code = 'MK102');

insert into public.courses (code, name, campus)
select 'MK103', 'Pengantar Pemrograman', 'Kampus Contoh'
where not exists (select 1 from public.courses where code = 'MK103');

insert into public.courses (code, name, campus)
select 'MK104', 'Kimia Dasar', 'Kampus Contoh'
where not exists (select 1 from public.courses where code = 'MK104');

-- =========================================================================
-- 2. SAMPLE DEMO DATA (Delete before real pilot)
-- CLEANUP COMMAND (Single line to reset demo data):
-- delete from auth.users where id in ('a0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004');
-- =========================================================================

-- 2a. Demo Auth Users
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  is_anonymous,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true, '{"provider":"anonymous","providers":["anonymous"]}', '{}', now(), now()),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true, '{"provider":"anonymous","providers":["anonymous"]}', '{}', now(), now()),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true, '{"provider":"anonymous","providers":["anonymous"]}', '{}', now(), now()),
  ('a0000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', true, '{"provider":"anonymous","providers":["anonymous"]}', '{}', now(), now())
on conflict (id) do nothing;

-- 2b. Demo Profiles
insert into public.profiles (id, nickname, major, year, topic_tags, locale) values
  ('a0000000-0000-0000-0000-000000000001', 'Budi', 'Teknik Informatika', 2, array['integral', 'python', 'array'], 'id'),
  ('a0000000-0000-0000-0000-000000000002', 'Siti', 'Farmasi', 1, array['stoikiometri', 'kimia-organik'], 'id'),
  ('a0000000-0000-0000-0000-000000000003', 'Rian', 'Teknik Elektro', 3, array['mekanika', 'fisika-kuantum'], 'id'),
  ('a0000000-0000-0000-0000-000000000004', 'Maya', 'Matematika', 2, array['kalkulus', 'limit', 'turunan'], 'id')
on conflict (id) do update set
  nickname = excluded.nickname,
  major = excluded.major,
  year = excluded.year,
  topic_tags = excluded.topic_tags,
  locale = excluded.locale;

-- 2c. Demo Sessions
do $$
declare
  v_kalkulus uuid;
  v_fisika uuid;
  v_pemrograman uuid;
  v_kimia uuid;
begin
  select id into v_kalkulus from public.courses where code = 'MK101' limit 1;
  select id into v_fisika from public.courses where code = 'MK102' limit 1;
  select id into v_pemrograman from public.courses where code = 'MK103' limit 1;
  select id into v_kimia from public.courses where code = 'MK104' limit 1;

  -- 1. Kalkulus K01 - UTS (Open: 2/4 seats)
  insert into public.sessions (id, host_id, course_id, section, exam_period, topic_tags, starts_at, max_size, status)
  values ('s0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', v_kalkulus, 'K01', 'uts', array['integral', 'limit'], now() + interval '1 day 2 hours', 4, 'open')
  on conflict (id) do nothing;

  -- 2. Pemrograman K02 - Quiz (FULL: 3/3 seats)
  insert into public.sessions (id, host_id, course_id, section, exam_period, topic_tags, starts_at, max_size, status, filled_at)
  values ('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', v_pemrograman, 'K02', 'quiz', array['python', 'array'], now() + interval '2 days', 3, 'full', now() - interval '1 hour')
  on conflict (id) do nothing;

  -- 3. Fisika Dasar K01 - UTS (Open: 2/5 seats)
  insert into public.sessions (id, host_id, course_id, section, exam_period, topic_tags, starts_at, max_size, status)
  values ('s0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000003', v_fisika, 'K01', 'uts', array['mekanika'], now() + interval '3 days 4 hours', 5, 'open')
  on conflict (id) do nothing;

  -- 4. Kimia Dasar K03 - Quiz (Open: 1/4 seats)
  insert into public.sessions (id, host_id, course_id, section, exam_period, topic_tags, starts_at, max_size, status)
  values ('s0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', v_kimia, 'K03', 'quiz', array['stoikiometri'], now() + interval '1 day 6 hours', 4, 'open')
  on conflict (id) do nothing;

  -- 5. Kalkulus K02 - UAS (Open: 2/4 seats)
  insert into public.sessions (id, host_id, course_id, section, exam_period, topic_tags, starts_at, max_size, status)
  values ('s0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000004', v_kalkulus, 'K02', 'uas', array['limit', 'integral'], now() + interval '4 days', 4, 'open')
  on conflict (id) do nothing;

  -- 6. Pemrograman K01 - UTS (Open: 1/6 seats)
  insert into public.sessions (id, host_id, course_id, section, exam_period, topic_tags, starts_at, max_size, status)
  values ('s0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', v_pemrograman, 'K01', 'uts', array['python'], now() + interval '2 days 3 hours', 6, 'open')
  on conflict (id) do nothing;

  -- 7. Fisika Dasar K02 - UAS (Open: 2/4 seats)
  insert into public.sessions (id, host_id, course_id, section, exam_period, topic_tags, starts_at, max_size, status)
  values ('s0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000003', v_fisika, 'K02', 'uas', array['mekanika'], now() + interval '5 days', 4, 'open')
  on conflict (id) do nothing;

  -- 8. Kimia Dasar K01 - UTS (Open: 2/3 seats)
  insert into public.sessions (id, host_id, course_id, section, exam_period, topic_tags, starts_at, max_size, status)
  values ('s0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', v_kimia, 'K01', 'uts', array['stoikiometri'], now() + interval '3 days 1 hour', 3, 'open')
  on conflict (id) do nothing;

  -- 9. Kalkulus K03 - Quiz (Open: 1/5 seats)
  insert into public.sessions (id, host_id, course_id, section, exam_period, topic_tags, starts_at, max_size, status)
  values ('s0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000004', v_kalkulus, 'K03', 'quiz', array['limit'], now() + interval '6 days', 5, 'open')
  on conflict (id) do nothing;

  -- 2d. Non-host Session Members (Hosts were inserted automatically by trigger)
  insert into public.session_members (session_id, user_id) values
    ('s0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002'), -- Siti in Session 1 (2/4)
    ('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003'), -- Rian in Session 2
    ('s0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004'), -- Maya in Session 2 (3/3 Full)
    ('s0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002'), -- Siti in Session 3 (2/5)
    ('s0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001'), -- Budi in Session 5 (2/4)
    ('s0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000004'), -- Maya in Session 7 (2/4)
    ('s0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001')  -- Budi in Session 8 (2/3)
  on conflict (session_id, user_id) do nothing;

  -- 2e. Meeting Places for sample sessions
  insert into public.meeting_places (session_id, description, map_url, updated_by) values
    ('s0000000-0000-0000-0000-000000000001', 'Perpustakaan Pusat Lantai 2, Meja Diskusi B', 'https://maps.google.com/?q=Perpustakaan+Pusat', 'a0000000-0000-0000-0000-000000000001'),
    ('s0000000-0000-0000-0000-000000000002', 'Lab Komputer Gedung Benny Subianto Lantai 1', 'https://maps.google.com/?q=Lab+Komputer', 'a0000000-0000-0000-0000-000000000001'),
    ('s0000000-0000-0000-0000-000000000003', 'Selasar Gedung Fisika Dasar Barat', 'https://maps.google.com/?q=Gedung+Fisika', 'a0000000-0000-0000-0000-000000000003'),
    ('s0000000-0000-0000-0000-000000000005', 'Kantin Barat Meja Bundar No. 4', 'https://maps.google.com/?q=Kantin+Barat', 'a0000000-0000-0000-0000-000000000004'),
    ('s0000000-0000-0000-0000-000000000007', 'Ruang Diskusi Lantai 3 Gedung Labtek', 'https://maps.google.com/?q=Labtek', 'a0000000-0000-0000-0000-000000000003'),
    ('s0000000-0000-0000-0000-000000000008', 'Gazebo Dekat Kolam Depan', 'https://maps.google.com/?q=Gazebo', 'a0000000-0000-0000-0000-000000000002')
  on conflict (session_id) do nothing;

  -- 2f. Sample Discussion Messages in Session 1
  insert into public.messages (id, session_id, user_id, body, created_at) values
    ('m0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Halo! Ada yang sudah coba latihan soal integral tentu bab 4?', now() - interval '25 minutes'),
    ('m0000000-0000-0000-0000-000000000001', 's0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Halo Budi! Baru nomor 1-5, kita bahas bareng ya pas ketemu di perpus.', now() - interval '18 minutes'),
    ('m0000000-0000-0000-0000-000000000003', 's0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Siap Siti! Sampai ketemu besok jam 10.', now() - interval '10 minutes')
  on conflict (id) do nothing;

end $$;
