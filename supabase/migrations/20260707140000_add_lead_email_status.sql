alter table public.leads
add column if not exists owner_email_sent boolean not null default false,
add column if not exists prospect_email_sent boolean not null default false,
add column if not exists email_error text not null default '';

notify pgrst, 'reload schema';
