# ADR-0002: Customer Portal Identity and Isolation

## Status

Accepted for the existing foundation and repository implementation. The production security-hardening amendment described below is **Applied; verification Pending**. The applied migration must not be rerun.

## Context

The initial schema audit found that business-member authentication cannot be reused safely for a business's end customers, CRM conversations mix internal and customer-visible concerns, appointment fields on leads are not a customer appointment boundary, and Knowledge Center documents do not identify what was explicitly shared with a customer.

The Customer Portal is a separate JOHAI platform layer. It must let a business's authenticated customer access only that customer's records for one business without exposing the Business Workspace, CRM-wide data, internal notes, Knowledge Center content, AI reasoning, audits, billing administration, or another tenant.

Detailed live Supabase schema-inspection, effective-privilege, and raw verifier output have not been supplied for this approval record and remain Pending evidence. The repository migration history and application model were reviewed when the proposal was prepared, and the user later confirmed that the approved migration was applied and verified successfully.

## Decision

Use Supabase Auth for portal sessions while keeping portal customers separate from `business_members`. Link `auth.users`, `customer_profiles`, and `businesses` through server-controlled identity setup. Every customer-owned portal relation carries both `customer_profile_id` and `business_id`, with composite foreign keys preserving that pair.

Use RLS for the portal boundary. Customer policies bind `auth.uid()` to an active customer profile and the same `business_id`; business-side policies continue to use business ownership. A narrowly scoped `SECURITY DEFINER` helper performs the customer/profile/business check with `search_path` locked to `pg_catalog` and fully qualified object references.

The applied database change is `supabase/migrations/20260713120000_customer_portal_v1_foundation.sql`. Its read-only verifier is `supabase/verification/customer_portal_v1_foundation_verify.sql`. The user explicitly confirmed application and successful verification, then authorized the customer-facing implementation. Approver identity, approval date, execution date, raw verification output, query-by-query findings, and unreported errors remain Pending rather than inferred.

The application uses a dedicated `/portal/*` route family, a PKCE Supabase customer session, an active RLS-visible profile gate, explicit profile/business selection for a customer linked to multiple businesses, and a safe-column data layer. It may expose only the portal dashboard, appointments, customer-visible messages, current shared documents and acknowledgements, editable customer profile fields, and support requests. It must not expose CRM internals, Business Brain, Knowledge Center data, AI orchestration, internal notes, billing, the Executive Dashboard, or another tenant.

## Consequences

- Portal identity, data, and routes remain separate from the Business Workspace.
- Customer-visible branding, appointments, messages, documents, acknowledgements, and requests have an Applied and user-confirmed Verified **foundation-migration** boundary. The later production hardening remains verification Pending.
- Portal routes now implement customer login and password recovery, dashboard, appointments, messages, documents, profile, and support. Public signup and invitation redemption are not implemented.
- Document delivery uses a bearer-authorized server route, an explicit `CUSTOMER_PORTAL_DOCUMENT_BUCKETS` allowlist, a canonical business/profile storage path, and a short-lived signed URL. Correct bucket/path configuration remains an operational requirement.
- Rate limiting, production end-to-end tenant tests, invitation provisioning, provider synchronization, and stronger audit-integrity controls remain application or operational responsibilities.
- Detailed evidence for effective table privileges and the deployed `user_owns_business` dependency remains absent from the documentation record despite the user's successful-verification confirmation.
- An error before the migration transaction commits should roll back the transaction. After commit, recovery must use a reviewed, versioned follow-up migration; destructive ad hoc table removal is not an approved rollback.
- The ADR records the user's explicit Applied and Verified confirmation for the foundation migration and the repository implementation. The production-hardening verifier remains Pending. The ADR does not claim production deployment, commercial availability, raw verifier evidence, or successful production end-to-end tenant testing.

## Production security-hardening amendment — Applied; verification Pending

The July 13 pre-hardening read-only PostgREST inspection found unnecessary anonymous API privilege on four portal tables and authenticated table-wide grants beyond the application's safe-column/write contract. All portal tables were empty during that recorded inspection, so it provided no behavioral tenant evidence and does not establish the current row count.

The applied amendment adopts **global identity separation**: a Supabase Auth identity used for any portal customer profile must not also be a JOHAI business owner or business member anywhere. Mixed principals are denied rather than conditionally accepted per tenant. Deployed confirmation remains Pending until the corrected verifier completes successfully.

This choice reduces cross-surface session confusion and confused-deputy risk, but a person who needs both roles must use distinct Auth identities and manage separate credentials/recovery. The user confirmed successful execution of `supabase/migrations/20260713190000_customer_portal_production_security_hardening.sql`; it is immutable history and must not be modified or executed again. The read-only verifier remains Pending after correction of a wrong acknowledgement-table name and PostgreSQL error `42883` caused by an incompatible ACL `coalesce(aclitem[], aclitem[])` expression. The exact next step is to run only the corrected verifier and record its complete result; the amendment is not Verified or production-ready.

## Synthetic behavioral-validation consequence

The accepted identity decision is now accompanied by [Customer Portal Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md). It defines two reserved-domain synthetic tenants, two owner-only identities, five Tenant A customers, one Tenant B customer, and one A5 Auth identity with active profiles in both tenants. A3 remains suspended and A4 remains invited/unaccepted. This operational plan implements the existing architecture decision; it does not change the schema or authorize provisioning.

Provisioning remains human-gated after successful corrected verification, uses server-only authority and private secret delivery, and includes complete session/data/Auth cleanup. No identity, UUID, credential, token, tenant, profile, or invitation was created. Authentication remains not production-ready until behavioral evidence and cleanup are recorded and approved.
