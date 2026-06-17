-- Phase 3: profile ownership (claims + expiry) and user→owner messages.
-- Decoupled from the entity tables so it works for seed AND DB profiles.
-- Run once in the Supabase SQL editor. Admin/service-role only.

create table if not exists public.profile_claims (
  id           uuid primary key default gen_random_uuid(),
  subject_type text not null,                 -- club | school | coach | training-center | facility | tournament | camp
  subject_slug text not null,
  subject_name text,
  owner_id     uuid references public.profiles(id) on delete set null,
  plan         text default 'claim',          -- claim | featured
  claimed_until date,                          -- ownership expiry (default +1 yr at approval)
  created_at   timestamptz not null default now(),
  unique (subject_type, subject_slug)
);
create index if not exists profile_claims_owner_idx on public.profile_claims (owner_id);
alter table public.profile_claims enable row level security;

create table if not exists public.profile_messages (
  id           uuid primary key default gen_random_uuid(),
  subject_type text not null,
  subject_slug text not null,
  subject_name text,
  from_name    text,
  from_email   text,
  body         text not null,
  read         boolean default false,
  created_at   timestamptz not null default now()
);
create index if not exists profile_messages_subject_idx on public.profile_messages (subject_type, subject_slug);
alter table public.profile_messages enable row level security;
