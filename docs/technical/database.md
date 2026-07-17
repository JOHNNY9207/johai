# Database

## Knowledge Center V2 migration

`20260710200000_knowledge_center_v2.sql` adds processing timestamps, duration, error, attempts, archive state, source metadata, active/previous version fields, chunk character/source/section/page references, and a unique `(knowledge_file_id, chunk_index)` index. It extends file and learning statuses and restricts the search RPC to the service role.

Document versions reuse one `knowledge_item_id`. `version_number` orders the lineage, `is_active_version` determines which Ready source may participate in retrieval, and `previous_version_id` links a replacement to its direct predecessor. Replacement request identifiers are stored in `source_metadata` for best-effort request replay detection. The schema does not currently enforce a unique version number per lineage or exactly one active version; runtime guards reduce but cannot eliminate distributed races.

The July 11 versioning sprint did not add or run another migration. It uses the verified Knowledge Center V2 columns as deployed.

The processing-reliability sprint also made no schema change. Existing `source_metadata` stores `processing_attempt_id`, `processing_request_id`, `last_completed_processing_request_id`, `last_failed_processing_request_id`, parser/warning evidence, and `{ code, recoverable }` failure classification. Authoritative success/failure updates require the row to remain Processing and contain the same attempt token. `processing_attempts` and `last_processing_attempt_at` are updated only by the request that successfully claims the row.

The existing `(knowledge_file_id, chunk_index)` unique index prevents duplicate positions and the file foreign key cascades chunk deletion. Strict crash-atomic delete/insert still requires a database transaction. Strict one-active-version and unique version-number guarantees also require database constraints and a transaction-backed activation function; no such SQL was created automatically.

The migration-driven Supabase model covers businesses, settings, leads, knowledge, processing, orchestration, Business Brain, and audits. Review `supabase/migrations` and existing `docs/Database.md` for historical detail.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Transaction-hardening proposal (not applied)

The 2026-07-12 proposal adds unique indexes on `(knowledge_item_id, version_number)` and active `knowledge_item_id`, plus service-role-only activation and chunk-replacement functions. It stops on legacy conflicts without changing rows. Its verifier is read-only. Neither SQL file has been run.

## Customer Portal V1 foundation — applied and verified

- **Migration:** `supabase/migrations/20260713120000_customer_portal_v1_foundation.sql`
- **Read-only verification:** `supabase/verification/customer_portal_v1_foundation_verify.sql`
- **Approval:** Verified
- **Execution:** Applied
- **Verification:** Verified by explicit user confirmation; raw output and query findings Pending
- **Authoritative record:** [Database Change Log](../approvals/DATABASE_CHANGE_LOG.md)

The change addresses four initial schema-audit findings: business-member authentication does not identify an end customer safely, CRM conversations mix internal and customer-visible concerns, appointments are represented on leads rather than customer-scoped records, and Knowledge Center documents have no explicit customer-sharing boundary. The user explicitly confirmed manual application and successful verification. Approver identity, approval and execution dates, detailed live schema/owner/policy/function/privilege/storage evidence, raw verifier output, and unreported errors remain Pending.

### Applied schema boundary

The migration defines `customer_profiles`, `customer_portal_invitations`, `customer_portal_branding`, `customer_portal_appointments`, `customer_portal_messages`, `customer_portal_documents`, `customer_portal_document_acknowledgements`, and `customer_portal_requests`.

Profiles link `auth.users` to one business without making the customer a workspace member. Customer-owned rows carry both `customer_profile_id` and `business_id`; composite foreign keys preserve that pair. Profile/invitation links to leads also preserve the lead/business pair. Checks constrain profile, appointment, sender, body-length, document-type, and request status values. Six indexes support business/profile lookup and ordered appointment, message, active-document, and request access.

### Applied RLS inventory

RLS is enabled on all eight tables. Nineteen permissive policies define the approved access model:

- Profile customer select/update and business manage
- Invitation business manage
- Branding customer select and business manage
- Appointment customer select and business manage
- Message customer select, customer insert, and business manage
- Document customer select and business manage
- Document-acknowledgement customer select, customer insert, and business manage
- Request customer select, customer insert, and business manage

Customer policies require the caller's active auth/profile/business match. Messages add customer-visibility checks, documents exclude revoked rows, customer messages must identify the sender as the customer, and customer requests must start open. Business policies depend on `public.user_owns_business(uuid)`. Exact policy names and predicates are recorded in the database change log.

### Authorization helper review

`public.is_current_portal_customer(uuid, uuid)` is a SQL, `STABLE`, `SECURITY DEFINER` boolean helper with `search_path = pg_catalog`. Its non-catalog objects are fully qualified. It returns true only when the supplied profile and business identify an active profile whose `auth_user_id` is `auth.uid()`.

The owner-privileged lookup intentionally avoids recursive profile RLS, but its narrow caller/profile/business predicate prevents ordinary authenticated calls from obtaining another tenant's rows. Nonexistent, inactive, other-customer, and other-business pairs all return false, so the reviewed body does not provide a practical customer-ID enumeration channel. `STABLE` is appropriate for the read-only statement-scoped lookup.

Authenticated execution is necessary because authenticated RLS policies call the helper. The `service_role` grant is not required by those policies and still needs a documented direct caller if retained. The user confirmed verification, but detailed evidence for the deployed function owner, body, configuration, and ACL was not supplied.

### Applied privileges

The migration revokes helper execution from `PUBLIC` and `anon`, then grants it to `authenticated` and `service_role`. Invitations are server-only. Profiles are customer-readable with column-scoped personal-field updates; customer insert/delete is revoked. Appointments and documents are customer-readable but customer mutation is revoked. Authenticated users receive select on branding and select/insert on messages, acknowledgements, and requests, with RLS enforcing row scope.

The application selects and updates only approved customer columns, but UI column selection does not narrow deployed privileges for direct REST calls. A surviving table-level profile `UPDATE` grant could override the intended column restriction, and `TRUNCATE` is outside RLS. Detailed table, column, inherited, default, and unexpected-privilege evidence was not supplied with the verification confirmation and remains a production-security gap.

### Verification and recovery gate

The supplied verifier inventories RLS, policy definitions, indexes, constraints, helper configuration, helper execute privileges, missing auth/business parents, cross-business lead links, and orphan portal rows. The user explicitly confirmed successful verification, but raw output and query-level findings were not supplied. The file does not itself prove behavioral cross-tenant denial, effective table/column/default ACLs, function ownership/volatility, absence of unexpected policies/grants, or Supabase Storage isolation; those require separate evidence before production readiness is claimed.

The migration is transactional, so errors before `commit` should roll back. No reverse migration exists. After commit, recovery requires dependency and data inspection followed by a separately reviewed, versioned corrective migration or backup restoration. A generic drop script is unsafe because `IF NOT EXISTS` may reuse pre-existing objects.

Customer Portal application work was authorized and is implemented against this schema. Any new database need must stop and follow the complete live inspection, versioned migration, read-only verifier, explicit human approval, manual execution, and recorded verification workflow. No SQL was modified or executed during application implementation.

## Customer Portal production security hardening — Applied; verification Pending

- **Migration:** `supabase/migrations/20260713190000_customer_portal_production_security_hardening.sql`
- **Read-only verification:** `supabase/verification/customer_portal_production_security_hardening_verify.sql`
- **Approval:** Approved before execution; approver identity and approval date Pending
- **Execution:** Applied by explicit user confirmation; execution date Pending; migration must not be repeated
- **Verification:** Earlier blocker resolved in the latest certification review; detailed raw evidence reference remains Pending
- **Related sprint:** `docs/sprints/CUSTOMER_PORTAL_PRODUCTION_VALIDATION.md`

Pre-hardening live read-only PostgREST inspection found all eight foundation tables in the API and only the existing portal-customer check RPC. Anonymous GET had API privilege on branding, messages, acknowledgements, and requests but returned no rows through RLS; the other four tables returned `401`. Authenticated table-wide grants were broader than the application's explicit columns and write shapes. The latest certification review removed the earlier hardening-verification blocker; representative post-hardening behavior remains Pending approved fixtures.

The applied change is a least-privilege and identity-separation gate intended to remove unnecessary anonymous access, replace broad authenticated access with reviewed columns or operations, prevent caller authority over server-owned identifiers/timestamps, and deny any Auth identity that is also a JOHAI business owner or member anywhere. The migration is immutable history and must not be modified, replaced, deleted, or executed again. Behavioral Auth, tenant, direct-REST, and Storage results remain Pending.

All eight portal tables contained zero rows during the pre-migration inspection, so no behavioral isolation result can be inferred. The verifier first failed because `public.customer_portal_acknowledgements` was not the deployed relation; every reference now uses `public.customer_portal_document_acknowledgements`. It then failed with PostgreSQL `42883` because `pg_catalog.coalesce(aclitem[], aclitem[])` is not a callable function; table and function ACL checks now use compatible read-only privilege inspection, and the schema label uses `CASE`. The current certification state no longer treats verification as a blocker. Approver identity, dates, raw evidence references, and every customer/tenant fixture result remain Pending documentation or test evidence. The exact next step is separate approval of the synthetic environment package, not migration repetition.

### Planned synthetic identity data shape

The approved planning record requires eight Auth users, seven `customer_profiles` rows, and seven `customer_portal_invitations` rows across two fictional tenants. Customer A5 uses one Auth UUID with two active profiles because `(auth_user_id, business_id)` is unique per business, not globally. Customer A3 has one suspended profile; A4 has one invited profile plus an unaccepted invitation; owners have no profiles or portal invitations.

Active/suspended profile invitations are accepted through the trusted service-role-only redemption path, except that A3 is suspended afterward through approved administration. A4 is never redeemed. Each invitation uses a unique lowercase SHA-256 hash and exact tenant/email/expiry; raw tokens, UUIDs, and credentials are not documentation fields. Full details are in [Customer Portal Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md), [Synthetic Environment Setup](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md), [Synthetic Environment Checklist](../testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md), and [Test Data Matrix](../testing/TEST_DATA_MATRIX.md).

This is a data-provisioning plan, not a schema change. The package is Prepared but not approved or executed. No SQL, Auth record, profile, invitation, tenant, or migration was created or changed by the package.
