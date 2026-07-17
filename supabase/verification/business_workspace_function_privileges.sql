-- 2. Effective function EXECUTE privileges for the five reviewed functions.
-- A missing function remains visible as four function_exists=false rows.
with inspected_functions(signature) as (
  values
    ('public.user_owns_business(uuid)'),
    ('public.workspace_business_role(uuid)'),
    ('public.activate_knowledge_file_version(uuid,uuid)'),
    ('public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)'),
    ('public.search_knowledge_chunks(uuid,text,integer)')
), resolved_functions as (
  select
    inspected_functions.signature,
    pg_catalog.to_regprocedure(inspected_functions.signature) as oid
  from inspected_functions
), inspected_roles(role_name, role_oid, is_public) as (
  values
    ('PUBLIC'::text, 0::oid, true),
    ('anon'::text, pg_catalog.to_regrole('anon')::oid, false),
    ('authenticated'::text, pg_catalog.to_regrole('authenticated')::oid, false),
    ('service_role'::text, pg_catalog.to_regrole('service_role')::oid, false)
)
select
  resolved_functions.signature,
  resolved_functions.oid is not null as function_exists,
  inspected_roles.role_name,
  case
    when resolved_functions.oid is null then null
    when inspected_roles.is_public and p.proacl is null then true
    when inspected_roles.is_public then exists (
      select 1
      from pg_catalog.aclexplode(p.proacl) as acl
      where acl.grantee = 0
        and acl.privilege_type = 'EXECUTE'
    )
    else pg_catalog.has_function_privilege(
      inspected_roles.role_oid,
      resolved_functions.oid,
      'EXECUTE'
    )
  end as has_execute,
  case
    when resolved_functions.oid is null then null
    when inspected_roles.is_public and p.proacl is null then false
    when inspected_roles.is_public then exists (
      select 1
      from pg_catalog.aclexplode(p.proacl) as acl
      where acl.grantee = 0
        and acl.privilege_type = 'EXECUTE'
        and acl.is_grantable
    )
    else pg_catalog.has_function_privilege(
      inspected_roles.role_oid,
      resolved_functions.oid,
      'EXECUTE WITH GRANT OPTION'
    )
  end as has_execute_grant_option
from resolved_functions
left join pg_catalog.pg_proc as p
  on p.oid = resolved_functions.oid
cross join inspected_roles
order by resolved_functions.signature, inspected_roles.role_name;
