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
