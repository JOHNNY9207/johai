# JOHAI Product Fact Sheet

## Product

- **Name:** JOHAI
- **Category:** AI employee and executive operating system for service businesses
- **Target customers:** Owner-led service businesses and small teams that manage inbound questions, leads, follow-ups, and appointments
- **Value proposition:** JOHAI combines customer conversations, business knowledge, lead operations, and executive summaries so an owner can see what changed, what matters, and what needs a decision.

## Capability status

### Implemented

- Marketing, product, pricing, authentication, onboarding, and dashboard routes
- Lead capture, CRM persistence, status updates, notes, deletion, and conversation history
- OpenAI chat endpoint with lead and booking flows
- Calendly settings, availability, public link, and signed webhook handling
- Email notifications and follow-up processing
- Knowledge entry, file upload, processing, and search
- Production extraction for PDF, DOCX, XLSX, CSV, TXT, and manual sources, with observable status and safe preview
- Copy-on-write document replacement, human review, active/historical labels, and inspectable version history
- Guarded processing attempts, stable request replay, bounded retries, recoverability evidence, stale-result rejection, and 12 reliability tests
- Business Brain, audit, Morning Brief, Chief of Staff, and Executive Dashboard services
- Stripe Checkout session creation and signed webhook receipt
- Supabase migrations for tenant-aware business ownership and RLS preparation
- Customer Portal repository implementation with dedicated PKCE authentication, tenant/profile selection, dashboard, appointments, messages, documents and acknowledgements, profile/preferences, support, and accessible responsive states
- Customer Portal Contextual Intelligence V1 with typed customer-safe snapshots, exact tenant/profile source filtering, explicit silence and confidence policy, deterministic dashboard/appointment/profile/support guidance, and a deterministic development-demo provider

### Partial

- OpenAI embeddings have a provider implementation, but vector persistence and hybrid ranking remain partial; active search is keyword full-text fallback.
- Document replacement is active, but version allocation and activation are guarded multi-step operations rather than one database transaction and are not backed by single-active/version-number uniqueness constraints.
- Knowledge processing exposes a synchronous queue contract, but durable workers, scheduled recovery, dead-letter handling, crash-atomic chunk replacement, and cross-instance locks remain partial.
- Stripe webhooks verify events, but subscription state is not persisted.
- Team invitations create records but do not provide a complete acceptance and role-management lifecycle.
- Multi-tenant schema exists, while some runtime queries still use the default business context.
- AI recommendations are partly deterministic and do not imply unrestricted autonomous execution.
- The Customer Portal application is implemented against its applied and user-confirmed verified schema, but public invitation redemption, production deployment/configuration, rate limiting, and production end-to-end tenant/storage tests remain incomplete.
- Customer Portal Contextual Intelligence is implemented for bounded deterministic rules and fictional demo interactions. Production generative document/message assistance, customer-visible knowledge publication, operational human takeover, outcome instrumentation, and production customer validation remain incomplete.

### Planned

- Broader cross-platform Contextual Intelligence runtime, approved customer-visible knowledge publication, production generative providers, freshness/provenance enforcement, operational human takeover, and customer-effort instrumentation
- Complete organization membership and role-based access
- Persisted subscriptions, billing portal, invoices, and entitlement enforcement
- Production embeddings and vector retrieval
- Reliable background jobs, retries, monitoring, and scheduled brief delivery
- Additional messaging and workplace integrations
- Customer Portal industry-module registry, business configuration snapshots, server-enforced rollout flags, customer-visible knowledge publication, and customer-facing AI assistance

## Technology and integrations

Next.js 16, React 19, TypeScript, Tailwind CSS 4, Supabase, OpenAI, Calendly, Stripe, and Resend-compatible email delivery.

## Industries

The marketing experience currently presents beauty, dental, home services, legal, real estate, and restaurant examples. Industry templates exist, but production validation by industry remains future work. [Customer Portal Industry Adaptation Architecture](technical/customer-portal-industry-architecture.md) defines a Planned configuration model for one shared Portal; it does not represent implemented industry variants.

## JOHAI Constitution status — adopted governance / no runtime change

The [JOHAI Constitution](constitution/JOHAI_CONSTITUTION.md) is the highest product-design authority for future features, UI decisions, AI behavior, workflows, automations, and interactions. It defines the Ten Laws, product values, design/UX/AI/customer/business/language principles, and a mandatory stop/go decision framework.

The Constitution is adopted architecture and governance. It did not add or modify application code, UI, APIs, authentication, automation, Customer Portal behavior, SQL, migrations, or database state. Capability status remains determined by repository and operational evidence; Constitutional language is not proof of implementation, production readiness, customer outcomes, or commercial traction.

## Contextual Intelligence™ status — bounded Portal implementation / broader runtime planned

[JOHAI Contextual Intelligence™](philosophy/CONTEXTUAL_INTELLIGENCE.md) is the permanent design rule for new customer-facing features: **The AI never asks for information it can already infer from context.** “Infer” is limited to authorized, current, relevant, customer-safe sources; material ambiguity still requires the smallest necessary question.

Customer Portal Contextual Intelligence V1 now implements a bounded typed snapshot and policy over the active customer's already authorized profile, branding, appointments, customer-visible messages, current documents and acknowledgements, and support requests. It filters every record by the active business/profile tuple, stays silent for unavailable access or completed work, caps dashboard insights and reply suggestions at three, explains why assistance appears, and provides deterministic dashboard, appointment, profile, and support guidance.

The development-only demo also implements deterministic fictional document help, suggested replies, and draft rewriting. Authenticated production routes use a fail-closed unavailable provider, so production generative document/message assistance is not exposed. Approved customer-visible knowledge publication, production document-content access, external-model integration, broad interaction registry, verified human takeover, and outcome instrumentation remain **Planned**. The Portal V1 engine is not a unified cross-platform runtime.

## JOHAI Foundation status — Version 1.0 COMPLETE and FROZEN

The [JOHAI North Star](foundation/JOHAI_NORTH_STAR.md), [Manifesto](foundation/JOHAI_MANIFESTO.md), [Mission and Vision](foundation/MISSION_AND_VISION.md), [Product Promise](foundation/PRODUCT_PROMISE.md), [Company Values](foundation/COMPANY_VALUES.md), brand and voice guidance, AI Employee principles, culture, and long-term roadmap are adopted strategic references beneath the Constitution.

They define the intended company and product direction: enterprise-level intelligence made useful to owner-led businesses, less operational work, stronger human relationships, honest and permission-aware AI, and technology that recedes behind the service experience. The roadmap is directional rather than a delivery, funding, market-entry, or production commitment. This documentation work changed no application code, UI, API, authentication, SQL, migration, database state, deployment, or verified capability.

Foundation Version 1.0 is [COMPLETE and FROZEN](foundation/FOUNDATION_STATUS.md). Its [official index](foundation/FOUNDATION_INDEX.md), [change policy](foundation/FOUNDATION_CHANGE_POLICY.md), and [release record](releases/FOUNDATION_V1_RELEASE.md) establish a stable baseline for future development. No Foundation document remains a draft, and no implementation may violate or silently reinterpret the locked corpus.

Foundation completion is governance readiness, not product completion. It does not certify current application conformity, Customer Portal or Business Workspace production readiness, AI Employee availability, Marketplace availability, international expansion, commercial outcomes, or any other runtime capability.

## Pricing model

Starter, Professional, and Enterprise plans are presented with monthly and yearly options. Checkout is implemented; full subscription lifecycle management is partial.

## Differentiators

- A product constitution that makes trust, effort reduction, context, human authority, language, and business value explicit design gates
- Permission-aware contextual assistance designed to reduce questions, clicks, typing, and interruption rather than add another generic chatbot
- Executive framing rather than a conventional CRM homepage
- Business-specific knowledge, lead context, and AI work evidence in one product
- Explicit separation of recorded, derived, estimated, recommended, and missing information
- Architecture for business memory, orchestration, audits, and customer lifecycle

## Major risks

Constitutional drift or selective compliance, tenant resolution, stale or over-broad context, unsafe inference, permission leakage, misleading automation or human-escalation claims, billing persistence, production semantic retrieval, transactional version/chunk concurrency, Customer Portal provisioning and production authorization/storage testing, broader live-integration coverage, background-job reliability, observability, and proof of market traction.

## Business Workspace V1 certification audit — NOT CERTIFIED

The first repository-only Business Workspace certification audit records a provisional evidence score of **30/100**, status **NOT CERTIFIED**, and Production Ready **NO**. No prior Business Workspace certification was found.

Useful foundations exist: Supabase account screens, dashboard command center, lead/CRM APIs, business onboarding, Knowledge Center, Calendly, email/follow-up logic, team invitation, Checkout, Business Brain, deterministic audit and executive services, public grounded chat, and orchestration logging. These capabilities do not establish production readiness.

The P0 blocker is the runtime identity and tenant boundary. `/dashboard/*` uses one shared dashboard-password cookie and ordinary server operations use a service-role client with hard-coded or missing business filters, rather than binding every request to a verified owner/member identity, role, and server-derived tenant. Additional critical gaps include unauthenticated follow-up execution, no explicit public Knowledge publication boundary before unauthenticated chat retrieval, incomplete team and billing lifecycles, unverified AI execution claims, and absent Workspace authorization, accessibility, performance, and operational certification evidence.

The complete audit and remediation sequence are recorded in [Business Workspace V1 Certification Audit](sprints/BUSINESS_WORKSPACE_V1_CERTIFICATION_AUDIT.md). The audit changed no runtime behavior and grants no implementation authorization.

## Knowledge database hardening status — 2026-07-12

Unique version allocation, single-active enforcement, atomic activation, and atomic chunk replacement are represented by an unapplied migration proposal and read-only verification script. They remain Partial until approved, executed, verified, and adopted by application callers.

## Customer Portal status — Implemented repository foundation / production readiness partial

The Customer Portal is a distinct end-customer product layer, not the Business Workspace or JOHAI Super Admin. The user explicitly confirmed that its identity and tenant-isolation migration was manually applied and verified. The repository now implements `/portal`, login, password recovery, active-profile tenant selection, dashboard, appointments, customer-visible messages, current shared documents and acknowledgements, safe profile updates, support requests, and responsive accessible loading/empty/error states.

This is not a public signup product or a production-availability claim. Invitation redemption is absent; customer identities must already be provisioned. Production requires valid Supabase configuration, an explicit `CUSTOMER_PORTAL_DOCUMENT_BUCKETS` allowlist, canonical business/profile storage paths, and end-to-end authentication, direct-REST privilege, cross-tenant denial, revocation-race, and signed-download tests. Approver identity, dates, detailed live-schema/ACL evidence, and raw verification output remain Pending documentation evidence.

### Customer Portal Contextual Intelligence V1 — bounded implementation

The Portal now constructs a typed customer-safe context snapshot from existing RLS-visible domain objects and applies an explicit policy for source kinds, access, confidence, maximum output, and silence. Dashboard insights, appointment preparation, support prompts, and profile guidance are deterministic and available in the shared authenticated/demo components. Context does not grant permission, no record outside the exact active business/profile tuple becomes a source, and expired, suspended, inactive, unavailable, revoked, or completed states produce no unsafe assistance.

Document explain/summarize/key-action/date/question/related-context interactions and message suggestions/rewrite are implemented only through the fixed fictional demo provider. Authenticated production uses an unavailable provider and hides those generative controls. The demo labels generated guidance, names its source, preserves the original record as source of truth, refuses regulated interpretation, never auto-sends, never invents appointment availability, and never claims a person was notified.

This implementation required no database change. Production document content, translation, approved customer-visible knowledge, external AI, operational human takeover, and outcome evidence remain Planned or unavailable. Passing local tests does not make the Portal production-ready.

### Production security gate — database blocker resolved; behavioral evidence Pending

The July 13 pre-hardening live read-only API inspection found unnecessary anonymous privilege on four empty portal tables and authenticated table-wide grants broader than the UI's safe columns and write shapes. All eight portal tables contained zero rows during that inspection, so no real customer, tenant, mixed-role, or download behavior was validated; the result does not establish the current row count. The latest certification review removed the earlier hardening-verification blocker.

The least-privilege and global identity-separation migration is Applied: one Auth identity may not be both a portal customer and any JOHAI business owner/member. The migration is immutable and must not be rerun. Earlier verifier defects in the acknowledgement relation name and ACL inspection were corrected. Production readiness, customer availability, registration/invitation redemption, rate limiting, representative live tenant/storage tests, and production browser QA remain Pending.

### Customer Portal Pilot Demo — development-only

The repository includes `/portal/demo`, a development-only pilot using the fictional Harbor Dental Studio business and fictional customer Sophie Martin. It reuses the shared production Portal components and repository contracts but supplies a deterministic in-memory repository that never contacts Supabase or another network service.

The demo covers complete, empty, load-error, message-retry, download-failure, expired-profile-save, appointments, messaging, documents, profile, support, and deterministic contextual interactions on all six main pages. All 31 Portal tests passed, including the 15 Contextual Intelligence requirements, along with lint and the production build. Browser interaction, console, responsive, keyboard, and screen-reader validation of the new contextual controls remains Pending. The production Portal application is aligned with the reviewed contract in the Applied database hardening migration; live behavioral evidence remains Pending.

Portal date rendering is deterministic across SSR and hydration: the active customer language resolves to an explicit locale with `en-US` fallback, every timestamp has an explicit timezone, and the fictional demo uses one fixed reference instant. Automated tests, lint, build, HTTP/SSR validation, and the final local browser-console check passed without a hydration warning.

This demo is an implemented repository validation and presentation surface only. It is not public, deployed, connected to real customer data, proof of behavioral RLS isolation, evidence of customer usage or traction, or a production-readiness claim. Production provisioning, rate limiting, real authentication and tenant fixtures, direct-REST/RLS tests, storage and signed-download validation, monitoring, and deployment evidence remain incomplete. Approver identity, dates, and raw verifier output remain Pending. No SQL was generated or executed for the Pilot Demo.

### Synthetic authentication identity plan — Planned

A secure two-tenant fixture plan and complete operator package now define eight fictional Auth users, seven profiles, seven invitations, exact creation order, Dashboard screens, explicit scenario ownership, private credential delivery, stage rollback, and complete cleanup. The package is [Setup](testing/SYNTHETIC_ENVIRONMENT_SETUP.md), [Checklist](testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md), [Authentication Procedures](testing/AUTH_TEST_PROCEDURES.md), and [Data Matrix](testing/TEST_DATA_MATRIX.md). No fixture or credential exists because of the package. Separate provisioning approval, all credential-backed scenarios, behavioral tenant/storage/API evidence, cleanup, and final human approval remain required. Customer Portal authentication is not production-ready.

### Customer Portal V1 final certification — FAILED

The last recomputed certification score is **71/100** and **Production Ready is NO**. Lint, the expanded 31/31 Portal tests, the production build, the earlier responsive checks on six shared routes at desktop/tablet/mobile sizes, accessibility semantics, and a corrected WCAG contrast sample passed. The new contextual controls have not yet completed their browser interaction, console, responsive, keyboard, or screen-reader matrix. These results strengthen repository quality but do not replace production behavior.

Certification remains blocked by unprovisioned synthetic identities, unexecuted credential-backed authentication and tenant/direct-REST tests, unverified private Storage and signed-download behavior, incomplete support lifecycle, incomplete keyboard/screen-reader evidence, absent production performance results, and missing rate-limit/monitoring evidence. The hardening-verification blocker is resolved; the Applied migration remains immutable and was not rerun. No SQL was executed.

Customer Portal V1 is now on **Operational Validation Hold**. Development is complete and feature-frozen. Certification may resume only after approved synthetic identities, an isolated operational test environment, and human-led authentication validation exist. No further Customer Portal development is authorized while the hold remains active. See [Customer Portal V1 Operational Validation Hold](sprints/CUSTOMER_PORTAL_OPERATIONAL_VALIDATION_HOLD.md).

### Customer Portal industry adaptation architecture — Planned

The shared Customer Portal core is implemented once for every business: dedicated authentication, active-profile tenant selection, overview, appointments, customer-visible messages, documents, profile/preferences, support, responsive states, and accessibility foundations. Industry adaptation remains an architecture contract, not a shipped feature.

The planned design uses a compiled module registry, validated versioned business configuration, server-enforced rollout flags, and optional typed module adapters. The current free-text branding `industry` value is display metadata only and does not enable a feature or grant access. Customer-facing AI generation, configurable industry modules, dynamic terminology, customer-visible knowledge publication, and automated human-escalation operations are not implemented. The architecture sprint changed documentation only; it did not modify application code, execute SQL, create a migration, or change production readiness.
