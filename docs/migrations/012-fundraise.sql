-- ============================================================================
-- 012 — Fundraise tracker (2026-06-10)
--
-- Two tables for the Internal → Fundraise tab:
--   investors        — one row per check; name, amount, status, position
--   fundraise_config — singleton (id=1) holding the round target amount
--
-- Idempotent. Safe to re-run.
-- ============================================================================

create table if not exists public.investors (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  amount      numeric(14,2) not null default 0,
  status      text not null default 'Conversation',
  position    integer not null default 0,
  created_at  timestamptz not null default now(),
  archived_at timestamptz
);

create index if not exists investors_archived_idx on public.investors (archived_at);
create index if not exists investors_position_idx on public.investors (position);

create table if not exists public.fundraise_config (
  id            integer primary key default 1,
  target_amount numeric(14,2) not null default 0,
  updated_at    timestamptz not null default now(),
  constraint fundraise_config_singleton check (id = 1)
);

insert into public.fundraise_config (id, target_amount) values (1, 0)
on conflict (id) do nothing;

alter table public.investors enable row level security;
alter table public.fundraise_config enable row level security;
