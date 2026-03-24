-- Supabase seed data template:
-- 1) Create a user in Supabase Auth first.
-- 2) Replace <AUTH_USER_ID> below with auth.users.id.

insert into public.profiles (user_id, preferred_name, goals, tone_preference, emergency_country)
values ('<AUTH_USER_ID>', 'Demo User', array['stress', 'reflection'], 'gentle', 'US')
on conflict (user_id) do update set
  preferred_name = excluded.preferred_name,
  goals = excluded.goals,
  tone_preference = excluded.tone_preference,
  emergency_country = excluded.emergency_country;
