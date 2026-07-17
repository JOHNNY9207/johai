# Customer Portal Pilot Demo

## Date

July 13, 2026. Deterministic hydration hardening validated July 14, 2026.

## Status

**Implemented in the repository; manual QA in progress; not production-ready.**

The Customer Portal production-security migration is **Applied**, while successful execution of its corrected read-only verifier remains **Pending**. This pilot did not create, modify, or execute SQL. It does not authorize migration repetition.

## Platform Layer

Customer Portal.

## Objective

Provide a realistic, fictional Customer Portal journey that can be reviewed locally without production customers, Supabase credentials, Storage objects, or writes to the Applied database. The pilot must exercise normal, empty, loading, retry, revoked-document, and session-error UI states while remaining structurally isolated from production authentication and data access.

## Business Problem

During the recorded July 13 pre-hardening inspection, the portal tables contained no test identities or customer records, so that inspection could not safely demonstrate the complete customer experience or validate failure-state presentation. That historical result does not establish the current database row count. Creating silent production fixtures would violate the database workflow and could weaken tenant-isolation evidence. A repository boundary and local in-memory adapter provide a reviewable pilot without representing fictional behavior as deployed behavior.

## Architecture

### Injectable repository contract

`app/lib/customer-portal-repository.ts` defines the `PortalRepository` contract consumed by customer-facing components. It covers:

- upcoming and previous appointments;
- message history and customer message creation;
- documents, acknowledgements, and downloads;
- safe profile updates;
- support-request history and creation; and
- explicit repository error classes for validation, loading, session, download, and demo failures.

The UI receives this contract through portal context. Feature components do not choose Supabase or mock transport directly.

### Production Supabase adapter

`app/lib/customer-portal-supabase-repository.ts` adapts the repository contract to the authenticated Supabase browser client, validated tenant context, and bearer-authorized download route. Production customer routes remain under the dedicated portal authentication and active-profile providers.

The application data layer is aligned with the reviewed allowlists in the Applied hardening migration; database verification remains Pending:

- profile reads and updates do not reference hidden `status`, and updates do not send server-owned `updated_at`;
- message reads do not filter hidden `is_customer_visible`, and inserts do not send it;
- document reads do not filter hidden `revoked_at`;
- request inserts do not send server-owned `status`; and
- RLS predicates, checked constraints, triggers, and database defaults remain authoritative.

### Fictional in-memory adapter

`app/lib/customer-portal-demo-repository.ts` implements the same contract with an in-memory state cloned from `customer-portal-demo-fixture.ts`. Every identity, business, appointment, message, request, document, and path is synthetic. The adapter imports no Supabase client, reads no session or secret, performs no network request, and writes no database state.

The fixture includes upcoming and completed appointments, human/AI/customer messages, an open support request, available and revoked documents, and an existing acknowledgement. Demo controls can switch between normal, empty, and load-error states and can trigger one-shot message, download, and simulated-session failures.

### Deterministic date rendering

All portal dates use one shared formatter contract. The displayed locale is derived from `customer_profiles.preferred_language` through an explicit locale map with stable `en-US` fallback. Appointment dates use their validated IANA timezone; messages, documents, and support records use explicit `UTC` because those records do not contain a customer timezone. The formatter never uses the browser or server default locale or timezone.

The fictional fixture uses the fixed reference instant `2026-07-14T02:10:00.000Z`, so SSR and hydration receive identical data. Authenticated portal requests receive one request-time server instant serialized through the portal provider. Dashboard and appointment queries reuse that instant instead of creating clocks during component rendering.

## Authentication Isolation

`app/portal/layout.tsx` is a neutral shared metadata boundary. The production `(customer)` route group mounts `PortalAuthProvider`, `PortalProvider`, and `PortalShell`; login and password recovery mount their own portal-auth provider. `AppProviders` continues to exclude the Business Workspace authentication provider from all `/portal/*` routes.

The fictional `/portal/demo/*` tree mounts only `PortalDemoProvider` and the shared shell. Its server guard explicitly allows only `NODE_ENV=development` or `NODE_ENV=test`; production, staging, missing, and unexpected values fail closed with 404 before the demo provider mounts. The generated demo-attachment route applies the same guard. There is no public environment flag, query parameter, cookie, local-storage key, or automatic fallback that can enable mock data on a production customer route.

## Download Security

The production download route no longer accepts browser-supplied business or customer-profile headers. It:

1. validates the document UUID and bearer token;
2. revalidates the user with Supabase Auth;
3. queries the requested document through the caller's JWT and RLS using only safe columns;
4. after that authorization succeeds, uses the server-only service role to reread the exact returned document/profile/business tuple;
5. rejects revoked documents;
6. validates the configured bucket allowlist and canonical `business_id/customer_profile_id/` path;
7. returns a no-store signed URL valid for 60 seconds.

The demo adapter returns only local fictional text assets for available documents and rejects revoked documents. Demo downloads are not evidence for production Storage policy, RLS, signing, expiry, or revocation-race behavior.

## Routes and States

The pilot reuses the production customer-facing components on:

- `/portal/demo`
- `/portal/demo/appointments`
- `/portal/demo/messages`
- `/portal/demo/documents`
- `/portal/demo/profile`
- `/portal/demo/support`

It exercises dashboard summaries, future and previous appointments, three message sender types, customer message creation, support requests, profile editing, acknowledgements, available and revoked document states, loading latency, empty data, load errors, retries, download failure, and simulated session expiry. CRM internals, Business Brain, Knowledge Center data, AI orchestration, internal notes, billing, and Executive Dashboard data remain outside the portal.

## Files Added or Changed by the Pilot

- `app/lib/customer-portal-repository.ts`
- `app/lib/customer-portal-supabase-repository.ts`
- `app/lib/customer-portal-demo-repository.ts`
- `app/lib/customer-portal-demo-fixture.ts`
- `app/lib/customer-portal-demo-guard.ts`
- `app/lib/customer-portal-data.ts`
- `app/lib/customer-portal-formatting.ts`
- `app/lib/customer-portal-types.ts`
- `app/portal/demo/`
- `components/portal/PortalDemoProvider.tsx`
- `components/portal/PortalDemoControls.tsx`
- shared Customer Portal feature components and production providers, including deterministic date formatting
- `app/layout.tsx` (Next.js 16 smooth-scroll declaration)
- `app/api/portal/documents/[id]/download/route.ts`
- `app/portal/demo/files/[name]/route.ts` (development-only generated attachment placeholders)
- `tests/customer-portal-pilot.test.ts`
- `package.json`
- related documentation records

No migration or verification SQL was changed, generated, or executed.

## Automated Validation

- `npm run test:portal`: **passed, 16 tests**.
- `npm run lint`: **passed**.
- Canonical `npm run build`: **passed**.
- Production-server requests to `/portal/demo` and `/portal/demo/files/preparation-guide` both returned the intended **404**, and the temporary validation server was stopped afterward.
- Development HTTP/SSR inspection returned **200** and confirmed the demo shell, dashboard content, fictional-data labeling, and JOHAI attribution in the rendered HTML.
- The guarded development attachment endpoint returned **200**, `text/plain; charset=utf-8`, and `Content-Disposition: attachment`; the same endpoint returned **404** from the production server.

The portal suite verifies route wiring, appointment fixture states, deterministic repeated fixtures, explicit locale and timezone fallbacks, absence of render-time demo clocks, the smooth-scroll root marker, message sender coverage and retry, document availability/revocation/acknowledgement behavior, profile validation, tenant-fixed support creation, forbidden internal-field labels, production demo-route denial, removal of caller-controlled download tenant headers, the production auth-provider boundary, empty/error states, one-shot download failure, revoked download denial, and simulated session expiry.

A final static audit also corrected shared-component truthfulness and demo fidelity: authenticated messages now receive a neutral success notice, empty/error scenarios no longer render the complete fixture before their repository state resolves, support creation announces success to assistive technology, human assistance is an explicit request type, and fixture downloads are generated as guarded attachment responses instead of public static files.

An earlier canonical build attempt returned `EPERM` inside the restricted sandbox. Follow-up checks found no process holding the build trace, no process was terminated, `distDir` was not changed, and the same canonical build passed outside the sandbox. This is recorded as an environment restriction, not an unresolved lock.

## Safe Build-Output Recovery Procedure

If a later build suggests a lock:

1. resolve the absolute build-output path and prove it is inside `C:\Projects\johai`;
2. distinguish sandbox permission denial from a real exclusive lock;
3. identify any holder and prove from its command line and working directory that it is the JOHAI Next.js process;
4. stop only that verified process gracefully;
5. confirm exclusive access again;
6. remove only the stale generated output, never source files; and
7. retry the configured canonical build.

If the holder or path cannot be proven, stop and request operator help. Do not terminate unidentified Node processes or change `distDir` as a cleanup shortcut.

## Remaining Risks and Limits

- Manual browser QA is partially complete. An initial in-app DOM inspection confirmed the shell landmarks, navigation, fictional Harbor Dental Studio/Sophie Martin content, demo labels, and customer-only route set. The browser connection to the local preview became unavailable before the full interaction matrix and the exact 1440-by-900, 768-by-1024, and 390-by-844 viewport checks could be completed; those checks remain Pending and no production-readiness claim depends on them.
- The July 14 hydration fix passed static, automated, build, and HTTP/SSR validation, but the in-app browser webview did not attach for the requested live console check. Final browser confirmation of zero hydration warnings remains Pending.
- The pilot is not deployed production evidence and is not a customer-availability claim.
- Mock success does not prove live Supabase Auth, RLS, PostgREST grants, cross-tenant denial, Storage policies, signed URLs, expiry, or revocation races.
- Public signup and the trusted server invitation-redemption/provisioning workflow remain unavailable.
- Rate limiting remains absent for login, recovery, messaging, support, acknowledgements, downloads, and future invitation redemption.
- The local workspace lacks `CUSTOMER_PORTAL_DOCUMENT_BUCKETS`; production downloads require an explicit private-bucket allowlist and canonical object placement.
- Production monitoring, alerting, retention, device/session behavior, recovery configuration, accessibility automation, and multi-browser/device evidence remain Pending.
- The demo route depends on its server production guard. Any future change that mounts the mock on production routes or weakens the guard is a release-blocking regression.
- Successful hardening-verifier execution, raw output, and query-by-query results remain Pending.

## Production Readiness

Not established. The Applied database hardening migration still requires successful corrected verification. A passing local suite, lint, and a canonical build do not replace provisioned production-like identities, direct-REST negative tests, cross-tenant behavioral tests, private Storage validation, rate limits, monitoring, and completed browser/accessibility QA.

## Next Authorized Step

Complete the Pending live hydration-console, interaction, keyboard, and exact-viewport pilot QA and record findings. Then prepare an explicitly approved production-like validation plan using safe provisioned identities for at least two businesses, mixed-principal denial, direct REST, writes, downloads, Storage, expiry, and revocation races. Do not rerun or modify the Applied migration; any future database change must use a new inspected migration and read-only verifier through the mandatory approval workflow.

The safe identity plan is now prepared in [Customer Portal Synthetic Test Identity Plan](CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md) but remains unprovisioned. It does not change the demo's no-Supabase boundary or authorize production fixtures.
