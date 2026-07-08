create extension if not exists pgcrypto with schema extensions;

create table if not exists public.ai_orchestration_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  conversation jsonb not null default '[]'::jsonb,
  detected_intent text not null default 'Unknown',
  confidence numeric not null default 0,
  required_actions jsonb not null default '[]'::jsonb,
  executed_actions jsonb not null default '[]'::jsonb,
  priority text not null default 'normal',
  business_context jsonb not null default '{}'::jsonb,
  knowledge_context jsonb not null default '{}'::jsonb,
  crm_context jsonb not null default '{}'::jsonb,
  execution_time_ms integer not null default 0,
  result text not null default '',
  errors jsonb not null default '[]'::jsonb,
  channel text not null default 'web_chat',
  created_at timestamptz not null default now()
);

alter table public.ai_orchestration_logs
add column if not exists business_id uuid references public.businesses(id) on delete cascade,
add column if not exists lead_id uuid references public.leads(id) on delete set null,
add column if not exists conversation jsonb not null default '[]'::jsonb,
add column if not exists detected_intent text not null default 'Unknown',
add column if not exists confidence numeric not null default 0,
add column if not exists required_actions jsonb not null default '[]'::jsonb,
add column if not exists executed_actions jsonb not null default '[]'::jsonb,
add column if not exists priority text not null default 'normal',
add column if not exists business_context jsonb not null default '{}'::jsonb,
add column if not exists knowledge_context jsonb not null default '{}'::jsonb,
add column if not exists crm_context jsonb not null default '{}'::jsonb,
add column if not exists execution_time_ms integer not null default 0,
add column if not exists result text not null default '',
add column if not exists errors jsonb not null default '[]'::jsonb,
add column if not exists channel text not null default 'web_chat';

alter table public.ai_orchestration_logs
drop constraint if exists ai_orchestration_logs_intent_check;

alter table public.ai_orchestration_logs
add constraint ai_orchestration_logs_intent_check
check (
  detected_intent in (
    'General Question',
    'Pricing Request',
    'Book Appointment',
    'Need Human',
    'Complaint',
    'Sales Opportunity',
    'Existing Customer',
    'Support Request',
    'Quote Request',
    'Document Upload',
    'Unknown'
  )
);

alter table public.ai_orchestration_logs enable row level security;

create index if not exists ai_orchestration_logs_business_created_idx
on public.ai_orchestration_logs (business_id, created_at desc);

create index if not exists ai_orchestration_logs_business_intent_idx
on public.ai_orchestration_logs (business_id, detected_intent);

drop policy if exists ai_orchestration_logs_owned on public.ai_orchestration_logs;
create policy ai_orchestration_logs_owned
on public.ai_orchestration_logs
for all
to authenticated
using (public.user_owns_business(business_id))
with check (public.user_owns_business(business_id));

notify pgrst, 'reload schema';
