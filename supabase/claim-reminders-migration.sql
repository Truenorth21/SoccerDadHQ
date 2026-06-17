-- Claim-expiry reminders: track which reminder emails have been sent so the daily
-- cron sends the 30-day and 7-day notices once each (reset when a claim is extended).
-- Run once in the Supabase SQL editor.

alter table public.profile_claims add column if not exists reminded_30 boolean default false;
alter table public.profile_claims add column if not exists reminded_7  boolean default false;
