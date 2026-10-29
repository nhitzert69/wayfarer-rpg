-- Wayfarer cloud save schema for Supabase
-- Run this in Supabase Dashboard > SQL Editor.
create table if not exists public.wayfarer_saves (
  user_id uuid primary key references auth.users(id) on delete cascade,
  app_state jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.wayfarer_saves enable row level security;
revoke all on public.wayfarer_saves from anon;
grant select, insert, update, delete on public.wayfarer_saves to authenticated;

drop policy if exists "Users can read their own Wayfarer save" on public.wayfarer_saves;
create policy "Users can read their own Wayfarer save"
  on public.wayfarer_saves for select to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Users can create their own Wayfarer save" on public.wayfarer_saves;
create policy "Users can create their own Wayfarer save"
  on public.wayfarer_saves for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own Wayfarer save" on public.wayfarer_saves;
create policy "Users can update their own Wayfarer save"
  on public.wayfarer_saves for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own Wayfarer save" on public.wayfarer_saves;
create policy "Users can delete their own Wayfarer save"
  on public.wayfarer_saves for delete to authenticated
  using (auth.uid() = user_id);
