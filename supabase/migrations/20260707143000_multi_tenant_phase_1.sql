create extension if not exists pgcrypto with schema extensions;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active',
  plan text not null default 'internal',
  owner_email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.businesses (
  id,
  name,
  slug,
  status,
  plan,
  owner_email
)
values (
  '00000000-0000-0000-0000-000000000001',
  'JOHAI',
  'johai',
  'active',
  'internal',
  ''
)
on conflict (id) do update
set
  name = excluded.name,
  slug = excluded.slug,
  status = excluded.status,
  plan = excluded.plan,
  updated_at = now();

create table if not exists public.business_settings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  booking_url text not null default '',
  calendly_user_uri text not null default '',
  calendly_account_name text not null default '',
  calendly_account_email text not null default '',
  email_provider text not null default 'resend',
  email_api_key text not null default '',
  email_from text not null default '',
  email_owner text not null default '',
  ai_assistant_name text not null default 'JOHAI',
  ai_system_prompt text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id)
);

alter table public.business_settings
add column if not exists booking_url text not null default '',
add column if not exists calendly_user_uri text not null default '',
add column if not exists calendly_account_name text not null default '',
add column if not exists calendly_account_email text not null default '',
add column if not exists email_provider text not null default 'resend',
add column if not exists email_api_key text not null default '',
add column if not exists email_from text not null default '',
add column if not exists email_owner text not null default '',
add column if not exists ai_assistant_name text not null default 'JOHAI',
add column if not exists ai_system_prompt text not null default '',
add column if not exists updated_at timestamptz not null default now();

insert into public.business_settings (business_id, ai_assistant_name)
values ('00000000-0000-0000-0000-000000000001', 'JOHAI')
on conflict (business_id) do nothing;

alter table public.leads
add column if not exists business_id uuid references public.businesses(id);

update public.leads
set business_id = '00000000-0000-0000-0000-000000000001'
where business_id is null;

alter table public.leads
alter column business_id set default '00000000-0000-0000-0000-000000000001',
alter column business_id set not null;

alter table public.calendly_settings
add column if not exists business_id uuid references public.businesses(id);

update public.calendly_settings
set business_id = '00000000-0000-0000-0000-000000000001'
where business_id is null;

alter table public.calendly_settings
alter column business_id set default '00000000-0000-0000-0000-000000000001',
alter column business_id set not null;

create table if not exists public.automations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  type text not null default 'workflow',
  status text not null default 'draft',
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  type text not null default 'email',
  status text not null default 'scheduled',
  scheduled_for timestamptz,
  sent_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  status text not null default 'draft',
  summary text not null default '',
  recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_business_id_idx on public.leads (business_id);
create index if not exists automations_business_id_idx on public.automations (business_id);
create index if not exists follow_ups_business_id_idx on public.follow_ups (business_id);
create index if not exists audits_business_id_idx on public.audits (business_id);

notify pgrst, 'reload schema';
