create extension if not exists pgcrypto with schema extensions;

create table if not exists public.knowledge_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  section text not null,
  source_type text not null default 'manual',
  title text not null,
  file_name text not null default '',
  file_type text not null default '',
  file_size bigint not null default 0,
  url text not null default '',
  content text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  ai_learning_status text not null default 'Ready to learn',
  embedding_status text not null default 'not_started',
  embedding_model text not null default '',
  embedding_vector_id text not null default '',
  knowledge_score integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.knowledge_items
add column if not exists business_id uuid references public.businesses(id) on delete cascade,
add column if not exists section text not null default 'Documents',
add column if not exists source_type text not null default 'manual',
add column if not exists title text not null default '',
add column if not exists file_name text not null default '',
add column if not exists file_type text not null default '',
add column if not exists file_size bigint not null default 0,
add column if not exists url text not null default '',
add column if not exists content text not null default '',
add column if not exists metadata jsonb not null default '{}'::jsonb,
add column if not exists ai_learning_status text not null default 'Ready to learn',
add column if not exists embedding_status text not null default 'not_started',
add column if not exists embedding_model text not null default '',
add column if not exists embedding_vector_id text not null default '',
add column if not exists knowledge_score integer not null default 0,
add column if not exists updated_at timestamptz not null default now();

alter table public.knowledge_items
drop constraint if exists knowledge_items_section_check;

alter table public.knowledge_items
add constraint knowledge_items_section_check
check (section in ('Documents', 'Website Import', 'FAQ', 'Products', 'Procedures', 'Policies'));

alter table public.knowledge_items
drop constraint if exists knowledge_items_ai_learning_status_check;

alter table public.knowledge_items
add constraint knowledge_items_ai_learning_status_check
check (ai_learning_status in ('Not learned', 'Ready to learn', 'Learning queued', 'Learned'));

alter table public.knowledge_items
drop constraint if exists knowledge_items_embedding_status_check;

alter table public.knowledge_items
add constraint knowledge_items_embedding_status_check
check (embedding_status in ('not_started', 'queued', 'embedded', 'failed'));

create index if not exists knowledge_items_business_id_idx
on public.knowledge_items (business_id);

create index if not exists knowledge_items_business_section_idx
on public.knowledge_items (business_id, section);

alter table public.knowledge_items enable row level security;

drop policy if exists knowledge_items_owned on public.knowledge_items;

create policy knowledge_items_owned
on public.knowledge_items
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

notify pgrst, 'reload schema';
