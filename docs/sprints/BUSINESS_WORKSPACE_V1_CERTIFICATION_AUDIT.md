# Business Workspace V1 Certification Audit

- **Platform layer:** Business Workspace
- **Audit date:** 2026-07-15
- **Audit type:** Repository and evidence audit only
- **Existing certification:** None found
- **Provisional evidence score:** 30/100
- **Certification decision:** NOT CERTIFIED
- **Production Ready:** NO
- **Implementation authorization:** Not granted by this audit

## Audit scope and evidence standard

This audit reviews the current repository architecture, routes, domain services, tests, migrations, and documentation. It distinguishes working repository behavior from partial, presentation-only, and planned capabilities. It did not use a production account, inspect a live schema, execute SQL, run a production deployment, or modify application behavior.

The score is a provisional evidence estimate for certification planning. It is not a previous certification result, release approval, or statement that a live breach has occurred. A mandatory identity or tenant boundary cannot pass by averaging unrelated feature scores.

## 1. Current architecture

### Application structure

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, server route handlers, client presentation components, and domain services under `app/lib`.
- Business routes are split across `/auth/*`, `/start/*`, and `/dashboard/*`.
- `/dashboard` loads leads, businesses, settings, Business Brain data, Knowledge data, orchestration logs, and audits on the server, derives executive models, and passes them to the client command center.
- `/dashboard/knowledge`, `/dashboard/onboarding`, `/dashboard/settings`, and `/dashboard/team` provide focused business surfaces.
- Business data is persisted in Supabase. Calendly, Stripe, OpenAI, email, and private Knowledge storage are accessed through server routes or services.

### Identity and session architecture as implemented

The repository contains two different Business Workspace access paths:

1. `/auth/*` and `/start/*` use a shared browser Supabase Auth client stored under `johai-auth-session`.
2. `/dashboard/*` does not use that user identity. It uses one environment-wide `DASHBOARD_PASSWORD` and an HttpOnly `johai_dashboard_auth` cookie containing a hash of that shared password.

The dashboard cookie proves knowledge of one shared secret. It does not identify an owner or member, resolve a role, select a business, or provide audit attribution. No rendered dashboard logout operation was found.

### Tenant and data-access architecture as implemented

- Migration history defines `businesses.owner_user_id`, `business_members`, `user_owns_business(...)`, and RLS policies for several business tables.
- Interactive dashboard and API data access uses `SUPABASE_SERVICE_ROLE_KEY` through `createSupabaseServerClient()`. The service role bypasses RLS.
- A hard-coded `DEFAULT_BUSINESS_ID` scopes many reads and writes.
- The dashboard currently fetches all leads and all businesses without a tenant filter, then combines those results with default-business settings, Knowledge, orchestration, and audit data.
- Lead PATCH and DELETE operations authorize only the shared dashboard cookie and select the record by ID without a business constraint.

The static tenant model is therefore not the authorization boundary enforced by the current interactive runtime. This creates a supported risk of cross-tenant exposure or mutation when more than one business contains data; this audit does not claim that a live exposure was observed.

### Platform boundaries

Customer Portal and Business Workspace browser sessions use separate storage keys and client instances. The Portal remains a separate platform layer. JOHAI Super Admin is not implemented. The public website, public chat, and public booking entry points remain unauthenticated surfaces and require explicit publication and abuse-control boundaries.

## 2. Existing features

| Capability | Current evidence | Status |
| --- | --- | --- |
| Supabase account UI | Email/password signup and login, password email, Google/Azure OAuth, callback, and browser session persistence exist | Partial: not connected to dashboard owner/member authorization |
| Business onboarding | Five-step company, assistant, services, communication, and review workflow persists settings | Implemented for the default business only |
| Executive command center | Business status, brief, activity, attention, CRM summary, Business Brain, and outlook are rendered from current records and deterministic services | Implemented with evidence/truthfulness qualifications |
| CRM | Lead capture, persistence, conversation, status, notes, PATCH, DELETE, booking, email, and follow-up fields exist | Partial: current workspace exposes only a compact summary, not a complete CRM workspace |
| Knowledge Center | Manual sources; PDF, DOCX, XLSX, CSV, and TXT upload; extraction; chunks; processing status; preview; search; retry; archive; delete; replacement; review; and version history | Implemented with reliability and transaction limits |
| Calendly | Public settings, availability, protected configuration, token validation, and signed webhook handling | Implemented foundation; production replay/load evidence missing |
| Email and follow-ups | Qualified-lead email and scheduled reminder logic update lead state | Implemented logic with a critical unauthenticated processing endpoint |
| Team invitations | Supabase Admin invitation email with requested role metadata | Partial: no business-membership assignment, acceptance, listing, revocation, or role lifecycle |
| Billing | Plan model, Checkout session creation, and signed Stripe webhook receipt | Partial: no subscription persistence, customer mapping, invoices, portal, cancellation, or entitlement enforcement |
| Settings | Calendly configuration is functional | Partial: Company, AI, Email, Automation, Billing, Team, and Security tabs are placeholders |
| Search and navigation | Workspace navigation and a search input are visible | Partial: several items point to anchors, settings, or public pricing; dashboard search reports readiness but performs no query |
| Executive dashboard preview | `/executive-dashboard` shows fixed KPIs and activity | Presentation-only, unauthenticated, and not production evidence |

## 3. Existing AI capabilities

### Implemented foundations

- **Business Brain:** deterministic completeness, readiness, industry-template, vocabulary, and recommendation logic.
- **Audit Engine:** deterministic business-module scoring and recommendations, with explicit placeholders for external website, SEO, Google Business, and social connectors.
- **Morning Brief and Chief of Staff:** derived priorities, risks, opportunities, status, and timelines built from current business records.
- **Knowledge processing:** extraction, chunking, searchable source state, guarded attempts, version lineage, and keyword full-text retrieval.
- **Public OpenAI chat:** structured lead qualification and responses grounded with matching Knowledge excerpts when available.
- **AI Orchestrator:** deterministic intent classification, action planning, Knowledge search, and orchestration logging.

### Partial or unsupported behavior

- Most orchestrator executors return `prepared`; they do not execute the named external action.
- Assistant `allowedActions` and `disallowedActions` are stored from onboarding but are not enforced by chat or orchestration.
- Embedding-provider code exists, but vector persistence and ranking remain placeholders; active retrieval is English PostgreSQL full-text search.
- The unauthenticated chat searches Ready default-business Knowledge without a separate public-publication flag. Internal Knowledge Center material therefore lacks an enforceable publication boundary before it can become model context.
- Orchestration logs can contain full conversation and lead context without a documented minimization and retention enforcement path.
- Dashboard labels can count required or prepared actions as answered questions, completed follow-ups, or completed work. Execution claims must be tied to verified executor evidence before certification.
- Scheduled brief delivery, operational human takeover, production AI evaluations, prompt-injection tests, output-policy enforcement, and monitored external actions are not certified.

## 4. Existing certifications and evidence

No Business Workspace V1 certification record, approved score, or production-ready declaration exists.

Evidence that may be reused but does not constitute certification:

- Foundation Version 1.0 is COMPLETE and FROZEN; this is governance readiness, not runtime certification.
- Knowledge Processing Reliability records 12 passing in-memory scenarios. Those tests do not exercise live Supabase, RLS, parsers, OpenAI, routes, or production concurrency.
- Historical lint and build passes establish compilation quality at recorded checkpoints, not current operational readiness.
- The shared browser-auth singleton correction provides structural storage-key evidence but not credential-backed Workspace authorization.
- Static migration history contains business ownership and RLS foundations. Current deployed schema, effective grants, policy state, and behavioral tenant denial are not recorded as a Business Workspace certification artifact.

## 5. Missing certifications

- Owner/member authentication lifecycle and session recovery
- Business membership, role, invitation, revocation, and least-privilege authorization
- Tenant A/Tenant B UI, API, direct-REST, Storage, and background-job isolation
- Public/private Knowledge publication and AI context isolation
- Endpoint authentication, scheduler authorization, rate limiting, idempotency, replay protection, and abuse resistance
- CRM, onboarding, Knowledge, Calendly, email, follow-up, team, and billing end-to-end workflows
- AI grounding, prompt-injection resistance, policy enforcement, action authority, execution evidence, and retention
- Keyboard, focus, screen-reader, contrast, zoom, responsive, and device/browser compatibility
- Production Core Web Vitals, API/provider latency, concurrency, load, and failure recovery
- Monitoring, audit attribution, alerting, backup/restore, incident response, rollback, and support ownership

## 6. Current technical debt

### P0 — certification stop conditions

1. **No actor-bound Workspace authorization:** the interactive dashboard uses a shared password cookie instead of a verified owner/member identity and role.
2. **RLS bypass and unresolved tenant context:** ordinary dashboard/API operations use a service-role client; many use `DEFAULT_BUSINESS_ID`, while dashboard reads include unfiltered leads and businesses.
3. **Unauthenticated privileged follow-up execution:** both GET and POST on `/api/follow-ups/process` can read and mutate leads and trigger email through the service role.
4. **Missing public Knowledge publication boundary:** unauthenticated chat can retrieve Ready default-business Knowledge without an independently approved public-visible classification.

### P1 — high production risk

- Supabase signup/onboarding identity and the dashboard access model are disconnected.
- Workspace logout, recent-recovery assurance, redirect allowlisting, role enforcement, and account/session lifecycle evidence are incomplete.
- Team invitation metadata is not a business membership or complete role lifecycle.
- Prepared orchestration actions can be presented as completed work.
- Public chat and lead creation have no recorded request-size, rate, cost, spam, or model-abuse controls.
- Knowledge work is synchronous and request-scoped; locks are process-local; chunk/version transitions are not fully transactional; durable workers, dead-letter handling, malware scanning, and live concurrency proof are absent.
- Subscription state and entitlements are not persisted or enforced.
- Structured monitoring, audit attribution, alerts, backups, restore exercises, and incident procedures are incomplete.
- No dedicated Business Workspace unit, integration, authorization, API, browser, or end-to-end test command exists.

### P2 — completeness and evidence debt

- CRM presentation is a summary rather than a focused operational workspace.
- Most settings tabs, dashboard search, and several navigation destinations are placeholders or redirects rather than complete workspaces.
- The public static executive preview is not labeled or protected as certification evidence.
- Production accessibility, responsive, localization, deterministic date/time, and performance evidence is absent.

## 7. Required production validation

Validation may begin only after the relevant P0 boundary is corrected and separately approved.

1. **Identity:** credential-backed owner/member login, logout, refresh, expiry, recovery, invitation acceptance, revocation, role change, and multi-tab behavior.
2. **Tenant isolation:** at least two synthetic businesses with owners and members; prove allowed same-tenant behavior and denied cross-tenant UI, route, API, direct-REST, Storage, job, Knowledge, AI-context, and record-ID access.
3. **Privileges:** inspect the current live schema, RLS policies, function ownership, effective grants, Storage policies, and service-role call sites. Any database correction must follow the mandatory inspection, migration, read-only verification, approval, manual execution, and recorded-verification workflow.
4. **API security:** authenticate every privileged endpoint; validate scheduler secrets, method safety, CSRF/origin behavior, input/size limits, idempotency, webhook replay, rate limiting, and abuse monitoring.
5. **Business workflows:** execute onboarding, CRM CRUD, Knowledge upload/process/search/replace/review/archive/delete, Calendly configuration/webhook, email/follow-up, team membership, and billing lifecycle cases with failure and recovery evidence.
6. **AI safety:** test public/private publication, prompt injection, cross-tenant retrieval, unsupported questions, model/provider failure, configured action policy, human authority, output truthfulness, execution evidence, log minimization, and retention.
7. **Reliability:** exercise real parsers, Supabase concurrency, retries, crash/restart behavior, stale jobs, provider timeouts, duplicate webhooks, backup/restore, and rollback.
8. **Accessibility and responsive:** keyboard and focus traversal, screen reader, landmarks and names, contrast, zoom/reflow, reduced motion, mobile/tablet/desktop, and supported-browser testing.
9. **Performance:** production Core Web Vitals, dashboard and Knowledge load, API/provider latency, file-processing duration, concurrency, rate-limit behavior, and representative load.
10. **Operations:** monitoring dashboards, structured and sanitized logs, alert tests, ownership, runbooks, incident exercises, data recovery, credential rotation, and final cleanup evidence.

## 8. Estimated certification score

| Gate | Weight | Current evidence score | Reason |
| --- | ---: | ---: | --- |
| Identity and tenant authorization | 25 | 2 | Static schema foundations exist, but the interactive runtime uses shared-password/service-role/default-tenant access |
| API and security controls | 15 | 4 | Some protected routes and signed webhooks exist; critical privileged/public boundaries remain open |
| Functional and data integrity | 20 | 12 | Several useful workflows exist, but default-tenant behavior and partial lifecycles limit assurance |
| Tests and reliability | 15 | 7 | Knowledge has 12 in-memory tests; Workspace authorization and end-to-end coverage are absent |
| Accessibility and responsive evidence | 10 | 3 | Structural UI foundations exist; no Workspace certification matrix exists |
| Performance and operations | 15 | 2 | No production performance, monitoring, restore, incident, or operational certification evidence exists |
| **Total** | **100** | **30** | **FAILED — Production Ready NO** |

## 9. Highest-priority blocker

**P0: Business Workspace requests are not bound to a verified user, owner/member role, and server-derived tenant before privileged data access.**

This blocker controls every downstream certification gate. The shared password supplies no actor or role, the service-role client bypasses RLS, hard-coded or missing business filters can mix tenants, and audit attribution is unavailable. Certification must stop until ordinary Workspace requests use least-privilege, actor-bound, tenant-scoped authorization.

## 10. Recommended certification roadmap

1. **Certification charter and freeze:** approve the audit scope, evidence rules, synthetic environment, severity model, and one-blocker-at-a-time workflow. Do not add features.
2. **P0 identity and tenant boundary:** propose an ADR for one Workspace identity/session model; derive owner/member role and active business on the server; remove shared-password and ordinary service-role authorization; scope every query and mutation. Inspect the live schema first and use the mandatory database workflow only if a schema change is genuinely required.
3. **P0 privileged/public endpoints:** protect follow-up execution, add a public Knowledge publication boundary, enforce input/rate/idempotency/replay controls, and prevent private Knowledge from reaching public AI context.
4. **Behavioral security certification:** provision approved fictional businesses, owners, and members; execute cross-tenant UI/API/direct-REST/Storage/AI-context denial and role tests; record sanitized evidence.
5. **Workflow and AI certification:** validate each existing business workflow, real failure recovery, model grounding, policy enforcement, execution evidence, retention, and human authority. Do not expand scope.
6. **Accessibility and responsive certification:** complete keyboard, screen-reader, contrast, zoom, reduced-motion, responsive, and supported-browser evidence.
7. **Performance and operational certification:** measure production behavior; prove monitoring, alerts, backup/restore, incident response, credential rotation, rollback, and support ownership.
8. **Final regression and decision:** run lint, Business Workspace tests, build, browser/end-to-end suites, security checks, and the full evidence matrix; then issue one evidence-backed Production Ready YES or NO decision.

No application code, SQL, migration, database state, deployment, identity, credential, or runtime behavior was changed by this audit.
