alter table public.audits
add column if not exists audit_type text not null default 'autonomous_ai_audit',
add column if not exists overall_score integer not null default 0,
add column if not exists ai_readiness_score integer not null default 0,
add column if not exists automation_score integer not null default 0,
add column if not exists knowledge_score integer not null default 0,
add column if not exists marketing_score integer not null default 0,
add column if not exists crm_score integer not null default 0,
add column if not exists scores jsonb not null default '{}'::jsonb,
add column if not exists module_results jsonb not null default '[]'::jsonb,
add column if not exists executive_summary text not null default '',
add column if not exists detailed_report jsonb not null default '{}'::jsonb,
add column if not exists action_plan jsonb not null default '[]'::jsonb,
add column if not exists implementation_roadmap jsonb not null default '[]'::jsonb,
add column if not exists report_status text not null default 'draft',
add column if not exists completed_at timestamptz;

alter table public.audits
drop constraint if exists audits_report_status_check;

alter table public.audits
add constraint audits_report_status_check
check (report_status in ('draft', 'ready', 'export_pending', 'exported'));

create index if not exists audits_business_created_idx
on public.audits (business_id, created_at desc);

create index if not exists audits_business_type_idx
on public.audits (business_id, audit_type);

notify pgrst, 'reload schema';
