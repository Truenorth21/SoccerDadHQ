-- Phase 2: admin → user messaging (broadcast / group / individual) + user groups.
-- Run once in the Supabase SQL editor. Admin/service-role only; the dashboard reads
-- a user's messages via the service-role key scoped to that user.

create table if not exists public.user_groups (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.user_group_members (
  group_id uuid references public.user_groups(id) on delete cascade,
  user_id  uuid references public.profiles(id) on delete cascade,
  primary key (group_id, user_id)
);

create table if not exists public.messages (
  id           uuid primary key default gen_random_uuid(),
  subject      text not null,
  body         text not null,
  audience     text not null check (audience in ('all','group','user')),
  target_group uuid references public.user_groups(id) on delete cascade,
  target_user  uuid references public.profiles(id) on delete cascade,
  emailed      boolean default false,
  created_at   timestamptz not null default now()
);
create index if not exists messages_created_at_idx on public.messages (created_at desc);

create table if not exists public.message_reads (
  message_id uuid references public.messages(id) on delete cascade,
  user_id    uuid references public.profiles(id) on delete cascade,
  read_at    timestamptz not null default now(),
  primary key (message_id, user_id)
);

alter table public.user_groups        enable row level security;
alter table public.user_group_members enable row level security;
alter table public.messages           enable row level security;
alter table public.message_reads      enable row level security;
