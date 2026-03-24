-- Run this AFTER 002_repair_missing_tables.sql if you did NOT run 001_init.sql yet.
-- Creates profiles, chat, journal, preferences, safety_events + RLS (skips mood_logs / coping_tool_sessions).

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

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  preferred_name text,
  pronouns text,
  goals text[] not null default '{}',
  tone_preference text not null default 'gentle',
  checkin_frequency text,
  emergency_country text not null default 'US',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'New reflection',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('system','user','assistant')),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  content text not null,
  mood text,
  tags text[] not null default '{}',
  ai_reflection text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  conversation_style text not null default 'gentle listener',
  notifications_enabled boolean not null default true,
  dark_mode boolean not null default false,
  cookie_consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.safety_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('chat','journal')),
  risk_level text not null check (risk_level in ('low','moderate','high','critical')),
  category text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_conversations_user_id on public.conversations(user_id);
create index if not exists idx_conversations_created_at on public.conversations(created_at desc);
create index if not exists idx_messages_conversation_id on public.messages(conversation_id);
create index if not exists idx_messages_user_id on public.messages(user_id);
create index if not exists idx_messages_created_at on public.messages(created_at desc);
create index if not exists idx_journal_entries_user_id on public.journal_entries(user_id);
create index if not exists idx_journal_entries_created_at on public.journal_entries(created_at desc);
create index if not exists idx_safety_events_user_id on public.safety_events(user_id);
create index if not exists idx_safety_events_created_at on public.safety_events(created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at before update on public.conversations
for each row execute function public.set_updated_at();

drop trigger if exists set_messages_updated_at on public.messages;
create trigger set_messages_updated_at before update on public.messages
for each row execute function public.set_updated_at();

drop trigger if exists set_journal_entries_updated_at on public.journal_entries;
create trigger set_journal_entries_updated_at before update on public.journal_entries
for each row execute function public.set_updated_at();

drop trigger if exists set_user_preferences_updated_at on public.user_preferences;
create trigger set_user_preferences_updated_at before update on public.user_preferences
for each row execute function public.set_updated_at();

drop trigger if exists set_safety_events_updated_at on public.safety_events;
create trigger set_safety_events_updated_at before update on public.safety_events
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.journal_entries enable row level security;
alter table public.user_preferences enable row level security;
alter table public.safety_events enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = user_id);

drop policy if exists "conversations_select_own" on public.conversations;
drop policy if exists "conversations_insert_own" on public.conversations;
drop policy if exists "conversations_update_own" on public.conversations;
drop policy if exists "conversations_delete_own" on public.conversations;
create policy "conversations_select_own" on public.conversations for select using (auth.uid() = user_id);
create policy "conversations_insert_own" on public.conversations for insert with check (auth.uid() = user_id);
create policy "conversations_update_own" on public.conversations for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "conversations_delete_own" on public.conversations for delete using (auth.uid() = user_id);

drop policy if exists "messages_select_own" on public.messages;
drop policy if exists "messages_insert_own" on public.messages;
drop policy if exists "messages_update_own" on public.messages;
drop policy if exists "messages_delete_own" on public.messages;
create policy "messages_select_own" on public.messages for select using (auth.uid() = user_id);
create policy "messages_insert_own" on public.messages for insert with check (auth.uid() = user_id);
create policy "messages_update_own" on public.messages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "messages_delete_own" on public.messages for delete using (auth.uid() = user_id);

drop policy if exists "journal_entries_select_own" on public.journal_entries;
drop policy if exists "journal_entries_insert_own" on public.journal_entries;
drop policy if exists "journal_entries_update_own" on public.journal_entries;
drop policy if exists "journal_entries_delete_own" on public.journal_entries;
create policy "journal_entries_select_own" on public.journal_entries for select using (auth.uid() = user_id);
create policy "journal_entries_insert_own" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "journal_entries_update_own" on public.journal_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "journal_entries_delete_own" on public.journal_entries for delete using (auth.uid() = user_id);

drop policy if exists "user_preferences_select_own" on public.user_preferences;
drop policy if exists "user_preferences_insert_own" on public.user_preferences;
drop policy if exists "user_preferences_update_own" on public.user_preferences;
drop policy if exists "user_preferences_delete_own" on public.user_preferences;
create policy "user_preferences_select_own" on public.user_preferences for select using (auth.uid() = user_id);
create policy "user_preferences_insert_own" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "user_preferences_update_own" on public.user_preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "user_preferences_delete_own" on public.user_preferences for delete using (auth.uid() = user_id);

drop policy if exists "safety_events_select_own" on public.safety_events;
drop policy if exists "safety_events_insert_own" on public.safety_events;
drop policy if exists "safety_events_update_own" on public.safety_events;
drop policy if exists "safety_events_delete_own" on public.safety_events;
create policy "safety_events_select_own" on public.safety_events for select using (auth.uid() = user_id);
create policy "safety_events_insert_own" on public.safety_events for insert with check (auth.uid() = user_id);
create policy "safety_events_update_own" on public.safety_events for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "safety_events_delete_own" on public.safety_events for delete using (auth.uid() = user_id);
