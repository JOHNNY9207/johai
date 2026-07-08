create extension if not exists pgcrypto with schema extensions;

-- Phase 3 adds chunk readiness metadata without enabling embeddings yet.
alter table public.knowledge_chunks
add column if not exists processing_status text not null default 'Ready',
add column if not exists ready_for_embedding boolean not null default false;

alter table public.knowledge_chunks
drop constraint if exists knowledge_chunks_processing_status_check;

alter table public.knowledge_chunks
add constraint knowledge_chunks_processing_status_check
check (processing_status in ('Queued', 'Processing', 'Ready', 'Failed'));

-- Processing logs make the pipeline inspectable from the dashboard and keep
-- future parser failures isolated per business and file.
create table if not exists public.knowledge_processing_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  knowledge_file_id uuid not null references public.knowledge_files(id) on delete cascade,
  level text not null default 'info',
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.knowledge_processing_logs
add column if not exists business_id uuid references public.businesses(id) on delete cascade,
add column if not exists knowledge_file_id uuid references public.knowledge_files(id) on delete cascade,
add column if not exists level text not null default 'info',
add column if not exists message text not null default '',
add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.knowledge_processing_logs
drop constraint if exists knowledge_processing_logs_level_check;

alter table public.knowledge_processing_logs
add constraint knowledge_processing_logs_level_check
check (level in ('info', 'warning', 'error'));

create index if not exists knowledge_processing_logs_business_id_idx
on public.knowledge_processing_logs (business_id);

create index if not exists knowledge_processing_logs_file_created_idx
on public.knowledge_processing_logs (knowledge_file_id, created_at desc);

alter table public.knowledge_processing_logs enable row level security;

drop policy if exists knowledge_processing_logs_owned on public.knowledge_processing_logs;
create policy knowledge_processing_logs_owned
on public.knowledge_processing_logs
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

notify pgrst, 'reload schema';
