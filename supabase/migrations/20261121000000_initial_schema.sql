-- Nikklas Initial Database Schema
-- Follows blueprint.md Section 5 & agent.md Section 5

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nickname text not null,
  major text not null,
  year int not null check (year between 1 and 6),
  topic_tags text[] not null default '{}' check (cardinality(topic_tags) <= 5),
  locale text not null default 'id' check (locale in ('id', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Courses Table
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  campus text not null,
  created_at timestamptz not null default now()
);

-- 3. Sessions Table
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  section text not null,
  exam_period text not null check (exam_period in ('quiz', 'uts', 'uas')),
  topic_tags text[] not null default '{}' check (cardinality(topic_tags) <= 5),
  starts_at timestamptz not null,
  max_size int not null check (max_size between 2 and 8),
  status text not null default 'open' check (status in ('open', 'full', 'closed')),
  created_at timestamptz not null default now(),
  filled_at timestamptz
);

-- 4. Session Members Table
create table if not exists public.session_members (
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (session_id, user_id)
);

-- 5. Messages Table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (char_length(body) >= 1 and char_length(body) <= 1000),
  created_at timestamptz not null default now()
);

-- 6. Meeting Places Table
create table if not exists public.meeting_places (
  session_id uuid primary key references public.sessions(id) on delete cascade,
  description text not null,
  map_url text check (map_url is null or map_url ~* '^https://'),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security (RLS) on all tables
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.sessions enable row level security;
alter table public.session_members enable row level security;
alter table public.messages enable row level security;
alter table public.meeting_places enable row level security;

-- Security helper functions
create or replace function public.is_room_member(p_session_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.session_members
    where session_id = p_session_id and user_id = auth.uid()
  );
$$;

create or replace function public.shares_session_with(p_target_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.session_members sm1
    join public.session_members sm2 on sm1.session_id = sm2.session_id
    where sm1.user_id = auth.uid() and sm2.user_id = p_target_user_id
  );
$$;

-- RLS Policies: Profiles
drop policy if exists "Profiles are viewable by owner or co-members" on public.profiles;
create policy "Profiles are viewable by owner or co-members"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id or public.shares_session_with(id));

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- RLS Policies: Courses
drop policy if exists "Courses are readable by all authenticated users" on public.courses;
create policy "Courses are readable by all authenticated users"
  on public.courses for select
  to authenticated
  using (true);

-- RLS Policies: Sessions
drop policy if exists "Open and full sessions or user sessions are readable" on public.sessions;
create policy "Open and full sessions or user sessions are readable"
  on public.sessions for select
  to authenticated
  using (
    status in ('open', 'full') 
    or host_id = auth.uid() 
    or public.is_room_member(id)
  );

drop policy if exists "Hosts can insert sessions" on public.sessions;
create policy "Hosts can insert sessions"
  on public.sessions for insert
  to authenticated
  with check (host_id = auth.uid());

drop policy if exists "Hosts can update their own sessions" on public.sessions;
create policy "Hosts can update their own sessions"
  on public.sessions for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

-- RLS Policies: Session Members
drop policy if exists "Session members can view fellow members" on public.session_members;
create policy "Session members can view fellow members"
  on public.session_members for select
  to authenticated
  using (public.is_room_member(session_id));

drop policy if exists "Users can insert themselves as session members" on public.session_members;
create policy "Users can insert themselves as session members"
  on public.session_members for insert
  to authenticated
  with check (user_id = auth.uid());

-- RLS Policies: Messages
drop policy if exists "Members can view room messages" on public.messages;
create policy "Members can view room messages"
  on public.messages for select
  to authenticated
  using (public.is_room_member(session_id));

drop policy if exists "Members can insert messages as themselves" on public.messages;
create policy "Members can insert messages as themselves"
  on public.messages for insert
  to authenticated
  with check (
    auth.uid() = user_id 
    and public.is_room_member(session_id)
  );

-- RLS Policies: Meeting Places
drop policy if exists "Members can view meeting place" on public.meeting_places;
create policy "Members can view meeting place"
  on public.meeting_places for select
  to authenticated
  using (public.is_room_member(session_id));

drop policy if exists "Members can insert meeting place" on public.meeting_places;
create policy "Members can insert meeting place"
  on public.meeting_places for insert
  to authenticated
  with check (public.is_room_member(session_id));

drop policy if exists "Members can update meeting place" on public.meeting_places;
create policy "Members can update meeting place"
  on public.meeting_places for update
  to authenticated
  using (public.is_room_member(session_id))
  with check (public.is_room_member(session_id));

-- Trigger: Automatically add host as a member when session is created
create or replace function public.handle_new_session()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.session_members (session_id, user_id)
  values (new.id, new.host_id)
  on conflict do nothing;
  return new;
end;
$$;

drop trigger if exists on_session_created on public.sessions;
create trigger on_session_created
  after insert on public.sessions
  for each row execute function public.handle_new_session();

-- Function: Atomic join session with capacity check
create or replace function public.join_session(p_session_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_session record;
  v_member_count int;
begin
  if v_user_id is null then
    return json_build_object('success', false, 'error', 'not_authenticated');
  end if;

  -- Lock session row to prevent race conditions
  select * into v_session from public.sessions where id = p_session_id for update;

  if not found then
    return json_build_object('success', false, 'error', 'session_not_found');
  end if;

  if v_session.status = 'full' then
    return json_build_object('success', false, 'error', 'session_full');
  end if;

  if v_session.status != 'open' then
    return json_build_object('success', false, 'error', 'session_not_open');
  end if;

  if exists (select 1 from public.session_members where session_id = p_session_id and user_id = v_user_id) then
    return json_build_object('success', false, 'error', 'already_joined');
  end if;

  select count(*) into v_member_count from public.session_members where session_id = p_session_id;

  if v_member_count >= v_session.max_size then
    update public.sessions set status = 'full', filled_at = coalesce(filled_at, now()) where id = p_session_id;
    return json_build_object('success', false, 'error', 'session_full');
  end if;

  insert into public.session_members (session_id, user_id) values (p_session_id, v_user_id);
  v_member_count := v_member_count + 1;

  if v_member_count >= v_session.max_size then
    update public.sessions set status = 'full', filled_at = now() where id = p_session_id;
  end if;

  return json_build_object('success', true, 'member_count', v_member_count);
end;
$$;

-- View for feed with member count
create or replace view public.sessions_feed with (security_invoker = false) as
select
  s.id,
  s.host_id,
  s.course_id,
  s.section,
  s.exam_period,
  s.topic_tags,
  s.starts_at,
  s.max_size,
  s.status,
  s.created_at,
  s.filled_at,
  c.code as course_code,
  c.name as course_name,
  c.campus as course_campus,
  (select count(*)::int from public.session_members sm where sm.session_id = s.id) as current_size
from public.sessions s
join public.courses c on c.id = s.course_id;

grant select on public.sessions_feed to authenticated;
