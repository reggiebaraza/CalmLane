-- 005: Stripe subscription sync + usage counters for free-plan limits.
-- Run after 001_init.sql. Safe to re-run (drops/recreates policies and functions).

-- ---------------------------------------------------------------------------
-- customer_subscriptions: one row per user; written only by service role (webhooks).
-- ---------------------------------------------------------------------------
create table if not exists public.customer_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan text not null default 'free' check (plan in ('free', 'premium_monthly')),
  status text not null default 'none' check (status in (
    'none',
    'active',
    'trialing',
    'past_due',
    'canceled',
    'unpaid',
    'incomplete',
    'incomplete_expired'
  )),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_customer_subscriptions_stripe_customer
  on public.customer_subscriptions (stripe_customer_id)
  where stripe_customer_id is not null;

create index if not exists idx_customer_subscriptions_stripe_sub
  on public.customer_subscriptions (stripe_subscription_id)
  where stripe_subscription_id is not null;

drop trigger if exists set_customer_subscriptions_updated_at on public.customer_subscriptions;
create trigger set_customer_subscriptions_updated_at
  before update on public.customer_subscriptions
  for each row execute function public.set_updated_at();

alter table public.customer_subscriptions enable row level security;

drop policy if exists "customer_subscriptions_select_own" on public.customer_subscriptions;
create policy "customer_subscriptions_select_own"
  on public.customer_subscriptions for select
  using (auth.uid() = user_id);

-- No insert/update/delete for authenticated users — webhooks use service role.

-- ---------------------------------------------------------------------------
-- usage_counters: monthly aggregates; increments via security definer RPC only.
-- ---------------------------------------------------------------------------
create table if not exists public.usage_counters (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_ym text not null,
  metric text not null check (metric in ('chat_user_messages')),
  count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, period_ym, metric)
);

create index if not exists idx_usage_counters_user_period on public.usage_counters (user_id, period_ym);

alter table public.usage_counters enable row level security;

drop policy if exists "usage_counters_select_own" on public.usage_counters;
create policy "usage_counters_select_own"
  on public.usage_counters for select
  using (auth.uid() = user_id);

-- Increment counter for the current UTC month (authenticated user only).
create or replace function public.increment_usage_counter(p_metric text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
  p text := to_char((current_timestamp at time zone 'utc'), 'YYYY-MM');
  new_count int;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;
  if p_metric <> 'chat_user_messages' then
    raise exception 'invalid metric';
  end if;

  insert into public.usage_counters (user_id, period_ym, metric, count)
  values (uid, p, p_metric, 1)
  on conflict (user_id, period_ym, metric)
  do update set
    count = public.usage_counters.count + 1,
    updated_at = now()
  returning count into new_count;

  return new_count;
end;
$$;

grant execute on function public.increment_usage_counter(text) to authenticated;

comment on table public.customer_subscriptions is 'Stripe subscription mirror; mutations via service role webhooks only.';
comment on table public.usage_counters is 'Monthly usage; writes via increment_usage_counter() only.';
