# Customer Portal V1

## Date

Documentation record updated July 13, 2026. Approval date is Pending because no explicit approval date was supplied.

## Status

Database change status: **Verified**.

Migration execution: **Applied**. Verification: **Verified** by explicit user confirmation. Customer Portal product implementation: **Implemented in the repository**. Production deployment and commercial availability are not claimed.

## Objective

Create a database and authorization foundation for a business-branded portal where an authenticated end customer can access only that customer's explicitly scoped records for one JOHAI business.

## Problem Solved

The initial schema audit found that business-member authentication is not an appropriate identity model for a business's end customers, CRM conversations mix internal and customer-visible concerns, appointments are stored on leads instead of customer-scoped records, and Knowledge Center documents do not provide an explicit customer-sharing boundary.

## Business Value

The proposed boundary prepares JOHAI to support customer self-service for appointments, messages, shared documents, acknowledgements, requests, profile preferences, and safe business branding without exposing internal workspace data.

## User Experience

The portal provides `/portal`, `/portal/login`, `/portal/reset-password`, and authenticated appointments, messages, documents, profile, and support routes. A dedicated PKCE Supabase client persists the portal session under its own storage key and is reused through a browser-global per-key registry, while the root provider does not mount the workspace authentication client on `/portal/*`. An authenticated user must have at least one active profile visible through RLS; customers linked to multiple businesses explicitly select the active portal. Public signup and invitation redemption are not implemented.

## Features Added

Implemented:

- Auth-linked customer profiles scoped to one business
- Server-controlled invitations
- Safe customer-visible business branding
- Customer-specific appointments, messages, requests, and explicitly shared documents
- Document acknowledgements
- Composite customer/business ownership constraints
- Customer and business RLS policies
- A narrowly scoped customer/profile/business authorization helper
- A read-only metadata and relationship verifier, confirmed successful by the user
- Responsive portal shell, overview dashboard, keyboard skip link, visible focus states, semantic labels, and loading, empty, error, unavailable-access, and retry states
- Appointment views with customer-visible details and safe HTTPS meeting, reschedule, and cancellation links
- Customer-visible message history and customer message creation, including a human-support request flag
- Current shared-document metadata, acknowledgements, and a bearer-authorized short-lived signed-download route
- Editable safe profile fields and notification preferences
- Customer support request creation and status history

## Files Changed

- `supabase/migrations/20260713120000_customer_portal_v1_foundation.sql` — applied and user-confirmed verified; not modified by the application implementation
- `supabase/verification/customer_portal_v1_foundation_verify.sql` — read-only verifier; not modified by this documentation update
- `app/portal/` — portal layouts, authentication pages, protected overview, appointments, messages, documents, profile, support, and route-level loading/error states
- `app/api/portal/documents/[id]/download/route.ts` — authorized short-lived signed document delivery
- `app/lib/customer-portal-auth-client.ts`, `app/lib/customer-portal-data.ts`, and `app/lib/customer-portal-types.ts` — dedicated authentication, validated safe-column data access, and portal contracts
- `app/lib/supabase-browser-auth-client.ts` — shared browser registry that guarantees one auth client per persisted storage key without merging workspace and portal sessions
- `components/portal/` — portal authentication, tenant selection, shell, dashboard, feature views, and shared loading/empty/error UI
- `docs/approvals/DATABASE_CHANGE_LOG.md`
- `docs/decisions/ADR-0002-customer-portal-identity-and-isolation.md`
- Related changelog, history, fact-sheet, manual, investor, customer, and technical records listed in the approval log

## Architecture Changes

The feature belongs to the **Customer Portal** platform layer. Portal customers remain separate from Business Workspace members and JOHAI administrators. Internal CRM notes, scores, Knowledge Center data, AI reasoning, audits, billing administration, and unrelated tenant data remain outside the portal boundary.

## Data Model Changes

The applied migration adds profiles, invitations, branding, appointments, messages, documents, document acknowledgements, and requests. Customer-owned records carry `customer_profile_id` and `business_id`; composite foreign keys preserve that pair. The complete object and constraint inventory is recorded in `docs/technical/database.md` and `docs/approvals/DATABASE_CHANGE_LOG.md`.

## API Changes

`GET /api/portal/documents/[id]/download` accepts the caller's Supabase bearer token plus the selected business/profile pair, verifies the user and the exact RLS-visible non-revoked document tuple, rejects non-canonical or traversal-capable storage paths, enforces an allowed storage bucket and canonical `business_id/customer_profile_id/` path, then returns a 60-second signed URL with no-store response headers. Other portal data operations use the authenticated Supabase client and the approved RLS policies directly. Invitation redemption and appointment-provider synchronization remain unimplemented.

## Security Considerations

RLS is applied on all eight tables. Customer access binds `auth.uid()` to an active customer profile and the same business. Customer-visible messages and non-revoked documents receive additional filters. The application selects explicit safe columns and repeats profile/business filters; RLS remains the authorization boundary. Registration linkage remains server-controlled.

The `SECURITY DEFINER` helper has a locked `pg_catalog` search path and a narrow caller/profile/business predicate. Authenticated execution is required by the RLS policies. The service-role grant is not proven necessary by current callers.

The user confirmed successful migration and verification, but detailed live effective-privilege output was not supplied. Direct authenticated REST access may still use any table-level privileges that exist outside the application's safe-column layer. A table-level profile `UPDATE` grant, broad grants, or `TRUNCATE` privilege would not be narrowed by UI controls or RLS column selection; this remains a documented production-security evidence gap.

Document downloads are server-mediated. The bearer token is revalidated, document metadata must be RLS-visible and non-revoked, the storage bucket must be listed in `CUSTOMER_PORTAL_DOCUMENT_BUCKETS`, and the normalized path must begin with the canonical business/profile prefix before the service role creates a 60-second signed URL.

## Multi-Tenant Considerations

Every customer-owned portal relation uses both customer profile and business identity. Composite foreign keys prevent supported records from pointing to a customer profile in another business. RLS then binds the pair to the authenticated caller. Business management policies depend on the existing `user_owns_business` helper, whose deployed definition and privileges must be inspected.

## Billing Considerations

None. The Customer Portal foundation does not implement subscription state, invoices, entitlements, or customer billing access.

## Testing and Validation

The user explicitly confirmed that the approved migration was manually applied and the read-only verification succeeded. Approver identity, dates, raw output, and query-by-query findings were not supplied and remain Pending. No SQL was executed by the implementation agent.

The read-only verifier inventories RLS, policies, indexes, constraints, helper configuration, execute privileges, missing auth/business parents, cross-business lead links, and orphan portal rows. Its raw result was not supplied. It does not replace production behavioral cross-tenant tests or separate evidence for effective ACLs, function ownership and volatility, unexpected policies/grants, and Supabase Storage access.

`npm run lint` passed. The first default `npm run build` attempt could not open the pre-existing locked `.next-build-stable/trace`; an alternate `NEXT_DIST_DIR` build then passed TypeScript and generated all 43 routes, including every portal route and the signed-download API.

A production-build browser inspection confirmed that customer sign-in becomes enabled after session initialization, password-recovery mode renders correctly, and the login page has no horizontal overflow at a 390-by-844-pixel viewport. Protected feature routes were not exercised with a provisioned customer session, and no screenshot artifact was retained.

On July 14, 2026, the existing 16-test portal suite was extended to verify one cached browser client per storage key, one factory call per surface, conflicting-configuration rejection, unchanged distinct storage keys, retained login/logout/session-refresh wiring, provider boundaries, and the demo's no-auth rule. `npm run test:portal`, `npm run lint`, and the canonical `npm run build` passed. Live development-browser checks confirmed an enabled portal sign-in control, unauthenticated `/portal` redirect, `/portal/demo`, workspace sign-in, and dashboard-login redirect with no duplicate GoTrue warning or hydration warning. Credential-backed authentication, recovery, refresh, logout, expiry, and multi-tab propagation were not executed because no approved test credentials were supplied.

## Known Limitations

- Detailed live Supabase schema/effective-privilege evidence: Pending
- Manual migration execution: Applied by explicit user confirmation; execution date Pending
- Read-only verification: Verified by explicit user confirmation; raw output and query findings Pending
- Approver identity and approval date: Pending
- Public signup and invitation redemption: not implemented
- Production configuration, deployment, and customer provisioning: not confirmed
- Production end-to-end authentication, storage, and cross-tenant RLS testing: not completed
- RLS is enabled but not forced; elevated roles retain their intended bypass authority

## Remaining Risks

- Detailed effective table, column, inherited, default, or `TRUNCATE` privileges were not supplied with the verification confirmation.
- Direct REST calls by an authenticated user can reach any own-row columns allowed by deployed table privileges, even when the UI does not select them.
- Customer-supplied acknowledgement and message/request timestamps are not trusted audit evidence.
- A document can be revoked between the application's visibility check and acknowledgement insert; the database policy does not independently reject that race.
- Portal sessions and selected tenant profile are persisted in browser storage; XSS prevention and device/session hygiene remain important.
- Browser singleton behavior is covered structurally and on unauthenticated routes, but credential-backed refresh, recovery, logout, expiry, and multi-tab propagation remain unverified.
- Invitation provisioning, rate limiting, provider synchronization, retention, and production end-to-end isolation tests remain unresolved.
- Signed downloads depend on correct `CUSTOMER_PORTAL_DOCUMENT_BUCKETS` and canonical storage paths; misconfiguration fails closed but prevents downloads.
- Appointment meeting, reschedule, and cancel actions open external URLs controlled by stored customer-visible data.
- No reverse migration exists; post-commit recovery requires a separately approved corrective migration or backup restoration.

## Screenshots Required

A temporary full-page mobile screenshot was inspected during responsive validation. No screenshot file was retained in the repository.

## Investor Summary

The applied and user-confirmed verified foundation plus the repository implementation create a credible tenant-scoped customer layer. Production deployment, commercial validation, usage, retention, and defensibility are not established.

## Customer Summary

The repository now contains a separate Customer Portal experience for provisioned, authenticated customers. It is not a public signup surface and production availability is not confirmed. Each active customer is limited to RLS-visible records for the selected business.

## Technical Summary

- **Migration:** `supabase/migrations/20260713120000_customer_portal_v1_foundation.sql`
- **Verification:** `supabase/verification/customer_portal_v1_foundation_verify.sql`
- **Approval status:** Verified
- **Execution status:** Applied
- **Verification status:** Verified
- **Authoritative record:** `docs/approvals/DATABASE_CHANGE_LOG.md`

## Errors and Corrections

Documentation status was advanced from Approved for manual execution to Applied and Verified after explicit user confirmation. No SQL correction or execution/verification error was reported; raw logs and any unreported corrections remain Pending. The initial default build failed because `.next-build-stable/trace` was locked, and validation was completed successfully with an alternate Next.js output directory.

## Next Recommended Step

Configure and validate customer provisioning, portal environment variables, the document bucket allowlist, and canonical storage paths in the target environment. Add production end-to-end authentication, authorization, multi-tenant denial, direct-REST privilege, document revocation-race, and signed-download tests before claiming production readiness. Any database correction requires a new inspected and approved migration workflow.

The exact non-production fixture design is recorded in [Customer Portal Synthetic Test Identity Plan](CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md). It remains unprovisioned and does not advance authentication or production-readiness status.
