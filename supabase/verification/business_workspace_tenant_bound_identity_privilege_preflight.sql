-- PLATFORM HARDENING P0-1: PRIVILEGE AND DEPENDENCY PREFLIGHT
--
-- Evidence only. Run manually and retain all four result sets before deciding
-- whether to approve the P0-1 migration. Every executable statement begins
-- with WITH and ends in SELECT.

-- 1. Effective table privileges currently held by the four inspected roles.
-- PostgreSQL's PUBLIC pseudo-role has no role OID, so its rights are resolved
-- from the effective relation ACL. Named-role checks include inherited and
-- PUBLIC privileges through has_table_privilege(). Only true rights are shown.
with inspected_tables(table_name) as (
  values
    ('businesses'),
    ('business_members'),
    ('leads'),
    ('knowledge_items'),
    ('knowledge_files'),
    ('knowledge_chunks')
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
), privilege_matrix as (
  select
    relations.table_name,
    inspected_roles.role_name,
    inspected_privileges.privilege_name,
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
)
select
  privilege_matrix.table_name,
  privilege_matrix.role_name,
  privilege_matrix.privilege_name,
  privilege_matrix.has_privilege,
  privilege_matrix.has_grant_option
from privilege_matrix
where privilege_matrix.has_privilege is true
   or privilege_matrix.has_grant_option is true
order by
  privilege_matrix.table_name,
  privilege_matrix.role_name,
  privilege_matrix.privilege_name;

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

-- 3. Built-in baselines and explicit ALTER DEFAULT PRIVILEGES entries that
-- grant access to one of the four inspected grantees. Sources remain separate
-- so an explicit override is not confused with PostgreSQL's baseline.
with inspected_grantees(role_name, role_oid) as (
  values
    ('PUBLIC'::text, 0::oid),
    ('anon'::text, pg_catalog.to_regrole('anon')::oid),
    ('authenticated'::text, pg_catalog.to_regrole('authenticated')::oid),
    ('service_role'::text, pg_catalog.to_regrole('service_role')::oid)
), object_creators(owner_oid) as (
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
), global_defaults as (
  select
    case
      when d.oid is null then 'BUILT_IN_BASELINE'
      else 'EXPLICIT_GLOBAL_DEFAULT_ACL'
    end::text as default_source,
    pg_catalog.pg_get_userbyid(creators.owner_oid) as object_creator,
    '(all schemas)'::text as schema_name,
    object_types.object_type::text,
    inspected_grantees.role_name as grantee,
    acl.privilege_type,
    acl.is_grantable,
    pg_catalog.pg_get_userbyid(acl.grantor) as grantor
  from object_creators as creators
  cross join object_types
  left join pg_catalog.pg_default_acl as d
    on d.defaclrole = creators.owner_oid
   and d.defaclnamespace = 0
   and d.defaclobjtype = object_types.object_type_code
  cross join lateral pg_catalog.aclexplode(
    case
      when d.oid is null then pg_catalog.acldefault(
        object_types.object_type_code,
        creators.owner_oid
      )
      else d.defaclacl
    end
  ) as acl
  join inspected_grantees
    on inspected_grantees.role_oid = acl.grantee
), schema_defaults as (
  select
    'EXPLICIT_SCHEMA_DEFAULT_ACL'::text as default_source,
    pg_catalog.pg_get_userbyid(d.defaclrole) as object_creator,
    n.nspname::text as schema_name,
    case d.defaclobjtype
      when 'r' then 'TABLE'
      when 'S' then 'SEQUENCE'
      when 'f' then 'FUNCTION'
      when 'T' then 'TYPE'
      when 'n' then 'SCHEMA'
      else d.defaclobjtype::text
    end as object_type,
    inspected_grantees.role_name as grantee,
    acl.privilege_type,
    acl.is_grantable,
    pg_catalog.pg_get_userbyid(acl.grantor) as grantor
  from pg_catalog.pg_default_acl as d
  left join pg_catalog.pg_namespace as n
    on n.oid = d.defaclnamespace
  cross join lateral pg_catalog.aclexplode(d.defaclacl) as acl
  join inspected_grantees
    on inspected_grantees.role_oid = acl.grantee
  where d.defaclnamespace <> 0
), relevant_defaults as (
  select * from global_defaults
  union all
  select * from schema_defaults
)
select
  relevant_defaults.default_source,
  relevant_defaults.object_creator,
  relevant_defaults.schema_name,
  relevant_defaults.object_type,
  relevant_defaults.grantee,
  relevant_defaults.privilege_type,
  relevant_defaults.is_grantable,
  relevant_defaults.grantor
from relevant_defaults
order by
  relevant_defaults.default_source,
  relevant_defaults.object_creator,
  relevant_defaults.schema_name,
  relevant_defaults.object_type,
  relevant_defaults.grantee,
  relevant_defaults.privilege_type;

-- 4. Every current policy or non-system function whose catalog dependencies,
-- policy expression, function source, or policy target references one of the
-- three reviewed identity sources. SQL-standard function bodies are covered by
-- pg_depend. Only identities, reference flags, and fingerprints are exposed.
with reference_targets as (
  select
    pg_catalog.to_regprocedure(
      'public.user_owns_business(uuid)'
    )::oid as user_owns_business_oid,
    pg_catalog.to_regclass(
      'public.business_members'
    )::oid as business_members_oid,
    pg_catalog.to_regclass(
      'public.businesses'
    )::oid as businesses_oid,
    (
      select a.attnum::integer
      from pg_catalog.pg_attribute as a
      where a.attrelid = pg_catalog.to_regclass('public.businesses')
        and a.attname = 'owner_user_id'
        and not a.attisdropped
    ) as owner_user_id_attnum
), policy_sources as (
  select
    'pg_catalog.pg_policy'::pg_catalog.regclass as object_classid,
    pol.oid as object_oid,
    'POLICY'::text as object_type,
    pg_catalog.format(
      '%I.%I policy %I',
      n.nspname,
      c.relname,
      pol.polname
    ) as object_identity,
    n.nspname = 'public'
      and c.relname = 'business_members' as targets_business_members,
    pg_catalog.concat_ws(
      E'\n',
      pg_catalog.pg_get_expr(pol.polqual, pol.polrelid, true),
      pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid, true)
    ) as searchable_source,
    pg_catalog.md5(
      pg_catalog.concat_ws(
        E'\n',
        pg_catalog.pg_get_expr(pol.polqual, pol.polrelid, true),
        pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid, true)
      )
    ) as body_fingerprint
  from pg_catalog.pg_policy as pol
  join pg_catalog.pg_class as c
    on c.oid = pol.polrelid
  join pg_catalog.pg_namespace as n
    on n.oid = c.relnamespace
), function_sources as (
  select
    'pg_catalog.pg_proc'::pg_catalog.regclass as object_classid,
    p.oid as object_oid,
    'FUNCTION'::text as object_type,
    pg_catalog.format(
      '%I.%I(%s)',
      n.nspname,
      p.proname,
      pg_catalog.pg_get_function_identity_arguments(p.oid)
    ) as object_identity,
    false as targets_business_members,
    p.prosrc as searchable_source,
    pg_catalog.md5(
      pg_catalog.pg_get_functiondef(p.oid)
    ) as body_fingerprint
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n
    on n.oid = p.pronamespace
  where n.nspname not in ('pg_catalog', 'information_schema')
    and p.prokind in ('f', 'p')
), object_sources as (
  select * from policy_sources
  union all
  select * from function_sources
), reference_flags as (
  select
    object_sources.object_type,
    object_sources.object_identity,
    (
      pg_catalog.strpos(
        pg_catalog.lower(object_sources.searchable_source),
        'user_owns_business'
      ) > 0
      or exists (
        select 1
        from pg_catalog.pg_depend as d
        where d.classid = object_sources.object_classid
          and d.objid = object_sources.object_oid
          and d.refclassid =
            'pg_catalog.pg_proc'::pg_catalog.regclass
          and d.refobjid = targets.user_owns_business_oid
      )
    ) as references_user_owns_business,
    (
      object_sources.targets_business_members
      or pg_catalog.strpos(
        pg_catalog.lower(object_sources.searchable_source),
        'business_members'
      ) > 0
      or exists (
        select 1
        from pg_catalog.pg_depend as d
        where d.classid = object_sources.object_classid
          and d.objid = object_sources.object_oid
          and d.refclassid =
            'pg_catalog.pg_class'::pg_catalog.regclass
          and d.refobjid = targets.business_members_oid
      )
    ) as references_business_members,
    (
      pg_catalog.strpos(
        pg_catalog.lower(object_sources.searchable_source),
        'owner_user_id'
      ) > 0
      or exists (
        select 1
        from pg_catalog.pg_depend as d
        where d.classid = object_sources.object_classid
          and d.objid = object_sources.object_oid
          and d.refclassid =
            'pg_catalog.pg_class'::pg_catalog.regclass
          and d.refobjid = targets.businesses_oid
          and d.refobjsubid = targets.owner_user_id_attnum
      )
    ) as references_owner_user_id,
    object_sources.body_fingerprint
  from object_sources
  cross join reference_targets as targets
)
select
  reference_flags.object_type,
  reference_flags.object_identity,
  reference_flags.references_user_owns_business,
  reference_flags.references_business_members,
  reference_flags.references_owner_user_id,
  reference_flags.body_fingerprint
from reference_flags
where reference_flags.references_user_owns_business
   or reference_flags.references_business_members
   or reference_flags.references_owner_user_id
order by reference_flags.object_type, reference_flags.object_identity;
