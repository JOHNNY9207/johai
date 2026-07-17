-- PLATFORM HARDENING P0-1: BUSINESS WORKSPACE TENANT-BOUND IDENTITY
--
-- Manual execution only after explicit human approval.
-- This revision is limited to the six relations present in the approved live
-- evidence. It does not alter Customer Portal identity objects, Knowledge
-- versioning functions/indexes/data, storage.objects, or Storage policies.
--
-- IMPORTANT DEFAULT-PRIVILEGE BOUNDARY
-- The reviewed public-schema ALTER DEFAULT PRIVILEGES state is deliberately
-- not changed here. It spans postgres and supabase_admin and affects future
-- Customer Portal, Storage, Knowledge, and unrelated platform objects. Its
-- hardening requires a separately reviewed P0 migration. This migration pins
-- that 72-row baseline before and after its work so drift cannot be hidden.

begin;

-- Fail closed unless the complete reviewed live baseline is still present.
do $block$
declare
  ownerless_business_count bigint;
  ownerless_member_count bigint;
  default_acl_count bigint;
  default_acl_fingerprint text;
begin
  if pg_catalog.to_regrole('postgres') is null
     or pg_catalog.to_regrole('anon') is null
     or pg_catalog.to_regrole('authenticated') is null
     or pg_catalog.to_regrole('service_role') is null then
    raise exception using
      errcode = '42704',
      message = 'Workspace hardening blocked: an expected database role is missing.';
  end if;

  if (
    select count(*)
    from (
      values
        ('business_members'),
        ('businesses'),
        ('knowledge_chunks'),
        ('knowledge_files'),
        ('knowledge_items'),
        ('leads')
    ) as expected(table_name)
    join pg_catalog.pg_namespace as n
      on n.nspname = 'public'
    join pg_catalog.pg_class as c
      on c.relnamespace = n.oid
     and c.relname = expected.table_name
     and c.relkind in ('r', 'p')
    where c.relrowsecurity
      and not c.relforcerowsecurity
      and c.relowner = pg_catalog.to_regrole('postgres')::oid
  ) <> 6 then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening blocked: expected tables, owners, or RLS state changed.';
  end if;

  -- The reviewed ownerless business is intentionally preserved and remains
  -- fail-closed. No owner is selected, inferred, inserted, or backfilled.
  select count(*)
  into ownerless_business_count
  from public.businesses as b
  where b.owner_user_id is null;

  select count(*)
  into ownerless_member_count
  from public.business_members as bm
  where bm.business_id =
    '00000000-0000-0000-0000-000000000001'::uuid;

  if ownerless_business_count <> 1
     or not exists (
       select 1
       from public.businesses as b
       where b.id = '00000000-0000-0000-0000-000000000001'::uuid
         and b.owner_user_id is null
     )
     or ownerless_member_count <> 0 then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening blocked: the reviewed ownerless-business assumption changed.';
  end if;

  if exists (
    select 1
    from public.business_members as bm
    where bm.role is null
       or bm.role not in ('owner'::text, 'member'::text)
  ) then
    raise exception using
      errcode = '23514',
      message = 'Workspace hardening blocked: unsupported business_members.role values exist.';
  end if;

  if exists (
    select 1
    from public.business_members as bm
    left join public.businesses as b
      on b.id = bm.business_id
    left join auth.users as u
      on u.id = bm.user_id
    where b.id is null or u.id is null
  ) then
    raise exception using
      errcode = '23503',
      message = 'Workspace hardening blocked: orphan business_members rows exist.';
  end if;

  if exists (
    select 1
    from public.businesses as b
    left join auth.users as u on u.id = b.owner_user_id
    where b.owner_user_id is not null
      and u.id is null
  ) then
    raise exception using
      errcode = '23503',
      message = 'Workspace hardening blocked: an assigned business owner is missing from auth.users.';
  end if;

  if exists (
    select 1
    from public.business_members as bm
    group by bm.business_id, bm.user_id
    having count(*) > 1
  ) then
    raise exception using
      errcode = '23505',
      message = 'Workspace hardening blocked: duplicate business membership rows exist.';
  end if;

  -- Direct relation and column ACLs must have no unreviewed grantee. Catalog
  -- ACLs are used so PUBLIC and direct column grants cannot be omitted.
  if exists (
    select 1
    from pg_catalog.pg_namespace as n
    join pg_catalog.pg_class as c
      on c.relnamespace = n.oid
    cross join lateral pg_catalog.aclexplode(
      case
        when c.relacl is null then
          pg_catalog.acldefault('r'::"char", c.relowner)
        else c.relacl
      end
    ) as acl
    where n.nspname = 'public'
      and c.relname = any (array[
        'business_members',
        'businesses',
        'knowledge_chunks',
        'knowledge_files',
        'knowledge_items',
        'leads'
      ])
      and acl.grantee not in (
        0::oid,
        pg_catalog.to_regrole('postgres')::oid,
        pg_catalog.to_regrole('anon')::oid,
        pg_catalog.to_regrole('authenticated')::oid,
        pg_catalog.to_regrole('service_role')::oid
      )
  ) or exists (
    select 1
    from pg_catalog.pg_namespace as n
    join pg_catalog.pg_class as c
      on c.relnamespace = n.oid
    join pg_catalog.pg_attribute as a
      on a.attrelid = c.oid
     and a.attnum > 0
     and not a.attisdropped
    cross join lateral pg_catalog.aclexplode(a.attacl) as acl
    where n.nspname = 'public'
      and c.relname = any (array[
        'business_members',
        'businesses',
        'knowledge_chunks',
        'knowledge_files',
        'knowledge_items',
        'leads'
      ])
      and acl.grantee not in (
        0::oid,
        pg_catalog.to_regrole('postgres')::oid,
        pg_catalog.to_regrole('anon')::oid,
        pg_catalog.to_regrole('authenticated')::oid,
        pg_catalog.to_regrole('service_role')::oid
      )
  ) then
    raise exception using
      errcode = '42501',
      message = 'Workspace hardening blocked: an unreviewed table or column grantee exists.';
  end if;

  -- Every named function must resolve exactly once, and the new helper must
  -- not exist under any overload before this migration creates it.
  if pg_catalog.to_regprocedure('public.user_owns_business(uuid)') is null
     or pg_catalog.to_regprocedure(
       'public.is_current_portal_customer(uuid,uuid)'
     ) is null
     or pg_catalog.to_regprocedure(
       'public.redeem_customer_portal_invitation(text,uuid)'
     ) is null
     or pg_catalog.to_regprocedure(
       'public.activate_knowledge_file_version(uuid,uuid)'
     ) is null
     or pg_catalog.to_regprocedure(
       'public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)'
     ) is null
     or pg_catalog.to_regprocedure(
       'public.search_knowledge_chunks(uuid,text,integer)'
     ) is null
     or exists (
       select 1
       from pg_catalog.pg_proc as p
       join pg_catalog.pg_namespace as n
         on n.oid = p.pronamespace
       where n.nspname = 'public'
         and p.proname = 'workspace_business_role'
     ) then
    raise exception using
      errcode = '42883',
      message = 'Workspace hardening blocked: expected function inventory changed.';
  end if;

  if exists (
    with expected(function_name, argument_types) as (
      values
        ('user_owns_business', 'uuid'),
        ('is_current_portal_customer', 'uuid, uuid'),
        ('redeem_customer_portal_invitation', 'text, uuid'),
        ('activate_knowledge_file_version', 'uuid, uuid'),
        ('replace_knowledge_file_chunks', 'uuid, uuid, text, jsonb'),
        ('search_knowledge_chunks', 'uuid, text, integer')
    ), actual as (
      select p.proname as function_name,
        pg_catalog.oidvectortypes(p.proargtypes) as argument_types
      from pg_catalog.pg_proc as p
      join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
      where n.nspname = 'public'
        and p.proname in (
          'user_owns_business',
          'is_current_portal_customer',
          'redeem_customer_portal_invitation',
          'activate_knowledge_file_version',
          'replace_knowledge_file_chunks',
          'search_knowledge_chunks'
        )
    ), differences as (
      (select * from expected except select * from actual)
      union all
      (select * from actual except select * from expected)
    )
    select 1 from differences
  ) then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening blocked: an expected function overload changed.';
  end if;

  -- The complete live dependency export contained exactly these 23 objects.
  -- This blocks both missing reviewed dependencies and newly introduced ones.
  if exists (
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
          '%I.%I policy %I', n.nspname, c.relname, pol.polname
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
      join pg_catalog.pg_class as c on c.oid = pol.polrelid
      join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
    ), function_sources as (
      select
        'pg_catalog.pg_proc'::pg_catalog.regclass as object_classid,
        p.oid as object_oid,
        'FUNCTION'::text as object_type,
        pg_catalog.format(
          '%I.%I(%s)', n.nspname, p.proname,
          pg_catalog.pg_get_function_identity_arguments(p.oid)
        ) as object_identity,
        false as targets_business_members,
        p.prosrc as searchable_source,
        pg_catalog.md5(pg_catalog.pg_get_functiondef(p.oid))
          as body_fingerprint
      from pg_catalog.pg_proc as p
      join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
      where n.nspname not in ('pg_catalog', 'information_schema')
        and p.prokind in ('f', 'p')
    ), object_sources as (
      select * from policy_sources
      union all
      select * from function_sources
    ), actual as (
      select
        sources.object_type,
        sources.object_identity,
        (
          pg_catalog.strpos(
            pg_catalog.lower(sources.searchable_source),
            'user_owns_business'
          ) > 0
          or exists (
            select 1 from pg_catalog.pg_depend as d
            where d.classid = sources.object_classid
              and d.objid = sources.object_oid
              and d.refclassid =
                'pg_catalog.pg_proc'::pg_catalog.regclass
              and d.refobjid = targets.user_owns_business_oid
          )
        ) as references_user_owns_business,
        (
          sources.targets_business_members
          or pg_catalog.strpos(
            pg_catalog.lower(sources.searchable_source),
            'business_members'
          ) > 0
          or exists (
            select 1 from pg_catalog.pg_depend as d
            where d.classid = sources.object_classid
              and d.objid = sources.object_oid
              and d.refclassid =
                'pg_catalog.pg_class'::pg_catalog.regclass
              and d.refobjid = targets.business_members_oid
          )
        ) as references_business_members,
        (
          pg_catalog.strpos(
            pg_catalog.lower(sources.searchable_source),
            'owner_user_id'
          ) > 0
          or exists (
            select 1 from pg_catalog.pg_depend as d
            where d.classid = sources.object_classid
              and d.objid = sources.object_oid
              and d.refclassid =
                'pg_catalog.pg_class'::pg_catalog.regclass
              and d.refobjid = targets.businesses_oid
              and d.refobjsubid = targets.owner_user_id_attnum
          )
        ) as references_owner_user_id,
        sources.body_fingerprint
      from object_sources as sources
      cross join reference_targets as targets
    ), filtered_actual as (
      select * from actual
      where references_user_owns_business
         or references_business_members
         or references_owner_user_id
    ), expected(
      object_type, object_identity,
      references_user_owns_business,
      references_business_members,
      references_owner_user_id,
      body_fingerprint
    ) as (
      values
        ('FUNCTION', 'public.is_current_portal_customer(target_customer_profile_id uuid, target_business_id uuid)', false, true, true, 'fc694713d07b2e6ce94bb124232a21de'),
        ('FUNCTION', 'public.redeem_customer_portal_invitation(p_token_hash text, p_auth_user_id uuid)', false, true, true, '195639e1feefeacb64d3c62658db6376'),
        ('FUNCTION', 'public.user_owns_business(target_business_id uuid)', false, true, true, '77f607ed3738f7bb45ebcee1e89e291e'),
        ('POLICY', 'public.ai_orchestration_logs policy ai_orchestration_logs_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'public.audits policy audits_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'public.automations policy automations_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'public.business_brains policy business_brains_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'public.business_members policy business_members_manage_owned', false, true, true, '4f6347840d16cbf9eca735f55dd17e5b'),
        ('POLICY', 'public.business_members policy business_members_select_owned', true, true, false, '63656a80f6dbf922d2be033e1916ca19'),
        ('POLICY', 'public.business_settings policy business_settings_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'public.businesses policy businesses_select_owned', false, true, true, '85849d3fe2bcca5bfd6cc521f7b58e3a'),
        ('POLICY', 'public.businesses policy businesses_update_owned', false, false, true, '8a683292d94f6da8928a491a11a2a82f'),
        ('POLICY', 'public.calendly_settings policy calendly_settings_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'public.follow_ups policy follow_ups_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'public.knowledge_chunks policy knowledge_chunks_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'public.knowledge_files policy knowledge_files_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'public.knowledge_items policy knowledge_items_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'public.knowledge_processing_logs policy knowledge_processing_logs_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'public.leads policy leads_owned', true, false, false, 'c14825b241088ea9b5f0ac35611fac2d'),
        ('POLICY', 'storage.objects policy knowledge_files_storage_delete_owned', true, false, false, '6dee25484e5cc79a72418753eb6688b2'),
        ('POLICY', 'storage.objects policy knowledge_files_storage_insert_owned', true, false, false, '6dee25484e5cc79a72418753eb6688b2'),
        ('POLICY', 'storage.objects policy knowledge_files_storage_select_owned', true, false, false, '6dee25484e5cc79a72418753eb6688b2'),
        ('POLICY', 'storage.objects policy knowledge_files_storage_update_owned', true, false, false, '0a1d681815fbc10df30e4b797212b88d')
    ), differences as (
      (select * from expected except select * from filtered_actual)
      union all
      (select * from filtered_actual except select * from expected)
    )
    select 1 from differences
  ) then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening blocked: the reviewed 23-object dependency inventory changed.';
  end if;

  -- All 17 legacy-helper policy consumers are authenticated-only. Therefore
  -- removing PUBLIC/anon/service_role EXECUTE cannot break a reviewed caller.
  if (
    select count(*)
    from pg_catalog.pg_policy as pol
    join pg_catalog.pg_class as c on c.oid = pol.polrelid
    join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
    where (
      pg_catalog.strpos(
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
        select 1 from pg_catalog.pg_depend as d
        where d.classid = 'pg_catalog.pg_policy'::pg_catalog.regclass
          and d.objid = pol.oid
          and d.refclassid = 'pg_catalog.pg_proc'::pg_catalog.regclass
          and d.refobjid = pg_catalog.to_regprocedure(
            'public.user_owns_business(uuid)'
          )
      )
    )
      and pol.polroles = array[
        pg_catalog.to_regrole('authenticated')::oid
      ]
  ) <> 17 then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening blocked: legacy-helper policy roles changed.';
  end if;

  -- Exact reviewed target-policy inventory: eight policies are replaced and
  -- the anonymous lead-capture policy is retained byte-for-intent.
  if exists (
    with expected(
      policy_name, table_name, command, role_name, body_hash, is_permissive
    ) as (
      values
        ('business_members_manage_owned', 'business_members', 'ALL', 'authenticated', '4f6347840d16cbf9eca735f55dd17e5b', true),
        ('business_members_select_owned', 'business_members', 'SELECT', 'authenticated', '63656a80f6dbf922d2be033e1916ca19', true),
        ('businesses_select_owned', 'businesses', 'SELECT', 'authenticated', '85849d3fe2bcca5bfd6cc521f7b58e3a', true),
        ('businesses_update_owned', 'businesses', 'UPDATE', 'authenticated', '8a683292d94f6da8928a491a11a2a82f', true),
        ('knowledge_chunks_owned', 'knowledge_chunks', 'ALL', 'authenticated', 'c14825b241088ea9b5f0ac35611fac2d', true),
        ('knowledge_files_owned', 'knowledge_files', 'ALL', 'authenticated', 'c14825b241088ea9b5f0ac35611fac2d', true),
        ('knowledge_items_owned', 'knowledge_items', 'ALL', 'authenticated', 'c14825b241088ea9b5f0ac35611fac2d', true),
        ('leads_owned', 'leads', 'ALL', 'authenticated', 'c14825b241088ea9b5f0ac35611fac2d', true),
        ('Allow anonymous lead inserts', 'leads', 'INSERT', 'anon', 'b326b5062b2f0e69046810717534cb09', true)
    ), actual as (
      select
        pol.polname::text as policy_name,
        c.relname::text as table_name,
        case pol.polcmd
          when '*' then 'ALL'
          when 'r' then 'SELECT'
          when 'a' then 'INSERT'
          when 'w' then 'UPDATE'
          when 'd' then 'DELETE'
        end as command,
        case when pol.polroles = array[
          pg_catalog.to_regrole('authenticated')::oid
        ] then 'authenticated'
          when pol.polroles = array[
            pg_catalog.to_regrole('anon')::oid
          ] then 'anon'
          else pg_catalog.array_to_string(pol.polroles, ',') end as role_name,
        pg_catalog.md5(
          pg_catalog.concat_ws(
            E'\n',
            pg_catalog.pg_get_expr(pol.polqual, pol.polrelid, true),
            pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid, true)
          )
        ) as body_hash,
        pol.polpermissive as is_permissive
      from pg_catalog.pg_policy as pol
      join pg_catalog.pg_class as c on c.oid = pol.polrelid
      join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = any (array[
          'business_members', 'businesses', 'knowledge_chunks',
          'knowledge_files', 'knowledge_items', 'leads'
        ])
    ), differences as (
      (select * from expected except select * from actual)
      union all
      (select * from actual except select * from expected)
    )
    select 1 from differences
  ) then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening blocked: target policy inventory changed.';
  end if;

  -- Pin the reviewed public-schema defaults without changing them. Any future
  -- hardening remains a distinct P0 migration and approval event.
  with relevant_defaults as (
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
  )
  select
    count(*),
    pg_catalog.md5(
      pg_catalog.string_agg(
        pg_catalog.concat_ws(
          '|', object_creator, schema_name, object_type, grantee,
          privilege_type, is_grantable::text, grantor
        ),
        E'\n' order by object_creator, object_type, grantee, privilege_type
      )
    )
  into default_acl_count, default_acl_fingerprint
  from relevant_defaults;

  if default_acl_count <> 72
     or default_acl_fingerprint <> 'd130bd119407ee6906ad6a9c3618970c'
     or exists (
       select 1
       from pg_catalog.pg_default_acl as d
       join pg_catalog.pg_namespace as n
         on n.oid = d.defaclnamespace
        and n.nspname = 'public'
       cross join lateral pg_catalog.aclexplode(d.defaclacl) as acl
       where acl.grantee not in (
         0::oid,
         d.defaclrole,
         pg_catalog.to_regrole('anon')::oid,
         pg_catalog.to_regrole('authenticated')::oid,
         pg_catalog.to_regrole('service_role')::oid
       )
         -- Supabase's reviewed public-schema defaults grant its postgres
         -- administrative role the standard object privileges for objects
         -- created by supabase_admin. Keep these internal grants outside the
         -- API-role fingerprint, but accept only the exact non-grantable
         -- creator/grantor/object/privilege shape documented by Supabase.
         and not (
           d.defaclrole = pg_catalog.to_regrole('supabase_admin')::oid
           and acl.grantee = pg_catalog.to_regrole('postgres')::oid
           and acl.grantor = d.defaclrole
           and acl.is_grantable is false
           and (
             (
               d.defaclobjtype = 'f'
               and acl.privilege_type = 'EXECUTE'
             )
             or (
               d.defaclobjtype = 'S'
               and acl.privilege_type in ('SELECT', 'UPDATE', 'USAGE')
             )
             or (
               d.defaclobjtype = 'r'
               and acl.privilege_type in (
                 'DELETE', 'INSERT', 'MAINTAIN', 'REFERENCES',
                 'SELECT', 'TRIGGER', 'TRUNCATE', 'UPDATE'
               )
             )
           )
         )
     ) then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening blocked: deferred public default privileges changed.';
  end if;
end
$block$;

-- Pin the reviewed EXECUTE matrix before changing either identity helper.
do $block$
begin
  if exists (
    with expected(signature, role_name, has_execute) as (
      values
        ('public.user_owns_business(uuid)', 'PUBLIC', true),
        ('public.user_owns_business(uuid)', 'anon', true),
        ('public.user_owns_business(uuid)', 'authenticated', true),
        ('public.user_owns_business(uuid)', 'service_role', true),
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
      select expected.*,
        pg_catalog.to_regprocedure(expected.signature) as function_oid
      from expected
    ), actual as (
      select
        resolved.signature,
        resolved.role_name,
        resolved.has_execute as expected_execute,
        case
          when resolved.role_name = 'PUBLIC' and p.proacl is null then true
          when resolved.role_name = 'PUBLIC' then exists (
            select 1
            from pg_catalog.aclexplode(p.proacl) as acl
            where acl.grantee = 0
              and acl.privilege_type = 'EXECUTE'
          )
          else pg_catalog.has_function_privilege(
            pg_catalog.to_regrole(resolved.role_name)::oid,
            resolved.function_oid,
            'EXECUTE'
          )
        end as actual_execute,
        case
          when resolved.role_name = 'PUBLIC' and p.proacl is null then false
          when resolved.role_name = 'PUBLIC' then exists (
            select 1
            from pg_catalog.aclexplode(p.proacl) as acl
            where acl.grantee = 0
              and acl.privilege_type = 'EXECUTE'
              and acl.is_grantable
          )
          else pg_catalog.has_function_privilege(
            pg_catalog.to_regrole(resolved.role_name)::oid,
            resolved.function_oid,
            'EXECUTE WITH GRANT OPTION'
          )
        end as actual_grant_option
      from resolved
      join pg_catalog.pg_proc as p on p.oid = resolved.function_oid
    )
    select 1 from actual
    where actual_execute is distinct from expected_execute
       or actual_grant_option
  ) or exists (
    select 1
    from pg_catalog.pg_proc as p
    cross join lateral pg_catalog.aclexplode(p.proacl) as acl
    where p.oid in (
      pg_catalog.to_regprocedure('public.user_owns_business(uuid)'),
      pg_catalog.to_regprocedure(
        'public.is_current_portal_customer(uuid,uuid)'
      ),
      pg_catalog.to_regprocedure(
        'public.redeem_customer_portal_invitation(text,uuid)'
      ),
      pg_catalog.to_regprocedure(
        'public.activate_knowledge_file_version(uuid,uuid)'
      ),
      pg_catalog.to_regprocedure(
        'public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)'
      ),
      pg_catalog.to_regprocedure(
        'public.search_knowledge_chunks(uuid,text,integer)'
      )
    )
      and (
        acl.grantee not in (
          0::oid,
          p.proowner,
          pg_catalog.to_regrole('anon')::oid,
          pg_catalog.to_regrole('authenticated')::oid,
          pg_catalog.to_regrole('service_role')::oid
        )
        or (acl.is_grantable and acl.grantee <> p.proowner)
      )
  ) then
    raise exception using
      errcode = '42501',
      message = 'Workspace hardening blocked: reviewed function privileges changed.';
  end if;
end
$block$;

-- New memberships must no longer acquire an owner label by omission.
-- Existing role values are deliberately not rewritten because the live export
-- did not include a role-value distribution. Stored legacy role labels are not
-- used as authority by workspace_business_role().
alter table public.business_members
  alter column role set default 'member'::text;

-- Owner authority comes only from the explicit businesses.owner_user_id link.
-- Any authenticated membership carrying one of the two supported role labels
-- is treated as a member; a legacy owner label never grants owner authority.
-- Unknown role values fail closed. The join to businesses prevents an orphan
-- membership from becoming a tenant authority source.
create function public.workspace_business_role(target_business_id uuid)
returns text
language sql
stable
security definer
set search_path to 'pg_catalog'
as $function$
  select case
    when exists (
      select 1
      from public.businesses as b
      where b.id = target_business_id
        and b.owner_user_id = auth.uid()
    ) then 'owner'::text
    when exists (
      select 1
      from public.businesses as b
      join public.business_members as bm
        on bm.business_id = b.id
      where b.id = target_business_id
        and bm.user_id = auth.uid()
        and bm.role in ('owner'::text, 'member'::text)
    ) then 'member'::text
    else null::text
  end;
$function$;

alter function public.workspace_business_role(uuid) owner to postgres;

revoke all on function public.workspace_business_role(uuid)
  from public, anon, authenticated, service_role;

grant execute on function public.workspace_business_role(uuid)
  to authenticated;

-- Every reviewed user_owns_business() policy consumer is authenticated-only.
-- service_role bypasses the unforced RLS policies and has no reviewed RPC use,
-- so the legacy helper is also reduced to authenticated-only EXECUTE.
revoke all on function public.user_owns_business(uuid)
  from public, anon, authenticated, service_role;

grant execute on function public.user_owns_business(uuid)
  to authenticated;

-- Remove only the eight authenticated policies evidenced by the live export.
-- The existing anonymous lead-insert policy is intentionally preserved.
drop policy business_members_manage_owned
  on public.business_members;

drop policy business_members_select_owned
  on public.business_members;

drop policy businesses_select_owned
  on public.businesses;

drop policy businesses_update_owned
  on public.businesses;

drop policy knowledge_chunks_owned
  on public.knowledge_chunks;

drop policy knowledge_files_owned
  on public.knowledge_files;

drop policy knowledge_items_owned
  on public.knowledge_items;

drop policy leads_owned
  on public.leads;

-- Remove all browser/API grants, including RLS-bypassing TRUNCATE, and rebuild
-- a least-privilege allowlist.
revoke all privileges on table
  public.business_members,
  public.businesses,
  public.knowledge_chunks,
  public.knowledge_files,
  public.knowledge_items,
  public.leads
from public, anon, authenticated, service_role;

-- Table-level REVOKE does not remove independently granted column ACLs.
-- Remove those explicitly before rebuilding the reviewed column allowlist.
do $block$
declare
  target record;
begin
  for target in
    select
      n.nspname as schema_name,
      c.relname as table_name,
      pg_catalog.string_agg(
        pg_catalog.quote_ident(a.attname),
        ', ' order by a.attnum
      ) as column_list
    from pg_catalog.pg_namespace as n
    join pg_catalog.pg_class as c
      on c.relnamespace = n.oid
    join pg_catalog.pg_attribute as a
      on a.attrelid = c.oid
     and a.attnum > 0
     and not a.attisdropped
    where n.nspname = 'public'
      and c.relname = any (array[
        'business_members',
        'businesses',
        'knowledge_chunks',
        'knowledge_files',
        'knowledge_items',
        'leads'
      ])
    group by n.nspname, c.relname
  loop
    execute pg_catalog.format(
      'revoke all privileges (%s) on table %I.%I from public, anon, authenticated, service_role',
      target.column_list,
      target.schema_name,
      target.table_name
    );
  end loop;
end
$block$;

-- The trusted server path receives exact DML only. TRUNCATE, REFERENCES,
-- TRIGGER, MAINTAIN, and every grant option remain revoked.
grant select, insert, update, delete on table
  public.business_members,
  public.businesses,
  public.knowledge_chunks,
  public.knowledge_files,
  public.knowledge_items,
  public.leads
to service_role;

grant select on table
  public.business_members,
  public.businesses,
  public.knowledge_chunks,
  public.knowledge_files,
  public.knowledge_items,
  public.leads
to authenticated;

-- Business ownership, plan, status, identifiers, and timestamps remain
-- server-controlled.
grant update (name)
  on table public.businesses
  to authenticated;

-- Owners may add only ordinary members through RLS. The policy below prevents
-- an authenticated caller from inserting any other role value.
grant insert (business_id, user_id, role)
  on table public.business_members
  to authenticated;

grant delete
  on table public.business_members
  to authenticated;

-- Authenticated Workspace actors may create tenant-bound leads without
-- supplying database-generated identifiers or timestamps.
grant insert (
  first_name,
  business_name,
  business_type,
  email,
  phone,
  biggest_problem,
  ai_recommendations,
  conversation,
  status,
  notes,
  is_test,
  booked_date,
  calendly_event_uri,
  calendly_invitee_uri,
  meeting_status,
  source,
  owner_email_sent,
  prospect_email_sent,
  email_error,
  follow_up_status,
  last_follow_up_at,
  follow_up_count,
  booked_meeting,
  business_id
)
  on table public.leads
  to authenticated;

-- business_id is intentionally excluded so a row cannot be moved between
-- tenants through an authenticated update.
grant update (
  first_name,
  business_name,
  business_type,
  email,
  phone,
  biggest_problem,
  ai_recommendations,
  conversation,
  status,
  notes,
  is_test,
  booked_date,
  calendly_event_uri,
  calendly_invitee_uri,
  meeting_status,
  source,
  owner_email_sent,
  prospect_email_sent,
  email_error,
  follow_up_status,
  last_follow_up_at,
  follow_up_count,
  booked_meeting
)
  on table public.leads
  to authenticated;

grant delete
  on table public.leads
  to authenticated;

-- Retain a constrained anonymous lead-capture path. Tenant, status, notes,
-- automation state, identifiers, and timestamps cannot be supplied by anon;
-- business_id continues to use the evidenced live default.
grant insert (
  first_name,
  business_name,
  business_type,
  email,
  phone,
  biggest_problem,
  ai_recommendations,
  conversation,
  source
)
  on table public.leads
  to anon;

create policy businesses_workspace_select
on public.businesses
as permissive
for select
to authenticated
using (
  public.workspace_business_role(businesses.id) is not null
);

create policy businesses_workspace_owner_update
on public.businesses
as permissive
for update
to authenticated
using (
  public.workspace_business_role(businesses.id) = 'owner'::text
)
with check (
  public.workspace_business_role(businesses.id) = 'owner'::text
);

create policy business_members_workspace_select
on public.business_members
as permissive
for select
to authenticated
using (
  public.workspace_business_role(business_members.business_id) is not null
);

create policy business_members_workspace_owner_insert
on public.business_members
as permissive
for insert
to authenticated
with check (
  public.workspace_business_role(business_members.business_id) = 'owner'::text
  and business_members.role = 'member'::text
);

create policy business_members_workspace_owner_delete
on public.business_members
as permissive
for delete
to authenticated
using (
  public.workspace_business_role(business_members.business_id) = 'owner'::text
);

create policy leads_workspace_select
on public.leads
as permissive
for select
to authenticated
using (
  public.workspace_business_role(leads.business_id) is not null
);

create policy leads_workspace_insert
on public.leads
as permissive
for insert
to authenticated
with check (
  public.workspace_business_role(leads.business_id) is not null
);

create policy leads_workspace_update
on public.leads
as permissive
for update
to authenticated
using (
  public.workspace_business_role(leads.business_id) is not null
)
with check (
  public.workspace_business_role(leads.business_id) is not null
);

create policy leads_workspace_owner_delete
on public.leads
as permissive
for delete
to authenticated
using (
  public.workspace_business_role(leads.business_id) = 'owner'::text
);

-- Authenticated users receive read-only Knowledge access. All version-changing
-- operations remain on the existing trusted service-role path.
create policy knowledge_chunks_workspace_select
on public.knowledge_chunks
as permissive
for select
to authenticated
using (
  public.workspace_business_role(knowledge_chunks.business_id) is not null
);

create policy knowledge_files_workspace_select
on public.knowledge_files
as permissive
for select
to authenticated
using (
  public.workspace_business_role(knowledge_files.business_id) is not null
);

create policy knowledge_items_workspace_select
on public.knowledge_items
as permissive
for select
to authenticated
using (
  public.workspace_business_role(knowledge_items.business_id) is not null
);

-- PRE-COMMIT CONTRACT: abort the transaction if any final security boundary
-- differs from the reviewed allowlists. These checks run before NOTIFY/COMMIT.
do $block$
declare
  default_acl_count bigint;
  default_acl_fingerprint text;
begin
  -- The accepted ownerless record remains exactly as reviewed and fail-closed.
  if (
    select count(*)
    from public.businesses as b
    where b.owner_user_id is null
  ) <> 1
     or not exists (
       select 1
       from public.businesses as b
       where b.id = '00000000-0000-0000-0000-000000000001'::uuid
         and b.owner_user_id is null
     )
     or exists (
       select 1
       from public.business_members as bm
       where bm.business_id =
         '00000000-0000-0000-0000-000000000001'::uuid
     ) then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening post-check failed: ownerless-business baseline changed.';
  end if;

  if exists (
    select 1
    from public.business_members as bm
    left join public.businesses as b on b.id = bm.business_id
    left join auth.users as u on u.id = bm.user_id
    where bm.role is null
       or bm.role not in ('owner'::text, 'member'::text)
       or b.id is null
       or u.id is null
  ) then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening post-check failed: membership integrity changed.';
  end if;

  if exists (
    select 1
    from public.businesses as b
    left join auth.users as u on u.id = b.owner_user_id
    where b.owner_user_id is not null
      and u.id is null
  ) then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening post-check failed: assigned owner integrity changed.';
  end if;

  -- Exact identity/Knowledge EXECUTE contract. user_owns_business and the new
  -- helper are authenticated-only; Knowledge transactions remain service-only.
  if exists (
    with expected(signature, role_name, has_execute) as (
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
      select expected.*,
        pg_catalog.to_regprocedure(expected.signature) as function_oid
      from expected
    ), actual as (
      select
        resolved.signature,
        resolved.role_name,
        resolved.has_execute as expected_execute,
        resolved.function_oid,
        case
          when resolved.role_name = 'PUBLIC' and p.proacl is null then true
          when resolved.role_name = 'PUBLIC' then exists (
            select 1 from pg_catalog.aclexplode(p.proacl) as acl
            where acl.grantee = 0
              and acl.privilege_type = 'EXECUTE'
          )
          else pg_catalog.has_function_privilege(
            pg_catalog.to_regrole(resolved.role_name)::oid,
            resolved.function_oid,
            'EXECUTE'
          )
        end as actual_execute,
        case
          when resolved.role_name = 'PUBLIC' and p.proacl is null then false
          when resolved.role_name = 'PUBLIC' then exists (
            select 1 from pg_catalog.aclexplode(p.proacl) as acl
            where acl.grantee = 0
              and acl.privilege_type = 'EXECUTE'
              and acl.is_grantable
          )
          else pg_catalog.has_function_privilege(
            pg_catalog.to_regrole(resolved.role_name)::oid,
            resolved.function_oid,
            'EXECUTE WITH GRANT OPTION'
          )
        end as actual_grant_option
      from resolved
      left join pg_catalog.pg_proc as p on p.oid = resolved.function_oid
    )
    select 1 from actual
    where function_oid is null
       or actual_execute is distinct from expected_execute
       or actual_grant_option
  ) or exists (
    select 1
    from pg_catalog.pg_proc as p
    cross join lateral pg_catalog.aclexplode(p.proacl) as acl
    where p.oid in (
      pg_catalog.to_regprocedure('public.user_owns_business(uuid)'),
      pg_catalog.to_regprocedure('public.workspace_business_role(uuid)'),
      pg_catalog.to_regprocedure(
        'public.activate_knowledge_file_version(uuid,uuid)'
      ),
      pg_catalog.to_regprocedure(
        'public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)'
      ),
      pg_catalog.to_regprocedure(
        'public.search_knowledge_chunks(uuid,text,integer)'
      )
    )
      and (
        acl.is_grantable
        and acl.grantee <> p.proowner
        or acl.grantee not in (
          p.proowner,
          pg_catalog.to_regrole('authenticated')::oid,
          pg_catalog.to_regrole('service_role')::oid
        )
      )
  ) then
    raise exception using
      errcode = '42501',
      message = 'Workspace hardening post-check failed: function privilege contract differs.';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_proc as p
    join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
    join pg_catalog.pg_language as l on l.oid = p.prolang
    where n.nspname = 'public'
      and p.proname = 'workspace_business_role'
      and pg_catalog.pg_get_function_identity_arguments(p.oid) =
        'target_business_id uuid'
      and pg_catalog.pg_get_function_result(p.oid) = 'text'
      and p.proowner = pg_catalog.to_regrole('postgres')::oid
      and l.lanname = 'sql'
      and p.prosecdef
      and p.provolatile = 's'
      and p.proconfig = array['search_path=pg_catalog']
      and pg_catalog.md5(
        pg_catalog.replace(
          pg_catalog.replace(p.prosrc, E'\r\n', E'\n'),
          E'\r',
          E'\n'
        )
      ) =
        '5cb186fb9ab6d9eece3868da4259521e'
  ) or (
    select count(*)
    from pg_catalog.pg_proc as p
    join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'workspace_business_role'
  ) <> 1 then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening post-check failed: helper definition differs.';
  end if;

  -- Customer Portal functions were part of the 23-object baseline and must
  -- remain byte-identical. The legacy helper body is also unchanged.
  if pg_catalog.md5(pg_catalog.pg_get_functiondef(
       pg_catalog.to_regprocedure(
         'public.is_current_portal_customer(uuid,uuid)'
       )
     )) <> 'fc694713d07b2e6ce94bb124232a21de'
     or pg_catalog.md5(pg_catalog.pg_get_functiondef(
       pg_catalog.to_regprocedure(
         'public.redeem_customer_portal_invitation(text,uuid)'
       )
     )) <> '195639e1feefeacb64d3c62658db6376'
     or pg_catalog.md5(pg_catalog.pg_get_functiondef(
       pg_catalog.to_regprocedure('public.user_owns_business(uuid)')
     )) <> '77f607ed3738f7bb45ebcee1e89e291e' then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening post-check failed: preserved function definition changed.';
  end if;

  -- Exact 13-policy target inventory after replacement.
  if exists (
    with expected(
      table_name, policy_name, command, role_name,
      expected_qual, expected_with_check
    ) as (
      values
        ('businesses', 'businesses_workspace_select', 'SELECT', 'authenticated', '(workspace_business_role(id) IS NOT NULL)', '<null>'),
        ('businesses', 'businesses_workspace_owner_update', 'UPDATE', 'authenticated', '(workspace_business_role(id) = ''owner''::text)', '(workspace_business_role(id) = ''owner''::text)'),
        ('business_members', 'business_members_workspace_select', 'SELECT', 'authenticated', '(workspace_business_role(business_id) IS NOT NULL)', '<null>'),
        ('business_members', 'business_members_workspace_owner_insert', 'INSERT', 'authenticated', '<null>', '((workspace_business_role(business_id) = ''owner''::text) AND (role = ''member''::text))'),
        ('business_members', 'business_members_workspace_owner_delete', 'DELETE', 'authenticated', '(workspace_business_role(business_id) = ''owner''::text)', '<null>'),
        ('leads', 'Allow anonymous lead inserts', 'INSERT', 'anon', '<null>', 'true'),
        ('leads', 'leads_workspace_select', 'SELECT', 'authenticated', '(workspace_business_role(business_id) IS NOT NULL)', '<null>'),
        ('leads', 'leads_workspace_insert', 'INSERT', 'authenticated', '<null>', '(workspace_business_role(business_id) IS NOT NULL)'),
        ('leads', 'leads_workspace_update', 'UPDATE', 'authenticated', '(workspace_business_role(business_id) IS NOT NULL)', '(workspace_business_role(business_id) IS NOT NULL)'),
        ('leads', 'leads_workspace_owner_delete', 'DELETE', 'authenticated', '(workspace_business_role(business_id) = ''owner''::text)', '<null>'),
        ('knowledge_chunks', 'knowledge_chunks_workspace_select', 'SELECT', 'authenticated', '(workspace_business_role(business_id) IS NOT NULL)', '<null>'),
        ('knowledge_files', 'knowledge_files_workspace_select', 'SELECT', 'authenticated', '(workspace_business_role(business_id) IS NOT NULL)', '<null>'),
        ('knowledge_items', 'knowledge_items_workspace_select', 'SELECT', 'authenticated', '(workspace_business_role(business_id) IS NOT NULL)', '<null>')
    ), actual as (
      select
        p.tablename::text as table_name,
        p.policyname::text as policy_name,
        p.cmd::text as command,
        case
          when p.permissive <> 'PERMISSIVE' then
            'RESTRICTIVE:' || pg_catalog.array_to_string(p.roles, ',')
          when p.roles = array['authenticated']::name[] then 'authenticated'
          when p.roles = array['anon']::name[] then 'anon'
          else pg_catalog.array_to_string(p.roles, ',')
        end as role_name,
        coalesce(p.qual, '<null>') as expected_qual,
        coalesce(p.with_check, '<null>') as expected_with_check
      from pg_catalog.pg_policies as p
      where p.schemaname = 'public'
        and p.tablename = any (array[
          'business_members', 'businesses', 'knowledge_chunks',
          'knowledge_files', 'knowledge_items', 'leads'
        ])
    ), differences as (
      (select * from expected except select * from actual)
      union all
      (select * from actual except select * from expected)
    )
    select 1 from differences
  ) then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening post-check failed: policy inventory differs.';
  end if;

  -- The 12 out-of-scope authenticated policies that use the legacy helper,
  -- including all four Storage policies, must remain exact.
  if exists (
    with expected(
      object_identity, body_fingerprint, role_name, command, is_permissive
    ) as (
      values
        ('public.ai_orchestration_logs policy ai_orchestration_logs_owned', 'c14825b241088ea9b5f0ac35611fac2d', 'authenticated', 'ALL', true),
        ('public.audits policy audits_owned', 'c14825b241088ea9b5f0ac35611fac2d', 'authenticated', 'ALL', true),
        ('public.automations policy automations_owned', 'c14825b241088ea9b5f0ac35611fac2d', 'authenticated', 'ALL', true),
        ('public.business_brains policy business_brains_owned', 'c14825b241088ea9b5f0ac35611fac2d', 'authenticated', 'ALL', true),
        ('public.business_settings policy business_settings_owned', 'c14825b241088ea9b5f0ac35611fac2d', 'authenticated', 'ALL', true),
        ('public.calendly_settings policy calendly_settings_owned', 'c14825b241088ea9b5f0ac35611fac2d', 'authenticated', 'ALL', true),
        ('public.follow_ups policy follow_ups_owned', 'c14825b241088ea9b5f0ac35611fac2d', 'authenticated', 'ALL', true),
        ('public.knowledge_processing_logs policy knowledge_processing_logs_owned', 'c14825b241088ea9b5f0ac35611fac2d', 'authenticated', 'ALL', true),
        ('storage.objects policy knowledge_files_storage_delete_owned', '6dee25484e5cc79a72418753eb6688b2', 'authenticated', 'DELETE', true),
        ('storage.objects policy knowledge_files_storage_insert_owned', '6dee25484e5cc79a72418753eb6688b2', 'authenticated', 'INSERT', true),
        ('storage.objects policy knowledge_files_storage_select_owned', '6dee25484e5cc79a72418753eb6688b2', 'authenticated', 'SELECT', true),
        ('storage.objects policy knowledge_files_storage_update_owned', '0a1d681815fbc10df30e4b797212b88d', 'authenticated', 'UPDATE', true)
    ), actual as (
      select
        pg_catalog.format(
          '%I.%I policy %I', n.nspname, c.relname, pol.polname
        ) as object_identity,
        pg_catalog.md5(
          pg_catalog.concat_ws(
            E'\n',
            pg_catalog.pg_get_expr(pol.polqual, pol.polrelid, true),
            pg_catalog.pg_get_expr(pol.polwithcheck, pol.polrelid, true)
          )
        ) as body_fingerprint,
        case
          when pol.polroles = array[
            pg_catalog.to_regrole('authenticated')::oid
          ] then 'authenticated'
          else pg_catalog.array_to_string(pol.polroles, ',')
        end as role_name,
        case pol.polcmd
          when '*' then 'ALL'
          when 'r' then 'SELECT'
          when 'a' then 'INSERT'
          when 'w' then 'UPDATE'
          when 'd' then 'DELETE'
        end as command,
        pol.polpermissive as is_permissive
      from pg_catalog.pg_policy as pol
      join pg_catalog.pg_class as c on c.oid = pol.polrelid
      join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
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
           from pg_catalog.pg_depend as d
           where d.classid = 'pg_catalog.pg_policy'::pg_catalog.regclass
             and d.objid = pol.oid
             and d.refclassid = 'pg_catalog.pg_proc'::pg_catalog.regclass
             and d.refobjid = pg_catalog.to_regprocedure(
               'public.user_owns_business(uuid)'
             )
         )
    ), differences as (
      (select * from expected except select * from actual)
      union all
      (select * from actual except select * from expected)
    )
    select 1 from differences
  ) or exists (
    select 1
    from pg_catalog.pg_proc as p
    join pg_catalog.pg_namespace as n on n.oid = p.pronamespace
    where n.nspname not in ('pg_catalog', 'information_schema')
      and p.oid <> pg_catalog.to_regprocedure(
        'public.user_owns_business(uuid)'
      )
      and (
        pg_catalog.strpos(
          pg_catalog.lower(p.prosrc), 'user_owns_business'
        ) > 0
        or exists (
          select 1
          from pg_catalog.pg_depend as d
          where d.classid = 'pg_catalog.pg_proc'::pg_catalog.regclass
            and d.objid = p.oid
            and d.refclassid = 'pg_catalog.pg_proc'::pg_catalog.regclass
            and d.refobjid = pg_catalog.to_regprocedure(
              'public.user_owns_business(uuid)'
            )
        )
      )
  ) then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening post-check failed: preserved policy changed.';
  end if;

  -- Exact effective 4-role x 6-table x 8-privilege matrix. Column-only grants
  -- intentionally remain false at table level.
  if exists (
    with target_tables(table_name) as (
      values ('business_members'), ('businesses'), ('knowledge_chunks'),
        ('knowledge_files'), ('knowledge_items'), ('leads')
    ), target_roles(role_name) as (
      values ('PUBLIC'), ('anon'), ('authenticated'), ('service_role')
    ), target_privileges(privilege_name) as (
      values ('SELECT'), ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE'),
        ('REFERENCES'), ('TRIGGER'), ('MAINTAIN')
    ), matrix as (
      select
        tables.table_name,
        roles.role_name,
        privileges.privilege_name,
        case
          when roles.role_name = 'service_role' then
            privileges.privilege_name in ('SELECT', 'INSERT', 'UPDATE', 'DELETE')
          when roles.role_name = 'authenticated' then
            privileges.privilege_name = 'SELECT'
            or (
              tables.table_name in ('business_members', 'leads')
              and privileges.privilege_name = 'DELETE'
            )
          else false
        end as expected_privilege,
        c.oid,
        c.relacl
      from target_tables as tables
      cross join target_roles as roles
      cross join target_privileges as privileges
      join pg_catalog.pg_namespace as n on n.nspname = 'public'
      join pg_catalog.pg_class as c
        on c.relnamespace = n.oid
       and c.relname = tables.table_name
    ), actual as (
      select matrix.*,
        case
          when role_name = 'PUBLIC' then exists (
            select 1
            from pg_catalog.aclexplode(
              case when relacl is null
                then pg_catalog.acldefault('r'::"char", (
                  select relowner from pg_catalog.pg_class where oid = matrix.oid
                ))
                else relacl end
            ) as acl
            where acl.grantee = 0
              and acl.privilege_type = matrix.privilege_name
          )
          else pg_catalog.has_table_privilege(
            pg_catalog.to_regrole(role_name)::oid,
            oid,
            privilege_name
          )
        end as actual_privilege,
        case
          when role_name = 'PUBLIC' then exists (
            select 1
            from pg_catalog.aclexplode(relacl) as acl
            where acl.grantee = 0
              and acl.privilege_type = matrix.privilege_name
              and acl.is_grantable
          )
          else pg_catalog.has_table_privilege(
            pg_catalog.to_regrole(role_name)::oid,
            oid,
            privilege_name || ' WITH GRANT OPTION'
          )
        end as actual_grant_option
      from matrix
    )
    select 1 from actual
    where actual_privilege is distinct from expected_privilege
       or actual_grant_option
  ) then
    raise exception using
      errcode = '42501',
      message = 'Workspace hardening post-check failed: table privilege matrix differs.';
  end if;

  -- Exact effective column allowlist for anon/authenticated/service_role.
  if exists (
    with target_columns as (
      select c.relname::text as table_name, c.oid, a.attnum, a.attname::text
      from pg_catalog.pg_namespace as n
      join pg_catalog.pg_class as c on c.relnamespace = n.oid
      join pg_catalog.pg_attribute as a
        on a.attrelid = c.oid
       and a.attnum > 0
       and not a.attisdropped
      where n.nspname = 'public'
        and c.relname = any (array[
          'business_members', 'businesses', 'knowledge_chunks',
          'knowledge_files', 'knowledge_items', 'leads'
        ])
    ), target_roles(role_name) as (
      values ('anon'), ('authenticated'), ('service_role')
    ), target_privileges(privilege_name) as (
      values ('SELECT'), ('INSERT'), ('UPDATE'), ('REFERENCES')
    ), expected as (
      select
        columns.*,
        roles.role_name,
        privileges.privilege_name,
        case
          when roles.role_name = 'service_role' then
            privileges.privilege_name in ('SELECT', 'INSERT', 'UPDATE')
          when roles.role_name = 'authenticated'
               and privileges.privilege_name = 'SELECT' then true
          when roles.role_name = 'authenticated'
               and privileges.privilege_name = 'INSERT' then
            (
              columns.table_name = 'business_members'
              and columns.attname in ('business_id', 'user_id', 'role')
            ) or (
              columns.table_name = 'leads'
              and columns.attname not in ('id', 'created_at')
            )
          when roles.role_name = 'authenticated'
               and privileges.privilege_name = 'UPDATE' then
            (
              columns.table_name = 'businesses'
              and columns.attname = 'name'
            ) or (
              columns.table_name = 'leads'
              and columns.attname not in ('id', 'created_at', 'business_id')
            )
          when roles.role_name = 'anon'
               and privileges.privilege_name = 'INSERT' then
            columns.table_name = 'leads'
            and columns.attname in (
              'first_name', 'business_name', 'business_type', 'email',
              'phone', 'biggest_problem', 'ai_recommendations',
              'conversation', 'source'
            )
          else false
        end as expected_privilege
      from target_columns as columns
      cross join target_roles as roles
      cross join target_privileges as privileges
    )
    select 1
    from expected
    where pg_catalog.has_column_privilege(
      pg_catalog.to_regrole(role_name)::oid,
      oid,
      attnum,
      privilege_name
    ) is distinct from expected_privilege
       or pg_catalog.has_column_privilege(
         pg_catalog.to_regrole(role_name)::oid,
         oid,
         attnum,
         privilege_name || ' WITH GRANT OPTION'
       )
  ) then
    raise exception using
      errcode = '42501',
      message = 'Workspace hardening post-check failed: column privilege matrix differs.';
  end if;

  -- Direct ACLs must contain no grantee outside the reviewed role set.
  if exists (
    select 1
    from pg_catalog.pg_namespace as n
    join pg_catalog.pg_class as c on c.relnamespace = n.oid
    cross join lateral pg_catalog.aclexplode(c.relacl) as acl
    where n.nspname = 'public'
      and c.relname = any (array[
        'business_members', 'businesses', 'knowledge_chunks',
        'knowledge_files', 'knowledge_items', 'leads'
      ])
      and acl.grantee not in (
        c.relowner,
        pg_catalog.to_regrole('anon')::oid,
        pg_catalog.to_regrole('authenticated')::oid,
        pg_catalog.to_regrole('service_role')::oid
      )
  ) or exists (
    select 1
    from pg_catalog.pg_namespace as n
    join pg_catalog.pg_class as c on c.relnamespace = n.oid
    join pg_catalog.pg_attribute as a
      on a.attrelid = c.oid and a.attnum > 0 and not a.attisdropped
    cross join lateral pg_catalog.aclexplode(a.attacl) as acl
    where n.nspname = 'public'
      and c.relname = any (array[
        'business_members', 'businesses', 'knowledge_chunks',
        'knowledge_files', 'knowledge_items', 'leads'
      ])
      and acl.grantee not in (
        c.relowner,
        pg_catalog.to_regrole('anon')::oid,
        pg_catalog.to_regrole('authenticated')::oid,
        pg_catalog.to_regrole('service_role')::oid
      )
  ) then
    raise exception using
      errcode = '42501',
      message = 'Workspace hardening post-check failed: unexpected direct grantee exists.';
  end if;

  -- Prove the explicitly deferred default-ACL boundary was not changed.
  with relevant_defaults as (
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
      case acl.grantee when 0 then 'PUBLIC'
        else pg_catalog.pg_get_userbyid(acl.grantee) end as grantee,
      acl.privilege_type,
      acl.is_grantable,
      pg_catalog.pg_get_userbyid(acl.grantor) as grantor
    from pg_catalog.pg_default_acl as d
    join pg_catalog.pg_namespace as n
      on n.oid = d.defaclnamespace and n.nspname = 'public'
    cross join lateral pg_catalog.aclexplode(d.defaclacl) as acl
    where acl.grantee in (
      0::oid,
      pg_catalog.to_regrole('anon')::oid,
      pg_catalog.to_regrole('authenticated')::oid,
      pg_catalog.to_regrole('service_role')::oid
    )
  )
  select count(*), pg_catalog.md5(
    pg_catalog.string_agg(
      pg_catalog.concat_ws(
        '|', object_creator, schema_name, object_type, grantee,
        privilege_type, is_grantable::text, grantor
      ),
      E'\n' order by object_creator, object_type, grantee, privilege_type
    )
  )
  into default_acl_count, default_acl_fingerprint
  from relevant_defaults;

  if default_acl_count <> 72
     or default_acl_fingerprint <> 'd130bd119407ee6906ad6a9c3618970c'
     or exists (
       select 1
       from pg_catalog.pg_default_acl as d
       join pg_catalog.pg_namespace as n
         on n.oid = d.defaclnamespace
        and n.nspname = 'public'
       cross join lateral pg_catalog.aclexplode(d.defaclacl) as acl
       where acl.grantee not in (
         0::oid,
         d.defaclrole,
         pg_catalog.to_regrole('anon')::oid,
         pg_catalog.to_regrole('authenticated')::oid,
         pg_catalog.to_regrole('service_role')::oid
       )
         -- Preserve the same reviewed Supabase administrative exception used
         -- by the opening guard. Every other default-ACL grantee still fails.
         and not (
           d.defaclrole = pg_catalog.to_regrole('supabase_admin')::oid
           and acl.grantee = pg_catalog.to_regrole('postgres')::oid
           and acl.grantor = d.defaclrole
           and acl.is_grantable is false
           and (
             (
               d.defaclobjtype = 'f'
               and acl.privilege_type = 'EXECUTE'
             )
             or (
               d.defaclobjtype = 'S'
               and acl.privilege_type in ('SELECT', 'UPDATE', 'USAGE')
             )
             or (
               d.defaclobjtype = 'r'
               and acl.privilege_type in (
                 'DELETE', 'INSERT', 'MAINTAIN', 'REFERENCES',
                 'SELECT', 'TRIGGER', 'TRUNCATE', 'UPDATE'
               )
             )
           )
         )
     ) then
    raise exception using
      errcode = '55000',
      message = 'Workspace hardening post-check failed: deferred default ACLs changed.';
  end if;
end
$block$;

notify pgrst, 'reload schema';

commit;
