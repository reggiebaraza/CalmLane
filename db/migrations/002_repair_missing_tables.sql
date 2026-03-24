-- Repair migration for environments where earlier schema setup was partial.
-- Safe to run multiple times.

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text not null,
  intensity int not null check (intensity between 1 and 10),
  emotions text[] not null default '{}',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coping_tool_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tool_name text not null,
  duration_seconds int,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_mood_logs_user_id on public.mood_logs(user_id);
create index if not exists idx_mood_logs_created_at on public.mood_logs(created_at desc);
create index if not exists idx_coping_tool_sessions_user_id on public.coping_tool_sessions(user_id);
create index if not exists idx_coping_tool_sessions_created_at on public.coping_tool_sessions(created_at desc);

drop trigger if exists set_mood_logs_updated_at on public.mood_logs;
create trigger set_mood_logs_updated_at
before update on public.mood_logs
for each row execute function public.set_updated_at();

drop trigger if exists set_coping_tool_sessions_updated_at on public.coping_tool_sessions;
create trigger set_coping_tool_sessions_updated_at
before update on public.coping_tool_sessions
for each row execute function public.set_updated_at();

alter table public.mood_logs enable row level security;
alter table public.coping_tool_sessions enable row level security;

drop policy if exists "mood_logs_select_own" on public.mood_logs;
drop policy if exists "mood_logs_insert_own" on public.mood_logs;
drop policy if exists "mood_logs_update_own" on public.mood_logs;
drop policy if exists "mood_logs_delete_own" on public.mood_logs;

create policy "mood_logs_select_own"
on public.mood_logs
for select
using (auth.uid() = user_id);

create policy "mood_logs_insert_own"
on public.mood_logs
for insert
with check (auth.uid() = user_id);

create policy "mood_logs_update_own"
on public.mood_logs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "mood_logs_delete_own"
on public.mood_logs
for delete
using (auth.uid() = user_id);

drop policy if exists "coping_tool_sessions_select_own" on public.coping_tool_sessions;
drop policy if exists "coping_tool_sessions_insert_own" on public.coping_tool_sessions;
drop policy if exists "coping_tool_sessions_update_own" on public.coping_tool_sessions;
drop policy if exists "coping_tool_sessions_delete_own" on public.coping_tool_sessions;

create policy "coping_tool_sessions_select_own"
on public.coping_tool_sessions
for select
using (auth.uid() = user_id);

create policy "coping_tool_sessions_insert_own"
on public.coping_tool_sessions
for insert
with check (auth.uid() = user_id);

create policy "coping_tool_sessions_update_own"
on public.coping_tool_sessions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "coping_tool_sessions_delete_own"
on public.coping_tool_sessions
for delete
using (auth.uid() = user_id);
