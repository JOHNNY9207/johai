# Deployment

Build with `npm run build`; Next.js uses `.next-build-stable` unless `NEXT_DIST_DIR` overrides it. Production requires validated environment variables, Supabase configuration, and provider webhook secrets.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Manual database change gate

Database migrations are never applied automatically. Before manual Supabase execution, record the live schema, effective privileges, existing object definitions, and relevant storage policies in [Database Change Log](../approvals/DATABASE_CHANGE_LOG.md). Use the reviewed versioned migration file only after explicit approval.

After manual execution, run the matching read-only file from `supabase/verification/`, preserve its complete output, record pass/fail results and errors, and keep implementation blocked until verification succeeds. A failed or post-commit change requires a separately inspected, versioned, approved, and verified corrective migration or documented backup recovery; do not use an ad hoc destructive rollback.

The Customer Portal V1 foundation is recorded as Applied and Verified from explicit user confirmation. Approver identity, dates, detailed live inspection evidence, raw verification output, query findings, and unreported errors remain Pending. This exception in evidence completeness must not weaken the workflow for future changes.

Customer Portal deployment requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, the server-only `SUPABASE_SERVICE_ROLE_KEY`, and a non-empty `CUSTOMER_PORTAL_DOCUMENT_BUCKETS` allowlist for downloads. Allowed private objects must use the canonical `business_id/customer_profile_id/` path. Password-recovery redirects require the deployment origin to be allowed in Supabase Auth. No service-role key may enter a client bundle.

`npm run lint` passed. The canonical `npm run build` also passed outside the restricted sandbox. An earlier sandboxed attempt returned `EPERM` while opening `.next-build-stable/trace`, but follow-up checks found no process holding the trace; no process was terminated and `distDir` was not changed for the successful canonical build. Production deployment, environment validation, Supabase redirect configuration, storage policy validation, and end-to-end tenant tests remain Pending.

## Production-validation deployment gate — database blocker resolved; deployment evidence Pending

The latest certification review removed the earlier production-hardening verification blocker. The security-hardening migration is Applied and must not be modified, deleted, replaced, or executed again. Approved production-like fixtures, environment evidence, and route-by-route behavioral results remain Pending; resolved database verification alone does not constitute production deployment approval.

In the 2026-07-14 final certification run, lint, the 16-test `npm run test:portal` suite, and the canonical build passed; the build completed TypeScript and generated 43 pages/routes. The earlier sandbox `EPERM` result was retried with the authorized build output access and did not represent a source or TypeScript failure. Local browser QA now covers all six shared feature routes at desktop, tablet, and mobile sizes with no final console warning, but no production-availability claim follows from local demo or build evidence.

If a future build reports a possible output lock, first distinguish sandbox permission failure from a real lock. Resolve the absolute output path and prove it remains inside `C:\Projects\johai`; test exclusive access; identify any holder; and verify from its command line and working directory that it is the JOHAI Next.js process. Stop only that verified process gracefully, confirm exclusive access again, and remove only the stale generated output before retrying the configured build. If the holder or resolved path cannot be proven, stop and request operator help. Never kill unidentified Node processes, delete source, or change `distDir` as a cleanup shortcut.

The local workspace has no `CUSTOMER_PORTAL_DOCUMENT_BUCKETS` key, so secure downloads are configured to fail closed with `503` after authentication checks. This does not establish the production environment's configuration. Production bucket allowlist, storage policy, canonical path, redirect allowlist, secrets handling, successful download, monitoring, and rollback evidence remain Pending.

## Pilot demo deployment exclusion

`/portal/demo/*` is a local QA surface backed only by fictional in-memory data. Its server guard allowlists only `NODE_ENV=development` and `NODE_ENV=test`; production, staging, missing, and unexpected values fail closed with 404 before mounting the demo provider. Generated demo attachments use a separately guarded route and are not public static files. The pilot must never be used as a production fallback, seeded with real customer data, connected to Supabase, or treated as authentication/RLS evidence. Production customer routes continue to mount the dedicated portal-auth and tenant providers and the Supabase repository adapter.

## Synthetic identity deployment gate

The synthetic identity plan and operator package are documentation only. Preferred execution uses an isolated non-production Supabase project or branch with the same Applied schema. Before provisioning, approve the exact package revision, target environment, operators, test window, private `.test` SMTP sink, secret-delivery system, trusted invitation/redemption and admin paths, session-revocation method, evidence policy, and cleanup owner/deadline.

Use [Synthetic Environment Setup](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md), [Synthetic Environment Checklist](../testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md), [Authentication Test Procedures](../testing/AUTH_TEST_PROCEDURES.md), and [Test Data Matrix](../testing/TEST_DATA_MATRIX.md). The checklist must record GO before the first business is created.

Credentials must use expiring password-manager delivery and must never enter environment files committed to Git, CI logs, chat, screenshots, browser captures, or documentation. The trusted provisioning service alone may use service-role authority. After testing, revoke sessions, remove dependent fixtures and tenants, delete Auth users last, purge mail/vault material, clear browser storage, and record read-only cleanup verification. Fixture preparation and execution are not deployment approval and do not make authentication production-ready.

## Final certification deployment status

Customer Portal V1 certification is **FAILED**, last recomputed score **71/100**, Production Ready **NO**. Deployment remains gated by approved fixture provisioning, credential-backed auth and tenant tests, private Storage/signed-download evidence, full accessibility evidence, production performance, rate limiting, monitoring, and verified cleanup.

The Applied migration remains immutable and was not rerun. No SQL was executed during certification.
