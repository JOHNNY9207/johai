-- Read-only Customer Portal V1 foundation verification.
select table_name, row_security_active
from (
  select c.relname as table_name, c.relrowsecurity as row_security_active
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname in (
      'customer_profiles',
      'customer_portal_invitations',
      'customer_portal_branding',
      'customer_portal_appointments',
      'customer_portal_messages',
      'customer_portal_documents',
      'customer_portal_document_acknowledgements',
      'customer_portal_requests'
    )
) portal_tables
order by table_name;

select tablename, policyname, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
  and (tablename like 'customer_portal%' or tablename = 'customer_profiles')
order by tablename, policyname;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and (
    indexname like 'customer_portal%'
    or indexname = 'customer_profiles_business_idx'
  )
order by indexname;

select conrelid::regclass as table_name, conname, contype, convalidated
from pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid in (
    'public.customer_profiles'::regclass,
    'public.customer_portal_invitations'::regclass,
    'public.customer_portal_branding'::regclass,
    'public.customer_portal_appointments'::regclass,
    'public.customer_portal_messages'::regclass,
    'public.customer_portal_documents'::regclass,
    'public.customer_portal_document_acknowledgements'::regclass,
    'public.customer_portal_requests'::regclass
  )
order by conrelid::regclass::text, conname;

select p.oid::regprocedure as function_signature,
  p.prosecdef as security_definer,
  p.proconfig as function_configuration
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.oid = to_regprocedure('public.is_current_portal_customer(uuid,uuid)');

select
  has_function_privilege('anon', 'public.is_current_portal_customer(uuid,uuid)', 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', 'public.is_current_portal_customer(uuid,uuid)', 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('service_role', 'public.is_current_portal_customer(uuid,uuid)', 'EXECUTE') as service_role_can_execute;

select cp.id, cp.business_id, cp.auth_user_id
from public.customer_profiles cp
left join auth.users au on au.id = cp.auth_user_id
left join public.businesses b on b.id = cp.business_id
where au.id is null or b.id is null;

select cp.id, cp.business_id, cp.lead_id
from public.customer_profiles cp
join public.leads l on l.id = cp.lead_id
where cp.lead_id is not null and l.business_id <> cp.business_id;

select 'appointments' as relation, a.id
from public.customer_portal_appointments a
left join public.customer_profiles cp
  on cp.id = a.customer_profile_id and cp.business_id = a.business_id
where cp.id is null
union all
select 'messages', m.id
from public.customer_portal_messages m
left join public.customer_profiles cp
  on cp.id = m.customer_profile_id and cp.business_id = m.business_id
where cp.id is null
union all
select 'documents', d.id
from public.customer_portal_documents d
left join public.customer_profiles cp
  on cp.id = d.customer_profile_id and cp.business_id = d.business_id
where cp.id is null
union all
select 'requests', r.id
from public.customer_portal_requests r
left join public.customer_profiles cp
  on cp.id = r.customer_profile_id and cp.business_id = r.business_id
where cp.id is null;
