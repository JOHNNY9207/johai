# Database Change Log

This is the authoritative approval and execution ledger for JOHAI database and security changes. A migration is not complete because its files exist or because it was approved. Use `Pending` for every fact not explicitly confirmed.

## Customer Portal production security hardening — Applied; verification Pending

- **Change title:** Customer Portal production security hardening
- **Platform layer:** Customer Portal
- **Migration file:** `supabase/migrations/20260713190000_customer_portal_production_security_hardening.sql`
- **Verification file:** `supabase/verification/customer_portal_production_security_hardening_verify.sql`
- **Purpose:** Close the least-privilege, mixed-principal, invitation-redemption, revoked-document acknowledgement, and client-controlled audit-field gaps identified during production validation without expanding the customer-facing product surface.
- **Business problem:** The approved foundation isolates rows with RLS, but its table-wide authenticated grants expose internal linkage and provider/storage metadata and permit browser writes to identifiers and timestamps that the server should own. Business-management policies on the same tables also create a permissive-policy overlap risk if one Auth identity is both an internal business principal and a portal customer. Production onboarding additionally needs one atomic, server-only invitation-redemption transaction.
- **Repository schema findings:** All eight foundation tables are present in the live PostgREST OpenAPI surface and the only exposed foundation RPC is `is_current_portal_customer`. The current application has no registration route or server redemption workflow, no portal-specific automated test suite, no rate limiter, and no validated production document-bucket allowlist. The current download route reads `storage_bucket` and `storage_path` through caller RLS and must be refactored if those columns cease to be browser-readable.
- **Live schema inspected:** Read-only PostgREST OpenAPI and anonymous request behavior were inspected. Anonymous `GET` returned `200 []` for branding, messages, acknowledgements, and requests because privileges exist while RLS filters all rows; it returned `401` for profiles, invitations, appointments, and documents. All eight portal tables contained zero rows: no profiles, invitations, branding, appointments, messages, documents, acknowledgements, or requests; therefore there were no active profiles, test identities, mixed principals, tuple orphans, revoked documents, or accepted invitations to exercise behaviorally. Zero rows are not evidence that cross-tenant behavior is correct.
- **Security review:** Approved by the user's explicit final security approval. The active change resets browser-facing table and column grants, removes permissive business-management policies from portal tables, makes business-side management server-mediated, globally rejects business owners/members as portal principals, adds a revoked-document-aware acknowledgement predicate, makes profile audit timestamps server-owned, bounds direct-write shapes, and adds a service-role-only atomic invitation-redemption function. The corrected read-only verifier has been repaired but has not yet completed successfully. Behavioral RLS, invitation, storage-download, and mixed-principal testing remain Pending.
- **Approval status:** Applied
- **Required approval authority:** The JOHAI project owner or an explicitly authorized human database approver.
- **Approved by:** Pending
- **Approval date:** Pending
- **Migration status:** Applied
- **Execution status:** Applied — manual execution completed successfully by explicit user confirmation; the migration is immutable history and must not be modified, replaced, deleted, or executed again.
- **Execution date:** Pending
- **Verification status:** Pending
- **Verification result:** Pending — successful execution of the corrected verifier, the verification date, raw output, and query-by-query findings have not been confirmed.
- **Errors and corrections:** No migration execution error was reported. Earlier verifier attempts encountered two file defects: the nonexistent relation `public.customer_portal_acknowledgements` was used instead of `public.customer_portal_document_acknowledgements`, and an ACL inspection failed with PostgreSQL error `42883`, `function pg_catalog.coalesce(aclitem[], aclitem[]) does not exist`. Every acknowledgement-table reference now uses the correct relation. Incompatible ACL-array inspection was replaced with read-only `information_schema.table_privileges` and `pg_catalog.has_function_privilege(...)` checks, and the schema-label `pg_catalog.coalesce(...)` was replaced with `CASE`. These corrections affected only the verifier; the applied migration was not modified or rerun. Successful execution and results for the corrected verifier remain Pending.
- **Related sprint:** `docs/sprints/CUSTOMER_PORTAL_PRODUCTION_VALIDATION.md`
- **Decision record:** `docs/decisions/ADR-0002-customer-portal-identity-and-isolation.md` (accepted foundation with an Applied hardening amendment; verification Pending)
- **Final application certification checkpoint:** `docs/sprints/CUSTOMER_PORTAL_V1_FINAL_CERTIFICATION.md` records **FAILED**, global score **69/100**, Production Ready **NO**. This does not change the database lifecycle: the migration remains Applied and immutable, verification remains Pending, execution must not be repeated, and no SQL was executed during certification.
- **Certification blockers related to this change:** successful recorded verifier output, representative credential-backed authentication, behavioral tenant/direct-REST denial, private Storage/signed-download evidence, and production security operations remain Pending. Local lint, 16 Portal tests, canonical build, shared-route browser checks, and corrected contrast passed but are not database verification.

### Applied schema and integrity changes — verification Pending

- Add the partial index `businesses_owner_user_id_idx` for non-null `businesses.owner_user_id` lookups used by the mixed-principal guard.
- Add bounded checks for customer profile name, email, phone, language, communication preference, address JSON, and notification-preferences JSON.
- Add invitation token-hash format and expiry-order checks.
- Add request type, subject, and customer-visible-detail checks.
- Add the `customer_profiles_set_updated_at` trigger so `updated_at` comes from `statement_timestamp()` on every profile update.
- Treat conflicting data created after the zero-row preflight as a transaction failure rather than silently accepting it.

### Applied security rules — verification Pending

1. One Supabase Auth principal cannot act as a Customer Portal identity if it is a business owner or business member anywhere in JOHAI. A person who needs both roles must use distinct Auth identities.
2. A portal identity must still map to an active `customer_profiles` row for the exact profile/business pair.
3. Business-side portal-table management is server-mediated; internal business owner/member policies are removed from the eight portal tables so permissive RLS policies cannot be ORed into customer access.
4. Browser access is column-scoped. Internal `auth_user_id`, `lead_id`, provider/event identifiers, storage bucket/path, internal visibility/revocation fields, and server-controlled timestamps are not granted to authenticated browser clients.
5. A customer can acknowledge only a non-revoked document bound to the same customer/business pair.
6. Profile `updated_at`, acknowledgement time, record IDs, creation times, and other excluded audit fields are server-owned.
7. Invitation redemption is one `SECURITY DEFINER` transaction callable only by `service_role`; it accepts a server-generated 64-character lowercase hexadecimal token hash, reads the authoritative confirmed Auth email, rejects mixed principals, locks the invitation, enforces email and lead consistency, activates or creates the profile, and marks the invitation accepted.
8. Invitation redemption returns the same generic `Invitation unavailable.` error for invalid, expired, mismatched, mixed-principal, suspended, or otherwise unusable invitations to reduce enumeration and account-disclosure risk.
9. Function search paths are fixed to `pg_catalog`; referenced non-catalog objects are schema-qualified.
10. Anonymous and `PUBLIC` table privileges remain revoked. RLS continues to be the row boundary for the limited authenticated column grants.

### RLS policies removed or changed

The applied migration removed these business-management policies from the Customer Portal tables:

- `customer_profiles_business_manage`
- `customer_portal_invitations_business_manage`
- `customer_portal_branding_business_manage`
- `customer_portal_appointments_business_manage`
- `customer_portal_messages_business_manage`
- `customer_portal_documents_business_manage`
- `customer_portal_document_ack_business_manage`
- `customer_portal_requests_business_manage`

The applied migration recreated these customer policies against the hardened predicates:

- `customer_profiles_customer_select`
- `customer_profiles_customer_update`
- `customer_portal_branding_customer_select`
- `customer_portal_document_ack_customer_select`
- `customer_portal_document_ack_customer_insert`

The existing customer policies on appointments, messages, documents, and requests remain in place and inherit the tightened global identity check through `is_current_portal_customer`.

### Database functions introduced or changed

- **Changed:** `public.is_current_portal_customer(uuid, uuid)` remains a `STABLE`, SQL-language, `SECURITY DEFINER` predicate with `search_path = pg_catalog`. It now also returns false when `auth.uid()` is any business member or business owner. Execute is revoked from `PUBLIC`, `anon`, and `service_role`, then granted only to `authenticated`, because authenticated RLS policies invoke it.
- **Introduced:** `public.is_current_portal_document(uuid, uuid, uuid)` is a `STABLE`, SQL-language, `SECURITY DEFINER` predicate with `search_path = pg_catalog`. It requires a non-revoked document bound to the same profile/business and delegates caller validation to `is_current_portal_customer`. Execute is granted only to `authenticated` for acknowledgement RLS.
- **Introduced:** `public.set_customer_profile_updated_at()` is a `VOLATILE`, `SECURITY INVOKER` trigger function with `search_path = pg_catalog`. Direct execute is revoked from all browser/API roles; the trigger invokes it to assign the server timestamp.
- **Introduced:** `public.redeem_customer_portal_invitation(text, uuid)` is a `VOLATILE`, PL/pgSQL, `SECURITY DEFINER` function with `search_path = pg_catalog`. Execute is revoked from all roles and regranted only to `service_role` for a trusted server workflow.

`STABLE` is appropriate for the two read-only authorization helpers because their results are intended to remain constant within one statement. `VOLATILE` is required for the trigger and redemption functions because they write data or use statement-time effects.

### Applied privilege design — verification Pending

- Revoke all table privileges on all eight portal tables from `PUBLIC`, `anon`, and `authenticated`.
- Dynamically revoke every existing column privilege on those tables from `PUBLIC`, `anon`, and `authenticated` before applying the new allowlist.
- Grant authenticated profile `SELECT` only on customer-visible identity/contact/preferences fields and `updated_at`; grant `UPDATE` only on editable name, email, phone, language, communication, address, and notification fields.
- Grant authenticated branding `SELECT` only on customer-visible branding and contact fields.
- Grant authenticated appointment `SELECT` only on customer-visible schedule, service, location, meeting, reschedule, cancellation, notes, and status fields.
- Grant authenticated message `SELECT` on customer-visible message fields and `INSERT` only on tenant/profile identifiers, sender type, body, and support-request flag.
- Grant authenticated document `SELECT` only on public metadata; storage bucket/path, internal object identifiers, revocation state, and audit fields are excluded.
- Grant authenticated acknowledgement `SELECT` on document/profile/business and server time, and `INSERT` only on document/profile/business.
- Grant authenticated request `SELECT` on customer-visible request fields and server timestamps, and `INSERT` only on tenant/profile identifiers, request type, subject, and customer-visible detail.
- Grant no authenticated or anonymous access to invitations.
- Grant function execute exactly as recorded above; invitation redemption is `service_role` only.

### Risks before approval

1. The migration and verifier require human line-by-line review. No approval, execution, or verification result may be inferred from file creation.
2. The portal dataset was empty during the recorded July 13 pre-hardening inspection, so that inspection demonstrated no real tenant, mixed-principal, revoked-document, invitation, profile-update, message, request, appointment, or download behavior. It does not establish the current row count.
3. Global identity separation is intentionally strict and may reject a person who currently reuses one Auth identity for internal and customer roles. Such users require separate Auth identities and a documented support path.
4. The migration assumes the zero-row preflight remains representative until execution. New incompatible rows will cause checked constraints or redemption invariants to fail the transaction and must be reviewed, not bypassed.
5. The service-role redemption caller is not yet implemented or tested. It must hash a high-entropy token before the RPC, derive the target Auth user from a trusted server context, rate-limit attempts, avoid logging raw tokens, and never expose the RPC to a browser.
6. No rate limiter exists. Login, reset, invitation redemption, support, message, and request abuse controls remain Pending.
7. The application has no `/portal/register`, `/portal/dashboard`, or dedicated auth callback route. Portal route protection is client-gated, while RLS remains the actual data boundary.
8. The local workspace has no `CUSTOMER_PORTAL_DOCUMENT_BUCKETS`; the download route fails closed with `503` after auth checks locally. Production configuration, storage policies, valid and invalid path behavior, revocation, and tenant-isolated downloads remain unverified.
9. The applied column grants intentionally make several current application calls incompatible. The client must remove filters on hidden profile `status`, message `is_customer_visible`, and document `revoked_at` columns, rely on RLS for those row predicates, stop sending message `is_customer_visible`, profile `updated_at`, and request `status` so trusted defaults apply, and refactor document download authorization. The download route must first establish the exact caller-visible document/profile/business tuple using safe columns, then perform an exact trusted-server reread for storage metadata and revocation immediately before signing. Until this alignment is implemented and validated, the current message, document, profile, request, and download calls may fail.
10. No portal-specific automated tests or test script exist, and no browser QA was completed in this validation run.
11. The default production build could not start because an active unidentified Node process held `.next-build-stable/trace`; no process was terminated. This is unresolved operational evidence, not a database result.

### Verification and approval sequence

1. Human security review and approval occurred; approver identity and approval date remain Pending because they were not supplied.
2. The user explicitly confirmed that the migration executed successfully. Execution date remains Pending.
3. Do not rerun, replace, delete, or modify the applied migration.
4. The corrected read-only verification file is ready for manual execution but has not yet completed successfully. Verification result, verification date, and raw output remain Pending.
5. Align and validate every affected message, document, profile, request, and download call.
6. Approved fixtures representing at least two businesses, multiple customers, a mixed-principal case, revoked and active documents, invitation states, and representative writes must then be used for behavioral RLS and storage tests.
7. Customer Portal production readiness remains blocked until application alignment and behavioral evidence succeed.

### Validation evidence recorded before approval

- `npm.cmd run lint` passed on 2026-07-13. PowerShell blocked `npm.ps1`, so the command shim was used.
- `npm.cmd run build` failed immediately with `EPERM` while opening `.next-build-stable/trace`. An exclusive-open check was also blocked. The trace was last written `2026-07-11T14:43:29-04:00`; multiple Node processes were active, but command-line and ownership inspection was unavailable and none was terminated.
- No portal test files or portal automated test script were present.
- No browser QA was completed in this validation run.
- No SQL was executed as part of this review.

### Read-only verifier coverage

The corrected verification file contains 16 read-only sections covering:

1. existence, ownership, and RLS state for all eight portal relations;
2. the deployed portal-column inventory;
3. absence of table-level browser/API privileges for `anon` and `authenticated`;
4. the exact authenticated `SELECT`, `INSERT`, and `UPDATE` column allowlists;
5. absence of anonymous column privileges;
6. direct table and column ACL expansion, including `PUBLIC`;
7. inherited roles and default privileges that could restore broad access;
8. the exact customer-policy inventory and absence of `_business_manage` policies;
9. function existence, owner, definer/invoker mode, volatility, locked search path, definitions, effective execute access, and direct `PUBLIC` grants;
10. the profile timestamp trigger and business-owner lookup index;
11. existence, validation state, and definitions for all twelve new constraints;
12. global mixed workspace/customer principal counts;
13. cross-business profile/document tuple-orphan counts;
14. revoked-document acknowledgement and invitation-anomaly counts;
15. profile and request shape conflicts; and
16. Storage bucket inventory for manual comparison with the private-bucket requirement and `CUSTOMER_PORTAL_DOCUMENT_BUCKETS`.

The corrected verifier has not yet completed successfully. Successful execution, raw output, and query-by-query findings remain Pending. The verifier does not prove browser route behavior, rate limiting, application configuration, signed-download behavior, or storage-object policies.

### Rollback and recovery considerations

- The applied migration was transactional, and the user reported successful execution.
- The migration is immutable history and must not be rerun. Any future database correction requires a new inspected, versioned migration and matching verifier.
- No reverse migration exists. After commit, recovery must use a separately inspected, versioned, approved migration and verifier; do not restore broad grants or business-management policies ad hoc.
- If later behavioral or production testing reveals a database defect, stop production progression, record the exact evidence, contain affected access, and prepare a new corrective migration through the mandatory workflow.

### Related documentation

- `docs/CHANGELOG.md`
- `docs/PROJECT_HISTORY.md`
- `docs/PRODUCT_FACT_SHEET.md`
- `docs/sprints/CUSTOMER_PORTAL_PRODUCTION_VALIDATION.md`
- `docs/decisions/ADR-0002-customer-portal-identity-and-isolation.md`
- `docs/manual/04-user-journey.md`
- `docs/manual/19-security-and-multi-tenancy.md`
- `docs/manual/21-troubleshooting.md`
- `docs/customer/getting-started.md`
- `docs/customer/onboarding-guide.md`
- `docs/customer/troubleshooting.md`
- `docs/customer/faq.md`
- `docs/technical/authentication.md`
- `docs/technical/multi-tenancy.md`
- `docs/technical/testing.md`
- `docs/technical/api.md`
- `docs/technical/database.md`
- `docs/technical/deployment.md`
- `docs/technical/known-risks.md`
- `docs/investor/technical-moat.md`
- `docs/investor/risks-and-mitigations.md`

### Next authorized step

The database hardening migration is Applied and immutable; verification is Pending. Do not rerun or alter the applied migration. The next authorized step is to run only the corrected read-only verifier and record its complete result. Representative behavioral RLS, direct REST, storage, session, and route validation may follow only after successful verification. Production readiness remains unconfirmed until those risks are closed.

### July 14 authentication-validation clarification

A credential-free authentication preflight found no approved test identity, credential reference, controlled recovery mailbox, or authenticated browser session available to the validation. This does not establish the current live row count and does not change the database lifecycle: the hardening migration remains **Applied**, immutable, and must not be repeated; verification remains **Pending**. No SQL, migration, identity, invitation, profile, tenant, or customer data was created or modified. Corrected verification must succeed and be recorded before an approved operator provisions synthetic fixtures for behavioral testing.

### Synthetic identity planning record — no database status change

The corrected verifier has been approved and is ready for manual execution, but verification remains **Pending** until successful execution and recorded results. [Customer Portal Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md) now defines two fictional `.test` tenants, eight Auth users, seven profiles, seven invitations, the 15-scenario matrix, secret handling, session revocation, dependency-safe cleanup, and final read-only cleanup checks.

The plan is not a database change and creates no authorization to bypass the current gate. No identity, credential, UUID, tenant, invitation, profile, or customer row was created. Provisioning requires verifier success plus separate human approval of the non-production environment, operator, mail sink, secret channel, test window, evidence policy, and cleanup owner. Authentication remains not production-ready.

## Customer Portal V1 foundation

- **Change title:** Customer Portal V1 foundation
- **Platform layer:** Customer Portal
- **Migration file:** `supabase/migrations/20260713120000_customer_portal_v1_foundation.sql`
- **Verification file:** `supabase/verification/customer_portal_v1_foundation_verify.sql`
- **Purpose:** Establish a dedicated authenticated-customer identity and tenant-isolated persistence boundary before any Customer Portal application implementation.
- **Business problem:** Business-member authentication cannot safely identify end customers; CRM conversations do not separate internal and customer-visible concerns; appointments are stored on leads; and Knowledge Center documents have no explicit customer-sharing boundary.
- **Repository schema findings:** Existing repository evidence covers businesses, `auth.users`, leads, business ownership/membership, Calendly fields, conversations, documents, and tenant policies. It does not provide a portal customer identity linked to both an auth user and a business.
- **Live schema inspected:** Pending — the user confirmed that the migration was manually applied and verified, but detailed pre-execution live-schema and effective-privilege inspection evidence was not supplied or recorded.
- **Security review:** The identity and tenant-isolation design was reviewed before approval, and the user subsequently confirmed successful application and verification. Detailed deployed ownership, ACL, schema-drift, helper-dependency, behavioral-RLS, storage, and query-output evidence remains Pending.
- **Approval status:** Verified
- **Required approval authority:** The JOHAI project owner or an explicitly authorized human database approver.
- **Approved by:** Pending
- **Approval date:** Pending
- **Execution status:** Applied
- **Execution date:** Pending
- **Verification status:** Verified
- **Verification result:** Successful per explicit user confirmation. Raw verifier output and query-by-query findings remain Pending because they were not supplied.
- **Errors and corrections:** No execution or verification error was reported. Exact errors, resolutions, and SQL corrections remain Pending because no execution log or verifier output was supplied. The documentation record was advanced from Approved for manual execution to Applied and Verified after the user's explicit confirmation.
- **Related sprint:** `docs/sprints/CUSTOMER_PORTAL_V1.md`
- **Decision record:** `docs/decisions/ADR-0002-customer-portal-identity-and-isolation.md`

### Applied schema

The applied migration defines eight tables:

1. `customer_profiles`
2. `customer_portal_invitations`
3. `customer_portal_branding`
4. `customer_portal_appointments`
5. `customer_portal_messages`
6. `customer_portal_documents`
7. `customer_portal_document_acknowledgements`
8. `customer_portal_requests`

Customer-owned records carry `customer_profile_id` and `business_id`. Composite foreign keys bind appointments, messages, documents, requests, and document acknowledgements to the same customer/business pair. Profile and invitation lead references also preserve the lead/business pair. Status, sender, body-length, and document-type checks constrain accepted values.

The indexes cover profile business lookup, invitation business/email lookup, appointment ordering, message ordering, active shared-document lookup, and request status ordering.

### Security rules

- RLS is enabled on all eight proposed tables.
- Portal customers are separate from business workspace members.
- Customer access requires an authenticated user linked to an active customer profile for the same business.
- Customer-visible messages require `is_customer_visible = true`.
- Customer-visible documents require `revoked_at is null`.
- Customer message inserts require `sender_type = 'customer'` and customer visibility.
- Customer request inserts require `status = 'open'`.
- Registration linkage and document delivery remain server-controlled.
- Business-side management uses `public.user_owns_business(business_id)`.
- Browser-supplied tenant identifiers are never sufficient without the auth/profile/business match.

### RLS policies introduced

- `customer_profiles_customer_select` — active users may select their own profile.
- `customer_profiles_customer_update` — active users may update their own profile, subject to column privileges.
- `customer_profiles_business_manage` — authorized business users may manage profiles.
- `customer_portal_invitations_business_manage` — authorized business users satisfy the RLS management condition; table privileges remain server-controlled.
- `customer_portal_branding_customer_select` — an active customer may read branding for the linked business.
- `customer_portal_branding_business_manage` — authorized business users may manage branding.
- `customer_portal_appointments_customer_select` — a customer may read appointments for the matching profile/business pair.
- `customer_portal_appointments_business_manage` — authorized business users may manage appointments.
- `customer_portal_messages_customer_select` — a customer may read matching customer-visible messages.
- `customer_portal_messages_customer_insert` — a customer may create a matching customer-visible message as sender type `customer`.
- `customer_portal_messages_business_manage` — authorized business users may manage messages.
- `customer_portal_documents_customer_select` — a customer may read matching, non-revoked document metadata.
- `customer_portal_documents_business_manage` — authorized business users may manage document metadata.
- `customer_portal_document_ack_customer_select` — a customer may read acknowledgements for the matching profile/business pair.
- `customer_portal_document_ack_customer_insert` — a customer may add an acknowledgement for the matching profile/business pair; the composite foreign key binds it to the same document.
- `customer_portal_document_ack_business_manage` — authorized business users may manage acknowledgements.
- `customer_portal_requests_customer_select` — a customer may read requests for the matching profile/business pair.
- `customer_portal_requests_customer_insert` — a customer may create an open request for the matching profile/business pair.
- `customer_portal_requests_business_manage` — authorized business users may manage requests.

### Database function introduced

`public.is_current_portal_customer(uuid, uuid)` is a `STABLE`, SQL-language, `SECURITY DEFINER` boolean helper. It locks `search_path` to `pg_catalog`, uses fully qualified references, and returns true only when the supplied customer profile and business identify an active profile whose `auth_user_id` equals `auth.uid()`.

The helper intentionally performs its narrow lookup with owner privileges so customer-facing RLS policies do not recurse through `customer_profiles`. The predicate binds both supplied UUIDs to the caller and returns the same false result for nonexistent, inactive, other-customer, and other-business pairs; the reviewed body therefore does not expose cross-business record details or provide a practical customer-ID enumeration oracle. `STABLE` is appropriate because it is read-only and its database/auth result is expected to remain stable within one statement.

Authenticated execution is required because authenticated RLS policies invoke the helper. The explicit `service_role` grant is not required by those policies and should remain only if a documented server workflow calls the function directly. These conclusions depend on the deployed function body, owner, configuration, and ACL matching the reviewed migration.

### Privileges granted and revoked

- Function execution is revoked from `PUBLIC` and `anon`, then granted to `authenticated` and `service_role`.
- All invitation-table privileges are revoked from `anon` and `authenticated`.
- All profile-table privileges are revoked from `anon`; profile insert and delete are revoked from `authenticated`; authenticated receives select and column-scoped update for personal profile fields.
- All document-table privileges are revoked from `anon`; document insert, update, and delete are revoked from `authenticated`; authenticated receives select.
- All appointment-table privileges are revoked from `anon`; appointment insert, update, and delete are revoked from `authenticated`; authenticated receives select.
- Authenticated receives select on branding and select/insert on messages, document acknowledgements, and requests. RLS provides the row boundary for those operations.

### Risks identified before execution

1. Live schema and effective privileges are unverified. The migration must be compared with the deployed schema before manual execution.
2. The migration grants column-scoped profile updates but does not explicitly revoke a pre-existing table-level `UPDATE` privilege. If such a live grant exists, the column restriction would not narrow it and a customer could potentially alter tenant-sensitive fields. Inspect effective table, column, inherited, and default privileges before execution.
3. Existing `TRUNCATE` or other broad privileges would not be constrained by RLS. The supplied verifier does not inspect table, column, inherited, or default ACLs.
4. Anon privileges are not explicitly revoked for branding, messages, acknowledgements, and requests. RLS has no anon policies and should deny rows, but effective grants and default privileges still require least-privilege review.
5. `IF NOT EXISTS` and `CREATE OR REPLACE` can preserve unexpected live definitions, owners, ACLs, or policies. Exact deployed objects must be compared with the proposal.
6. Business management policies depend on the existing `public.user_owns_business(uuid)` function. Its deployed owner, body, path locking, privileges, and behavior must be verified.
7. A customer can supply `acknowledged_at` and can acknowledge a matching document record even after its metadata is revoked if the document ID is known. Acknowledgement timestamps are therefore not trusted audit evidence under the current proposal.
8. Client inserts can supply timestamps and identifiers on messages and requests unless future API or database controls constrain them. This is an integrity risk, not a demonstrated tenant-isolation bypass.
9. The verifier inventories metadata and orphan relationships but does not behaviorally test cross-tenant RLS, unexpected grants, function ownership/volatility, or Supabase Storage policies.
10. RLS is enabled but not forced. Table owners, `service_role`, and roles with `BYPASSRLS` can bypass it as part of their elevated authority.
11. Invitation redemption, rate limiting, session handling, signed document URLs, storage policies, Calendly synchronization, safe AI message generation, retention, and end-to-end tenant tests are not implemented by this migration.

### Review corrections

Documentation status was first corrected from `Proposed` or `blocked by approval` to `Approved for manual execution`, and is now advanced to `Applied` and `Verified` from the user's explicit confirmation. No migration correction, execution error, or verification correction was reported. Raw evidence and any unreported errors or corrections remain Pending; this documentation update does not modify SQL.

### Verification plan and success criteria

The read-only verification file must be run manually after the migration. Success requires:

- all eight tables exist with RLS active;
- the expected policies, indexes, and constraints are present and validated;
- `is_current_portal_customer(uuid,uuid)` is `SECURITY DEFINER` with the reviewed function configuration;
- `anon` cannot execute the helper, while intended roles have only the approved execution access;
- no customer profile points to a missing auth user or business;
- no profile/lead link crosses businesses; and
- no appointment, message, document, or request is orphaned from its customer/business profile pair.

The user explicitly confirmed that the migration was applied and verification succeeded, so the lifecycle status is Verified. Raw output and query-by-query results were not supplied and remain Pending. The supplied verifier does not itself cover effective ACLs, function owner and volatility, unexpected policies/grants, behavioral cross-tenant denial, or storage access; those evidence gaps remain production-readiness risks and should be closed with separate read-only records.

### Rollback and recovery considerations

- The migration is wrapped in one transaction; a failure before `commit` should roll back its changes.
- Before execution, preserve a current backup or recovery point and test against a representative environment.
- No reverse migration exists. Because `IF NOT EXISTS` can reuse pre-existing objects, a generic drop rollback is unsafe.
- After commit, do not drop portal objects ad hoc. Inspect dependencies and data, then create a separate reviewed, versioned recovery migration with its own read-only verifier and approval record.
- If verification fails, stop Customer Portal implementation, record the exact output, restrict affected access if necessary, and prepare a corrective migration. Do not mark the change Verified.

### Related documentation

- `docs/CHANGELOG.md`
- `docs/PROJECT_HISTORY.md`
- `docs/PRODUCT_FACT_SHEET.md`
- `docs/sprints/CUSTOMER_PORTAL_V1.md`
- `docs/technical/database.md`
- `docs/technical/known-risks.md`
- `docs/technical/platform-architecture.md`
- `docs/manual/19-security-and-multi-tenancy.md`
- `docs/customer/getting-started.md`
- `docs/investor/executive-summary.md`

### Next authorized step

Customer Portal V1 application implementation was authorized and is now recorded as implemented in the repository against the approved schema. Its historical next step of production provisioning is superseded by the later production-hardening gate: run and record only the corrected read-only hardening verifier before any approved synthetic fixture provisioning or behavioral authentication/tenant validation. The portal must continue to expose only customer-facing records and preserve the authenticated profile/business RLS boundary; CRM internals, Business Brain, Knowledge Center data, AI orchestration, internal notes, billing, the Executive Dashboard, and other tenants remain forbidden. Any new database requirement must stop the affected work and follow the complete inspected, versioned migration, read-only verification, human approval, manual execution, and recorded verification workflow.
