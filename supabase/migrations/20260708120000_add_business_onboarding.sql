alter table public.business_settings
add column if not exists onboarding_status text not null default 'not_started',
add column if not exists company_profile jsonb not null default '{}'::jsonb,
add column if not exists ai_assistant_config jsonb not null default '{}'::jsonb,
add column if not exists services_config jsonb not null default '{}'::jsonb,
add column if not exists communication_config jsonb not null default '{}'::jsonb,
add column if not exists onboarding_completed_at timestamptz;

alter table public.business_settings
drop constraint if exists business_settings_onboarding_status_check;

alter table public.business_settings
add constraint business_settings_onboarding_status_check
check (onboarding_status in ('not_started', 'in_progress', 'completed'));

update public.business_settings
set onboarding_status = 'not_started'
where onboarding_status is null;

notify pgrst, 'reload schema';
