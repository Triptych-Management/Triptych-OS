-- ============================================================================
-- 009 — Force-drop NOT NULL on legacy tasks columns (2026-06-10)
--
-- Migration 008 wrapped the DROP NOT NULL pass in a foreach loop with a
-- PL/pgSQL variable named col_name. That collided with the column literally
-- named column_name on information_schema.columns, so the EXISTS subquery
-- effectively always matched / never matched in the wrong way, and the
-- "owner" column ended up still NOT NULL. Inserts still 500 with
-- 23502: null value in column "owner" of relation "tasks".
--
-- Fix: one DO block per column, no loop, no shadowing.
--
-- Idempotent. Safe to re-run.
-- ============================================================================

do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema='public' and table_name='tasks' and column_name='owner'
  ) then
    alter table public.tasks alter column "owner" drop not null;
  end if;
end$$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema='public' and table_name='tasks' and column_name='scope'
  ) then
    alter table public.tasks alter column scope drop not null;
  end if;
end$$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema='public' and table_name='tasks' and column_name='artist'
  ) then
    alter table public.tasks alter column artist drop not null;
  end if;
end$$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema='public' and table_name='tasks' and column_name='context'
  ) then
    alter table public.tasks alter column context drop not null;
  end if;
end$$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema='public' and table_name='tasks' and column_name='position'
  ) then
    alter table public.tasks alter column "position" drop not null;
  end if;
end$$;
