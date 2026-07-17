-- CUSTOMER PORTAL PRODUCTION SECURITY HARDENING — READ-ONLY VERIFICATION
--
-- Run only after explicit approval and manual execution of:
--   supabase/migrations/20260713190000_customer_portal_production_security_hardening.sql
--
-- Every statement in this file is read-only. Review every result set and
-- record the raw output before changing the approval status to Verified.

-- 1. Required portal relations exist and RLS remains enabled.
with expected(table_name) as (
  values
    ('customer_profiles'),
    ('customer_portal_invitations'),
    ('customer_portal_branding'),
    ('customer_portal_appointments'),
    ('customer_portal_messages'),
    ('customer_portal_documents'),
    ('customer_portal_document_acknowledgements'),
    ('customer_portal_requests')
)
select
  expected.table_name,
  c.oid is not null as table_exists,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  pg_catalog.pg_get_userbyid(c.relowner) as owner
from expected
left join pg_catalog.pg_namespace n
  on n.nspname = 'public'
left join pg_catalog.pg_class c
  on c.relnamespace = n.oid
 and c.relname = expected.table_name
 and c.relkind in ('r', 'p')
order by expected.table_name;

-- 2. Deployed column inventory. Compare this output to the migration and
-- investigate any unexpected column before approval is advanced.
select
  c.table_name,
  c.ordinal_position,
  c.column_name,
  c.data_type,
  c.udt_schema,
  c.udt_name,
  c.is_nullable,
  c.column_default
from information_schema.columns c
where c.table_schema = 'public'
  and c.table_name = any (array[
    'customer_profiles',
    'customer_portal_invitations',
    'customer_portal_branding',
    'customer_portal_appointments',
    'customer_portal_messages',
    'customer_portal_documents',
    'customer_portal_document_acknowledgements',
    'customer_portal_requests'
  ])
order by c.table_name, c.ordinal_position;

-- 3. No browser/API role may retain a table-level privilege. Expected:
-- every has_*_table_privilege value is false. Column grants are checked next.
with portal_tables(table_name) as (
  values
    ('customer_profiles'),
    ('customer_portal_invitations'),
    ('customer_portal_branding'),
    ('customer_portal_appointments'),
    ('customer_portal_messages'),
    ('customer_portal_documents'),
    ('customer_portal_document_acknowledgements'),
    ('customer_portal_requests')
), roles(role_name) as (
  values ('anon'), ('authenticated')
)
select
  roles.role_name,
  portal_tables.table_name,
  pg_catalog.has_table_privilege(
    roles.role_name,
    pg_catalog.format('public.%I', portal_tables.table_name),
    'SELECT'
  ) as has_select_table_privilege,
  pg_catalog.has_table_privilege(
    roles.role_name,
    pg_catalog.format('public.%I', portal_tables.table_name),
    'INSERT'
  ) as has_insert_table_privilege,
  pg_catalog.has_table_privilege(
    roles.role_name,
    pg_catalog.format('public.%I', portal_tables.table_name),
    'UPDATE'
  ) as has_update_table_privilege,
  pg_catalog.has_table_privilege(
    roles.role_name,
    pg_catalog.format('public.%I', portal_tables.table_name),
    'DELETE'
  ) as has_delete_table_privilege,
  pg_catalog.has_table_privilege(
    roles.role_name,
    pg_catalog.format('public.%I', portal_tables.table_name),
    'TRUNCATE'
  ) as has_truncate_table_privilege,
  pg_catalog.has_table_privilege(
    roles.role_name,
    pg_catalog.format('public.%I', portal_tables.table_name),
    'REFERENCES'
  ) as has_references_table_privilege,
  pg_catalog.has_table_privilege(
    roles.role_name,
    pg_catalog.format('public.%I', portal_tables.table_name),
    'TRIGGER'
  ) as has_trigger_table_privilege
from portal_tables
cross join roles
order by roles.role_name, portal_tables.table_name;

-- 4. Exact authenticated column allowlist. Expected: privilege_matches is
-- true on every row. Table-level privileges would also appear here and cause
-- forbidden columns to fail the comparison.
with portal_columns as (
  select c.table_name, c.column_name
  from information_schema.columns c
  where c.table_schema = 'public'
    and c.table_name = any (array[
      'customer_profiles',
      'customer_portal_invitations',
      'customer_portal_branding',
      'customer_portal_appointments',
      'customer_portal_messages',
      'customer_portal_documents',
      'customer_portal_document_acknowledgements',
      'customer_portal_requests'
    ])
), expected as (
  select
    portal_columns.table_name,
    portal_columns.column_name,
    case portal_columns.table_name
      when 'customer_profiles' then portal_columns.column_name = any (array[
        'id', 'business_id', 'full_name', 'email', 'phone',
        'preferred_language', 'communication_preference', 'address',
        'notification_preferences', 'updated_at'
      ])
      when 'customer_portal_invitations' then false
      when 'customer_portal_branding' then portal_columns.column_name = any (array[
        'business_id', 'display_name', 'logo_url', 'primary_color',
        'secondary_color', 'contact_email', 'contact_phone', 'address',
        'business_hours', 'support_email', 'booking_url', 'industry',
        'updated_at'
      ])
      when 'customer_portal_appointments' then portal_columns.column_name = any (array[
        'id', 'business_id', 'customer_profile_id', 'status', 'starts_at',
        'ends_at', 'timezone', 'location', 'meeting_url', 'service_name',
        'customer_visible_notes', 'reschedule_url', 'cancel_url', 'updated_at'
      ])
      when 'customer_portal_messages' then portal_columns.column_name = any (array[
        'id', 'business_id', 'customer_profile_id', 'sender_type', 'body',
        'human_support_requested', 'created_at'
      ])
      when 'customer_portal_documents' then portal_columns.column_name = any (array[
        'id', 'business_id', 'customer_profile_id', 'document_type', 'title',
        'mime_type', 'file_size', 'shared_at'
      ])
      when 'customer_portal_document_acknowledgements' then portal_columns.column_name = any (array[
        'document_id', 'customer_profile_id', 'business_id', 'acknowledged_at'
      ])
      when 'customer_portal_requests' then portal_columns.column_name = any (array[
        'id', 'business_id', 'customer_profile_id', 'request_type', 'subject',
        'status', 'customer_visible_detail', 'created_at', 'updated_at'
      ])
      else false
    end as select_expected,
    case portal_columns.table_name
      when 'customer_portal_messages' then portal_columns.column_name = any (array[
        'business_id', 'customer_profile_id', 'sender_type', 'body',
        'human_support_requested'
      ])
      when 'customer_portal_document_acknowledgements' then portal_columns.column_name = any (array[
        'document_id', 'customer_profile_id', 'business_id'
      ])
      when 'customer_portal_requests' then portal_columns.column_name = any (array[
        'business_id', 'customer_profile_id', 'request_type', 'subject',
        'customer_visible_detail'
      ])
      else false
    end as insert_expected,
    portal_columns.table_name = 'customer_profiles'
      and portal_columns.column_name = any (array[
        'full_name', 'email', 'phone', 'preferred_language',
        'communication_preference', 'address', 'notification_preferences'
      ]) as update_expected
  from portal_columns
), actual as (
  select
    expected.*,
    pg_catalog.has_column_privilege(
      'authenticated',
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'SELECT'
    ) as select_actual,
    pg_catalog.has_column_privilege(
      'authenticated',
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'INSERT'
    ) as insert_actual,
    pg_catalog.has_column_privilege(
      'authenticated',
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'UPDATE'
    ) as update_actual,
    pg_catalog.has_column_privilege(
      'authenticated',
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'REFERENCES'
    ) as references_actual
  from expected
)
select
  actual.*,
  actual.select_actual = actual.select_expected
    and actual.insert_actual = actual.insert_expected
    and actual.update_actual = actual.update_expected
    and actual.references_actual = false as privilege_matches
from actual
order by actual.table_name, actual.column_name;

-- 5. Anonymous users must have no portal column privilege. Expected:
-- every has_any_* value is false.
with portal_tables(table_name) as (
  values
    ('customer_profiles'),
    ('customer_portal_invitations'),
    ('customer_portal_branding'),
    ('customer_portal_appointments'),
    ('customer_portal_messages'),
    ('customer_portal_documents'),
    ('customer_portal_document_acknowledgements'),
    ('customer_portal_requests')
)
select
  portal_tables.table_name,
  pg_catalog.has_any_column_privilege(
    'anon',
    pg_catalog.format('public.%I', portal_tables.table_name),
    'SELECT'
  ) as has_any_select,
  pg_catalog.has_any_column_privilege(
    'anon',
    pg_catalog.format('public.%I', portal_tables.table_name),
    'INSERT'
  ) as has_any_insert,
  pg_catalog.has_any_column_privilege(
    'anon',
    pg_catalog.format('public.%I', portal_tables.table_name),
    'UPDATE'
  ) as has_any_update,
  pg_catalog.has_any_column_privilege(
    'anon',
    pg_catalog.format('public.%I', portal_tables.table_name),
    'REFERENCES'
  ) as has_any_references
from portal_tables
order by portal_tables.table_name;

-- 6. Expanded direct ACLs, including PUBLIC. Expected: no PUBLIC or anon
-- grants; authenticated entries must correspond only to the allowlist above.
select
  tp.table_schema as schema_name,
  tp.table_name,
  tp.grantee,
  tp.privilege_type,
  tp.is_grantable = 'YES' as is_grantable
from information_schema.table_privileges tp
where tp.table_schema = 'public'
  and tp.table_name = any (array[
    'customer_profiles',
    'customer_portal_invitations',
    'customer_portal_branding',
    'customer_portal_appointments',
    'customer_portal_messages',
    'customer_portal_documents',
    'customer_portal_document_acknowledgements',
    'customer_portal_requests'
  ])
  and tp.grantee = any (array['PUBLIC', 'anon', 'authenticated'])
order by tp.table_name, tp.grantee, tp.privilege_type;

select
  cp.table_name,
  cp.column_name,
  cp.grantee,
  cp.privilege_type,
  cp.is_grantable
from information_schema.column_privileges cp
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
order by cp.table_name, cp.column_name, cp.grantee, cp.privilege_type;

-- 7. Role inheritance and default privileges. Review any row that could
-- restore broad access through membership or future public-schema objects.
select
  pg_catalog.pg_get_userbyid(m.member) as member_role,
  pg_catalog.pg_get_userbyid(m.roleid) as granted_role,
  m.admin_option
from pg_catalog.pg_auth_members m
where pg_catalog.pg_get_userbyid(m.member) = any (array[
  'anon', 'authenticated', 'service_role'
])
order by member_role, granted_role;

select
  pg_catalog.pg_get_userbyid(d.defaclrole) as owner,
  case
    when d.defaclnamespace = 0 then '(all schemas)'
    else n.nspname::text
  end as schema_name,
  d.defaclobjtype,
  case acl.grantee
    when 0 then 'PUBLIC'
    else pg_catalog.pg_get_userbyid(acl.grantee)
  end as grantee,
  acl.privilege_type,
  acl.is_grantable
from pg_catalog.pg_default_acl d
left join pg_catalog.pg_namespace n on n.oid = d.defaclnamespace
cross join lateral pg_catalog.aclexplode(d.defaclacl) acl
where acl.grantee = 0
   or pg_catalog.pg_get_userbyid(acl.grantee) = any (array[
     'anon', 'authenticated', 'service_role'
   ])
order by owner, schema_name, d.defaclobjtype, grantee, acl.privilege_type;

-- 8. Exact RLS policy inventory. Expected: customer policies only and zero
-- policy names ending in _business_manage.
select
  p.schemaname,
  p.tablename,
  p.policyname,
  p.permissive,
  p.roles,
  p.cmd,
  p.qual,
  p.with_check
from pg_catalog.pg_policies p
where p.schemaname = 'public'
  and p.tablename = any (array[
    'customer_profiles',
    'customer_portal_invitations',
    'customer_portal_branding',
    'customer_portal_appointments',
    'customer_portal_messages',
    'customer_portal_documents',
    'customer_portal_document_acknowledgements',
    'customer_portal_requests'
  ])
order by p.tablename, p.policyname;

select pg_catalog.count(*) as unexpected_business_manage_policy_count
from pg_catalog.pg_policies p
where p.schemaname = 'public'
  and p.tablename = any (array[
    'customer_profiles',
    'customer_portal_invitations',
    'customer_portal_branding',
    'customer_portal_appointments',
    'customer_portal_messages',
    'customer_portal_documents',
    'customer_portal_document_acknowledgements',
    'customer_portal_requests'
  ])
  and p.policyname like '%\_business\_manage' escape '\';

-- 9. Function security, volatility, owner, locked search_path, definitions,
-- and effective EXECUTE matrix. Expected:
--   is_current_portal_customer: stable/definer/authenticated only
--   is_current_portal_document: stable/definer/authenticated only
--   set_customer_profile_updated_at: volatile/invoker/no browser EXECUTE
--   redeem_customer_portal_invitation: volatile/definer/service_role only
with expected(signature) as (
  values
    ('public.is_current_portal_customer(uuid,uuid)'),
    ('public.is_current_portal_document(uuid,uuid,uuid)'),
    ('public.set_customer_profile_updated_at()'),
    ('public.redeem_customer_portal_invitation(text,uuid)')
), resolved as (
  select expected.signature, pg_catalog.to_regprocedure(expected.signature) as oid
  from expected
)
select
  resolved.signature,
  resolved.oid is not null as function_exists,
  pg_catalog.pg_get_userbyid(p.proowner) as owner,
  p.prosecdef as security_definer,
  p.provolatile,
  p.proconfig,
  pg_catalog.has_function_privilege('anon', resolved.oid, 'EXECUTE') as anon_execute,
  pg_catalog.has_function_privilege('authenticated', resolved.oid, 'EXECUTE') as authenticated_execute,
  pg_catalog.has_function_privilege('service_role', resolved.oid, 'EXECUTE') as service_role_execute,
  pg_catalog.pg_get_functiondef(resolved.oid) as function_definition
from resolved
left join pg_catalog.pg_proc p on p.oid = resolved.oid
order by resolved.signature;

-- Direct PUBLIC function grants must be absent.
with expected(signature) as (
  values
    ('public.is_current_portal_customer(uuid,uuid)'),
    ('public.is_current_portal_document(uuid,uuid,uuid)'),
    ('public.set_customer_profile_updated_at()'),
    ('public.redeem_customer_portal_invitation(text,uuid)')
), resolved as (
  select expected.signature, pg_catalog.to_regprocedure(expected.signature) as oid
  from expected
)
select
  resolved.oid::pg_catalog.regprocedure as function_signature,
  'PUBLIC'::text as grantee,
  'EXECUTE'::text as privilege_type,
  pg_catalog.has_function_privilege(
    'public',
    resolved.oid,
    'EXECUTE WITH GRANT OPTION'
  ) as is_grantable
from resolved
where resolved.oid is not null
  and pg_catalog.has_function_privilege(
    'public',
    resolved.oid,
    'EXECUTE'
  )
order by function_signature;

-- 10. Trusted updated_at trigger and owner lookup index.
select
  c.relname as table_name,
  t.tgname as trigger_name,
  t.tgenabled,
  pg_catalog.pg_get_triggerdef(t.oid, true) as trigger_definition
from pg_catalog.pg_trigger t
join pg_catalog.pg_class c on c.oid = t.tgrelid
join pg_catalog.pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname = 'customer_profiles'
  and t.tgname = 'customer_profiles_set_updated_at'
  and not t.tgisinternal;

select
  indexname,
  indexdef
from pg_catalog.pg_indexes
where schemaname = 'public'
  and tablename = 'businesses'
  and indexname = 'businesses_owner_user_id_idx';

-- 11. Required validation constraints and their definitions. Expected:
-- every named constraint exists and convalidated is true.
with expected(constraint_name) as (
  values
    ('customer_profiles_full_name_length_check'),
    ('customer_profiles_email_length_check'),
    ('customer_profiles_phone_length_check'),
    ('customer_profiles_language_format_check'),
    ('customer_profiles_communication_format_check'),
    ('customer_profiles_address_shape_check'),
    ('customer_profiles_notification_shape_check'),
    ('customer_portal_invitations_token_hash_check'),
    ('customer_portal_invitations_expiry_check'),
    ('customer_portal_requests_type_format_check'),
    ('customer_portal_requests_subject_length_check'),
    ('customer_portal_requests_detail_length_check')
)
select
  expected.constraint_name,
  con.oid is not null as constraint_exists,
  con.convalidated,
  pg_catalog.pg_get_constraintdef(con.oid, true) as constraint_definition
from expected
left join pg_catalog.pg_constraint con
  on con.conname = expected.constraint_name
 and con.connamespace = pg_catalog.to_regnamespace('public')
order by expected.constraint_name;

-- 12. Global identity separation. Expected: zero mixed principals.
select pg_catalog.count(*) as mixed_workspace_portal_principal_count
from public.customer_profiles cp
where exists (
    select 1
    from public.business_members bm
    where bm.user_id = cp.auth_user_id
  )
   or exists (
    select 1
    from public.businesses b
    where b.owner_user_id = cp.auth_user_id
  );

-- 13. Cross-business/profile/document integrity. Expected: every count zero.
select
  (
    select pg_catalog.count(*)
    from public.customer_portal_appointments a
    left join public.customer_profiles cp
      on cp.id = a.customer_profile_id
     and cp.business_id = a.business_id
    where cp.id is null
  ) as appointment_profile_orphans,
  (
    select pg_catalog.count(*)
    from public.customer_portal_messages m
    left join public.customer_profiles cp
      on cp.id = m.customer_profile_id
     and cp.business_id = m.business_id
    where cp.id is null
  ) as message_profile_orphans,
  (
    select pg_catalog.count(*)
    from public.customer_portal_documents d
    left join public.customer_profiles cp
      on cp.id = d.customer_profile_id
     and cp.business_id = d.business_id
    where cp.id is null
  ) as document_profile_orphans,
  (
    select pg_catalog.count(*)
    from public.customer_portal_document_acknowledgements a
    left join public.customer_portal_documents d
      on d.id = a.document_id
     and d.customer_profile_id = a.customer_profile_id
     and d.business_id = a.business_id
    where d.id is null
  ) as acknowledgement_document_orphans,
  (
    select pg_catalog.count(*)
    from public.customer_portal_requests r
    left join public.customer_profiles cp
      on cp.id = r.customer_profile_id
     and cp.business_id = r.business_id
    where cp.id is null
  ) as request_profile_orphans;

-- 14. Revoked-document and invitation anomalies. Expected: every count zero.
select
  (
    select pg_catalog.count(*)
    from public.customer_portal_document_acknowledgements a
    join public.customer_portal_documents d
      on d.id = a.document_id
     and d.customer_profile_id = a.customer_profile_id
     and d.business_id = a.business_id
    where d.revoked_at is not null
  ) as acknowledgements_of_revoked_documents,
  (
    select pg_catalog.count(*)
    from public.customer_portal_invitations i
    where i.token_hash !~ '^[0-9a-f]{64}$'
  ) as invalid_invitation_hashes,
  (
    select pg_catalog.count(*)
    from public.customer_portal_invitations i
    where i.expires_at <= i.created_at
  ) as invalid_invitation_expiry_windows,
  (
    select pg_catalog.count(*)
    from public.customer_portal_invitations i
    where i.accepted_at is not null
      and not exists (
        select 1
        from public.customer_profiles cp
        where cp.business_id = i.business_id
          and pg_catalog.lower(pg_catalog.btrim(cp.email)) =
              pg_catalog.lower(pg_catalog.btrim(i.email))
      )
  ) as accepted_invitations_without_matching_profile;

-- 15. Profile/request data-shape conflict audit. Expected: every count zero.
select
  (
    select pg_catalog.count(*)
    from public.customer_profiles cp
    where pg_catalog.char_length(cp.full_name) > 200
       or pg_catalog.char_length(cp.email) > 320
       or pg_catalog.char_length(cp.phone) > 64
       or pg_catalog.char_length(cp.preferred_language) not between 2 and 35
       or cp.preferred_language !~ '^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$'
       or cp.communication_preference !~ '^[a-z][a-z0-9_-]{0,63}$'
       or pg_catalog.jsonb_typeof(cp.address) <> 'object'
       or pg_catalog.octet_length(cp.address::text) > 20000
       or pg_catalog.jsonb_typeof(cp.notification_preferences) <> 'object'
       or pg_catalog.octet_length(cp.notification_preferences::text) > 20000
  ) as invalid_profile_shapes,
  (
    select pg_catalog.count(*)
    from public.customer_portal_requests r
    where r.request_type !~ '^[a-z][a-z0-9_-]{0,63}$'
       or pg_catalog.char_length(pg_catalog.btrim(r.subject)) not between 1 and 200
       or pg_catalog.char_length(r.customer_visible_detail) > 5000
  ) as invalid_request_shapes;

-- 16. Storage remains a separate operational control. Review all candidate
-- buckets manually against CUSTOMER_PORTAL_DOCUMENT_BUCKETS. Every portal
-- document bucket must be private; this query does not validate app config.
select
  b.id,
  b.name,
  b.public,
  b.file_size_limit,
  b.allowed_mime_types
from storage.buckets b
order by b.id;
