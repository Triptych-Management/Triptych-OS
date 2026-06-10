-- ============================================================================
-- 007 — Drop legacy unpin_on_done trigger (2026-06-10)
--
-- Bug: Migration 004 renamed public.top_priorities → top_priorities_archived_2026_06,
-- but the unpin_on_done trigger on public.tasks still calls a function that
-- DELETEs from public.top_priorities. Every UPDATE that sets status='Done'
-- (i.e. checking a task off in the UI) fires the trigger; the function fails
-- with "relation top_priorities does not exist"; Postgres rolls back the
-- entire UPDATE. The browser then rolls back its optimistic state, so the
-- task flickers but doesn't actually disappear.
--
-- Fix: drop the trigger and its function. The Top 3 priorities feature was
-- removed in the MVP revamp, so we don't need them. Also drops the
-- swap_priority_slots RPC for the same reason.
--
-- Idempotent. Safe to re-run.
-- ============================================================================

-- Drop the trigger under any name we've used in the project history.
drop trigger if exists unpin_on_done on public.tasks;
drop trigger if exists tasks_unpin_on_done on public.tasks;
drop trigger if exists trigger_unpin_on_done on public.tasks;

-- Drop the function the trigger was calling.
drop function if exists public.unpin_on_done() cascade;
drop function if exists public.tasks_unpin_on_done() cascade;

-- Drop the priorities-related RPC for the same reason.
drop function if exists public.swap_priority_slots(text, integer, integer) cascade;

-- Belt + suspenders: if any other non-internal trigger on public.tasks
-- references the old priorities table, drop it too.
do $$
declare
  t_name text;
begin
  for t_name in
    select tgname
      from pg_trigger
     where tgrelid = 'public.tasks'::regclass
       and not tgisinternal
       and tgname ilike '%priorit%'
  loop
    execute format('drop trigger if exists %I on public.tasks', t_name);
  end loop;
end$$;
