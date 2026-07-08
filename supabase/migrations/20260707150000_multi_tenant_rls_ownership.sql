create extension if not exists pgcrypto with schema extensions;

alter table public.businesses
add column if not exists owner_user_id uuid references auth.users(id),
add column if not exists updated_at timestamptz not null default now();

create table if not exists public.business_members (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'owner',
  created_at timestamptz not null default now(),
  unique (business_id, user_id)
);

create index if not exists business_members_user_id_idx
on public.business_members (user_id);

create index if not exists business_members_business_id_idx
on public.business_members (business_id);

create unique index if not exists leads_id_business_id_key
on public.leads (id, business_id);

alter table public.follow_ups
add constraint follow_ups_lead_id_required
check (lead_id is not null) not valid;

alter table public.audits
add constraint audits_lead_id_required
check (lead_id is not null) not valid;

alter table public.follow_ups
drop constraint if exists follow_ups_lead_business_fk;

alter table public.follow_ups
add constraint follow_ups_lead_business_fk
foreign key (lead_id, business_id)
references public.leads (id, business_id)
on delete cascade
not valid;

alter table public.audits
drop constraint if exists audits_lead_business_fk;

alter table public.audits
add constraint audits_lead_business_fk
foreign key (lead_id, business_id)
references public.leads (id, business_id)
on delete cascade
not valid;

create or replace function public.user_owns_business(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.business_members bm
    where bm.business_id = target_business_id
      and bm.user_id = auth.uid()
  )
  or exists (
    select 1
    from public.businesses b
    where b.id = target_business_id
      and b.owner_user_id = auth.uid()
  );
$$;

alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.business_settings enable row level security;
alter table public.leads enable row level security;
alter table public.calendly_settings enable row level security;
alter table public.automations enable row level security;
alter table public.follow_ups enable row level security;
alter table public.audits enable row level security;

drop policy if exists businesses_select_owned on public.businesses;
create policy businesses_select_owned
on public.businesses
for select
to authenticated
using (
  owner_user_id = auth.uid()
  or exists (
    select 1
    from public.business_members bm
    where bm.business_id = businesses.id
      and bm.user_id = auth.uid()
  )
);

drop policy if exists businesses_update_owned on public.businesses;
create policy businesses_update_owned
on public.businesses
for update
to authenticated
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

drop policy if exists business_members_select_owned on public.business_members;
create policy business_members_select_owned
on public.business_members
for select
to authenticated
using (public.user_owns_business(business_id));

drop policy if exists business_members_manage_owned on public.business_members;
create policy business_members_manage_owned
on public.business_members
for all
to authenticated
using (
  exists (
    select 1
    from public.businesses b
    where b.id = business_members.business_id
      and b.owner_user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = business_members.business_id
      and b.owner_user_id = auth.uid()
  )
);

drop policy if exists business_settings_owned on public.business_settings;
create policy business_settings_owned
on public.business_settings
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

drop policy if exists leads_owned on public.leads;
create policy leads_owned
on public.leads
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

drop policy if exists calendly_settings_owned on public.calendly_settings;
create policy calendly_settings_owned
on public.calendly_settings
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

drop policy if exists automations_owned on public.automations;
create policy automations_owned
on public.automations
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

drop policy if exists follow_ups_owned on public.follow_ups;
create policy follow_ups_owned
on public.follow_ups
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

drop policy if exists audits_owned on public.audits;
create policy audits_owned
on public.audits
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

notify pgrst, 'reload schema';
