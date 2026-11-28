-- Nikklas schema (SQLite). Applied on startup by src/lib/server/store.ts; safe to re-run.
-- Access rules (who may read or write each row) are enforced in store.ts.

create table if not exists users (
  id text primary key,
  token_hash text unique,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

create table if not exists profiles (
  id text primary key references users(id) on delete cascade,
  nickname text not null,
  major text not null,
  year integer not null check (year between 1 and 6),
  topic_tags text not null default '[]' check (json_array_length(topic_tags) <= 5),
  locale text not null default 'id' check (locale in ('id','en')),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

create table if not exists courses (
  id text primary key,
  code text not null unique,
  name text not null,
  campus text not null,
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

create table if not exists sessions (
  id text primary key,
  host_id text not null references profiles(id) on delete cascade,
  course_id text not null references courses(id) on delete cascade,
  section text not null,
  exam_period text not null check (exam_period in ('quiz','uts','uas')),
  topic_tags text not null default '[]' check (json_array_length(topic_tags) <= 5),
  starts_at text not null,
  max_size integer not null check (max_size between 2 and 8),
  status text not null default 'open' check (status in ('open','full','closed')),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  filled_at text
);

create table if not exists session_members (
  session_id text not null references sessions(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  joined_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  primary key (session_id, user_id)
);

create table if not exists messages (
  id text primary key,
  session_id text not null references sessions(id) on delete cascade,
  user_id text not null references users(id) on delete cascade,
  body text not null check (length(body) between 1 and 1000),
  created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
create index if not exists messages_room on messages (session_id, created_at);

create table if not exists meeting_places (
  session_id text primary key references sessions(id) on delete cascade,
  description text not null,
  map_url text check (map_url is null or lower(map_url) like 'https://%'),
  updated_by text references users(id) on delete set null,
  updated_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);

insert or ignore into courses (id, code, name, campus) values
  ('10100000-0000-4000-8000-000000000101', 'MK101', 'Kalkulus', 'Kampus Contoh'),
  ('10100000-0000-4000-8000-000000000102', 'MK102', 'Fisika Dasar', 'Kampus Contoh'),
  ('10100000-0000-4000-8000-000000000103', 'MK103', 'Pengantar Pemrograman', 'Kampus Contoh'),
  ('10100000-0000-4000-8000-000000000104', 'MK104', 'Kimia Dasar', 'Kampus Contoh');
