# JOHAI Platform Architecture

## Constitutional authority

The [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md) governs product behavior across every platform layer. Layer ownership, authentication, tenant isolation, permissions, APIs, RLS, and deterministic operations remain technical enforcement boundaries; an AI response, UI configuration, automation, or business rule never bypasses them.

Every proposal must identify one owning layer and pass the Constitutional [Decision Framework](../constitution/DECISION_FRAMEWORK.md). Failure to reduce effort, create trust, remove friction, respect context, preserve accessibility/privacy/security, or satisfy the Ten Laws is a stop condition.

## Strategic foundation across platform layers

The [JOHAI North Star](../foundation/JOHAI_NORTH_STAR.md), [Mission and Vision](../foundation/MISSION_AND_VISION.md), [Product Promise](../foundation/PRODUCT_PROMISE.md), [Company Values](../foundation/COMPANY_VALUES.md), and [Brand Guidelines](../foundation/BRAND_GUIDELINES.md) guide purpose, priorities, experience, and identity across all six platform layers beneath the Constitution. The [AI Employee Principles](../foundation/AI_EMPLOYEE_PRINCIPLES.md) guide role-bound AI behavior, and the [Long-Term Roadmap](../foundation/LONG_TERM_ROADMAP.md) provides strategic horizons without changing layer ownership.

Foundation direction cannot create authentication, permission, tenant access, a route, an API, an AI capability, or a production claim. Contextual Intelligence remains a subordinate cross-layer doctrine and must operate through the owning layer's deterministic security and action contracts.

## 1. Public Website

- **Users:** Visitors and prospects
- **Purpose:** Product discovery, public chat, lead capture, and booking entry
- **Allowed:** Published marketing and public business booking information
- **Forbidden:** Workspace, customer, internal AI, billing, and administrative data
- **Routes:** `/`, pricing and public API entry points
- **Authentication:** None for public content
- **Tenant boundary:** Explicit public business configuration only
- **Status:** Implemented; continued localization and hardening planned

## 2. Business Workspace

- **Users:** Business owners and authorized members
- **Purpose:** CRM, dashboard, Knowledge Center, operations, and settings
- **Allowed:** Data belonging to businesses the user owns or belongs to
- **Forbidden:** Other tenants and JOHAI administration
- **Routes:** `/dashboard/*`, `/auth/*`
- **Authentication target:** Supabase Auth plus verified business ownership/membership; browser auth uses the shared `johai-auth-session` client
- **Authentication as implemented:** `/auth/*` and `/start/*` use Supabase Auth, while `/dashboard/*` uses one environment-wide dashboard-password cookie that does not identify an owner, member, role, or tenant
- **Tenant target:** `user_owns_business(business_id)`, least-privilege database access, and server-derived request scope
- **Tenant boundary as implemented:** Interactive server operations use a service-role client and hard-coded or missing business filters, so RLS is bypassed and the static ownership model is not the ordinary dashboard authorization boundary
- **Status:** NOT CERTIFIED; provisional audit score **30/100**; Production Ready **NO**

The authoritative current-state record is [Business Workspace V1 Certification Audit](../sprints/BUSINESS_WORKSPACE_V1_CERTIFICATION_AUDIT.md). The first certification blocker is actor-, role-, and tenant-bound authorization for every Workspace request. This audit finding does not claim that a live cross-tenant disclosure occurred and does not authorize implementation or a database change.

## 3. Customer Portal

- **Users:** A JOHAI business's own authenticated customers
- **Purpose:** Appointments, messages, shared documents, requests, profile, and support
- **Allowed:** The authenticated customer's explicitly scoped records for one business
- **Forbidden:** Business dashboard, CRM-wide data, internal notes/scores, Knowledge Center, AI reasoning, audits, billing, and administration
- **Routes:** `/portal`, `/portal/login`, `/portal/reset-password`, `/portal/appointments`, `/portal/messages`, `/portal/documents`, `/portal/profile`, `/portal/support`, and the authorized document-download API
- **Authentication:** Supabase Auth linked server-side to a customer profile and business; browser auth uses a distinct shared PKCE client under `johai-customer-portal-session`
- **Tenant boundary:** `auth.uid()` + customer profile + `business_id`; no browser-trusted tenant
- **Status:** Database foundation Applied and Verified by explicit user confirmation; repository application implemented, with production provisioning, configuration, deployment, and end-to-end tenant/storage validation still Pending

## 4. AI Layer

- **Users:** Server-side product workflows
- **Purpose:** Grounded responses, orchestration, summaries, and recommendations
- **Allowed:** Tenant-scoped inputs necessary for an authorized workflow
- **Forbidden:** Cross-tenant retrieval, secret disclosure, hidden reasoning exposure
- **Routes:** Server APIs and internal libraries
- **Authentication:** Server-controlled credentials and authorized request context
- **Tenant boundary:** Explicit business scope before retrieval or mutation
- **Status:** Partial production foundation

## 5. JOHAI Super Admin

- **Users:** Authorized JOHAI administrators only
- **Purpose:** Platform operations and support
- **Allowed:** Future least-privilege administrative capabilities
- **Forbidden:** General business/customer access without audited authorization
- **Routes:** Reserved; not part of Customer Portal V1
- **Authentication:** Planned elevated administration model
- **Tenant boundary:** Audited, least-privilege cross-tenant controls
- **Status:** Planned

## 6. Developer Platform

- **Users:** JOHAI engineers and future integration developers
- **Purpose:** APIs, webhooks, integrations, migrations, and operational tooling
- **Allowed:** Contract-scoped integration data
- **Forbidden:** Unscoped secrets or tenant data
- **Routes:** `/api/*`, webhook endpoints, future developer surfaces
- **Authentication:** Signatures, server credentials, and scoped tokens by integration
- **Tenant boundary:** Verified integration identity mapped to a business
- **Status:** Partial; formal developer portal planned

Every feature must be assigned to one of these layers before implementation.

## Cross-layer Contextual Intelligence™ rule

Every new customer-facing feature in any platform layer must follow [JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md): **The AI never asks for information it can already infer from context.** The owning layer resolves identity, tenant, permissions, customer-visible sources, business rules, and action authority before the AI Layer receives a minimized context envelope.

The AI Layer may interpret, summarize, translate, or suggest only the capabilities authorized by the owning workflow. It does not own customer identity, expand RLS, retrieve another layer's private data, or execute an operation because a model requested it. Uncertain identity, tenant, permission, freshness, or authority fails closed; low-value or completed workflows remain silent.

This is an adopted architecture rule. The shared context resolver, smart document/messaging/appointment/support patterns, proactive assistance, human-takeover operations, and outcome instrumentation remain **Planned** until individually implemented and validated.

## Browser authentication lifecycle boundary

Business Workspace and Customer Portal use one shared browser client per persisted storage key, not one client per component or provider mount. A browser-global keyed registry preserves each client through route remounts and development Fast Refresh. The two keys, client objects, flows, and sessions remain separate, while server-only Supabase clients stay per request with persistence and automatic refresh disabled.

## Customer Portal industry adaptation architecture

[Customer Portal Industry Adaptation Architecture](customer-portal-industry-architecture.md) defines the Planned path for adapting one shared Customer Portal across restaurant, dental, beauty, real-estate, legal, home-services, and general-service businesses. The existing authentication boundary, tenant/profile resolution, shell, overview, appointments, messages, documents, profile, support, accessibility, and responsive states remain the implemented shared core.

The versioned module registry, business-scoped configuration snapshot, server-enforced rollout flags, optional industry modules, customer-visible knowledge publication boundary, and customer-facing AI assistant are **Planned and not implemented**. Industry configuration may narrow labels, modules, and customer actions, but it never grants tenant access, changes RLS or database privileges, exposes Business Brain or Knowledge Center internals, or creates separate industry portals. Any future persisted configuration is a database change and must complete the mandatory migration and verification workflow before implementation continues.

## Customer Portal V1 certification status

Final certification did not change platform ownership or architecture. The implementation remains in the Customer Portal layer; CRM internals, Business Brain, Knowledge Center, AI orchestration, internal notes, billing, the Executive Dashboard, Super Admin, and AI Employees remain outside its customer-facing boundary.

The latest certification re-audit records an overall score of **71/100**, certification **FAILED**, and Production Ready **NO**. The earlier hardening-verification blocker is resolved; representative identities, credential-backed authentication, behavioral tenant/direct-REST and Storage evidence, production performance, complete assistive-technology evidence, rate limits, monitoring, and the support lifecycle remain gates. No SQL or migration was modified or executed by the documentation architecture sprint.
