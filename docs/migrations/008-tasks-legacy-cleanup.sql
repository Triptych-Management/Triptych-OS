-- ============================================================================
-- 008 — Tasks table legacy cleanup (2026-06-10)
--
-- The pre-MVP `tasks` table had columns and constraints we no longer use:
--   - scope (text), artist (text), context (text), owner (text), position (int)
--   - scope_bucket_match CHECK constraint tying scope to which fk is set
--   - client_id FK pointed at digital_clients (renamed to *_archived_2026_06
--     by migration 004 — the FK now points at a table our new clients.id
--     values aren't in, so every marketing-task INSERT fails)
--
-- Migration 005 added artist_id with a clean FK to public.artists.
-- Migration 006 tried to add client_id but it already existed (the `IF NOT
-- EXISTS` made the ADD a no-op), so client_id still has the stale FK.
--
-- This migration:
--   1. Drops every CHECK constraint on public.tasks (kills scope_bucket_match
--      and any other legacy enforcement we no longer need)
--   2. Drops any FK on public.tasks that points at an *_archived_* table
--   3. Ensures client_id has a FK to public.clients
--   4. Makes legacy columns nullable so default-less inserts work
--
-- Idempotent. Safe to re-run.
-- ============================================================================

-- 1) Drop all CHECK constraints on public.tasks.
do $$
declare
  c_name text;
begin
  for c_name in
    select conname
      from pg_constraint
     where conrelid = 'public.tasks'::regclass
       and contype = 'c'
  loop
    execute format('alter table public.tasks drop constraint if exists %I', c_name);
  end loop;
end$$;

-- 2) Drop any FK on public.tasks that targets an archived table.
do $$
declare
  rec record;
begin
  for rec in
    select conname
      from pg_constraint
     where conrelid = 'public.tasks'::regclass
       and contype = 'f'
       and confrelid::regclass::text like '%_archived_%'
  loop
    execute format('alter table public.tasks drop constraint if exists %I', rec.conname);
  end loop;
end$$;

-- 3) Ensure client_id has a FK to public.clients.
do $$
begin
  if not exists (
    select 1 from pg_constraint
     where conrelid = 'public.tasks'::regclass
       and contype = 'f'
       and confrelid = 'public.clients'::regclass
  ) then
    alter table public.tasks
      add constraint tasks_client_id_fkey
        foreign key (client_id) references public.clients(id);
  end if;
end$$;

-- 4) Drop NOT NULL on legacy columns (only if they exist + are currently NOT NULL).
do $$
declare
  col_name text;
begin
  foreach col_name in array array['scope', 'artist', 'context', 'owner', 'position']
  loop
    if exists (
      select 1 from information_schema.columns
       where table_schema = 'public'
         and table_name = 'tasks'
         and column_name = col_name
         and is_nullable = 'NO'
    ) then
      execute format('alter table public.tasks alter column %I drop not null', col_name);
    end if;
  end loop;
end$$;
