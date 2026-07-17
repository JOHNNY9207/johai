-- PLATFORM HARDENING P0-1: DEFAULT ACL FAILURE DIAGNOSTIC
--
-- Read-only evidence collection after the operator-confirmed SQLSTATE 55000:
--   Workspace hardening blocked: deferred public default privileges changed.
--
-- The failed transaction did not commit. P0-1 remains NOT APPLIED.
-- This diagnostic does not approve a new baseline and must not be used to
-- replace the migration's count or fingerprint without human review.
--
-- Every executable statement in this file begins with WITH and ends in SELECT.

with
execution_context as (
  select
    pg_catalog.statement_timestamp() as captured_at,
    current_database()::text as database_name,
    current_user::text as current_role,
    session_user::text as session_role,
    pg_catalog.current_setting('server_version') as server_version,
    pg_catalog.current_setting('server_version_num') as server_version_num,
    pg_catalog.to_regnamespace('public')::oid as public_schema_oid
),
required_roles(role_name, role_oid) as (
  values
    ('postgres'::text, pg_catalog.to_regrole('postgres')::oid),
    ('supabase_admin'::text, pg_catalog.to_regrole('supabase_admin')::oid),
    ('anon'::text, pg_catalog.to_regrole('anon')::oid),
    ('authenticated'::text, pg_catalog.to_regrole('authenticated')::oid),
    ('service_role'::text, pg_catalog.to_regrole('service_role')::oid)
),
role_status as (
  select
    pg_catalog.bool_and(required_roles.role_oid is not null)
      as all_required_roles_exist,
    pg_catalog.string_agg(
      required_roles.role_name,
      ', ' order by required_roles.role_name
    ) filter (where required_roles.role_oid is null) as missing_roles
  from required_roles
),
current_public_acl_raw as (
  select
    d.oid as default_acl_oid,
    d.defaclrole as object_creator_oid,
    pg_catalog.pg_get_userbyid(d.defaclrole)::text as object_creator,
    n.nspname::text as schema_name,
    d.defaclobjtype::text as raw_object_type,
    case d.defaclobjtype
      when 'r' then 'TABLE'
      when 'S' then 'SEQUENCE'
      when 'f' then 'FUNCTION'
      when 'T' then 'TYPE'
      when 'n' then 'SCHEMA'
      else d.defaclobjtype::text
    end as object_type,
    acl.grantee as grantee_oid,
    case acl.grantee
      when 0 then 'PUBLIC'
      else pg_catalog.pg_get_userbyid(acl.grantee)::text
    end as grantee,
    acl.privilege_type,
    acl.is_grantable,
    acl.grantor as grantor_oid,
    pg_catalog.pg_get_userbyid(acl.grantor)::text as grantor,
    (
      acl.grantee = 0
      or acl.grantee = pg_catalog.to_regrole('anon')::oid
      or acl.grantee = pg_catalog.to_regrole('authenticated')::oid
      or acl.grantee = pg_catalog.to_regrole('service_role')::oid
    ) as included_in_migration_fingerprint,
    (
      acl.grantee = 0
      or acl.grantee = d.defaclrole
      or acl.grantee = pg_catalog.to_regrole('anon')::oid
      or acl.grantee = pg_catalog.to_regrole('authenticated')::oid
      or acl.grantee = pg_catalog.to_regrole('service_role')::oid
    ) as allowed_by_migration_grantee_guard
  from pg_catalog.pg_default_acl as d
  join pg_catalog.pg_namespace as n
    on n.oid = d.defaclnamespace
   and n.nspname = 'public'
  cross join lateral pg_catalog.aclexplode(d.defaclacl) as acl
),
-- This projection intentionally mirrors the migration without DISTINCT,
-- added tie-breakers, COLLATE, or ACL-array COALESCE.
current_relevant as (
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
    case acl.grantee
      when 0 then 'PUBLIC'
      else pg_catalog.pg_get_userbyid(acl.grantee)
    end as grantee,
    acl.privilege_type,
    acl.is_grantable,
    pg_catalog.pg_get_userbyid(acl.grantor) as grantor
  from pg_catalog.pg_default_acl as d
  join pg_catalog.pg_namespace as n
    on n.oid = d.defaclnamespace
   and n.nspname = 'public'
  cross join lateral pg_catalog.aclexplode(d.defaclacl) as acl
  where acl.grantee in (
    0::oid,
    pg_catalog.to_regrole('anon')::oid,
    pg_catalog.to_regrole('authenticated')::oid,
    pg_catalog.to_regrole('service_role')::oid
  )
),
current_summary as (
  select
    count(*) as current_row_count,
    pg_catalog.md5(
      pg_catalog.string_agg(
        pg_catalog.concat_ws(
          '|',
          current_relevant.object_creator,
          current_relevant.schema_name,
          current_relevant.object_type,
          current_relevant.grantee,
          current_relevant.privilege_type,
          current_relevant.is_grantable::text,
          current_relevant.grantor
        ),
        E'\n' order by
          current_relevant.object_creator,
          current_relevant.object_type,
          current_relevant.grantee,
          current_relevant.privilege_type
      )
    ) as current_fingerprint
  from current_relevant
),
previous_creators(object_creator) as (
  values ('postgres'::text), ('supabase_admin'::text)
),
previous_grantees(grantee) as (
  values ('anon'::text), ('authenticated'::text), ('service_role'::text)
),
previous_privileges(object_type, privilege_type) as (
  values
    ('FUNCTION'::text, 'EXECUTE'::text),
    ('SEQUENCE', 'SELECT'),
    ('SEQUENCE', 'UPDATE'),
    ('SEQUENCE', 'USAGE'),
    ('TABLE', 'DELETE'),
    ('TABLE', 'INSERT'),
    ('TABLE', 'MAINTAIN'),
    ('TABLE', 'REFERENCES'),
    ('TABLE', 'SELECT'),
    ('TABLE', 'TRIGGER'),
    ('TABLE', 'TRUNCATE'),
    ('TABLE', 'UPDATE')
),
previous_baseline as (
  select
    previous_creators.object_creator,
    'public'::text as schema_name,
    previous_privileges.object_type,
    previous_grantees.grantee,
    previous_privileges.privilege_type,
    false as is_grantable,
    previous_creators.object_creator as grantor
  from previous_creators
  cross join previous_grantees
  cross join previous_privileges
),
previous_summary as (
  select
    count(*) as previous_row_count,
    pg_catalog.md5(
      pg_catalog.string_agg(
        pg_catalog.concat_ws(
          '|',
          previous_baseline.object_creator,
          previous_baseline.schema_name,
          previous_baseline.object_type,
          previous_baseline.grantee,
          previous_baseline.privilege_type,
          previous_baseline.is_grantable::text,
          previous_baseline.grantor
        ),
        E'\n' order by
          previous_baseline.object_creator,
          previous_baseline.object_type,
          previous_baseline.grantee,
          previous_baseline.privilege_type
      )
    ) as previous_fingerprint
  from previous_baseline
),
current_comparable as (
  select
    current_relevant.object_creator::text as object_creator,
    current_relevant.schema_name,
    current_relevant.object_type,
    current_relevant.grantee::text as grantee,
    current_relevant.privilege_type,
    current_relevant.is_grantable,
    current_relevant.grantor::text as grantor
  from current_relevant
),
-- Build a non-null, deterministic comparison key. JSON null is used as the
-- sentinel for every nullable value, so equality remains a simple hash- or
-- merge-joinable expression on current Supabase PostgreSQL.
current_normalized as (
  select
    current_comparable.*,
    pg_catalog.jsonb_build_array(
      coalesce(
        pg_catalog.to_jsonb(current_comparable.object_creator),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(current_comparable.schema_name),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(current_comparable.object_type),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(current_comparable.grantee),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(current_comparable.privilege_type),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(current_comparable.is_grantable),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(current_comparable.grantor),
        'null'::jsonb
      )
    ) as comparison_key
  from current_comparable
),
previous_normalized as (
  select
    previous_baseline.*,
    pg_catalog.jsonb_build_array(
      coalesce(
        pg_catalog.to_jsonb(previous_baseline.object_creator),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(previous_baseline.schema_name),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(previous_baseline.object_type),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(previous_baseline.grantee),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(previous_baseline.privilege_type),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(previous_baseline.is_grantable),
        'null'::jsonb
      ),
      coalesce(
        pg_catalog.to_jsonb(previous_baseline.grantor),
        'null'::jsonb
      )
    ) as comparison_key
  from previous_baseline
),
current_grouped as (
  select
    current_normalized.object_creator,
    current_normalized.schema_name,
    current_normalized.object_type,
    current_normalized.grantee,
    current_normalized.privilege_type,
    current_normalized.is_grantable,
    current_normalized.grantor,
    current_normalized.comparison_key,
    count(*) as current_occurrences
  from current_normalized
  group by
    current_normalized.object_creator,
    current_normalized.schema_name,
    current_normalized.object_type,
    current_normalized.grantee,
    current_normalized.privilege_type,
    current_normalized.is_grantable,
    current_normalized.grantor,
    current_normalized.comparison_key
),
previous_grouped as (
  select
    previous_normalized.object_creator,
    previous_normalized.schema_name,
    previous_normalized.object_type,
    previous_normalized.grantee,
    previous_normalized.privilege_type,
    previous_normalized.is_grantable,
    previous_normalized.grantor,
    previous_normalized.comparison_key,
    count(*) as previous_occurrences
  from previous_normalized
  group by
    previous_normalized.object_creator,
    previous_normalized.schema_name,
    previous_normalized.object_type,
    previous_normalized.grantee,
    previous_normalized.privilege_type,
    previous_normalized.is_grantable,
    previous_normalized.grantor,
    previous_normalized.comparison_key
),
current_only_differences as (
  select
    current_grouped.object_creator,
    current_grouped.schema_name,
    current_grouped.object_type,
    current_grouped.grantee,
    current_grouped.privilege_type,
    current_grouped.is_grantable,
    current_grouped.grantor,
    0::bigint as previous_occurrences,
    current_grouped.current_occurrences,
    current_grouped.current_occurrences as delta,
    'PRESENT_NOW_ABSENT_PREVIOUSLY'::text as difference_type
  from current_grouped
  left join previous_grouped
    on previous_grouped.comparison_key = current_grouped.comparison_key
  where previous_grouped.comparison_key is null
),
baseline_only_differences as (
  select
    previous_grouped.object_creator,
    previous_grouped.schema_name,
    previous_grouped.object_type,
    previous_grouped.grantee,
    previous_grouped.privilege_type,
    previous_grouped.is_grantable,
    previous_grouped.grantor,
    previous_grouped.previous_occurrences,
    0::bigint as current_occurrences,
    -previous_grouped.previous_occurrences as delta,
    'PREVIOUSLY_EXPECTED_ABSENT_NOW'::text as difference_type
  from previous_grouped
  left join current_grouped
    on current_grouped.comparison_key = previous_grouped.comparison_key
  where current_grouped.comparison_key is null
),
normalized_count_mismatches as (
  select
    current_grouped.object_creator,
    current_grouped.schema_name,
    current_grouped.object_type,
    current_grouped.grantee,
    current_grouped.privilege_type,
    current_grouped.is_grantable,
    current_grouped.grantor,
    previous_grouped.previous_occurrences,
    current_grouped.current_occurrences,
    current_grouped.current_occurrences
      - previous_grouped.previous_occurrences as delta,
    'NORMALIZED_COUNT_MISMATCH'::text as difference_type
  from current_grouped
  join previous_grouped
    on previous_grouped.comparison_key = current_grouped.comparison_key
  where current_grouped.current_occurrences <>
    previous_grouped.previous_occurrences
),
multiset_diff as (
  select * from current_only_differences
  union all
  select * from baseline_only_differences
  union all
  select * from normalized_count_mismatches
),
duplicate_normalized_rows as (
  select
    current_grouped.object_creator,
    current_grouped.schema_name,
    current_grouped.object_type,
    current_grouped.grantee,
    current_grouped.privilege_type,
    current_grouped.is_grantable,
    current_grouped.grantor,
    current_grouped.current_occurrences
  from current_grouped
  where current_grouped.current_occurrences > 1
),
fingerprint_ordering_collisions as (
  select
    current_normalized.object_creator,
    current_normalized.object_type,
    current_normalized.grantee,
    current_normalized.privilege_type,
    count(*) as ordering_key_occurrences,
    count(distinct current_normalized.comparison_key)
      as ordering_key_variants
  from current_normalized
  group by
    current_normalized.object_creator,
    current_normalized.object_type,
    current_normalized.grantee,
    current_normalized.privilege_type
  having count(*) > 1
),
unreviewed_grantees as (
  select current_public_acl_raw.*
  from current_public_acl_raw
  where current_public_acl_raw.allowed_by_migration_grantee_guard is not true
),
unsafe_new_effective_grants as (
  select
    current_normalized.object_creator,
    current_normalized.schema_name,
    current_normalized.object_type,
    current_normalized.grantee,
    current_normalized.privilege_type,
    current_normalized.is_grantable,
    current_normalized.grantor
  from current_normalized
  where current_normalized.is_grantable
     or current_normalized.grantee = 'PUBLIC'
     or not exists (
       select 1
       from previous_normalized
       where previous_normalized.comparison_key =
         current_normalized.comparison_key
     )
),
diagnostic_metrics as (
  select
    (select count(*) from multiset_diff) as difference_count,
    (
      select count(*)
      from multiset_diff
      where multiset_diff.difference_type =
        'PRESENT_NOW_ABSENT_PREVIOUSLY'
    ) as present_now_only_count,
    (
      select count(*)
      from multiset_diff
      where multiset_diff.difference_type =
        'PREVIOUSLY_EXPECTED_ABSENT_NOW'
    ) as previously_expected_missing_count,
    (
      select count(*)
      from multiset_diff
      where multiset_diff.difference_type = 'NORMALIZED_COUNT_MISMATCH'
    ) as normalized_count_mismatch_count,
    (select count(*) from duplicate_normalized_rows) as duplicate_row_count,
    (
      select count(*) from fingerprint_ordering_collisions
    ) as ordering_collision_count,
    (select count(*) from unreviewed_grantees) as unreviewed_grantee_count,
    (
      select count(*) from unsafe_new_effective_grants
    ) as unsafe_new_effective_grant_count
),
classification as (
  select
    case
      when not role_status.all_required_roles_exist
        or execution_context.public_schema_oid is null then
        'incomplete prior evidence'
      when diagnostic_metrics.unreviewed_grantee_count > 0
        or diagnostic_metrics.unsafe_new_effective_grant_count > 0 then
        'unsafe unexpected privilege change'
      when previous_summary.previous_row_count <> 72
        or previous_summary.previous_fingerprint <>
          'd130bd119407ee6906ad6a9c3618970c'
        or diagnostic_metrics.duplicate_row_count > 0
        or diagnostic_metrics.ordering_collision_count > 0
        or (
          diagnostic_metrics.difference_count = 0
          and (
            current_summary.current_row_count <> 72
            or current_summary.current_fingerprint <>
              'd130bd119407ee6906ad6a9c3618970c'
          )
        ) then
        'fingerprint implementation defect'
      when diagnostic_metrics.present_now_only_count = 0
        and diagnostic_metrics.normalized_count_mismatch_count = 0
        and diagnostic_metrics.previously_expected_missing_count > 0 then
        'legitimate live drift'
      else 'incomplete prior evidence'
    end as classification,
    case
      when not role_status.all_required_roles_exist
        or execution_context.public_schema_oid is null then
        'Required role/schema context is missing; the snapshot is incomplete.'
      when diagnostic_metrics.unreviewed_grantee_count > 0
        or diagnostic_metrics.unsafe_new_effective_grant_count > 0 then
        'New effective access, PUBLIC access, a grant option, or an unreviewed grantee is present. Do not refresh the migration baseline.'
      when previous_summary.previous_row_count <> 72
        or previous_summary.previous_fingerprint <>
          'd130bd119407ee6906ad6a9c3618970c'
        or diagnostic_metrics.duplicate_row_count > 0
        or diagnostic_metrics.ordering_collision_count > 0 then
        'The reconstructed baseline or migration ordering is ambiguous and requires correction before approval.'
      when diagnostic_metrics.difference_count = 0 then
        'The current snapshot matches the reconstructed baseline; the reported failure is not reproducible from current catalog evidence.'
      when diagnostic_metrics.present_now_only_count = 0
        and diagnostic_metrics.normalized_count_mismatch_count = 0 then
        'Only previously broad grants are missing. Treat as security-positive drift only after actor/date/approval and compatibility evidence are recorded.'
      else
        'The catalog differs from the reconstructed baseline, but provenance is insufficient to classify the drift as legitimate.'
    end as classification_reason,
    role_status.all_required_roles_exist,
    role_status.missing_roles,
    execution_context.public_schema_oid is not null as public_schema_exists,
    current_summary.current_row_count,
    current_summary.current_fingerprint,
    previous_summary.previous_row_count,
    previous_summary.previous_fingerprint,
    diagnostic_metrics.*,
    (
      role_status.all_required_roles_exist
      and execution_context.public_schema_oid is not null
      and current_summary.current_row_count = 72
      and current_summary.current_fingerprint =
        'd130bd119407ee6906ad6a9c3618970c'
      and diagnostic_metrics.unreviewed_grantee_count = 0
    ) as migration_default_acl_guard_would_pass_current_snapshot
  from execution_context
  cross join role_status
  cross join current_summary
  cross join previous_summary
  cross join diagnostic_metrics
),
diagnostic_output(section_order, section, payload) as (
  select
    0,
    'MIGRATION_STATUS',
    pg_catalog.jsonb_build_object(
      'migration',
        'supabase/migrations/20260715120000_business_workspace_tenant_bound_identity.sql',
      'manual_execution', 'FAILED_ATOMICALLY',
      'sqlstate', '55000',
      'transaction_committed', false,
      'migration_status', 'NOT APPLIED',
      'record_source', 'operator-confirmed failure',
      'diagnostic_executes_migration', false
    )
  union all
  select
    1,
    'EXECUTION_CONTEXT',
    pg_catalog.jsonb_build_object(
      'captured_at', execution_context.captured_at,
      'database_name', execution_context.database_name,
      'current_role', execution_context.current_role,
      'session_role', execution_context.session_role,
      'server_version', execution_context.server_version,
      'server_version_num', execution_context.server_version_num,
      'public_schema_oid', execution_context.public_schema_oid,
      'all_required_roles_exist', role_status.all_required_roles_exist,
      'missing_roles', role_status.missing_roles
    )
  from execution_context
  cross join role_status
  union all
  select
    2,
    'CURRENT_FINGERPRINT_SUMMARY',
    pg_catalog.jsonb_build_object(
      'current_row_count', classification.current_row_count,
      'current_fingerprint', classification.current_fingerprint,
      'previous_row_count', classification.previous_row_count,
      'previous_fingerprint', classification.previous_fingerprint,
      'previous_expected_row_count', 72,
      'previous_expected_fingerprint',
        'd130bd119407ee6906ad6a9c3618970c',
      'migration_default_acl_guard_would_pass_current_snapshot',
        classification.migration_default_acl_guard_would_pass_current_snapshot
    )
  from classification
  union all
  select
    3,
    'CLASSIFICATION',
    pg_catalog.jsonb_build_object(
      'classification', classification.classification,
      'reason', classification.classification_reason,
      'difference_count', classification.difference_count,
      'present_now_only_count', classification.present_now_only_count,
      'previously_expected_missing_count',
        classification.previously_expected_missing_count,
      'normalized_count_mismatch_count',
        classification.normalized_count_mismatch_count,
      'duplicate_row_count', classification.duplicate_row_count,
      'ordering_collision_count', classification.ordering_collision_count,
      'unreviewed_grantee_count', classification.unreviewed_grantee_count,
      'unsafe_new_effective_grant_count',
        classification.unsafe_new_effective_grant_count,
      'human_approval_still_required', true
    )
  from classification
  union all
  select
    4,
    'PREVIOUS_BASELINE_RECONSTRUCTION',
    pg_catalog.jsonb_build_object(
      'creators', pg_catalog.jsonb_build_array('postgres', 'supabase_admin'),
      'grantees', pg_catalog.jsonb_build_array(
        'anon', 'authenticated', 'service_role'
      ),
      'function_privileges', pg_catalog.jsonb_build_array('EXECUTE'),
      'sequence_privileges', pg_catalog.jsonb_build_array(
        'SELECT', 'UPDATE', 'USAGE'
      ),
      'table_privileges', pg_catalog.jsonb_build_array(
        'DELETE', 'INSERT', 'MAINTAIN', 'REFERENCES',
        'SELECT', 'TRIGGER', 'TRUNCATE', 'UPDATE'
      ),
      'is_grantable', false,
      'grantor_rule', 'grantor equals object_creator',
      'row_count', previous_summary.previous_row_count,
      'fingerprint', previous_summary.previous_fingerprint
    )
  from previous_summary
  union all
  select
    5,
    'CURRENT_RELEVANT_ROW',
    pg_catalog.to_jsonb(current_relevant)
  from current_relevant
  union all
  select
    case multiset_diff.difference_type
      when 'PRESENT_NOW_ABSENT_PREVIOUSLY' then 6
      when 'PREVIOUSLY_EXPECTED_ABSENT_NOW' then 7
      else 8
    end,
    multiset_diff.difference_type,
    pg_catalog.to_jsonb(multiset_diff)
  from multiset_diff
  union all
  select
    9,
    'DUPLICATE_NORMALIZED_ROW',
    pg_catalog.to_jsonb(duplicate_normalized_rows)
  from duplicate_normalized_rows
  union all
  select
    10,
    'FINGERPRINT_ORDERING_KEY_COLLISION',
    pg_catalog.to_jsonb(fingerprint_ordering_collisions)
  from fingerprint_ordering_collisions
  union all
  select
    11,
    'UNREVIEWED_GRANTEE',
    pg_catalog.to_jsonb(unreviewed_grantees)
  from unreviewed_grantees
)
select
  diagnostic_output.section,
  diagnostic_output.payload
from diagnostic_output
order by
  diagnostic_output.section_order,
  diagnostic_output.payload::text;
