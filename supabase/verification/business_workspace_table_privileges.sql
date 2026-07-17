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
