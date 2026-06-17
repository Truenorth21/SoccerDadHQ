-- Listings table: DB-backed training centers, facilities, tournaments & camps.
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query → Run).
-- Until it exists, those four directories show seeded data only and approving a
-- listing-type submission will report that the table is missing.

create table if not exists public.listings (
  id          text primary key,
  slug        text not null,
  kind        text not null check (kind in ('training-center','facility','tournament','camp')),
  name        text not null,
  region      text not null,
  city        text not null,
  state       text not null default 'FL',
  zip         text,
  lat         double precision,
  lng         double precision,
  description text,
  website     text,
  email       text,
  phone       text,
  color       text default '#1a4fa0',
  tags        text[] default '{}',
  facts       jsonb default '[]',
  claimed     boolean default false,
  claimed_by  uuid references public.profiles(id) on delete set null,
  verified    boolean default false,
  featured    boolean default false,
  plan        text default 'free',  -- free | pro | featured
  created_at  timestamptz not null default now(),
  unique (kind, slug)
);

alter table public.listings enable row level security;

-- Public can read; writes happen only through the service-role key (admin routes).
drop policy if exists "public read listings" on public.listings;
create policy "public read listings" on public.listings for select using (true);

-- Crowdsourced submissions can now carry the filter-relevant fields a visitor knows
-- (zip, phone, leagues, genders, age groups, school type/programs/class, tags, …).
-- Stored as JSON; admins/owners can complete the rest after approval.
alter table public.submissions add column if not exists details jsonb default '{}'::jsonb;
