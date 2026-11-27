-- Nikklas: close two gaps found while checking the proposal against the code (25 Nov 2026).
-- Copy into supabase/migrations/ of github.com/adr1anwashere/Nikklas, review, then run in the SQL Editor.
-- Safe to re-run.

-- 1. Seats must only be claimed through join_session().
--    Today the policy below lets any signed-in user INSERT their own row into session_members directly
--    through the REST API (supabase.from('session_members').insert(...)). That skips the capacity,
--    'open' status and FOR UPDATE checks in join_session(), so a session can be overfilled, and a
--    user can also enter a 'closed' or 'full' room and read its chat.
--    The app never inserts into session_members itself (checked: src/ only reads it), and both
--    join_session() and the handle_new_session() trigger are SECURITY DEFINER, so they keep working.
drop policy if exists "Users can insert themselves as session members" on public.session_members;

-- 2. sessions_feed runs as the view owner (security_invoker = false), so it skips RLS on sessions.
--    Supabase's default privileges usually grant new views to the anon role too, so the feed,
--    including closed sessions and host IDs, may be readable with only the public anon key.
--    Keep the owner rights (needed for current_size), but filter rows the same way the sessions
--    policy does and remove anon access.
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
join public.courses c on c.id = s.course_id
where auth.uid() is not null
  and (s.status in ('open', 'full') or s.host_id = auth.uid() or public.is_room_member(s.id));

revoke all on public.sessions_feed from anon;
grant select on public.sessions_feed to authenticated;

-- How to verify (QA):
-- a) As guest A in the browser console, with a session you are not in:
--      await supabase.from('session_members').insert({ session_id: '<id>', user_id: (await supabase.auth.getUser()).data.user.id })
--    Before: succeeds. After: fails with "new row violates row-level security policy".
-- b) Without signing in:
--      curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/sessions_feed?select=id" -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
--    Before: may return rows. After: permission denied (or an empty list).
-- c) Normal flow still works: post a session, join from a second browser, fill the last seat.
