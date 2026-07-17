# Customer Portal V1 Final Certification

- **Platform layer:** Customer Portal
- **Certification date:** 2026-07-14
- **Certification decision:** FAILED
- **Production Ready:** NO
- **Original certification score:** 69/100
- **Current recomputed score:** 71/100
- **Operational state:** Operational Validation Hold as of 2026-07-15
- **Foundation database change:** Applied and Verified by explicit user confirmation
- **Production-security hardening migration:** Applied and immutable
- **Production-security hardening verification:** Resolved in current-state re-audit

## Current-state re-audit

The detailed scorecard below preserves the original 69/100 certification run. A later current-state review removed the production-security verification blocker and recomputed the authoritative current score to **71/100**. The decision remains **FAILED** and Production Ready remains **NO** because synthetic identities, credential-backed authentication, behavioral tenant/direct-REST denial, private Storage, assistive-technology, production-performance, abuse-control, monitoring, and support-lifecycle evidence are still incomplete. The Applied migration remains immutable.

## Operational Validation Hold — 2026-07-15

Customer Portal V1 development is complete and feature-frozen. Certification is now on **Operational Validation Hold**. No further Customer Portal development is authorized until human-approved synthetic identities, an isolated operational test environment, and human-led authentication validation exist.

The hold does not change the score, certification decision, database lifecycle, or remaining evidence gaps. The next authorized activity is the approved operational validation package, not feature implementation. See [Customer Portal V1 Operational Validation Hold](CUSTOMER_PORTAL_OPERATIONAL_VALIDATION_HOLD.md).

## Objective and scope

This sprint assessed the existing Customer Portal V1 implementation against the remaining production gates. It did not add a module, redesign the portal, work on Super Admin or AI Employees, execute SQL, or modify a migration. Scores measure production assurance: implementation structure alone cannot receive full credit without representative production-like behavioral evidence.

## Certification scorecard

| Category | Score | Evidence and disposition |
| --- | ---: | --- |
| Authentication | 61 | Dedicated PKCE client, isolated storage key, safe redirects, generic login/recovery errors, logout wiring, refresh listeners, and active-profile gating exist. Approved credentials and real login, logout, refresh, recovery, expiry, suspended, invited, multi-profile, and multi-tab results do not exist. |
| Tenant isolation | 30 | Composite tenant keys, exact profile/business filters, RLS helpers, and global workspace/customer separation are strong in the reviewed source. Hardening verification and Tenant A/A1/A2 versus Tenant B/B1 behavioral denial remain Pending. |
| Storage | 74 | The download endpoint revalidates the bearer user and RLS-visible tuple, rechecks revocation with trusted metadata, enforces a bucket allowlist and canonical tenant path, and issues a 60-second signed URL. Live private-bucket, wrong-tenant, missing-object, expiry, and revocation-race evidence is absent. |
| Messaging | 78 | Customer-visible selection, customer-only sender insertion, narrow grants, tenant filters, and safe UI contracts are implemented. Live hidden-message, sender-spoofing, direct-REST, and cross-tenant denial are unproven; rate limiting and idempotency are absent. |
| Appointments | 80 | Explicit locale and timezone formatting, bounded statuses, customer-visible fields, safe HTTPS actions, and status-gated links are implemented. Live provider-link, synchronization, malformed-link, and tenant-denial evidence is absent. |
| Profile editing | 82 | The client constructs a seven-field allowlist, validation is explicit, RLS binds the exact tenant, column grants protect identity/status/audit fields, and `updated_at` is server-owned. Live forbidden-column/direct-REST and expiry-during-save tests are absent. |
| Support | 62 | Customers can create tenant-bound open requests and view customer-safe status. No trusted application lifecycle for `open -> in_progress -> resolved -> closed`, response history, idempotency, rate limiting, or live tenant-denial proof exists. |
| Responsive | 90 | All six shared demo feature routes passed 1440x900, 768x1024, and 390x844 checks with no page-level horizontal overflow, preserved main content, and six visible mobile navigation links. This is shared-component evidence, not an authenticated production-device run. |
| Accessibility | 72 | Every checked route has one `h1`, one main landmark, named visible controls, language metadata, live regions, no duplicate IDs, and an accessible navigation tree. A discovered low-contrast muted-text defect was corrected and 242 sampled visible text nodes then passed the WCAG AA contrast threshold. Full keyboard focus traversal and assistive-technology testing remain unproven. |
| Performance | 50 | The production build compiled and generated 43 pages/routes. Warm local development navigation observations were 283-722 ms at desktop, 264-439 ms at tablet, and 244-573 ms at mobile. These are not production Core Web Vitals, API latency, signed-download, or load-test measurements. |
| Security | 76 | Static review found a strict portal endpoint, locked security-definer helpers, service-role-only invitation redemption, narrow grants, customer-only RLS policies, drop-before-create trigger handling, and no same-name policy duplication. Deployed ACL/RLS/function state, differently named overlapping policies, rate limits, monitoring, CSP/XSS posture, and behavioral attack tests remain unverified. |

The global score is the rounded arithmetic mean of the eleven category scores. A score does not override a mandatory gate: any unverified tenant, authentication, database-hardening, or private-storage boundary prevents certification.

## Validation evidence

- `npm run lint`: passed.
- `npm run test:portal`: passed, 16/16 tests.
- `npm run build`: passed, including TypeScript and generation of 43 pages/routes.
- Browser route matrix: six routes across desktop, tablet, and mobile; 18 route/viewport observations; no page-level horizontal overflow.
- Browser semantics: one `h1` and main landmark per route, `lang="en"`, named visible controls, no duplicate IDs, and customer navigation exposed to the accessibility tree.
- Contrast: the initial audit found insufficient contrast in muted branding, timestamps, document types, and support metadata. Shared portal styles were darkened without changing layout or content. The repeated route-wide sample found zero WCAG AA text-contrast failures across 242 visible text nodes.
- Console: no warning or error, including no hydration or duplicate GoTrueClient warning, was captured during the final local route run.
- Demo boundary: the existing suite confirms the development demo creates no Supabase client and fails closed in production.

### Local performance observations

| Requested surface | Warm local development observation | Certification meaning |
| --- | --- | --- |
| Portal first load | Not measured in a production build with an authenticated identity | Blocking evidence gap |
| Dashboard | 264-584 ms across the three checked viewports | Loopback/demo diagnostic only |
| Messages | 267-309 ms across the three checked viewports | Loopback/demo diagnostic only |
| Documents | 277-357 ms across the three checked viewports | Loopback/demo diagnostic only |

The broader six-route warm range was 244-722 ms. Browser connection, development compilation, Supabase/Auth latency, database latency, private Storage, signed URL creation, network distance, cache state, concurrency, and Core Web Vitals are not represented by these values.

### Security inventory reviewed

- **Portal API endpoints:** The only customer-facing Portal API route is `GET /api/portal/documents/[id]/download`; its bearer validation, caller-RLS lookup, trusted tuple/revocation reread, bucket/path validation, signed URL, and no-store responses were reviewed. Demo attachment delivery is a separate development/test-only guarded route.
- **Authentication callbacks:** Portal recovery uses PKCE URL detection on `/portal/reset-password`; there is no general Portal callback route. The Business Workspace `/auth/callback` remains a separate surface. Missing/invalid recovery context fails safely; successful and expired real recovery remain untested.
- **RLS policy inventory:** The ordered migration source leaves 11 customer policies: profile select/update, branding select, appointments select, messages select/insert, documents select, acknowledgements select/insert, and requests select/insert. Invitations have no browser policy. Business-management policies are dropped by hardening.
- **Definer and trigger inventory:** `is_current_portal_customer`, `is_current_portal_document`, and `redeem_customer_portal_invitation` use locked definer search paths; invitation redemption is service-role-only. `customer_profiles_set_updated_at` is an invoker trigger function and the trigger is dropped before creation.
- **Grant inventory:** The hardening source revokes broad table/column access before applying narrow authenticated column grants. Static history shows no effective duplicate grant or same-name duplicate policy; live drift remains unknown until the corrected verifier runs and its policy inventory is reviewed.

## Application corrections made during certification

Only contrast utilities were changed in the existing Customer Portal components:

- `components/portal/PortalShell.tsx`
- `components/portal/PortalDashboard.tsx`
- `components/portal/PortalDocuments.tsx`
- `components/portal/PortalMessages.tsx`
- `components/portal/PortalSupport.tsx`
- `components/portal/PortalUi.tsx`

No feature, module, route, SQL file, migration, schema object, or production data was added or changed.

## Blocking production gates

1. **Resolved in the current-state re-audit:** the production-security verification blocker is no longer active.
2. The approved synthetic identity plan is not provisioned. Credential-backed login, logout, refresh, recovery, token expiry, suspended/invited denial, multi-profile selection, multi-tab propagation, and workspace-session coexistence remain unexecuted.
3. No Tenant A/A1/A2 versus Tenant B/B1 behavioral RLS or direct-REST denial record exists, including no-profile and mixed owner/member denial fixtures.
4. No production-like private Storage, bucket-policy, wrong-tenant object, signed-URL expiry, revoked-document, or revocation-race result exists.
5. Customer-facing invitation redemption and approved suspension/inactive-state operations are absent.
6. Support request lifecycle transitions have no trusted application implementation or behavioral evidence.
7. Login, recovery, messaging, support, and download abuse controls, monitoring, alerting, and incident evidence are incomplete.
8. Full keyboard focus traversal, real screen-reader testing, and production assistive-technology evidence remain Pending.
9. Production Core Web Vitals, portal API latency, message/document load timings, signed-download timings, and representative load results are not recorded.

## Decision and next authorized step

**Customer Portal V1 Certification: FAILED. Production Ready: NO.** Customer Portal V1 must not be locked or represented as certified.

The next authorized step is separate human approval of [Synthetic Environment Checklist](../testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md), followed by the exact [Setup](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md), [Data Matrix](../testing/TEST_DATA_MATRIX.md), and [Authentication Procedures](../testing/AUTH_TEST_PROCEDURES.md). After the bounded run, clean up and independently verify all fixtures, complete the remaining tenant/Storage/security/accessibility/performance evidence, and rerun certification. The Applied migration must not be modified or executed again.

No SQL was executed during this certification.
