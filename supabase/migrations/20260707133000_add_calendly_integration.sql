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
add column if not exists calendly_account_name text not null default '',
add column if not exists calendly_account_email text not null default '',
add column if not exists calendly_pat text not null default '',
add column if not exists calendly_user_uri text not null default '',
add column if not exists default_booking_url text not null default '',
add column if not exists webhook_signing_key text not null default '',
add column if not exists created_at timestamptz not null default now(),
add column if not exists updated_at timestamptz not null default now();

alter table public.leads
add column if not exists source text not null default 'Chatbot',
add column if not exists booking_date date,
add column if not exists booking_time text,
add column if not exists next_meeting_at timestamptz,
add column if not exists meeting_status text not null default 'Not booked',
add column if not exists calendly_event_uri text,
add column if not exists calendly_invitee_uri text;

create index if not exists leads_email_idx on public.leads (lower(email));
create index if not exists leads_next_meeting_at_idx on public.leads (next_meeting_at);
