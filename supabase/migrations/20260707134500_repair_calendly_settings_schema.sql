create extension if not exists pgcrypto with schema extensions;

create table if not exists public.calendly_settings (
  id uuid primary key default gen_random_uuid(),
  calendly_pat text not null default '',
  calendly_user_uri text not null default '',
  calendly_account_name text not null default '',
  calendly_account_email text not null default '',
  default_booking_url text not null default '',
  webhook_signing_key text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.calendly_settings
add column if not exists calendly_pat text not null default '',
add column if not exists calendly_user_uri text not null default '',
add column if not exists calendly_account_name text not null default '',
add column if not exists calendly_account_email text not null default '',
add column if not exists default_booking_url text not null default '',
add column if not exists webhook_signing_key text not null default '',
add column if not exists created_at timestamptz not null default now(),
add column if not exists updated_at timestamptz not null default now();

notify pgrst, 'reload schema';
