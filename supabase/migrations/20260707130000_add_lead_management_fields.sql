alter table public.leads
add column if not exists status text not null default 'New',
add column if not exists notes text not null default '',
add column if not exists is_test boolean not null default false;

alter table public.leads
drop constraint if exists leads_status_check;

alter table public.leads
add constraint leads_status_check
check (status in ('New', 'Contacted', 'Qualified', 'Booked', 'Closed'));
