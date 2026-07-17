# Customer Portal Real Authentication Validation

## Date

Validation attempted July 14, 2026. Credential-backed execution date remains Pending.

## Status

**Blocked — approved test identities unavailable.** No approved Customer Portal test identity, credential reference, controlled recovery mailbox, or pre-authorized browser session was supplied or available to this validation. This is not a claim that the live database is empty. No identity, tenant, invitation, profile, or customer data was created.

The latest certification review removed the previous production-hardening verification blocker. The migration remains **Applied** and immutable and must not be modified or executed again. Real-auth validation remains Blocked because the approved synthetic identities and operational environment do not yet exist.

## Objective

Validate the complete Customer Portal authentication lifecycle with approved synthetic, non-production identities while preserving tenant isolation, the separate Business Workspace session boundary, and the development demo's no-Supabase contract.

## Identity Availability Audit

No approved identity was found in the project documentation, test configuration, browser session, or credential variable names available to this run. Existing portal tests use fake clients and fictional in-memory demo records; they are not Supabase Auth users. Secret values were not inspected, copied, logged, or documented. The service-role credential is not a browser test identity and was not used.

Historical documentation records zero portal rows during the July 13 pre-hardening inspection. That historical result does not establish the current live data state and was not treated as current evidence.

## Initial Generic Identity Requirements — superseded by exact plan

The following generic five-role model recorded the initial minimum requirements. It is now superseded for provisioning by [Customer Portal Synthetic Test Identity Plan](CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md), which defines the user-requested two-owner/eight-Auth-user structure, seven profiles, seven invitations, exact reserved-domain aliases, secure delivery, cleanup, and scenario assignments. Nothing has been provisioned. Email addresses are fictional `.test` labels; Auth UUIDs, passwords, recovery links, refresh tokens, and invitation tokens remain secret and uncreated.

| Alias | Required state | Purpose |
| --- | --- | --- |
| `PORTAL-ACTIVE-SINGLE` | Confirmed Supabase Auth user; exactly one active customer profile in synthetic Business A; no business owner/member role; controlled recovery mailbox | Valid/invalid login, logout, redirect, refresh, token refresh, expiry, recovery, and multi-tab scenarios |
| `PORTAL-SUSPENDED` | Confirmed Auth user; one or more suspended profiles and zero active profiles in every business; no owner/member role | Suspended-customer denial |
| `PORTAL-INVITED-INACTIVE` | Confirmed Auth user; invited profile and zero active profiles; matching unaccepted invitation when the approved provisioning workflow supports it; no owner/member role | Invited-but-inactive denial |
| `PORTAL-ACTIVE-MULTI` | One confirmed Auth user with active profiles in two distinct approved synthetic businesses with distinguishable branding; no owner/member role | Multi-profile selection and cross-tenant switching |
| `WORKSPACE-ONLY` | Distinct confirmed Auth user linked only as an approved Business Workspace owner/member; no customer profile | Behavioral cross-surface session isolation |

A person who needs both roles must use two distinct Auth identities. The Business Workspace check must use its Supabase surface at `/auth/login`; the separate dashboard password cookie is not evidence of GoTrue session isolation.

## Scenario Matrix

| # | Scenario | Status | Evidence or blocker |
| --- | --- | --- | --- |
| 1 | Valid customer login | Blocked | Requires `PORTAL-ACTIVE-SINGLE` credentials. |
| 2 | Invalid password | Blocked | No request was sent against a real approved identity. The invalid test value must never be documented. |
| 3 | Logout | Blocked | Requires an authenticated portal session. |
| 4 | Protected-route redirect after logout | Blocked | A credential-free visit to `/portal` redirected to `/portal/login`, confirming the unauthenticated gate only; logout sequencing was not exercised. |
| 5 | Browser refresh with active session | Blocked | Requires an active approved session. |
| 6 | Token refresh | Blocked | Requires an approved session plus controlled timing or a dedicated non-production short JWT lifetime. Tokens and request headers must not be captured in evidence. |
| 7 | Expired-session handling | Blocked | Requires operator-controlled session revocation or invalidation. Clearing browser storage is not equivalent to server-side expiry. |
| 8 | Password recovery | Blocked | Requires the controlled mailbox and approved account. |
| 9 | Recovery callback failure | Passed for missing/invalid recovery context | Direct access to `/portal/reset-password` without a recovery session rendered the safe unavailable-or-expired message with no console error. An actually expired or already-used link remains part of the credential-backed follow-up. |
| 10 | Suspended customer | Blocked | Requires `PORTAL-SUSPENDED`. |
| 11 | Invited but inactive customer | Blocked | Requires `PORTAL-INVITED-INACTIVE`. No supported customer-facing invitation-redemption route currently exists. |
| 12 | Multiple business profiles | Blocked | Requires `PORTAL-ACTIVE-MULTI` and two approved synthetic tenants. |
| 13 | Multi-tab session propagation | Blocked | Requires one approved active session in two same-origin tabs. |
| 14 | Portal session isolated from Business Workspace | Structural preflight passed; behavioral test blocked | Source and automated tests preserve distinct storage keys and client objects. Two approved identities are required to prove behavior in one browser context. |
| 15 | Portal demo creates no Supabase client | Passed | `/portal/demo` rendered its explicit no-Supabase-session statement without GoTrue warnings; static and automated checks confirm the demo mounts only the in-memory provider. |

No credential-backed scenario failed because none was attempted. Blocked scenarios must not be reported as failures or passes.

## Credential-Free Browser Evidence

- Opening `/portal` without an approved session redirected to `/portal/login`.
- Opening `/portal/reset-password` without a valid recovery event displayed the safe expired/unavailable recovery state.
- Opening `/portal/demo` displayed the fictional demo and its explicit statement that no Supabase session, production tenant, or external data service is used.
- No duplicate GoTrue-client warning, hydration warning, Supabase authentication error, login, logout, recovery email, session mutation, or customer data request was observed in these checks.

## Secure Provisioning Procedure

1. A human confirms the current approved database/security state and records that the Applied migration will not be rerun.
2. A human approver names the non-production Supabase environment, two synthetic businesses, all eight exact Auth aliases, controlled recovery mailbox, evidence-retention rules, and cleanup owner.
3. An authorized operator uses a trusted server-side provisioning workflow. The browser, documentation, source control, chat, and screenshots must never receive the service-role key, raw invitation token, password, recovery link, session token, or Auth UUID.
4. For active portal identities, the trusted workflow generates a high-entropy invitation token, stores only its lowercase SHA-256 hash with the exact business/email/expiry, and invokes the service-role-only invitation redemption function using the server-derived Auth user ID. Direct browser profile insertion is forbidden.
5. The suspended and invited identities are placed in their exact approved states through a trusted administrative workflow. If no supported workflow exists, provisioning stops and that operational capability follows the normal architecture and database-approval process; no ad hoc SQL is permitted.
6. The multi-profile identity is linked to two distinct synthetic businesses, and the workspace-only identity is linked only to the Business Workspace. Portal identities must not be owners or members anywhere.
7. Temporary passwords and recovery messages are delivered through an approved secret manager or controlled test mailbox. Only aliases and pass/fail outcomes may enter documentation.
8. Token refresh is tested by controlled non-production lifetime or documented waiting. Expiry is tested through operator-controlled session revocation; local-storage deletion is recorded separately and never substituted.
9. The operator records sanitized evidence for every scenario, then removes or disables fixtures through the approved cleanup workflow. Any database change discovered as necessary stops work and starts the mandatory migration workflow.

## Validation Results

- `npm run lint`: Passed.
- `npm run test:portal`: Passed, 16 of 16 tests.
- `npm run build`: Passed; TypeScript completed and all 43 application routes were generated.
- In-app browser credential-free checks: Passed for the unauthenticated redirect preflight, missing/invalid recovery context, and demo isolation.
- Credential-backed lifecycle matrix: Not executed because approved identities were unavailable.

## Security and Tenant-Isolation Rules

- Use only approved synthetic non-production accounts and tenants.
- Never use a production customer, production mailbox, service-role credential, token, or secret in browser evidence.
- Portal sessions remain under `johai-customer-portal-session`; Business Workspace sessions remain under `johai-auth-session`.
- Do not merge storage keys, clients, identities, or role assignments.
- Active-profile and business selection remain subject to RLS; local storage is preference only.
- Multi-profile evidence must prove each selected tenant exposes only its own distinguishable fixture data.
- Portal local logout is not an all-device logout guarantee and must be documented as such.
- The demo must continue to create no Supabase client and must remain unavailable in production.

## Remaining Risks and Blockers

- Approved identities, credentials, controlled mailbox, synthetic businesses, multi-profile fixture data, session-revocation capability, and token-lifetime test conditions are unavailable.
- The trusted server invitation/redemption operation and privileged administration paths for A3, A4, child fixtures, and cleanup require explicit approval before provisioning.
- Invitation redemption has no supported customer-facing application route.
- Valid login, invalid password, logout sequencing, persisted refresh, token refresh, real expiry, successful recovery, used/expired recovery links, suspended/invited denial, multi-profile selection, multi-tab propagation, and behavioral workspace isolation remain unproven.
- Rate limiting, monitoring, production email delivery, device/session management, Storage behavior, and direct-REST tenant tests remain separate production gates.

## Documentation and Database Status

This record changes documentation only. The current certification state has removed the earlier hardening-verification blocker; the migration remains **Applied** and immutable. No SQL, migration, application code, identity, tenant, invitation, or customer data was created, modified, or executed.

## Exact Next Step

A human must approve [Synthetic Environment Checklist](../testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md) with the exact non-production environment, operators, trusted tooling, mail/secret channels, test window, evidence policy, and cleanup ownership. An approved operator may then follow [Synthetic Environment Setup](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md), the [Test Data Matrix](../testing/TEST_DATA_MATRIX.md), and all [Authentication Test Procedures](../testing/AUTH_TEST_PROCEDURES.md). Nothing may be provisioned while any mandatory approval remains Pending.

## Final certification disposition

The 2026-07-14 final certification did not change this record's Blocked status. Authentication scored **61/100**, but no approved identity became available and no credential-backed scenario was executed. The safe unauthenticated redirect, invalid/missing recovery-context behavior, structural session-key separation, singleton construction, and demo no-client boundary remain useful preconditions only.

Customer Portal V1 certification is **FAILED** and Production Ready is **NO** until the complete approved identity matrix executes with recorded results and the other certification gates close. The hardening migration remains Applied and immutable, and no SQL was executed.
