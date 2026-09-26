-- Run once in your Supabase SQL editor. No service-role key belongs in the app.
create table if not exists public.learning_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  version integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.learning_workspaces enable row level security;
create policy "Read own workspace" on public.learning_workspaces for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own workspace" on public.learning_workspaces for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own workspace" on public.learning_workspaces for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.learning_workspaces from anon;
grant select,insert,update on public.learning_workspaces to authenticated;
