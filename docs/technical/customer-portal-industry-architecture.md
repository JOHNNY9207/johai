# Customer Portal Industry Adaptation Architecture

## Status and scope

- Platform layer: **Customer Portal**
- Constitutional authority: subordinate to the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md)
- Architecture status: **Planned**
- Shared Portal foundation: **Implemented in repository code**
- Industry module registry and business configuration engine: **Not implemented**
- Bounded Customer Portal Contextual Intelligence V1: **Implemented**
- Production customer-facing generative provider: **Unavailable**
- Database change in this architecture sprint: **None**
- Application change in this architecture sprint: **None**

This document defines how one Customer Portal can serve many industries without separate portals, duplicated navigation, scattered `industry` checks, or access to internal JOHAI systems. Its modules, terminology, actions, and AI behavior must pass the Constitution and Decision Framework. It is an implementation contract, not evidence that the planned modules or AI capabilities exist.

## Architecture decision

JOHAI will maintain one Customer Portal shell, one authentication boundary, one tenant-resolution flow, one shared component system, and one set of security rules. Industry adaptation will be produced by the intersection of:

1. a versioned platform module registry;
2. a validated business-scoped configuration snapshot;
3. server-enforced rollout and entitlement flags;
4. the authenticated customer's RLS-visible profile and operation permissions; and
5. an optional, separately authorized module data adapter.

An industry key supplies reviewed defaults only. It never grants access, selects a tenant, enables a route by itself, or triggers hard-coded component branches. A restaurant, clinic, salon, agency, law firm, and home-services company remain configurations of one Portal, not six products.

## Current implementation snapshot

The current shared foundation provides:

- dedicated Customer Portal authentication and recovery;
- active-profile tenant selection;
- overview, appointments, messages, documents, profile, and support routes;
- customer-visible message, appointment, document, acknowledgement, and request contracts;
- safe profile and notification-preference editing;
- business display name, primary color, booking URL, support email, and phone presentation;
- responsive loading, empty, denied, retry, and error states;
- exact business/profile scoping through the repository and database boundary;
- a typed customer-safe context snapshot and policy, deterministic dashboard/appointment/profile/support guidance, and shared source/reason/trust UI; and
- deterministic fictional document and messaging assistance in the development-only demo.

Current limitations relevant to this architecture:

- Portal navigation and most terminology are fixed in code.
- `customer_portal_branding.industry` is loaded but does not enable modules or permissions.
- Logo, secondary color, address, business hours, and some branding fields are not consistently rendered.
- Notification preferences are stored, but notification delivery or a notification center is not implemented.
- AI-labeled persisted messages can be displayed as **AI-assisted response**. The demo also has a deterministic fictional provider, while authenticated production has no customer-facing generative provider or orchestration endpoint.
- The shared support component still contains dental-oriented wording. That copy must become neutral or configuration-driven before claiming cross-industry adaptation; it was not changed in this documentation sprint.
- The Harbor Dental demo is development-only fictional content, not an implemented Dental template.

## Shared Portal core

Every business receives the same security and experience foundation. Core modules cannot be replaced by industry code.

| Core capability | Stable responsibility | Current status | Adaptation boundary |
| --- | --- | --- | --- |
| Authentication | Login, recovery, session refresh, logout, protected access | Implemented | Never renamed into a different security flow |
| Overview | Summarize allowed records and primary actions | Implemented | Cards and labels may be ordered/configured; data authority does not change |
| Profile | Approved customer contact/preferences fields | Implemented | Field labels/help may localize; writable columns stay platform-controlled |
| Messages | Customer-visible conversation and human-request intent | Implemented | Terminology may vary; sender and visibility rules stay fixed |
| Documents | Current shared files, download, acknowledgement, revocation state | Implemented | Document labels/types may be grouped; storage metadata stays server-only |
| Appointments | Scheduled/customer-visible service records and safe external actions | Implemented | Industry modules may supplement but must not overload the core contract dishonestly |
| Support | Open customer request and visible status | Implemented | Categories/channels may vary; assignment/internal lifecycle stays private |
| Notifications | Customer preferences for appointments, messages, and documents | Partial | Delivery, inbox, channel verification, and notification history are Planned |
| Branding | Safe customer-facing business identity | Partial | Configuration may render more approved fields; private business settings are forbidden |
| Contextual guidance | Exact-tuple snapshot, silence/confidence policy, and deterministic overview/appointment/profile/support help | Partial | Production generative document/message help and industry-specific knowledge remain unavailable |

Core authentication, profile selection, tenant isolation, error handling, accessibility, and responsive behavior apply to every module.

## Industry module model

### Module categories

1. **Core modules** are always registered and include overview, profile, messages, documents, appointments, support, notifications preferences, and branding.
2. **Industry modules** are optional, platform-authored packages such as reservations, forms, loyalty, saved properties, case requests, estimates, or job status.
3. **Integration adapters** connect an enabled module to a reviewed external provider. They are server-side and never expose provider credentials.
4. **Industry templates** are versioned configuration presets. They reference modules; they do not contain executable code.

### Planned typed module contract

The future implementation should express every module through a typed, versioned manifest equivalent to:

```ts
type PortalModuleManifest = Readonly<{
  id: PortalModuleId;
  contractVersion: number;
  kind: "core" | "industry";
  routeSegment: string;
  navigation: Readonly<{ labelKey: PortalTermKey; order: number }>;
  dependencies: readonly PortalModuleId[];
  requiredDataCapabilities: readonly PortalDataCapability[];
  allowedCustomerActions: readonly PortalActionId[];
  allowedAiCapabilities: readonly PortalAiCapabilityId[];
  configurationSchemaVersion: number;
  rolloutKey: PortalFeatureFlagId;
}>;
```

The registry is compiled and reviewed with the application. Business configuration can select only known IDs and values; it cannot provide React components, import paths, SQL, prompts, HTML, scripts, arbitrary API endpoints, or privilege rules.

### Registry rules

- Module IDs, route segments, action IDs, and configuration schema versions are immutable once released.
- A module is available only when its manifest, route, server adapter, RLS/data contract, tests, monitoring, rate limits, and support operation are all ready.
- Dependencies are evaluated before enablement. A dependent module fails closed if any dependency is unavailable.
- Unknown, duplicate, stale, or cyclic entries are rejected.
- Removing a module from navigation never relaxes API or RLS enforcement.
- Business Brain templates, billing flags, Knowledge Center internals, and demo controls are not Portal modules or entitlements.

## Business configuration model

### Planned configuration snapshot

One immutable, versioned snapshot is resolved per business after the active customer profile is authorized. It contains:

| Area | Required shape | Rules |
| --- | --- | --- |
| Identity | `businessId`, `configurationVersion`, `schemaVersion` | Server-derived; never accepted from browser authority |
| Industry | Canonical key plus optional display label | Selects defaults only; never authorizes anything |
| Enabled modules | Known module IDs with rollout state | Default off for optional modules |
| Terminology | Bounded localized text for registered term keys | Plain text only; cannot change security meaning |
| Service types | Stable IDs, labels, descriptions, duration metadata | Module-scoped and inactive rather than deleted when retired |
| Customer actions | Registered action IDs and approved targets | No arbitrary code or unreviewed server endpoint |
| Support channels | Portal request, verified email/phone, approved external link, emergency notice | Truthful availability; no implied SLA |
| Brand settings | Approved display name, logo, colors, contacts, address, hours, booking link | Customer-visible projection only |
| Permissions | Module/action allowlists | Can narrow platform capability, never expand RLS or grants |
| AI assistant | Enabled state, name, allowed capabilities/modules, source policy, escalation rules | Disabled unless every AI gate is satisfied |

### Effective module decision

An optional module is usable only when all terms are true:

`registered ∩ globally released ∩ tenant configured ∩ entitled ∩ dependency ready ∩ customer operation allowed ∩ server data contract ready`

The client may use the result to render navigation, but the server and database independently enforce access. A hidden module is not a security control.

### Industry and terminology

- Canonical industry keys are reviewed values such as `restaurant`, `dental`, `beauty`, `real_estate`, `legal`, `home_services`, and `general_services`.
- The existing free-text branding `industry` field remains display metadata. It must not be used directly as a registry key, feature flag, entitlement, or authorization input.
- Terminology keys are stable and semantic. A template can label a scheduled record **Visit** or **Viewing**, but it cannot relabel an acknowledgement as a signature or a support request as an emergency dispatch.
- Missing translations fall back to reviewed neutral Portal text, then the stable English core label.

### Customer actions

Actions are registered capabilities, not arbitrary URLs. Planned action families are:

- navigate to a registered Portal route;
- create a customer message or support request;
- acknowledge or download an authorized document;
- invoke a reviewed module operation;
- open a validated HTTPS provider link from server-controlled data; and
- request human assistance.

Each action validates tenant, profile, module, permission, current state, destination, and rate limit on the server. Configuration cannot create an action that the module manifest does not declare.

### Feature flags

Feature flags control rollout, not authorization. Planned states are `off`, `internal`, `pilot`, and `on`.

- Optional flags default to `off`.
- Direct/bookmarked routes and APIs enforce the same effective flag as navigation.
- Unknown, unavailable, stale, or malformed flag state fails closed.
- SSR and hydration receive one serialized configuration/version snapshot.
- A flag cannot enable a module whose RLS, grants, validation, monitoring, rate limiting, accessibility, or support operations are incomplete.
- Rollback restores the previous configuration version and disables the flag; it never alters an applied migration.

## Route strategy

Existing core routes remain stable:

- `/portal`
- `/portal/appointments`
- `/portal/messages`
- `/portal/documents`
- `/portal/profile`
- `/portal/support`

Planned optional modules use a reserved namespace:

- `/portal/modules/[moduleId]`
- `/portal/modules/[moduleId]/[recordId]` only when the manifest explicitly provides a detail contract

The page resolver accepts only allowlisted registry IDs. Database configuration never determines a file path or dynamic import. Unknown, disabled, unauthorized, or unavailable modules return a neutral not-found/unavailable result without revealing whether another tenant has the module.

The development demo should consume the same registry and configuration contracts with in-memory adapters. Demo-only controls remain outside authenticated production routes.

## Component and repository strategy

### Shared shell

One shell renders business branding, profile selection, effective navigation, status messages, accessibility landmarks, responsive controls, and sign-out. Navigation is generated from the ordered effective module manifests, not duplicated by industry.

### Shared primitives

Modules compose reviewed primitives for:

- page headers and summaries;
- list/detail cards;
- status pills and timelines;
- bounded forms and validation messages;
- customer actions and human escalation;
- loading, empty, unavailable, denied, and retry states; and
- audit-safe AI/human sender labels.

### Module components

Each optional module owns one focused UI package, one typed repository contract, one validator, and one manifest registration. It must not fork the Portal shell or copy core pages. Industry templates configure a registered module; they do not create industry-specific React trees.

### Data adapters

Core repository methods remain stable. Optional modules use separate typed repositories so unsupported fields are not forced into appointments, messages, documents, or support requests. Every method receives the server-resolved tenant context and returns only customer-safe domain objects.

## Validation and fallback behavior

### Configuration validation

Validate at publication and again when loading:

- supported schema/configuration/template versions;
- canonical industry and registered module/action/capability IDs;
- dependency and rollout rules;
- bounded plain-text labels with no HTML, scripts, prompts, secrets, or internal identifiers;
- supported locales and valid IANA timezones;
- accessible hex colors and safe logo assets;
- validated HTTPS links and approved provider domains;
- bounded JSON/object sizes and no unknown keys;
- permission and AI capability subsets; and
- absence of CRM, Business Brain, Knowledge Center, billing, orchestration, or private-note references.

### Fallback hierarchy

1. Authentication, profile, tenant, or authorization uncertainty: deny Portal access.
2. Missing or invalid optional configuration: load the neutral shared core with optional modules off.
3. Unknown industry: use `general_services` defaults; never guess modules.
4. One unavailable module: isolate its error and keep unrelated authorized core modules available.
5. Missing terminology/localization: use neutral reviewed core wording.
6. Missing support contact: state that direct follow-up is unavailable; do not imply monitoring.
7. AI retrieval/model/validation failure: show a neutral unavailable state and offer an approved human channel.

No fallback may load another tenant's configuration, enable a module, invent a business promise, or bypass RLS.

## Tenant isolation and permissions

- Resolve configuration only after the authenticated user has an active RLS-visible customer profile.
- Derive `business_id` and `customer_profile_id` from trusted profile state; browser routes, labels, local storage, and configuration payloads are never authority.
- Key caches by authenticated user, business, profile, environment, and configuration version. Clear/rebuild them on profile switch, logout, suspension, version change, or authorization failure.
- Every module record repeats the exact business/profile tuple and requires the same composite tenant guarantees as the current Portal foundation.
- Configuration can narrow display and operations, but cannot alter RLS, grants, ownership, row visibility, storage paths, or server validation.
- Multi-profile switching reloads branding, configuration, flags, repositories, and AI context together. No labels, data, actions, or cached results cross the switch.
- Private document access remains server-mediated, allowlisted, exact-tuple checked, revocation-aware, and short-lived.
- A future persisted configuration model is a database change. It requires live-schema inspection, a versioned migration, read-only verification, human approval, manual execution, and recorded verification before implementation continues.

## AI assistant model

### Current truth

The Portal displays trusted persisted messages with sender type `ai` as **AI-assisted response**. Customer Portal Contextual Intelligence V1 also implements a typed customer-safe snapshot, explicit source and silence policy, deterministic dashboard/appointment/profile/support guidance, and a provider contract.

The development-only Harbor Dental demo uses a deterministic fictional provider for document help, suggested replies, and draft rewriting. Authenticated production uses a fail-closed unavailable provider, so those generative controls remain off. V1 does not add an external model, autonomous agent, industry assistant, or production generation endpoint.

### Customer-visible context boundary

The V1 deterministic engine builds a typed snapshot only after the active profile/business tuple has been resolved. It accepts only:

- the active customer profile and exact business;
- published business branding;
- customer-visible Portal appointments, messages, current documents, acknowledgements, and requests already authorized for that tuple; and
- one explicit reference time and access state.

Snapshot construction discards foreign business/profile records and produces no contextual output for expired, inactive, suspended, or unavailable access. Revoked documents do not become sources. Context still does not grant permission.

A future production generative request must rebuild the context server-side from authenticated, RLS-authorized records, the effective enabled operation, and separately published customer-visible knowledge. It must not trust a browser snapshot as authorization.

The assistant must never query or expose raw CRM conversations, leads, Business Brain, Knowledge Center source files or extracted text, internal notes, scores, billing, staff-only records, prompts, tool traces, credentials, or AI orchestration state.

Approved business knowledge requires a future publication boundary: a human reviews and publishes a bounded customer-visible projection. The assistant consumes that projection, not the Knowledge Center itself. Until the publication, retrieval, citation, and revocation path is implemented and verified, knowledge-grounded Portal AI remains disabled.

### Capability status and allowlist

V1 implements deterministic dashboard insights, preparation guidance, profile guidance, support prompts, and demo-only document/message assistance. The demo provider can explain or summarize its fixed fictional preparation guide, identify key actions and dates, propose questions, show reviewed relations, and prepare unsent reply/rewrite examples. It refuses regulated interpretation and does not invent appointment availability.

Possible future production capabilities, enabled individually, include:

- answer an approved customer FAQ;
- explain a customer-visible document without changing it;
- summarize the current customer's visible Portal thread;
- draft a support request for customer confirmation;
- explain preparation instructions already shared with the customer; and
- suggest provider options only when an authorized integration supplies current customer-visible availability.

Configuration text is untrusted input, not tool authority. AI cannot mutate appointments, documents, profile status, request status, tenancy, billing, credentials, permissions, or provider records. A future write action requires explicit customer confirmation and a separately authorized deterministic module operation.

### Human escalation

Escalate when:

- the answer is not supported by approved customer-visible sources;
- confidence, freshness, or identity/tenant context is insufficient;
- the request requires business approval or a system mutation outside the capability allowlist;
- medical, legal, financial, safety, emergency, privacy, or compliance judgment is involved; or
- the customer asks for a person.

Escalation records intent only until staff notification, assignment, retries, monitoring, business-hours handling, and response targets are implemented. The Portal must not promise that a human was notified or will reply within a time unless those operations are verified.

AI and human messages remain visibly distinct. Only a trusted server can persist an AI response with the exact tenant/profile tuple, `sender_type = ai`, and customer-visible state after source and output validation. The customer browser remains limited to customer-authored messages.

## Six industry configuration examples

All examples retain the shared core and are **Planned templates**, not implemented variants. Modules marked “planned” require their own reviewed contract and implementation.

### Restaurant

- Industry key: `restaurant`
- Terminology: guest, reservation, event request, menu/event file, guest help
- Planned modules: reservations, orders, event requests
- Service types supported by current appointments: table-reservation consultation, private dining, catering consultation, event-planning call
- Customer actions: schedule/reschedule/cancel through approved provider links; message; human request; download menu, event quote, instructions, form, contract, or receipt
- Support: Portal request plus verified restaurant email/phone; SMS, WhatsApp, waitlist, and realtime chat remain Planned
- Brand example: terracotta `#b45309`, restaurant name, booking link, support contacts
- Permissions: own reservations/events/files only; no table map, kitchen notes, margins, payment, or other guest data
- AI allowlist: approved menu, hours, reservation, and event FAQ; allergen uncertainty always escalates
- Disabled/fallback: no order placement, delivery status, payments, gift cards, or loyalty until corresponding modules exist

### Dental

- Industry key: `dental`
- Terminology: patient, visit, care document, patient support
- Planned modules: forms and preparation instructions
- Service types supported by current appointments: cleaning, new-patient examination, consultation, orthodontic review, follow-up
- Customer actions: schedule/reschedule/cancel; read preparation notes; message; download/acknowledge instructions, reports, forms, and receipts
- Support: Portal request plus verified clinic email/phone; after-hours and emergency routing remain Planned
- Brand example: teal `#0f766e`, clinic name, booking link, support contacts
- Permissions: own customer-visible visits/files only; no chart, diagnosis, imaging, prescriptions, insurance internals, or staff notes
- AI allowlist: approved office hours, preparation, and administrative FAQ; no diagnosis, treatment, medication, or emergency decision
- Disabled/fallback: clinical or emergency uncertainty escalates to the approved human/emergency channel

### Beauty

- Industry key: `beauty`
- Terminology: client, booking, service guide, salon support
- Planned modules: service catalog and loyalty
- Service types supported by current appointments: consultation, styling, facial consultation, manicure, extensions maintenance, aftercare follow-up
- Customer actions: schedule/reschedule/cancel; message; download/acknowledge preparation, aftercare, quote, policy form, or receipt
- Support: Portal request plus verified salon email/phone; reminder delivery and messaging integrations remain Planned
- Brand example: deep rose `#be185d`, salon name, booking link, support contacts
- Permissions: own bookings/files only; no staff schedule, formulation notes, commissions, internal photos, or other client data
- AI allowlist: approved service duration, preparation, aftercare, and policy FAQ; no diagnosis or contraindication decision
- Disabled/fallback: no deposits, ecommerce, memberships, package balance, or loyalty points until implemented

### Real Estate

- Industry key: `real_estate`
- Terminology: client, viewing, listing/transaction file, agent support
- Planned modules: property viewings, saved properties, property documents
- Service types supported by current appointments: buyer/seller consultation, property viewing, valuation meeting, open-house follow-up
- Customer actions: schedule/reschedule/cancel; message; download/acknowledge brochures, viewing instructions, disclosures, reports, forms, or contracts
- Support: Portal request plus verified agent/office email/phone; live-agent routing remains Planned
- Brand example: blue `#1d4ed8`, agency name, booking link, support contacts
- Permissions: explicitly shared customer-linked records only; no competing offers, seller notes, commissions, CRM, or other client data
- AI allowlist: approved listing facts, viewing preparation, and document checklist; no steering, price/offer, legal, or mortgage decision
- Disabled/fallback: no MLS feed, offer submission, e-signature, escrow, or mortgage tools until implemented

### Legal

- Industry key: `legal`
- Terminology: client, consultation, secure message, case document, case request
- Planned modules: case requests and secure case-document workflow
- Service types supported by current appointments: intake consultation, case review, contract-review meeting, status conference, document collection
- Customer actions: schedule/reschedule/cancel; message; request counsel; download/acknowledge checklists, forms, contracts, reports, or receipts
- Support: Portal request plus verified firm email/phone; urgent deadline/on-call routing remains Planned
- Brand example: slate `#334155`, firm name, booking link, support contacts
- Permissions: explicitly shared client records only; no work product, attorney notes, conflict data, court credentials, trust accounting, or billing admin
- AI allowlist: administrative intake, approved FAQ, consultation preparation, and document checklist; no legal advice, deadline calculation, conflict clearance, prediction, negotiation, or filing
- Disabled/fallback: substantive or urgent requests require a lawyer; no retainer signature, filing, docketing, trust accounting, or payment workflow

### Home Services

- Industry key: `home_services`
- Terminology: customer, visit, estimate/service record, service support
- Planned modules: estimates, scheduled visits, and job status
- Service types supported by current appointments: inspection, repair visit, installation consultation, maintenance, emergency-service intake
- Customer actions: schedule/reschedule/cancel; read preparation notes; message; download/acknowledge quote, instructions, inspection report, form, or receipt
- Support: Portal request plus verified dispatch email/phone; SMS, live dispatch, and technician updates remain Planned
- Brand example: green `#047857`, company name, booking link, support contacts
- Permissions: own property-linked visits/files only; no technician routes, dispatcher queue, margin, internal diagnosis, inventory, or other property data
- AI allowlist: approved service FAQ, intake questions, visit preparation, and maintenance reminders; no remote diagnosis, unsafe repair instruction, guaranteed estimate, or dispatch promise
- Disabled/fallback: safety emergencies use an approved emergency/human channel; no live tracking, work authorization, payment, inventory, or warranty adjudication until implemented

## Implementation phases

### Phase 0 — architecture and inventory

Status: completed by documentation only. Record current hard-coded navigation/copy, current branding use, repository contracts, route collisions, security boundaries, and truthful capability labels.

### Phase 1 — neutral shared core and typed registry

- Remove industry-specific copy from shared authenticated components.
- Introduce typed registry/contracts with core modules only.
- Generate existing navigation from the registry without changing user-visible capability.
- Add configuration/registry validation, SSR snapshot, failure, accessibility, and tenant-switch tests.

No optional industry module becomes available in this phase.

### Phase 2 — configuration publication and administration

- Define preview, diff, approval, versioning, activation, rollback, and audit ownership.
- Render approved terminology and the existing safe branding projection.
- Add server-enforced feature-flag evaluation and neutral fallback.
- If persistence requires new schema, stop for live inspection and the mandatory migration/verification/human-approval workflow.

### Phase 3 — one module at a time

- Select one bounded pilot module.
- Define its typed data/repository/action contract, security model, UI, tests, rate limits, monitoring, support operations, and rollback.
- Resolve only that module's certification blocker before starting another.

### Phase 4 — customer-visible knowledge and AI pilot

- **Completed precursor:** bounded typed snapshot, source/silence/confidence policy, deterministic shared guidance, fail-closed production provider, and deterministic fictional demo interactions.
- Build the reviewed publication boundary and revocation path.
- Implement server-derived AI context, capability allowlist, source citations, output validation, visible AI labels, human escalation, abuse controls, and audit evidence.
- Pilot one low-risk informational capability. Keep regulated advice and autonomous mutations disabled.

### Phase 5 — six reviewed templates

- Publish versioned Restaurant, Dental, Beauty, Real Estate, Legal, and Home Services presets.
- Validate each with distinct tenants, multi-profile switching, direct routes/APIs, wrong-tenant denial, responsive/accessibility/localization, and rollback.
- Industry compliance claims require separate legal/security review.

### Phase 6 — production certification

Complete existing authentication, behavioral tenant/RLS, private Storage, accessibility, performance, rate-limit, monitoring, support-lifecycle, and incident-response gates. Industry adaptation does not bypass Customer Portal V1 certification.

## Upgrade and rollback path

- Pin every tenant to an immutable configuration-pack version.
- Preview and diff the next version before business approval.
- Validate schema compatibility, module dependencies, security, accessibility, localization, and support readiness.
- Roll out through `internal` → `pilot` → `on` with monitoring and explicit promotion.
- Preserve the last known valid version for immediate configuration rollback.
- Disable affected optional flags on failure; the neutral core remains available when authorization is sound.
- Never edit or rerun an applied migration. Any database recovery or new persistence requirement follows the mandatory database workflow.

## Risks and open decisions

- Current shared copy contains dental wording and would misrepresent other industries.
- Existing industry text is not a safe configuration or authorization key.
- A generic configuration blob can become an untyped security bypass without versioned validation and strict allowlists.
- Navigation hiding can be mistaken for authorization unless routes/APIs independently enforce flags and RLS.
- Multi-profile caches can leak labels or flags if not keyed and rebuilt by user/business/profile/version.
- Overloading appointments or documents for unrelated industry semantics creates misleading status and permission behavior.
- Customer-visible knowledge publication and revocation do not yet exist.
- AI capability claims can become false or unsafe in medical, legal, financial, housing, allergy, and home-safety contexts.
- Human escalation currently records intent but does not prove notification, assignment, realtime response, or SLA.
- Module rollout requires operational ownership, monitoring, rate limits, cleanup, rollback, and support training.
- Industry adaptation is Planned and does not increase the current certification score or make the Portal production-ready.

## Explicitly excluded

- separate industry portal repositories or route trees;
- arbitrary tenant-supplied components, scripts, prompts, endpoints, or SQL;
- `if (industry === ...)` branches distributed through shared components;
- duplicated navigation or copied core pages;
- customer access to CRM internals, Business Brain, Knowledge Center, AI orchestration, internal notes, billing, Executive Dashboard, Super Admin, or other tenants;
- claims that AI, notification delivery, reservations, orders, loyalty, saved properties, case management, estimates, or job tracking exist before implementation and validation; and
- database changes outside the mandatory inspected, versioned, approved, manually applied, and verified workflow.
