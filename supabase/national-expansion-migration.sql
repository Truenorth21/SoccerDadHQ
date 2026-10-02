-- National expansion: adds a two-letter `state` to clubs, coaches and newsletter
-- subscribers, and tags every existing (Florida) record with state = 'FL'.
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query → Run),
-- then run national-clubs-seed.sql to load the TX / GA / NC / SC / TN clubs.
-- Safe to re-run: every step is idempotent and never touches non-Florida rows.

-- The nine original Florida region keys — used to identify existing Florida rows.
-- (Every region outside Florida is prefixed with its state code, e.g. 'tx-dfw'.)

-- ============================================================
--  CLUBS
-- ============================================================
alter table public.clubs add column if not exists state text;

update public.clubs
   set state = 'FL'
 where state is null
    or btrim(state) = ''
    or region in ('south-florida','palm-beach-treasure-coast','southwest-florida','tampa-bay',
                  'orlando-central','space-coast-daytona','jacksonville-ne','north-gainesville',
                  'panhandle-tallahassee');

alter table public.clubs alter column state set default 'FL';
alter table public.clubs alter column state set not null;
-- States without predefined regions list clubs by city / ZIP only, so region is optional now.
alter table public.clubs alter column region drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'clubs_state_code_chk') then
    alter table public.clubs add constraint clubs_state_code_chk check (state ~ '^[A-Z]{2}$');
  end if;
end $$;

create index if not exists clubs_state_idx on public.clubs (state);
create index if not exists clubs_state_region_idx on public.clubs (state, region);

-- ============================================================
--  COACHES
-- ============================================================
alter table public.coaches add column if not exists state text;

-- A coach takes their club's state when they have one…
update public.coaches co
   set state = cl.state
  from public.clubs cl
 where co.club_id = cl.id
   and (co.state is null or btrim(co.state) = '');

-- …and every other existing coach is a Florida coach.
update public.coaches
   set state = 'FL'
 where state is null
    or btrim(state) = ''
    or region in ('south-florida','palm-beach-treasure-coast','southwest-florida','tampa-bay',
                  'orlando-central','space-coast-daytona','jacksonville-ne','north-gainesville',
                  'panhandle-tallahassee');

alter table public.coaches alter column state set default 'FL';
alter table public.coaches alter column state set not null;
alter table public.coaches alter column region drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'coaches_state_code_chk') then
    alter table public.coaches add constraint coaches_state_code_chk check (state ~ '^[A-Z]{2}$');
  end if;
end $$;

create index if not exists coaches_state_idx on public.coaches (state);
create index if not exists coaches_state_region_idx on public.coaches (state, region);

-- ============================================================
--  NEWSLETTER SUBSCRIBERS
-- ============================================================
-- State is collected at signup so region-relevant emails can be sent later.
-- Nullable: subscribers from before this migration signed up on the Florida-only
-- site, so they are backfilled to 'FL'. New signups always send a state.
alter table public.newsletter_subscribers add column if not exists state text;

update public.newsletter_subscribers
   set state = 'FL'
 where state is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'newsletter_subscribers_state_code_chk') then
    alter table public.newsletter_subscribers
      add constraint newsletter_subscribers_state_code_chk check (state is null or state ~ '^[A-Z]{2}$');
  end if;
end $$;

create index if not exists newsletter_subscribers_state_idx on public.newsletter_subscribers (state);
