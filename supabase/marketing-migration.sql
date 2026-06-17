-- Phase 1 marketing: first-party visit tracking + campaign spend ledger.
-- Run once in the Supabase SQL editor. Admin/service-role only (no public policy;
-- visits are written by the /api/track route using the service-role key).

create table if not exists public.visits (
  id           bigint generated always as identity primary key,
  session_id   text,
  path         text,
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  city         text,
  region       text,   -- state / region
  country      text,
  created_at   timestamptz not null default now()
);
create index if not exists visits_created_at_idx on public.visits (created_at desc);
create index if not exists visits_campaign_idx   on public.visits (utm_campaign);
alter table public.visits enable row level security;

create table if not exists public.marketing_campaigns (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  channel      text,                 -- e.g. Instagram, Google, Flyer
  utm_campaign text,                 -- matches visits.utm_campaign for attribution
  spend        numeric not null default 0,
  start_date   date,
  end_date     date,
  notes        text,
  created_at   timestamptz not null default now()
);
alter table public.marketing_campaigns enable row level security;
