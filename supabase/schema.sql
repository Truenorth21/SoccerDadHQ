-- ============================================================
--  SoccerDadHQ — Supabase schema
--  Run this in the Supabase SQL editor (or `supabase db push`).
--  Then run seed.sql to load the 50 Florida clubs + coaches.
-- ============================================================

-- Extensions ------------------------------------------------
create extension if not exists "pgcrypto";

-- ============================================================
--  PROFILES (mirrors auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  region      text,
  role        text not null default 'parent',  -- parent | player | coach | club_admin | admin
  created_at  timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  CLUBS
-- ============================================================
create table if not exists public.clubs (
  id           text primary key,
  slug         text unique not null,
  name         text not null,
  region       text not null,
  city         text not null,
  state        text not null default 'FL',
  zip          text,
  lat          double precision,
  lng          double precision,
  founded      int,
  description  text,
  logo_color   text default '#1a4fa0',
  website      text,
  email        text,
  phone        text,
  instagram    text,
  facebook     text,
  twitter      text,
  leagues      text[] default '{}',
  age_groups   text[] default '{}',
  genders      text[] default '{}',
  tryouts_open boolean default false,
  tryout_note  text,
  claimed      boolean default false,
  claimed_by   uuid references public.profiles(id) on delete set null,
  verified     boolean default false,
  featured     boolean default false,
  plan         text default 'free',  -- free | pro | featured
  created_at   timestamptz not null default now()
);

create index if not exists clubs_region_idx on public.clubs (region);
create index if not exists clubs_tryouts_idx on public.clubs (tryouts_open);

-- ============================================================
--  COACHES
-- ============================================================
create table if not exists public.coaches (
  id                    text primary key,
  slug                  text unique not null,
  name                  text not null,
  region                text not null,
  city                  text,
  club_id               text references public.clubs(id) on delete set null,
  club_name             text,
  title                 text,
  bio                   text,
  photo_color           text default '#1a4fa0',
  certifications        text[] default '{}',
  specialties           text[] default '{}',
  age_groups            text[] default '{}',
  genders               text[] default '{}',
  private_training      boolean default false,
  private_training_note text,
  email                 text,
  phone                 text,
  featured              boolean default false,
  plan                  text default 'free',
  created_at            timestamptz not null default now()
);

create index if not exists coaches_region_idx on public.coaches (region);
create index if not exists coaches_club_idx on public.coaches (club_id);

-- ============================================================
--  SCHOOLS  (FHSAA high school soccer programs)
-- ============================================================
create table if not exists public.schools (
  id              text primary key,
  slug            text unique not null,
  name            text not null,
  region          text not null,
  city            text not null,
  state           text not null default 'FL',
  zip             text,
  lat             double precision,
  lng             double precision,
  type            text,                -- Public | Private
  fhsaa_class     text,
  district        text,
  mascot          text,
  colors          text[] default '{}',
  logo_color      text default '#1a4fa0',
  programs        text[] default '{}', -- Boys / Girls
  head_coach_boys  text,
  head_coach_girls text,
  state_titles    int default 0,
  last_title      int,
  district_titles int default 0,
  enrollment      int,
  description     text,
  website         text,
  featured        boolean default false,
  plan            text default 'free',
  created_at      timestamptz not null default now()
);

create index if not exists schools_region_idx on public.schools (region);
create index if not exists schools_class_idx on public.schools (fhsaa_class);

-- ============================================================
--  REVIEWS  (clubs + coaches + schools)
-- ============================================================
create table if not exists public.reviews (
  id             uuid primary key default gen_random_uuid(),
  subject_type   text not null check (subject_type in ('club','coach','school','training-center','facility','tournament','camp')),
  subject_id     text not null,
  user_id        uuid references public.profiles(id) on delete set null,
  author_name    text not null default 'Anonymous',
  relationship   text,
  title          text not null,
  body           text not null,
  scores         jsonb not null,            -- { coaching: 4.5, ... } or coach categories
  overall_rating numeric(2,1) not null check (overall_rating between 1 and 5),
  created_at     timestamptz not null default now()
);

create index if not exists reviews_subject_idx on public.reviews (subject_type, subject_id);

-- One review per user per subject (lets a user edit via upsert).
create unique index if not exists reviews_user_subject_uniq
  on public.reviews (user_id, subject_type, subject_id);

-- ============================================================
--  TRYOUTS
-- ============================================================
create table if not exists public.tryouts (
  id          uuid primary key default gen_random_uuid(),
  club_id     text references public.clubs(id) on delete cascade,
  club_name   text,
  club_slug   text,
  region      text,
  city        text,
  age_groups  text,
  gender      text,
  date        timestamptz,
  note        text,
  created_at  timestamptz not null default now()
);

-- ============================================================
--  RANKINGS  (denormalized leaderboard entries)
-- ============================================================
create table if not exists public.rankings (
  id          text primary key,
  category    text not null,   -- clubs | coaches | gk-trainers | tournaments | camps | facilities
  name        text not null,
  subtitle    text,
  region      text,
  league      text,
  votes       int not null default 0,
  trend       text default 'flat',
  href        text,
  created_at  timestamptz not null default now()
);

create index if not exists rankings_category_idx on public.rankings (category);

-- ============================================================
--  RANKING SNAPSHOTS  (end-of-month standings → powers trend arrows)
-- ============================================================
create table if not exists public.ranking_snapshots (
  id         uuid primary key default gen_random_uuid(),
  period     text not null,   -- 'YYYY-MM' the snapshot represents
  category   text not null,   -- clubs | schools | coaches | training-centers | ...
  item_id    text not null,
  rank       int not null,
  votes      int not null default 0,
  created_at timestamptz not null default now(),
  unique (period, item_id)
);

create index if not exists ranking_snapshots_period_idx on public.ranking_snapshots (period);

-- ============================================================
--  VOTES  (one per user / item / month)
-- ============================================================
create table if not exists public.votes (
  id         uuid primary key default gen_random_uuid(),
  item_id    text not null,
  item_name  text,
  period     text not null,   -- 'YYYY-MM'
  user_id    uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (item_id, period, user_id)
);

-- ============================================================
--  COMMITMENTS  (college / pro / national-team announcements — a paid benefit)
-- ============================================================
create table if not exists public.commitments (
  id            uuid primary key default gen_random_uuid(),
  subject_type  text not null check (subject_type in ('club','school')),
  subject_slug  text not null,
  subject_name  text,
  player_name   text not null,
  grad_year     int,
  gender        text,
  position      text,
  dest_type     text not null check (dest_type in ('College','Pro','National Team')),
  destination   text not null,
  division      text,
  user_id       uuid references public.profiles(id) on delete set null,
  status        text not null default 'pending',  -- pending | published | rejected
  created_at    timestamptz not null default now()
);

create index if not exists commitments_subject_idx on public.commitments (subject_type, subject_slug);

-- ============================================================
--  CLAIM REQUESTS  (a rep asks to manage a club/school/coach profile)
-- ============================================================
create table if not exists public.claim_requests (
  id            uuid primary key default gen_random_uuid(),
  subject_type  text not null check (subject_type in ('club','school','coach','training-center','facility','tournament','camp')),
  subject_slug  text not null,
  subject_name  text,
  claimant_name text not null,
  role          text,
  email         text not null,
  phone         text,
  message       text,
  user_id       uuid references public.profiles(id) on delete set null,
  plan          text not null default 'claim' check (plan in ('claim','featured')), -- tier chosen
  plan_price    int,                 -- annual price quoted for that tier (after discount)
  promo_code    text,
  referral_code text,
  status        text not null default 'pending',  -- pending | approved | active | rejected
  created_at    timestamptz not null default now()
);

-- Idempotent: ensure the tier column exists on pre-existing tables.
alter table public.claim_requests add column if not exists plan text not null default 'claim';

-- ============================================================
--  SUBMISSIONS  (registered users submit a new listing for admin review)
-- ============================================================
create table if not exists public.submissions (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('club','school','coach','training-center','facility','tournament','camp')),
  name        text not null,
  region      text,
  city        text,
  website     text,
  notes       text,
  submitter_email text,
  user_id     uuid references public.profiles(id) on delete set null,
  status      text not null default 'pending',  -- pending | approved | rejected
  created_at  timestamptz not null default now()
);

-- ============================================================
--  POLL VOTES  (anonymous Sideline poll votes — aggregate sentiment data)
-- ============================================================
create table if not exists public.poll_votes (
  id           uuid primary key default gen_random_uuid(),
  poll_id      text not null,
  option_index int not null,
  created_at   timestamptz not null default now()
);
create index if not exists poll_votes_poll_idx on public.poll_votes (poll_id);

-- Public aggregate view: counts only, no raw rows. Runs with definer rights so
-- anon can read tallies without read access to the underlying table.
create or replace view public.poll_results as
  select poll_id, option_index, count(*)::int as votes
  from public.poll_votes
  group by poll_id, option_index;

grant select on public.poll_results to anon, authenticated, service_role;

-- ============================================================
--  AD ORDERS  (pre-paid advertising order form)
-- ============================================================
create table if not exists public.ad_orders (
  id           uuid primary key default gen_random_uuid(),
  business     text not null,
  contact      text not null,
  email        text not null,
  phone        text,
  website      text,
  placement    text,
  impressions  int,
  geo          text,
  issues       int,
  start_date   date,
  weeks        int,
  creative_url text,
  landing_url  text,
  estimate     int,
  notes        text,
  status       text not null default 'pending',  -- pending | invoiced | live | done
  created_at   timestamptz not null default now()
);

-- ============================================================
--  PARTNER INQUIRIES  (Premier Partner Program)
-- ============================================================
create table if not exists public.partner_inquiries (
  id         uuid primary key default gen_random_uuid(),
  tier       text,
  org        text not null,
  org_type   text,
  contact    text not null,
  email      text not null,
  phone      text,
  goals      text,
  status     text not null default 'new',  -- new | contacted | won | lost
  created_at timestamptz not null default now()
);

-- ============================================================
--  AD EVENTS  (impression + click tracking → CPM billing/reporting)
-- ============================================================
create table if not exists public.ad_events (
  id         uuid primary key default gen_random_uuid(),
  ad_id      text not null,
  placement  text,
  type       text not null check (type in ('impression','click')),
  created_at timestamptz not null default now()
);

create index if not exists ad_events_idx on public.ad_events (ad_id, type, created_at);

create or replace view public.ad_event_tallies as
  select ad_id, placement, type, to_char(created_at, 'YYYY-MM') as period, count(*) as n
  from public.ad_events
  group by ad_id, placement, type, to_char(created_at, 'YYYY-MM');

-- ============================================================
--  LOGOS  (uploaded club/school/coach logos — a paid-profile perk)
-- ============================================================
create table if not exists public.logos (
  id           uuid primary key default gen_random_uuid(),
  subject_type text not null check (subject_type in ('club','school','coach','training-center','facility','tournament','camp')),
  slug         text not null,
  url          text not null,
  updated_at   timestamptz not null default now(),
  unique (subject_type, slug)
);

-- Public storage bucket for image files (uploads run server-side via service role).
insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do nothing;

-- ============================================================
--  SITE CONFIG  (admin-editable settings, e.g. pricing — key/JSON)
-- ============================================================
create table if not exists public.site_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- ============================================================
--  NEWSLETTER SUBSCRIBERS
-- ============================================================
create table if not exists public.newsletter_subscribers (
  id           uuid primary key default gen_random_uuid(),
  email        text unique not null,
  region       text,
  unsubscribed boolean not null default false,
  created_at   timestamptz not null default now()
);

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles               enable row level security;
alter table public.clubs                  enable row level security;
alter table public.coaches                enable row level security;
alter table public.schools                enable row level security;
alter table public.reviews                enable row level security;
alter table public.tryouts                enable row level security;
alter table public.rankings               enable row level security;
alter table public.votes                  enable row level security;
alter table public.ranking_snapshots      enable row level security;
alter table public.commitments            enable row level security;
alter table public.claim_requests         enable row level security;
alter table public.submissions            enable row level security;
alter table public.ad_orders              enable row level security;
alter table public.partner_inquiries      enable row level security;
alter table public.site_config            enable row level security;
alter table public.ad_events              enable row level security;
alter table public.logos                  enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.poll_votes             enable row level security;

-- Public read for reference + community data
create policy "public read clubs"    on public.clubs    for select using (true);
create policy "public read coaches"  on public.coaches  for select using (true);
create policy "public read schools"  on public.schools  for select using (true);
create policy "public read reviews"  on public.reviews  for select using (true);
create policy "public read tryouts"  on public.tryouts  for select using (true);
create policy "public read rankings" on public.rankings for select using (true);
create policy "public read ranking snapshots" on public.ranking_snapshots for select using (true);
-- Site config: public read (pages render pricing); writes via service role (admin).
create policy "public read site config" on public.site_config for select using (true);
-- Logos: public read (profiles render them); writes via service role (admin upload).
create policy "public read logos" on public.logos for select using (true);
-- Ad events: anyone may log an impression/click; reads via service role (admin reporting).
create policy "anyone log ad event" on public.ad_events for insert with check (true);
-- Poll votes: anyone may cast an anonymous vote; tallies read via the poll_results view.
create policy "anyone cast poll vote" on public.poll_votes for insert with check (true);
-- Commitments: published ones are public; authed owners insert their own.
create policy "public read commitments" on public.commitments for select using (status = 'published');
create policy "authed insert commitment" on public.commitments for insert with check (auth.uid() = user_id);

-- Profiles: a user can see and edit their own
create policy "own profile read"   on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- Reviews: must be signed in to submit; only authors may edit/delete their own.
create policy "authed insert review" on public.reviews for insert with check (auth.uid() = user_id);
create policy "author update review" on public.reviews for update using (auth.uid() = user_id);
create policy "author delete review" on public.reviews for delete using (auth.uid() = user_id);

-- Votes: must be signed in; one vote per user/item/period enforced by unique index.
create policy "public read votes"  on public.votes for select using (true);
create policy "authed insert vote" on public.votes for insert with check (auth.uid() = user_id);

-- Claim requests: anyone may submit; only staff/admin read (no public select policy).
create policy "anyone submit claim" on public.claim_requests for insert with check (true);

-- Submissions: signed-in users add new listings for review; admin reads via service role.
create policy "authed submit listing" on public.submissions for insert with check (auth.uid() = user_id);

-- Ad orders & partner inquiries: anyone may submit; no public read (staff only).
create policy "anyone submit ad order" on public.ad_orders for insert with check (true);
create policy "anyone submit partner inquiry" on public.partner_inquiries for insert with check (true);

-- Newsletter: anyone may subscribe
create policy "anyone subscribe" on public.newsletter_subscribers for insert with check (true);

-- ============================================================
--  Helper view: live vote tally per item for the current month
-- ============================================================
create or replace view public.vote_tallies as
  select item_id, period, count(*) as votes
  from public.votes
  group by item_id, period;
