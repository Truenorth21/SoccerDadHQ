-- Manual revenue ledger: partner deals + any revenue earned off the site.
-- Run once in the Supabase SQL editor. Admin-only (no public policy needed —
-- the admin routes use the service-role key, which bypasses RLS).

create table if not exists public.revenue_entries (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('ads','claims','partners','other')),
  amount      numeric not null check (amount > 0),
  source      text,                 -- who/what (e.g. "Weston FC — Gold partnership")
  note        text,
  occurred_at date not null default current_date,
  created_at  timestamptz not null default now()
);

alter table public.revenue_entries enable row level security;
-- No SELECT/INSERT policy: only the service-role key (admin API) can read/write it.
