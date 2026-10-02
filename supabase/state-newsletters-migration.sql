-- State newsletters: approve-before-send log for "The Sideline".
-- Run once in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Safe to re-run: every step is idempotent. Sends nothing by itself.
--
-- newsletter_sends       one row per admin approval (one state per approval)
-- newsletter_deliveries  one row per subscriber emailed for that approval, so the
--                        same person is never sent the same approval twice
-- Both are admin-only: RLS is on with no public policies (the site reads and
-- writes them with the service-role key).

create table if not exists public.newsletter_sends (
  id           uuid primary key default gen_random_uuid(),
  state        text not null check (state ~ '^[A-Z]{2}$'),
  status       text not null default 'sending' check (status in ('sending','sent')),
  approved_by  text,
  approved_at  timestamptz not null default now(),
  finished_at  timestamptz,
  recipients   int not null default 0,
  delivered    int not null default 0,
  failed       int not null default 0
);

create index if not exists newsletter_sends_state_idx on public.newsletter_sends (state, approved_at desc);
create index if not exists newsletter_sends_status_idx on public.newsletter_sends (status);

create table if not exists public.newsletter_deliveries (
  send_id  uuid not null references public.newsletter_sends(id) on delete cascade,
  email    text not null,
  region   text,
  ok       boolean,
  error    text,
  sent_at  timestamptz,
  primary key (send_id, email)
);

alter table public.newsletter_sends      enable row level security;
alter table public.newsletter_deliveries enable row level security;
