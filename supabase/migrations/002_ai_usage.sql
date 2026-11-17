-- CodeVerse AI tutor: per-user daily message counter (written only by the Edge Function).
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null default (now() at time zone 'utc')::date,
  count   integer not null default 0,
  primary key (user_id, day)
);

alter table public.ai_usage enable row level security;

-- Learners may read their own usage (to show "messages left today"); nobody can write from the browser.
create policy "read own ai usage" on public.ai_usage for select using (auth.uid() = user_id);

-- Atomically counts one message and returns the new total for today.
create or replace function public.bump_ai_usage(p_user uuid)
returns integer
language sql
security definer
set search_path = public
as $$
  insert into public.ai_usage (user_id, day, count)
  values (p_user, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day) do update set count = public.ai_usage.count + 1
  returning count;
$$;

-- Only the server (service role) may call it.
revoke execute on function public.bump_ai_usage(uuid) from public, anon, authenticated;
