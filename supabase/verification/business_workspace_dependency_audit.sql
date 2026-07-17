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
