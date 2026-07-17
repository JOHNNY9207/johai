# Testing

## Business Workspace V1 certification baseline — 2026-07-15

No dedicated Business Workspace certification or end-to-end test command exists. `package.json` exposes Knowledge and Customer Portal suites only. The 12 Knowledge reliability scenarios use an in-memory surrogate and do not exercise production parsers, route handlers, Supabase, RLS, OpenAI, owner/member authorization, or cross-tenant behavior. Historical lint/build and browser-auth singleton results remain useful component evidence but are not Workspace certification.

The provisional audit score is **30/100**, status **NOT CERTIFIED**, and Production Ready **NO**. Required evidence includes credential-backed owner/member sessions, role and tenant denial, every privileged/public API boundary, Knowledge publication and AI context, complete business workflows, accessibility and responsive behavior, production performance/load, and operational recovery. See [Business Workspace V1 Certification Audit](../sprints/BUSINESS_WORKSPACE_V1_CERTIFICATION_AUDIT.md).

Current validation relies on TypeScript during build and ESLint. The repository needs unit, integration, end-to-end, authorization, webhook, tenant-isolation, and failure-recovery test suites.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Customer Portal V1 validation

- `npm run lint` passed.
- The first default `npm run build` attempt failed before compilation because the pre-existing `.next-build-stable/trace` file was locked.
- A build with an alternate `NEXT_DIST_DIR` passed TypeScript and generated all 43 routes, including the eight portal pages and document-download API.
- Production-build browser inspection confirmed an enabled isolated customer sign-in flow, the password-recovery form transition, and no horizontal overflow at a 390-by-844-pixel viewport.
- The user explicitly confirmed successful execution of the Customer Portal read-only database verification, but raw output and query-level findings were not supplied.

This is static/build and unauthenticated browser validation, not production security validation. Missing coverage includes provisioned-user login/recovery, token expiry, multiple-profile tenant selection, protected-route browser flows, direct Supabase REST access, behavioral cross-business RLS denial, unexpected table/column privileges, customer insert constraints, document revocation races, bucket/path allowlisting, signed URL expiry, provider links, rate limits, and accessibility automation.

## Customer Portal pilot demo validation — 2026-07-13

- `npm run test:portal` runs `tests/customer-portal-pilot.test.ts`; all 16 tests passed.
- The suite covers demo route wiring, upcoming and previous appointments, human/AI/customer message fixtures, message retry, available/acknowledged/revoked documents, idempotent acknowledgement, profile validation, tenant-fixed support creation, forbidden internal field names, the production 404 guard, caller-controlled download-header exclusion, the production auth-provider boundary, empty/error states, one-shot download failure, revoked download denial, and simulated session expiry.
- `npm run lint` passed.
- The canonical `npm run build` passed outside the restricted sandbox. An earlier sandboxed attempt returned `EPERM`; follow-up checks found no process holding the build trace, so that failure is recorded as an execution-environment restriction rather than evidence of an unidentified application process lock.
- Live production-server checks returned 404 for both `/portal/demo` and its generated `/portal/demo/files/preparation-guide` attachment endpoint; the temporary server was stopped and its port released.
- The same attachment endpoint returned 200 in development with `Content-Disposition: attachment` and `text/plain; charset=utf-8`; its temporary development server and isolated build cache were removed after inspection.
- At the time of the pilot, the security-hardening migration was **Applied** and its corrected verifier was still Pending. The latest certification review later removed that blocker. Neither migration nor verification SQL was changed or executed for the pilot.
- Manual browser QA is partially complete. Initial DOM inspection confirmed the shared shell, navigation, fictional demo labels, and customer-only route set, while local HTTP/SSR inspection confirmed a 200 development response and rendered dashboard content. The in-app browser connection became unavailable before the full interaction matrix and exact 1440-by-900, 768-by-1024, and 390-by-844 viewport checks finished, so responsive visual, keyboard, and multi-browser evidence remains Pending. The mock tests prove repository and UI-state behavior against fictional in-memory data; they do not prove live Supabase Auth, RLS, PostgREST privileges, Storage policy, signed-URL behavior, cross-tenant denial, deployment configuration, or production accessibility.

## Customer Portal hydration validation — 2026-07-14

- The root mismatch was reproduced from `Intl.DateTimeFormat(undefined, ...)`: Node rendered the server's French locale while the browser rendered English. Missing timezone options also allowed host timezone divergence.
- Portal formatting now requires an explicit locale and timezone. Locale derives from the active customer's preferred language with `en-US` fallback; appointment timezones are validated and all records without a timezone use `UTC`.
- The demo fixture uses a fixed serialized reference instant, the production provider receives one request-time server instant, and Dashboard/Appointments no longer create clocks during initial rendering.
- The existing 16-test suite now checks fixed fixture output, locale/timezone fallbacks, deterministic English/Toronto output, absence of implicit `Intl` locale use, absence of render-time fixture/boundary clocks, and the smooth-scroll HTML marker.
- `npm run test:portal`, `npm run lint`, and `npm run build` passed. Development HTTP/SSR returned 200 with the expected deterministic date text.
- The in-app browser webview did not attach, so direct browser-console confirmation of zero hydration warnings remains Pending. This limitation does not change the passing automated or build results.

## Customer Portal production-validation history — 2026-07-13

- `npm.cmd run lint` passed. Windows `npm.cmd` was used because PowerShell blocks `npm.ps1` in this environment.
- The initial sandboxed `npm.cmd run build` failed with `EPERM` while opening `C:\Projects\johai\.next-build-stable\trace`.
- No process holding the trace was subsequently found, and no process was terminated. A canonical build later passed outside the sandbox without changing `distDir`.
- The repository now includes the 16-test `npm run test:portal` suite described above.
- Pilot browser QA is partial as described above; authenticated production-route QA remains Pending.
- Live read-only PostgREST/OpenAPI inspection was completed on July 13, when all eight portal tables contained zero rows and no customer JWT/fixtures were available. That historical result does not establish the current live row count; behavioral route, RLS, write, and download validation remains Pending.

The hardening migration is Applied and must not be rerun. Historical verifier attempts failed on an incorrect acknowledgement relation name and PostgreSQL `42883` from an incompatible ACL `coalesce(aclitem[], aclitem[])` expression; both defects were corrected. The latest certification review removed the verification blocker. Raw evidence references remain documentation gaps, while the next active validation step is separately approved synthetic provisioning and behavioral authentication, tenant, direct-REST, and Storage testing.

## Browser auth singleton validation — 2026-07-14

- The existing 16-test `npm run test:portal` suite now executes the storage-keyed cache with fake clients and proves repeated lookups return strict object identity, each surface factory runs once, workspace and portal objects remain different, and conflicting configuration for an occupied key is rejected.
- Static checks preserve `johai-auth-session`, `johai-customer-portal-session`, portal PKCE, automatic refresh, session persistence, URL-session detection, login methods, local portal logout, auth-state subscriptions, `/portal/*` workspace-provider exclusion, and the demo's no-auth boundary.
- `npm run test:portal`, `npm run lint`, and the canonical `npm run build` passed on the final source.
- Development-browser checks covered portal login, the unauthenticated `/portal` to `/portal/login` provider remount, `/portal/demo`, workspace login, and the dashboard's unauthenticated login redirect. No `Multiple GoTrueClient instances detected` warning, hydration warning, or other console error was recorded in those final checks.
- Live credential-backed login, recovery, logout, token refresh/expiry, multi-tab BroadcastChannel propagation, and tenant data access remain Pending because no approved test identities or credentials were available.

## Customer Portal real-authentication validation — 2026-07-14

Identity availability was **NO**: no approved real test identity, credential reference, recovery mailbox, or pre-authenticated session was supplied or discoverable without reading secrets. No password, token, link, UUID, production customer, or service-role credential was used.

Credential-free checks produced limited, clearly scoped evidence:

- `/portal` redirected an unauthenticated browser to `/portal/login`; this proves the unauthenticated precondition, not the required post-logout sequence.
- `/portal/reset-password` without a valid recovery event displayed the safe unavailable-or-expired state; a real expired or already-used link remains Pending.
- `/portal/demo` displayed its no-Supabase-session statement and emitted no duplicate GoTrue, hydration, or Supabase-auth error; static and automated checks confirm no demo auth client.
- Distinct workspace and portal keys/clients passed the existing structural suite; credential-backed two-session behavior and multi-tab propagation were not executed.

Scenarios 1–8, 10–13, and behavioral scenario 14 are Blocked. Scenario 9 passed only for missing/invalid recovery context, and scenario 15 passed. No credential-backed scenario failed because no credential-backed scenario was attempted.

Final validation on the unchanged application source passed: `npm run lint`; `npm run test:portal` with 16 of 16 tests; and `npm run build`, including TypeScript and generation of all 43 routes. The complete identity matrix, secure provisioning procedure, evidence rules, and exact next step are in [Customer Portal Real Authentication Validation](../sprints/CUSTOMER_PORTAL_AUTH_VALIDATION.md).

## Synthetic authentication fixture plan — prepared, not executed

The exact manual fixture and execution matrix is recorded in [Customer Portal Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md). It requires eight confirmed Auth users, seven customer profiles, seven invitations, two synthetic tenants with distinct branding, a private recovery mailbox, controlled token lifetime/revocation, and a named cleanup owner.

Scenario allocation is fixed: A1 covers valid/invalid login, refresh, token refresh, multi-tab, logout, and post-logout redirect; A2 covers valid and failed recovery; B1 covers genuine expiry/revocation; A3 covers suspended denial; A4 covers invited/inactive denial; A5 covers two-business selection; A1 plus Owner A covers portal/workspace isolation; and no identity is used for the clean demo check. Blocked scenarios remain unexecuted until provisioning is separately approved.

This matrix does not exercise a portal-only Auth user with no profile or deliberately create a mixed owner/member portal principal. Scenario 14 proves two-principal browser-session isolation only. Broader database/RLS denial needs separate fixtures and approval. B1's expiry test must account for an already-issued access JWT remaining valid until expiry; revoke refresh capability, then observe the next expiry/refresh boundary rather than assuming immediate invalidation.

Test evidence may record aliases, timestamps, response categories, redirects, and pass/fail outcomes only. It must not contain passwords, UUIDs, recovery links, invitation material, cookies, authorization headers, access/refresh tokens, or signed URLs. Preparing this plan did not rerun lint/tests/build because no application code changed, and it executed no SQL.

## Customer Portal V1 final certification evidence — 2026-07-14

Final certification reran `npm run lint`, `npm run test:portal`, and `npm run build`. Lint passed, all 16 Portal tests passed, and the canonical build passed TypeScript and generated 43 pages/routes.

The in-app browser checked `/portal/demo`, appointments, messages, documents, profile, and support at 1440x900, 768x1024, and 390x844. All 18 route/viewport observations retained main content and had no page-level horizontal overflow. All six mobile routes exposed the six customer navigation links. Warm loopback development observations ranged from 244 ms to 722 ms; they are diagnostic only and are not production Core Web Vitals or API load evidence.

Accessibility sampling found one shared muted-color defect. After the targeted style correction, 242 sampled visible text nodes across the six routes had zero WCAG AA contrast failures. Each route had one `h1`, one main landmark, a language attribute, named visible controls, no duplicate IDs, and at least one live/status region. Final browser logs contained no warning or error. The browser surface did not advance focus during attempted Tab traversal, so complete keyboard and real screen-reader validation remain Pending rather than passed.

The certification is **FAILED**, global score **69/100**, Production Ready **NO**. This local suite does not exercise Supabase Auth identities, PostgREST/RLS, private Storage, signed URLs, cross-tenant denial, rate limiting, production monitoring, or production performance. No SQL was executed.

## Synthetic environment operator package — 2026-07-14

The latest certification re-audit removed the earlier production-hardening verification blocker and recomputed the score to **71/100**; Production Ready remains **NO**. The next evidence gate is not another migration or verifier repair. It is a separately approved synthetic run.

The run is now documented in [Synthetic Environment Setup](../testing/SYNTHETIC_ENVIRONMENT_SETUP.md), [Synthetic Environment Checklist](../testing/SYNTHETIC_ENVIRONMENT_CHECKLIST.md), [Authentication Test Procedures](../testing/AUTH_TEST_PROCEDURES.md), and [Test Data Matrix](../testing/TEST_DATA_MATRIX.md). Together they define exact screens, creation order, two-business/eight-user/seven-profile/seven-invitation scope, fixture values, expected/failure outcomes, recovery, cross-tenant checks, credential handling, rollback, and dependency-safe cleanup.

This documentation did not provision an identity or record, execute an authentication scenario, rerun lint/tests/build, execute SQL, change a migration, or modify application code. All credential-backed results remain Blocked until the checklist records human approval and GO.

## Customer Portal Contextual Intelligence V1 validation — 2026-07-14

The Portal test suite expanded from 16 to **31 passing tests**. The fifteen new cases cover the complete Contextual Intelligence V1 checklist:

1. foreign-tenant and foreign-profile records are removed from the snapshot and source list;
2. contextual sources stay inside the customer-visible allowlist and the engine/provider import no CRM, Business Brain, Knowledge, billing, or service-role system;
3. dashboard insights are capped at three with exactly one primary recommendation;
4. completed appointments, acknowledged documents, and resolved requests produce silence;
5. suggested replies do not send or mutate the conversation and only fill the draft;
6. document guidance names its source and the UI preserves the original record as source of truth;
7. regulated document interpretation is classified as prohibited, shown as unavailable, and escalated to a person;
8. appointment assistance repeats only customer-visible preparation and does not invent slots or completion;
9. human escalation records intent without claiming notification;
10. repeated demo requests return identical deterministic output;
11. demo intelligence creates no Supabase or Auth client;
12. the demo and generated demo files still fail closed in production;
13. expired access produces no dashboard/profile/message/document assistance;
14. suspended and inactive access remain silent; and
15. generated authorship, polite live regions, native buttons, visible focus, and no-autofocus contracts are explicit.

Validation results:

- `npm run test:portal`: passed, 31/31.
- `npm run lint`: passed.
- `npm run build`: passed.
- No SQL, migration, verification file, schema object, Auth identity, or production data was created, modified, or executed.

The tests prove local deterministic contracts, source filtering, provider behavior, and structural accessibility. They do not prove live Supabase Auth/RLS/direct-REST behavior, private Storage, signed URLs, production provider behavior, production performance, rate limiting, monitoring, real human notification, or customer outcomes.

Browser validation of the new contextual controls is partial. At 1440×900, the dashboard rendered three insights with exactly one primary action and `scrollWidth` equal to the document width; keyboard activation revealed the appointment preparation guidance. No warning or error appeared in the captured browser log during those observations. The browser safety policy then blocked the private-network preview before document, message, support, and profile interactions and the requested 768×1024 and 390×844 passes could finish. Those interactions, a complete keyboard traversal, and real screen-reader evaluation remain Pending. Earlier Portal route/contrast evidence is not silently reused as proof of the new controls.

The certification score was not recomputed by this feature validation. The authoritative state remains **71/100**, certification **FAILED**, and Production Ready **NO**.
