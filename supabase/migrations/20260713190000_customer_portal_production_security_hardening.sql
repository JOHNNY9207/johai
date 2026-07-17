begin;

set local search_path = pg_catalog;

-- Customer Portal identities must not share a Supabase Auth principal with
-- any Business Workspace owner or member. The existing member index covers
-- business_members.user_id; add the matching owner lookup index.
create index if not exists businesses_owner_user_id_idx
  on public.businesses(owner_user_id)
  where owner_user_id is not null;

create or replace function public.is_current_portal_customer(
  target_customer_profile_id uuid,
  target_business_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select
    auth.uid() is not null
    and not exists (
      select 1
      from public.business_members bm
      where bm.user_id = auth.uid()
    )
    and not exists (
      select 1
      from public.businesses b
      where b.owner_user_id = auth.uid()
    )
    and exists (
      select 1
      from public.customer_profiles cp
      where cp.id = target_customer_profile_id
        and cp.business_id = target_business_id
        and cp.auth_user_id = auth.uid()
        and cp.status = 'active'
    );
$function$;

alter function public.is_current_portal_customer(uuid, uuid) owner to postgres;
revoke all on function public.is_current_portal_customer(uuid, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.is_current_portal_customer(uuid, uuid)
  to authenticated;

-- Acknowledgements use this helper so a known identifier cannot be used to
-- acknowledge a document after that document has been revoked.
create or replace function public.is_current_portal_document(
  target_document_id uuid,
  target_customer_profile_id uuid,
  target_business_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog
as $function$
  select exists (
    select 1
    from public.customer_portal_documents d
    where d.id = target_document_id
      and d.customer_profile_id = target_customer_profile_id
      and d.business_id = target_business_id
      and d.revoked_at is null
      and public.is_current_portal_customer(
        d.customer_profile_id,
        d.business_id
      )
  );
$function$;

alter function public.is_current_portal_document(uuid, uuid, uuid) owner to postgres;
revoke all on function public.is_current_portal_document(uuid, uuid, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.is_current_portal_document(uuid, uuid, uuid)
  to authenticated;

-- The server, not the browser, owns profile audit timestamps.
create or replace function public.set_customer_profile_updated_at()
returns trigger
language plpgsql
volatile
security invoker
set search_path = pg_catalog
as $function$
begin
  new.updated_at := pg_catalog.statement_timestamp();
  return new;
end;
$function$;

alter function public.set_customer_profile_updated_at() owner to postgres;
revoke all on function public.set_customer_profile_updated_at()
  from public, anon, authenticated, service_role;

drop trigger if exists customer_profiles_set_updated_at
  on public.customer_profiles;
create trigger customer_profiles_set_updated_at
before update on public.customer_profiles
for each row
execute function public.set_customer_profile_updated_at();

-- Direct PostgREST writes must enforce the same bounded shapes as the
-- application. The live preflight recorded zero portal rows; if conflicting
-- rows are added before manual execution, these validated constraints fail
-- the transaction instead of silently accepting unsafe legacy data.
alter table public.customer_profiles
  drop constraint if exists customer_profiles_full_name_length_check;
alter table public.customer_profiles
  add constraint customer_profiles_full_name_length_check
  check (pg_catalog.char_length(full_name) <= 200);

alter table public.customer_profiles
  drop constraint if exists customer_profiles_email_length_check;
alter table public.customer_profiles
  add constraint customer_profiles_email_length_check
  check (pg_catalog.char_length(email) <= 320);

alter table public.customer_profiles
  drop constraint if exists customer_profiles_phone_length_check;
alter table public.customer_profiles
  add constraint customer_profiles_phone_length_check
  check (pg_catalog.char_length(phone) <= 64);

alter table public.customer_profiles
  drop constraint if exists customer_profiles_language_format_check;
alter table public.customer_profiles
  add constraint customer_profiles_language_format_check
  check (
    pg_catalog.char_length(preferred_language) between 2 and 35
    and preferred_language ~ '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$'
  );

alter table public.customer_profiles
  drop constraint if exists customer_profiles_communication_format_check;
alter table public.customer_profiles
  add constraint customer_profiles_communication_format_check
  check (
    communication_preference ~ '^[a-z][a-z0-9_-]{0,63}$'
  );

alter table public.customer_profiles
  drop constraint if exists customer_profiles_address_shape_check;
alter table public.customer_profiles
  add constraint customer_profiles_address_shape_check
  check (
    pg_catalog.jsonb_typeof(address) = 'object'
    and pg_catalog.octet_length(address::text) <= 20000
  );

alter table public.customer_profiles
  drop constraint if exists customer_profiles_notification_shape_check;
alter table public.customer_profiles
  add constraint customer_profiles_notification_shape_check
  check (
    pg_catalog.jsonb_typeof(notification_preferences) = 'object'
    and pg_catalog.octet_length(notification_preferences::text) <= 20000
  );

alter table public.customer_portal_invitations
  drop constraint if exists customer_portal_invitations_token_hash_check;
alter table public.customer_portal_invitations
  add constraint customer_portal_invitations_token_hash_check
  check (token_hash ~ '^[0-9a-f]{64}$');

alter table public.customer_portal_invitations
  drop constraint if exists customer_portal_invitations_expiry_check;
alter table public.customer_portal_invitations
  add constraint customer_portal_invitations_expiry_check
  check (expires_at > created_at);

alter table public.customer_portal_requests
  drop constraint if exists customer_portal_requests_type_format_check;
alter table public.customer_portal_requests
  add constraint customer_portal_requests_type_format_check
  check (request_type ~ '^[a-z][a-z0-9_-]{0,63}$');

alter table public.customer_portal_requests
  drop constraint if exists customer_portal_requests_subject_length_check;
alter table public.customer_portal_requests
  add constraint customer_portal_requests_subject_length_check
  check (
    pg_catalog.char_length(pg_catalog.btrim(subject)) between 1 and 200
  );

alter table public.customer_portal_requests
  drop constraint if exists customer_portal_requests_detail_length_check;
alter table public.customer_portal_requests
  add constraint customer_portal_requests_detail_length_check
  check (pg_catalog.char_length(customer_visible_detail) <= 5000);

-- Portal table management is server-mediated. Authenticated Business
-- Workspace policies would otherwise be permissively ORed with customer
-- policies and could make an owner/member appear as a portal customer.
drop policy if exists customer_profiles_business_manage
  on public.customer_profiles;
drop policy if exists customer_portal_invitations_business_manage
  on public.customer_portal_invitations;
drop policy if exists customer_portal_branding_business_manage
  on public.customer_portal_branding;
drop policy if exists customer_portal_appointments_business_manage
  on public.customer_portal_appointments;
drop policy if exists customer_portal_messages_business_manage
  on public.customer_portal_messages;
drop policy if exists customer_portal_documents_business_manage
  on public.customer_portal_documents;
drop policy if exists customer_portal_document_ack_business_manage
  on public.customer_portal_document_acknowledgements;
drop policy if exists customer_portal_requests_business_manage
  on public.customer_portal_requests;

drop policy if exists customer_profiles_customer_select
  on public.customer_profiles;
create policy customer_profiles_customer_select
on public.customer_profiles for select to authenticated
using (public.is_current_portal_customer(id, business_id));

drop policy if exists customer_profiles_customer_update
  on public.customer_profiles;
create policy customer_profiles_customer_update
on public.customer_profiles for update to authenticated
using (public.is_current_portal_customer(id, business_id))
with check (public.is_current_portal_customer(id, business_id));

drop policy if exists customer_portal_branding_customer_select
  on public.customer_portal_branding;
create policy customer_portal_branding_customer_select
on public.customer_portal_branding for select to authenticated
using (
  exists (
    select 1
    from public.customer_profiles cp
    where cp.business_id = customer_portal_branding.business_id
      and public.is_current_portal_customer(cp.id, cp.business_id)
  )
);

drop policy if exists customer_portal_document_ack_customer_select
  on public.customer_portal_document_acknowledgements;
create policy customer_portal_document_ack_customer_select
on public.customer_portal_document_acknowledgements for select to authenticated
using (
  public.is_current_portal_document(
    document_id,
    customer_profile_id,
    business_id
  )
);

drop policy if exists customer_portal_document_ack_customer_insert
  on public.customer_portal_document_acknowledgements;
create policy customer_portal_document_ack_customer_insert
on public.customer_portal_document_acknowledgements for insert to authenticated
with check (
  public.is_current_portal_document(
    document_id,
    customer_profile_id,
    business_id
  )
);

-- Reset all table-level and column-level browser/API grants. Table-level
-- REVOKE alone does not remove previously granted column privileges.
revoke all privileges on table public.customer_profiles
  from public, anon, authenticated;
revoke all privileges on table public.customer_portal_invitations
  from public, anon, authenticated;
revoke all privileges on table public.customer_portal_branding
  from public, anon, authenticated;
revoke all privileges on table public.customer_portal_appointments
  from public, anon, authenticated;
revoke all privileges on table public.customer_portal_messages
  from public, anon, authenticated;
revoke all privileges on table public.customer_portal_documents
  from public, anon, authenticated;
revoke all privileges on table public.customer_portal_document_acknowledgements
  from public, anon, authenticated;
revoke all privileges on table public.customer_portal_requests
  from public, anon, authenticated;

do $block$
declare
  privilege_record record;
begin
  for privilege_record in
    select
      cp.table_schema,
      cp.table_name,
      cp.privilege_type,
      cp.grantee,
      pg_catalog.string_agg(
        pg_catalog.quote_ident(cp.column_name),
        ', ' order by c.ordinal_position
      ) as column_list
    from information_schema.column_privileges cp
    join information_schema.columns c
      on c.table_schema = cp.table_schema
     and c.table_name = cp.table_name
     and c.column_name = cp.column_name
    where cp.table_schema = 'public'
      and cp.table_name = any (array[
        'customer_profiles',
        'customer_portal_invitations',
        'customer_portal_branding',
        'customer_portal_appointments',
        'customer_portal_messages',
        'customer_portal_documents',
        'customer_portal_document_acknowledgements',
        'customer_portal_requests'
      ])
      and cp.grantee = any (array['PUBLIC', 'anon', 'authenticated'])
    group by
      cp.table_schema,
      cp.table_name,
      cp.privilege_type,
      cp.grantee
  loop
    execute pg_catalog.format(
      'revoke %s (%s) on table %I.%I from %s',
      privilege_record.privilege_type,
      privilege_record.column_list,
      privilege_record.table_schema,
      privilege_record.table_name,
      case
        when privilege_record.grantee = 'PUBLIC' then 'PUBLIC'
        else pg_catalog.quote_ident(privilege_record.grantee)
      end
    );
  end loop;
end;
$block$;

grant select (
  id,
  business_id,
  full_name,
  email,
  phone,
  preferred_language,
  communication_preference,
  address,
  notification_preferences,
  updated_at
) on public.customer_profiles to authenticated;
grant update (
  full_name,
  email,
  phone,
  preferred_language,
  communication_preference,
  address,
  notification_preferences
) on public.customer_profiles to authenticated;

grant select (
  business_id,
  display_name,
  logo_url,
  primary_color,
  secondary_color,
  contact_email,
  contact_phone,
  address,
  business_hours,
  support_email,
  booking_url,
  industry,
  updated_at
) on public.customer_portal_branding to authenticated;

grant select (
  id,
  business_id,
  customer_profile_id,
  status,
  starts_at,
  ends_at,
  timezone,
  location,
  meeting_url,
  service_name,
  customer_visible_notes,
  reschedule_url,
  cancel_url,
  updated_at
) on public.customer_portal_appointments to authenticated;

grant select (
  id,
  business_id,
  customer_profile_id,
  sender_type,
  body,
  human_support_requested,
  created_at
) on public.customer_portal_messages to authenticated;
grant insert (
  business_id,
  customer_profile_id,
  sender_type,
  body,
  human_support_requested
) on public.customer_portal_messages to authenticated;

grant select (
  id,
  business_id,
  customer_profile_id,
  document_type,
  title,
  mime_type,
  file_size,
  shared_at
) on public.customer_portal_documents to authenticated;

grant select (
  document_id,
  customer_profile_id,
  business_id,
  acknowledged_at
) on public.customer_portal_document_acknowledgements to authenticated;
grant insert (
  document_id,
  customer_profile_id,
  business_id
) on public.customer_portal_document_acknowledgements to authenticated;

grant select (
  id,
  business_id,
  customer_profile_id,
  request_type,
  subject,
  status,
  customer_visible_detail,
  created_at,
  updated_at
) on public.customer_portal_requests to authenticated;
grant insert (
  business_id,
  customer_profile_id,
  request_type,
  subject,
  customer_visible_detail
) on public.customer_portal_requests to authenticated;

-- The trusted server hashes the high-entropy invitation token before this
-- call. Only service_role may invoke the transaction that consumes the hash,
-- verifies the authoritative Auth email, links the customer, and accepts the
-- invitation. The raw token is never stored or passed to the database.
create or replace function public.redeem_customer_portal_invitation(
  p_token_hash text,
  p_auth_user_id uuid
)
returns table (
  customer_profile_id uuid,
  business_id uuid
)
language plpgsql
volatile
security definer
set search_path = pg_catalog
as $function$
declare
  invitation_record public.customer_portal_invitations%rowtype;
  authoritative_email text;
  authoritative_email_confirmed_at timestamptz;
  authoritative_full_name text;
  existing_profile_id uuid;
  existing_profile_lead_id uuid;
  existing_profile_status text;
begin
  if p_auth_user_id is null
     or p_token_hash is null
     or p_token_hash !~ '^[0-9a-f]{64}$' then
    raise exception using
      errcode = 'P0001',
      message = 'Invitation unavailable.';
  end if;

  select
    pg_catalog.lower(pg_catalog.btrim(u.email)),
    u.email_confirmed_at,
    pg_catalog.left(
      pg_catalog.coalesce(
        pg_catalog.nullif(
          pg_catalog.btrim(u.raw_user_meta_data ->> 'full_name'),
          ''
        ),
        ''
      ),
      200
    )
  into
    authoritative_email,
    authoritative_email_confirmed_at,
    authoritative_full_name
  from auth.users u
  where u.id = p_auth_user_id;

  if authoritative_email is null
     or authoritative_email_confirmed_at is null
     or exists (
       select 1
       from public.business_members bm
       where bm.user_id = p_auth_user_id
     )
     or exists (
       select 1
       from public.businesses b
       where b.owner_user_id = p_auth_user_id
     ) then
    raise exception using
      errcode = 'P0001',
      message = 'Invitation unavailable.';
  end if;

  select invitation_row.*
  into invitation_record
  from public.customer_portal_invitations invitation_row
  where invitation_row.token_hash = p_token_hash
    and invitation_row.accepted_at is null
    and invitation_row.expires_at > pg_catalog.statement_timestamp()
  for update;

  if not found
     or pg_catalog.lower(pg_catalog.btrim(invitation_record.email))
        <> authoritative_email then
    raise exception using
      errcode = 'P0001',
      message = 'Invitation unavailable.';
  end if;

  select
    cp.id,
    cp.lead_id,
    cp.status
  into
    existing_profile_id,
    existing_profile_lead_id,
    existing_profile_status
  from public.customer_profiles cp
  where cp.auth_user_id = p_auth_user_id
    and cp.business_id = invitation_record.business_id
  for update;

  if found then
    if existing_profile_status = 'suspended'
       or existing_profile_lead_id is distinct from invitation_record.lead_id then
      raise exception using
        errcode = 'P0001',
        message = 'Invitation unavailable.';
    end if;

    update public.customer_profiles cp
    set
      email = authoritative_email,
      status = 'active'
    where cp.id = existing_profile_id
      and cp.business_id = invitation_record.business_id;
  else
    insert into public.customer_profiles (
      business_id,
      auth_user_id,
      lead_id,
      full_name,
      email,
      status
    ) values (
      invitation_record.business_id,
      p_auth_user_id,
      invitation_record.lead_id,
      authoritative_full_name,
      authoritative_email,
      'active'
    )
    returning id into existing_profile_id;
  end if;

  update public.customer_portal_invitations invitation_row
  set accepted_at = pg_catalog.statement_timestamp()
  where invitation_row.id = invitation_record.id
    and invitation_row.accepted_at is null;

  if not found then
    raise exception using
      errcode = 'P0001',
      message = 'Invitation unavailable.';
  end if;

  customer_profile_id := existing_profile_id;
  business_id := invitation_record.business_id;
  return next;
end;
$function$;

alter function public.redeem_customer_portal_invitation(text, uuid)
  owner to postgres;
revoke all on function public.redeem_customer_portal_invitation(text, uuid)
  from public, anon, authenticated, service_role;
grant execute on function public.redeem_customer_portal_invitation(text, uuid)
  to service_role;

notify pgrst, 'reload schema';

commit;
