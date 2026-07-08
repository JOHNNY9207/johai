# Architecture

## Purpose
Explain how frontend, backend routes, Supabase, and AI services fit together.

## Architecture
JOHAI uses Next.js App Router. Server routes under `app/api` handle lead capture, CRM updates, Calendly, knowledge files, onboarding, follow-up processing, and chat. Shared domain logic lives in `app/lib`. Supabase stores businesses, settings, leads, knowledge, orchestration logs, audits, and AI state.

## Components
- `app/dashboard/page.tsx`: server-side dashboard data loading
- `app/dashboard/DashboardClient.tsx`: dashboard UI
- `app/lib/supabase.ts`: shared types and Supabase helpers
- `app/lib/business-brain.ts`: Business Brain
- `app/lib/knowledge-engine.ts`: document ingestion
- `app/lib/semantic-memory.ts`: semantic search architecture
- `app/lib/ai-orchestrator.ts`: intent/action orchestration
- `app/lib/chief-of-staff.ts`: executive insight engine
- `app/lib/morning-brief.ts`: daily briefing engine
- `app/lib/audit-engine.ts`: autonomous audit engine

## Current Status
The application builds successfully and uses `.next-build-stable` as the Next.js output directory to avoid local Windows/OneDrive build locks.

## Future Roadmap
Extract dashboard workspaces, add service tests, add API integration tests, and formalize tenant context resolution.

## Dependencies
Next.js, Supabase, React, Tailwind, Lucide icons, Calendly, and Resend.

## Known Limitations
The dashboard client component is large, some modules are architecture-first, and full business user login is not complete.
