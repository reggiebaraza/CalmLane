-- Optional RLS verification for production / security reviews.
-- Run in Supabase SQL Editor as a privileged user. Adjust schema if needed.

-- 1) Row Level Security enabled on app tables
select c.relname as table_name, c.relrowsecurity as rls_enabled, c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in (
    'profiles', 'conversations', 'messages', 'journal_entries',
    'mood_logs', 'coping_tool_sessions', 'user_preferences', 'safety_events'
  )
order by c.relname;

-- 2) Policy count per table (expect 4 CRUD-style policies each for CalmLane)
select schemaname, tablename, count(*) as policy_count
from pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles', 'conversations', 'messages', 'journal_entries',
    'mood_logs', 'coping_tool_sessions', 'user_preferences', 'safety_events'
  )
group by schemaname, tablename
order by tablename;

-- 3) List policies (spot-check USING / WITH CHECK reference auth.uid())
select tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'profiles', 'conversations', 'messages', 'journal_entries',
    'mood_logs', 'coping_tool_sessions', 'user_preferences', 'safety_events'
  )
order by tablename, policyname;
