-- ============================================================================
-- 011 — Repoint tasks.client_id FK to public.clients (2026-06-10)
--
-- The constraint tasks_client_id_fkey is still pointing at the archived
-- digital_clients table (renamed by migration 004). New marketing-task
-- inserts fail because the new clients.id values don't exist in the
-- archived table.
--
-- Migration 008 had a loop that was supposed to drop FKs targeting
-- archived tables, but it didn't take effect. Doing the drop + re-add
-- explicitly by name.
--
-- Idempotent. Safe to re-run.
-- ============================================================================

-- 1) Null out any orphan client_ids (rows that reference deleted legacy
-- digital_clients rows, before we re-bind the FK to the new clients table).
update public.tasks t
   set client_id = null
 where client_id is not null
   and not exists (
     select 1 from public.clients c where c.id = t.client_id
   );

-- 2) Drop the FK explicitly by name (works whether it targets the archived
-- table or the new clients table — DROP IF EXISTS makes it safe).
alter table public.tasks drop constraint if exists tasks_client_id_fkey;

-- 3) Defensive sweep: drop any remaining FK on public.tasks that targets a
-- *_archived_* table.
do $$
declare
  cn text;
begin
  for cn in
    select conname
      from pg_constraint
     where conrelid = 'public.tasks'::regclass
       and contype = 'f'
       and confrelid::regclass::text ilike '%archived%'
  loop
    execute 'alter table public.tasks drop constraint if exists ' || quote_ident(cn);
  end loop;
end$$;

-- 4) Add the FK pointing at the new public.clients table.
alter table public.tasks
  add constraint tasks_client_id_fkey
    foreign key (client_id) references public.clients(id);
