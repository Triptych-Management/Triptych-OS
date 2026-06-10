-- ============================================================================
-- 010 — Explicitly drop scope_bucket_match (2026-06-10)
--
-- Migration 008 had a loop that was supposed to drop every CHECK constraint
-- on public.tasks, but the legacy scope_bucket_match constraint is still
-- enforcing "scope='internal' → client_id IS NULL", so marketing-task
-- inserts (which set client_id) still 500.
--
-- Drop by name explicitly. Then run a defensive sweep to remove any other
-- check constraints that snuck through 008.
--
-- Idempotent. Safe to re-run.
-- ============================================================================

alter table public.tasks drop constraint if exists scope_bucket_match;

-- Defensive sweep — drop any remaining check constraints on public.tasks.
do $$
declare
  cn text;
begin
  for cn in
    select conname from pg_constraint
     where conrelid = 'public.tasks'::regclass
       and contype = 'c'
  loop
    execute 'alter table public.tasks drop constraint if exists ' || quote_ident(cn);
  end loop;
end$$;
