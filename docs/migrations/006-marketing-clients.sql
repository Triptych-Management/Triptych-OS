-- ============================================================================
-- 006 — Marketing clients + per-client task scoping (2026-06-10)
--
-- Same shape as the artists table from migration 005, plus the client-profile
-- fields requested in the brief:
--   - account_manager_id (FK to users)
--   - campaign_start_date / campaign_end_date
--   - posts_per_invoice_period
--   - last_invoice_date
--
-- Idempotent. Re-runnable.
-- ============================================================================

-- 1) clients table -----------------------------------------------------------
create table if not exists public.clients (
  id                          uuid primary key default gen_random_uuid(),
  name                        text not null,
  slug                        text not null unique,
  position                    integer not null default 0,
  notes                       text not null default '',
  account_manager_id          uuid references public.users(id),
  campaign_start_date         date,
  campaign_end_date           date,
  posts_per_invoice_period    integer,
  last_invoice_date           date,
  created_at                  timestamptz not null default now(),
  archived_at                 timestamptz
);

create index if not exists clients_archived_idx on public.clients (archived_at);
create index if not exists clients_position_idx on public.clients (position);

-- 2) Seed the initial roster -------------------------------------------------
-- Slugs are derived from name (lowercase, alphanumeric + hyphens).
insert into public.clients (name, slug, position) values
  ('Lila Drew',     'lila-drew',     1),
  ('Claire Brooks', 'claire-brooks', 2),
  ('prettyboyshav', 'prettyboyshav', 3),
  ('Borderline',    'borderline',    4),
  ('Bebe Rexha',    'bebe-rexha',    5),
  ('flipturn',      'flipturn',      6),
  ('Dualtone',      'dualtone',      7)
on conflict (slug) do nothing;

-- 3) tasks.client_id ---------------------------------------------------------
-- Mutually exclusive with artist_id (enforced at the app layer, not DB,
-- so we can change the rule later without a migration).
alter table public.tasks
  add column if not exists client_id uuid references public.clients(id);

create index if not exists tasks_client_id_idx on public.tasks (client_id);

-- 4) RLS — enabled, no public policies (service role only via API).
alter table public.clients enable row level security;
