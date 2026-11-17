-- CodeVerse: one row of progress per user, readable and writable only by that user.
create table if not exists public.user_progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  -- Guard against runaway payloads (notes, drafts and projects are capped client-side too).
  constraint user_progress_size check (pg_column_size(data) < 5000000)
);

alter table public.user_progress enable row level security;

create policy "read own progress"   on public.user_progress for select using (auth.uid() = user_id);
create policy "insert own progress" on public.user_progress for insert with check (auth.uid() = user_id);
create policy "update own progress" on public.user_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own progress" on public.user_progress for delete using (auth.uid() = user_id);
