# Architecture

## Purpose
Explain how frontend, backend routes, Supabase, and AI services fit together.

## Product-design authority

The [JOHAI Constitution](constitution/JOHAI_CONSTITUTION.md) governs every technical and experience decision. Architecture, Contextual Intelligence, feature specifications, components, and runtime implementation are subordinate to its Ten Laws and Decision Framework. A conflict is a stop condition, not an implementation exception.

## Architecture
JOHAI uses Next.js App Router. Server routes under `app/api` handle lead capture, CRM updates, Calendly, knowledge files, onboarding, follow-up processing, and chat. Shared domain logic lives in `app/lib`. Supabase stores businesses, settings, leads, knowledge, orchestration logs, audits, and AI state.

**JOHAI Contextual Intelligence™** is the permanent cross-layer product rule: the AI never asks for information it can already infer from authorized context. The owning product layer remains responsible for identity, tenant scope, permission, source visibility, consent, and deterministic action execution. The AI Layer may interpret and suggest but never creates authority.

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
Extract dashboard workspaces, add service tests, add API integration tests, formalize tenant context resolution, and implement the Planned typed context envelope, interaction registry, silence policy, human takeover, and outcome measurement described in [Contextual Intelligence](philosophy/CONTEXTUAL_INTELLIGENCE.md).

## Dependencies
Next.js, Supabase, React, Tailwind, Lucide icons, Calendly, and Resend.

## Known Limitations
The dashboard client component is large, some modules are architecture-first, and full business user login is not complete.
