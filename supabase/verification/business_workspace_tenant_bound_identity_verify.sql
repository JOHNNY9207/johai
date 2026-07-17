-- PLATFORM HARDENING P0-1: READ-ONLY POST-MIGRATION VERIFICATION
--
-- Run only after explicit approval and manual execution of:
--   supabase/migrations/20260715120000_business_workspace_tenant_bound_identity.sql
--
-- Every executable statement in this file begins with SELECT or WITH.
-- Record every result set. Do not advance implementation while any expected
-- match is false or any unresolved owner/membership conflict remains.

-- 1. Exact post-migration column/default fingerprints derived from the
-- approved live export. Expected: matches_live_export_plus_role_default=true
-- for all six rows. Only business_members.role is expected to change.
with expected(table_name, expected_column_count, expected_fingerprint) as (
  values
    ('business_members', 5::bigint, '8f371c1e02ba9913b903fc7f98b2377a'),
    ('businesses', 9::bigint, 'c1852a6f154c84323fe7f456126d0f40'),
    ('knowledge_chunks', 17::bigint, 'd6db1905e294e74fe3505e0c76e76c8e'),
    ('knowledge_files', 24::bigint, 'db757cf527a53402fe5ce0ca17f9ea64'),
    ('knowledge_items', 18::bigint, '43516dcbab5ac460aa03e6ddcb8e13d3'),
    ('leads', 26::bigint, '27c40a1eb9fbe9a7ea641bfce0b1962a')
), actual as (
  select
    c.table_name,
    count(*) as column_count,
    md5(
      string_agg(
        concat_ws(
          '|',
          c.ordinal_position::text,
          c.column_name,
          c.data_type,
          c.udt_schema,
          c.udt_name,
          c.is_nullable,
          coalesce(c.column_default, 'null')
        ),
        E'\n' order by c.ordinal_position
      )
    ) as fingerprint
  from information_schema.columns as c
  where c.table_schema = 'public'
    and c.table_name = any (array[
      'business_members',
      'businesses',
      'knowledge_chunks',
      'knowledge_files',
      'knowledge_items',
      'leads'
    ])
  group by c.table_name
)
select
  expected.table_name,
  expected.expected_column_count,
  actual.column_count,
  expected.expected_fingerprint,
  actual.fingerprint,
  coalesce(
    actual.column_count = expected.expected_column_count
    and actual.fingerprint = expected.expected_fingerprint,
    false
  ) as matches_live_export_plus_role_default
from expected
left join actual using (table_name)
order by expected.table_name;

-- 2. Exact live index fingerprints. The migration must not add, remove, or
-- rewrite any index. Expected: matches_live_export=true for all six rows.
with expected(table_name, expected_index_count, expected_fingerprint) as (
  values
    ('business_members', 4::bigint, '7ab046b322e75cbc50e1938f27478c11'),
    ('businesses', 3::bigint, '173c76b8e031d3b44fb33593db20ac1e'),
    ('knowledge_chunks', 6::bigint, 'd5fd3b45571b42691b2e894dea66ca58'),
    ('knowledge_files', 7::bigint, 'e5f57dd4b2145f5ad1a0085447b8a64b'),
    ('knowledge_items', 3::bigint, 'b3690d86eb2341cd2ae309d9042b37e5'),
    ('leads', 4::bigint, 'd05e3ae5cd9a92be20514d40f093b9d2')
), actual as (
  select
    i.tablename as table_name,
    count(*) as index_count,
    md5(
      string_agg(
        concat_ws('|', i.indexname, i.indexdef),
        E'\n' order by i.indexname
      )
    ) as fingerprint
  from pg_catalog.pg_indexes as i
  where i.schemaname = 'public'
    and i.tablename = any (array[
      'business_members',
      'businesses',
      'knowledge_chunks',
      'knowledge_files',
      'knowledge_items',
      'leads'
    ])
  group by i.tablename
)
select
  expected.table_name,
  expected.expected_index_count,
  actual.index_count,
  expected.expected_fingerprint,
  actual.fingerprint,
  coalesce(
    actual.index_count = expected.expected_index_count
    and actual.fingerprint = expected.expected_fingerprint,
    false
  ) as matches_live_export
from expected
left join actual using (table_name)
order by expected.table_name;

-- 3. All six evidenced relations must still exist, remain postgres-owned, and
-- retain enabled, unforced RLS.
with expected(table_name) as (
  values
    ('business_members'),
    ('businesses'),
    ('knowledge_chunks'),
    ('knowledge_files'),
    ('knowledge_items'),
    ('leads')
)
select
  expected.table_name,
  c.oid is not null as table_exists,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  pg_catalog.pg_get_userbyid(c.relowner) as owner,
  c.oid is not null
    and c.relrowsecurity
    and not c.relforcerowsecurity
    and pg_catalog.pg_get_userbyid(c.relowner) = 'postgres'
    as rls_contract_matches
from expected
left join pg_catalog.pg_namespace as n
  on n.nspname = 'public'
left join pg_catalog.pg_class as c
  on c.relnamespace = n.oid
 and c.relname = expected.table_name
 and c.relkind in ('r', 'p')
order by expected.table_name;

-- 4. The future membership default must be member. Stored legacy role values
-- remain non-authoritative and must remain within the supported allowlist.
select
  c.table_name,
  c.column_name,
  c.is_nullable,
  c.column_default,
  c.is_nullable = 'NO'
    and c.column_default = '''member''::text'
    as role_default_matches
from information_schema.columns as c
where c.table_schema = 'public'
  and c.table_name = 'business_members'
  and c.column_name = 'role';

select
  bm.role,
  count(*) as membership_count
from public.business_members as bm
group by bm.role
order by bm.role;

-- The supplied exports did not include the constraint catalog. This inventory
-- is informational and must be retained with the verification evidence.
select
  con.conname as constraint_name,
  con.contype as constraint_type,
  con.convalidated,
  pg_catalog.pg_get_constraintdef(con.oid, true) as constraint_definition
from pg_catalog.pg_constraint as con
where con.conrelid = 'public.business_members'::pg_catalog.regclass
order by con.conname;

-- 5. Identity/membership data contract. The migration deliberately invents
-- no owner. The accepted live ownerless sentinel remains fail-closed: exactly
-- one ownerless business, 00000000-0000-0000-0000-000000000001, with zero
-- memberships. Any different ownerless state is a failed verification.
select
  (
    select count(*)
    from public.businesses as b
    where b.owner_user_id is null
  ) as businesses_without_owner_user_id,
  (
    select count(*)
    from public.business_members as bm
    left join public.businesses as b
      on b.id = bm.business_id
    where b.id is null
  ) as membership_rows_without_business,
  (
    select count(*)
    from public.business_members as bm
    where bm.role not in ('owner'::text, 'member'::text)
  ) as invalid_membership_roles,
  (
    select count(*)
    from public.business_members as bm
    join public.businesses as b
      on b.id = bm.business_id
    where bm.role = 'owner'::text
      and bm.user_id is distinct from b.owner_user_id
  ) as non_authoritative_legacy_owner_labels,
  (
    select count(*)
    from public.business_members as bm
    join public.businesses as b
      on b.id = bm.business_id
    where bm.user_id = b.owner_user_id
      and bm.role is distinct from 'owner'::text
  ) as canonical_owner_membership_label_mismatches;

select
  b.id as ownerless_business_id,
  b.slug as ownerless_business_slug,
  count(bm.id) as membership_count
from public.businesses as b
left join public.business_members as bm
  on bm.business_id = b.id
where b.owner_user_id is null
group by b.id, b.slug
order by b.id;

with ownerless as (
  select
    b.id,
    b.owner_user_id,
    count(bm.id) as membership_count
  from public.businesses as b
  left join public.business_members as bm
    on bm.business_id = b.id
  where b.owner_user_id is null
  group by b.id, b.owner_user_id
)
select
  count(*) as actual_ownerless_businesses,
  1::bigint as expected_ownerless_businesses,
  coalesce(
    bool_and(
      ownerless.id = '00000000-0000-0000-0000-000000000001'::uuid
      and ownerless.owner_user_id is null
      and ownerless.membership_count = 0
    ),
    false
  )
    and count(*) = 1
    as accepted_fail_closed_ownerless_contract_matches,
  false as migration_infers_or_assigns_owner
from ownerless;

select
  (
    select count(*)
    from public.business_members as bm
    left join auth.users as u
      on u.id = bm.user_id
    where u.id is null
  ) as membership_rows_without_auth_user,
  (
    select count(*)
    from public.businesses as b
    left join auth.users as u
      on u.id = b.owner_user_id
    where b.owner_user_id is not null
      and u.id is null
  ) as assigned_owner_ids_without_auth_user,
  (
    select count(*)
    from public.business_members as bm
    where bm.role is null
       or bm.role not in ('owner'::text, 'member'::text)
  ) as unsupported_or_null_membership_roles;

select count(*) as duplicate_user_business_membership_groups
from (
  select bm.business_id, bm.user_id
  from public.business_members as bm
  group by bm.business_id, bm.user_id
  having count(*) > 1
) as duplicate_memberships;

-- 6. Tenant-role helper security. Expected: postgres-owned SQL/STABLE
-- SECURITY DEFINER, search_path=pg_catalog, authenticated EXECUTE only.
with resolved as (
  select pg_catalog.to_regprocedure(
    'public.workspace_business_role(uuid)'
  ) as oid
)
select
  resolved.oid::pg_catalog.regprocedure as function_signature,
  resolved.oid is not null as function_exists,
  pg_catalog.pg_get_userbyid(p.proowner) as owner,
  l.lanname as language_name,
  p.prosecdef as security_definer,
  p.provolatile,
  p.proconfig,
  pg_catalog.pg_get_function_result(resolved.oid) as function_result,
  md5(
    replace(
      replace(
        p.prosrc,
        E'\r\n',
        E'\n'
      ),
      E'\r',
      E'\n'
    )
  ) as function_body_fingerprint,
  case
    when p.oid is null then null
    when p.proacl is null then true
    else exists (
      select 1
      from pg_catalog.aclexplode(p.proacl) as acl
      where acl.grantee = 0
        and acl.privilege_type = 'EXECUTE'
    )
  end as public_execute,
  pg_catalog.has_function_privilege(
    'anon', resolved.oid, 'EXECUTE'
  ) as anon_execute,
  pg_catalog.has_function_privilege(
    'authenticated', resolved.oid, 'EXECUTE'
  ) as authenticated_execute,
  pg_catalog.has_function_privilege(
    'authenticated', resolved.oid, 'EXECUTE WITH GRANT OPTION'
  ) as authenticated_execute_grant_option,
  pg_catalog.has_function_privilege(
    'service_role', resolved.oid, 'EXECUTE'
  ) as service_role_execute,
  pg_catalog.pg_get_functiondef(resolved.oid) as function_definition,
  resolved.oid is not null
    and pg_catalog.pg_get_userbyid(p.proowner) = 'postgres'
    and l.lanname = 'sql'
    and p.prosecdef
    and p.provolatile = 's'
    and p.proconfig = array['search_path=pg_catalog']
    and pg_catalog.pg_get_function_result(resolved.oid) = 'text'
    and md5(
      replace(
        replace(
          p.prosrc,
          E'\r\n',
          E'\n'
        ),
        E'\r',
        E'\n'
      )
    ) = '5cb186fb9ab6d9eece3868da4259521e'
    and p.proacl is not null
    and not exists (
      select 1
      from pg_catalog.aclexplode(p.proacl) as acl
      where acl.grantee = 0
        and acl.privilege_type = 'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'anon', resolved.oid, 'EXECUTE'
    )
    and pg_catalog.has_function_privilege(
      'authenticated', resolved.oid, 'EXECUTE'
    )
    and not pg_catalog.has_function_privilege(
      'authenticated', resolved.oid, 'EXECUTE WITH GRANT OPTION'
    )
    and not pg_catalog.has_function_privilege(
      'service_role', resolved.oid, 'EXECUTE'
    )
    and not exists (
      select 1
      from pg_catalog.aclexplode(p.proacl) as acl
      where acl.privilege_type = 'EXECUTE'
        and acl.grantee not in (
          p.proowner,
          pg_catalog.to_regrole('authenticated')::oid
        )
    )
    as function_security_contract_matches
from resolved
left join pg_catalog.pg_proc as p
  on p.oid = resolved.oid
left join pg_catalog.pg_language as l
  on l.oid = p.prolang;

with resolved as (
  select pg_catalog.to_regprocedure(
    'public.workspace_business_role(uuid)'
  ) as oid
)
select
  resolved.oid::pg_catalog.regprocedure as function_signature,
  case acl.grantee
    when 0 then 'PUBLIC'
    else pg_catalog.pg_get_userbyid(acl.grantee)
  end as grantee,
  acl.privilege_type,
  acl.is_grantable,
  acl.grantee not in (
    p.proowner,
    pg_catalog.to_regrole('authenticated')::oid
  ) as unexpected_grantee
from resolved
join pg_catalog.pg_proc as p
  on p.oid = resolved.oid
cross join lateral pg_catalog.aclexplode(p.proacl) as acl
order by grantee, acl.privilege_type;

-- 7. Exact RLS policy inventory. Expected: policy_inventory_issue returns zero
-- rows, and the raw inventory contains exactly the 13 reviewed policies.
with expected(
  tablename,
  policyname,
  cmd,
  role_name,
  expected_qual,
  expected_with_check
) as (
  values
    (
      'businesses', 'businesses_workspace_select', 'SELECT', 'authenticated',
      '(workspace_business_role(id) IS NOT NULL)', '<null>'
    ),
    (
      'businesses', 'businesses_workspace_owner_update', 'UPDATE',
      'authenticated', '(workspace_business_role(id) = ''owner''::text)',
      '(workspace_business_role(id) = ''owner''::text)'
    ),
    (
      'business_members', 'business_members_workspace_select', 'SELECT',
      'authenticated', '(workspace_business_role(business_id) IS NOT NULL)',
      '<null>'
    ),
    (
      'business_members', 'business_members_workspace_owner_insert', 'INSERT',
      'authenticated', '<null>',
      '((workspace_business_role(business_id) = ''owner''::text) AND (role = ''member''::text))'
    ),
    (
      'business_members', 'business_members_workspace_owner_delete', 'DELETE',
      'authenticated', '(workspace_business_role(business_id) = ''owner''::text)',
      '<null>'
    ),
    (
      'leads', 'Allow anonymous lead inserts', 'INSERT', 'anon',
      '<null>', 'true'
    ),
    (
      'leads', 'leads_workspace_select', 'SELECT', 'authenticated',
      '(workspace_business_role(business_id) IS NOT NULL)', '<null>'
    ),
    (
      'leads', 'leads_workspace_insert', 'INSERT', 'authenticated',
      '<null>', '(workspace_business_role(business_id) IS NOT NULL)'
    ),
    (
      'leads', 'leads_workspace_update', 'UPDATE', 'authenticated',
      '(workspace_business_role(business_id) IS NOT NULL)',
      '(workspace_business_role(business_id) IS NOT NULL)'
    ),
    (
      'leads', 'leads_workspace_owner_delete', 'DELETE', 'authenticated',
      '(workspace_business_role(business_id) = ''owner''::text)', '<null>'
    ),
    (
      'knowledge_chunks', 'knowledge_chunks_workspace_select', 'SELECT',
      'authenticated', '(workspace_business_role(business_id) IS NOT NULL)',
      '<null>'
    ),
    (
      'knowledge_files', 'knowledge_files_workspace_select', 'SELECT',
      'authenticated', '(workspace_business_role(business_id) IS NOT NULL)',
      '<null>'
    ),
    (
      'knowledge_items', 'knowledge_items_workspace_select', 'SELECT',
      'authenticated', '(workspace_business_role(business_id) IS NOT NULL)',
      '<null>'
    )
), actual as (
  select
    p.tablename,
    p.policyname,
    p.cmd,
    p.roles,
    p.permissive,
    coalesce(p.qual, '<null>') as normalized_qual,
    coalesce(p.with_check, '<null>') as normalized_with_check
  from pg_catalog.pg_policies as p
  where p.schemaname = 'public'
    and p.tablename = any (array[
      'business_members',
      'businesses',
      'knowledge_chunks',
      'knowledge_files',
      'knowledge_items',
      'leads'
    ])
)
select
  'missing_or_changed'::text as policy_inventory_issue,
  expected.tablename,
  expected.policyname,
  expected.cmd,
  expected.role_name
from expected
where not exists (
  select 1
  from actual
  where actual.tablename = expected.tablename
    and actual.policyname = expected.policyname
    and actual.cmd = expected.cmd
    and actual.roles = (array[expected.role_name])::name[]
    and actual.permissive = 'PERMISSIVE'
    and actual.normalized_qual = expected.expected_qual
    and actual.normalized_with_check = expected.expected_with_check
)
union all
select
  'unexpected'::text as policy_inventory_issue,
  actual.tablename,
  actual.policyname,
  actual.cmd,
  actual.roles::text as role_name
from actual
where not exists (
  select 1
  from expected
  where expected.tablename = actual.tablename
    and expected.policyname = actual.policyname
    and expected.cmd = actual.cmd
    and actual.roles = (array[expected.role_name])::name[]
    and actual.permissive = 'PERMISSIVE'
    and actual.normalized_qual = expected.expected_qual
    and actual.normalized_with_check = expected.expected_with_check
)
order by tablename, policyname, policy_inventory_issue;

select
  p.schemaname,
  p.tablename,
  p.policyname,
  p.permissive,
  p.roles,
  p.cmd,
  p.qual,
  p.with_check
from pg_catalog.pg_policies as p
where p.schemaname = 'public'
  and p.tablename = any (array[
    'business_members',
    'businesses',
    'knowledge_chunks',
    'knowledge_files',
    'knowledge_items',
    'leads'
  ])
order by p.tablename, p.policyname;

-- No replaced target policy may still use the legacy membership helper.
-- Expected: zero.
select count(*) as target_policies_using_legacy_user_owns_business
from pg_catalog.pg_policies as p
where p.schemaname = 'public'
  and p.tablename = any (array[
    'business_members',
    'businesses',
    'knowledge_chunks',
    'knowledge_files',
    'knowledge_items',
    'leads'
  ])
  and (
    coalesce(p.qual, '') like '%user_owns_business%'
    or coalesce(p.with_check, '') like '%user_owns_business%'
  );

-- 8. Effective table-level browser/API privileges. Expected:
-- privilege_matches=true on every row. Column-only INSERT/UPDATE grants are
-- intentionally false here and are verified in the next result set.
with workspace_tables(table_name) as (
  values
    ('business_members'),
    ('businesses'),
    ('knowledge_chunks'),
    ('knowledge_files'),
    ('knowledge_items'),
    ('leads')
), roles(role_name) as (
  values ('anon'), ('authenticated')
), privileges(privilege_name) as (
  values
    ('SELECT'),
    ('INSERT'),
    ('UPDATE'),
    ('DELETE'),
    ('TRUNCATE'),
    ('REFERENCES'),
    ('TRIGGER')
), matrix as (
  select
    workspace_tables.table_name,
    roles.role_name,
    privileges.privilege_name,
    case
      when roles.role_name = 'anon' then
        false
      when roles.role_name = 'authenticated' then
        privileges.privilege_name = 'SELECT'
        or (
          workspace_tables.table_name = any (array[
            'business_members', 'leads'
          ])
          and privileges.privilege_name = 'DELETE'
        )
      else false
    end as privilege_expected,
    pg_catalog.has_table_privilege(
      roles.role_name,
      pg_catalog.format('public.%I', workspace_tables.table_name),
      privileges.privilege_name
    ) as privilege_actual,
    pg_catalog.has_table_privilege(
      roles.role_name,
      pg_catalog.format('public.%I', workspace_tables.table_name),
      privileges.privilege_name || ' WITH GRANT OPTION'
    ) as grant_option_actual
  from workspace_tables
  cross join roles
  cross join privileges
)
select
  matrix.*,
  matrix.privilege_actual = matrix.privilege_expected
    and not matrix.grant_option_actual
    as privilege_matches
from matrix
order by matrix.role_name, matrix.table_name, matrix.privilege_name;

-- Existing server behavior must retain DML capability while application code
-- is migrated away from ordinary service-role use. Expected: all true.
with workspace_tables(table_name) as (
  values
    ('business_members'),
    ('businesses'),
    ('knowledge_chunks'),
    ('knowledge_files'),
    ('knowledge_items'),
    ('leads')
), privileges(privilege_name) as (
  values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE')
)
select
  workspace_tables.table_name,
  privileges.privilege_name,
  pg_catalog.has_table_privilege(
    'service_role',
    pg_catalog.format('public.%I', workspace_tables.table_name),
    privileges.privilege_name
  ) as service_role_has_required_privilege,
  pg_catalog.has_table_privilege(
    'service_role',
    pg_catalog.format('public.%I', workspace_tables.table_name),
    privileges.privilege_name || ' WITH GRANT OPTION'
  ) as service_role_has_grant_option,
  pg_catalog.has_table_privilege(
    'service_role',
    pg_catalog.format('public.%I', workspace_tables.table_name),
    privileges.privilege_name
  )
    and not pg_catalog.has_table_privilege(
      'service_role',
      pg_catalog.format('public.%I', workspace_tables.table_name),
      privileges.privilege_name || ' WITH GRANT OPTION'
    ) as service_role_privilege_matches
from workspace_tables
cross join privileges
order by workspace_tables.table_name, privileges.privilege_name;

-- 9. Exact effective column allowlist for anon/authenticated. Expected:
-- privilege_matches=true on every row.
with workspace_columns as (
  select c.table_name, c.column_name
  from information_schema.columns as c
  where c.table_schema = 'public'
    and c.table_name = any (array[
      'business_members',
      'businesses',
      'knowledge_chunks',
      'knowledge_files',
      'knowledge_items',
      'leads'
    ])
), roles(role_name) as (
  values ('anon'), ('authenticated')
), expected as (
  select
    workspace_columns.table_name,
    workspace_columns.column_name,
    roles.role_name,
    roles.role_name = 'authenticated' as select_expected,
    case
      when roles.role_name = 'anon' then
        workspace_columns.table_name = 'leads'
        and workspace_columns.column_name = any (array[
          'first_name',
          'business_name',
          'business_type',
          'email',
          'phone',
          'biggest_problem',
          'ai_recommendations',
          'conversation',
          'source'
        ])
      when roles.role_name = 'authenticated' then
        (
          workspace_columns.table_name = 'business_members'
          and workspace_columns.column_name = any (array[
            'business_id', 'user_id', 'role'
          ])
        )
        or (
          workspace_columns.table_name = 'leads'
          and workspace_columns.column_name <> all (array[
            'id', 'created_at'
          ])
        )
      else false
    end as insert_expected,
    roles.role_name = 'authenticated'
      and (
        (
          workspace_columns.table_name = 'businesses'
          and workspace_columns.column_name = any (array[
            'name'
          ])
        )
        or (
          workspace_columns.table_name = 'leads'
          and workspace_columns.column_name <> all (array[
            'id', 'created_at', 'business_id'
          ])
        )
      ) as update_expected
  from workspace_columns
  cross join roles
), actual as (
  select
    expected.*,
    pg_catalog.has_column_privilege(
      expected.role_name,
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'SELECT'
    ) as select_actual,
    pg_catalog.has_column_privilege(
      expected.role_name,
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'INSERT'
    ) as insert_actual,
    pg_catalog.has_column_privilege(
      expected.role_name,
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'UPDATE'
    ) as update_actual,
    pg_catalog.has_column_privilege(
      expected.role_name,
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'REFERENCES'
    ) as references_actual,
    pg_catalog.has_column_privilege(
      expected.role_name,
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'SELECT WITH GRANT OPTION'
    ) as select_grant_option_actual,
    pg_catalog.has_column_privilege(
      expected.role_name,
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'INSERT WITH GRANT OPTION'
    ) as insert_grant_option_actual,
    pg_catalog.has_column_privilege(
      expected.role_name,
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'UPDATE WITH GRANT OPTION'
    ) as update_grant_option_actual,
    pg_catalog.has_column_privilege(
      expected.role_name,
      pg_catalog.format('public.%I', expected.table_name),
      expected.column_name,
      'REFERENCES WITH GRANT OPTION'
    ) as references_grant_option_actual
  from expected
)
select
  actual.*,
  actual.select_actual = actual.select_expected
    and actual.insert_actual = actual.insert_expected
    and actual.update_actual = actual.update_expected
    and actual.references_actual = false
    and not actual.select_grant_option_actual
    and not actual.insert_grant_option_actual
    and not actual.update_grant_option_actual
    and not actual.references_grant_option_actual
    as privilege_matches
from actual
order by actual.role_name, actual.table_name, actual.column_name;

-- 10. Direct ACL inventories, including PUBLIC. These must agree with the
-- effective matrices above; unexpected inherited access is not excused by an
-- empty direct-ACL result.
select
  tp.table_schema as schema_name,
  tp.table_name,
  tp.grantee,
  tp.privilege_type,
  tp.is_grantable,
  tp.grantee <> all (array[
    'postgres', 'service_role', 'authenticated', 'anon'
  ]) as unexpected_grantee
from information_schema.table_privileges as tp
where tp.table_schema = 'public'
  and tp.table_name = any (array[
    'business_members',
    'businesses',
    'knowledge_chunks',
    'knowledge_files',
    'knowledge_items',
    'leads'
  ])
order by tp.table_name, tp.grantee, tp.privilege_type;

select
  cp.table_name,
  cp.column_name,
  cp.grantee,
  cp.privilege_type,
  cp.is_grantable,
  cp.grantee <> all (array[
    'postgres', 'service_role', 'authenticated', 'anon'
  ]) as unexpected_grantee
from information_schema.column_privileges as cp
where cp.table_schema = 'public'
  and cp.table_name = any (array[
    'business_members',
    'businesses',
    'knowledge_chunks',
    'knowledge_files',
    'knowledge_items',
    'leads'
  ])
order by cp.table_name, cp.column_name, cp.grantee, cp.privilege_type;

-- 11. Role inheritance/default ACLs can restore effective access after direct
-- revocation. Review and record every returned row.
select
  pg_catalog.pg_get_userbyid(m.member) as member_role,
  pg_catalog.pg_get_userbyid(m.roleid) as granted_role,
  m.admin_option,
  pg_catalog.pg_get_userbyid(m.member) = any (array[
    'anon', 'authenticated', 'service_role'
  ])
    or pg_catalog.pg_get_userbyid(m.roleid) = any (array[
      'anon', 'authenticated', 'service_role'
    ]) as standard_role_involved
from pg_catalog.pg_auth_members as m
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
  acl.is_grantable,
  case acl.grantee
    when 0 then true
    else pg_catalog.pg_get_userbyid(acl.grantee) <> all (array[
      'postgres', 'service_role', 'authenticated', 'anon'
    ])
  end as unexpected_grantee
from pg_catalog.pg_default_acl as d
left join pg_catalog.pg_namespace as n
  on n.oid = d.defaclnamespace
cross join lateral pg_catalog.aclexplode(d.defaclacl) as acl
order by owner, schema_name, d.defaclobjtype, grantee, acl.privilege_type;

-- 12. Existing helper and Knowledge function definitions must be unchanged
-- except for download line-ending normalization. Expected:
-- contract_matches=true for all four rows. Exact definitions are also returned.
with expected(
  signature,
  expected_owner,
  expected_security_definer,
  expected_volatility,
  expected_proconfig,
  expected_definition_fingerprint,
  expected_anon_execute,
  expected_authenticated_execute,
  expected_service_role_execute
) as (
  values
    (
      'public.activate_knowledge_file_version(uuid,uuid)',
      'postgres', true, 'v', 'search_path=pg_catalog',
      'bfe383cfbdf706d683d8693484e51c2a',
      false, false, true
    ),
    (
      'public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)',
      'postgres', true, 'v', 'search_path=pg_catalog',
      '16aed544c62caf75c68fe55759c371a8',
      false, false, true
    ),
    (
      'public.search_knowledge_chunks(uuid,text,integer)',
      'postgres', true, 's', 'search_path=public',
      '3cfab9ae525b9a01d972f94159dba13c',
      false, false, true
    ),
    (
      'public.user_owns_business(uuid)',
      'postgres', true, 's', 'search_path=public',
      '89c557e758801e526ceefd1dd3700cb8',
      false, true, false
    )
), resolved as (
  select
    expected.*,
    pg_catalog.to_regprocedure(expected.signature) as oid
  from expected
), actual as (
  select
    resolved.*,
    pg_catalog.pg_get_userbyid(p.proowner) as actual_owner,
    p.prosecdef as actual_security_definer,
    p.provolatile::text as actual_volatility,
    p.proconfig as actual_proconfig,
    md5(
      replace(
        replace(
          pg_catalog.pg_get_functiondef(resolved.oid),
          E'\r\n',
          E'\n'
        ),
        E'\r',
        E'\n'
      )
    ) as actual_definition_fingerprint,
    pg_catalog.has_function_privilege(
      'anon', resolved.oid, 'EXECUTE'
    ) as actual_anon_execute,
    pg_catalog.has_function_privilege(
      'authenticated', resolved.oid, 'EXECUTE'
    ) as actual_authenticated_execute,
    pg_catalog.has_function_privilege(
      'service_role', resolved.oid, 'EXECUTE'
    ) as actual_service_role_execute,
    pg_catalog.pg_get_functiondef(resolved.oid) as function_definition
  from resolved
  left join pg_catalog.pg_proc as p
    on p.oid = resolved.oid
)
select
  actual.signature,
  actual.oid is not null as function_exists,
  actual.expected_owner,
  actual.actual_owner,
  actual.expected_security_definer,
  actual.actual_security_definer,
  actual.expected_volatility,
  actual.actual_volatility,
  actual.expected_proconfig,
  actual.actual_proconfig,
  actual.expected_definition_fingerprint,
  actual.actual_definition_fingerprint,
  actual.expected_anon_execute,
  actual.actual_anon_execute,
  actual.expected_authenticated_execute,
  actual.actual_authenticated_execute,
  actual.expected_service_role_execute,
  actual.actual_service_role_execute,
  actual.oid is not null
    and actual.actual_owner = actual.expected_owner
    and actual.actual_security_definer = actual.expected_security_definer
    and actual.actual_volatility = actual.expected_volatility
    and actual.actual_proconfig = array[actual.expected_proconfig]
    and actual.actual_definition_fingerprint =
      actual.expected_definition_fingerprint
    and actual.actual_anon_execute = actual.expected_anon_execute
    and actual.actual_authenticated_execute =
      actual.expected_authenticated_execute
    and actual.actual_service_role_execute =
      actual.expected_service_role_execute
    as contract_matches,
  actual.function_definition
from actual
order by actual.signature;

-- 13. Knowledge versioning indexes and cross-tenant chunk integrity remain
-- unchanged. Expected: three index rows and knowledge_chunk_business_orphans=0.
select
  i.tablename,
  i.indexname,
  i.indexdef
from pg_catalog.pg_indexes as i
where i.schemaname = 'public'
  and i.indexname = any (array[
    'knowledge_chunks_file_chunk_unique',
    'knowledge_files_lineage_version_unique',
    'knowledge_files_one_active_per_lineage'
  ])
order by i.indexname;

select count(*) as knowledge_chunk_business_orphans
from public.knowledge_chunks as kc
left join public.knowledge_files as kf
  on kf.id = kc.knowledge_file_id
where kf.id is null
   or kf.business_id <> kc.business_id;

-- 14. Every one of the 23 reviewed identity dependencies has an explicit
-- disposition. PRESERVED objects must retain their exact reviewed body;
-- REPLACED policies must no longer exist under their legacy name.
with expected(
  object_type,
  object_identity,
  disposition,
  reviewed_body_fingerprint
) as (
  values
    (
      'FUNCTION',
      'public.is_current_portal_customer(target_customer_profile_id uuid, target_business_id uuid)',
      'PRESERVED', 'fc694713d07b2e6ce94bb124232a21de'
    ),
    (
      'FUNCTION',
      'public.redeem_customer_portal_invitation(p_token_hash text, p_auth_user_id uuid)',
      'PRESERVED', '195639e1feefeacb64d3c62658db6376'
    ),
    (
      'FUNCTION',
      'public.user_owns_business(target_business_id uuid)',
      'PRESERVED', '77f607ed3738f7bb45ebcee1e89e291e'
    ),
    (
      'POLICY', 'public.ai_orchestration_logs policy ai_orchestration_logs_owned',
      'PRESERVED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY', 'public.audits policy audits_owned',
      'PRESERVED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY', 'public.automations policy automations_owned',
      'PRESERVED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY', 'public.business_brains policy business_brains_owned',
      'PRESERVED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY', 'public.business_members policy business_members_manage_owned',
      'REPLACED', '4f6347840d16cbf9eca735f55dd17e5b'
    ),
    (
      'POLICY', 'public.business_members policy business_members_select_owned',
      'REPLACED', '63656a80f6dbf922d2be033e1916ca19'
    ),
    (
      'POLICY', 'public.business_settings policy business_settings_owned',
      'PRESERVED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY', 'public.businesses policy businesses_select_owned',
      'REPLACED', '85849d3fe2bcca5bfd6cc521f7b58e3a'
    ),
    (
      'POLICY', 'public.businesses policy businesses_update_owned',
      'REPLACED', '8a683292d94f6da8928a491a11a2a82f'
    ),
    (
      'POLICY', 'public.calendly_settings policy calendly_settings_owned',
      'PRESERVED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY', 'public.follow_ups policy follow_ups_owned',
      'PRESERVED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY', 'public.knowledge_chunks policy knowledge_chunks_owned',
      'REPLACED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY', 'public.knowledge_files policy knowledge_files_owned',
      'REPLACED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY', 'public.knowledge_items policy knowledge_items_owned',
      'REPLACED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY',
      'public.knowledge_processing_logs policy knowledge_processing_logs_owned',
      'PRESERVED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY', 'public.leads policy leads_owned',
      'REPLACED', 'c14825b241088ea9b5f0ac35611fac2d'
    ),
    (
      'POLICY', 'storage.objects policy knowledge_files_storage_delete_owned',
      'PRESERVED', '6dee25484e5cc79a72418753eb6688b2'
    ),
    (
      'POLICY', 'storage.objects policy knowledge_files_storage_insert_owned',
      'PRESERVED', '6dee25484e5cc79a72418753eb6688b2'
    ),
    (
      'POLICY', 'storage.objects policy knowledge_files_storage_select_owned',
      'PRESERVED', '6dee25484e5cc79a72418753eb6688b2'
    ),
    (
      'POLICY', 'storage.objects policy knowledge_files_storage_update_owned',
      'PRESERVED', '0a1d681815fbc10df30e4b797212b88d'
    )
), policy_sources as (
  select
    'POLICY'::text as object_type,
    pg_catalog.format(
      '%I.%I policy %I', n.nspname, c.relname, pol.polname
    ) as object_identity,
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
    'FUNCTION'::text as object_type,
    pg_catalog.format(
      '%I.%I(%s)',
      n.nspname,
      p.proname,
      pg_catalog.pg_get_function_identity_arguments(p.oid)
    ) as object_identity,
    pg_catalog.md5(pg_catalog.pg_get_functiondef(p.oid)) as body_fingerprint
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n
    on n.oid = p.pronamespace
  where n.nspname not in ('pg_catalog', 'information_schema')
    and p.prokind in ('f', 'p')
), actual as (
  select * from policy_sources
  union all
  select * from function_sources
)
select
  expected.object_type,
  expected.object_identity,
  expected.disposition,
  expected.reviewed_body_fingerprint,
  actual.body_fingerprint as post_migration_body_fingerprint,
  case expected.disposition
    when 'PRESERVED' then
      actual.object_identity is not null
      and actual.body_fingerprint = expected.reviewed_body_fingerprint
    when 'REPLACED' then actual.object_identity is null
    else false
  end as reviewed_dependency_accounted_for
from expected
left join actual
  on actual.object_type = expected.object_type
 and actual.object_identity = expected.object_identity
order by expected.object_type, expected.object_identity;

-- The exact 12 out-of-scope policies that still depend on the legacy helper
-- remain unchanged. This includes all four Knowledge Storage policies.
with expected(
  schema_name,
  table_name,
  policy_name,
  command_name,
  body_fingerprint
) as (
  values
    ('public', 'ai_orchestration_logs', 'ai_orchestration_logs_owned', 'ALL',
      'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'audits', 'audits_owned', 'ALL',
      'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'automations', 'automations_owned', 'ALL',
      'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'business_brains', 'business_brains_owned', 'ALL',
      'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'business_settings', 'business_settings_owned', 'ALL',
      'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'calendly_settings', 'calendly_settings_owned', 'ALL',
      'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'follow_ups', 'follow_ups_owned', 'ALL',
      'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'knowledge_processing_logs', 'knowledge_processing_logs_owned',
      'ALL', 'c14825b241088ea9b5f0ac35611fac2d'),
    ('storage', 'objects', 'knowledge_files_storage_delete_owned', 'DELETE',
      '6dee25484e5cc79a72418753eb6688b2'),
    ('storage', 'objects', 'knowledge_files_storage_insert_owned', 'INSERT',
      '6dee25484e5cc79a72418753eb6688b2'),
    ('storage', 'objects', 'knowledge_files_storage_select_owned', 'SELECT',
      '6dee25484e5cc79a72418753eb6688b2'),
    ('storage', 'objects', 'knowledge_files_storage_update_owned', 'UPDATE',
      '0a1d681815fbc10df30e4b797212b88d')
), actual as (
  select
    n.nspname::text as schema_name,
    c.relname::text as table_name,
    pol.polname::text as policy_name,
    case pol.polcmd
      when '*' then 'ALL'
      when 'r' then 'SELECT'
      when 'a' then 'INSERT'
      when 'w' then 'UPDATE'
      when 'd' then 'DELETE'
      else pol.polcmd::text
    end as command_name,
    pol.polpermissive,
    (
      select array_agg(pg_catalog.pg_get_userbyid(role_oid) order by role_oid)
      from unnest(pol.polroles) as role_oid
    ) as role_names,
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
  where pg_catalog.strpos(
    pg_catalog.lower(
      pg_catalog.concat_ws(
        E'\n',
        pg_catalog.pg_get_expr(pol.polqual, pol.polrelid, true),
        pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid, true)
      )
    ),
    'user_owns_business'
  ) > 0
)
select
  coalesce(expected.schema_name, actual.schema_name) as schema_name,
  coalesce(expected.table_name, actual.table_name) as table_name,
  coalesce(expected.policy_name, actual.policy_name) as policy_name,
  expected.command_name as expected_command,
  actual.command_name as actual_command,
  expected.body_fingerprint as expected_body_fingerprint,
  actual.body_fingerprint as actual_body_fingerprint,
  expected.policy_name is not null
    and actual.policy_name is not null
    and actual.command_name = expected.command_name
    and actual.polpermissive
    and actual.role_names = array['authenticated']::name[]
    and actual.body_fingerprint = expected.body_fingerprint
    as preserved_legacy_helper_policy_matches
from expected
full join actual
  on actual.schema_name = expected.schema_name
 and actual.table_name = expected.table_name
 and actual.policy_name = expected.policy_name
order by schema_name, table_name, policy_name;

-- No function may acquire a new dependency on user_owns_business().
with target as (
  select pg_catalog.to_regprocedure(
    'public.user_owns_business(uuid)'
  )::oid as helper_oid
)
select count(*) as functions_depending_on_user_owns_business
from pg_catalog.pg_proc as p
join pg_catalog.pg_namespace as n
  on n.oid = p.pronamespace
cross join target
where n.nspname not in ('pg_catalog', 'information_schema')
  and p.prokind in ('f', 'p')
  and p.oid <> target.helper_oid
  and (
    pg_catalog.strpos(
      pg_catalog.lower(p.prosrc),
      'user_owns_business'
    ) > 0
    or exists (
      select 1
      from pg_catalog.pg_depend as d
      where d.classid = 'pg_catalog.pg_proc'::pg_catalog.regclass
        and d.objid = p.oid
        and d.refclassid = 'pg_catalog.pg_proc'::pg_catalog.regclass
        and d.refobjid = target.helper_oid
    )
  );

-- Exact post-migration identity-dependency inventory. Expected: zero rows.
-- This catches new policies/functions involving user_owns_business(),
-- business_members, or businesses.owner_user_id beyond the reviewed 19-object
-- post-migration set.
with expected(
  object_type,
  object_identity,
  references_user_owns_business,
  references_business_members,
  references_owner_user_id
) as (
  values
    ('FUNCTION',
      'public.is_current_portal_customer(target_customer_profile_id uuid, target_business_id uuid)',
      false, true, true),
    ('FUNCTION',
      'public.redeem_customer_portal_invitation(p_token_hash text, p_auth_user_id uuid)',
      false, true, true),
    ('FUNCTION',
      'public.user_owns_business(target_business_id uuid)',
      false, true, true),
    ('FUNCTION',
      'public.workspace_business_role(target_business_id uuid)',
      false, true, true),
    ('POLICY',
      'public.ai_orchestration_logs policy ai_orchestration_logs_owned',
      true, false, false),
    ('POLICY', 'public.audits policy audits_owned', true, false, false),
    ('POLICY', 'public.automations policy automations_owned', true, false, false),
    ('POLICY', 'public.business_brains policy business_brains_owned',
      true, false, false),
    ('POLICY',
      'public.business_members policy business_members_workspace_owner_delete',
      false, true, false),
    ('POLICY',
      'public.business_members policy business_members_workspace_owner_insert',
      false, true, false),
    ('POLICY',
      'public.business_members policy business_members_workspace_select',
      false, true, false),
    ('POLICY',
      'public.business_settings policy business_settings_owned',
      true, false, false),
    ('POLICY',
      'public.calendly_settings policy calendly_settings_owned',
      true, false, false),
    ('POLICY', 'public.follow_ups policy follow_ups_owned',
      true, false, false),
    ('POLICY',
      'public.knowledge_processing_logs policy knowledge_processing_logs_owned',
      true, false, false),
    ('POLICY',
      'storage.objects policy knowledge_files_storage_delete_owned',
      true, false, false),
    ('POLICY',
      'storage.objects policy knowledge_files_storage_insert_owned',
      true, false, false),
    ('POLICY',
      'storage.objects policy knowledge_files_storage_select_owned',
      true, false, false),
    ('POLICY',
      'storage.objects policy knowledge_files_storage_update_owned',
      true, false, false)
), reference_targets as (
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
      '%I.%I policy %I', n.nspname, c.relname, pol.polname
    ) as object_identity,
    n.nspname = 'public'
      and c.relname = 'business_members' as targets_business_members,
    pg_catalog.concat_ws(
      E'\n',
      pg_catalog.pg_get_expr(pol.polqual, pol.polrelid, true),
      pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid, true)
    ) as searchable_source
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
    p.prosrc as searchable_source
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n
    on n.oid = p.pronamespace
  where n.nspname not in ('pg_catalog', 'information_schema')
    and p.prokind in ('f', 'p')
), object_sources as (
  select * from policy_sources
  union all
  select * from function_sources
), actual as (
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
          and d.refclassid = 'pg_catalog.pg_proc'::pg_catalog.regclass
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
          and d.refclassid = 'pg_catalog.pg_class'::pg_catalog.regclass
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
          and d.refclassid = 'pg_catalog.pg_class'::pg_catalog.regclass
          and d.refobjid = targets.businesses_oid
          and d.refobjsubid = targets.owner_user_id_attnum
      )
    ) as references_owner_user_id
  from object_sources
  cross join reference_targets as targets
), relevant_actual as (
  select *
  from actual
  where actual.references_user_owns_business
     or actual.references_business_members
     or actual.references_owner_user_id
)
select
  coalesce(expected.object_type, relevant_actual.object_type) as object_type,
  coalesce(expected.object_identity, relevant_actual.object_identity)
    as object_identity,
  expected.references_user_owns_business as expected_user_helper_reference,
  relevant_actual.references_user_owns_business as actual_user_helper_reference,
  expected.references_business_members as expected_membership_reference,
  relevant_actual.references_business_members as actual_membership_reference,
  expected.references_owner_user_id as expected_owner_reference,
  relevant_actual.references_owner_user_id as actual_owner_reference,
  case
    when expected.object_identity is null then 'unexpected dependency'
    when relevant_actual.object_identity is null then 'missing dependency'
    else 'changed dependency flags'
  end as issue
from expected
full join relevant_actual
  on relevant_actual.object_type = expected.object_type
 and relevant_actual.object_identity = expected.object_identity
where expected.object_identity is null
   or relevant_actual.object_identity is null
   or relevant_actual.references_user_owns_business is distinct from
      expected.references_user_owns_business
   or relevant_actual.references_business_members is distinct from
      expected.references_business_members
   or relevant_actual.references_owner_user_id is distinct from
      expected.references_owner_user_id
order by object_type, object_identity;

-- 15. Exact post-migration table privilege matrix. Every row must report
-- privilege_matches=true. MAINTAIN is intentionally included alongside
-- TRUNCATE, REFERENCES, and TRIGGER and must be false for every inspected
-- non-owner role.
with workspace_tables(table_name, table_oid) as (
  values
    ('business_members', 'public.business_members'::pg_catalog.regclass),
    ('businesses', 'public.businesses'::pg_catalog.regclass),
    ('knowledge_chunks', 'public.knowledge_chunks'::pg_catalog.regclass),
    ('knowledge_files', 'public.knowledge_files'::pg_catalog.regclass),
    ('knowledge_items', 'public.knowledge_items'::pg_catalog.regclass),
    ('leads', 'public.leads'::pg_catalog.regclass)
), inspected_roles(role_name) as (
  values ('PUBLIC'), ('anon'), ('authenticated'), ('service_role')
), inspected_privileges(privilege_name) as (
  values
    ('SELECT'),
    ('INSERT'),
    ('UPDATE'),
    ('DELETE'),
    ('TRUNCATE'),
    ('REFERENCES'),
    ('TRIGGER'),
    ('MAINTAIN')
), matrix as (
  select
    workspace_tables.table_name,
    workspace_tables.table_oid,
    inspected_roles.role_name,
    inspected_privileges.privilege_name,
    case
      when inspected_roles.role_name in ('PUBLIC', 'anon') then false
      when inspected_roles.role_name = 'authenticated' then
        inspected_privileges.privilege_name = 'SELECT'
        or (
          workspace_tables.table_name in ('business_members', 'leads')
          and inspected_privileges.privilege_name = 'DELETE'
        )
      when inspected_roles.role_name = 'service_role' then
        inspected_privileges.privilege_name in (
          'SELECT', 'INSERT', 'UPDATE', 'DELETE'
        )
      else false
    end as privilege_expected
  from workspace_tables
  cross join inspected_roles
  cross join inspected_privileges
), actual as (
  select
    matrix.*,
    case
      when matrix.role_name = 'PUBLIC' then exists (
        select 1
        from pg_catalog.pg_class as c
        cross join lateral pg_catalog.aclexplode(c.relacl) as acl
        where c.oid = matrix.table_oid
          and acl.grantee = 0
          and acl.privilege_type = matrix.privilege_name
      )
      else pg_catalog.has_table_privilege(
        matrix.role_name,
        matrix.table_oid,
        matrix.privilege_name
      )
    end as privilege_actual,
    case
      when matrix.role_name = 'PUBLIC' then exists (
        select 1
        from pg_catalog.pg_class as c
        cross join lateral pg_catalog.aclexplode(c.relacl) as acl
        where c.oid = matrix.table_oid
          and acl.grantee = 0
          and acl.privilege_type = matrix.privilege_name
          and acl.is_grantable
      )
      else pg_catalog.has_table_privilege(
        matrix.role_name,
        matrix.table_oid,
        matrix.privilege_name || ' WITH GRANT OPTION'
      )
    end as grant_option_actual
  from matrix
)
select
  actual.table_name,
  actual.role_name,
  actual.privilege_name,
  actual.privilege_expected,
  actual.privilege_actual,
  actual.grant_option_actual,
  actual.privilege_actual = actual.privilege_expected
    and not actual.grant_option_actual
    as privilege_matches
from actual
order by actual.role_name, actual.table_name, actual.privilege_name;

-- Exact effective column allowlist across PUBLIC, browser/API roles, and the
-- trusted server role. Every row must report privilege_matches=true.
with workspace_columns as (
  select
    c.table_name,
    c.column_name,
    c.ordinal_position,
    pg_catalog.to_regclass(
      pg_catalog.format('public.%I', c.table_name)
    ) as table_oid
  from information_schema.columns as c
  where c.table_schema = 'public'
    and c.table_name = any (array[
      'business_members',
      'businesses',
      'knowledge_chunks',
      'knowledge_files',
      'knowledge_items',
      'leads'
    ])
), inspected_roles(role_name) as (
  values ('PUBLIC'), ('anon'), ('authenticated'), ('service_role')
), inspected_privileges(privilege_name) as (
  values ('SELECT'), ('INSERT'), ('UPDATE'), ('REFERENCES')
), expected as (
  select
    workspace_columns.*,
    inspected_roles.role_name,
    inspected_privileges.privilege_name,
    case
      when inspected_roles.role_name = 'PUBLIC' then false
      when inspected_roles.role_name = 'anon' then
        inspected_privileges.privilege_name = 'INSERT'
        and workspace_columns.table_name = 'leads'
        and workspace_columns.column_name = any (array[
          'first_name',
          'business_name',
          'business_type',
          'email',
          'phone',
          'biggest_problem',
          'ai_recommendations',
          'conversation',
          'source'
        ])
      when inspected_roles.role_name = 'authenticated' then
        inspected_privileges.privilege_name = 'SELECT'
        or (
          inspected_privileges.privilege_name = 'INSERT'
          and (
            (
              workspace_columns.table_name = 'business_members'
              and workspace_columns.column_name = any (array[
                'business_id', 'user_id', 'role'
              ])
            )
            or (
              workspace_columns.table_name = 'leads'
              and workspace_columns.column_name <> all (array[
                'id', 'created_at'
              ])
            )
          )
        )
        or (
          inspected_privileges.privilege_name = 'UPDATE'
          and (
            (
              workspace_columns.table_name = 'businesses'
              and workspace_columns.column_name = 'name'
            )
            or (
              workspace_columns.table_name = 'leads'
              and workspace_columns.column_name <> all (array[
                'id', 'created_at', 'business_id'
              ])
            )
          )
        )
      when inspected_roles.role_name = 'service_role' then
        inspected_privileges.privilege_name in ('SELECT', 'INSERT', 'UPDATE')
      else false
    end as privilege_expected
  from workspace_columns
  cross join inspected_roles
  cross join inspected_privileges
), actual as (
  select
    expected.*,
    case
      when expected.role_name = 'PUBLIC' then
        exists (
          select 1
          from pg_catalog.pg_class as c
          cross join lateral pg_catalog.aclexplode(c.relacl) as acl
          where c.oid = expected.table_oid
            and acl.grantee = 0
            and acl.privilege_type = expected.privilege_name
        )
        or exists (
          select 1
          from pg_catalog.pg_attribute as a
          cross join lateral pg_catalog.aclexplode(a.attacl) as acl
          where a.attrelid = expected.table_oid
            and a.attname = expected.column_name
            and not a.attisdropped
            and acl.grantee = 0
            and acl.privilege_type = expected.privilege_name
        )
      else pg_catalog.has_column_privilege(
        expected.role_name,
        expected.table_oid,
        expected.column_name,
        expected.privilege_name
      )
    end as privilege_actual,
    case
      when expected.role_name = 'PUBLIC' then
        exists (
          select 1
          from pg_catalog.pg_class as c
          cross join lateral pg_catalog.aclexplode(c.relacl) as acl
          where c.oid = expected.table_oid
            and acl.grantee = 0
            and acl.privilege_type = expected.privilege_name
            and acl.is_grantable
        )
        or exists (
          select 1
          from pg_catalog.pg_attribute as a
          cross join lateral pg_catalog.aclexplode(a.attacl) as acl
          where a.attrelid = expected.table_oid
            and a.attname = expected.column_name
            and not a.attisdropped
            and acl.grantee = 0
            and acl.privilege_type = expected.privilege_name
            and acl.is_grantable
        )
      else pg_catalog.has_column_privilege(
        expected.role_name,
        expected.table_oid,
        expected.column_name,
        expected.privilege_name || ' WITH GRANT OPTION'
      )
    end as grant_option_actual
  from expected
)
select
  actual.table_name,
  actual.column_name,
  actual.role_name,
  actual.privilege_name,
  actual.privilege_expected,
  actual.privilege_actual,
  actual.grant_option_actual,
  actual.privilege_actual = actual.privilege_expected
    and not actual.grant_option_actual
    as privilege_matches
from actual
order by
  actual.role_name,
  actual.table_name,
  actual.ordinal_position,
  actual.privilege_name;

-- Direct ACL catalog audit. Expected: zero rows. This is independent of the
-- visibility rules applied by information_schema.
with target_tables as (
  select c.oid as table_oid, c.relowner, n.nspname, c.relname
  from pg_catalog.pg_class as c
  join pg_catalog.pg_namespace as n
    on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relname = any (array[
      'business_members',
      'businesses',
      'knowledge_chunks',
      'knowledge_files',
      'knowledge_items',
      'leads'
    ])
    and c.relkind in ('r', 'p')
), direct_acl as (
  select
    target_tables.nspname,
    target_tables.relname,
    null::text as column_name,
    target_tables.relowner,
    acl.grantee,
    acl.privilege_type,
    acl.is_grantable
  from target_tables
  cross join lateral pg_catalog.aclexplode(
    (select c.relacl from pg_catalog.pg_class as c
     where c.oid = target_tables.table_oid)
  ) as acl
  union all
  select
    target_tables.nspname,
    target_tables.relname,
    a.attname::text as column_name,
    target_tables.relowner,
    acl.grantee,
    acl.privilege_type,
    acl.is_grantable
  from target_tables
  join pg_catalog.pg_attribute as a
    on a.attrelid = target_tables.table_oid
   and a.attnum > 0
   and not a.attisdropped
  cross join lateral pg_catalog.aclexplode(a.attacl) as acl
), allowed_grantees as (
  select 0::oid as role_oid
  union all select pg_catalog.to_regrole('anon')::oid
  union all select pg_catalog.to_regrole('authenticated')::oid
  union all select pg_catalog.to_regrole('service_role')::oid
)
select
  direct_acl.nspname as schema_name,
  direct_acl.relname as table_name,
  direct_acl.column_name,
  case direct_acl.grantee
    when 0 then 'PUBLIC'
    else pg_catalog.pg_get_userbyid(direct_acl.grantee)
  end as grantee,
  direct_acl.privilege_type,
  direct_acl.is_grantable,
  'unexpected direct grantee or non-owner grant option'::text as issue
from direct_acl
where (
    direct_acl.grantee <> direct_acl.relowner
    and not exists (
      select 1
      from allowed_grantees
      where allowed_grantees.role_oid = direct_acl.grantee
    )
  )
   or (
    direct_acl.is_grantable
    and direct_acl.grantee <> direct_acl.relowner
  )
order by schema_name, table_name, column_name, grantee, privilege_type;

-- 16. Exact function EXECUTE matrix for both workspace helpers and all three
-- Knowledge transactional functions. Every row must report
-- execute_contract_matches=true. Customer Portal function bodies are already
-- fingerprinted in the 23-dependency result set and are not re-granted here.
with expected(signature, role_name, execute_expected) as (
  values
    ('public.user_owns_business(uuid)', 'PUBLIC', false),
    ('public.user_owns_business(uuid)', 'anon', false),
    ('public.user_owns_business(uuid)', 'authenticated', true),
    ('public.user_owns_business(uuid)', 'service_role', false),
    ('public.workspace_business_role(uuid)', 'PUBLIC', false),
    ('public.workspace_business_role(uuid)', 'anon', false),
    ('public.workspace_business_role(uuid)', 'authenticated', true),
    ('public.workspace_business_role(uuid)', 'service_role', false),
    ('public.activate_knowledge_file_version(uuid,uuid)', 'PUBLIC', false),
    ('public.activate_knowledge_file_version(uuid,uuid)', 'anon', false),
    ('public.activate_knowledge_file_version(uuid,uuid)', 'authenticated', false),
    ('public.activate_knowledge_file_version(uuid,uuid)', 'service_role', true),
    ('public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)', 'PUBLIC', false),
    ('public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)', 'anon', false),
    ('public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)', 'authenticated', false),
    ('public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)', 'service_role', true),
    ('public.search_knowledge_chunks(uuid,text,integer)', 'PUBLIC', false),
    ('public.search_knowledge_chunks(uuid,text,integer)', 'anon', false),
    ('public.search_knowledge_chunks(uuid,text,integer)', 'authenticated', false),
    ('public.search_knowledge_chunks(uuid,text,integer)', 'service_role', true)
), resolved as (
  select
    expected.*,
    pg_catalog.to_regprocedure(expected.signature) as function_oid
  from expected
), actual as (
  select
    resolved.*,
    case
      when resolved.function_oid is null then false
      when resolved.role_name = 'PUBLIC' then
        case
          when p.proacl is null then true
          else exists (
            select 1
            from pg_catalog.aclexplode(p.proacl) as acl
            where acl.grantee = 0
              and acl.privilege_type = 'EXECUTE'
          )
        end
      else pg_catalog.has_function_privilege(
        resolved.role_name,
        resolved.function_oid,
        'EXECUTE'
      )
    end as execute_actual,
    case
      when resolved.function_oid is null then false
      when resolved.role_name = 'PUBLIC' then exists (
        select 1
        from pg_catalog.aclexplode(p.proacl) as acl
        where acl.grantee = 0
          and acl.privilege_type = 'EXECUTE'
          and acl.is_grantable
      )
      else pg_catalog.has_function_privilege(
        resolved.role_name,
        resolved.function_oid,
        'EXECUTE WITH GRANT OPTION'
      )
    end as grant_option_actual
  from resolved
  left join pg_catalog.pg_proc as p
    on p.oid = resolved.function_oid
)
select
  actual.signature,
  actual.role_name,
  actual.function_oid is not null as function_exists,
  actual.execute_expected,
  actual.execute_actual,
  actual.grant_option_actual,
  actual.function_oid is not null
    and actual.execute_actual = actual.execute_expected
    and not actual.grant_option_actual
    as execute_contract_matches
from actual
order by actual.signature, actual.role_name;

-- Expected: zero rows. No target helper or Knowledge function may expose an
-- unreviewed direct EXECUTE grantee.
with target_functions as (
  select
    p.oid,
    p.proowner,
    pg_catalog.format(
      '%I.%I(%s)',
      n.nspname,
      p.proname,
      pg_catalog.pg_get_function_identity_arguments(p.oid)
    ) as signature,
    p.proacl
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n
    on n.oid = p.pronamespace
  where p.oid = any (array[
    pg_catalog.to_regprocedure('public.user_owns_business(uuid)')::oid,
    pg_catalog.to_regprocedure('public.workspace_business_role(uuid)')::oid,
    pg_catalog.to_regprocedure(
      'public.activate_knowledge_file_version(uuid,uuid)'
    )::oid,
    pg_catalog.to_regprocedure(
      'public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)'
    )::oid,
    pg_catalog.to_regprocedure(
      'public.search_knowledge_chunks(uuid,text,integer)'
    )::oid
  ])
), allowed_grantees as (
  select 0::oid as role_oid
  union all select pg_catalog.to_regrole('anon')::oid
  union all select pg_catalog.to_regrole('authenticated')::oid
  union all select pg_catalog.to_regrole('service_role')::oid
)
select
  target_functions.signature,
  case acl.grantee
    when 0 then 'PUBLIC'
    else pg_catalog.pg_get_userbyid(acl.grantee)
  end as grantee,
  acl.privilege_type,
  acl.is_grantable,
  'unexpected function grantee or non-owner grant option'::text as issue
from target_functions
cross join lateral pg_catalog.aclexplode(target_functions.proacl) as acl
where (
    acl.grantee <> target_functions.proowner
    and not exists (
      select 1
      from allowed_grantees
      where allowed_grantees.role_oid = acl.grantee
    )
  )
   or (
    acl.is_grantable
    and acl.grantee <> target_functions.proowner
  )
order by target_functions.signature, grantee;

-- 17. Default privileges are intentionally outside P0-1. This exact reviewed
-- public-schema baseline must remain unchanged: 72 explicit rows with the
-- approved fingerprint. It remains a mandatory separate future P0 migration
-- because changing it here could affect unrelated Customer Portal, Storage,
-- Knowledge, and future public-schema objects.
with inspected_grantees(role_name, role_oid) as (
  values
    ('PUBLIC'::text, 0::oid),
    ('anon'::text, pg_catalog.to_regrole('anon')::oid),
    ('authenticated'::text, pg_catalog.to_regrole('authenticated')::oid),
    ('service_role'::text, pg_catalog.to_regrole('service_role')::oid)
), schema_defaults as (
  select
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
  join pg_catalog.pg_namespace as n
    on n.oid = d.defaclnamespace
  cross join lateral pg_catalog.aclexplode(d.defaclacl) as acl
  join inspected_grantees
    on inspected_grantees.role_oid = acl.grantee
  where n.nspname = 'public'
), baseline as (
  select
    count(*) as actual_row_count,
    pg_catalog.md5(
      string_agg(
        pg_catalog.concat_ws(
          '|',
          schema_defaults.object_creator,
          schema_defaults.schema_name,
          schema_defaults.object_type,
          schema_defaults.grantee,
          schema_defaults.privilege_type,
          schema_defaults.is_grantable::text,
          schema_defaults.grantor
        ),
        E'\n' order by
          schema_defaults.object_creator,
          schema_defaults.object_type,
          schema_defaults.grantee,
          schema_defaults.privilege_type
      )
    ) as actual_fingerprint
  from schema_defaults
)
select
  baseline.actual_row_count,
  72::bigint as expected_row_count,
  baseline.actual_fingerprint,
  'd130bd119407ee6906ad6a9c3618970c'::text as expected_fingerprint,
  baseline.actual_row_count = 72
    and baseline.actual_fingerprint = 'd130bd119407ee6906ad6a9c3618970c'
    as deferred_default_acl_baseline_matches,
  true as separate_p0_default_privilege_migration_required,
  false as default_privileges_hardened_by_p0_1
from baseline;

-- Expected: zero rows. The deferred boundary permits only the reviewed roles
-- and the default-ACL creator itself within explicit public-schema ACLs.
with public_defaults as (
  select
    d.defaclrole,
    pg_catalog.pg_get_userbyid(d.defaclrole) as object_creator,
    d.defaclobjtype,
    acl.grantee,
    acl.privilege_type,
    acl.is_grantable
  from pg_catalog.pg_default_acl as d
  join pg_catalog.pg_namespace as n
    on n.oid = d.defaclnamespace
  cross join lateral pg_catalog.aclexplode(d.defaclacl) as acl
  where n.nspname = 'public'
), allowed_grantees as (
  select 0::oid as role_oid
  union all select pg_catalog.to_regrole('anon')::oid
  union all select pg_catalog.to_regrole('authenticated')::oid
  union all select pg_catalog.to_regrole('service_role')::oid
)
select
  public_defaults.object_creator,
  public_defaults.defaclobjtype,
  case public_defaults.grantee
    when 0 then 'PUBLIC'
    else pg_catalog.pg_get_userbyid(public_defaults.grantee)
  end as grantee,
  public_defaults.privilege_type,
  public_defaults.is_grantable,
  'unreviewed public-schema default ACL grantee'::text as issue
from public_defaults
where public_defaults.grantee <> public_defaults.defaclrole
  and not exists (
    select 1
    from allowed_grantees
    where allowed_grantees.role_oid = public_defaults.grantee
  )
order by object_creator, defaclobjtype, grantee, privilege_type;
