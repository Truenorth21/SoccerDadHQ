-- Google AdSense placements: one row per fixed on-site slot. The admin Ads page
-- (/admin/ads) edits these; public pages render the unit only when `enabled` is
-- true and an AdSense slot id is set. Run once in the Supabase SQL editor.

create table if not exists public.ad_placements (
  slot            text primary key,
  location        text not null default '',
  size            text not null default 'leaderboard' check (size in ('leaderboard','rectangle','sidebar')),
  adsense_slot_id text not null default '',
  enabled         boolean not null default false,
  updated_at      timestamptz not null default now()
);

alter table public.ad_placements enable row level security;

-- Public pages read placements with the anon key, so allow read-only SELECT.
drop policy if exists "ad_placements public read" on public.ad_placements;
create policy "ad_placements public read" on public.ad_placements for select using (true);
-- Writes go through the admin API (service-role key), which bypasses RLS.
