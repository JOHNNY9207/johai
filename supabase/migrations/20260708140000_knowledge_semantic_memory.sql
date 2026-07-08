-- Phase 4 prepares semantic memory with PostgreSQL full-text search today and
-- pgvector/OpenAI embeddings later, without changing API contracts.
alter table public.knowledge_chunks
add column if not exists search_vector tsvector generated always as (
  to_tsvector('english', coalesce(content, ''))
) stored,
add column if not exists embedding_provider text not null default '',
add column if not exists vector_store_status text not null default 'not_configured';

create index if not exists knowledge_chunks_search_vector_idx
on public.knowledge_chunks
using gin (search_vector);

create index if not exists knowledge_chunks_business_ready_idx
on public.knowledge_chunks (business_id, ready_for_embedding, embedding_status);

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
    kc.business_id,
    b.name as business_name,
    kc.knowledge_file_id,
    coalesce(kf.original_filename, ki.title, 'Knowledge document') as document,
    coalesce(kf.storage_path, ki.url, ki.source_type, '') as source,
    left(kc.content, 420) as chunk_preview,
    ts_rank(kc.search_vector, websearch_to_tsquery('english', search_query)) as score,
    kc.created_at
  from public.knowledge_chunks kc
  join public.businesses b on b.id = kc.business_id
  left join public.knowledge_files kf on kf.id = kc.knowledge_file_id
  left join public.knowledge_items ki on ki.id = kf.knowledge_item_id
  where kc.business_id = target_business_id
    and trim(search_query) <> ''
    and kc.search_vector @@ websearch_to_tsquery('english', search_query)
  order by score desc, kc.created_at desc
  limit greatest(1, least(max_results, 50));
$$;

notify pgrst, 'reload schema';
