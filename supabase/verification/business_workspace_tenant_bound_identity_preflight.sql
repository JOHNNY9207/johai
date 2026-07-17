-- PLATFORM HARDENING P0-1: MISSING LIVE-EVIDENCE PREFLIGHT
--
-- Run manually and retain every result set for human review before approving:
--   supabase/migrations/20260715120000_business_workspace_tenant_bound_identity.sql
--
-- This file is evidence only. Every executable statement begins with SELECT
-- or WITH and performs no database mutation.

-- 1. Complete constraints on the six P0-1 relations.
with inspected_tables(table_name) as (
  values
    ('business_members'),
    ('businesses'),
    ('knowledge_chunks'),
    ('knowledge_files'),
    ('knowledge_items'),
    ('leads')
)
select
  n.nspname as schema_name,
  c.relname as table_name,
  con.conname as constraint_name,
  case con.contype
    when 'c' then 'CHECK'
    when 'f' then 'FOREIGN KEY'
    when 'n' then 'NOT NULL'
    when 'p' then 'PRIMARY KEY'
    when 't' then 'CONSTRAINT TRIGGER'
    when 'u' then 'UNIQUE'
    when 'x' then 'EXCLUSION'
    else con.contype::text
  end as constraint_type,
  con.convalidated as validated,
  pg_catalog.pg_get_constraintdef(con.oid, false) as full_definition
from inspected_tables as target
join pg_catalog.pg_namespace as n
  on n.nspname = 'public'
join pg_catalog.pg_class as c
  on c.relnamespace = n.oid
 and c.relname = target.table_name
 and c.relkind in ('r', 'p')
join pg_catalog.pg_constraint as con
  on con.conrelid = c.oid
order by c.relname, con.conname;

-- 2. Complete effective table privileges. has_table_privilege evaluates role
-- inheritance and PUBLIC grants for real roles. PostgreSQL's PUBLIC pseudo-role
-- has no role OID, so its effective rights are read from the relation ACL after
-- applying the built-in table default with acldefault().
with inspected_tables(table_name) as (
  values
    ('business_members'),
    ('businesses'),
    ('knowledge_chunks'),
    ('knowledge_files'),
    ('knowledge_items'),
    ('leads')
), inspected_roles(role_name, role_oid, is_public) as (
  values
    ('PUBLIC'::text, 0::oid, true),
    ('anon'::text, pg_catalog.to_regrole('anon')::oid, false),
    ('authenticated'::text, pg_catalog.to_regrole('authenticated')::oid, false),
    ('service_role'::text, pg_catalog.to_regrole('service_role')::oid, false)
), inspected_privileges(privilege_name) as (
  values
    ('SELECT'),
    ('INSERT'),
    ('UPDATE'),
    ('DELETE'),
    ('TRUNCATE'),
    ('REFERENCES'),
    ('TRIGGER')
), relations as (
  select
    target.table_name,
    c.oid,
    c.relowner,
    c.relacl
  from inspected_tables as target
  left join pg_catalog.pg_namespace as n
    on n.nspname = 'public'
  left join pg_catalog.pg_class as c
    on c.relnamespace = n.oid
   and c.relname = target.table_name
   and c.relkind in ('r', 'p')
)
select
  relations.table_name,
  inspected_roles.role_name,
  inspected_privileges.privilege_name,
  relations.oid is not null as table_exists,
  case
    when relations.oid is null then null
    when inspected_roles.is_public then exists (
      select 1
      from pg_catalog.aclexplode(
        case
          when relations.relacl is null then
            pg_catalog.acldefault('r'::"char", relations.relowner)
          else relations.relacl
        end
      ) as acl
      where acl.grantee = 0
        and acl.privilege_type = inspected_privileges.privilege_name
    )
    else pg_catalog.has_table_privilege(
      inspected_roles.role_oid,
      relations.oid,
      inspected_privileges.privilege_name
    )
  end as has_privilege,
  case
    when relations.oid is null then null
    when inspected_roles.is_public then exists (
      select 1
      from pg_catalog.aclexplode(
        case
          when relations.relacl is null then
            pg_catalog.acldefault('r'::"char", relations.relowner)
          else relations.relacl
        end
      ) as acl
      where acl.grantee = 0
        and acl.privilege_type = inspected_privileges.privilege_name
        and acl.is_grantable
    )
    else pg_catalog.has_table_privilege(
      inspected_roles.role_oid,
      relations.oid,
      inspected_privileges.privilege_name || ' WITH GRANT OPTION'
    )
  end as has_grant_option
from relations
cross join inspected_roles
cross join inspected_privileges
order by
  relations.table_name,
  inspected_roles.role_name,
  inspected_privileges.privilege_name;

-- Complete underlying table ACL inventory, including owners and any custom
-- grantee that could cause the proposed migration's safety preflight to abort.
with inspected_tables(table_name) as (
  values
    ('business_members'),
    ('businesses'),
    ('knowledge_chunks'),
    ('knowledge_files'),
    ('knowledge_items'),
    ('leads')
)
select
  c.relname as table_name,
  case acl.grantee
    when 0 then 'PUBLIC'
    else pg_catalog.pg_get_userbyid(acl.grantee)
  end as grantee,
  acl.privilege_type,
  acl.is_grantable,
  pg_catalog.pg_get_userbyid(acl.grantor) as grantor
from inspected_tables as target
join pg_catalog.pg_namespace as n
  on n.nspname = 'public'
join pg_catalog.pg_class as c
  on c.relnamespace = n.oid
 and c.relname = target.table_name
 and c.relkind in ('r', 'p')
cross join lateral pg_catalog.aclexplode(
  case
    when c.relacl is null then
      pg_catalog.acldefault('r'::"char", c.relowner)
    else c.relacl
  end
) as acl
order by c.relname, grantee, acl.privilege_type;

-- 3. Complete effective column privileges for anon and authenticated. These
-- checks intentionally include rights inherited from table-level grants.
with inspected_tables(table_name) as (
  values
    ('business_members'),
    ('businesses'),
    ('knowledge_chunks'),
    ('knowledge_files'),
    ('knowledge_items'),
    ('leads')
), inspected_roles(role_name, role_oid) as (
  values
    ('anon'::text, pg_catalog.to_regrole('anon')::oid),
    ('authenticated'::text, pg_catalog.to_regrole('authenticated')::oid)
), inspected_privileges(privilege_name) as (
  values
    ('SELECT'),
    ('INSERT'),
    ('UPDATE'),
    ('REFERENCES')
)
select
  c.relname as table_name,
  a.attname as column_name,
  inspected_roles.role_name,
  inspected_privileges.privilege_name,
  pg_catalog.has_column_privilege(
    inspected_roles.role_oid,
    c.oid,
    a.attnum,
    inspected_privileges.privilege_name
  ) as has_privilege,
  pg_catalog.has_column_privilege(
    inspected_roles.role_oid,
    c.oid,
    a.attnum,
    inspected_privileges.privilege_name || ' WITH GRANT OPTION'
  ) as has_grant_option
from inspected_tables as target
join pg_catalog.pg_namespace as n
  on n.nspname = 'public'
join pg_catalog.pg_class as c
  on c.relnamespace = n.oid
 and c.relname = target.table_name
 and c.relkind in ('r', 'p')
join pg_catalog.pg_attribute as a
  on a.attrelid = c.oid
 and a.attnum > 0
 and not a.attisdropped
cross join inspected_roles
cross join inspected_privileges
order by
  c.relname,
  a.attnum,
  inspected_roles.role_name,
  inspected_privileges.privilege_name;

-- Direct column ACLs are returned separately for every grantee so reviewers
-- can distinguish a direct grant from a right inherited from a table grant.
with inspected_tables(table_name) as (
  values
    ('business_members'),
    ('businesses'),
    ('knowledge_chunks'),
    ('knowledge_files'),
    ('knowledge_items'),
    ('leads')
)
select
  c.relname as table_name,
  a.attname as column_name,
  case acl.grantee
    when 0 then 'PUBLIC'
    else pg_catalog.pg_get_userbyid(acl.grantee)
  end as grantee,
  acl.privilege_type,
  acl.is_grantable,
  pg_catalog.pg_get_userbyid(acl.grantor) as grantor
from inspected_tables as target
join pg_catalog.pg_namespace as n
  on n.nspname = 'public'
join pg_catalog.pg_class as c
  on c.relnamespace = n.oid
 and c.relname = target.table_name
 and c.relkind in ('r', 'p')
join pg_catalog.pg_attribute as a
  on a.attrelid = c.oid
 and a.attnum > 0
 and not a.attisdropped
cross join lateral pg_catalog.aclexplode(a.attacl) as acl
order by c.relname, a.attnum, grantee, acl.privilege_type;

-- 4. Complete effective EXECUTE privileges for both identity helpers and every
-- public Knowledge function discovered by name, body reference, or catalog
-- dependency on one of the three inspected Knowledge relations.
with required_functions(signature) as (
  values
    ('public.user_owns_business(uuid)'),
    ('public.workspace_business_role(uuid)'),
    ('public.activate_knowledge_file_version(uuid,uuid)'),
    ('public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)'),
    ('public.search_knowledge_chunks(uuid,text,integer)')
), resolved_required as (
  select
    required_functions.signature,
    pg_catalog.to_regprocedure(required_functions.signature) as oid
  from required_functions
), discovered_knowledge_functions as (
  select
    pg_catalog.format(
      '%I.%I(%s)',
      n.nspname,
      p.proname,
      pg_catalog.pg_get_function_identity_arguments(p.oid)
    ) as signature,
    p.oid
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n
    on n.oid = p.pronamespace
  where n.nspname = 'public'
    and p.prokind in ('f', 'p')
    and (
      pg_catalog.strpos(
        pg_catalog.lower(p.proname),
        'knowledge'
      ) > 0
      or pg_catalog.strpos(
        pg_catalog.lower(p.prosrc),
        'knowledge_items'
      ) > 0
      or pg_catalog.strpos(
        pg_catalog.lower(p.prosrc),
        'knowledge_files'
      ) > 0
      or pg_catalog.strpos(
        pg_catalog.lower(p.prosrc),
        'knowledge_chunks'
      ) > 0
      or exists (
        select 1
        from pg_catalog.pg_depend as d
        where d.classid = 'pg_catalog.pg_proc'::pg_catalog.regclass
          and d.objid = p.oid
          and d.refclassid = 'pg_catalog.pg_class'::pg_catalog.regclass
          and d.refobjid in (
            pg_catalog.to_regclass('public.knowledge_items'),
            pg_catalog.to_regclass('public.knowledge_files'),
            pg_catalog.to_regclass('public.knowledge_chunks')
          )
      )
    )
), function_inventory as (
  select resolved_required.signature, resolved_required.oid
  from resolved_required
  union all
  select
    discovered.signature,
    discovered.oid
  from discovered_knowledge_functions as discovered
  where not exists (
    select 1
    from resolved_required
    where resolved_required.oid = discovered.oid
  )
), inspected_roles(role_name, role_oid, is_public) as (
  values
    ('PUBLIC'::text, 0::oid, true),
    ('anon'::text, pg_catalog.to_regrole('anon')::oid, false),
    ('authenticated'::text, pg_catalog.to_regrole('authenticated')::oid, false),
    ('service_role'::text, pg_catalog.to_regrole('service_role')::oid, false)
)
select
  function_inventory.signature,
  function_inventory.oid is not null as function_exists,
  pg_catalog.pg_get_userbyid(p.proowner) as function_owner,
  p.prosecdef as security_definer,
  p.provolatile as volatility,
  p.proconfig,
  inspected_roles.role_name,
  case
    when function_inventory.oid is null then null
    when inspected_roles.is_public and p.proacl is null then true
    when inspected_roles.is_public then exists (
      select 1
      from pg_catalog.aclexplode(p.proacl) as acl
      where acl.grantee = 0
        and acl.privilege_type = 'EXECUTE'
    )
    else pg_catalog.has_function_privilege(
      inspected_roles.role_oid,
      function_inventory.oid,
      'EXECUTE'
    )
  end as has_execute,
  case
    when function_inventory.oid is null then null
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
      function_inventory.oid,
      'EXECUTE WITH GRANT OPTION'
    )
  end as has_execute_grant_option
from function_inventory
left join pg_catalog.pg_proc as p
  on p.oid = function_inventory.oid
cross join inspected_roles
order by function_inventory.signature, inspected_roles.role_name;

-- 5. PostgreSQL's built-in default ACL baseline. This exposes implicit future
-- access such as PUBLIC EXECUTE on newly created functions even when no
-- pg_default_acl row exists.
with owners(owner_oid) as (
  select pg_catalog.to_regrole('postgres')::oid
  union
  select d.defaclrole
  from pg_catalog.pg_default_acl as d
), object_types(object_type_code, object_type) as (
  values
    ('r'::"char", 'TABLE'),
    ('S'::"char", 'SEQUENCE'),
    ('f'::"char", 'FUNCTION'),
    ('T'::"char", 'TYPE'),
    ('n'::"char", 'SCHEMA')
)
select
  pg_catalog.pg_get_userbyid(owners.owner_oid) as object_creator,
  '(built-in baseline)'::text as schema_name,
  object_types.object_type,
  case acl.grantee
    when 0 then 'PUBLIC'
    else pg_catalog.pg_get_userbyid(acl.grantee)
  end as grantee,
  acl.privilege_type,
  acl.is_grantable,
  pg_catalog.pg_get_userbyid(acl.grantor) as grantor
from owners
cross join object_types
cross join lateral pg_catalog.aclexplode(
  pg_catalog.acldefault(
    object_types.object_type_code,
    owners.owner_oid
  )
) as acl
order by object_creator, object_types.object_type, grantee, acl.privilege_type;

-- Every explicit ALTER DEFAULT PRIVILEGES state. Empty output means no
-- explicit overrides exist; it does not remove the built-in baseline above.
select
  pg_catalog.pg_get_userbyid(d.defaclrole) as object_creator,
  case
    when d.defaclnamespace = 0 then '(all schemas)'
    else n.nspname::text
  end as schema_name,
  case d.defaclobjtype
    when 'r' then 'TABLE'
    when 'S' then 'SEQUENCE'
    when 'f' then 'FUNCTION'
    when 'T' then 'TYPE'
    when 'n' then 'SCHEMA'
    else d.defaclobjtype::text
  end as object_type,
  case acl.grantee
    when 0 then 'PUBLIC'
    else pg_catalog.pg_get_userbyid(acl.grantee)
  end as grantee,
  acl.privilege_type,
  acl.is_grantable,
  pg_catalog.pg_get_userbyid(acl.grantor) as grantor,
  acl.grantee = 0
    or pg_catalog.pg_get_userbyid(acl.grantee) in (
      'anon', 'authenticated', 'service_role'
    ) as grants_to_inspected_api_role
from pg_catalog.pg_default_acl as d
left join pg_catalog.pg_namespace as n
  on n.oid = d.defaclnamespace
cross join lateral pg_catalog.aclexplode(d.defaclacl) as acl
order by
  object_creator,
  schema_name,
  object_type,
  grantee,
  acl.privilege_type;

-- 6. Exact ownerless business identification. No owner email or other secret
-- field is selected.
select
  b.id as business_id,
  coalesce(
    nullif(b.name, ''::text),
    nullif(b.slug, ''::text),
    '(unnamed business)'::text
  ) as safe_business_display_name_or_slug,
  b.owner_user_id,
  b.created_at,
  count(bm.id) as business_members_count
from public.businesses as b
left join public.business_members as bm
  on bm.business_id = b.id
where b.owner_user_id is null
group by b.id, b.name, b.slug, b.owner_user_id, b.created_at
order by b.id;

-- 7. Membership state for every ownerless business. This query assigns no
-- owner and returns no Auth profile fields or credentials.
select
  bm.user_id,
  bm.role as current_role,
  bm.created_at
from public.business_members as bm
join public.businesses as b
  on b.id = bm.business_id
where b.owner_user_id is null
order by b.id, bm.created_at, bm.user_id;

-- 8. Catalog-recorded policy and function dependencies on the legacy helper,
-- membership relation, or canonical owner column. This scans all schemas.
with dependency_targets(
  target_name,
  refclassid,
  refobjid,
  refobjsubid,
  match_any_subobject
) as (
  values
    (
      'public.user_owns_business(uuid)'::text,
      'pg_catalog.pg_proc'::pg_catalog.regclass,
      pg_catalog.to_regprocedure(
        'public.user_owns_business(uuid)'
      )::oid,
      0,
      false
    ),
    (
      'public.business_members'::text,
      'pg_catalog.pg_class'::pg_catalog.regclass,
      pg_catalog.to_regclass('public.business_members')::oid,
      0,
      true
    ),
    (
      'public.businesses.owner_user_id'::text,
      'pg_catalog.pg_class'::pg_catalog.regclass,
      pg_catalog.to_regclass('public.businesses')::oid,
      (
        select a.attnum::integer
        from pg_catalog.pg_attribute as a
        where a.attrelid = pg_catalog.to_regclass('public.businesses')
          and a.attname = 'owner_user_id'
          and not a.attisdropped
      ),
      false
    )
), matching_dependencies as (
  select
    targets.target_name,
    d.classid,
    d.objid,
    d.objsubid,
    d.deptype
  from dependency_targets as targets
  join pg_catalog.pg_depend as d
    on d.refclassid = targets.refclassid
   and d.refobjid = targets.refobjid
   and (
     targets.match_any_subobject
     or d.refobjsubid = targets.refobjsubid
   )
  where d.classid in (
    'pg_catalog.pg_policy'::pg_catalog.regclass,
    'pg_catalog.pg_proc'::pg_catalog.regclass
  )
)
select
  matching_dependencies.target_name as referenced_object,
  case matching_dependencies.classid
    when 'pg_catalog.pg_policy'::pg_catalog.regclass then 'POLICY'
    when 'pg_catalog.pg_proc'::pg_catalog.regclass then 'FUNCTION'
  end as dependent_object_type,
  case matching_dependencies.classid
    when 'pg_catalog.pg_policy'::pg_catalog.regclass then (
      select pg_catalog.format(
        '%I.%I policy %I',
        n.nspname,
        c.relname,
        pol.polname
      )
      from pg_catalog.pg_policy as pol
      join pg_catalog.pg_class as c
        on c.oid = pol.polrelid
      join pg_catalog.pg_namespace as n
        on n.oid = c.relnamespace
      where pol.oid = matching_dependencies.objid
    )
    when 'pg_catalog.pg_proc'::pg_catalog.regclass then
      matching_dependencies.objid::pg_catalog.regprocedure::text
  end as dependent_object,
  matching_dependencies.deptype as dependency_type
from matching_dependencies
order by referenced_object, dependent_object_type, dependent_object;

-- Textual fallback for SQL/PL function bodies and policy expressions whose
-- body-level references may not be represented as pg_depend rows.
with policy_references as (
  select
    'POLICY'::text as dependent_object_type,
    pg_catalog.format(
      '%I.%I policy %I',
      n.nspname,
      c.relname,
      pol.polname
    ) as dependent_object,
    pg_catalog.concat_ws(
      E'\n',
      pg_catalog.pg_get_expr(pol.polqual, pol.polrelid, true),
      pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid, true)
    ) as body_text
  from pg_catalog.pg_policy as pol
  join pg_catalog.pg_class as c
    on c.oid = pol.polrelid
  join pg_catalog.pg_namespace as n
    on n.oid = c.relnamespace
), function_references as (
  select
    'FUNCTION'::text as dependent_object_type,
    pg_catalog.format(
      '%I.%I(%s)',
      n.nspname,
      p.proname,
      pg_catalog.pg_get_function_identity_arguments(p.oid)
    ) as dependent_object,
    p.prosrc as body_text
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n
    on n.oid = p.pronamespace
  where n.nspname not in ('pg_catalog', 'information_schema')
    and p.prokind in ('f', 'p')
), reference_inventory as (
  select * from policy_references
  union all
  select * from function_references
)
select
  reference_inventory.dependent_object_type,
  reference_inventory.dependent_object,
  pg_catalog.strpos(
    pg_catalog.lower(reference_inventory.body_text),
    'user_owns_business'
  ) > 0 as references_user_owns_business,
  pg_catalog.strpos(
    pg_catalog.lower(reference_inventory.body_text),
    'business_members'
  ) > 0 as references_business_members,
  pg_catalog.strpos(
    pg_catalog.lower(reference_inventory.body_text),
    'owner_user_id'
  ) > 0 as references_owner_user_id,
  pg_catalog.md5(reference_inventory.body_text) as dependent_body_fingerprint
from reference_inventory
where pg_catalog.strpos(
    pg_catalog.lower(reference_inventory.body_text),
    'user_owns_business'
  ) > 0
   or pg_catalog.strpos(
    pg_catalog.lower(reference_inventory.body_text),
    'business_members'
  ) > 0
   or pg_catalog.strpos(
    pg_catalog.lower(reference_inventory.body_text),
    'owner_user_id'
  ) > 0
order by
  reference_inventory.dependent_object_type,
  reference_inventory.dependent_object;

-- 9. Raw role distribution, normalization variants, and unsupported roles.
select
  bm.role as current_role,
  pg_catalog.lower(pg_catalog.btrim(bm.role)) as normalized_role,
  count(*) as membership_count,
  bm.role in ('owner'::text, 'member'::text) as supported_exact_role
from public.business_members as bm
group by bm.role
order by bm.role;

-- Duplicate membership rows can carry duplicate or conflicting role labels.
select
  bm.business_id,
  bm.user_id,
  count(*) as membership_row_count,
  count(distinct bm.role) as distinct_role_count,
  pg_catalog.array_agg(
    bm.role
    order by bm.created_at, bm.id
  ) as current_roles
from public.business_members as bm
group by bm.business_id, bm.user_id
having count(*) > 1
order by bm.business_id, bm.user_id;

-- 10. Exact orphan membership rows. Only UUIDs and membership metadata are
-- returned; no Auth emails, credentials, or identity metadata are selected.
select
  bm.id as membership_id,
  bm.business_id,
  bm.user_id,
  bm.role as current_role,
  bm.created_at,
  b.id is null as missing_business,
  u.id is null as missing_auth_user
from public.business_members as bm
left join public.businesses as b
  on b.id = bm.business_id
left join auth.users as u
  on u.id = bm.user_id
where b.id is null
   or u.id is null
order by bm.business_id, bm.user_id, bm.id;

-- 11. Exact RLS enable/FORCE state and table owner for all six relations.
with inspected_tables(table_name) as (
  values
    ('business_members'),
    ('businesses'),
    ('knowledge_chunks'),
    ('knowledge_files'),
    ('knowledge_items'),
    ('leads')
)
select
  target.table_name,
  c.oid is not null as table_exists,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  pg_catalog.pg_get_userbyid(c.relowner) as table_owner
from inspected_tables as target
left join pg_catalog.pg_namespace as n
  on n.nspname = 'public'
left join pg_catalog.pg_class as c
  on c.relnamespace = n.oid
 and c.relname = target.table_name
 and c.relkind in ('r', 'p')
order by target.table_name;
