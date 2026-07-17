-- Read-only verification. Every conflict query should return zero rows.
select knowledge_item_id, version_number, count(*) as duplicate_count
from public.knowledge_files
group by knowledge_item_id, version_number
having count(*) > 1;

select knowledge_item_id, count(*) as active_count
from public.knowledge_files
where is_active_version is true
group by knowledge_item_id
having count(*) > 1;

select kf.id, kf.business_id, kf.knowledge_item_id, kf.version_number
from public.knowledge_files kf
left join public.knowledge_items ki on ki.id = kf.knowledge_item_id
where kf.knowledge_item_id is null
   or kf.version_number is null
   or kf.version_number < 1
   or ki.id is null
   or ki.business_id <> kf.business_id;

select child.id, child.previous_version_id
from public.knowledge_files child
left join public.knowledge_files predecessor on predecessor.id = child.previous_version_id
where child.previous_version_id is not null
  and (
    predecessor.id is null
    or predecessor.id = child.id
    or predecessor.business_id <> child.business_id
    or predecessor.knowledge_item_id <> child.knowledge_item_id
    or predecessor.version_number >= child.version_number
  );

select kc.id, kc.business_id, kc.knowledge_file_id
from public.knowledge_chunks kc
left join public.knowledge_files kf on kf.id = kc.knowledge_file_id
where kf.id is null or kf.business_id <> kc.business_id;

select indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and indexname in (
    'knowledge_files_lineage_version_unique',
    'knowledge_files_one_active_per_lineage',
    'knowledge_chunks_file_chunk_unique'
  )
order by indexname;

select p.oid::regprocedure as function_signature,
  p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.oid in (
    to_regprocedure('public.activate_knowledge_file_version(uuid,uuid)'),
    to_regprocedure('public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)')
  )
order by p.oid::regprocedure::text;

select function_signature,
  has_function_privilege('anon', function_signature, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', function_signature, 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('service_role', function_signature, 'EXECUTE') as service_role_can_execute
from (values
  ('public.activate_knowledge_file_version(uuid,uuid)'),
  ('public.replace_knowledge_file_chunks(uuid,uuid,text,jsonb)')
) functions(function_signature);
