# Deployment and Operations

The Next.js application builds to `.next-build-stable` by default and can be deployed with its required environment variables. Operations still need formal monitoring, structured logging, backups, job management, and incident procedures.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Database change operation

Every database change requires a recorded live-schema inspection, a versioned migration, a matching read-only verifier, explicit human approval, manual Supabase execution, successful verification, and recorded results. Approval alone does not mean the change is applied or complete.

For the Customer Portal V1 foundation, the user explicitly confirmed manual application and successful verification, and authorized implementation. Approver identity, approval and execution dates, detailed schema/privilege evidence, raw verifier output, query findings, and unreported errors remain Pending; do not invent them. Any future corrective database change still requires a separately inspected, versioned, approved, manually applied, and verified migration rather than ad hoc SQL.

Portal operation requires valid public Supabase URL/anon configuration. Signed document delivery additionally requires the server service-role key, an explicit comma-separated `CUSTOMER_PORTAL_DOCUMENT_BUCKETS` allowlist, private objects stored below the canonical `business_id/customer_profile_id/` prefix, and an HTTPS deployment origin for password-reset redirects. Public invitation redemption and automated customer provisioning are not present.

## Synthetic identity operations

The scope authority is [Customer Portal Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md). The executable documentation package is [Synthetic Environment Setup](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md), [Synthetic Environment Checklist](../testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md), [Authentication Test Procedures](../testing/AUTH_TEST_PROCEDURES.md), and [Test Data Matrix](../testing/TEST_DATA_MATRIX.md). The latest certification review removed the earlier hardening-verification blocker, but the package remains inactive until a human approves an isolated non-production environment, package revision, eight fictional Auth aliases, two tenant records, seven profiles, seven invitations, private `.test` mail sink, secret-delivery system, trusted provisioning/admin paths, session-revocation method, test window, evidence policy, and cleanup ownership.

Provision through the Supabase Admin surface or a trusted server only. The service-role key, token material, UUIDs, passwords, and recovery links never enter browser code or evidence. After the test, revoke sessions first, remove dependent portal/storage fixtures, remove profiles/invitations/branding/business links, remove Auth users last, purge mail/vault contents, clear both auth storage keys and browser profiles, then record read-only cleanup verification.

If there is no approved operator path for A3 suspension, A4 invited-profile creation, or dependency-safe cleanup, stop. Do not use ad hoc SQL and do not rerun the Applied migration. The plan is not deployment authorization or production-readiness evidence.

Final certification reran `npm run lint`, all 16 `npm run test:portal` checks, and the canonical `npm run build` successfully. The build passed TypeScript and generated all 43 pages/routes. The earlier output-lock incident remains historical; the final canonical build did not require an alternate output directory. Compilation still does not prove production authentication, Storage configuration, RLS behavior, or deployment readiness.

## Final certification deployment gate

Customer Portal V1's last recomputed score is **71/100**, certification **FAILED**, and Production Ready is **NO**. Local responsive checks and browser logs passed, but approved identities, behavioral tenant/Storage evidence, full assistive-technology evidence, production performance, rate limiting, monitoring, and operational support lifecycle remain incomplete.

Do not deploy or enable customer access as a certified V1 release from this record. Obtain separate fixture approval through the checklist, execute the complete non-production validation matrix, remove and independently verify cleanup of the fixtures, and rerun certification. The Applied migration is immutable and must not be executed again. No SQL was executed while preparing the package.
