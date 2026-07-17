# Security and Multi-tenancy

Supabase migrations add business ownership fields and RLS preparation. Dashboard administration uses a separate password cookie, and some services still resolve the default business. Production requires a complete user-membership and tenant authorization review.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Customer Portal boundary — applied and implemented

Portal authorization combines `auth.uid()`, an active RLS-visible customer profile, and `business_id`. Portal customers are not business workspace members. Composite profile/business relationships bind appointments, visible messages, explicitly shared document metadata, acknowledgements, and requests. Browser-supplied tenant IDs are never sufficient: the application lists only profiles visible through RLS, requires explicit selection when more than one exists, and repeats the selected profile/business pair on every data operation.

CRM-wide records, internal notes and scores, Knowledge Center content, AI reasoning, audit data, billing administration, the Executive Dashboard, other tenants, and business workspace membership remain forbidden. RLS is active on every portal table, with extra visibility checks for messages and revoked documents. The application selects only approved customer columns and validates returned data, but deployed grants and RLS remain the authority for direct REST calls outside the UI.

The user explicitly confirmed that the migration was manually applied and verified, and implementation was authorized. Approver identity, dates, detailed live effective privileges, helper ownership/configuration, unexpected policies, raw verifier output, and query-by-query results remain Pending documentation evidence in the [Database Change Log](../approvals/DATABASE_CHANGE_LOG.md).

The dedicated portal auth client uses PKCE and the separate persistent `johai-customer-portal-session` browser storage key. The Business Workspace remains on `johai-auth-session`. A shared keyed registry allows only one GoTrue client to own each key in a browser context; it does not combine the two sessions or change the database authorization boundary. The active tenant choice is stored in `localStorage` for the signed-in user; it is a preference, not an authorization credential. Preventing XSS and maintaining browser/session hygiene therefore remain important.

Document downloads require a bearer token, fresh user validation, an RLS-visible non-revoked document, an allowlisted `CUSTOMER_PORTAL_DOCUMENT_BUCKETS` bucket, and a normalized path beginning with `business_id/customer_profile_id/`. Only then may the server's service role issue a 60-second signed URL. Misconfiguration fails closed. Production still needs end-to-end tests for cross-tenant denial, direct REST privileges, revocation races, and storage access.

## Contextual Intelligence V1 security boundary

Customer Portal Contextual Intelligence V1 is bounded by the same authenticated customer, active profile, and exact `business_id`/`customer_profile_id` tuple as the rest of the Portal. It may consider only the minimum customer-visible profile fields, published business branding and contacts, appointments, messages, current documents and acknowledgements, support requests, explicit locale and timezone, and the current Portal task. Context can make an authorized experience more relevant; it never creates permission, reveals a hidden record, enables a module, or authorizes an action.

CRM internals, lead data, Business Brain, private or clinical notes, staff-only conversations, raw Knowledge Center files or extracted text, unpublished knowledge, billing and executive data, prompts, reasoning, orchestration traces, credentials, tokens, signed URLs, storage paths, provider secrets, and another customer, profile, business, environment, or session remain forbidden sources. A customer-facing answer may not use a source merely because a privileged service could technically read it.

The locked internal support classes are **Supported**, **Partially supported**, **Unsupported**, and **Prohibited**. The Portal may present the simpler customer labels **Supported**, **Limited**, and **Unavailable**: Supported maps to Supported, Partially supported maps to Limited, and both Unsupported and Prohibited map to Unavailable. Prohibited remains a distinct internal refusal path so regulated judgment, forbidden data, unsafe instructions, and unauthorized actions are never treated as an ordinary missing-information case.

Production generation remains fail-closed. When no approved provider and no reviewed customer-visible source are configured, the Portal returns an unavailable state and preserves the ordinary deterministic page. A future production provider must run through a trusted server boundary, authenticate the current session again, derive the active tenant/profile from trusted state, re-check record visibility, freshness, revocation, and the requested capability, and validate the output before it reaches the customer. A browser-supplied snapshot, route, record ID, industry label, remembered profile, or generated response is never authorization.

The development demo uses fixed fictional data, explicit reviewed relations, and deterministic guidance. It does not make a production provider call, query Supabase, prove RLS behavior, establish customer-visible knowledge publication, notify a person, or create production evidence. Document explanations preserve the original fictional document as the source of truth; appointment slots are never invented; message suggestions remain unsent until the customer acts; and a human-help request records intent only.

This bounded work does not certify the Portal. The latest authoritative certification remains **71/100**, **FAILED**, and Production Ready **NO**. Approved synthetic identities, credential-backed authentication and tenant/direct-REST denial, private Storage and signed-download behavior, assistive-technology evidence, production performance, abuse controls, monitoring, support lifecycle, and verified human-handoff operations remain production blockers.

## Production security hardening — migration Applied; verification blocker resolved

The pre-hardening live read-only PostgREST inspection found all eight portal tables in the API description and `is_current_portal_customer` as the only portal RPC. Anonymous GET returned `200 []` for branding, messages, acknowledgements, and requests, while profiles, invitations, appointments, and documents returned `401`. All eight tables contained zero rows, so those results did not prove behavioral isolation.

Pre-migration authenticated table-wide access was broader than the customer UI and could expose own-row internal linkage/provider/storage columns or accept caller-supplied IDs and timestamps through direct REST where schema and grants permitted them. The user confirmed successful execution of `supabase/migrations/20260713190000_customer_portal_production_security_hardening.sql`. The change is **Applied**, is immutable history, and must not be modified or rerun. The latest certification review removed the earlier verification blocker. Approver identity, approval/execution dates, and raw query-by-query evidence references remain `Pending` documentation evidence and must not be invented.

The Applied design enforces global identity separation: an Auth identity used for a portal customer must not be a business owner or member for any JOHAI business. Mixed workspace/customer principals are denied. This reduces confused-deputy and cross-surface session risk, but a person needing both roles must maintain distinct Auth identities. Representative behavioral testing with approved multi-tenant fixtures remains a production-readiness requirement.

## Development-only pilot demo isolation

`/portal/demo` is a local presentation route guarded so it is unavailable in production. It uses the fictional Harbor Dental Studio/Sophie Martin fixture through an in-memory repository. The demo does not instantiate a Supabase data/Auth client, create or mutate a portal session, send Supabase, external, authentication, production-data, or persistence network requests, use a service-role credential, query RLS-protected tables, read Storage, or write production data. The sole permitted non-asset request is the same-origin generated attachment endpoint, which uses the same development/test guard and returns 404 elsewhere.

The scenario controls **Complete pilot**, **Empty states**, **Load error**, **Fail next message**, **Fail next download**, **Expire next save**, and **Reset fictional data** affect only in-memory fixture state. They are not accepted on production routes and are not a browser-only authorization shortcut. Refreshing or resetting discards the state.

The demo may show a fictional withdrawn-document presentation state, but production customers continue to receive only the document rows authorized by RLS and the signed-download route. Demo files are safe generated placeholders and must never use the Knowledge Center bucket.

Production authentication, RLS, table/column grants, server-only Storage metadata, signed-URL checks, and global identity separation remain unchanged. If the demo route is reachable from a production build, deployment must stop until the server-side development guard is restored. No database rollback applies because the demo executes no SQL.

The pilot test suite contains 16 checks: the 12 required Customer Portal contracts plus four complementary scenario and guard cases. These local tests do not replace production behavioral RLS, Storage, browser, rate-limit, monitoring, or recovery evidence.

The pilot is not evidence of production authentication, behavioral tenant isolation, rate limiting, private Storage configuration, signed-download correctness, monitoring, or browser compatibility.

## Authentication validation identity policy

Real Customer Portal authentication tests may use only human-approved synthetic accounts in an approved non-production environment. Never use a production customer, expose a service-role credential to a browser, invent an email address, or place passwords, Auth UUIDs, recovery links, invitation tokens, access tokens, refresh tokens, or private storage URLs in documentation, source control, screenshots, or logs.

The exact plan uses eight Auth users: Owner A, Owner B, A1, A2, A3, A4, A5, and B1. It creates seven customer profiles: A1/A2 active in Tenant A, A3 suspended in Tenant A, A4 invited in Tenant A, A5 active in both Tenant A and Tenant B, and B1 active in Tenant B. Owners have no portal profile; portal identities never become owners or members. A dual-role person requires distinct Auth identities. See [Customer Portal Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md).

Provisioning is an operator-controlled action after an explicit GO decision. The latest certification review removed the earlier hardening-verification blocker. The trusted workflow may use service-role authority only server-side, must store only a hash of a high-entropy invitation token, and must derive the Auth user and tenant linkage from trusted state. If no approved administrative path exists for a required inactive state, do not insert it from a browser or run ad hoc SQL; stop and follow the mandatory architecture/database workflow.

The July 14 credential-free preflight proved the safe unauthenticated redirect, missing/invalid recovery failure, structural storage-key separation, and demo isolation. It did not prove credential-backed session or tenant behavior. The full evidence requirements and current Blocked status are recorded in [Customer Portal Real Authentication Validation](../sprints/CUSTOMER_PORTAL_AUTH_VALIDATION.md).

The synthetic plan and [operator package](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md) are prepared but unprovisioned. The companion [checklist](../testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md), [authentication procedures](../testing/AUTH_TEST_PROCEDURES.md), and [data matrix](../testing/TEST_DATA_MATRIX.md) fix the exact order, screens, expected/failure outcomes, rollback, cross-tenant tests, and cleanup. It uses seven invitation records: six accepted through the server-only redemption workflow and A4's unaccepted invitation. A3 is activated first and suspended afterward through trusted administration. A4 is never redeemed. Credentials use a private `.test` mail sink and expiring password-manager delivery; all sessions, rows, tenants, Auth users, messages, and secrets require recorded cleanup. No SQL, identity, or customer data was created by the package, and authentication remains not production-ready.

## Final security certification status

Static review supports the intended design: all eight portal tables are RLS-protected in the migration history; customer policies bind exact profile/business tuples; messages require customer visibility and customer sender type; documents require non-revocation; browser grants are column-scoped; security-definer helpers lock `search_path`; invitation redemption is service-role-only; and trigger creation is drop-before-create. No same-name duplicate policy, effective duplicate grant, or duplicate trigger was found in the ordered source history.

This is not behavioral production proof. The latest certification review removed the earlier hardening-verification blocker, but mixed-principal behavior, cross-tenant direct REST, private Storage, signed URL revocation, and rate-limit/monitoring behavior remain unverified. Customer Portal V1 certification is **FAILED** and Production Ready is **NO**. The migration was not modified or rerun, and no SQL was executed.
