# JOHAI Platform Security Certification

**Audit date:** 2026-07-15  
**Repository:** `C:\Projects\johai`  
**Audit status:** Complete static audit; remediation not started  
**Certification decision:** FAILED  
**Estimated platform security score:** 30 / 100  
**Production Ready:** NO

## Scope and evidence boundary

This audit covers the current repository implementation for the Public Website, Business Workspace, Customer Portal, AI and Knowledge layer, provider integrations, database access layer, Storage access, and the reserved administration boundary. It inventories authentication, authorization, RBAC, RLS, JWTs, cookies, Supabase Auth, service-role access, environment variables, secrets, Storage, endpoints, schedulers, cron jobs, webhooks, background work, public and protected routes, API authentication, tenant isolation, `DEFAULT_BUSINESS_ID`, Knowledge publication, billing permissions, admin permissions, Portal permissions, and Workspace permissions.

Evidence reviewed:

- Application routes, components, libraries, tests, configuration, migrations, verification files, and current documentation in the repository.
- Every current `app/api/**/route.ts` entry point and every current page route.
- Static RLS, function, policy, grant, revoke, Storage, and tenant-isolation definitions in migration history.
- Environment-variable names and Git tracking/ignore state. Secret values were not copied into this report.
- A read-only production-dependency audit on 2026-07-15. It reported four moderate findings and no high or critical findings.

Limits of this certification:

- No SQL was executed and the live Supabase schema, roles, grants, policies, Auth settings, buckets, objects, or configuration were not queried.
- No production account, credential, provider dashboard, deployment edge, log platform, scheduler, webhook delivery history, backup, restore, or incident-response system was accessed.
- No dynamic penetration test, browser attack simulation, credential-backed tenant test, or provider replay test was performed.
- Source evidence can establish the presence or absence of controls in the repository. It cannot establish that production configuration matches the repository or that controls behave correctly under real credentials and concurrent requests.

No application code, SQL, migration, verification file, runtime configuration, package file, or existing documentation was modified. This audit is the only file created.

## Platform architecture

### Security-relevant layer map

| Layer | Current architecture | Principal security boundary | Audit result |
|---|---|---|---|
| Public Website | Public marketing, pricing, chat, lead capture, checkout, Calendly availability, and provider webhook routes | Route validation, abuse controls, publication controls, signed webhooks | **Critical fail**: privileged and costly public operations are insufficiently constrained |
| Business Workspace | `/dashboard/*` pages and related APIs use one shared dashboard-password cookie; server data access uses a Supabase service-role client | Shared cookie plus application code | **Critical fail**: no user, membership, role, or tenant-bound authorization |
| Workspace Supabase Auth | `/auth/*` and `/start/*` use a browser Supabase client with storage key `johai-auth-session` | Any authenticated Supabase session and client-side guards | **High fail**: disconnected from the dashboard boundary and from membership/RBAC enforcement |
| Customer Portal | Separate PKCE Supabase client with storage key `johai-customer-portal-session`; browser reads/writes rely on Portal RLS; downloads use a narrow server broker | Supabase Auth, Portal RLS, column grants, profile/business tuple, signed URLs | **Partial pass** statically; operational credential, Storage, revocation, and two-tenant evidence remains incomplete |
| AI and Knowledge | Public chat calls OpenAI, retrieves default-business Knowledge through a service-role path, and stores orchestration context; Workspace Knowledge processing is synchronous | Application prompts, service-role queries, processing status, Storage path conventions | **Critical fail**: no customer/public publication boundary for raw internal Knowledge |
| Provider integrations | Calendly, Stripe, Resend/email, and OpenAI are called from server routes | Environment/DB secrets, HMAC webhooks, application validation | **High fail**: replay, tenant mapping, idempotency, secret governance, and abuse controls are incomplete |
| Database and Storage | Supabase tables have static RLS migrations; service role is used broadly; Knowledge has a private bucket design; Portal download uses a configured private-bucket allowlist | RLS for caller clients; application checks for privileged clients | **Partial**: Portal design is materially stronger, but Workspace routinely bypasses RLS and live state is unverified |
| Scheduler and background execution | No deployment cron configuration or durable worker is present; follow-ups are request-triggered; Knowledge processing is synchronous | Public route or shared dashboard cookie | **Critical fail**: the follow-up executor is public and GET has side effects |
| Administration | No implemented JOHAI Super Admin authorization plane; service-role routes are the de facto privileged plane; `/executive-dashboard` is a public static page | Inconsistent route guards | **High fail**: no explicit admin identity, RBAC, step-up, audit, or tenant-bound capability model |
| Developer Platform | No separately authenticated developer API or scoped API-key model is implemented | Not applicable | **Not certifiable** as a developer platform surface |

### Endpoint and route inventory

| Boundary | Routes | Current control |
|---|---|---|
| Public pages | `/`, `/product`, `/pricing/*`, `/executive-dashboard` | No authentication; the executive-looking page is public and not clearly marked as a demo |
| Workspace Auth pages | `/auth/login`, `/auth/signup`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/callback` | Browser Supabase Auth; unvalidated `next` destination; no membership gate |
| Workspace onboarding pages | `/auth/welcome`, `/start/company`, `/start/ai-onboarding` | Any Supabase session through a client-only guard |
| Workspace pages | `/dashboard`, `/dashboard/onboarding`, `/dashboard/knowledge`, `/dashboard/settings`, `/dashboard/team` | Shared password cookie, not Supabase user or RBAC |
| Customer Portal pages | `/portal`, `/portal/appointments`, `/portal/messages`, `/portal/documents`, `/portal/profile`, `/portal/support` | Client Portal session resolution plus database RLS |
| Portal Auth pages | `/portal/login`, `/portal/reset-password` | Separate PKCE client and allowlisted Portal redirect paths |
| Portal demo | `/portal/demo/*`, `/portal/demo/files/*` | Development/test-only allowlist; production returns 404; in-memory fixture data |
| Public APIs | Billing checkout, Calendly availability/public, chat, lead capture, follow-up processing | No caller authentication; controls vary and are insufficient for cost or mutation risk |
| Signed webhook APIs | Stripe webhook and Calendly webhook | Raw-body HMAC and five-minute timestamp tolerance; no persistent replay/event ledger |
| Shared-cookie APIs | Calendly settings, Knowledge routes, lead mutation/cleanup, onboarding, team invite | Shared dashboard cookie plus service-role data access |
| Portal document API | `GET /api/portal/documents/[id]/download` | Bearer validation with `auth.getUser`, caller-RLS lookup, exact privileged reread, revocation/path/bucket checks, 60-second signed URL |

### Inventory disposition

| Control area | Disposition | Primary evidence/finding |
|---|---|---|
| Authentication | **Fail** | P0-01, P1-04 |
| Authorization | **Fail** | P0-01, P1-01, P1-02 |
| RBAC | **Fail** | P1-01 |
| RLS | **Partial** | Portal policies are strong statically; Workspace service-role paths bypass them; P1-13 |
| JWT | **Partial** | Portal validates download bearer tokens; browser persistence and Workspace session design remain weak; P1-04, P1-11 |
| Cookies | **Fail** | Secure attributes exist, but the Workspace cookie is a deterministic shared bearer with no actor, tenant, revocation record, or normal logout; P0-01 |
| Supabase Auth | **Partial** | Portal separation/PKCE is sound statically; Workspace Auth is disconnected from Workspace authorization; P1-04 |
| Service role | **Fail** | Broad interactive use and public privileged paths; P0-01, P0-02, P0-03, P1-14 |
| Environment variables | **Partial** | `.env.local` is ignored and untracked; deployment contract and startup validation are incomplete; P2-03 |
| Secrets | **Fail** | Provider secrets are stored/returned without an approved encrypted secret boundary; P1-06 |
| Storage | **Partial** | Knowledge bucket design and Portal broker have useful controls; scanning and deployed Portal bucket proof are missing; P1-09, P1-13 |
| Endpoints | **Fail** | Public and privileged endpoints lack consistent caller, tenant, schema, and abuse controls; P0-02, P0-04 |
| Schedulers/cron | **Fail** | No authenticated scheduler configuration; public follow-up executor; P0-02 |
| Webhooks | **Partial** | HMAC/timestamp checks exist; idempotency, tenant mapping, ordering, and event ledgers do not; P1-07 |
| Background workers | **Fail** | No durable queue/worker/lease/dead-letter design; P0-02, P1-09 |
| Public routes | **Fail** | Public AI, lead/email, checkout, and availability surfaces are abusable; P0-03, P0-04 |
| Protected routes | **Fail** overall | Portal is stronger; Workspace guard is not identity- or tenant-bound; P0-01 |
| API authentication | **Fail** | Inconsistent shared cookie, bearer, webhook, and public controls; P0-01, P0-02 |
| Tenant isolation | **Fail** | Broad service role, unfiltered reads, ID-only mutations, webhook email lookup, and hard-coded tenant; P0-01, P1-02 |
| `DEFAULT_BUSINESS_ID` | **Fail** | Used throughout Workspace, AI, Knowledge, Calendly, onboarding, and semantic memory; P0-01, P1-02 |
| Knowledge publication | **Fail** | Processing-ready internal content is treated as public AI context without publication approval; P0-03 |
| Billing permissions | **Fail** | Checkout is unbound and entitlements are not persisted/enforced; P1-08 |
| Admin permissions | **Fail** | No explicit admin plane; service role is de facto admin; P1-14 |
| Portal permissions | **Partial pass** statically | Narrow RLS/grants/download checks; live and behavioral evidence pending; P1-12, P1-13 |
| Workspace permissions | **Fail** | Global shared credential and member-wide `FOR ALL` policies; P0-01, P1-01 |

## Controls confirmed in source

- Customer Portal and Workspace browser sessions use separate singleton clients and separate storage keys. They are not intentionally merged.
- Customer Portal Auth uses PKCE and a strict allowlist for post-authentication Portal paths.
- Portal hardening migrations use tenant/profile-bound policies, narrow column privileges, locked search paths for hardened functions, and restricted function execution.
- The Portal document broker validates the bearer with Supabase Auth, performs the first metadata read under caller RLS, performs an exact tuple/revocation reread under service role, canonicalizes the object path, enforces a bucket allowlist and business/profile prefix, issues only a 60-second signed URL, and uses no-store responses.
- Portal demo routes are allowlisted to development/test and return 404 in production; the demo uses in-memory fixtures and no Portal Supabase client.
- Stripe and Calendly webhook code verifies raw-body HMAC signatures with timestamp tolerance and timing-safe comparison.
- The Knowledge bucket migration defines a private bucket and tenant-path RLS policies. Upload code enforces a 25 MB limit, allowed types, and basic file signatures.
- `.env.local` is ignored and was not found in tracked Git files. No committed service-role or provider secret was identified by this review.
- The shared dashboard cookie is HttpOnly, SameSite=Lax, Secure in production, and compared timing-safely. Those attributes are useful but do not make a shared deterministic credential an acceptable Workspace authorization boundary.

## P0 findings

### P0-01 — Business Workspace authentication, authorization, and tenant isolation collapse into one shared credential

- **Severity:** P0 — Critical.
- **Reason:** `/dashboard/*` and its privileged APIs trust one environment-wide `DASHBOARD_PASSWORD`. The cookie is the deterministic SHA-256 of that password and contains no user, membership, role, tenant, issue time, server session identifier, or revocation state. There is no login throttling, normal rendered logout path, or server-side session expiry record. Workspace data access then uses `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS. The dashboard reads all leads and all businesses before combining them with `DEFAULT_BUSINESS_ID`; lead mutations use record ID without business scope.
- **Risk:** Theft or sharing of one replayable cookie grants the whole Workspace privilege surface. In a multi-tenant dataset, an authorized shared-password holder can see or mutate data without per-business authorization. The deterministic cookie also serves as an offline verifier of candidate passwords. This is a source-supported capability; the audit did not observe a live breach.
- **Affected files:** `app/lib/dashboard-auth.ts`; `app/lib/supabase.ts`; `app/dashboard/page.tsx`; all `app/dashboard/**`; `app/api/leads/[id]/route.ts`; `app/api/leads/cleanup-test/route.ts`; `app/api/onboarding/route.ts`; `app/api/calendly/settings/route.ts`; `app/api/knowledge/**`; `app/api/team/invite/route.ts`.
- **Required fix:** Replace the shared boundary with a server-validated Supabase user session; resolve actor, active business, membership, and capability on every page and handler; use caller-scoped clients so RLS is authoritative for ordinary work; add business predicates to every privileged query; reserve service role for narrow reviewed operations; retire interactive use of `DEFAULT_BUSINESS_ID`; add random revocable server sessions only if a separate admin cookie remains; add logout, throttling, audit events, and two-tenant negative tests.
- **Dependencies:** Workspace identity/RBAC decision; live schema/ACL inspection; approved test identities; server session/middleware design. Any database correction must follow live inspection, migration, read-only verification, human approval, manual execution, and recorded verification.
- **Certification impact:** Automatic failure for Authentication, Authorization, RBAC, Tenant Isolation, Protected Routes, Workspace Permissions, and overall platform certification.
- **Estimated effort:** XL — approximately 2–4 weeks.
- **Estimated certification gain:** +15 to +20 points after verified closure; gains are non-additive.

### P0-02 — Public follow-up route performs privileged cross-record email and state mutation

- **Severity:** P0 — Critical.
- **Reason:** Both `GET` and `POST /api/follow-ups/process` are unauthenticated. They create a service-role client, scan up to 100 leads without business scope, send email, and mutate follow-up state. GET performs side effects. There is no scheduler identity, replay protection, durable claim-before-send, tenant scope, rate limit, or operational audit actor.
- **Risk:** Any visitor, crawler, or attacker can trigger outbound customer communications, duplicate delivery races, provider cost, sender-reputation damage, and cross-tenant data mutations.
- **Affected files:** `app/api/follow-ups/process/route.ts`; `app/lib/email.ts`; `app/lib/supabase.ts`.
- **Required fix:** Immediate containment is to disable the public executor and remove GET. The production design must accept only a verified platform scheduler identity or rotatable secret, scope work per tenant, atomically claim before delivery, persist idempotency/provider IDs, bound batches, support retries/dead letters, and emit monitored audit events.
- **Dependencies:** Deployment scheduler and secret manager; tenant resolver; durable outbox/queue decision; provider delivery identifiers. Durable state may require the mandatory database workflow.
- **Certification impact:** Blocks API Authentication, Schedulers/Cron, Background Work, Email Automation, Tenant Isolation, and platform production approval.
- **Estimated effort:** S for containment; L — approximately 1–2 weeks — for a certifiable durable design.
- **Estimated certification gain:** +8 to +12 points after verified closure.

### P0-03 — Public AI retrieves raw internal Knowledge without a publication boundary

- **Severity:** P0 — Critical.
- **Reason:** Unauthenticated `/api/chat` searches `DEFAULT_BUSINESS_ID` Knowledge through a privileged server path and injects up to 8,000 characters of Ready, active, non-archived chunks into the model prompt. `Ready` is a processing state, not public/customer approval. No `published`, `customer_visible`, classification, audience, expiry, or revocation predicate separates internal Knowledge Center content from public answers.
- **Risk:** Prompt attacks or ordinary questions can cause internal policies, procedures, filenames, pricing, operational details, or other confidential material to reach an anonymous caller or the model provider. This violates the JOHAI Knowledge and Contextual Intelligence boundaries.
- **Affected files:** `app/api/chat/route.ts`; `app/lib/semantic-memory.ts`; `app/lib/ai-orchestrator.ts`; `supabase/migrations/20260710200000_knowledge_center_v2.sql`.
- **Required fix:** Immediately disconnect raw Knowledge Center retrieval from public chat. A future public assistant may query only a separately approved publication projection with explicit audience, tenant, content-owner approval, provenance, classification, expiry/revocation, output filtering, and adversarial disclosure tests. It must never query raw Workspace Knowledge.
- **Dependencies:** Product/content-owner/security approval; public Knowledge governance model; model-safety evaluation. A persisted publication model would require the mandatory database workflow.
- **Certification impact:** Blocks Public AI, Knowledge Publication, Confidentiality, Contextual Intelligence compliance, and overall platform approval.
- **Estimated effort:** S for containment; L — approximately 1–2 weeks or more — for governed publication.
- **Estimated certification gain:** +8 to +10 points after verified closure.

### P0-04 — Public cost, spam, and resource-exhaustion primitives have no durable abuse boundary

- **Severity:** P0 — High/Critical.
- **Reason:** Public `/api/chat`, `/api/leads`, `/api/billing/checkout`, and `/api/calendly/availability` can call OpenAI, persist arbitrary PII/conversations, send email to attacker-selected addresses, create Stripe sessions, and call Calendly. They lack a common strict request schema, byte/message limits, distributed rate limit, bot friction, durable idempotency/deduplication, per-tenant/provider budget, timeout/circuit breaker, and abuse telemetry. Chat trusts a TypeScript cast at runtime and forwards caller-controlled roles/content; lead capture accepts unbounded conversation data.
- **Risk:** Email bombing, spam reputation loss, provider cost exhaustion, database/log growth, parser/resource pressure, prompt injection, and degraded availability are remotely triggerable without credentials.
- **Affected files:** `app/api/chat/route.ts`; `app/api/leads/route.ts`; `app/api/billing/checkout/route.ts`; `app/api/calendly/availability/route.ts`; `components/AIChat.tsx`; `app/lib/email.ts`; `app/lib/stripe-billing.ts`; `app/lib/calendly.ts`.
- **Required fix:** Add shared runtime schemas and byte/count limits; allowlist chat roles; distributed IP/device/identity/tenant limits; bot challenge where appropriate; verified consent and queued/deduplicated email; bounded provider timeouts, budgets, and circuit breakers; safe error handling; metrics and alerts. Resolve the intended public tenant explicitly rather than by global default.
- **Dependencies:** Edge/rate-limit store; abuse policy; mail queue; bot-control provider; operational monitoring.
- **Certification impact:** Blocks Public Routes, API Security, Availability, Cost Control, Lead Integrity, and production approval.
- **Estimated effort:** M–L — approximately 1–2 weeks across all endpoints.
- **Estimated certification gain:** +6 to +9 points after verified closure.

## P1 findings

### P1-01 — RBAC is a text label, not an enforced capability model

- **Severity:** P1 — High.
- **Reason:** `business_members.role` is unconstrained text. `user_owns_business()` treats every member as equivalent for data access, and multiple table policies grant members `FOR ALL`. The team invite route accepts an arbitrary role string but stores it only in user metadata; it does not create a controlled tenant membership lifecycle. Business/Portal principal non-overlap is checked when Portal access is evaluated, but no invariant prevents a Portal Auth UUID from later being assigned as a Workspace owner/member.
- **Risk:** A nominal low-privilege member can directly update or delete sensitive tenant data through PostgREST. Misconfiguration or a privileged tenant operator can blur Customer Portal and Workspace identities, potentially exposing CRM/internal capabilities to an end-customer identity.
- **Affected files:** `supabase/migrations/20260707150000_multi_tenant_rls_ownership.sql`; `supabase/migrations/20260708*.sql`; `supabase/migrations/20260713190000_customer_portal_production_security_hardening.sql`; `app/api/team/invite/route.ts`.
- **Required fix:** Define an allowlisted role/capability matrix; constrain roles; separate read/write/manage/delete policies; reserve membership, settings, secrets, destructive Knowledge work, and billing/admin actions for explicit capabilities; enforce Workspace/Portal principal non-overlap on every write path and in both insertion orders; never use `user_metadata` as authorization truth.
- **Dependencies:** RBAC ADR and approval; live schema inspection; migration/verifier/human approval if policies or constraints change; role and mixed-principal fixtures.
- **Certification impact:** Blocks RBAC, Privilege Escalation, Workspace Permissions, and permanent cross-layer separation certification.
- **Estimated effort:** L — approximately 1–2 weeks.
- **Estimated certification gain:** +7 to +10 points after verified closure.

### P1-02 — Privileged tenant scope is missing from lead, cleanup, Calendly, and default-business operations

- **Severity:** P1 — High.
- **Reason:** Lead update/delete predicates use ID only; test cleanup deletes every `is_test=true` lead; the dashboard reads all leads/businesses; the Calendly webhook finds a lead by email across the full service-role view and inserts without explicit tenant identity; onboarding, Knowledge, AI, semantic memory, and Calendly use `DEFAULT_BUSINESS_ID`.
- **Risk:** Same-email customers, known record IDs, cleanup actions, provider events, and mixed datasets can affect or expose the wrong business. The hard-coded UUID prevents safe multi-tenant scaling and makes accidental cross-layer joins likely.
- **Affected files:** `app/lib/supabase.ts`; `app/dashboard/page.tsx`; `app/api/leads/[id]/route.ts`; `app/api/leads/cleanup-test/route.ts`; `app/api/calendly/webhook/route.ts`; `app/lib/calendly.ts`; `app/api/onboarding/route.ts`; `app/api/knowledge/**`; `app/lib/knowledge-engine.ts`; `app/lib/semantic-memory.ts`; `app/api/chat/route.ts`.
- **Required fix:** Resolve tenant from the verified actor or signed integration registration; include `business_id` in every privileged predicate and uniqueness rule; bind Calendly webhook configuration/event identity to one tenant; remove the default UUID from interactive and multi-tenant flows; add A/B collision tests for IDs and email addresses.
- **Dependencies:** P0-01 identity/tenant resolver; per-tenant integration design; database indexes/constraints only through the mandatory workflow.
- **Certification impact:** Blocks Tenant Isolation, Integration Integrity, CRM, Knowledge, and Workspace certification.
- **Estimated effort:** M–L — approximately 1–2 weeks after the tenant resolver exists.
- **Estimated certification gain:** +6 to +8 points after verified closure.

### P1-03 — Workspace Supabase Auth lifecycle is unsafe and disconnected from Workspace authorization

- **Severity:** P1 — High.
- **Reason:** Any Supabase session passes `AuthGuard`; signup is public; no business membership or role is checked; the dashboard uses a different shared-password boundary. Login and callback consume `next` directly in `router.push/replace`, without Portal-style local-path allowlisting. Workspace Auth uses implicit flow/browser persistence. Reset-password calls `updateUser` for any active session without requiring a recent bound recovery event. UI password minimum is six characters. No normal Workspace sign-out flow was found.
- **Risk:** Unapproved users can enter onboarding surfaces; untrusted redirects enable phishing and may accept unsafe schemes; recovery can be confused with an ordinary active session; persistent tokens have higher impact under XSS; users cannot reliably terminate the Workspace session.
- **Affected files:** `components/AuthGuard.tsx`; `components/AuthProvider.tsx`; `app/auth/AuthClient.tsx`; `app/auth/callback/page.tsx`; `app/auth/reset-password/page.tsx`; `app/lib/supabase-auth-client.ts`; `app/lib/supabase-browser-auth-client.ts`; `app/dashboard/login/page.tsx`.
- **Required fix:** Unify Workspace identity with server membership/capability checks; use a strict allowlisted local-path parser; use PKCE/server exchange as appropriate; bind reset UI to a recent recovery event; restrict signup to approved onboarding/invitation rules; add logout, password/MFA policy, expiry, refresh, multi-tab, and callback tests.
- **Dependencies:** P0-01; approved Workspace route allowlist; Supabase Auth configuration and test identities.
- **Certification impact:** Blocks Authentication, Recovery, JWT/Session, Protected Routes, and callback certification.
- **Estimated effort:** M–L — approximately 1–2 weeks including tests.
- **Estimated certification gain:** +4 to +6 points after verified closure.

### P1-04 — Team invitation uses Auth admin without a complete tenant membership lifecycle

- **Severity:** P1 — High.
- **Reason:** A shared-password holder can invoke `auth.admin.inviteUserByEmail`. The role is unbounded, is written only as metadata, and is not connected atomically to a business membership. The redirect origin is derived from the request URL/Host. There is no tenant invitation record, expiry, acceptance transaction, revocation, resend policy, rate limit, or actor audit.
- **Risk:** Auth-user sprawl, misleading or spoofed role metadata, wrong-host invitation links, orphan users, and untraceable privileged invitations.
- **Affected files:** `app/api/team/invite/route.ts`; `app/dashboard/team/TeamInviteClient.tsx`; `supabase/migrations/20260707150000_multi_tenant_rls_ownership.sql`.
- **Required fix:** Owner/admin capability check; role enum; configured canonical origin; tenant-bound invitation with hashed token, expiry, acceptance, revocation, resend limits, atomic membership creation, and audit attribution.
- **Dependencies:** P0-01 and P1-01; email/canonical-origin configuration; likely approved database workflow.
- **Certification impact:** Blocks Team Administration, RBAC, Auth provisioning, and Admin Permission certification.
- **Estimated effort:** L — approximately 1–2 weeks.
- **Estimated certification gain:** +4 to +6 points after verified closure.

### P1-05 — Provider secrets lack a narrow encrypted storage and response boundary

- **Severity:** P1 — High.
- **Reason:** Calendly PAT and webhook signing key are stored as ordinary database text and accessed with service role. Masking affects only the returned display. Onboarding selects broad settings records whose type includes `email_api_key`, creating an over-return risk. There is no documented encryption envelope/Vault boundary, version, rotation state, secret-access audit, or least-privilege reader.
- **Risk:** Shared-credential compromise, database snapshot exposure, over-broad response serialization, or logging can reveal reusable provider credentials.
- **Affected files:** `app/api/calendly/settings/route.ts`; `app/lib/calendly.ts`; `app/api/onboarding/route.ts`; `app/lib/supabase.ts`; Calendly/business-settings migrations.
- **Required fix:** Return explicit safe DTOs only; never return secret fields; authorize per tenant and capability; move credentials to an approved secret manager/Vault or envelope-encrypted server-only store; add versioned rotation and audited reads/writes; avoid partial secret display unless explicitly justified.
- **Dependencies:** Secret platform and key-management decision; P0-01/P1-01; migration and data rotation through the mandatory workflow if database storage changes.
- **Certification impact:** Blocks Secrets, Calendly, Workspace Settings, and operational certification.
- **Estimated effort:** M–L — approximately 1–2 weeks.
- **Estimated certification gain:** +3 to +5 points after verified closure.

### P1-06 — Webhooks lack durable replay, ordering, event-type, and tenant controls

- **Severity:** P1 — High.
- **Reason:** Stripe and Calendly perform useful HMAC/timestamp checks, but neither persists a unique provider/event ledger. Calendly loads default settings before verification, maps by email rather than a tenant-bound external ID, and does not strictly allowlist event types. Stripe logs checkout completion but has no idempotent subscription transition, ordering policy, reconciliation, or account mapping.
- **Risk:** Valid deliveries can be replayed inside the accepted window, delivered twice, arrive out of order, or update the wrong tenant. Future billing mutation could double-apply state.
- **Affected files:** `app/api/calendly/webhook/route.ts`; `app/lib/calendly.ts`; `app/api/billing/webhook/route.ts`; `app/lib/stripe-billing.ts`.
- **Required fix:** Persist unique provider/event IDs; verify before tenant-secret-dependent work where feasible; map external account/customer/event to one tenant; reject unknown event types; apply transactional idempotent state transitions and ordering rules; bound request size; reconcile provider state; use official verifier behavior for multi-signature headers.
- **Dependencies:** Provider fixtures/configuration; tenant mapping; approved event-ledger database workflow.
- **Certification impact:** Blocks Webhooks, Calendly Integrity, Billing Integrity, and production integration certification.
- **Estimated effort:** L — approximately 1–2 weeks.
- **Estimated certification gain:** +5 to +7 points after verified closure.

### P1-07 — Billing does not enforce tenant ownership or entitlements

- **Severity:** P1 — High.
- **Reason:** Checkout is unauthenticated and not bound to a verified user, business, Stripe customer, or subscription. Webhook handling only logs completion. Plan quotas/features calculated in application code are not backed by a verified subscription record or enforced as authorization. No cancellation, refund, customer-portal, reconciliation, or admin lifecycle is present.
- **Risk:** Orphan payments, wrong-tenant subscription association, payment/access mismatch, unenforced plan limits, and future billing privilege escalation.
- **Affected files:** `app/api/billing/checkout/route.ts`; `app/api/billing/webhook/route.ts`; `app/lib/stripe-billing.ts`; `app/lib/billing.ts`; pricing clients.
- **Required fix:** Require authenticated or securely tokenized checkout; derive tenant and customer server-side; persist verified subscription and event ledger; enforce entitlements in server authorization; add reconciliation, cancellation/refund, customer self-service, admin controls, and billing audit tests.
- **Dependencies:** P0-01/P1-01; Stripe customer/subscription mapping; approved database workflow.
- **Certification impact:** Blocks Billing Permissions, Entitlements, Financial Integrity, and platform production approval for paid plans.
- **Estimated effort:** XL — approximately 2–4 weeks.
- **Estimated certification gain:** +8 to +12 points after verified closure.

### P1-08 — Knowledge ingestion and processing are not hardened as a production worker pipeline

- **Severity:** P1 — High.
- **Reason:** Runtime upload and processing use service role/default tenant. Validation uses extension/MIME and shallow signatures but no quarantine, malware scan, archive-bomb control, parser sandbox, or strict CPU/memory/time budget. Rate limits and locks are process-local and trust forwarding headers. Processing is synchronous request work, can cover large batches, and lacks a durable queue, distributed lease, dead letter, and cross-instance idempotency guarantee.
- **Risk:** Malicious or pathological documents can exhaust parsers/workers; multi-instance races can duplicate or corrupt versions/chunks; failures can leave inconsistent trusted Knowledge; rate controls are bypassable.
- **Affected files:** `app/api/knowledge/**`; `app/lib/knowledge-upload.ts`; `app/lib/knowledge-engine.ts`; `app/lib/knowledge-processing-queue.ts`; `app/lib/knowledge-versioning.ts`; `supabase/migrations/20260708130000_knowledge_engine_phase_2.sql`; `supabase/migrations/20260712120000_knowledge_version_transaction_hardening.sql`.
- **Required fix:** Actor/tenant-bound ingestion; quarantine and malware/content scan; isolated parsers with resource budgets; one-file durable jobs; distributed leases; transactional/idempotent version and chunk transitions; retry/dead-letter/monitoring; proxy-trust configuration; parser fuzz and malformed-file tests.
- **Dependencies:** Worker/queue/scanner infrastructure; P0-01 tenant resolver; live status of transaction hardening; approved database workflow for durable state.
- **Certification impact:** Blocks Storage, Knowledge Center, Background Workers, Availability, and content-integrity certification.
- **Estimated effort:** XL — approximately 2–4 weeks.
- **Estimated certification gain:** +6 to +9 points after verified closure.

### P1-09 — Cookie-protected mutations lack a shared CSRF, canonical-origin, and validation policy

- **Severity:** P1 — High.
- **Reason:** SameSite=Lax is useful but cookie-protected mutations do not explicitly validate Origin or a CSRF token. Several request bodies and JSON records are unbounded or weakly typed. UUID/email/role/URL validation is inconsistent. Invitation and lead-email links derive origins from request URLs rather than one configured canonical origin.
- **Risk:** Same-site sibling-origin compromise, unsafe reverse-proxy Host configuration, oversized/unexpected payloads, and inconsistent validation can cause unauthorized actions, misleading links, stored junk, or resource exhaustion.
- **Affected files:** `app/dashboard/login/page.tsx`; `app/api/onboarding/route.ts`; `app/api/leads/route.ts`; `app/api/leads/[id]/route.ts`; `app/api/team/invite/route.ts`; `app/api/calendly/settings/route.ts`; `app/api/knowledge/**`; `app/api/chat/route.ts`.
- **Required fix:** Shared strict schemas with content-type, byte, count, enum, UUID, email, and URL rules; configured canonical origin; Origin validation and CSRF token for cookie mutations; consistent safe error responses; adversarial body/Host/origin tests.
- **Dependencies:** Identity/session architecture; canonical deployment configuration; validation library/policy.
- **Certification impact:** Blocks API Integrity, CSRF, Input Validation, and invitation/email trust certification.
- **Estimated effort:** M — approximately 3–6 days after the session model is decided.
- **Estimated certification gain:** +3 to +5 points after verified closure.

### P1-10 — Browser JWT exposure is not offset by a platform security-header policy

- **Severity:** P1 — High.
- **Reason:** Both Supabase clients persist browser sessions. Portal and Workspace storage keys are separate, but same-origin XSS can still read tokens. `next.config.ts` defines no application-wide CSP, HSTS, frame restriction, nosniff, Referrer-Policy, Permissions-Policy, or powered-by suppression. Portal protected UI is client-gated and relies on RLS for data confidentiality.
- **Risk:** XSS impact includes token theft and authenticated API access. Missing frame/referrer/permissions controls increase clickjacking and data-leak surface. Client-only route gating reduces defense in depth, although Portal RLS remains the authoritative data boundary.
- **Affected files:** `app/lib/supabase-browser-auth-client.ts`; `app/lib/supabase-auth-client.ts`; `app/lib/customer-portal-auth-client.ts`; `components/AuthProvider.tsx`; `components/portal/PortalAuthProvider.tsx`; `components/portal/PortalProvider.tsx`; `next.config.ts`.
- **Required fix:** Tested nonce/hash CSP; HSTS at the trusted HTTPS edge; frame-ancestors/X-Frame-Options; nosniff; strict referrer and minimal permissions policies; remove powered-by; inventory third-party scripts; consider server/HttpOnly session boundaries where compatible; add header and XSS regression tests.
- **Dependencies:** Deployment/CDN behavior; nonce strategy; browser regression tests; provider/script inventory.
- **Certification impact:** Blocks JWT/Session Hardening, Browser Security, Portal/Workspace final certification.
- **Estimated effort:** M — approximately 3–6 days, longer if session architecture changes.
- **Estimated certification gain:** +2 to +4 points after verified closure.

### P1-11 — PII retention, security logging, monitoring, and incident controls are undefined

- **Severity:** P1 — High.
- **Reason:** Full chat conversations, lead context, and extracted email/identity data are sent to the model/orchestrator and persisted. Routes log raw caught provider/Supabase errors without one structured redaction policy. There is no repository-backed retention/deletion schedule, immutable actor/tenant audit standard, security alerting, SLO, incident runbook, or proven backup/restore process for this platform state.
- **Risk:** Excess PII retention, accidental logs of provider details or identifiers, weak forensics, delayed incident detection, and inability to demonstrate recovery or regulatory handling.
- **Affected files:** `app/api/chat/route.ts`; `app/lib/ai-orchestrator.ts`; `app/api/leads/route.ts`; `app/lib/email.ts`; `app/api/knowledge/**`; `app/api/calendly/**`; `app/api/billing/webhook/route.ts`; operations documentation.
- **Required fix:** Data classification and minimization; explicit retention/deletion; structured allowlist logging with token/email/prompt/signed-URL/provider-body redaction; correlation and actor/tenant IDs; immutable security events; alerts, dashboards, incident ownership, backup/restore and breach-response exercises.
- **Dependencies:** Privacy/legal decisions; observability/SIEM and backup platforms; operations ownership.
- **Certification impact:** Blocks Privacy, Auditability, Incident Response, Recovery, and operational production approval.
- **Estimated effort:** L — approximately 1–2 weeks plus operational rollout.
- **Estimated certification gain:** +3 to +5 points after verified closure.

### P1-12 — Customer Portal static controls are strong, but production Auth/Storage behavior is not certified

- **Severity:** P1 — High evidence gap.
- **Reason:** The Portal code and hardening migration are materially stronger than the Workspace boundary, but source cannot prove live bucket privacy, direct anon/authenticated denial, object placement, cross-tenant RLS behavior, signed URL expiry/revocation, account expiry/recovery, suspended/invited states, multi-profile selection, multi-tab propagation, or simultaneous Workspace/Portal session isolation. Download issuance has no distributed rate limit, and a URL remains usable for up to 60 seconds after issuance even if the document is revoked.
- **Risk:** A deployment/configuration drift or untested edge case could expose an object or permit account/download abuse despite a sound static design.
- **Affected files:** `app/api/portal/documents/[id]/download/route.ts`; `app/lib/customer-portal-auth-client.ts`; `components/portal/PortalAuthProvider.tsx`; `components/portal/PortalProvider.tsx`; `app/lib/customer-portal-supabase-repository.ts`; Portal migrations and verification files; `tests/customer-portal-pilot.test.ts`.
- **Required fix:** Execute the approved credential-backed synthetic matrix: two tenants, multiple customers, direct REST/RLS denial, Storage direct-read denial, canonical paths, revoked and expired downloads, race behavior, auth expiry/refresh/recovery/suspension/invitation/multi-profile/multi-tab, and simultaneous session isolation. Add download/write rate controls and telemetry. Do not use production customers.
- **Dependencies:** Human-provisioned synthetic identities and private objects; approved operational test environment; production-like configuration and cleanup approval.
- **Certification impact:** Keeps Customer Portal on Operational Validation Hold and prevents platform-wide Portal/Storage sign-off.
- **Estimated effort:** M–L — approximately 1–2 weeks including human testing.
- **Estimated certification gain:** +3 to +5 points of assurance after successful evidence is recorded.

### P1-13 — Live RLS/ACL state and platform adversarial tests are unverified

- **Severity:** P1 — High evidence gap.
- **Reason:** Static migrations define substantial RLS, but this no-SQL audit cannot prove deployment state, owners, grants, function ACLs, bucket visibility, policy duplication, migration drift, or `FORCE ROW LEVEL SECURITY`. Verification files exist for recent Portal and Knowledge transaction work, not for the complete historical Workspace security surface. Existing tests cover Portal fixtures and Knowledge reliability, not the full route/role/tenant matrix.
- **Risk:** Production may differ from source. A missing/duplicate policy, broad grant, owner bypass, or service-role route regression may remain undetected.
- **Affected files:** `supabase/migrations/**`; `supabase/verification/**`; `package.json`; `tests/customer-portal-pilot.test.ts`; `tests/knowledge-processing-reliability.test.ts`; all API routes.
- **Required fix:** After code/control remediation, perform approved read-only live inspection; create immutable migrations and read-only verifiers only where findings require database correction; add automated route auth matrix, direct PostgREST A/B denial, Storage isolation, webhook replay/order, scheduler auth/idempotency, CSRF/Host, rate/body fuzzing, billing lifecycle, and service-role client-graph tests. Record results and human approvals.
- **Dependencies:** Supabase read-only access; synthetic tenants; test environment; mandatory database workflow for any correction.
- **Certification impact:** Blocks RLS, Database Safety, Tenant Isolation, and evidence-based final certification even if source defects are fixed.
- **Estimated effort:** L — approximately 1–2 weeks after controls exist.
- **Estimated certification gain:** +5 to +8 points of evidence after successful verification.

### P1-14 — Service role is the de facto admin plane; explicit admin permissions do not exist

- **Severity:** P1 — High.
- **Reason:** JOHAI Super Admin is not implemented, yet many server routes operate with unrestricted service-role privileges. Those privileges are protected inconsistently by a shared cookie, public route, webhook signature, or narrow bearer broker. There is no explicit admin principal, role/capability model, MFA/step-up, tenant support grant, break-glass flow, approval, or immutable privileged-action audit.
- **Risk:** Any route-level guard failure becomes a database-wide privileged operation. Operators cannot prove who performed an administrative action, why, for which tenant, or under which approval.
- **Affected files:** `app/lib/supabase.ts`; every route importing `createSupabaseServerClient`; `app/api/portal/documents/[id]/download/route.ts`; `app/api/team/invite/route.ts`; `app/api/follow-ups/process/route.ts`; current absence of a Super Admin authorization layer.
- **Required fix:** Define the admin threat model before implementation; inventory and minimize each service-role operation; create narrow server capabilities; require verified administrator identity, MFA/step-up, tenant scope, reason/approval, expiration, and immutable audit for support/admin actions; add a static client-graph and route-guard policy.
- **Dependencies:** P0-01/P1-01; Super Admin architecture and approval; secret manager; audit platform; database changes only through the mandatory workflow.
- **Certification impact:** Blocks Service Role, Admin Permissions, Least Privilege, and platform-wide certification.
- **Estimated effort:** XL — approximately 2–4 weeks for the platform control plane; immediate service-role inventory is smaller.
- **Estimated certification gain:** +4 to +6 points after verified closure.

## P2 findings

### P2-01 — Older SECURITY DEFINER functions are less hardened than the Portal standard

- **Severity:** P2 — Medium.
- **Reason:** `user_owns_business` and `search_knowledge_chunks` retain `search_path = public`; the ownership helper migration does not explicitly lock owner or revoke/grant EXECUTE. The Portal hardening standard instead uses `pg_catalog`, fully qualified objects, controlled ownership, and explicit ACLs.
- **Risk:** Mutable search path and implicit function privileges enlarge the privilege boundary and complicate proof of least privilege. No exploit was demonstrated in this static review.
- **Affected files:** `supabase/migrations/20260707150000_multi_tenant_rls_ownership.sql`; `supabase/migrations/20260710200000_knowledge_center_v2.sql`.
- **Required fix:** Through a new immutable migration only: controlled owner; locked `pg_catalog` search path; fully qualified objects; revoke from PUBLIC/anon/authenticated/service_role then grant only strictly required callers; replace misleading owner semantics with role-aware predicates; verify definitions/ACLs read-only.
- **Dependencies:** Live inspection and mandatory database workflow.
- **Certification impact:** Definer-function and least-privilege hardening gap.
- **Estimated effort:** S–M plus approval/verification.
- **Estimated certification gain:** +2 to +3 points after verified closure.

### P2-02 — Service-role client module lacks an enforced server-only import boundary

- **Severity:** P2 — Medium defense in depth.
- **Reason:** `app/lib/supabase.ts` reads `SUPABASE_SERVICE_ROLE_KEY` but does not import `server-only`. Current client references found in the audit are type-only, so no present browser key exposure was identified.
- **Risk:** A future accidental value import can pull privileged code into a client graph or create an unsafe regression with catastrophic consequence.
- **Affected files:** `app/lib/supabase.ts`; client files importing its types.
- **Required fix:** Enforce `server-only`; split shared types/constants from credential-bearing server code; add a build/static assertion that service-role identifiers and clients never enter client bundles.
- **Dependencies:** Small module refactor and bundle test.
- **Certification impact:** Defense-in-depth requirement for service-role containment.
- **Estimated effort:** S — less than two days.
- **Estimated certification gain:** +1 to +2 points after verified closure.

### P2-03 — Environment contract, deployment validation, and rotation ownership are incomplete

- **Severity:** P2 — Medium.
- **Reason:** Secret files are ignored and no tracked secret was found, but there is no value-free complete environment contract, typed startup validation, feature-by-feature required-key matrix, rotation owner, or deployment readiness check. Local key names cover OpenAI, Supabase, and the dashboard password, while source also expects Portal bucket allowlists, Stripe, Resend, email identities, application origin, and billing price configuration. Local absence is not evidence of production absence.
- **Risk:** Features can fail at runtime, silently degrade, use unsafe defaults, or deploy without required rotation/ownership evidence.
- **Affected files:** `.gitignore`; `.env.local` key inventory; `next.config.ts`; `app/lib/email.ts`; `app/lib/stripe-billing.ts`; `app/api/billing/webhook/route.ts`; `app/api/portal/documents/[id]/download/route.ts`; deployment documentation.
- **Required fix:** Value-free environment schema with public/server classification, required-by-feature rules, fail-closed startup/readiness checks, canonical origin, owner, rotation cadence, and deployment validation. Never store values in Git or documentation.
- **Dependencies:** Operations and secret-manager ownership.
- **Certification impact:** Deployment and secret-operations evidence gap.
- **Estimated effort:** S–M.
- **Estimated certification gain:** +1 to +3 points after verified closure.

### P2-04 — Public executive-looking route is not clearly separated from administration

- **Severity:** P2 — Medium.
- **Reason:** `/executive-dashboard` is public and contains hard-coded administrative-looking KPIs. No sensitive live data was identified, but the route is not clearly labeled/noindexed as a demonstration and is not part of an authenticated admin boundary.
- **Risk:** Users or investors may mistake demonstration data for live operational facts; the route trains an unsafe expectation that executive/admin surfaces are public.
- **Affected files:** `app/executive-dashboard/page.tsx`.
- **Required fix:** Remove it from production, protect it under the future admin model, or clearly label it as synthetic demo content and noindex it.
- **Dependencies:** Product/communications decision.
- **Certification impact:** Trust, route classification, and admin-boundary hardening gap.
- **Estimated effort:** S.
- **Estimated certification gain:** +1 point after verified closure.

### P2-05 — Current production dependency graph contains four moderate advisories

- **Severity:** P2 — Medium pending exploitability triage.
- **Reason:** The read-only 2026-07-15 dependency audit reported four moderate entries: direct `next@16.2.10` via bundled `postcss@8.4.31` (`GHSA-qx2v-qp2m-jg93`) and direct `exceljs@4.4.0` via `uuid@8.3.2` (`GHSA-w5hq-g745-h8pq`). The audit reported no available automatic fix and no high or critical entries. Runtime exploitability in JOHAI was not demonstrated; PostCSS impact depends on untrusted CSS stringification and the UUID advisory depends on affected UUID buffer APIs.
- **Risk:** A reachable vulnerable path could permit XSS or data-integrity impact. Untriaged advisories prevent a clean dependency attestation.
- **Affected files:** `package.json`; `package-lock.json`; transitive `postcss` and `uuid` dependency paths.
- **Required fix:** Determine reachability; update or override to patched versions when compatible; remove unused production dependencies; record compensating controls if no upstream fix exists; rerun production and development audits plus build/test after any approved dependency change.
- **Dependencies:** Upstream package releases and regression testing.
- **Certification impact:** Dependency-security hardening gap; not the cause of the current P0 decision.
- **Estimated effort:** S–M for triage, potentially longer for upstream compatibility.
- **Estimated certification gain:** +1 to +2 points after verified closure.

## Certification score

| Category | Score | Maximum | Basis |
|---|---:|---:|---|
| Authentication and session lifecycle | 5 | 12 | Portal is comparatively strong; Workspace shared-password and disconnected Auth fail |
| Authorization and RBAC | 1 | 14 | No effective Workspace capability model |
| Tenant isolation and RLS | 3 | 16 | Portal static controls exist; broad service-role/default-tenant paths and live-state gap dominate |
| API and public-route security | 2 | 14 | Public mutation, cost, spam, and publication blockers |
| Secrets, cookies, JWTs, and service role | 5 | 12 | Some fail-closed config and separate clients; privileged boundaries remain unsafe |
| Storage and Knowledge security | 4 | 10 | Useful bucket/path/upload controls; publication, scanning, and deployment proof fail |
| Webhooks, schedulers, workers, and billing | 3 | 10 | HMAC checks pass statically; replay, scheduling, durability, and entitlement fail |
| Customer Portal-specific controls | 5 | 6 | Strong static design; operational identity/Storage evidence pending |
| Security operations, tests, and dependency assurance | 2 | 6 | Limited automated coverage, no live platform proof, four moderate advisories |
| **Total** | **30** | **100** | Four open P0 findings impose an automatic production-failure cap |

Estimated gains on individual findings overlap and must not be summed mechanically. A higher score is not available merely by documenting a fix; each control must be implemented, validated under current production-like conditions, and supported by recorded evidence.

## Certification blockers

The following conditions must be closed before platform certification can pass:

1. Replace the global Workspace password/service-role/default-tenant boundary with actor-, role-, and tenant-bound authorization.
2. Disable or authenticate and redesign the public follow-up executor.
3. Remove raw internal Knowledge Center retrieval from public AI until an approved publication boundary exists.
4. Add durable abuse, schema, size, idempotency, and provider-budget controls to public cost/email routes.
5. Enforce a real RBAC model and permanent Customer Portal/Workspace principal separation.
6. Scope every privileged record and integration operation to a verified tenant.
7. Complete Workspace Auth, invitation, recovery, redirect, logout, JWT, and callback hardening.
8. Establish secret management, webhook replay/tenant mapping, billing entitlements, durable workers, and admin least privilege.
9. Complete Portal synthetic Auth/RLS/Storage/download validation without production customers.
10. Inspect and verify the live platform RLS/ACL/Storage state and record adversarial test evidence after remediation.
11. Establish security headers, privacy/logging/retention, monitoring, incident response, backup/restore proof, and dependency triage.

## Recommended order

1. **Immediate containment:** protect/disable follow-up processing; disconnect raw internal Knowledge from public chat; throttle or temporarily disable public email/cost primitives that cannot be bounded safely.
2. **Workspace identity and tenancy:** implement one server-validated actor/business/capability context; stop ordinary service-role access; eliminate interactive `DEFAULT_BUSINESS_ID` use.
3. **RBAC and cross-layer isolation:** approve role/capability matrix, enforce least privilege, and make Portal/Workspace identity non-overlap an invariant.
4. **Privileged route closure:** tenant-scope leads, cleanup, onboarding, Knowledge, Calendly, invites, and all destructive operations; add CSRF/origin and strict validation.
5. **Provider and money boundaries:** secret manager/rotation, webhook ledgers and tenant mapping, authenticated checkout, persisted entitlements, reconciliation, and audited admin actions.
6. **Durable ingestion and automation:** quarantined/scanned uploads, isolated parsers, queue/lease/outbox/idempotency, retries, dead letters, and monitoring.
7. **Browser and privacy hardening:** CSP and security headers, redirect/recovery/session fixes, data minimization, retention, redacted logging, alerts, incident and recovery procedures.
8. **Operational proof:** human-provisioned synthetic tenants; Portal and Workspace Auth matrix; direct PostgREST/Storage A/B denial; webhook/scheduler/billing/replay tests; live read-only schema/ACL verification.
9. **Dependency and release gate:** triage moderate advisories, rerun dependency/build/test/security suites, record approvals and evidence, then recompute the certification score.

## Final decision

**Estimated platform security score: 30 / 100**

**Production Ready: NO**

The platform cannot be certified while any P0 finding remains open. Closing source findings without live tenant, RLS, Storage, Auth, provider, and operational evidence is not sufficient for a Production Ready decision.
