# Multi-tenancy

Business IDs and RLS preparation exist in migrations. Several runtime paths use `DEFAULT_BUSINESS_ID`; complete request-scoped tenant resolution and policy testing remain partial.

## Business Workspace certification finding — 2026-07-15

Static migration history defines ownership, membership, `user_owns_business(...)`, and business-table RLS. The current interactive Workspace does not rely on that boundary: dashboard and API server calls use `SUPABASE_SERVICE_ROLE_KEY`, which bypasses RLS, and many operations use `DEFAULT_BUSINESS_ID`. The dashboard also reads all leads and businesses without a business filter before combining those records with default-business data; lead update and deletion are record-ID scoped rather than business scoped.

This is a P0 supported risk for cross-tenant access or mutation when multiple tenants contain data; the audit did not inspect live data and does not claim that a breach occurred. Business Workspace certification remains **NOT CERTIFIED**, provisional score **30/100**, Production Ready **NO**. Remediation must bind every request to a verified actor, owner/member role, and server-derived business before least-privilege access. Any database correction requires the mandatory inspected and approved migration/verification workflow.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Customer tenant isolation — applied and implemented

Every customer-visible relation carries `business_id` and `customer_profile_id`, with composite foreign keys preventing supported cross-business ownership. RLS resolves profiles from `auth.uid()` and requires active status. The user explicitly confirmed that the migration was applied and verified; detailed live ACL, helper-owner, and raw verification evidence remains Pending documentation.

The application first lists only RLS-visible active profiles, requires explicit selection for a multi-business customer, and repeats both identifiers on every safe-column query. A remembered browser selection is never sufficient by itself. Messages additionally require customer visibility, documents require `revoked_at is null`, and inserts are constrained to customer messages, acknowledgements, safe profile fields, and open support requests.

Private storage access is mediated by `GET /api/portal/documents/[id]/download`. The route revalidates the bearer user, retrieves the non-revoked document through caller RLS, checks `CUSTOMER_PORTAL_DOCUMENT_BUCKETS`, requires a normalized `business_id/customer_profile_id/` prefix, and returns a 60-second signed URL. Production still needs behavioral cross-tenant, direct-REST privilege, storage, and document-revocation-race tests.

## Industry configuration and tenant isolation

The [Customer Portal Industry Adaptation Architecture](customer-portal-industry-architecture.md) defines one shared Portal with planned business-scoped configuration, not separate industry applications. The current implementation can vary customer-visible business identity, a primary accent color, booking and support contacts, appointment service names, safe notes, messages, and shared document content. Navigation, terminology, module enablement, custom support categories, and customer-facing AI generation are not currently configuration-driven.

A future configuration snapshot may be resolved only after the authenticated user has an active RLS-visible customer profile. The server-derived `business_id` and `customer_profile_id` remain authority; an industry key, route, label, feature flag, entitlement, browser selection, or configuration payload can never grant tenant access. Configuration permissions may narrow a registered platform capability but cannot expand RLS, grants, writable columns, storage paths, or server-side validation.

Restaurants, dental practices, beauty businesses, real-estate agencies, legal firms, and home-services companies therefore share the same authorization rules. Their planned terminology and optional modules may differ, but every customer operation still binds the exact profile/business tuple. A multi-profile switch must reload branding, configuration, module flags, repositories, and any future AI context together, with caches keyed by authenticated user, business, profile, environment, and configuration version.

Unknown industry or invalid optional configuration fails closed to the neutral shared core with optional modules off. A disabled or hidden module remains protected at its route, API, repository, and database boundaries; hiding navigation is never a security control. Missing configuration must never load another tenant's labels, actions, support contacts, data, or AI context.

The Portal can display a trusted persisted `ai` message, but it has no customer-facing AI generation endpoint. Future industry AI must use only separately published customer-visible sources for the active tuple and must never retrieve CRM internals, Business Brain, Knowledge Center source material, internal notes, billing, prompts, credentials, or orchestration state. Until that publication and enforcement path is implemented and verified, industry AI capabilities remain disabled.

## Contextual Intelligence V1 tenant and source contract

The bounded V1 contract assembles a typed `PortalContextSnapshot` only for the active Portal tuple. Snapshot construction rejects a profile whose ID/business does not match the selected context and filters appointments, messages, documents, acknowledgements, and requests by both `businessId` and `customerProfileId`. Published branding is accepted only for the active business, revoked documents are excluded as usable context sources, and contextual output is suppressed unless access is active and the matching profile is present.

This filtering is defense in depth, not authorization. RLS, server validation, storage checks, and registered deterministic operations remain authoritative. Context, model output, client state, local storage, a URL, record identifier, industry string, feature flag, or configuration payload can never grant access. A tenant/profile switch must remount the Portal context and clear results, suggestions, drafts, dismissals, and caches before the new tuple is evaluated.

Allowed source kinds are the active customer-visible profile, published business branding/contacts, exact customer-visible appointments, messages, non-revoked documents and acknowledgements, support requests, and a future separately reviewed customer-visible knowledge projection. Minimum purpose, provenance, freshness/revocation, source ownership, and allowed action must be known before a source contributes. Forbidden sources include CRM and lead data, Business Brain, internal or clinical notes, staff conversations and queues, raw Knowledge Center sources/chunks/indexes, unpublished knowledge, billing/executive records, prompts and orchestration, credentials/tokens/signed URLs/storage paths, provider secrets, and every other tenant, customer, profile, environment, or session.

The internal confidence union remains `supported`, `partially_supported`, `unsupported`, and `prohibited`. The public label mapping is `supported` to **Supported**, `partially_supported` to **Limited**, and `unsupported` or `prohibited` to **Unavailable**. `prohibited` must retain a separate refusal and safe-escalation branch; it may not fall through to ordinary unsupported wording or provider retry.

The production provider is deliberately unavailable and fails closed. Its current unavailable mode returns no message suggestions and no supported document or rewrite output, leaving the deterministic core usable. Any future production provider must be server-only, authenticate the session again, derive the tenant/profile rather than accept it from the browser, re-fetch or revalidate exact RLS-visible records, enforce capability/source allowlists and freshness, reject revoked or cross-tenant data, validate output, apply abuse controls, and emit privacy-safe operational evidence. Customer-visible knowledge or persisted context cannot be added without the mandatory inspected, versioned, human-approved, manually applied, and verified database workflow.

The deterministic demo provider is qualified **demo-only**. Its fictional records and explicit relation map never establish production document relationships, provider availability, AI quality, customer behavior, RLS enforcement, or a technical moat. The production demo guard and absence of a Supabase client remain mandatory.

## Live production-validation findings

All eight portal tables contained zero rows during the recorded July 13 pre-hardening inspection. That historical result does not establish the current row count. At that inspection there were no supported tuples to test across businesses, so zero tuple orphans and zero unauthorized rows were vacuous results rather than proof of isolation.

The pre-hardening live read-only PostgREST inspection showed anonymous API privilege on branding, messages, acknowledgements, and requests because GET returned `200 []`; the other four portal tables returned `401`. RLS prevented row disclosure in the empty dataset, but authenticated table-wide grants still extended beyond the safe-column application contract. The latest certification review removed the earlier hardening-verification blocker; behavioral tenant evidence remains absent.

The Applied hardening is globally conservative: any Auth identity used by the portal is excluded from all business-owner and business-member roles. The migration must not be rerun. Cross-tenant behavior, profile/business tuple denial, direct REST access, mixed-principal rejection, and storage isolation remain Pending until approved fixtures exist.

## Planned two-tenant behavioral fixture

The unprovisioned [Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md) and [operator package](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md) define two fictional tenants, distinct owner identities, single-profile customers, a suspended customer, an invited inactive customer, and A5 with one active profile in each tenant. The [data matrix](../testing/TEST_DATA_MATRIX.md), [checklist](../testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md), and [authentication procedures](../testing/AUTH_TEST_PROCEDURES.md) define the exact denial evidence. Both A5 profiles must remain active and the tenants must have visibly different safe fixture content so a switch can prove both allowed access and absence of data mixing.

Every portal customer Auth UUID must be absent from owner/member roles globally. Owner A and Owner B must have no portal profile. Profile IDs, business IDs, Auth UUIDs, and remembered browser selections are not documentation or authorization inputs. The package remains gated by human provisioning approval, secure credentials, trusted operations, and dependency-safe cleanup; no tenant or row has been created.

## Final certification result

Tenant isolation scored **30/100** because the source design is strong but the required behavior has not been demonstrated. The certification review confirmed exact profile/business filters, composite relationships, active-profile selection, global owner/member exclusion in the hardening helper, customer-only message/document/request rules, and a download route that derives tenant context from RLS-visible data rather than browser-supplied identifiers.

The hardening-verification blocker is resolved, but the two-tenant plan remains unprovisioned. No supported A1/A2/A5/B1 tuple, wrong-tenant UUID, direct-REST request, mixed owner/customer principal, mixed member/customer principal, no-profile identity, or private Storage object was exercised. Customer Portal V1 certification is **FAILED** and Production Ready is **NO**. No SQL was executed.

The latest global score remains **71/100**. Contextual Intelligence code or demo behavior cannot raise that score by existence alone. Credential-backed session/expiry and multi-profile tests, behavioral tenant and direct-REST denial, private Storage and signed-download revocation, assistive-technology evidence, production performance, rate limiting, abuse detection, monitoring, incident recovery, support lifecycle, provider/source validation, and verified human handoff remain required.
