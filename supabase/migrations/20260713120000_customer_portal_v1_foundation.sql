begin;

-- Customer Portal identities are separate from business workspace membership.
create table if not exists public.customer_profiles (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  preferred_language text not null default 'en',
  communication_preference text not null default 'email',
  address jsonb not null default '{}'::jsonb,
  notification_preferences jsonb not null default '{}'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_user_id, business_id),
  unique (id, business_id),
  constraint customer_profiles_status_check
    check (status in ('invited', 'active', 'suspended')),
  constraint customer_profiles_lead_business_fk
    foreign key (lead_id, business_id)
    references public.leads(id, business_id)
    on delete set null (lead_id)
);

create table if not exists public.customer_portal_invitations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid,
  email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  constraint customer_portal_invitations_lead_business_fk
    foreign key (lead_id, business_id)
    references public.leads(id, business_id)
    on delete set null (lead_id)
);

-- Safe customer-visible branding is kept separate from private business settings.
create table if not exists public.customer_portal_branding (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  display_name text not null default '',
  logo_url text not null default '',
  primary_color text not null default '',
  secondary_color text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  address text not null default '',
  business_hours jsonb not null default '{}'::jsonb,
  support_email text not null default '',
  booking_url text not null default '',
  industry text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_portal_appointments (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_profile_id uuid not null,
  external_provider text not null default '',
  external_event_id text not null default '',
  status text not null default 'scheduled',
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'UTC',
  location text not null default '',
  meeting_url text not null default '',
  service_name text not null default '',
  customer_visible_notes text not null default '',
  reschedule_url text not null default '',
  cancel_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_portal_appointments_profile_business_fk
    foreign key (customer_profile_id, business_id)
    references public.customer_profiles(id, business_id)
    on delete cascade,
  constraint customer_portal_appointments_status_check
    check (status in ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'))
);

create table if not exists public.customer_portal_messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_profile_id uuid not null,
  sender_type text not null,
  body text not null,
  is_customer_visible boolean not null default true,
  human_support_requested boolean not null default false,
  created_at timestamptz not null default now(),
  constraint customer_portal_messages_profile_business_fk
    foreign key (customer_profile_id, business_id)
    references public.customer_profiles(id, business_id)
    on delete cascade,
  constraint customer_portal_messages_sender_check
    check (sender_type in ('customer', 'ai', 'human')),
  constraint customer_portal_messages_body_check
    check (char_length(btrim(body)) between 1 and 10000)
);

create table if not exists public.customer_portal_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_profile_id uuid not null,
  document_type text not null,
  title text not null,
  storage_bucket text not null,
  storage_path text not null,
  mime_type text not null default 'application/octet-stream',
  file_size bigint not null default 0,
  shared_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint customer_portal_documents_profile_business_fk
    foreign key (customer_profile_id, business_id)
    references public.customer_profiles(id, business_id)
    on delete cascade,
  constraint customer_portal_documents_type_check
    check (document_type in ('quote', 'invoice', 'instructions', 'contract', 'report', 'receipt', 'form', 'other')),
  unique (id, customer_profile_id, business_id)
);

create table if not exists public.customer_portal_document_acknowledgements (
  document_id uuid not null,
  customer_profile_id uuid not null,
  business_id uuid not null,
  acknowledged_at timestamptz not null default now(),
  primary key (document_id, customer_profile_id),
  constraint customer_portal_document_ack_document_fk
    foreign key (document_id, customer_profile_id, business_id)
    references public.customer_portal_documents(id, customer_profile_id, business_id)
    on delete cascade
);

create table if not exists public.customer_portal_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_profile_id uuid not null,
  request_type text not null default 'support',
  subject text not null,
  status text not null default 'open',
  customer_visible_detail text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_portal_requests_profile_business_fk
    foreign key (customer_profile_id, business_id)
    references public.customer_profiles(id, business_id)
    on delete cascade,
  constraint customer_portal_requests_status_check
    check (status in ('open', 'in_progress', 'resolved', 'closed'))
);

create index if not exists customer_profiles_business_idx
  on public.customer_profiles(business_id);
create index if not exists customer_portal_invitations_business_email_idx
  on public.customer_portal_invitations(business_id, lower(email));
create index if not exists customer_portal_appointments_customer_starts_idx
  on public.customer_portal_appointments(customer_profile_id, starts_at desc);
create index if not exists customer_portal_messages_customer_created_idx
  on public.customer_portal_messages(customer_profile_id, created_at desc);
create index if not exists customer_portal_documents_customer_shared_idx
  on public.customer_portal_documents(customer_profile_id, shared_at desc)
  where revoked_at is null;
create index if not exists customer_portal_requests_customer_status_idx
  on public.customer_portal_requests(customer_profile_id, status, created_at desc);

create or replace function public.is_current_portal_customer(
  target_customer_profile_id uuid,
  target_business_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select exists (
    select 1
    from public.customer_profiles cp
    where cp.id = target_customer_profile_id
      and cp.business_id = target_business_id
      and cp.auth_user_id = auth.uid()
      and cp.status = 'active'
  );
$$;

revoke all on function public.is_current_portal_customer(uuid, uuid)
  from public, anon;
grant execute on function public.is_current_portal_customer(uuid, uuid)
  to authenticated, service_role;

alter table public.customer_profiles enable row level security;
alter table public.customer_portal_invitations enable row level security;
alter table public.customer_portal_branding enable row level security;
alter table public.customer_portal_appointments enable row level security;
alter table public.customer_portal_messages enable row level security;
alter table public.customer_portal_documents enable row level security;
alter table public.customer_portal_document_acknowledgements enable row level security;
alter table public.customer_portal_requests enable row level security;

drop policy if exists customer_profiles_customer_select on public.customer_profiles;
drop policy if exists customer_profiles_customer_update on public.customer_profiles;
drop policy if exists customer_profiles_business_manage on public.customer_profiles;
drop policy if exists customer_portal_invitations_business_manage on public.customer_portal_invitations;
drop policy if exists customer_portal_branding_customer_select on public.customer_portal_branding;
drop policy if exists customer_portal_branding_business_manage on public.customer_portal_branding;
drop policy if exists customer_portal_appointments_customer_select on public.customer_portal_appointments;
drop policy if exists customer_portal_appointments_business_manage on public.customer_portal_appointments;
drop policy if exists customer_portal_messages_customer_select on public.customer_portal_messages;
drop policy if exists customer_portal_messages_customer_insert on public.customer_portal_messages;
drop policy if exists customer_portal_messages_business_manage on public.customer_portal_messages;
drop policy if exists customer_portal_documents_customer_select on public.customer_portal_documents;
drop policy if exists customer_portal_documents_business_manage on public.customer_portal_documents;
drop policy if exists customer_portal_document_ack_customer_select on public.customer_portal_document_acknowledgements;
drop policy if exists customer_portal_document_ack_customer_insert on public.customer_portal_document_acknowledgements;
drop policy if exists customer_portal_document_ack_business_manage on public.customer_portal_document_acknowledgements;
drop policy if exists customer_portal_requests_customer_select on public.customer_portal_requests;
drop policy if exists customer_portal_requests_customer_insert on public.customer_portal_requests;
drop policy if exists customer_portal_requests_business_manage on public.customer_portal_requests;

create policy customer_profiles_customer_select
on public.customer_profiles for select to authenticated
using (auth_user_id = auth.uid() and status = 'active');
create policy customer_profiles_customer_update
on public.customer_profiles for update to authenticated
using (auth_user_id = auth.uid() and status = 'active')
with check (auth_user_id = auth.uid() and status = 'active');
create policy customer_profiles_business_manage
on public.customer_profiles for all to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

create policy customer_portal_invitations_business_manage
on public.customer_portal_invitations for all to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

create policy customer_portal_branding_customer_select
on public.customer_portal_branding for select to authenticated
using (
  exists (
    select 1 from public.customer_profiles cp
    where cp.business_id = customer_portal_branding.business_id
      and cp.auth_user_id = auth.uid()
      and cp.status = 'active'
  )
);
create policy customer_portal_branding_business_manage
on public.customer_portal_branding for all to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

create policy customer_portal_appointments_customer_select
on public.customer_portal_appointments for select to authenticated
using (public.is_current_portal_customer(customer_profile_id, business_id));
create policy customer_portal_appointments_business_manage
on public.customer_portal_appointments for all to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

create policy customer_portal_messages_customer_select
on public.customer_portal_messages for select to authenticated
using (
  is_customer_visible
  and public.is_current_portal_customer(customer_profile_id, business_id)
);
create policy customer_portal_messages_customer_insert
on public.customer_portal_messages for insert to authenticated
with check (
  sender_type = 'customer'
  and is_customer_visible
  and public.is_current_portal_customer(customer_profile_id, business_id)
);
create policy customer_portal_messages_business_manage
on public.customer_portal_messages for all to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

create policy customer_portal_documents_customer_select
on public.customer_portal_documents for select to authenticated
using (
  revoked_at is null
  and public.is_current_portal_customer(customer_profile_id, business_id)
);
create policy customer_portal_documents_business_manage
on public.customer_portal_documents for all to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

create policy customer_portal_document_ack_customer_select
on public.customer_portal_document_acknowledgements for select to authenticated
using (public.is_current_portal_customer(customer_profile_id, business_id));
create policy customer_portal_document_ack_customer_insert
on public.customer_portal_document_acknowledgements for insert to authenticated
with check (public.is_current_portal_customer(customer_profile_id, business_id));
create policy customer_portal_document_ack_business_manage
on public.customer_portal_document_acknowledgements for all to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

create policy customer_portal_requests_customer_select
on public.customer_portal_requests for select to authenticated
using (public.is_current_portal_customer(customer_profile_id, business_id));
create policy customer_portal_requests_customer_insert
on public.customer_portal_requests for insert to authenticated
with check (
  status = 'open'
  and public.is_current_portal_customer(customer_profile_id, business_id)
);
create policy customer_portal_requests_business_manage
on public.customer_portal_requests for all to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

-- Registration linkage and document delivery remain server-controlled.
revoke all on public.customer_portal_invitations from anon, authenticated;
revoke all on public.customer_profiles from anon;
revoke insert, delete on public.customer_profiles from authenticated;
revoke all on public.customer_portal_documents from anon;
revoke insert, update, delete on public.customer_portal_documents from authenticated;
revoke all on public.customer_portal_appointments from anon;
revoke insert, update, delete on public.customer_portal_appointments from authenticated;

grant select on public.customer_profiles to authenticated;
grant update (full_name, email, phone, preferred_language, communication_preference, address, notification_preferences, updated_at)
  on public.customer_profiles to authenticated;
grant select on public.customer_portal_branding to authenticated;
grant select on public.customer_portal_appointments to authenticated;
grant select, insert on public.customer_portal_messages to authenticated;
grant select on public.customer_portal_documents to authenticated;
grant select, insert on public.customer_portal_document_acknowledgements to authenticated;
grant select, insert on public.customer_portal_requests to authenticated;

notify pgrst, 'reload schema';

commit;
