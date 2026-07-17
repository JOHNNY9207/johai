-- Knowledge Center V2 repair migration.
-- Safe to run after a clean prior migration chain or a partially applied V2 run.

begin;

do $$
begin
  if to_regclass('public.knowledge_files') is null then
    raise exception 'Required table public.knowledge_files is missing. Apply the earlier knowledge migrations first.';
  end if;
  if to_regclass('public.knowledge_items') is null then
    raise exception 'Required table public.knowledge_items is missing. Apply the earlier knowledge migrations first.';
  end if;
  if to_regclass('public.knowledge_chunks') is null then
    raise exception 'Required table public.knowledge_chunks is missing. Apply the earlier knowledge migrations first.';
  end if;
end
$$;

alter table public.knowledge_files
  add column if not exists processed_at timestamptz,
  add column if not exists last_processing_attempt_at timestamptz,
  add column if not exists processing_duration_ms integer,
  add column if not exists processing_error text,
  add column if not exists processing_attempts integer default 0,
  add column if not exists archived_at timestamptz,
  add column if not exists source_metadata jsonb default '{}'::jsonb,
  add column if not exists version_number integer default 1,
  add column if not exists is_active_version boolean default true,
  add column if not exists previous_version_id uuid;

-- Repair nullable/default states if an earlier manual run added only part of
-- the V2 columns or added them without the final constraints.
update public.knowledge_files
set processing_attempts = 0
where processing_attempts is null;

update public.knowledge_files
set source_metadata = '{}'::jsonb
where source_metadata is null;

update public.knowledge_files
set version_number = 1
where version_number is null;

update public.knowledge_files
set is_active_version = true
where is_active_version is null;

update public.knowledge_files
set processed_at = updated_at
where processed_at is null
  and processing_status = 'Ready';

alter table public.knowledge_files
  alter column processing_attempts set default 0,
  alter column processing_attempts set not null,
  alter column source_metadata set default '{}'::jsonb,
  alter column source_metadata set not null,
  alter column version_number set default 1,
  alter column version_number set not null,
  alter column is_active_version set default true,
  alter column is_active_version set not null;

-- Add the self-referencing version link if a partial run created the column
-- without its foreign key. NOT VALID preserves any pre-existing partial data
-- while enforcing the relationship for new writes.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.knowledge_files'::regclass
      and conname = 'knowledge_files_previous_version_id_fkey'
  ) then
    alter table public.knowledge_files
      add constraint knowledge_files_previous_version_id_fkey
      foreign key (previous_version_id)
      references public.knowledge_files(id)
      on delete set null
      not valid;
  end if;
end
$$;

alter table public.knowledge_files
  drop constraint if exists knowledge_files_processing_status_check;

alter table public.knowledge_files
  add constraint knowledge_files_processing_status_check
  check (
    processing_status in (
      'Uploaded',
      'Queued',
      'Processing',
      'Ready',
      'Failed',
      'Needs review',
      'Archived'
    )
  );

alter table public.knowledge_items
  drop constraint if exists knowledge_items_ai_learning_status_check;

alter table public.knowledge_items
  add constraint knowledge_items_ai_learning_status_check
  check (
    ai_learning_status in (
      'Not learned',
      'Ready to learn',
      'Learning queued',
      'Learned',
      'Needs review'
    )
  );

alter table public.knowledge_chunks
  add column if not exists character_count integer default 0,
  add column if not exists source_reference text,
  add column if not exists section_reference text,
  add column if not exists page_reference text;

update public.knowledge_chunks
set character_count = char_length(content)
where character_count is null
   or character_count = 0;

alter table public.knowledge_chunks
  alter column character_count set default 0,
  alter column character_count set not null;

-- The search function depends on the Phase 4 generated search vector. Ensure
-- the prerequisite exists so the repair remains safe after a partial chain.
alter table public.knowledge_chunks
  add column if not exists search_vector tsvector
  generated always as (
    to_tsvector('english', coalesce(content, ''))
  ) stored;

create index if not exists knowledge_chunks_search_vector_idx
  on public.knowledge_chunks
  using gin (search_vector);

create index if not exists knowledge_files_business_active_status_idx
  on public.knowledge_files (
    business_id,
    is_active_version,
    processing_status
  );

-- Preserve all data if a partially applied database already contains duplicate
-- chunk positions. New installs receive the unique index; existing duplicates
-- are reported for separate review instead of being deleted.
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'knowledge_chunks_file_chunk_unique'
  ) then
    if not exists (
      select 1
      from public.knowledge_chunks
      group by knowledge_file_id, chunk_index
      having count(*) > 1
    ) then
      create unique index knowledge_chunks_file_chunk_unique
        on public.knowledge_chunks (knowledge_file_id, chunk_index);
    else
      raise notice 'Skipped knowledge_chunks_file_chunk_unique because duplicate chunk positions already exist. No data was deleted.';
    end if;
  end if;
end
$$;

create or replace function public.search_knowledge_chunks(
  target_business_id uuid,
  search_query text,
  max_results integer default 12
)
returns table (
  chunk_id uuid,
  business_id uuid,
  business_name text,
  knowledge_file_id uuid,
  document text,
  source text,
  chunk_preview text,
  score real,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public
as $$
  select
    kc.id as chunk_id,
    kc.business_id as business_id,
    b.name as business_name,
    kc.knowledge_file_id as knowledge_file_id,
    coalesce(
      kf.original_filename,
      ki.title,
      'Knowledge document'
    ) as document,
    coalesce(
      kf.file_type,
      ki.source_type,
      'knowledge'
    ) as source,
    left(kc.content, 600) as chunk_preview,
    ts_rank(
      kc.search_vector,
      websearch_to_tsquery('english', search_query)
    ) as score,
    kc.created_at as created_at
  from public.knowledge_chunks as kc
  join public.businesses as b
    on b.id = kc.business_id
  join public.knowledge_files as kf
    on kf.id = kc.knowledge_file_id
   and kf.business_id = kc.business_id
  left join public.knowledge_items as ki
    on ki.id = kf.knowledge_item_id
   and ki.business_id = kc.business_id
  where kc.business_id = target_business_id
    and kf.processing_status = 'Ready'
    and kf.is_active_version is true
    and kf.archived_at is null
    and trim(search_query) <> ''
    and kc.search_vector @@ websearch_to_tsquery(
      'english',
      search_query
    )
  order by
    ts_rank(
      kc.search_vector,
      websearch_to_tsquery('english', search_query)
    ) desc,
    kc.created_at desc
  limit greatest(
    1,
    least(max_results, 50)
  );
$$;

-- SECURITY DEFINER is retained for the server-side fallback search, but direct
-- client execution is removed. RLS policies on the underlying tables remain
-- unchanged and application queries continue to supply the active business ID.
revoke all
  on function public.search_knowledge_chunks(uuid, text, integer)
  from public;

revoke all
  on function public.search_knowledge_chunks(uuid, text, integer)
  from anon;

revoke all
  on function public.search_knowledge_chunks(uuid, text, integer)
  from authenticated;

grant execute
  on function public.search_knowledge_chunks(uuid, text, integer)
  to service_role;

notify pgrst, 'reload schema';

commit;
