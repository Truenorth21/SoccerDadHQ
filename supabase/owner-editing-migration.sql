-- Owner editing: lets the paid claimant manage their own profile.
-- Run this in the Supabase SQL editor.

-- 1) Per-profile owner edits, stored as JSON so it works for ANY profile type
--    (clubs/schools/coaches/listings) and even for seed profiles that have no
--    row in their entity table yet. Merged on top of the entity at read time.
create table if not exists public.profile_overrides (
  subject_type text not null,
  slug         text not null,
  data         jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now(),
  primary key (subject_type, slug)
);

-- Public read (so the cookieless loaders can merge overrides into public pages).
alter table public.profile_overrides enable row level security;
do $$ begin
  create policy "overrides public read" on public.profile_overrides for select using (true);
exception when duplicate_object then null; end $$;
-- Writes happen only via the service role (the owner-gated API), which bypasses RLS.

-- 2) Owner replies to reviews.
alter table public.reviews add column if not exists owner_reply text;
alter table public.reviews add column if not exists owner_reply_at timestamptz;
