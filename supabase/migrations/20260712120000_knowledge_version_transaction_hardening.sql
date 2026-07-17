begin;

-- Abort without rewriting data when existing rows violate the proposed invariants.
do $$
declare
  conflict_count bigint;
begin
  select count(*) into conflict_count
  from public.knowledge_files
  where knowledge_item_id is null
     or version_number is null
     or version_number < 1;
  if conflict_count > 0 then
    raise exception 'Knowledge hardening blocked: % file rows have a missing lineage or invalid version number.', conflict_count;
  end if;

  select count(*) into conflict_count
  from (
    select knowledge_item_id, version_number
    from public.knowledge_files
    group by knowledge_item_id, version_number
    having count(*) > 1
  ) conflicts;
  if conflict_count > 0 then
    raise exception 'Knowledge hardening blocked: % lineage/version conflicts exist.', conflict_count;
  end if;

  select count(*) into conflict_count
  from (
    select knowledge_item_id
    from public.knowledge_files
    where is_active_version is true
    group by knowledge_item_id
    having count(*) > 1
  ) conflicts;
  if conflict_count > 0 then
    raise exception 'Knowledge hardening blocked: % lineages have multiple active versions.', conflict_count;
  end if;

  select count(*) into conflict_count
  from public.knowledge_files kf
  left join public.knowledge_items ki on ki.id = kf.knowledge_item_id
  where ki.id is null or ki.business_id <> kf.business_id;
  if conflict_count > 0 then
    raise exception 'Knowledge hardening blocked: % file rows have an invalid tenant/lineage relationship.', conflict_count;
  end if;

  select count(*) into conflict_count
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
  if conflict_count > 0 then
    raise exception 'Knowledge hardening blocked: % invalid predecessor references exist.', conflict_count;
  end if;

  select count(*) into conflict_count
  from public.knowledge_chunks kc
  left join public.knowledge_files kf on kf.id = kc.knowledge_file_id
  where kf.id is null or kf.business_id <> kc.business_id;
  if conflict_count > 0 then
    raise exception 'Knowledge hardening blocked: % orphaned or cross-tenant chunks exist.', conflict_count;
  end if;
end
$$;

create unique index if not exists knowledge_files_lineage_version_unique
  on public.knowledge_files (knowledge_item_id, version_number);

create unique index if not exists knowledge_files_one_active_per_lineage
  on public.knowledge_files (knowledge_item_id)
  where is_active_version is true;

comment on index public.knowledge_files_lineage_version_unique is
  'Guarantees one version number per knowledge document lineage.';

comment on index public.knowledge_files_one_active_per_lineage is
  'Guarantees at most one active file version per knowledge document lineage.';

do $$
begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.knowledge_files'::regclass
      and conname = 'knowledge_files_previous_version_id_fkey'
      and not convalidated
  ) then
    alter table public.knowledge_files
      validate constraint knowledge_files_previous_version_id_fkey;
  end if;
end
$$;

create or replace function public.activate_knowledge_file_version(
  target_business_id uuid,
  target_file_id uuid
)
returns table (
  id uuid,
  business_id uuid,
  knowledge_item_id uuid,
  version_number integer,
  previous_version_id uuid,
  is_active_version boolean,
  processing_status text
)
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  candidate public.knowledge_files%rowtype;
  predecessor public.knowledge_files%rowtype;
  active_count integer;
begin
  if target_business_id is null or target_file_id is null then
    raise exception 'Business and file identifiers are required.' using errcode = '22004';
  end if;

  select * into candidate
  from public.knowledge_files kf
  where kf.id = target_file_id
    and kf.business_id = target_business_id
  for update;

  if not found then
    raise exception 'Knowledge version was not found for this tenant.' using errcode = 'P0002';
  end if;

  perform 1
  from public.knowledge_files kf
  where kf.knowledge_item_id = candidate.knowledge_item_id
  order by kf.id
  for update;

  if not exists (
    select 1 from public.knowledge_items ki
    where ki.id = candidate.knowledge_item_id
      and ki.business_id = target_business_id
  ) then
    raise exception 'Knowledge lineage does not belong to this tenant.' using errcode = '23503';
  end if;

  if candidate.processing_status <> 'Ready' then
    raise exception 'Replacement must be Ready before activation.' using errcode = '23514';
  end if;

  if candidate.is_active_version is true then
    select count(*) into active_count
    from public.knowledge_files kf
    where kf.knowledge_item_id = candidate.knowledge_item_id
      and kf.is_active_version is true;
    if active_count = 1 then
      return query select candidate.id, candidate.business_id,
        candidate.knowledge_item_id, candidate.version_number,
        candidate.previous_version_id, candidate.is_active_version,
        candidate.processing_status;
      return;
    end if;
    raise exception 'Active lineage state is invalid.' using errcode = '40001';
  end if;

  if candidate.previous_version_id is null then
    raise exception 'Replacement has no predecessor.' using errcode = '23514';
  end if;

  select * into predecessor
  from public.knowledge_files kf
  where kf.id = candidate.previous_version_id
  for update;

  if not found
     or predecessor.business_id <> target_business_id
     or predecessor.knowledge_item_id <> candidate.knowledge_item_id
     or predecessor.version_number >= candidate.version_number then
    raise exception 'Replacement predecessor is stale or belongs to another lineage.' using errcode = '40001';
  end if;

  select count(*) into active_count
  from public.knowledge_files kf
  where kf.knowledge_item_id = candidate.knowledge_item_id
    and kf.is_active_version is true;

  if active_count <> 1
     or predecessor.is_active_version is not true
     or predecessor.processing_status <> 'Ready' then
    raise exception 'The active predecessor changed before activation.' using errcode = '40001';
  end if;

  update public.knowledge_files kf
  set is_active_version = false, updated_at = now()
  where kf.id = predecessor.id
    and kf.business_id = target_business_id
    and kf.knowledge_item_id = candidate.knowledge_item_id
    and kf.processing_status = 'Ready'
    and kf.is_active_version is true;
  if not found then
    raise exception 'The active predecessor changed during activation.' using errcode = '40001';
  end if;

  update public.knowledge_files kf
  set is_active_version = true, updated_at = now()
  where kf.id = candidate.id
    and kf.business_id = target_business_id
    and kf.knowledge_item_id = candidate.knowledge_item_id
    and kf.processing_status = 'Ready'
    and kf.is_active_version is false
  returning kf.* into candidate;
  if not found then
    raise exception 'Replacement changed during activation.' using errcode = '40001';
  end if;

  return query select candidate.id, candidate.business_id,
    candidate.knowledge_item_id, candidate.version_number,
    candidate.previous_version_id, candidate.is_active_version,
    candidate.processing_status;
end
$$;

comment on function public.activate_knowledge_file_version(uuid, uuid) is
  'Atomically activates one Ready replacement after locking and validating its tenant, lineage, and active predecessor.';

create or replace function public.replace_knowledge_file_chunks(
  target_business_id uuid,
  target_file_id uuid,
  target_attempt_id text,
  replacement_chunks jsonb
)
returns integer
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  target_file public.knowledge_files%rowtype;
  chunk_total integer;
begin
  if target_business_id is null or target_file_id is null
     or nullif(btrim(target_attempt_id), '') is null then
    raise exception 'Business, file, and attempt identifiers are required.' using errcode = '22004';
  end if;
  if jsonb_typeof(replacement_chunks) <> 'array' then
    raise exception 'Replacement chunks must be a JSON array.' using errcode = '22023';
  end if;

  chunk_total := jsonb_array_length(replacement_chunks);
  if chunk_total < 1 or chunk_total > 2000 then
    raise exception 'Replacement must contain between 1 and 2000 chunks.' using errcode = '22023';
  end if;

  select * into target_file
  from public.knowledge_files kf
  where kf.id = target_file_id
    and kf.business_id = target_business_id
  for update;

  if not found then
    raise exception 'Knowledge file was not found for this tenant.' using errcode = 'P0002';
  end if;
  if target_file.processing_status <> 'Processing'
     or target_file.archived_at is not null
     or coalesce(target_file.source_metadata ->> 'processing_attempt_id', '') <> target_attempt_id then
    raise exception 'Processing attempt is stale or invalid.' using errcode = '40001';
  end if;
  if not exists (
    select 1 from public.knowledge_items ki
    where ki.id = target_file.knowledge_item_id
      and ki.business_id = target_business_id
  ) then
    raise exception 'Knowledge lineage does not belong to this tenant.' using errcode = '23503';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(replacement_chunks) as c(
      chunk_index integer, content text, token_count integer,
      character_count integer, source_reference text,
      section_reference text, page_reference text,
      processing_status text, ready_for_embedding boolean,
      embedding_status text, embedding_provider text,
      vector_store_status text
    )
    where c.chunk_index is null or c.chunk_index < 0
       or nullif(btrim(c.content), '') is null
       or c.token_count is null or c.token_count < 0
       or c.character_count is null or c.character_count < 0
       or coalesce(c.processing_status, 'Ready') not in ('Queued', 'Processing', 'Ready', 'Failed')
       or coalesce(c.embedding_status, 'not_started') not in ('not_started', 'queued', 'embedded', 'failed')
  ) then
    raise exception 'One or more replacement chunks are invalid.' using errcode = '23514';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(replacement_chunks) as c(chunk_index integer)
    group by c.chunk_index
    having count(*) > 1
  ) or (select min(c.chunk_index) from jsonb_to_recordset(replacement_chunks) as c(chunk_index integer)) <> 0
     or (select max(c.chunk_index) from jsonb_to_recordset(replacement_chunks) as c(chunk_index integer)) <> chunk_total - 1 then
    raise exception 'Chunk indexes must be unique and contiguous from zero.' using errcode = '23514';
  end if;

  delete from public.knowledge_chunks kc
  where kc.knowledge_file_id = target_file_id
    and kc.business_id = target_business_id;

  insert into public.knowledge_chunks (
    business_id, knowledge_file_id, chunk_index, content, token_count,
    character_count, source_reference, section_reference, page_reference,
    processing_status, ready_for_embedding, embedding_status,
    embedding_provider, vector_store_status
  )
  select target_business_id, target_file_id, c.chunk_index, c.content,
    c.token_count, c.character_count, c.source_reference,
    c.section_reference, c.page_reference,
    coalesce(c.processing_status, 'Ready'),
    coalesce(c.ready_for_embedding, true),
    coalesce(c.embedding_status, 'not_started'),
    coalesce(c.embedding_provider, ''),
    coalesce(c.vector_store_status, 'not_configured')
  from jsonb_to_recordset(replacement_chunks) as c(
    chunk_index integer, content text, token_count integer,
    character_count integer, source_reference text,
    section_reference text, page_reference text,
    processing_status text, ready_for_embedding boolean,
    embedding_status text, embedding_provider text,
    vector_store_status text
  );

  return chunk_total;
end
$$;

comment on function public.replace_knowledge_file_chunks(uuid, uuid, text, jsonb) is
  'Atomically replaces all chunks for the tenant-scoped file only while the supplied processing attempt owns the row.';

revoke all on function public.activate_knowledge_file_version(uuid, uuid) from public, anon, authenticated;
revoke all on function public.replace_knowledge_file_chunks(uuid, uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.activate_knowledge_file_version(uuid, uuid) to service_role;
grant execute on function public.replace_knowledge_file_chunks(uuid, uuid, text, jsonb) to service_role;

notify pgrst, 'reload schema';

commit;
