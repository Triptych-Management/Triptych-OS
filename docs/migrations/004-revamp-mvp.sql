-- ============================================================================
-- 004 — MVP revamp (2026-06-10)
--
-- Strips Triptych OS back to a single-table task list with a real users table.
-- Drops scope/context/priorities/clients concepts. Designed to be idempotent
-- and to leave the old tables in place (renamed) so nothing is lost — we can
-- drop them in a later migration once the new app has run for a week.
--
-- Run in Supabase SQL editor as the owner.
-- ============================================================================

-- 1) users table -------------------------------------------------------------
create table if not exists public.users (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  initial     text not null,          -- 1-2 char avatar label
  color       text not null default '#2C3BD3',
  is_admin    boolean not null default false,
  created_at  timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists users_archived_idx
  on public.users (archived_at);

-- Seed Luis (admin) if no users exist yet.
insert into public.users (name, initial, color, is_admin)
select 'Luis', 'L', '#2C3BD3', true
where not exists (select 1 from public.users);

-- 2) tasks table — add owner_id, drop scope-specific columns -----------------
-- Add owner_id column (nullable to start so we can backfill).
alter table public.tasks
  add column if not exists owner_id uuid references public.users(id);

-- Backfill owner_id from legacy text owner where possible.
-- (No-op if the legacy owner column doesn't exist or names don't match.)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema='public' and table_name='tasks' and column_name='owner'
  ) then
    update public.tasks t
       set owner_id = u.id
      from public.users u
     where t.owner = u.name
       and t.owner_id is null;
  end if;
end$$;

-- 3) Archive legacy tables we no longer use ----------------------------------
-- Renamed (not dropped) so a) we keep history and b) re-runs are safe.
do $$
begin
  if exists (
    select 1 from pg_tables where schemaname='public' and tablename='top_priorities'
  ) then
    alter table public.top_priorities rename to top_priorities_archived_2026_06;
  end if;
  if exists (
    select 1 from pg_tables where schemaname='public' and tablename='digital_clients'
  ) then
    alter table public.digital_clients rename to digital_clients_archived_2026_06;
  end if;
end$$;

-- 4) RLS — keep enabled on users + tasks, anon role has zero policies.
alter table public.users enable row level security;
alter table public.tasks enable row level security;

-- ============================================================================
-- After running this:
--   - The app reads/writes via the service role through /api/* routes
--   - Anon role has no access (no policies = deny by default with RLS on)
--   - Old top_priorities / digital_clients data is preserved under
--     *_archived_2026_06 names. Drop later once we're confident.
-- ============================================================================
