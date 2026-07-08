create extension if not exists pgcrypto with schema extensions;

create table if not exists public.business_brains (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  industry text not null default '',
  business_profile jsonb not null default '{}'::jsonb,
  products jsonb not null default '[]'::jsonb,
  services jsonb not null default '[]'::jsonb,
  pricing jsonb not null default '{}'::jsonb,
  opening_hours jsonb not null default '{}'::jsonb,
  languages jsonb not null default '[]'::jsonb,
  tone_of_voice text not null default '',
  target_customers jsonb not null default '[]'::jsonb,
  policies jsonb not null default '{}'::jsonb,
  frequently_asked_questions jsonb not null default '[]'::jsonb,
  booking_rules jsonb not null default '{}'::jsonb,
  lead_qualification_rules jsonb not null default '{}'::jsonb,
  escalation_rules jsonb not null default '{}'::jsonb,
  communication_rules jsonb not null default '{}'::jsonb,
  vocabulary jsonb not null default '[]'::jsonb,
  industry_template text not null default '',
  profile_score integer not null default 0,
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id)
);

alter table public.business_brains
add column if not exists business_id uuid references public.businesses(id) on delete cascade,
add column if not exists industry text not null default '',
add column if not exists business_profile jsonb not null default '{}'::jsonb,
add column if not exists products jsonb not null default '[]'::jsonb,
add column if not exists services jsonb not null default '[]'::jsonb,
add column if not exists pricing jsonb not null default '{}'::jsonb,
add column if not exists opening_hours jsonb not null default '{}'::jsonb,
add column if not exists languages jsonb not null default '[]'::jsonb,
add column if not exists tone_of_voice text not null default '',
add column if not exists target_customers jsonb not null default '[]'::jsonb,
add column if not exists policies jsonb not null default '{}'::jsonb,
add column if not exists frequently_asked_questions jsonb not null default '[]'::jsonb,
add column if not exists booking_rules jsonb not null default '{}'::jsonb,
add column if not exists lead_qualification_rules jsonb not null default '{}'::jsonb,
add column if not exists escalation_rules jsonb not null default '{}'::jsonb,
add column if not exists communication_rules jsonb not null default '{}'::jsonb,
add column if not exists vocabulary jsonb not null default '[]'::jsonb,
add column if not exists industry_template text not null default '',
add column if not exists profile_score integer not null default 0,
add column if not exists recommendations jsonb not null default '[]'::jsonb,
add column if not exists updated_at timestamptz not null default now();

create index if not exists business_brains_business_id_idx
on public.business_brains (business_id);

alter table public.business_brains enable row level security;

drop policy if exists business_brains_owned on public.business_brains;
create policy business_brains_owned
on public.business_brains
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

notify pgrst, 'reload schema';
