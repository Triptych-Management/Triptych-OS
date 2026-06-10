-- ============================================================================
-- 005 — Management artists + per-artist task scoping (2026-06-10)
--
-- Adds:
--   - artists table (name, slug, position, notes, archived_at)
--   - tasks.artist_id (nullable FK) — null = internal task, set = artist task
--   - Seeds the 7-artist roster
--
-- Idempotent. Re-runnable.
-- ============================================================================

-- 1) artists table -----------------------------------------------------------
create table if not exists public.artists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  position    integer not null default 0,
  notes       text not null default '',
  created_at  timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists artists_archived_idx on public.artists (archived_at);
create index if not exists artists_position_idx on public.artists (position);

-- 2) Seed the 7-artist roster -----------------------------------------------
-- Each insert is a no-op if the slug already exists. Position determines
-- left-to-right tab order.
insert into public.artists (name, slug, position) values
  ('Cam Rao',         'cam-rao',         1),
  ('Wacomo',          'wacomo',          2),
  ('Baltazar Lora',   'baltazar-lora',   3),
  ('JEV',             'jev',             4),
  ('YAMI Club',       'yami-club',       5),
  ('Joshua Bassett',  'joshua-bassett',  6),
  ('Quarters',        'quarters',        7)
on conflict (slug) do nothing;

-- 3) tasks.artist_id ---------------------------------------------------------
alter table public.tasks
  add column if not exists artist_id uuid references public.artists(id);

create index if not exists tasks_artist_id_idx on public.tasks (artist_id);

-- 4) RLS — enabled, no public policies (service role only via API) -----------
alter table public.artists enable row level security;
