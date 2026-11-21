-- Seed data for Nikllas: Phase 0 (Courses only)
-- Follows blueprint.md Section 7

insert into public.courses (code, name, campus) values
  ('MK101', 'Kalkulus', 'Kampus Contoh'),
  ('MK102', 'Fisika Dasar', 'Kampus Contoh'),
  ('MK103', 'Pengantar Pemrograman', 'Kampus Contoh'),
  ('MK104', 'Kimia Dasar', 'Kampus Contoh')
on conflict do nothing;
