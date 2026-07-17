# Customer Portal Production Validation

## Date

Documentation review opened July 13, 2026. Approval and execution dates, verification date, and production-validation date remain Pending.

## Status

**Migration Applied; verification Pending.** The user explicitly confirmed successful manual execution of the production security-hardening migration. The migration is immutable history and must not be modified, deleted, replaced, or executed again. The corrected read-only verifier must execute successfully without errors and its results must be recorded before verification can become Verified. Production readiness is still not established.

## Objective

Validate the Customer Portal as a separate tenant-isolated customer surface, narrow live database privileges to the minimum required by each customer workflow, and record route-by-route evidence before any production-readiness claim.

## Problem Solved

The applied Customer Portal V1 foundation provides tenant-scoped tables and RLS, but the pre-hardening live read-only PostgREST inspection found broader API privileges than the customer application requires. At that inspection, PostgREST exposed all eight portal tables and only `public.is_current_portal_customer(uuid, uuid)` as a portal RPC. Anonymous GET returned `200 []` for branding, messages, acknowledgements, and requests, while profiles, invitations, appointments, and documents returned `401`. The hardening migration subsequently completed successfully; corrected-verifier execution remains Pending.

The pre-hardening authenticated table-wide grants could expose own-row internal columns outside the application's safe-column list, including profile identity/linkage fields, appointment provider/event identifiers, and document storage bucket/path fields. Table-wide inserts could also permit caller-supplied IDs or timestamps where the schema accepted them. The Applied hardening is intended to enforce the reviewed database allowlist, while corrected-verifier execution and behavioral direct-REST testing remain Pending.

All eight portal tables contained zero rows during the recorded inspection. There were no active customer profiles, test identities, mixed workspace/customer principals, accepted invitations, appointments, messages, current or revoked documents, acknowledgements, requests, or tuple orphans. Zero-row results are not proof of tenant isolation; behavioral authorization testing remains impossible until approved fixtures exist.

## Business Value

The gate prevents JOHAI from representing a compiled customer interface as production-ready without least-privilege database access, realistic tenant fixtures, end-to-end authentication evidence, and documented behavior for every route and failure mode.

## User Experience

The repository implements an invitation-oriented login experience for already-provisioned customer accounts, but it does not implement public registration, invitation redemption, a `/portal/dashboard` alias, or a dedicated auth callback route. The canonical dashboard is `/portal`. Protected pages are client-gated and depend on database RLS for data authorization.

## Route Behavior Matrix

| Route | Public / protected | Authentication requirement | Customer profile requirement | Business tenant requirement | Data source | Empty state | Loading state | Error state | Unauthorized behavior |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/portal` | Protected by the client `PortalProvider`; no server middleware gate | Valid dedicated Supabase portal session | At least one active RLS-visible profile | One selected profile/business pair; single profile auto-selects and multiple profiles require selection | Provider reads profiles/branding; dashboard reads upcoming appointments, non-revoked documents, customer-visible messages, and requests through anon client + RLS | Section states for no appointments/messages; zero-count document/request summaries | Auth/profile screen loader, route loader, then dashboard skeleton | Provider-wide error, dashboard inline retry, route error boundary | No session redirects client-side to login; no active profile shows access unavailable; multiple profiles block children until selected |
| `/portal/login` | Public | None to view; email/password required to sign in | None on page | None on page | Supabase Auth password sign-in and recovery-email request | None | Suspense sign-in loader; auth initialization and submit busy states | Unconfigured notice and generic sign-in/reset errors | Existing session redirects to an allowlisted protected portal path or `/portal` |
| `/portal/register` | Not implemented | N/A | N/A | N/A | None | N/A | N/A | Next.js 404 | No public registration or signup flow exists |
| `/portal/dashboard` | Not implemented; `/portal` is canonical | N/A | N/A | N/A | None | N/A | N/A | Next.js 404 | No alias or redirect exists; the safe-next allowlist falls back to `/portal` |
| `/portal/appointments` | Protected, client-gated | Valid portal session | Active RLS-visible profile | Selected profile/business pair | `customer_portal_appointments` split into upcoming and previous records; branding may supply booking URL | No appointments and no upcoming appointments states | Shared gate/route loader and page skeleton | Inline load retry and route boundary | Common login/profile/tenant gate; RLS protects rows |
| `/portal/messages` | Protected, client-gated | Valid portal session | Active RLS-visible profile | Selected profile/business pair | `customer_portal_messages`; visible-row read and customer-message insert | Start-conversation state | Shared gate/route loader and page skeleton | Separate load/retry and send/validation errors | Common gate; RLS protects reads and inserts |
| `/portal/documents` | Protected, client-gated | Valid portal session; bearer token required for download | Active RLS-visible profile | Selected pair is repeated in download headers | Non-revoked document metadata, acknowledgements, download API, private Storage | No documents shared state | Shared gate/route loader, page skeleton, per-document action busy state | Separate load/retry, acknowledgement, and download errors | Common gate; download API independently revalidates bearer, RLS row, tuple, bucket, and path |
| `/portal/profile` | Protected, client-gated | Valid portal session | Active profile supplied by provider | Selected profile/business pair | `customer_profiles` safe-field update through anon client + RLS | None | Shared gate plus save busy state | Inline save error/success | Common gate; direct REST remains governed by deployed grants, not UI fields |
| `/portal/support` | Protected, client-gated | Valid portal session | Active RLS-visible profile | Selected profile/business pair | `customer_portal_requests` history and open-request insert; branding contact fields | No requests state with create action | Shared gate/route loader and page skeleton | Separate load/retry and form/submit errors | Common gate; RLS protects reads and inserts |
| `/portal/reset-password` | Public page; protected mutation | Valid recovery session plus a recent `PASSWORD_RECOVERY` marker bound to the same user | None until redirect to `/portal` | None | Supabase Auth password update; session marker expires after 15 minutes | Invalid/expired/unconfigured recovery notice | Recovery-link verification loader and submit busy state | Password validation and generic update error | Missing session or marker cannot update and is directed to request another email |
| Dedicated auth callback route | Not implemented | N/A | N/A | N/A | No route handler; PKCE URL detection runs in the portal auth client and recovery returns to `/portal/reset-password` | N/A | N/A | Next.js 404 for a callback path | No OAuth/magic-link callback endpoint is documented or validated |
| `GET /api/portal/documents/[id]/download` | Protected API | Bearer token revalidated with Supabase Auth | Requested document must be RLS-visible to the caller | Business/profile headers must be valid and match the exact row; storage path must use that row's canonical prefix | Caller anon client reads non-revoked metadata; server service role creates a 60-second Storage URL | N/A | N/A | `404` for malformed/missing tuple, unavailable/revoked/mis-scoped row, invalid bucket/path, or signing failure; `503` for missing configuration | Missing or invalid bearer returns `401`; RLS denial is returned as the same `404` |

## Provisioning Flow

The intended flow is server-controlled and remains unimplemented and unvalidated:

1. An authorized business-side or operational process creates an invitation for the correct business and customer.
2. A trusted server process validates the invitation, provisions or links the Supabase Auth user, and creates the matching active customer profile.
3. The customer receives a trusted sign-in or recovery path.
4. The portal lists only active profiles visible through RLS and requires explicit selection when more than one business is linked.
5. Every customer data operation repeats the selected profile/business pair, while RLS remains authoritative.

There is no register route, invitation-redemption API, accepted-invitation fixture, or verified production provisioning procedure. The current “invitation-only” UI wording describes intent, not an available redemption workflow.

The Applied database design's operational sequence still requires application review and implementation, and database verification remains Pending:

1. A trusted server verifies the initiating business operator and the target business/customer linkage; it never accepts tenant or lead authority from the browser.
2. The server generates a high-entropy invitation token, stores only its lowercase 64-character hash with the correct business, optional lead, verified recipient email, and expiry, and delivers the raw token only through the controlled invitation channel.
3. The customer creates or signs into a Supabase Auth identity and confirms the authoritative Auth email. The applied database change does not enable public unrestricted signup.
4. A rate-limited server endpoint revalidates the customer bearer token, hashes the presented invitation token, and calls the service-role-only redemption function with that hash and the server-derived Auth user ID. It never sends the service key or tenant identifiers to client code.
5. The database transaction rejects malformed, expired, used, email-mismatched, suspended, wrong-lead, or workspace-owner/member identities with the same generic error; locks the invitation; creates or safely resolves the exact profile/business link; and marks the invitation accepted atomically.
6. Only after successful redemption does the customer enter the RLS-visible business portal. Raw tokens, token hashes, Auth IDs, lead IDs, and service-role credentials must not appear in customer responses or logs.

## Signed-Download Workflow

The current browser sends only the document ID, its verified bearer token, and the selected profile/business context. The server revalidates the bearer with Supabase Auth, authorizes the exact document/profile/business tuple under caller RLS, rejects revoked or unavailable rows without distinguishing tenant existence, validates the configured bucket allowlist and canonical `business_id/customer_profile_id/` storage prefix, and issues a no-store signed URL for 60 seconds. The browser never supplies a bucket or storage path.

Under the Applied column hardening, caller authorization must read only safe document columns. A separate trusted-server reread must then fetch bucket/path for the already-authorized exact tuple and recheck revocation immediately before signing. Database verification remains Pending. Missing/expired auth, wrong customer/business, revoked/missing documents, malformed IDs, unsupported buckets, and invalid paths remain generic failures. Valid, cross-tenant, expiry, revocation-race, and missing-file behavior is still Pending because no fixture, customer JWT, bucket configuration, or object exists.

## Support Workflow

An authenticated active customer selects a portal profile/business, opens Support, and submits a bounded request type, subject, and customer-visible detail. RLS must bind the insert to that exact active profile/business; the database supplies `status = 'open'`, record IDs, and audit timestamps. The customer may read only that profile's request history and customer-visible status/detail. A message's `human_support_requested` flag and a new support request record only the customer's request for help; neither is a promise of realtime delivery, assignment, or response. Rate limiting, staff notification/triage, response targets, retries, and end-to-end evidence remain Pending.

## Security Classifications

- **Public authentication surface:** `/portal/login` and the reset-password page shell. No portal business data should be available before session/profile resolution.
- **Protected customer surface:** `/portal`, appointments, messages, documents, profile, and support. These are client-gated and RLS-authorized.
- **Protected server operation:** the signed-document download API, which may use the service role only after independent bearer, RLS, tuple, bucket, and canonical-path validation.
- **Server-only provisioning:** invitation creation/redemption and auth/profile linkage. No supported application route exists yet.
- **Forbidden portal data:** CRM internals, Business Brain, Knowledge Center data, AI orchestration, internal notes, billing, Executive Dashboard data, provider secrets, raw storage paths, and other tenants.

## Features Added

No customer-facing production feature is marked complete by this documentation record. The Applied migration and Pending verification are represented by:

- `supabase/migrations/20260713190000_customer_portal_production_security_hardening.sql`
- `supabase/verification/customer_portal_production_security_hardening_verify.sql`

The migration completed successfully by explicit user confirmation and must not be rerun. The corrected read-only verifier has not yet completed successfully; verification remains Pending until its results are recorded.

## Files Changed

This sprint record and the mandatory approval, changelog, history, manual, customer, technical, investor, and fact-sheet records are updated. Application code was not changed. No SQL was executed while repairing the verifier or documentation, and no migration was modified or rerun.

## Architecture Changes

No platform-layer reassignment is proposed. The work belongs to the **Customer Portal** layer and tightens the database/API boundary used by the existing client-gated routes.

## Data Model Changes

The Applied migration added twelve bounded-shape constraints across profiles, invitations, and requests; a server-owned profile `updated_at` trigger; and a partial business-owner lookup index. It replaced the customer helper with a global mixed-principal guard, added a non-revoked-document helper, and added a service-role-only atomic invitation-redemption function. Verification remains Pending, and this record does not authorize repeating execution.

## API Changes

The Applied migration is intended to narrow direct PostgREST access and make customer writes use only approved shapes. Verification remains Pending. The document-download route remains subject to separate application alignment and behavioral validation.

## Security Considerations

Anonymous `200 []` did not leak rows in the pre-migration empty dataset, but it proved that an API privilege existed on four tables where anonymous portal access was unnecessary. Authenticated table-wide grants were broader than the application's safe-column contract. The Applied migration is intended to revoke that broad access and grant only the reviewed columns and operations; the corrected verifier must confirm the deployed posture. Representative browser and direct-REST behavior still requires testing.

## Multi-Tenant Considerations

Zero rows mean no cross-business pair can be exercised. Production validation requires at least two businesses, two different customer users, a multi-profile user, a no-profile user, an inactive/suspended profile, and negative access attempts across profile/business tuples. Fixtures and cleanup require explicit approval and must not be invented or silently written.

## Billing Considerations

None. Customer Portal validation must not expose or add billing behavior.

## Testing and Validation

This production-validation run established:

- Live read-only PostgREST OpenAPI lists all eight portal tables and only the existing customer-check RPC.
- Anonymous GET behavior is recorded above.
- All eight portal tables contain zero rows.
- `npm.cmd run lint` passed on July 13, 2026. PowerShell blocked `npm.ps1`, so the command shim was used.
- The default `npm.cmd run build` stopped before compilation with `EPERM` while opening `.next-build-stable/trace`. An exclusive-open check was also blocked. The trace was last written `2026-07-11T14:43:29-04:00`; multiple Node processes were active, but process command lines and ownership were unavailable and no process was terminated.
- No portal test file or portal-specific automated test script exists.
- No browser QA ran in this production-validation attempt.
- The migration was inspected and then executed successfully by explicit user confirmation. It must not be rerun.
- Earlier verifier attempts did not complete: one version used the nonexistent `public.customer_portal_acknowledgements` relation, and a subsequent version failed with PostgreSQL `42883` on `pg_catalog.coalesce(aclitem[], aclitem[])`. Both defects are corrected, but successful execution of the corrected verifier and its results remain Pending.

The corrected verifier is designed to inventory relations/RLS, columns, exact table and column privileges, `PUBLIC`/anonymous/inherited/default ACLs, policies, function security and execute access, the timestamp trigger, owner index, constraints, mixed principals, tuple orphans, revoked-document and invitation anomalies, data-shape conflicts, and Storage buckets. Successful execution, raw output, and query-by-query findings remain Pending documentation evidence.

Pending evidence:

- Approver identity, approval date, and migration execution date
- Raw verifier output and query-by-query findings
- Detailed effective table/column/default/inherited privilege output after hardening
- Provisioned customer fixtures and every protected-route browser path
- Behavioral RLS, direct REST, write-shape, storage, signed URL, and revocation-race tests
- Rate-limit behavior, accessibility automation, responsive device/browser matrix, monitoring, and recovery evidence

## Known Limitations

- No customer data or test identity exists in the live portal tables.
- No supported registration, invitation redemption, dashboard alias, or dedicated callback route exists.
- Protected pages use a client gate rather than a server/middleware auth redirect.
- Rate limiting is not implemented.
- The active build output is locked by an active but unidentified Node process; process ownership and safe shutdown remain unresolved.
- Repeatable cleanup remains operator-gated: identify and prove the JOHAI Next.js file owner, stop only that process gracefully, confirm exclusive access, verify the resolved output path is inside the repository, remove only stale build output, and retry the configured default build. Do not terminate unidentified processes, delete source, or keep changing `distDir`; the earlier alternate directory is diagnostic only.
- No browser QA has been performed in this production-validation run.

## Remaining Risks

- The migration is Applied, but corrected-verifier execution and representative authenticated/anonymous direct-REST behavior remain Pending.
- RLS behavior with real customer and mixed-tenant rows is unproven.
- Storage bucket policy, canonical object placement, signed URL expiry, and revocation races are unproven in production.
- Direct REST callers may use privileges or caller-supplied fields unavailable in the UI.
- The application has been aligned with the reviewed allowlists and server-owned defaults, including the two-stage document lookup. Verification of deployed grants and behavioral direct-REST/storage behavior remains Pending; application alignment is not database evidence.
- Download authorization must first establish the exact caller-visible document/profile/business tuple using safe columns, then perform an exact trusted-server reread for storage metadata and revocation immediately before signing. It must preserve caller authorization, tenant binding, non-revocation, bucket allowlisting, and canonical-path checks.
- Current message, document, profile, request, and download calls are repository-aligned, but deployed behavior remains unproven until corrected verification and approved behavioral evidence are recorded.
- Session expiry, recovery redirects, localStorage selection, XSS resilience, and logout behavior lack production evidence.
- External appointment links and provider behavior are not controlled by JOHAI.
- No reverse migration or production rollback evidence is recorded for the applied hardening. Do not rerun it; any correction requires a new approved migration.

## Screenshots Required

Pending. Any browser evidence must avoid customer data, access tokens, recovery links, storage URLs, and secrets.

## Investor Summary

The work is a production-security gate, not traction or a shipped-product milestone. It demonstrates that JOHAI is auditing least privilege and tenant evidence before a production claim.

## Customer Summary

The repository interface exists, but no live customer account or data is available for validation. Production access and self-service onboarding are not available from this record.

## Technical Summary

- **Status:** Migration Applied; verification Pending
- **Migration:** `supabase/migrations/20260713190000_customer_portal_production_security_hardening.sql`
- **Verification:** `supabase/verification/customer_portal_production_security_hardening_verify.sql`
- **Approval:** Approved before execution; approver identity and approval date Pending
- **Execution:** Applied by explicit user confirmation; execution date Pending; must not be repeated
- **Verification execution/result:** Pending until the corrected verifier executes successfully without errors and its results are recorded
- **Production readiness:** Not established

## Next Recommended Step

Do not rerun or alter the Applied migration. Run only the corrected read-only verifier and record its complete results. After successful verification, use separately approved representative identities and data for behavioral tenant, direct-REST, storage, signed-download, session, accessibility, and route validation. Do not claim production readiness until those risks are closed.

The representative identity design is now prepared in [Customer Portal Synthetic Test Identity Plan](CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md): eight Auth users, seven profiles, seven invitations, two reserved-domain tenants, secure credential delivery, and complete cleanup. It remains unprovisioned and requires separate human approval after verifier success.

That eight-user plan covers the requested 15 authentication scenarios. It does not replace the separate no-profile, mixed owner/customer, and mixed member/customer fixtures required for broader behavioral database/RLS denial. Those remain Pending under a separate security-test approval.

## Final certification checkpoint — 2026-07-14

The final certification sprint is recorded in [Customer Portal V1 Final Certification](CUSTOMER_PORTAL_V1_FINAL_CERTIFICATION.md). It scored the current production assurance at **69/100**, returned **FAILED**, and set **Production Ready: NO**.

Static security review, lint, 16/16 Portal tests, the canonical 43-route production build, shared-route responsive checks, browser semantics, console inspection, and corrected contrast passed. The certification did not close the decisive gates: production-hardening verification remains Pending, synthetic identities remain unprovisioned, and credential-backed auth, behavioral tenant/direct-REST, private Storage, complete assistive-technology, production performance, abuse-control, monitoring, and support-lifecycle results remain absent. The Applied migration was not changed or rerun, and no SQL was executed.
