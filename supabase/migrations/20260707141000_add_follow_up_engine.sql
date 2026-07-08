alter table public.leads
add column if not exists follow_up_status text not null default 'Waiting',
add column if not exists last_follow_up_at timestamptz,
add column if not exists follow_up_count integer not null default 0,
add column if not exists booked_meeting boolean not null default false;

alter table public.leads
drop constraint if exists leads_follow_up_status_check;

alter table public.leads
add constraint leads_follow_up_status_check
check (
  follow_up_status in (
    'Waiting',
    'Reminder 1 sent',
    'Reminder 2 sent',
    'Final reminder sent',
    'Meeting booked'
  )
);

create index if not exists leads_follow_up_due_idx
on public.leads (booked_meeting, follow_up_count, created_at, last_follow_up_at);

notify pgrst, 'reload schema';
