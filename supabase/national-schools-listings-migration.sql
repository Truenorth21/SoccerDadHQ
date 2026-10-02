-- National expansion, part 2: high schools, listings (training centers, facilities,
-- tournaments, camps) and college commitments go from Florida-only to every state.
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query → Run),
-- AFTER national-expansion-migration.sql. Safe to re-run: every step is idempotent
-- and existing Florida rows are only ever tagged 'FL'.

-- ============================================================
--  SCHOOLS  (already had a state column defaulting to 'FL')
-- ============================================================
alter table public.schools add column if not exists state text;

update public.schools
   set state = 'FL'
 where state is null
    or btrim(state) = '';

alter table public.schools alter column state set default 'FL';
alter table public.schools alter column state set not null;
-- States without predefined regions list schools by city / ZIP only, so region is optional now.
alter table public.schools alter column region drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'schools_state_code_chk') then
    alter table public.schools add constraint schools_state_code_chk check (state ~ '^[A-Z]{2}$');
  end if;
end $$;

create index if not exists schools_state_idx on public.schools (state);
create index if not exists schools_state_region_idx on public.schools (state, region);

-- ============================================================
--  LISTINGS  (training centers, facilities, tournaments, camps)
-- ============================================================
alter table public.listings add column if not exists state text;

update public.listings
   set state = 'FL'
 where state is null
    or btrim(state) = '';

alter table public.listings alter column state set default 'FL';
alter table public.listings alter column state set not null;
alter table public.listings alter column region drop not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'listings_state_code_chk') then
    alter table public.listings add constraint listings_state_code_chk check (state ~ '^[A-Z]{2}$');
  end if;
end $$;

create index if not exists listings_state_idx on public.listings (state);
create index if not exists listings_kind_state_idx on public.listings (kind, state);

-- ============================================================
--  COMMITMENTS  (announced by a club or school; takes that program's state)
-- ============================================================
alter table public.commitments add column if not exists state text;

update public.commitments co
   set state = cl.state
  from public.clubs cl
 where co.subject_type = 'club'
   and co.subject_slug = cl.slug
   and co.state is null;

update public.commitments co
   set state = s.state
  from public.schools s
 where co.subject_type = 'school'
   and co.subject_slug = s.slug
   and co.state is null;

-- Anything still untagged was announced on the Florida-only site.
update public.commitments
   set state = 'FL'
 where state is null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'commitments_state_code_chk') then
    alter table public.commitments
      add constraint commitments_state_code_chk check (state is null or state ~ '^[A-Z]{2}$');
  end if;
end $$;

create index if not exists commitments_state_idx on public.commitments (state);
