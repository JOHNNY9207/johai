create extension if not exists pgcrypto with schema extensions;

-- Storage bucket for business-owned source documents. Files use business_id as
-- the first path segment so future authenticated storage policies can isolate tenants.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'knowledge-files',
  'knowledge-files',
  false,
  52428800,
  array[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/csv',
    'text/plain',
    'text/markdown'
  ]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.knowledge_files (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  knowledge_item_id uuid not null references public.knowledge_items(id) on delete cascade,
  filename text not null,
  original_filename text not null,
  file_type text not null,
  mime_type text not null,
  file_size bigint not null default 0,
  storage_path text not null,
  upload_status text not null default 'Uploaded',
  processing_status text not null default 'Queued',
  chunk_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.knowledge_files
add column if not exists business_id uuid references public.businesses(id) on delete cascade,
add column if not exists knowledge_item_id uuid references public.knowledge_items(id) on delete cascade,
add column if not exists filename text not null default '',
add column if not exists original_filename text not null default '',
add column if not exists file_type text not null default '',
add column if not exists mime_type text not null default '',
add column if not exists file_size bigint not null default 0,
add column if not exists storage_path text not null default '',
add column if not exists upload_status text not null default 'Uploaded',
add column if not exists processing_status text not null default 'Queued',
add column if not exists chunk_count integer not null default 0,
add column if not exists updated_at timestamptz not null default now();

alter table public.knowledge_files
drop constraint if exists knowledge_files_upload_status_check;

alter table public.knowledge_files
add constraint knowledge_files_upload_status_check
check (upload_status in ('Uploading', 'Uploaded', 'Failed'));

alter table public.knowledge_files
drop constraint if exists knowledge_files_processing_status_check;

alter table public.knowledge_files
add constraint knowledge_files_processing_status_check
check (processing_status in ('Queued', 'Processing', 'Ready', 'Failed'));

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  knowledge_file_id uuid not null references public.knowledge_files(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  token_count integer not null default 0,
  embedding_status text not null default 'not_started',
  created_at timestamptz not null default now()
);

alter table public.knowledge_chunks
add column if not exists business_id uuid references public.businesses(id) on delete cascade,
add column if not exists knowledge_file_id uuid references public.knowledge_files(id) on delete cascade,
add column if not exists chunk_index integer not null default 0,
add column if not exists content text not null default '',
add column if not exists token_count integer not null default 0,
add column if not exists embedding_status text not null default 'not_started';

alter table public.knowledge_chunks
drop constraint if exists knowledge_chunks_embedding_status_check;

alter table public.knowledge_chunks
add constraint knowledge_chunks_embedding_status_check
check (embedding_status in ('not_started', 'queued', 'embedded', 'failed'));

create index if not exists knowledge_files_business_id_idx
on public.knowledge_files (business_id);

create index if not exists knowledge_files_knowledge_item_id_idx
on public.knowledge_files (knowledge_item_id);

create index if not exists knowledge_files_business_status_idx
on public.knowledge_files (business_id, processing_status);

create index if not exists knowledge_chunks_business_id_idx
on public.knowledge_chunks (business_id);

create index if not exists knowledge_chunks_file_index_idx
on public.knowledge_chunks (knowledge_file_id, chunk_index);

alter table public.knowledge_files enable row level security;
alter table public.knowledge_chunks enable row level security;

drop policy if exists knowledge_files_owned on public.knowledge_files;
create policy knowledge_files_owned
on public.knowledge_files
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

drop policy if exists knowledge_chunks_owned on public.knowledge_chunks;
create policy knowledge_chunks_owned
on public.knowledge_chunks
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

-- Storage RLS mirrors the database tenant boundary. Object names must begin
-- with the owning business_id: {business_id}/{file-id}/{filename}.
drop policy if exists knowledge_files_storage_select_owned on storage.objects;
create policy knowledge_files_storage_select_owned
on storage.objects
for select
to authenticated
using (
  bucket_id = 'knowledge-files'
  and public.user_owns_business((storage.foldername(name))[1]::uuid)
);

drop policy if exists knowledge_files_storage_insert_owned on storage.objects;
create policy knowledge_files_storage_insert_owned
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'knowledge-files'
  and public.user_owns_business((storage.foldername(name))[1]::uuid)
);

drop policy if exists knowledge_files_storage_update_owned on storage.objects;
create policy knowledge_files_storage_update_owned
on storage.objects
for update
to authenticated
using (
  bucket_id = 'knowledge-files'
  and public.user_owns_business((storage.foldername(name))[1]::uuid)
)
with check (
  bucket_id = 'knowledge-files'
  and public.user_owns_business((storage.foldername(name))[1]::uuid)
);

drop policy if exists knowledge_files_storage_delete_owned on storage.objects;
create policy knowledge_files_storage_delete_owned
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'knowledge-files'
  and public.user_owns_business((storage.foldername(name))[1]::uuid)
);

notify pgrst, 'reload schema';
