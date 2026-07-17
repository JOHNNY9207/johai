-- JOHAI Platform Hardening P0-1 final post-migration certification.
-- Read-only: one WITH ... SELECT statement; no application function is invoked.

with
constants as (
  select
    '20260715120000'::text as migration_version,
    25::integer as required_check_count
),
expected_workspace_tables(table_name) as (
  values
    ('businesses'::text),
    ('business_members'::text),
    ('leads'::text),
    ('knowledge_items'::text),
    ('knowledge_files'::text),
    ('knowledge_chunks'::text)
),
workspace_table_state as (
  select
    expected.table_name,
    c.oid as table_oid,
    owner_role.rolname::text as table_owner,
    coalesce(c.relrowsecurity, false) as rls_enabled,
    coalesce(c.relforcerowsecurity, false) as rls_forced
  from expected_workspace_tables as expected
  left join pg_catalog.pg_namespace as n
    on n.nspname = 'public'
  left join pg_catalog.pg_class as c
    on c.relnamespace = n.oid
   and c.relname = expected.table_name
   and c.relkind in ('r', 'p')
  left join pg_catalog.pg_roles as owner_role
    on owner_role.oid = c.relowner
),
expected_workspace_policies(
  table_name,
  policy_name,
  permissive,
  role_names,
  command_name,
  using_expression,
  check_expression
) as (
  values
    ('businesses', 'businesses_workspace_select', 'PERMISSIVE',
      'authenticated', 'SELECT',
      '(workspace_business_role(id) IS NOT NULL)', null::text),
    ('businesses', 'businesses_workspace_owner_update', 'PERMISSIVE',
      'authenticated', 'UPDATE',
      '(workspace_business_role(id) = ''owner''::text)',
      '(workspace_business_role(id) = ''owner''::text)'),
    ('business_members', 'business_members_workspace_select', 'PERMISSIVE',
      'authenticated', 'SELECT',
      '(workspace_business_role(business_id) IS NOT NULL)', null::text),
    ('business_members', 'business_members_workspace_owner_insert', 'PERMISSIVE',
      'authenticated', 'INSERT', null::text,
      '((workspace_business_role(business_id) = ''owner''::text) AND (role = ''member''::text))'),
    ('business_members', 'business_members_workspace_owner_delete', 'PERMISSIVE',
      'authenticated', 'DELETE',
      '(workspace_business_role(business_id) = ''owner''::text)', null::text),
    ('leads', 'Allow anonymous lead inserts', 'PERMISSIVE',
      'anon', 'INSERT', null::text, 'true'),
    ('leads', 'leads_workspace_select', 'PERMISSIVE',
      'authenticated', 'SELECT',
      '(workspace_business_role(business_id) IS NOT NULL)', null::text),
    ('leads', 'leads_workspace_insert', 'PERMISSIVE',
      'authenticated', 'INSERT', null::text,
      '(workspace_business_role(business_id) IS NOT NULL)'),
    ('leads', 'leads_workspace_update', 'PERMISSIVE',
      'authenticated', 'UPDATE',
      '(workspace_business_role(business_id) IS NOT NULL)',
      '(workspace_business_role(business_id) IS NOT NULL)'),
    ('leads', 'leads_workspace_owner_delete', 'PERMISSIVE',
      'authenticated', 'DELETE',
      '(workspace_business_role(business_id) = ''owner''::text)', null::text),
    ('knowledge_chunks', 'knowledge_chunks_workspace_select', 'PERMISSIVE',
      'authenticated', 'SELECT',
      '(workspace_business_role(business_id) IS NOT NULL)', null::text),
    ('knowledge_files', 'knowledge_files_workspace_select', 'PERMISSIVE',
      'authenticated', 'SELECT',
      '(workspace_business_role(business_id) IS NOT NULL)', null::text),
    ('knowledge_items', 'knowledge_items_workspace_select', 'PERMISSIVE',
      'authenticated', 'SELECT',
      '(workspace_business_role(business_id) IS NOT NULL)', null::text)
),
actual_workspace_policies as (
  select
    p.tablename::text as table_name,
    p.policyname::text as policy_name,
    p.permissive::text as permissive,
    pg_catalog.array_to_string(p.roles, ',')::text as role_names,
    p.cmd::text as command_name,
    p.qual::text as using_expression,
    p.with_check::text as check_expression
  from pg_catalog.pg_policies as p
  where p.schemaname = 'public'
    and p.tablename in (
      'businesses', 'business_members', 'leads',
      'knowledge_items', 'knowledge_files', 'knowledge_chunks'
    )
),
workspace_policy_differences as (
  (
    select * from expected_workspace_policies
    except
    select * from actual_workspace_policies
  )
  union all
  (
    select * from actual_workspace_policies
    except
    select * from expected_workspace_policies
  )
),
expected_workspace_column_fingerprints(table_name, column_count, fingerprint) as (
  values
    ('business_members', 5, '8f371c1e02ba9913b903fc7f98b2377a'),
    ('businesses', 9, 'c1852a6f154c84323fe7f456126d0f40'),
    ('knowledge_chunks', 17, 'd6db1905e294e74fe3505e0c76e76c8e'),
    ('knowledge_files', 24, 'db757cf527a53402fe5ce0ca17f9ea64'),
    ('knowledge_items', 18, '43516dcbab5ac460aa03e6ddcb8e13d3'),
    ('leads', 26, '27c40a1eb9fbe9a7ea641bfce0b1962a')
),
actual_workspace_column_fingerprints as (
  select
    columns.table_name::text as table_name,
    pg_catalog.count(*)::integer as column_count,
    pg_catalog.md5(
      pg_catalog.string_agg(
        pg_catalog.concat_ws(
          '|',
          columns.ordinal_position::text,
          columns.column_name,
          columns.data_type,
          columns.udt_schema,
          columns.udt_name,
          columns.is_nullable,
          coalesce(columns.column_default, 'null')
        ),
        E'\n' order by columns.ordinal_position
      )
    ) as fingerprint
  from information_schema.columns as columns
  join expected_workspace_tables as expected
    on expected.table_name = columns.table_name
  where columns.table_schema = 'public'
  group by columns.table_name
),
workspace_column_fingerprint_differences as (
  (
    select * from expected_workspace_column_fingerprints
    except
    select * from actual_workspace_column_fingerprints
  )
  union all
  (
    select * from actual_workspace_column_fingerprints
    except
    select * from expected_workspace_column_fingerprints
  )
),
expected_portal_tables(table_name) as (
  values
    ('customer_profiles'::text),
    ('customer_portal_invitations'::text),
    ('customer_portal_branding'::text),
    ('customer_portal_appointments'::text),
    ('customer_portal_messages'::text),
    ('customer_portal_documents'::text),
    ('customer_portal_document_acknowledgements'::text),
    ('customer_portal_requests'::text)
),
actual_portal_tables as (
  select c.relname::text as table_name
  from pg_catalog.pg_class as c
  join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and (
      c.relname = 'customer_profiles'
      or pg_catalog.left(c.relname, 16) = 'customer_portal_'
    )
),
portal_table_differences as (
  (
    select * from expected_portal_tables
    except
    select * from actual_portal_tables
  )
  union all
  (
    select * from actual_portal_tables
    except
    select * from expected_portal_tables
  )
),
expected_portal_columns(
  table_name,
  ordinal_position,
  column_name,
  formatted_type,
  not_null,
  default_expression
) as (
  values
    ('customer_profiles', 1, 'id', 'uuid', true, 'gen_random_uuid()'),
    ('customer_profiles', 2, 'business_id', 'uuid', true, null::text),
    ('customer_profiles', 3, 'auth_user_id', 'uuid', true, null::text),
    ('customer_profiles', 4, 'lead_id', 'uuid', false, null::text),
    ('customer_profiles', 5, 'full_name', 'text', true, '''''::text'),
    ('customer_profiles', 6, 'email', 'text', true, '''''::text'),
    ('customer_profiles', 7, 'phone', 'text', true, '''''::text'),
    ('customer_profiles', 8, 'preferred_language', 'text', true, '''en''::text'),
    ('customer_profiles', 9, 'communication_preference', 'text', true, '''email''::text'),
    ('customer_profiles', 10, 'address', 'jsonb', true, '''{}''::jsonb'),
    ('customer_profiles', 11, 'notification_preferences', 'jsonb', true, '''{}''::jsonb'),
    ('customer_profiles', 12, 'status', 'text', true, '''active''::text'),
    ('customer_profiles', 13, 'created_at', 'timestamp with time zone', true, 'now()'),
    ('customer_profiles', 14, 'updated_at', 'timestamp with time zone', true, 'now()'),
    ('customer_portal_invitations', 1, 'id', 'uuid', true, 'gen_random_uuid()'),
    ('customer_portal_invitations', 2, 'business_id', 'uuid', true, null::text),
    ('customer_portal_invitations', 3, 'lead_id', 'uuid', false, null::text),
    ('customer_portal_invitations', 4, 'email', 'text', true, null::text),
    ('customer_portal_invitations', 5, 'token_hash', 'text', true, null::text),
    ('customer_portal_invitations', 6, 'expires_at', 'timestamp with time zone', true, null::text),
    ('customer_portal_invitations', 7, 'accepted_at', 'timestamp with time zone', false, null::text),
    ('customer_portal_invitations', 8, 'created_at', 'timestamp with time zone', true, 'now()'),
    ('customer_portal_branding', 1, 'business_id', 'uuid', true, null::text),
    ('customer_portal_branding', 2, 'display_name', 'text', true, '''''::text'),
    ('customer_portal_branding', 3, 'logo_url', 'text', true, '''''::text'),
    ('customer_portal_branding', 4, 'primary_color', 'text', true, '''''::text'),
    ('customer_portal_branding', 5, 'secondary_color', 'text', true, '''''::text'),
    ('customer_portal_branding', 6, 'contact_email', 'text', true, '''''::text'),
    ('customer_portal_branding', 7, 'contact_phone', 'text', true, '''''::text'),
    ('customer_portal_branding', 8, 'address', 'text', true, '''''::text'),
    ('customer_portal_branding', 9, 'business_hours', 'jsonb', true, '''{}''::jsonb'),
    ('customer_portal_branding', 10, 'support_email', 'text', true, '''''::text'),
    ('customer_portal_branding', 11, 'booking_url', 'text', true, '''''::text'),
    ('customer_portal_branding', 12, 'industry', 'text', true, '''''::text'),
    ('customer_portal_branding', 13, 'updated_at', 'timestamp with time zone', true, 'now()'),
    ('customer_portal_appointments', 1, 'id', 'uuid', true, 'gen_random_uuid()'),
    ('customer_portal_appointments', 2, 'business_id', 'uuid', true, null::text),
    ('customer_portal_appointments', 3, 'customer_profile_id', 'uuid', true, null::text),
    ('customer_portal_appointments', 4, 'external_provider', 'text', true, '''''::text'),
    ('customer_portal_appointments', 5, 'external_event_id', 'text', true, '''''::text'),
    ('customer_portal_appointments', 6, 'status', 'text', true, '''scheduled''::text'),
    ('customer_portal_appointments', 7, 'starts_at', 'timestamp with time zone', true, null::text),
    ('customer_portal_appointments', 8, 'ends_at', 'timestamp with time zone', false, null::text),
    ('customer_portal_appointments', 9, 'timezone', 'text', true, '''UTC''::text'),
    ('customer_portal_appointments', 10, 'location', 'text', true, '''''::text'),
    ('customer_portal_appointments', 11, 'meeting_url', 'text', true, '''''::text'),
    ('customer_portal_appointments', 12, 'service_name', 'text', true, '''''::text'),
    ('customer_portal_appointments', 13, 'customer_visible_notes', 'text', true, '''''::text'),
    ('customer_portal_appointments', 14, 'reschedule_url', 'text', true, '''''::text'),
    ('customer_portal_appointments', 15, 'cancel_url', 'text', true, '''''::text'),
    ('customer_portal_appointments', 16, 'created_at', 'timestamp with time zone', true, 'now()'),
    ('customer_portal_appointments', 17, 'updated_at', 'timestamp with time zone', true, 'now()'),
    ('customer_portal_messages', 1, 'id', 'uuid', true, 'gen_random_uuid()'),
    ('customer_portal_messages', 2, 'business_id', 'uuid', true, null::text),
    ('customer_portal_messages', 3, 'customer_profile_id', 'uuid', true, null::text),
    ('customer_portal_messages', 4, 'sender_type', 'text', true, null::text),
    ('customer_portal_messages', 5, 'body', 'text', true, null::text),
    ('customer_portal_messages', 6, 'is_customer_visible', 'boolean', true, 'true'),
    ('customer_portal_messages', 7, 'human_support_requested', 'boolean', true, 'false'),
    ('customer_portal_messages', 8, 'created_at', 'timestamp with time zone', true, 'now()'),
    ('customer_portal_documents', 1, 'id', 'uuid', true, 'gen_random_uuid()'),
    ('customer_portal_documents', 2, 'business_id', 'uuid', true, null::text),
    ('customer_portal_documents', 3, 'customer_profile_id', 'uuid', true, null::text),
    ('customer_portal_documents', 4, 'document_type', 'text', true, null::text),
    ('customer_portal_documents', 5, 'title', 'text', true, null::text),
    ('customer_portal_documents', 6, 'storage_bucket', 'text', true, null::text),
    ('customer_portal_documents', 7, 'storage_path', 'text', true, null::text),
    ('customer_portal_documents', 8, 'mime_type', 'text', true, '''application/octet-stream''::text'),
    ('customer_portal_documents', 9, 'file_size', 'bigint', true, '0'),
    ('customer_portal_documents', 10, 'shared_at', 'timestamp with time zone', true, 'now()'),
    ('customer_portal_documents', 11, 'revoked_at', 'timestamp with time zone', false, null::text),
    ('customer_portal_documents', 12, 'created_at', 'timestamp with time zone', true, 'now()'),
    ('customer_portal_document_acknowledgements', 1, 'document_id', 'uuid', true, null::text),
    ('customer_portal_document_acknowledgements', 2, 'customer_profile_id', 'uuid', true, null::text),
    ('customer_portal_document_acknowledgements', 3, 'business_id', 'uuid', true, null::text),
    ('customer_portal_document_acknowledgements', 4, 'acknowledged_at', 'timestamp with time zone', true, 'now()'),
    ('customer_portal_requests', 1, 'id', 'uuid', true, 'gen_random_uuid()'),
    ('customer_portal_requests', 2, 'business_id', 'uuid', true, null::text),
    ('customer_portal_requests', 3, 'customer_profile_id', 'uuid', true, null::text),
    ('customer_portal_requests', 4, 'request_type', 'text', true, '''support''::text'),
    ('customer_portal_requests', 5, 'subject', 'text', true, null::text),
    ('customer_portal_requests', 6, 'status', 'text', true, '''open''::text'),
    ('customer_portal_requests', 7, 'customer_visible_detail', 'text', true, '''''::text'),
    ('customer_portal_requests', 8, 'created_at', 'timestamp with time zone', true, 'now()'),
    ('customer_portal_requests', 9, 'updated_at', 'timestamp with time zone', true, 'now()')
),
actual_portal_columns as (
  select
    c.relname::text as table_name,
    a.attnum::integer as ordinal_position,
    a.attname::text as column_name,
    pg_catalog.format_type(a.atttypid, a.atttypmod)::text as formatted_type,
    a.attnotnull as not_null,
    pg_catalog.pg_get_expr(d.adbin, d.adrelid, true)::text as default_expression
  from pg_catalog.pg_class as c
  join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
  join pg_catalog.pg_attribute as a on a.attrelid = c.oid
  left join pg_catalog.pg_attrdef as d
    on d.adrelid = c.oid and d.adnum = a.attnum
  join expected_portal_tables as expected on expected.table_name = c.relname
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and a.attnum > 0
    and not a.attisdropped
),
portal_column_differences as (
  (
    select * from expected_portal_columns
    except
    select * from actual_portal_columns
  )
  union all
  (
    select * from actual_portal_columns
    except
    select * from expected_portal_columns
  )
),
expected_portal_security_constraints(table_name, constraint_name) as (
  values
    ('customer_profiles', 'customer_profiles_full_name_length_check'),
    ('customer_profiles', 'customer_profiles_email_length_check'),
    ('customer_profiles', 'customer_profiles_phone_length_check'),
    ('customer_profiles', 'customer_profiles_language_format_check'),
    ('customer_profiles', 'customer_profiles_communication_format_check'),
    ('customer_profiles', 'customer_profiles_address_shape_check'),
    ('customer_profiles', 'customer_profiles_notification_shape_check'),
    ('customer_portal_invitations', 'customer_portal_invitations_token_hash_check'),
    ('customer_portal_invitations', 'customer_portal_invitations_expiry_check'),
    ('customer_portal_requests', 'customer_portal_requests_type_format_check'),
    ('customer_portal_requests', 'customer_portal_requests_subject_length_check'),
    ('customer_portal_requests', 'customer_portal_requests_detail_length_check')
),
portal_constraint_summary as (
  select
    pg_catalog.count(*)::integer as total_constraint_count,
    coalesce(pg_catalog.bool_and(constraint_row.convalidated), false)
      as every_constraint_validated,
    pg_catalog.count(*) filter (
      where expected.constraint_name is not null
    )::integer as required_security_constraint_count
  from pg_catalog.pg_constraint as constraint_row
  join pg_catalog.pg_class as relation on relation.oid = constraint_row.conrelid
  join pg_catalog.pg_namespace as namespace on namespace.oid = relation.relnamespace
  join expected_portal_tables as portal on portal.table_name = relation.relname
  left join expected_portal_security_constraints as expected
    on expected.table_name = relation.relname
   and expected.constraint_name = constraint_row.conname
  where namespace.nspname = 'public'
),
expected_portal_key_constraints(
  table_name,
  constraint_type,
  column_names
) as (
  values
    ('customer_profiles', 'p', 'id'),
    ('customer_profiles', 'u', 'auth_user_id,business_id'),
    ('customer_profiles', 'u', 'id,business_id'),
    ('customer_portal_invitations', 'p', 'id'),
    ('customer_portal_invitations', 'u', 'token_hash'),
    ('customer_portal_branding', 'p', 'business_id'),
    ('customer_portal_appointments', 'p', 'id'),
    ('customer_portal_messages', 'p', 'id'),
    ('customer_portal_documents', 'p', 'id'),
    ('customer_portal_documents', 'u', 'id,customer_profile_id,business_id'),
    ('customer_portal_document_acknowledgements', 'p',
      'document_id,customer_profile_id'),
    ('customer_portal_requests', 'p', 'id')
),
actual_portal_key_constraints as (
  select
    relation.relname::text as table_name,
    constraint_row.contype::text as constraint_type,
    pg_catalog.array_to_string(
      array(
        select attribute.attname::text
        from pg_catalog.unnest(constraint_row.conkey)
          with ordinality as key_column(attribute_number, position)
        join pg_catalog.pg_attribute as attribute
          on attribute.attrelid = constraint_row.conrelid
         and attribute.attnum = key_column.attribute_number
        order by key_column.position
      ),
      ','
    )::text as column_names
  from pg_catalog.pg_constraint as constraint_row
  join pg_catalog.pg_class as relation on relation.oid = constraint_row.conrelid
  join pg_catalog.pg_namespace as namespace on namespace.oid = relation.relnamespace
  join expected_portal_tables as portal on portal.table_name = relation.relname
  where namespace.nspname = 'public'
    and constraint_row.contype in ('p', 'u')
),
portal_key_constraint_differences as (
  (
    select * from expected_portal_key_constraints
    except
    select * from actual_portal_key_constraints
  )
  union all
  (
    select * from actual_portal_key_constraints
    except
    select * from expected_portal_key_constraints
  )
),
expected_portal_foreign_keys(
  table_name,
  column_names,
  referenced_schema,
  referenced_table,
  referenced_columns,
  update_action,
  delete_action,
  match_type
) as (
  values
    ('customer_profiles', 'business_id', 'public', 'businesses', 'id',
      'a', 'c', 's'),
    ('customer_profiles', 'auth_user_id', 'auth', 'users', 'id',
      'a', 'c', 's'),
    ('customer_profiles', 'lead_id,business_id', 'public', 'leads',
      'id,business_id', 'a', 'n', 's'),
    ('customer_portal_invitations', 'business_id', 'public', 'businesses',
      'id', 'a', 'c', 's'),
    ('customer_portal_invitations', 'lead_id,business_id', 'public', 'leads',
      'id,business_id', 'a', 'n', 's'),
    ('customer_portal_branding', 'business_id', 'public', 'businesses',
      'id', 'a', 'c', 's'),
    ('customer_portal_appointments', 'business_id', 'public', 'businesses',
      'id', 'a', 'c', 's'),
    ('customer_portal_appointments', 'customer_profile_id,business_id',
      'public', 'customer_profiles', 'id,business_id', 'a', 'c', 's'),
    ('customer_portal_messages', 'business_id', 'public', 'businesses',
      'id', 'a', 'c', 's'),
    ('customer_portal_messages', 'customer_profile_id,business_id',
      'public', 'customer_profiles', 'id,business_id', 'a', 'c', 's'),
    ('customer_portal_documents', 'business_id', 'public', 'businesses',
      'id', 'a', 'c', 's'),
    ('customer_portal_documents', 'customer_profile_id,business_id',
      'public', 'customer_profiles', 'id,business_id', 'a', 'c', 's'),
    ('customer_portal_document_acknowledgements',
      'document_id,customer_profile_id,business_id', 'public',
      'customer_portal_documents', 'id,customer_profile_id,business_id',
      'a', 'c', 's'),
    ('customer_portal_requests', 'business_id', 'public', 'businesses',
      'id', 'a', 'c', 's'),
    ('customer_portal_requests', 'customer_profile_id,business_id',
      'public', 'customer_profiles', 'id,business_id', 'a', 'c', 's')
),
actual_portal_foreign_keys as (
  select
    relation.relname::text as table_name,
    pg_catalog.array_to_string(
      array(
        select attribute.attname::text
        from pg_catalog.unnest(constraint_row.conkey)
          with ordinality as key_column(attribute_number, position)
        join pg_catalog.pg_attribute as attribute
          on attribute.attrelid = constraint_row.conrelid
         and attribute.attnum = key_column.attribute_number
        order by key_column.position
      ),
      ','
    )::text as column_names,
    referenced_namespace.nspname::text as referenced_schema,
    referenced_relation.relname::text as referenced_table,
    pg_catalog.array_to_string(
      array(
        select attribute.attname::text
        from pg_catalog.unnest(constraint_row.confkey)
          with ordinality as key_column(attribute_number, position)
        join pg_catalog.pg_attribute as attribute
          on attribute.attrelid = constraint_row.confrelid
         and attribute.attnum = key_column.attribute_number
        order by key_column.position
      ),
      ','
    )::text as referenced_columns,
    constraint_row.confupdtype::text as update_action,
    constraint_row.confdeltype::text as delete_action,
    constraint_row.confmatchtype::text as match_type
  from pg_catalog.pg_constraint as constraint_row
  join pg_catalog.pg_class as relation on relation.oid = constraint_row.conrelid
  join pg_catalog.pg_namespace as namespace on namespace.oid = relation.relnamespace
  join pg_catalog.pg_class as referenced_relation
    on referenced_relation.oid = constraint_row.confrelid
  join pg_catalog.pg_namespace as referenced_namespace
    on referenced_namespace.oid = referenced_relation.relnamespace
  join expected_portal_tables as portal on portal.table_name = relation.relname
  where namespace.nspname = 'public'
    and constraint_row.contype = 'f'
),
portal_foreign_key_differences as (
  (
    select * from expected_portal_foreign_keys
    except
    select * from actual_portal_foreign_keys
  )
  union all
  (
    select * from actual_portal_foreign_keys
    except
    select * from expected_portal_foreign_keys
  )
),
expected_portal_set_null_columns(
  table_name,
  constraint_name,
  set_null_columns
) as (
  values
    ('customer_profiles', 'customer_profiles_lead_business_fk', 'lead_id'),
    ('customer_portal_invitations',
      'customer_portal_invitations_lead_business_fk', 'lead_id')
),
actual_portal_set_null_columns as (
  select
    relation.relname::text as table_name,
    constraint_row.conname::text as constraint_name,
    pg_catalog.array_to_string(
      array(
        select attribute.attname::text
        from pg_catalog.unnest(constraint_row.confdelsetcols)
          with ordinality as set_column(attribute_number, position)
        join pg_catalog.pg_attribute as attribute
          on attribute.attrelid = constraint_row.conrelid
         and attribute.attnum = set_column.attribute_number
        order by set_column.position
      ),
      ','
    )::text as set_null_columns
  from pg_catalog.pg_constraint as constraint_row
  join pg_catalog.pg_class as relation on relation.oid = constraint_row.conrelid
  join pg_catalog.pg_namespace as namespace on namespace.oid = relation.relnamespace
  where namespace.nspname = 'public'
    and constraint_row.conname in (
      'customer_profiles_lead_business_fk',
      'customer_portal_invitations_lead_business_fk'
    )
    and constraint_row.contype = 'f'
    and constraint_row.confdeltype = 'n'
),
portal_set_null_column_differences as (
  (
    select * from expected_portal_set_null_columns
    except
    select * from actual_portal_set_null_columns
  )
  union all
  (
    select * from actual_portal_set_null_columns
    except
    select * from expected_portal_set_null_columns
  )
),
expected_portal_check_constraints(
  table_name,
  constraint_name,
  canonical_definition
) as (
  values
    ('customer_profiles', 'customer_profiles_status_check',
      'checkstatus=anyarray[''invited'',''active'',''suspended'']'),
    ('customer_profiles', 'customer_profiles_full_name_length_check',
      'checkchar_lengthfull_name<=200'),
    ('customer_profiles', 'customer_profiles_email_length_check',
      'checkchar_lengthemail<=320'),
    ('customer_profiles', 'customer_profiles_phone_length_check',
      'checkchar_lengthphone<=64'),
    ('customer_profiles', 'customer_profiles_language_format_check',
      'checkchar_lengthpreferred_language>=2andchar_lengthpreferred_language<=35andpreferred_language~''^[a-za-z]{2,3}-[a-za-z0-9]{2,8}*$'''),
    ('customer_profiles', 'customer_profiles_communication_format_check',
      'checkcommunication_preference~''^[a-z][a-z0-9_-]{0,63}$'''),
    ('customer_profiles', 'customer_profiles_address_shape_check',
      'checkjsonb_typeofaddress=''object''andoctet_lengthaddress<=20000'),
    ('customer_profiles', 'customer_profiles_notification_shape_check',
      'checkjsonb_typeofnotification_preferences=''object''andoctet_lengthnotification_preferences<=20000'),
    ('customer_portal_invitations', 'customer_portal_invitations_token_hash_check',
      'checktoken_hash~''^[0-9a-f]{64}$'''),
    ('customer_portal_invitations', 'customer_portal_invitations_expiry_check',
      'checkexpires_at>created_at'),
    ('customer_portal_appointments', 'customer_portal_appointments_status_check',
      'checkstatus=anyarray[''scheduled'',''confirmed'',''completed'',''cancelled'',''no_show'']'),
    ('customer_portal_messages', 'customer_portal_messages_sender_check',
      'checksender_type=anyarray[''customer'',''ai'',''human'']'),
    ('customer_portal_messages', 'customer_portal_messages_body_check',
      'checkchar_lengthbtrimbody>=1andchar_lengthbtrimbody<=10000'),
    ('customer_portal_documents', 'customer_portal_documents_type_check',
      'checkdocument_type=anyarray[''quote'',''invoice'',''instructions'',''contract'',''report'',''receipt'',''form'',''other'']'),
    ('customer_portal_requests', 'customer_portal_requests_status_check',
      'checkstatus=anyarray[''open'',''in_progress'',''resolved'',''closed'']'),
    ('customer_portal_requests', 'customer_portal_requests_type_format_check',
      'checkrequest_type~''^[a-z][a-z0-9_-]{0,63}$'''),
    ('customer_portal_requests', 'customer_portal_requests_subject_length_check',
      'checkchar_lengthbtrimsubject>=1andchar_lengthbtrimsubject<=200'),
    ('customer_portal_requests', 'customer_portal_requests_detail_length_check',
      'checkchar_lengthcustomer_visible_detail<=5000')
),
actual_portal_check_constraints as (
  select
    relation.relname::text as table_name,
    constraint_row.conname::text as constraint_name,
    pg_catalog.regexp_replace(
      pg_catalog.replace(
        pg_catalog.replace(
          pg_catalog.replace(
            pg_catalog.lower(
              pg_catalog.pg_get_constraintdef(constraint_row.oid, true)
            ),
            'pg_catalog.',
            ''
          ),
          'public.',
          ''
        ),
        '::text',
        ''
      ),
      '[[:space:]()]',
      '',
      'g'
    )::text as canonical_definition
  from pg_catalog.pg_constraint as constraint_row
  join pg_catalog.pg_class as relation on relation.oid = constraint_row.conrelid
  join pg_catalog.pg_namespace as namespace on namespace.oid = relation.relnamespace
  join expected_portal_tables as portal on portal.table_name = relation.relname
  where namespace.nspname = 'public'
    and constraint_row.contype = 'c'
    and constraint_row.convalidated
),
portal_check_constraint_differences as (
  (
    select * from expected_portal_check_constraints
    except
    select * from actual_portal_check_constraints
  )
  union all
  (
    select * from actual_portal_check_constraints
    except
    select * from expected_portal_check_constraints
  )
),
expected_portal_explicit_indexes(index_name, canonical_definition) as (
  values
    ('customer_profiles_business_idx'::text,
      'createindexcustomer_profiles_business_idxoncustomer_profilesusingbtreebusiness_id'::text),
    ('customer_portal_invitations_business_email_idx',
      'createindexcustomer_portal_invitations_business_email_idxoncustomer_portal_invitationsusingbtreebusiness_id,loweremail'),
    ('customer_portal_appointments_customer_starts_idx',
      'createindexcustomer_portal_appointments_customer_starts_idxoncustomer_portal_appointmentsusingbtreecustomer_profile_id,starts_atdesc'),
    ('customer_portal_messages_customer_created_idx',
      'createindexcustomer_portal_messages_customer_created_idxoncustomer_portal_messagesusingbtreecustomer_profile_id,created_atdesc'),
    ('customer_portal_documents_customer_shared_idx',
      'createindexcustomer_portal_documents_customer_shared_idxoncustomer_portal_documentsusingbtreecustomer_profile_id,shared_atdescwhererevoked_atisnull'),
    ('customer_portal_requests_customer_status_idx',
      'createindexcustomer_portal_requests_customer_status_idxoncustomer_portal_requestsusingbtreecustomer_profile_id,status,created_atdesc')
),
portal_index_summary as (
  select
    pg_catalog.count(*)::integer as total_index_count,
    pg_catalog.count(*) filter (
      where expected.index_name is not null
    )::integer as required_explicit_index_count
  from pg_catalog.pg_indexes as indexes
  join expected_portal_tables as portal on portal.table_name = indexes.tablename
  left join expected_portal_explicit_indexes as expected
    on expected.index_name = indexes.indexname
   and expected.canonical_definition = pg_catalog.regexp_replace(
     pg_catalog.replace(pg_catalog.lower(indexes.indexdef), 'public.', ''),
     '[[:space:]()]',
     '',
     'g'
   )
  where indexes.schemaname = 'public'
),
portal_trigger_summary as (
  select
    pg_catalog.count(*)::integer as noninternal_trigger_count,
    pg_catalog.count(*) filter (
      where relation.relname = 'customer_profiles'
        and trigger_row.tgname = 'customer_profiles_set_updated_at'
        and trigger_row.tgfoid = pg_catalog.to_regprocedure(
          'public.set_customer_profile_updated_at()'
        )
        and trigger_row.tgenabled = 'O'
        and pg_catalog.regexp_replace(
          pg_catalog.replace(
            pg_catalog.lower(pg_catalog.pg_get_triggerdef(trigger_row.oid, true)),
            'public.',
            ''
          ),
          '[[:space:]()]',
          '',
          'g'
        ) = 'createtriggercustomer_profiles_set_updated_atbeforeupdateoncustomer_profilesforeachrowexecutefunctionset_customer_profile_updated_at'
    )::integer as trusted_trigger_count
  from pg_catalog.pg_trigger as trigger_row
  join pg_catalog.pg_class as relation on relation.oid = trigger_row.tgrelid
  join pg_catalog.pg_namespace as namespace on namespace.oid = relation.relnamespace
  join expected_portal_tables as portal on portal.table_name = relation.relname
  where namespace.nspname = 'public'
    and not trigger_row.tgisinternal
),
portal_table_state as (
  select
    expected.table_name,
    c.oid as table_oid,
    c.relowner as table_owner_oid,
    owner_role.rolname::text as table_owner,
    coalesce(c.relrowsecurity, false) as rls_enabled,
    coalesce(c.relforcerowsecurity, false) as rls_forced
  from expected_portal_tables as expected
  left join pg_catalog.pg_namespace as n on n.nspname = 'public'
  left join pg_catalog.pg_class as c
    on c.relnamespace = n.oid
   and c.relname = expected.table_name
   and c.relkind in ('r', 'p')
  left join pg_catalog.pg_roles as owner_role on owner_role.oid = c.relowner
),
expected_portal_functions(
  function_identity,
  identity_arguments,
  result_type,
  owner_name,
  language_name,
  security_definer,
  volatility,
  configuration,
  normalized_source_hash
) as (
  values
    ('public.is_current_portal_customer(uuid,uuid)',
      'target_customer_profile_id uuid, target_business_id uuid',
      'boolean', 'postgres', 'sql', true, 's', 'search_path=pg_catalog',
      'dacab59afbd772e965c6d7a3d289026b'),
    ('public.is_current_portal_document(uuid,uuid,uuid)',
      'target_document_id uuid, target_customer_profile_id uuid, target_business_id uuid',
      'boolean', 'postgres', 'sql', true, 's', 'search_path=pg_catalog',
      'b80ff54e968dcf6fc691f77716d87d5e'),
    ('public.set_customer_profile_updated_at()',
      '', 'trigger', 'postgres', 'plpgsql', false, 'v',
      'search_path=pg_catalog', '4b908169ae7443fef47ac44b73795e68'),
    ('public.redeem_customer_portal_invitation(text,uuid)',
      'p_token_hash text, p_auth_user_id uuid',
      'TABLE(customer_profile_id uuid, business_id uuid)',
      'postgres', 'plpgsql', true, 'v', 'search_path=pg_catalog',
      'f907afb085aacdcd5c26fbd5b904e952')
),
actual_portal_functions as (
  select
    pg_catalog.format(
      '%I.%I(%s)', n.nspname, p.proname,
      pg_catalog.replace(pg_catalog.oidvectortypes(p.proargtypes), ', ', ',')
    )::text as function_identity,
    pg_catalog.pg_get_function_identity_arguments(p.oid)::text as identity_arguments,
    pg_catalog.pg_get_function_result(p.oid)::text as result_type,
    owner_role.rolname::text as owner_name,
    language.lanname::text as language_name,
    p.prosecdef as security_definer,
    p.provolatile::text as volatility,
    pg_catalog.array_to_string(p.proconfig, ',')::text as configuration,
    pg_catalog.md5(
      pg_catalog.replace(
        pg_catalog.replace(p.prosrc, E'\r\n', E'\n'),
        E'\r', E'\n'
      )
    ) as normalized_source_hash,
    p.oid as function_oid,
    p.proowner as function_owner
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
  join pg_catalog.pg_roles as owner_role on owner_role.oid = p.proowner
  join pg_catalog.pg_language as language on language.oid = p.prolang
  where n.nspname = 'public'
    and p.proname in (
      'is_current_portal_customer',
      'is_current_portal_document',
      'set_customer_profile_updated_at',
      'redeem_customer_portal_invitation'
    )
),
portal_function_contract_differences as (
  (
    select
      function_identity, identity_arguments, result_type, owner_name,
      language_name, security_definer, volatility, configuration,
      normalized_source_hash
    from expected_portal_functions
    except
    select
      function_identity, identity_arguments, result_type, owner_name,
      language_name, security_definer, volatility, configuration,
      normalized_source_hash
    from actual_portal_functions
  )
  union all
  (
    select
      function_identity, identity_arguments, result_type, owner_name,
      language_name, security_definer, volatility, configuration,
      normalized_source_hash
    from actual_portal_functions
    except
    select
      function_identity, identity_arguments, result_type, owner_name,
      language_name, security_definer, volatility, configuration,
      normalized_source_hash
    from expected_portal_functions
  )
),
expected_portal_function_acl(function_identity, grantee, is_grantable) as (
  values
    ('public.is_current_portal_customer(uuid,uuid)', 'postgres', false),
    ('public.is_current_portal_customer(uuid,uuid)', 'authenticated', false),
    ('public.is_current_portal_document(uuid,uuid,uuid)', 'postgres', false),
    ('public.is_current_portal_document(uuid,uuid,uuid)', 'authenticated', false),
    ('public.set_customer_profile_updated_at()', 'postgres', false),
    ('public.redeem_customer_portal_invitation(text,uuid)', 'postgres', false),
    ('public.redeem_customer_portal_invitation(text,uuid)', 'service_role', false)
),
actual_portal_function_acl as (
  select
    functions.function_identity,
    case
      when acl.grantee = 0 then 'PUBLIC'
      else coalesce(
        grantee_role.rolname::text,
        pg_catalog.format('OID:%s', acl.grantee)
      )
    end::text as grantee,
    acl.is_grantable
  from actual_portal_functions as functions
  join pg_catalog.pg_proc as p on p.oid = functions.function_oid
  cross join lateral pg_catalog.aclexplode(
    coalesce(p.proacl, pg_catalog.acldefault('f', p.proowner))
  ) as acl
  left join pg_catalog.pg_roles as grantee_role on grantee_role.oid = acl.grantee
  where acl.privilege_type = 'EXECUTE'
),
portal_function_acl_differences as (
  (
    select * from expected_portal_function_acl
    except
    select * from actual_portal_function_acl
  )
  union all
  (
    select * from actual_portal_function_acl
    except
    select * from expected_portal_function_acl
  )
),
expected_portal_policies(
  table_name,
  policy_name,
  command_name,
  canonical_using,
  canonical_check
) as (
  values
    ('customer_profiles', 'customer_profiles_customer_select', 'SELECT',
      'is_current_portal_customerid,business_id', ''),
    ('customer_profiles', 'customer_profiles_customer_update', 'UPDATE',
      'is_current_portal_customerid,business_id',
      'is_current_portal_customerid,business_id'),
    ('customer_portal_branding', 'customer_portal_branding_customer_select', 'SELECT',
      'existsselect1fromcustomer_profilescpwherecp.business_id=customer_portal_branding.business_idandis_current_portal_customercp.id,cp.business_id', ''),
    ('customer_portal_appointments', 'customer_portal_appointments_customer_select', 'SELECT',
      'is_current_portal_customercustomer_profile_id,business_id', ''),
    ('customer_portal_messages', 'customer_portal_messages_customer_select', 'SELECT',
      'is_customer_visibleandis_current_portal_customercustomer_profile_id,business_id', ''),
    ('customer_portal_messages', 'customer_portal_messages_customer_insert', 'INSERT',
      '', 'sender_type=''customer''andis_customer_visibleandis_current_portal_customercustomer_profile_id,business_id'),
    ('customer_portal_documents', 'customer_portal_documents_customer_select', 'SELECT',
      'revoked_atisnullandis_current_portal_customercustomer_profile_id,business_id', ''),
    ('customer_portal_document_acknowledgements', 'customer_portal_document_ack_customer_select', 'SELECT',
      'is_current_portal_documentdocument_id,customer_profile_id,business_id', ''),
    ('customer_portal_document_acknowledgements', 'customer_portal_document_ack_customer_insert', 'INSERT',
      '', 'is_current_portal_documentdocument_id,customer_profile_id,business_id'),
    ('customer_portal_requests', 'customer_portal_requests_customer_select', 'SELECT',
      'is_current_portal_customercustomer_profile_id,business_id', ''),
    ('customer_portal_requests', 'customer_portal_requests_customer_insert', 'INSERT',
      '', 'status=''open''andis_current_portal_customercustomer_profile_id,business_id')
),
actual_portal_policies as (
  select
    p.tablename::text as table_name,
    p.policyname::text as policy_name,
    p.cmd::text as command_name,
    pg_catalog.regexp_replace(
      pg_catalog.replace(
        pg_catalog.replace(pg_catalog.lower(coalesce(p.qual, '')),
          'public.', ''),
        '::text', ''
      ),
      '[[:space:]()]', '', 'g'
    )::text as canonical_using,
    pg_catalog.regexp_replace(
      pg_catalog.replace(
        pg_catalog.replace(pg_catalog.lower(coalesce(p.with_check, '')),
          'public.', ''),
        '::text', ''
      ),
      '[[:space:]()]', '', 'g'
    )::text as canonical_check
  from pg_catalog.pg_policies as p
  join expected_portal_tables as expected on expected.table_name = p.tablename
  where p.schemaname = 'public'
    and p.permissive = 'PERMISSIVE'
    and pg_catalog.array_to_string(p.roles, ',') = 'authenticated'
),
portal_policy_differences as (
  (
    select * from expected_portal_policies
    except
    select * from actual_portal_policies
  )
  union all
  (
    select * from actual_portal_policies
    except
    select * from expected_portal_policies
  )
),
portal_nonconforming_policy_count as (
  select pg_catalog.count(*)::integer as row_count
  from pg_catalog.pg_policies as p
  join expected_portal_tables as expected on expected.table_name = p.tablename
  where p.schemaname = 'public'
    and (
      p.permissive <> 'PERMISSIVE'
      or pg_catalog.array_to_string(p.roles, ',') <> 'authenticated'
    )
),
portal_browser_roles as (
  select
    role_name,
    case
      when role_name = 'PUBLIC' then null::oid
      else pg_catalog.to_regrole(role_name)::oid
    end as role_oid,
    role_name = 'PUBLIC' or pg_catalog.to_regrole(role_name) is not null
      as role_exists
  from (
    values ('PUBLIC'::text), ('anon'::text), ('authenticated'::text)
  ) as roles(role_name)
),
portal_table_privilege_names(privilege_name) as (
  values
    ('SELECT'::text), ('INSERT'::text), ('UPDATE'::text), ('DELETE'::text),
    ('TRUNCATE'::text), ('REFERENCES'::text), ('TRIGGER'::text),
    ('MAINTAIN'::text)
),
portal_table_acl_matrix as (
  select
    state.table_name,
    roles.role_name,
    privileges.privilege_name,
    state.table_oid is not null as table_exists,
    roles.role_exists,
    case
      when roles.role_name = 'PUBLIC' then exists (
        select 1
        from pg_catalog.pg_class as relation
        cross join lateral pg_catalog.aclexplode(
          coalesce(
            relation.relacl,
            pg_catalog.acldefault('r', relation.relowner)
          )
        ) as acl
        where relation.oid = state.table_oid
          and acl.grantee = 0
          and acl.privilege_type = privileges.privilege_name
      )
      else coalesce(
        pg_catalog.has_table_privilege(
          roles.role_oid,
          state.table_oid,
          privileges.privilege_name
        ),
        false
      )
    end as has_privilege,
    exists (
      select 1
      from pg_catalog.pg_class as relation
      cross join lateral pg_catalog.aclexplode(
        coalesce(
          relation.relacl,
          pg_catalog.acldefault('r', relation.relowner)
        )
      ) as acl
      where relation.oid = state.table_oid
        and acl.grantee = case
          when roles.role_name = 'PUBLIC' then 0::oid else roles.role_oid
        end
        and acl.privilege_type = privileges.privilege_name
        and acl.is_grantable
    ) as has_grant_option
  from portal_table_state as state
  cross join portal_browser_roles as roles
  cross join portal_table_privilege_names as privileges
),
unexpected_portal_table_acl as (
  select
    state.table_name,
    acl.grantee,
    acl.privilege_type,
    acl.is_grantable
  from portal_table_state as state
  join pg_catalog.pg_class as relation on relation.oid = state.table_oid
  cross join lateral pg_catalog.aclexplode(
    coalesce(relation.relacl, pg_catalog.acldefault('r', relation.relowner))
  ) as acl
  where acl.grantee <> relation.relowner
    and acl.grantee <> 0
    and not exists (
      select 1
      from pg_catalog.pg_roles as allowed_role
      where allowed_role.oid = acl.grantee
        and allowed_role.rolname in ('anon', 'authenticated', 'service_role')
    )
),
portal_column_privilege_names(privilege_name) as (
  values
    ('SELECT'::text), ('INSERT'::text), ('UPDATE'::text),
    ('REFERENCES'::text)
),
expected_portal_column_acl as (
  select
    columns.table_name,
    columns.column_name,
    roles.role_name,
    privileges.privilege_name,
    case
      when roles.role_name in ('PUBLIC', 'anon') then false
      when roles.role_name = 'authenticated' then
        (
          privileges.privilege_name = 'SELECT'
          and (
            (columns.table_name = 'customer_profiles'
              and columns.column_name in (
                'id', 'business_id', 'full_name', 'email', 'phone',
                'preferred_language', 'communication_preference', 'address',
                'notification_preferences', 'updated_at'
              ))
            or (columns.table_name = 'customer_portal_branding')
            or (columns.table_name = 'customer_portal_appointments'
              and columns.column_name in (
                'id', 'business_id', 'customer_profile_id', 'status',
                'starts_at', 'ends_at', 'timezone', 'location', 'meeting_url',
                'service_name', 'customer_visible_notes', 'reschedule_url',
                'cancel_url', 'updated_at'
              ))
            or (columns.table_name = 'customer_portal_messages'
              and columns.column_name in (
                'id', 'business_id', 'customer_profile_id', 'sender_type',
                'body', 'human_support_requested', 'created_at'
              ))
            or (columns.table_name = 'customer_portal_documents'
              and columns.column_name in (
                'id', 'business_id', 'customer_profile_id', 'document_type',
                'title', 'mime_type', 'file_size', 'shared_at'
              ))
            or (columns.table_name =
                  'customer_portal_document_acknowledgements')
            or (columns.table_name = 'customer_portal_requests')
          )
        )
        or (
          privileges.privilege_name = 'INSERT'
          and (
            (columns.table_name = 'customer_portal_messages'
              and columns.column_name in (
                'business_id', 'customer_profile_id', 'sender_type', 'body',
                'human_support_requested'
              ))
            or (columns.table_name =
                  'customer_portal_document_acknowledgements'
              and columns.column_name in (
                'document_id', 'customer_profile_id', 'business_id'
              ))
            or (columns.table_name = 'customer_portal_requests'
              and columns.column_name in (
                'business_id', 'customer_profile_id', 'request_type',
                'subject', 'customer_visible_detail'
              ))
          )
        )
        or (
          privileges.privilege_name = 'UPDATE'
          and columns.table_name = 'customer_profiles'
          and columns.column_name in (
            'full_name', 'email', 'phone', 'preferred_language',
            'communication_preference', 'address',
            'notification_preferences'
          )
        )
      else false
    end as expected_has_privilege
  from actual_portal_columns as columns
  cross join portal_browser_roles as roles
  cross join portal_column_privilege_names as privileges
),
portal_column_acl_matrix as (
  select
    expected.table_name,
    expected.column_name,
    expected.role_name,
    expected.privilege_name,
    roles.role_exists,
    case
      when expected.role_name = 'PUBLIC' then
        exists (
          select 1
          from pg_catalog.pg_class as relation
          cross join lateral pg_catalog.aclexplode(
            coalesce(
              relation.relacl,
              pg_catalog.acldefault('r', relation.relowner)
            )
          ) as acl
          where relation.oid = state.table_oid
            and acl.grantee = 0
            and acl.privilege_type = expected.privilege_name
        )
        or exists (
          select 1
          from pg_catalog.aclexplode(attribute.attacl) as acl
          where acl.grantee = 0
            and acl.privilege_type = expected.privilege_name
        )
      else coalesce(
        pg_catalog.has_column_privilege(
          roles.role_oid,
          state.table_oid,
          columns.ordinal_position::smallint,
          expected.privilege_name
        ),
        false
      )
    end as has_privilege,
    (
      exists (
        select 1
        from pg_catalog.pg_class as relation
        cross join lateral pg_catalog.aclexplode(
          coalesce(
            relation.relacl,
            pg_catalog.acldefault('r', relation.relowner)
          )
        ) as acl
        where relation.oid = state.table_oid
          and acl.grantee = case
            when expected.role_name = 'PUBLIC' then 0::oid else roles.role_oid
          end
          and acl.privilege_type = expected.privilege_name
          and acl.is_grantable
      )
      or exists (
        select 1
        from pg_catalog.aclexplode(attribute.attacl) as acl
        where acl.grantee = case
            when expected.role_name = 'PUBLIC' then 0::oid else roles.role_oid
          end
          and acl.privilege_type = expected.privilege_name
          and acl.is_grantable
      )
    ) as has_grant_option,
    expected.expected_has_privilege
  from expected_portal_column_acl as expected
  join actual_portal_columns as columns
    on columns.table_name = expected.table_name
   and columns.column_name = expected.column_name
  join portal_table_state as state on state.table_name = expected.table_name
  join portal_browser_roles as roles on roles.role_name = expected.role_name
  join pg_catalog.pg_attribute as attribute
    on attribute.attrelid = state.table_oid
   and attribute.attnum = columns.ordinal_position
),
unexpected_portal_column_acl as (
  select
    state.table_name,
    attribute.attname::text as column_name,
    acl.grantee,
    acl.privilege_type,
    acl.is_grantable
  from portal_table_state as state
  join pg_catalog.pg_attribute as attribute
    on attribute.attrelid = state.table_oid
   and attribute.attnum > 0
   and not attribute.attisdropped
  cross join lateral pg_catalog.aclexplode(attribute.attacl) as acl
  where acl.grantee <> state.table_owner_oid
    and acl.grantee <> 0
    and not exists (
      select 1
      from pg_catalog.pg_roles as allowed_role
      where allowed_role.oid = acl.grantee
        and allowed_role.rolname in ('anon', 'authenticated', 'service_role')
    )
),
expected_knowledge_functions(
  function_identity,
  owner_name,
  language_name,
  security_definer,
  volatility,
  configuration,
  normalized_definition_hash
) as (
  values
    ('public.activate_knowledge_file_version(uuid,uuid)',
      'postgres', 'plpgsql', true, 'v', 'search_path=pg_catalog',
      'bfe383cfbdf706d683d8693484e51c2a'),
    ('public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)',
      'postgres', 'plpgsql', true, 'v', 'search_path=pg_catalog',
      '16aed544c62caf75c68fe55759c371a8'),
    ('public.search_knowledge_chunks(uuid,text,integer)',
      'postgres', 'sql', true, 's', 'search_path=public',
      '3cfab9ae525b9a01d972f94159dba13c')
),
actual_knowledge_functions as (
  select
    pg_catalog.format(
      '%I.%I(%s)', n.nspname, p.proname,
      pg_catalog.replace(pg_catalog.oidvectortypes(p.proargtypes), ', ', ',')
    )::text as function_identity,
    owner_role.rolname::text as owner_name,
    language.lanname::text as language_name,
    p.prosecdef as security_definer,
    p.provolatile::text as volatility,
    pg_catalog.array_to_string(p.proconfig, ',')::text as configuration,
    pg_catalog.md5(
      pg_catalog.replace(
        pg_catalog.replace(
          pg_catalog.pg_get_functiondef(p.oid), E'\r\n', E'\n'
        ),
        E'\r', E'\n'
      )
    ) as normalized_definition_hash
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
  join pg_catalog.pg_roles as owner_role on owner_role.oid = p.proowner
  join pg_catalog.pg_language as language on language.oid = p.prolang
  where n.nspname = 'public'
    and p.proname in (
      'activate_knowledge_file_version',
      'replace_knowledge_file_chunks',
      'search_knowledge_chunks'
    )
),
knowledge_function_differences as (
  (
    select * from expected_knowledge_functions
    except
    select * from actual_knowledge_functions
  )
  union all
  (
    select * from actual_knowledge_functions
    except
    select * from expected_knowledge_functions
  )
),
expected_knowledge_indexes(table_name, index_count, fingerprint) as (
  values
    ('knowledge_chunks', 6, 'd5fd3b45571b42691b2e894dea66ca58'),
    ('knowledge_files', 7, 'e5f57dd4b2145f5ad1a0085447b8a64b'),
    ('knowledge_items', 3, 'b3690d86eb2341cd2ae309d9042b37e5')
),
actual_knowledge_indexes as (
  select
    indexes.tablename::text as table_name,
    pg_catalog.count(*)::integer as index_count,
    pg_catalog.md5(
      pg_catalog.string_agg(
        pg_catalog.concat_ws('|', indexes.indexname, indexes.indexdef),
        E'\n' order by indexes.indexname
      )
    ) as fingerprint
  from pg_catalog.pg_indexes as indexes
  where indexes.schemaname = 'public'
    and indexes.tablename in (
      'knowledge_chunks', 'knowledge_files', 'knowledge_items'
    )
  group by indexes.tablename
),
knowledge_index_differences as (
  (
    select * from expected_knowledge_indexes
    except
    select * from actual_knowledge_indexes
  )
  union all
  (
    select * from actual_knowledge_indexes
    except
    select * from expected_knowledge_indexes
  )
),
expected_storage_policies(
  schema_name,
  table_name,
  policy_name,
  command_name,
  role_names,
  permissive,
  body_hash
) as (
  values
    ('storage', 'objects', 'knowledge_files_storage_delete_owned',
      'DELETE', 'authenticated', true,
      '6dee25484e5cc79a72418753eb6688b2'),
    ('storage', 'objects', 'knowledge_files_storage_insert_owned',
      'INSERT', 'authenticated', true,
      '6dee25484e5cc79a72418753eb6688b2'),
    ('storage', 'objects', 'knowledge_files_storage_select_owned',
      'SELECT', 'authenticated', true,
      '6dee25484e5cc79a72418753eb6688b2'),
    ('storage', 'objects', 'knowledge_files_storage_update_owned',
      'UPDATE', 'authenticated', true,
      '0a1d681815fbc10df30e4b797212b88d')
),
actual_storage_policies as (
  select
    n.nspname::text as schema_name,
    c.relname::text as table_name,
    pol.polname::text as policy_name,
    case pol.polcmd
      when 'r' then 'SELECT'
      when 'a' then 'INSERT'
      when 'w' then 'UPDATE'
      when 'd' then 'DELETE'
      when '*' then 'ALL'
    end::text as command_name,
    pg_catalog.array_to_string(
      array(
        select case
          when role_entry.role_oid = 0 then 'PUBLIC'
          else role_name.rolname
        end
        from pg_catalog.unnest(pol.polroles) as role_entry(role_oid)
        left join pg_catalog.pg_roles as role_name
          on role_name.oid = role_entry.role_oid
        order by case
          when role_entry.role_oid = 0 then 'PUBLIC'
          else role_name.rolname
        end
      ),
      ','
    )::text as role_names,
    pol.polpermissive as permissive,
    pg_catalog.md5(
      pg_catalog.concat_ws(
        E'\n',
        pg_catalog.pg_get_expr(pol.polqual, pol.polrelid, true),
        pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid, true)
      )
    ) as body_hash
  from pg_catalog.pg_policy as pol
  join pg_catalog.pg_class as c on c.oid = pol.polrelid
  join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
  where n.nspname = 'storage'
    and c.relname = 'objects'
),
storage_policy_differences as (
  (
    select * from expected_storage_policies
    except
    select * from actual_storage_policies
  )
  union all
  (
    select * from actual_storage_policies
    except
    select * from expected_storage_policies
  )
),
expected_api_roles(role_name) as (
  values
    ('PUBLIC'::text),
    ('anon'::text),
    ('authenticated'::text),
    ('service_role'::text)
),
resolved_api_roles as (
  select
    expected.role_name,
    case
      when expected.role_name = 'PUBLIC' then null::oid
      else pg_catalog.to_regrole(expected.role_name)::oid
    end as role_oid,
    expected.role_name = 'PUBLIC'
      or pg_catalog.to_regrole(expected.role_name) is not null as role_exists
  from expected_api_roles as expected
),
table_privilege_names(privilege_name) as (
  values
    ('SELECT'::text), ('INSERT'::text), ('UPDATE'::text), ('DELETE'::text),
    ('TRUNCATE'::text), ('REFERENCES'::text), ('TRIGGER'::text),
    ('MAINTAIN'::text)
),
expected_table_privileges as (
  select
    tables.table_name,
    roles.role_name,
    privileges.privilege_name,
    case
      when roles.role_name in ('PUBLIC', 'anon') then false
      when roles.role_name = 'authenticated' then
        privileges.privilege_name = 'SELECT'
        or (
          privileges.privilege_name = 'DELETE'
          and tables.table_name in ('business_members', 'leads')
        )
      when roles.role_name = 'service_role' then
        privileges.privilege_name in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
      else false
    end as expected_has_privilege
  from expected_workspace_tables as tables
  cross join expected_api_roles as roles
  cross join table_privilege_names as privileges
),
actual_table_privileges as (
  select
    expected.table_name,
    expected.role_name,
    expected.privilege_name,
    state.table_oid is not null as table_exists,
    roles.role_exists,
    case
      when expected.role_name = 'PUBLIC' then exists (
        select 1
        from pg_catalog.pg_class as c
        cross join lateral pg_catalog.aclexplode(
          coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
        ) as acl
        where c.oid = state.table_oid
          and acl.grantee = 0
          and acl.privilege_type = expected.privilege_name
      )
      else coalesce(
        pg_catalog.has_table_privilege(
          roles.role_oid,
          state.table_oid,
          expected.privilege_name
        ),
        false
      )
    end as has_privilege,
    exists (
      select 1
      from pg_catalog.pg_class as c
      cross join lateral pg_catalog.aclexplode(
        coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
      ) as acl
      where c.oid = state.table_oid
        and acl.grantee = case
          when expected.role_name = 'PUBLIC' then 0::oid
          else roles.role_oid
        end
        and acl.privilege_type = expected.privilege_name
        and acl.is_grantable
    ) as has_grant_option,
    expected.expected_has_privilege
  from expected_table_privileges as expected
  join workspace_table_state as state on state.table_name = expected.table_name
  join resolved_api_roles as roles on roles.role_name = expected.role_name
),
unexpected_table_acl as (
  select
    state.table_name,
    acl.grantee,
    acl.privilege_type,
    acl.is_grantable
  from workspace_table_state as state
  join pg_catalog.pg_class as c on c.oid = state.table_oid
  cross join lateral pg_catalog.aclexplode(
    coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
  ) as acl
  where acl.grantee <> c.relowner
    and acl.grantee <> 0
    and not exists (
      select 1
      from pg_catalog.pg_roles as allowed_role
      where allowed_role.oid = acl.grantee
        and allowed_role.rolname in ('anon', 'authenticated', 'service_role')
    )
),
workspace_columns as (
  select
    c.relname::text as table_name,
    c.oid as table_oid,
    c.relowner as table_owner,
    a.attnum::smallint as column_number,
    a.attname::text as column_name,
    a.attacl
  from pg_catalog.pg_class as c
  join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
  join pg_catalog.pg_attribute as a on a.attrelid = c.oid
  join expected_workspace_tables as expected on expected.table_name = c.relname
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and a.attnum > 0
    and not a.attisdropped
),
column_privilege_names(privilege_name) as (
  values
    ('SELECT'::text), ('INSERT'::text), ('UPDATE'::text),
    ('REFERENCES'::text)
),
expected_column_privileges as (
  select
    columns.table_name,
    columns.column_name,
    roles.role_name,
    privileges.privilege_name,
    case
      when roles.role_name = 'PUBLIC' then false
      when roles.role_name = 'anon' then
        columns.table_name = 'leads'
        and privileges.privilege_name = 'INSERT'
        and columns.column_name in (
          'first_name', 'business_name', 'business_type', 'email', 'phone',
          'biggest_problem', 'ai_recommendations', 'conversation', 'source'
        )
      when roles.role_name = 'authenticated' then
        privileges.privilege_name = 'SELECT'
        or (
          columns.table_name = 'business_members'
          and privileges.privilege_name = 'INSERT'
          and columns.column_name in ('business_id', 'user_id', 'role')
        )
        or (
          columns.table_name = 'leads'
          and privileges.privilege_name = 'INSERT'
          and columns.column_name not in ('id', 'created_at')
        )
        or (
          columns.table_name = 'businesses'
          and privileges.privilege_name = 'UPDATE'
          and columns.column_name = 'name'
        )
        or (
          columns.table_name = 'leads'
          and privileges.privilege_name = 'UPDATE'
          and columns.column_name not in ('id', 'created_at', 'business_id')
        )
      when roles.role_name = 'service_role' then
        privileges.privilege_name in ('SELECT', 'INSERT', 'UPDATE')
      else false
    end as expected_has_privilege
  from workspace_columns as columns
  cross join expected_api_roles as roles
  cross join column_privilege_names as privileges
),
actual_column_privileges as (
  select
    expected.table_name,
    expected.column_name,
    expected.role_name,
    expected.privilege_name,
    roles.role_exists,
    case
      when expected.role_name = 'PUBLIC' then
        exists (
          select 1
          from pg_catalog.pg_class as c
          cross join lateral pg_catalog.aclexplode(
            coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
          ) as acl
          where c.oid = columns.table_oid
            and acl.grantee = 0
            and acl.privilege_type = expected.privilege_name
        )
        or exists (
          select 1
          from pg_catalog.aclexplode(columns.attacl) as acl
          where acl.grantee = 0
            and acl.privilege_type = expected.privilege_name
        )
      else coalesce(
        pg_catalog.has_column_privilege(
          roles.role_oid,
          columns.table_oid,
          columns.column_number,
          expected.privilege_name
        ),
        false
      )
    end as has_privilege,
    (
      exists (
        select 1
        from pg_catalog.pg_class as c
        cross join lateral pg_catalog.aclexplode(
          coalesce(c.relacl, pg_catalog.acldefault('r', c.relowner))
        ) as acl
        where c.oid = columns.table_oid
          and acl.grantee = case
            when expected.role_name = 'PUBLIC' then 0::oid
            else roles.role_oid
          end
          and acl.privilege_type = expected.privilege_name
          and acl.is_grantable
      )
      or exists (
        select 1
        from pg_catalog.aclexplode(columns.attacl) as acl
        where acl.grantee = case
            when expected.role_name = 'PUBLIC' then 0::oid
            else roles.role_oid
          end
          and acl.privilege_type = expected.privilege_name
          and acl.is_grantable
      )
    ) as has_grant_option,
    expected.expected_has_privilege
  from expected_column_privileges as expected
  join workspace_columns as columns
    on columns.table_name = expected.table_name
   and columns.column_name = expected.column_name
  join resolved_api_roles as roles on roles.role_name = expected.role_name
),
unexpected_column_acl as (
  select
    columns.table_name,
    columns.column_name,
    acl.grantee,
    acl.privilege_type,
    acl.is_grantable
  from workspace_columns as columns
  cross join lateral pg_catalog.aclexplode(columns.attacl) as acl
  where acl.grantee <> columns.table_owner
    and acl.grantee <> 0
    and not exists (
      select 1
      from pg_catalog.pg_roles as allowed_role
      where allowed_role.oid = acl.grantee
        and allowed_role.rolname in ('anon', 'authenticated', 'service_role')
    )
),
expected_function_targets(function_name, function_signature) as (
  values
    ('user_owns_business', 'public.user_owns_business(uuid)'),
    ('workspace_business_role', 'public.workspace_business_role(uuid)'),
    ('activate_knowledge_file_version',
      'public.activate_knowledge_file_version(uuid,uuid)'),
    ('replace_knowledge_file_chunks',
      'public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)'),
    ('search_knowledge_chunks',
      'public.search_knowledge_chunks(uuid,text,integer)')
),
resolved_function_targets as (
  select
    expected.function_name,
    expected.function_signature,
    pg_catalog.to_regprocedure(expected.function_signature)::oid as function_oid,
    p.proowner as function_owner,
    p.proacl
  from expected_function_targets as expected
  left join pg_catalog.pg_proc as p
    on p.oid = pg_catalog.to_regprocedure(expected.function_signature)
),
expected_function_privileges as (
  select
    functions.function_name,
    functions.function_signature,
    roles.role_name,
    case
      when functions.function_name in (
        'user_owns_business', 'workspace_business_role'
      ) then roles.role_name = 'authenticated'
      else roles.role_name = 'service_role'
    end as expected_has_execute
  from expected_function_targets as functions
  cross join expected_api_roles as roles
),
actual_function_privileges as (
  select
    expected.function_name,
    expected.function_signature,
    expected.role_name,
    targets.function_oid is not null as function_exists,
    roles.role_exists,
    case
      when expected.role_name = 'PUBLIC' then exists (
        select 1
        from pg_catalog.aclexplode(
          coalesce(
            targets.proacl,
            pg_catalog.acldefault('f', targets.function_owner)
          )
        ) as acl
        where acl.grantee = 0
          and acl.privilege_type = 'EXECUTE'
      )
      else coalesce(
        pg_catalog.has_function_privilege(
          roles.role_oid,
          targets.function_oid,
          'EXECUTE'
        ),
        false
      )
    end as has_execute,
    exists (
      select 1
      from pg_catalog.aclexplode(
        coalesce(
          targets.proacl,
          pg_catalog.acldefault('f', targets.function_owner)
        )
      ) as acl
      where acl.grantee = case
          when expected.role_name = 'PUBLIC' then 0::oid
          else roles.role_oid
        end
        and acl.privilege_type = 'EXECUTE'
        and acl.is_grantable
    ) as has_grant_option,
    expected.expected_has_execute
  from expected_function_privileges as expected
  join resolved_function_targets as targets
    on targets.function_name = expected.function_name
  join resolved_api_roles as roles on roles.role_name = expected.role_name
),
unexpected_function_acl as (
  select
    targets.function_name,
    acl.grantee,
    acl.privilege_type,
    acl.is_grantable
  from resolved_function_targets as targets
  cross join lateral pg_catalog.aclexplode(
    coalesce(
      targets.proacl,
      pg_catalog.acldefault('f', targets.function_owner)
    )
  ) as acl
  where targets.function_oid is not null
    and acl.grantee <> targets.function_owner
    and acl.grantee <> 0
    and not exists (
      select 1
      from pg_catalog.pg_roles as allowed_role
      where allowed_role.oid = acl.grantee
        and allowed_role.rolname in ('anon', 'authenticated', 'service_role')
    )
),
default_acl_rows as (
  select
    creator_role.rolname::text as object_creator,
    namespace.nspname::text as schema_name,
    case defaults.defaclobjtype
      when 'r' then 'TABLE'
      when 'S' then 'SEQUENCE'
      when 'f' then 'FUNCTION'
      when 'T' then 'TYPE'
      when 'n' then 'SCHEMA'
      else defaults.defaclobjtype::text
    end::text as object_type,
    case
      when acl.grantee = 0 then 'PUBLIC'
      else coalesce(
        grantee_role.rolname::text,
        pg_catalog.format('OID:%s', acl.grantee)
      )
    end::text as grantee,
    acl.privilege_type::text as privilege_type,
    acl.is_grantable,
    grantor_role.rolname::text as grantor
  from pg_catalog.pg_default_acl as defaults
  join pg_catalog.pg_roles as creator_role on creator_role.oid = defaults.defaclrole
  join pg_catalog.pg_namespace as namespace
    on namespace.oid = defaults.defaclnamespace
  cross join lateral pg_catalog.aclexplode(defaults.defaclacl) as acl
  left join pg_catalog.pg_roles as grantee_role on grantee_role.oid = acl.grantee
  join pg_catalog.pg_roles as grantor_role on grantor_role.oid = acl.grantor
  where namespace.nspname = 'public'
),
api_default_acl_summary as (
  select
    pg_catalog.count(*)::integer as row_count,
    pg_catalog.md5(
      pg_catalog.string_agg(
        pg_catalog.concat_ws(
          '|', object_creator, schema_name, object_type, grantee,
          privilege_type, is_grantable::text, grantor
        ),
        E'\n' order by object_creator, object_type, grantee, privilege_type
      )
    ) as fingerprint
  from default_acl_rows
  where grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
),
expected_administrative_default_acl(
  object_creator,
  schema_name,
  object_type,
  grantee,
  privilege_type,
  is_grantable,
  grantor
) as (
  values
    ('supabase_admin', 'public', 'FUNCTION', 'postgres', 'EXECUTE', false, 'supabase_admin'),
    ('supabase_admin', 'public', 'SEQUENCE', 'postgres', 'SELECT', false, 'supabase_admin'),
    ('supabase_admin', 'public', 'SEQUENCE', 'postgres', 'UPDATE', false, 'supabase_admin'),
    ('supabase_admin', 'public', 'SEQUENCE', 'postgres', 'USAGE', false, 'supabase_admin'),
    ('supabase_admin', 'public', 'TABLE', 'postgres', 'DELETE', false, 'supabase_admin'),
    ('supabase_admin', 'public', 'TABLE', 'postgres', 'INSERT', false, 'supabase_admin'),
    ('supabase_admin', 'public', 'TABLE', 'postgres', 'MAINTAIN', false, 'supabase_admin'),
    ('supabase_admin', 'public', 'TABLE', 'postgres', 'REFERENCES', false, 'supabase_admin'),
    ('supabase_admin', 'public', 'TABLE', 'postgres', 'SELECT', false, 'supabase_admin'),
    ('supabase_admin', 'public', 'TABLE', 'postgres', 'TRIGGER', false, 'supabase_admin'),
    ('supabase_admin', 'public', 'TABLE', 'postgres', 'TRUNCATE', false, 'supabase_admin'),
    ('supabase_admin', 'public', 'TABLE', 'postgres', 'UPDATE', false, 'supabase_admin')
),
actual_administrative_default_acl as (
  select *
  from default_acl_rows as rows
  where rows.grantee not in (
    'PUBLIC', rows.object_creator, 'anon', 'authenticated', 'service_role'
  )
),
administrative_default_acl_differences as (
  (
    select * from expected_administrative_default_acl
    except
    select * from actual_administrative_default_acl
  )
  union all
  (
    select * from actual_administrative_default_acl
    except
    select * from expected_administrative_default_acl
  )
),
expected_post_dependencies(
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
    ('POLICY', 'public.ai_orchestration_logs policy ai_orchestration_logs_owned',
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
    ('POLICY', 'public.business_settings policy business_settings_owned',
      true, false, false),
    ('POLICY', 'public.calendly_settings policy calendly_settings_owned',
      true, false, false),
    ('POLICY', 'public.follow_ups policy follow_ups_owned', true, false, false),
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
),
dependency_reference_targets as (
  select
    pg_catalog.to_regprocedure('public.user_owns_business(uuid)')::oid
      as user_owns_business_oid,
    pg_catalog.to_regclass('public.business_members')::oid
      as business_members_oid,
    pg_catalog.to_regclass('public.businesses')::oid as businesses_oid,
    (
      select a.attnum::integer
      from pg_catalog.pg_attribute as a
      where a.attrelid = pg_catalog.to_regclass('public.businesses')
        and a.attname = 'owner_user_id'
        and not a.attisdropped
    ) as owner_user_id_attnum
),
dependency_policy_sources as (
  select
    'pg_catalog.pg_policy'::pg_catalog.regclass as object_classid,
    pol.oid as object_oid,
    'POLICY'::text as object_type,
    pg_catalog.format(
      '%I.%I policy %I', n.nspname, c.relname, pol.polname
    )::text as object_identity,
    n.nspname = 'public' and c.relname = 'business_members'
      as targets_business_members,
    pg_catalog.concat_ws(
      E'\n',
      pg_catalog.pg_get_expr(pol.polqual, pol.polrelid, true),
      pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid, true)
    ) as searchable_source
  from pg_catalog.pg_policy as pol
  join pg_catalog.pg_class as c on c.oid = pol.polrelid
  join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
),
dependency_function_sources as (
  select
    'pg_catalog.pg_proc'::pg_catalog.regclass as object_classid,
    p.oid as object_oid,
    'FUNCTION'::text as object_type,
    pg_catalog.format(
      '%I.%I(%s)', n.nspname, p.proname,
      pg_catalog.pg_get_function_identity_arguments(p.oid)
    )::text as object_identity,
    false as targets_business_members,
    p.prosrc as searchable_source
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
  where n.nspname not in ('pg_catalog', 'information_schema')
    and p.prokind in ('f', 'p')
),
dependency_object_sources as (
  select * from dependency_policy_sources
  union all
  select * from dependency_function_sources
),
actual_dependency_inventory as (
  select
    sources.object_type,
    sources.object_identity,
    (
      pg_catalog.strpos(
        pg_catalog.lower(sources.searchable_source), 'user_owns_business'
      ) > 0
      or exists (
        select 1
        from pg_catalog.pg_depend as dependency
        where dependency.classid = sources.object_classid
          and dependency.objid = sources.object_oid
          and dependency.refclassid = 'pg_catalog.pg_proc'::pg_catalog.regclass
          and dependency.refobjid = targets.user_owns_business_oid
      )
    ) as references_user_owns_business,
    (
      sources.targets_business_members
      or pg_catalog.strpos(
        pg_catalog.lower(sources.searchable_source), 'business_members'
      ) > 0
      or exists (
        select 1
        from pg_catalog.pg_depend as dependency
        where dependency.classid = sources.object_classid
          and dependency.objid = sources.object_oid
          and dependency.refclassid = 'pg_catalog.pg_class'::pg_catalog.regclass
          and dependency.refobjid = targets.business_members_oid
      )
    ) as references_business_members,
    (
      pg_catalog.strpos(
        pg_catalog.lower(sources.searchable_source), 'owner_user_id'
      ) > 0
      or exists (
        select 1
        from pg_catalog.pg_depend as dependency
        where dependency.classid = sources.object_classid
          and dependency.objid = sources.object_oid
          and dependency.refclassid = 'pg_catalog.pg_class'::pg_catalog.regclass
          and dependency.refobjid = targets.businesses_oid
          and dependency.refobjsubid = targets.owner_user_id_attnum
      )
    ) as references_owner_user_id
  from dependency_object_sources as sources
  cross join dependency_reference_targets as targets
),
relevant_dependency_inventory as (
  select *
  from actual_dependency_inventory
  where references_user_owns_business
     or references_business_members
     or references_owner_user_id
),
missing_or_changed_dependencies as (
  select * from expected_post_dependencies
  except
  select * from relevant_dependency_inventory
),
unexpected_dependencies as (
  select * from relevant_dependency_inventory
  except
  select * from expected_post_dependencies
),
expected_absent_legacy_policies(schema_name, table_name, policy_name) as (
  values
    ('public', 'business_members', 'business_members_manage_owned'),
    ('public', 'business_members', 'business_members_select_owned'),
    ('public', 'businesses', 'businesses_select_owned'),
    ('public', 'businesses', 'businesses_update_owned'),
    ('public', 'knowledge_chunks', 'knowledge_chunks_owned'),
    ('public', 'knowledge_files', 'knowledge_files_owned'),
    ('public', 'knowledge_items', 'knowledge_items_owned'),
    ('public', 'leads', 'leads_owned')
),
present_legacy_policies as (
  select expected.*
  from expected_absent_legacy_policies as expected
  join pg_catalog.pg_policies as actual
    on actual.schemaname = expected.schema_name
   and actual.tablename = expected.table_name
   and actual.policyname = expected.policy_name
),
expected_preserved_policy_hashes(
  schema_name,
  table_name,
  policy_name,
  command_name,
  role_names,
  permissive,
  body_hash
) as (
  values
    ('public', 'ai_orchestration_logs', 'ai_orchestration_logs_owned',
      'ALL', 'authenticated', true, 'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'audits', 'audits_owned',
      'ALL', 'authenticated', true, 'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'automations', 'automations_owned',
      'ALL', 'authenticated', true, 'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'business_brains', 'business_brains_owned',
      'ALL', 'authenticated', true, 'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'business_settings', 'business_settings_owned',
      'ALL', 'authenticated', true, 'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'calendly_settings', 'calendly_settings_owned',
      'ALL', 'authenticated', true, 'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'follow_ups', 'follow_ups_owned',
      'ALL', 'authenticated', true, 'c14825b241088ea9b5f0ac35611fac2d'),
    ('public', 'knowledge_processing_logs', 'knowledge_processing_logs_owned',
      'ALL', 'authenticated', true, 'c14825b241088ea9b5f0ac35611fac2d'),
    ('storage', 'objects', 'knowledge_files_storage_delete_owned',
      'DELETE', 'authenticated', true, '6dee25484e5cc79a72418753eb6688b2'),
    ('storage', 'objects', 'knowledge_files_storage_insert_owned',
      'INSERT', 'authenticated', true, '6dee25484e5cc79a72418753eb6688b2'),
    ('storage', 'objects', 'knowledge_files_storage_select_owned',
      'SELECT', 'authenticated', true, '6dee25484e5cc79a72418753eb6688b2'),
    ('storage', 'objects', 'knowledge_files_storage_update_owned',
      'UPDATE', 'authenticated', true, '0a1d681815fbc10df30e4b797212b88d')
),
actual_user_owns_policy_hashes as (
  select
    n.nspname::text as schema_name,
    c.relname::text as table_name,
    pol.polname::text as policy_name,
    case pol.polcmd
      when 'r' then 'SELECT'
      when 'a' then 'INSERT'
      when 'w' then 'UPDATE'
      when 'd' then 'DELETE'
      when '*' then 'ALL'
    end::text as command_name,
    pg_catalog.array_to_string(
      array(
        select case
          when role_entry.role_oid = 0 then 'PUBLIC'
          else role_name.rolname
        end
        from pg_catalog.unnest(pol.polroles) as role_entry(role_oid)
        left join pg_catalog.pg_roles as role_name
          on role_name.oid = role_entry.role_oid
        order by case
          when role_entry.role_oid = 0 then 'PUBLIC'
          else role_name.rolname
        end
      ),
      ','
    )::text as role_names,
    pol.polpermissive as permissive,
    pg_catalog.md5(
      pg_catalog.concat_ws(
        E'\n',
        pg_catalog.pg_get_expr(pol.polqual, pol.polrelid, true),
        pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid, true)
      )
    ) as body_hash
  from pg_catalog.pg_policy as pol
  join pg_catalog.pg_class as c on c.oid = pol.polrelid
  join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
  cross join dependency_reference_targets as targets
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
     or exists (
       select 1
       from pg_catalog.pg_depend as dependency
       where dependency.classid = 'pg_catalog.pg_policy'::pg_catalog.regclass
         and dependency.objid = pol.oid
         and dependency.refclassid = 'pg_catalog.pg_proc'::pg_catalog.regclass
         and dependency.refobjid = targets.user_owns_business_oid
     )
),
preserved_policy_hash_differences as (
  (
    select * from expected_preserved_policy_hashes
    except
    select * from actual_user_owns_policy_hashes
  )
  union all
  (
    select * from actual_user_owns_policy_hashes
    except
    select * from expected_preserved_policy_hashes
  )
),
unexpected_user_owns_functions as (
  select
    n.nspname::text as schema_name,
    p.proname::text as function_name,
    pg_catalog.pg_get_function_identity_arguments(p.oid)::text as arguments
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
  cross join dependency_reference_targets as targets
  where n.nspname not in ('pg_catalog', 'information_schema')
    and p.oid is distinct from targets.user_owns_business_oid
    and (
      pg_catalog.strpos(pg_catalog.lower(p.prosrc), 'user_owns_business') > 0
      or exists (
        select 1
        from pg_catalog.pg_depend as dependency
        where dependency.classid = 'pg_catalog.pg_proc'::pg_catalog.regclass
          and dependency.objid = p.oid
          and dependency.refclassid = 'pg_catalog.pg_proc'::pg_catalog.regclass
          and dependency.refobjid = targets.user_owns_business_oid
      )
    )
),
expected_function_hashes(
  function_signature,
  hash_kind,
  expected_hash
) as (
  values
    ('public.is_current_portal_customer(uuid,uuid)',
      'definition_raw', 'fc694713d07b2e6ce94bb124232a21de'),
    ('public.is_current_portal_document(uuid,uuid,uuid)',
      'source_normalized', 'b80ff54e968dcf6fc691f77716d87d5e'),
    ('public.set_customer_profile_updated_at()',
      'source_normalized', '4b908169ae7443fef47ac44b73795e68'),
    ('public.redeem_customer_portal_invitation(text,uuid)',
      'definition_raw', '195639e1feefeacb64d3c62658db6376'),
    ('public.user_owns_business(uuid)',
      'definition_raw', '77f607ed3738f7bb45ebcee1e89e291e'),
    ('public.workspace_business_role(uuid)',
      'source_normalized', '5cb186fb9ab6d9eece3868da4259521e'),
    ('public.activate_knowledge_file_version(uuid,uuid)',
      'definition_normalized', 'bfe383cfbdf706d683d8693484e51c2a'),
    ('public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)',
      'definition_normalized', '16aed544c62caf75c68fe55759c371a8'),
    ('public.search_knowledge_chunks(uuid,text,integer)',
      'definition_normalized', '3cfab9ae525b9a01d972f94159dba13c')
),
actual_function_hashes as (
  select
    expected.function_signature,
    expected.hash_kind,
    case expected.hash_kind
      when 'definition_raw' then
        pg_catalog.md5(pg_catalog.pg_get_functiondef(p.oid))
      when 'definition_normalized' then
        pg_catalog.md5(
          pg_catalog.replace(
            pg_catalog.replace(
              pg_catalog.pg_get_functiondef(p.oid), E'\r\n', E'\n'
            ),
            E'\r', E'\n'
          )
        )
      when 'source_normalized' then
        pg_catalog.md5(
          pg_catalog.replace(
            pg_catalog.replace(p.prosrc, E'\r\n', E'\n'),
            E'\r', E'\n'
          )
        )
    end as expected_hash
  from expected_function_hashes as expected
  join pg_catalog.pg_proc as p
    on p.oid = pg_catalog.to_regprocedure(expected.function_signature)
),
function_hash_differences as (
  (
    select * from expected_function_hashes
    except
    select * from actual_function_hashes
  )
  union all
  (
    select * from actual_function_hashes
    except
    select * from expected_function_hashes
  )
),
expected_helper_contract(
  function_identity,
  identity_arguments,
  result_type,
  owner_name,
  language_name,
  security_definer,
  volatility,
  configuration,
  source_hash
) as (
  values (
    'public.workspace_business_role(uuid)',
    'target_business_id uuid',
    'text',
    'postgres',
    'sql',
    true,
    's',
    'search_path=pg_catalog',
    '5cb186fb9ab6d9eece3868da4259521e'
  )
),
actual_helper_contract as (
  select
    pg_catalog.format(
      '%I.%I(%s)', n.nspname, p.proname,
      pg_catalog.replace(pg_catalog.oidvectortypes(p.proargtypes), ', ', ',')
    )::text as function_identity,
    pg_catalog.pg_get_function_identity_arguments(p.oid)::text
      as identity_arguments,
    pg_catalog.pg_get_function_result(p.oid)::text as result_type,
    owner_role.rolname::text as owner_name,
    language.lanname::text as language_name,
    p.prosecdef as security_definer,
    p.provolatile::text as volatility,
    pg_catalog.array_to_string(p.proconfig, ',')::text as configuration,
    pg_catalog.md5(
      pg_catalog.replace(
        pg_catalog.replace(p.prosrc, E'\r\n', E'\n'),
        E'\r', E'\n'
      )
    ) as source_hash
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
  join pg_catalog.pg_roles as owner_role on owner_role.oid = p.proowner
  join pg_catalog.pg_language as language on language.oid = p.prolang
  where n.nspname = 'public'
    and p.proname = 'workspace_business_role'
),
helper_contract_differences as (
  (
    select * from expected_helper_contract
    except
    select * from actual_helper_contract
  )
  union all
  (
    select * from actual_helper_contract
    except
    select * from expected_helper_contract
  )
),
expected_user_owns_contract(
  function_identity,
  identity_arguments,
  result_type,
  owner_name,
  language_name,
  security_definer,
  volatility,
  configuration,
  normalized_definition_hash
) as (
  values (
    'public.user_owns_business(uuid)',
    'target_business_id uuid',
    'boolean',
    'postgres',
    'sql',
    true,
    's',
    'search_path=public',
    '89c557e758801e526ceefd1dd3700cb8'
  )
),
actual_user_owns_contract as (
  select
    pg_catalog.format(
      '%I.%I(%s)', n.nspname, p.proname,
      pg_catalog.replace(pg_catalog.oidvectortypes(p.proargtypes), ', ', ',')
    )::text as function_identity,
    pg_catalog.pg_get_function_identity_arguments(p.oid)::text
      as identity_arguments,
    pg_catalog.pg_get_function_result(p.oid)::text as result_type,
    owner_role.rolname::text as owner_name,
    language.lanname::text as language_name,
    p.prosecdef as security_definer,
    p.provolatile::text as volatility,
    pg_catalog.array_to_string(p.proconfig, ',')::text as configuration,
    pg_catalog.md5(
      pg_catalog.replace(
        pg_catalog.replace(
          pg_catalog.pg_get_functiondef(p.oid), E'\r\n', E'\n'
        ),
        E'\r', E'\n'
      )
    ) as normalized_definition_hash
  from pg_catalog.pg_proc as p
  join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
  join pg_catalog.pg_roles as owner_role on owner_role.oid = p.proowner
  join pg_catalog.pg_language as language on language.oid = p.prolang
  where n.nspname = 'public'
    and p.proname = 'user_owns_business'
),
user_owns_contract_differences as (
  (
    select * from expected_user_owns_contract
    except
    select * from actual_user_owns_contract
  )
  union all
  (
    select * from actual_user_owns_contract
    except
    select * from expected_user_owns_contract
  )
),
business_members_role_contract as (
  select
    pg_catalog.count(*)::integer as matching_rows
  from information_schema.columns as columns
  where columns.table_schema = 'public'
    and columns.table_name = 'business_members'
    and columns.column_name = 'role'
    and columns.is_nullable = 'NO'
    and columns.column_default = '''member''::text'
),
policy_contract_hashes as (
  select
    (
      select pg_catalog.md5(
        pg_catalog.string_agg(
          pg_catalog.concat_ws(
            '|', table_name, policy_name, permissive, role_names,
            command_name, coalesce(using_expression, '<NULL>'),
            coalesce(check_expression, '<NULL>')
          ),
          E'\n' order by table_name, policy_name
        )
      )
      from expected_workspace_policies
    ) as expected_workspace_hash,
    (
      select pg_catalog.md5(
        pg_catalog.string_agg(
          pg_catalog.concat_ws(
            '|', table_name, policy_name, permissive, role_names,
            command_name, coalesce(using_expression, '<NULL>'),
            coalesce(check_expression, '<NULL>')
          ),
          E'\n' order by table_name, policy_name
        )
      )
      from actual_workspace_policies
    ) as actual_workspace_hash,
    (
      select pg_catalog.md5(
        pg_catalog.string_agg(
          pg_catalog.concat_ws(
            '|', table_name, policy_name, command_name,
            canonical_using, canonical_check
          ),
          E'\n' order by table_name, policy_name
        )
      )
      from expected_portal_policies
    ) as expected_portal_hash,
    (
      select pg_catalog.md5(
        pg_catalog.string_agg(
          pg_catalog.concat_ws(
            '|', table_name, policy_name, command_name,
            canonical_using, canonical_check
          ),
          E'\n' order by table_name, policy_name
        )
      )
      from actual_portal_policies
    ) as actual_portal_hash,
    (
      select pg_catalog.md5(
        pg_catalog.string_agg(
          pg_catalog.concat_ws(
            '|', schema_name, table_name, policy_name, command_name,
            role_names, permissive::text, body_hash
          ),
          E'\n' order by schema_name, table_name, policy_name
        )
      )
      from expected_preserved_policy_hashes
    ) as expected_preserved_hash,
    (
      select pg_catalog.md5(
        pg_catalog.string_agg(
          pg_catalog.concat_ws(
            '|', schema_name, table_name, policy_name, command_name,
            role_names, permissive::text, body_hash
          ),
          E'\n' order by schema_name, table_name, policy_name
        )
      )
      from actual_user_owns_policy_hashes
    ) as actual_preserved_hash
),
checks(check_number, section_name, check_name, passed, finding, warning) as (
  select
    1, 'A', 'Migration applied',
    (
      not exists (select 1 from helper_contract_differences)
      and not exists (select 1 from workspace_policy_differences)
      and not exists (select 1 from present_legacy_policies)
      and (select matching_rows = 1 from business_members_role_contract)
    ),
    'Applied migration effects do not match the approved P0-1 contract.',
    'Applied state is certified from exact database effects; manual execution may not create a migration-history row.'
  union all
  select
    2, 'A', 'workspace_business_role(uuid) exists',
    not exists (select 1 from helper_contract_differences),
    'workspace_business_role(uuid) is missing or its exact signature differs.',
    null::text
  union all
  select
    3, 'A', 'user_owns_business(uuid) privilege matrix',
    (
      (select pg_catalog.count(*) = 4
       from actual_function_privileges
       where function_name = 'user_owns_business')
      and not exists (
        select 1 from actual_function_privileges
        where function_name = 'user_owns_business'
          and (
            not function_exists or not role_exists
            or has_execute is distinct from expected_has_execute
            or has_grant_option
          )
      )
      and not exists (
        select 1 from unexpected_function_acl
        where function_name = 'user_owns_business'
      )
    ),
    'user_owns_business(uuid) EXECUTE privileges differ from the approved matrix.',
    null::text
  union all
  select
    4, 'A', 'workspace_business_role(uuid) privilege matrix',
    (
      (select pg_catalog.count(*) = 4
       from actual_function_privileges
       where function_name = 'workspace_business_role')
      and not exists (
        select 1 from actual_function_privileges
        where function_name = 'workspace_business_role'
          and (
            not function_exists or not role_exists
            or has_execute is distinct from expected_has_execute
            or has_grant_option
          )
      )
      and not exists (
        select 1 from unexpected_function_acl
        where function_name = 'workspace_business_role'
      )
    ),
    'workspace_business_role(uuid) EXECUTE privileges differ from the approved matrix.',
    null::text
  union all
  select
    5, 'B', 'businesses policies',
    (
      not exists (
        select 1 from workspace_policy_differences where table_name = 'businesses'
      )
      and exists (
        select 1 from workspace_table_state
        where table_name = 'businesses' and table_oid is not null
          and table_owner = 'postgres' and rls_enabled and not rls_forced
      )
    ),
    'businesses policy inventory, owner, or RLS state differs.', null::text
  union all
  select
    6, 'B', 'business_members policies',
    (
      not exists (
        select 1 from workspace_policy_differences
        where table_name = 'business_members'
      )
      and exists (
        select 1 from workspace_table_state
        where table_name = 'business_members' and table_oid is not null
          and table_owner = 'postgres' and rls_enabled and not rls_forced
      )
    ),
    'business_members policy inventory, owner, or RLS state differs.', null::text
  union all
  select
    7, 'B', 'leads policies',
    (
      not exists (
        select 1 from workspace_policy_differences where table_name = 'leads'
      )
      and exists (
        select 1 from workspace_table_state
        where table_name = 'leads' and table_oid is not null
          and table_owner = 'postgres' and rls_enabled and not rls_forced
      )
    ),
    'leads policy inventory, owner, or RLS state differs.', null::text
  union all
  select
    8, 'B', 'knowledge_* policies',
    (
      not exists (
        select 1 from workspace_policy_differences
        where table_name in ('knowledge_items', 'knowledge_files', 'knowledge_chunks')
      )
      and (
        select pg_catalog.count(*) = 3
          and pg_catalog.bool_and(
            table_oid is not null and table_owner = 'postgres'
            and rls_enabled and not rls_forced
          )
        from workspace_table_state
        where table_name in ('knowledge_items', 'knowledge_files', 'knowledge_chunks')
      )
    ),
    'Knowledge policy inventory, owner, or RLS state differs.', null::text
  union all
  select
    9, 'C', 'Customer Portal functions unchanged',
    (
      not exists (select 1 from portal_function_contract_differences)
      and not exists (select 1 from portal_function_acl_differences)
      and (select pg_catalog.count(*) = 4 from actual_portal_functions)
    ),
    'Customer Portal function metadata, body, overloads, or ACLs changed.', null::text
  union all
  select
    10, 'C', 'Customer Portal tables unchanged',
    (
      not exists (select 1 from portal_table_differences)
      and not exists (select 1 from portal_column_differences)
      and not exists (select 1 from portal_key_constraint_differences)
      and not exists (select 1 from portal_foreign_key_differences)
      and not exists (select 1 from portal_set_null_column_differences)
      and not exists (select 1 from portal_check_constraint_differences)
      and (select pg_catalog.count(*) = 8 from actual_portal_tables)
      and (select pg_catalog.count(*) = 85 from actual_portal_columns)
      and (
        select pg_catalog.count(*) = 8
          and pg_catalog.bool_and(
            table_oid is not null and table_owner = 'postgres'
          )
        from portal_table_state
      )
      and (
        select total_constraint_count = 45
          and every_constraint_validated
          and required_security_constraint_count = 12
        from portal_constraint_summary
      )
      and (
        select total_index_count = 18
          and required_explicit_index_count = 6
        from portal_index_summary
      )
      and (
        select noninternal_trigger_count = 1
          and trusted_trigger_count = 1
        from portal_trigger_summary
      )
      and (select pg_catalog.count(*) = 192 from portal_table_acl_matrix)
      and not exists (
        select 1 from portal_table_acl_matrix
        where not table_exists or not role_exists
          or has_privilege or has_grant_option
      )
      and not exists (select 1 from unexpected_portal_table_acl)
      and (select pg_catalog.count(*) = 1020 from portal_column_acl_matrix)
      and not exists (
        select 1 from portal_column_acl_matrix
        where not role_exists
          or has_privilege is distinct from expected_has_privilege
          or has_grant_option
      )
      and not exists (select 1 from unexpected_portal_column_acl)
    ),
    'Customer Portal relation, column, constraint, index, or trigger contract changed.',
    null::text
  union all
  select
    11, 'C', 'Customer Portal RLS unchanged',
    (
      not exists (select 1 from portal_policy_differences)
      and (select row_count = 0 from portal_nonconforming_policy_count)
      and (
        select pg_catalog.count(*) = 8
          and pg_catalog.bool_and(
            table_oid is not null and rls_enabled and not rls_forced
          )
        from portal_table_state
      )
    ),
    'Customer Portal RLS flags or exact customer-policy contract changed.', null::text
  union all
  select
    12, 'D', 'Knowledge versioning functions unchanged',
    (
      not exists (select 1 from knowledge_function_differences)
      and (select pg_catalog.count(*) = 3 from actual_knowledge_functions)
    ),
    'Knowledge versioning function metadata or definition hash changed.', null::text
  union all
  select
    13, 'D', 'Knowledge indexes unchanged',
    not exists (select 1 from knowledge_index_differences),
    'Knowledge index count or fingerprint changed.', null::text
  union all
  select
    14, 'D', 'Knowledge permissions unchanged',
    (
      (select pg_catalog.count(*) = 12
       from actual_function_privileges
       where function_name in (
         'activate_knowledge_file_version',
         'replace_knowledge_file_chunks',
         'search_knowledge_chunks'
       ))
      and not exists (
        select 1 from actual_function_privileges
        where function_name in (
          'activate_knowledge_file_version',
          'replace_knowledge_file_chunks',
          'search_knowledge_chunks'
        )
          and (
            not function_exists or not role_exists
            or has_execute is distinct from expected_has_execute
            or has_grant_option
          )
      )
      and not exists (
        select 1 from unexpected_function_acl
        where function_name in (
          'activate_knowledge_file_version',
          'replace_knowledge_file_chunks',
          'search_knowledge_chunks'
        )
      )
    ),
    'Knowledge transactional function permissions changed.', null::text
  union all
  select
    15, 'E', 'Storage policies unchanged',
    (
      not exists (select 1 from storage_policy_differences)
      and (select pg_catalog.count(*) = 4 from actual_storage_policies)
    ),
    'Knowledge Storage policy identity, role, command, or body hash changed.', null::text
  union all
  select
    16, 'F', 'Table privilege matrix',
    (
      (select pg_catalog.count(*) = 192 from actual_table_privileges)
      and not exists (
        select 1 from actual_table_privileges
        where not table_exists or not role_exists
          or has_privilege is distinct from expected_has_privilege
          or has_grant_option
      )
      and not exists (select 1 from unexpected_table_acl)
    ),
    'Workspace table privileges, unsafe grants, grant options, or grantees differ.',
    null::text
  union all
  select
    17, 'F', 'Column privilege matrix',
    (
      not exists (select 1 from workspace_column_fingerprint_differences)
      and (select pg_catalog.count(*) = 1584 from actual_column_privileges)
      and not exists (
        select 1 from actual_column_privileges
        where not role_exists
          or has_privilege is distinct from expected_has_privilege
          or has_grant_option
      )
      and not exists (select 1 from unexpected_column_acl)
    ),
    'Workspace column privileges, grant options, grantees, or schema differ.',
    null::text
  union all
  select
    18, 'F', 'Function privilege matrix',
    (
      (select pg_catalog.count(*) = 20 from actual_function_privileges)
      and not exists (
        select 1 from actual_function_privileges
        where not function_exists or not role_exists
          or has_execute is distinct from expected_has_execute
          or has_grant_option
      )
      and not exists (select 1 from unexpected_function_acl)
    ),
    'Reviewed function EXECUTE privileges, grant options, or grantees differ.',
    null::text
  union all
  select
    19, 'F', 'Default ACL fingerprint',
    (
      select row_count = 72
        and fingerprint = 'd130bd119407ee6906ad6a9c3618970c'
      from api_default_acl_summary
    ),
    'Public-schema API-role default ACL count or fingerprint changed.',
    'Default-privilege hardening remains a separate P0 scope; this check certifies the approved unchanged baseline only.'
  union all
  select
    20, 'F', 'Default ACL administrative matrix',
    (
      not exists (select 1 from administrative_default_acl_differences)
      and (select pg_catalog.count(*) = 12 from actual_administrative_default_acl)
    ),
    'The explicit supabase_admin to postgres default ACL matrix changed.', null::text
  union all
  select
    21, 'G', 'All reviewed dependencies present',
    (
      not exists (select 1 from missing_or_changed_dependencies)
      and (select pg_catalog.count(*) = 19 from relevant_dependency_inventory)
      and not exists (select 1 from present_legacy_policies)
      and not exists (select 1 from preserved_policy_hash_differences)
    ),
    'One or more reviewed dependencies or 23-object dispositions are missing or changed.',
    null::text
  union all
  select
    22, 'G', 'No unexpected dependency',
    not exists (select 1 from unexpected_dependencies),
    'An unreviewed policy or function dependency is present.', null::text
  union all
  select
    23, 'G', 'Helper function integrity',
    (
      not exists (select 1 from helper_contract_differences)
      and not exists (select 1 from user_owns_contract_differences)
    ),
    'Workspace helper metadata, source, ownership, or search_path changed.', null::text
  union all
  select
    24, 'G', 'Function hashes',
    (
      not exists (select 1 from function_hash_differences)
      and (select pg_catalog.count(*) = 9 from actual_function_hashes)
    ),
    'One or more approved function hashes changed.', null::text
  union all
  select
    25, 'G', 'Policy hashes',
    (
      not exists (select 1 from preserved_policy_hash_differences)
      and not exists (select 1 from workspace_policy_differences)
      and not exists (select 1 from portal_policy_differences)
      and (select pg_catalog.count(*) = 12 from actual_user_owns_policy_hashes)
      and not exists (select 1 from unexpected_user_owns_functions)
      and (
        select
          expected_workspace_hash = actual_workspace_hash
          and expected_portal_hash = actual_portal_hash
          and expected_preserved_hash = actual_preserved_hash
        from policy_contract_hashes
      )
    ),
    'A Workspace, Customer Portal, or preserved dependency policy hash changed, or an unexpected function depends on user_owns_business.',
    null::text
),
check_summary as (
  select
    pg_catalog.count(*)::integer as check_count,
    pg_catalog.count(distinct check_number)::integer as distinct_check_count,
    pg_catalog.min(check_number)::integer as minimum_check_number,
    pg_catalog.max(check_number)::integer as maximum_check_number,
    coalesce(pg_catalog.bool_and(coalesce(passed, false)), false)
      as every_check_passed
  from checks
)
select
  case
    when summary.check_count = constants.required_check_count
     and summary.distinct_check_count = constants.required_check_count
     and summary.minimum_check_number = 1
     and summary.maximum_check_number = constants.required_check_count
     and summary.every_check_passed
    then 'PASS'
    else 'FAIL'
  end::text as overall_status,
  coalesce(
    (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'check_number', failed.check_number,
          'section', failed.section_name,
          'check', failed.check_name,
          'finding', failed.finding
        ) order by failed.check_number
      )
      from checks as failed
      where not coalesce(failed.passed, false)
    ),
    '[]'::jsonb
  ) as blocking_findings,
  coalesce(
    (
      select pg_catalog.jsonb_agg(
        pg_catalog.jsonb_build_object(
          'check_number', noted.check_number,
          'warning', noted.warning
        ) order by noted.check_number
      )
      from checks as noted
      where noted.warning is not null
    ),
    '[]'::jsonb
  ) as warnings,
  constants.migration_version,
  current_date as certification_date
from constants
cross join check_summary as summary;
