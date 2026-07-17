# Customer Portal Authentication Test Procedures

## Status and use

- Platform layer: **Customer Portal**
- Package revision: **2026-07-14.1**
- Status: **Prepared; no credential-backed procedure executed**
- Authentication production-ready: **NO**

These procedures start only after [Synthetic Environment Checklist](SYNTHETIC_ENVIRONMENT_CHECKLIST.md) records a **GO** provisioning decision and provisioning completion. They never authorize production accounts, SQL, migration changes, application changes, or service-role access in a browser.

## Source-of-truth order

Scope/security policy: [Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md). Exact fixtures: [Test Data Matrix](TEST_DATA_MATRIX.md). Provisioning: [Synthetic Environment Setup](SYNTHETIC_ENVIRONMENT_SETUP.md). Go/no-go and cleanup: [Synthetic Environment Checklist](SYNTHETIC_ENVIRONMENT_CHECKLIST.md). This file defines test execution. Actual outcomes must be copied to [Customer Portal Authentication Validation](../sprints/CUSTOMER_PORTAL_AUTH_VALIDATION.md); production readiness is decided only in the final certification record.

## Result vocabulary

Use exactly one result per scenario:

- **Passed** — every expected result was observed with sanitized evidence.
- **Failed** — the scenario executed and one or more expected results were not observed.
- **Blocked** — a prerequisite or approved test capability was unavailable; the scenario did not execute completely.

Never turn Blocked into Passed or Failed. Never infer a credential-backed result from source inspection, demo behavior, a unit test, or an unauthenticated redirect.

## Evidence record template

For each scenario record only:

- scenario number and name;
- `RUN_ID` and identity aliases;
- tester and approved UTC start/end timestamps;
- route and browser/version;
- expected versus observed outcome;
- sanitized response category or visible message;
- Passed, Failed, or Blocked;
- defect/incident reference if applicable;
- cleanup or credential-rotation action.

Never record passwords, actual UUIDs, raw invitations, recovery links/codes, cookies, authorization headers, access/refresh tokens, service-role keys, signed URLs, or private customer content.

## Common preflight

1. Confirm the exact project/origin and `RUN_ID` with the approved run record.
2. Confirm the private mail sink, password manager, session-revocation control, and cleanup owner are available.
3. Confirm no browser extension or password autofill will submit a real account.
4. Open a clean disposable browser profile unless the scenario explicitly requires an existing session.
5. Open developer tools only if approved. Disable request-body/header persistence or redact it before evidence storage.
6. Confirm the portal Auth key is `johai-customer-portal-session` and workspace key is `johai-auth-session`; do not read or copy their values.
7. Confirm all data on screen uses the expected synthetic tenant/customer markers.
8. If real data, a secret, or a different tenant appears, stop, close the test window, revoke sessions, and invoke the incident procedure.

### Session-revocation control

JOHAI V1 has no customer session-management screen, and current Supabase documentation does not define a universal Dashboard button for revoking every refresh session of a selected user. Before any scenario that says **revoke sessions**, the run approval must name and attach an exact trusted Auth Admin procedure, its version, operator screen or command wrapper, audit destination, and confirmation result. It must revoke the intended run-owned user's refresh sessions without exposing a service credential or token to the tester. If that approved control is absent, scenarios 3 recovery, 6 recovery, 7, 8/9 recovery actions, 10/11 recovery, 12/13/14 recovery, and final cleanup are **Blocked**. Do not substitute local-storage deletion, Auth-user deletion, password reset, SQL, or migration changes.

## Recommended execution order

Run scenario 15 first in a clean context. Then A1: 2, 1, 5, 6, 13, 3, 4. Then A2: 8 and 9. Then B1: 7. Then A3: 10. A4: 11. A5: 12. Finish with A1 plus Owner A: 14. This order limits destructive password/session changes.

## Scenario 1 — Valid customer login

Identity: A1  
Start state: no Portal session; A1-A active; credentials delivered through the secret manager.

### Steps

1. Open `/portal/login`.
2. Confirm heading **Welcome back** and Customer Portal label.
3. In **Email address**, enter `a1.active@tenant-a.johai.test`.
4. In **Password**, paste A1's secret from the approved expiring secret view.
5. Choose **Sign in** once.
6. Wait for navigation; do not refresh during the initial transition.
7. Confirm the route is `/portal` or the previously approved safe `next` route.
8. Confirm Northstar Lantern Test Studio branding and A1-only data.
9. Open Overview, Appointments, Messages, Documents, Profile, and Support.

### Expected result

A1 signs in, one active profile auto-selects, and only A1-A/Tenant A records render. No profile selector, internal workspace navigation, duplicate-client warning, hydration error, or cross-customer data appears.

### Failure result

Generic rejection, denial screen, wrong tenant, mixed rows, console auth error, or unintended route is Failed. Cross-tenant or internal data is a security incident.

### Recovery/rollback

Use **Sign out** if available, revoke A1's session through the approved Auth control, preserve sanitized evidence, and do not change fixture state until reviewed.

## Scenario 2 — Invalid password

Identity: A1 alias; deliberately wrong value generated for this attempt and never retained.

### Steps

1. Open a clean `/portal/login` with no Portal session.
2. Enter A1's exact email.
3. Enter the approved deliberately wrong value; do not record or screenshot it.
4. Choose **Sign in** once.
5. Inspect the visible result and confirm the route remains `/portal/login`.
6. Confirm no Portal Auth storage entry or protected content is created.

### Expected result

The screen shows **The email or password was not accepted.** It does not reveal whether the email exists, create a Portal session, or render customer data.

### Failure result

Any successful login, account-enumerating message, protected-route access, or session creation is Failed and requires security review.

### Recovery/rollback

Clear the disposable password field and browser profile. If rate limiting blocks the approved later valid login, record Blocked and wait for the approved recovery window; do not disable protections.

## Scenario 3 — Local Portal logout

Identity: A1  
Start state: valid A1 Portal session.

### Steps

1. Open any protected Portal page.
2. On desktop, choose **Sign out** in the lower-left account card. On mobile, choose the header button whose accessible label is **Sign out**.
3. Wait for navigation to `/portal/login`.
4. Confirm no A1 content remains visible.
5. Without signing back in, attempt the protected-route step in scenario 4.

### Expected result

The selected-profile preference for A1 is cleared, local Portal sign-out completes, and the browser returns to `/portal/login`. This is local scope; it does not claim to revoke sessions on other devices.

### Failure result

Stale content, a protected route remaining usable, workspace logout, or failure to leave the Portal is Failed.

### Recovery/rollback

Revoke A1 sessions through the approved Auth control and clear the disposable browser profile. Record whether the defect affected only UI navigation or actual authorization.

## Scenario 4 — Protected-route redirect after logout

Identity: A1 immediately after scenario 3.

### Steps

1. Enter `/portal/messages` directly in the address bar.
2. Press Enter and wait for client initialization.
3. Refresh once.
4. Observe the final route and page content.

### Expected result

The route returns to `/portal/login` with a safe Portal `next` value, and no stale profile/message content appears before or after refresh.

### Failure result

Messages render, stale data flashes persistently, a non-Portal redirect occurs, or an arbitrary `next` destination is accepted.

### Recovery/rollback

Close the browser, revoke remaining A1 sessions, preserve sanitized route evidence, and stop related authentication scenarios until reviewed.

## Scenario 5 — Browser refresh with an active session

Identity: A1  
Start state: valid unexpired A1 session.

### Steps

1. Sign in using scenario 1.
2. Open `/portal/appointments`.
3. Confirm A1's expected Tenant A rows.
4. Perform a full browser refresh.
5. Wait for loading to settle.
6. Confirm route, tenant, and data again.

### Expected result

The dedicated Portal session is recovered, the active-profile gate reruns, A1-A remains selected, and no unauthenticated or other-tenant data renders.

### Failure result

Unexpected logout, wrong tenant/profile, duplicate auth client, hydration mismatch, or stale data after session invalidation is Failed.

### Recovery/rollback

Sign out locally; if that fails, revoke the session centrally and clear the disposable browser profile.

## Scenario 6 — Token refresh

Identity: A1  
Prerequisite: approved short non-production JWT lifetime or approved wait; token values must remain hidden.

### Steps

1. Sign in A1 and record only the sanitized session-established timestamp.
2. Keep `/portal` open until the documented refresh boundary.
3. If approved network tools are used, filter only by request timing/status and redact authorization/request bodies before capture.
4. Navigate to Messages and Documents after the boundary.
5. Confirm the session remains active and A1-only content remains correct.

### Expected result

Automatic refresh completes under `johai-customer-portal-session`, no duplicate GoTrue client warning occurs, and authorization remains A1-A only.

### Failure result

Unexpected logout, refresh loop, token error, duplicate client warning, or data leakage is Failed. If the boundary cannot be observed safely, record Blocked.

### Recovery/rollback

Revoke the A1 session, destroy any capture containing a token, and rotate A1 credentials if exposure occurred.

## Scenario 7 — Expired/revoked session handling

Identity: B1  
Prerequisite: approved operator can revoke the B1 refresh session and the access-token lifetime is known.

### Steps

1. Sign B1 in at `/portal/login`; confirm only Tenant B/B1-B data.
2. Keep a protected route open.
3. The authorized operator revokes B1's refresh session using the approved Auth control and records only the time/outcome.
4. Do not clear local storage; that is not token expiry.
5. Wait until the already-issued access token expires or trigger the next approved refresh boundary.
6. Navigate to another protected Portal page or refresh.
7. Observe session and data behavior.

### Expected result

Refresh fails, the client reports a null/signed-out session, the protected route returns to `/portal/login`, and no B1 data remains accessible.

### Failure result

Data remains accessible after the issued token's known expiry/failed refresh, an endless error state occurs, or stale customer content persists. If the operator cannot prove actual revocation/expiry, record Blocked.

### Recovery/rollback

Revoke every B1 session, clear the disposable browser profile, and issue a fresh temporary credential only if later scenarios require it and the approver permits.

## Scenario 8 — Successful password recovery

Identity: A2  
Prerequisites: controlled private mailbox and exact reset redirect allowlisted.

### Steps

1. Open `/portal/login` in a clean browser.
2. Choose **Forgot your password?**.
3. Confirm heading **Reset your password**.
4. Enter `a2.recovery@tenant-a.johai.test` in **Email address**.
5. Choose **Send reset email**.
6. Confirm: **If an eligible portal account matches that address, a reset email is on its way.**
7. In the approved private mail-sink interface, open only the newest A2 recovery message. Do not screenshot or copy the link.
8. Activate the link in the same approved browser context.
9. Confirm `/portal/reset-password` shows **Choose a new password**.
10. Generate a new unique A2 password in the secret manager.
11. Enter it in **New password** and **Confirm password**.
12. Choose **Update password**.
13. Confirm navigation to `/portal` and A2-A-only content.
14. Sign out; verify the new password signs in and the previous password does not.

### Expected result

The valid recovery event permits one password update, clears recovery mode, and opens only A2's Portal. The request response remains enumeration-resistant.

### Failure result

No message under approved mail conditions, wrong redirect, unavailable valid link, password update error, old password still accepted after completion, or wrong profile/tenant.

### Recovery/rollback

Revoke A2 sessions and issue a new recovery message only after review. Destroy obsolete password-manager versions and purge recovery messages at cleanup.

## Scenario 9 — Recovery callback failure

Identity: A2  
Use an approved malformed, already-used, or genuinely expired recovery context without exposing its value.

### Steps

1. First open `/portal/reset-password` with no recovery context.
2. Confirm the unavailable/expired state and **Request another email** link.
3. Separately attempt the approved already-used or expired A2 recovery link after scenario 8.
4. Observe the visible message and session state.
5. Confirm A2's current password still works and no new password was set by the failed attempt.

### Expected result

The page states **This recovery link is unavailable or has expired.** No password mutation or unintended session is created.

### Failure result

Password fields become usable without valid recovery, an old link mutates the password, an unintended session appears, or sensitive callback details display.

### Recovery/rollback

Revoke A2 sessions, rotate the password through a new approved recovery if integrity is uncertain, purge links, and escalate security review.

## Scenario 10 — Suspended customer

Identity: A3  
Prerequisites: A3-A suspended; no active A3 profile; no owner/member role.

### Steps

1. Open `/portal/login`.
2. Enter A3's alias and approved secret.
3. Choose **Sign in**.
4. Observe the Portal gate.
5. Attempt direct navigation to `/portal/appointments`, `/portal/messages`, `/portal/documents`, and `/portal/support`.
6. If approved, request a known A3 document through the Portal download endpoint without recording its ID.

### Expected result

Auth may accept the password, but RLS returns zero active profiles. The Portal shows **Portal access is unavailable** and no branding, profile selector, or child data. Document access produces no signed URL.

### Failure result

Any active Portal, customer data, or distinguishable document existence is a security failure.

### Recovery/rollback

Choose **Sign out**, revoke A3 sessions, preserve sanitized evidence, and stop tenant/security testing.

## Scenario 11 — Invited but inactive customer

Identity: A4  
Prerequisites: A4-A invited; invitation unaccepted/unexpired; no active profile or owner/member role.

### Steps

1. Sign in at `/portal/login` with A4's approved credentials.
2. Observe the Portal gate.
3. Attempt direct navigation to each protected Portal feature.
4. Confirm the invitation remains unaccepted in trusted administrative evidence.

### Expected result

Auth may succeed, but invited status is not active. The Portal displays **Portal access is unavailable**, exposes no child data, and does not redeem the invitation.

### Failure result

Portal access, automatic acceptance, profile activation, data visibility, or a browser redemption request is Failed and requires security review.

### Recovery/rollback

Sign out, revoke A4 sessions, and retain the invitation/state unchanged until the defect is reviewed. Never redeem A4 to make the scenario pass.

## Scenario 12 — Customer with multiple business profiles

Identity: A5  
Prerequisites: A5-A and A5-B active, distinct branding/data, no owner/member role.

### Steps

1. In the disposable browser, clear only A5's remembered selection key `johai-portal-tenant:<A5 user id>` without copying the user ID into evidence.
2. Sign A5 in at `/portal/login`.
3. Confirm **Choose your customer portal** lists Northstar Lantern Test Studio and Blue Meadow Test Workshop.
4. Select Northstar Lantern Test Studio.
5. Visit all six Portal pages and confirm only A5-A markers.
6. Use the selector whose accessible label is **Current customer portal** to choose Blue Meadow Test Workshop.
7. Visit all six Portal pages and confirm only A5-B markers.
8. Refresh and confirm the selected allowed profile persists.
9. If approved, alter the remembered selection to a different customer's profile ID from the restricted manifest and reload; do not put that ID in evidence.

### Expected result

A5 can choose only its two profiles. Switching recreates the tuple-bound repository; data never mixes. A forged or stale selection grants no other profile.

### Failure result

Missing authorized profile, extra profile, mixed tenant data, another customer's data, or local storage acting as authority.

### Recovery/rollback

Sign out, revoke A5 sessions, clear remembered selection, and stop cross-tenant testing for security review.

## Scenario 13 — Multi-tab session propagation

Identity: A1  
Prerequisite: two tabs in the same disposable browser profile and origin.

### Steps

1. Open `/portal/login` in Tab 1 and Tab 2.
2. Sign in A1 in Tab 1.
3. Activate Tab 2 and confirm it observes the Portal session after the normal auth event/refresh behavior.
4. Keep both tabs open across the approved token-refresh boundary.
5. Confirm both remain A1-A only.
6. Choose **Sign out** in Tab 1.
7. Activate or refresh Tab 2 and confirm it returns to login without stale data.

### Expected result

Sign-in, refresh, and local sign-out propagate consistently under the Portal storage key. No duplicate GoTrue client warning or cross-surface session appears.

### Failure result

Conflicting sessions, stale protected data, duplicate-client warning, or workspace-key mutation.

### Recovery/rollback

Close both tabs, revoke A1 sessions, clear the disposable browser profile, and destroy any capture containing storage values.

## Scenario 14 — Customer Portal and Business Workspace session isolation

Identities: A1 plus Owner A  
Prerequisite: one browser profile, separate tabs, no mixed database roles.

### Steps

1. In Tab 1 open `/portal/login` and sign in A1.
2. Confirm A1-A Portal data.
3. In Tab 2 open `/auth/login` and sign in Owner A through the Business Workspace Supabase login. Do not use a dashboard password cookie as evidence.
4. Confirm Owner A reaches only its authorized Business Workspace.
5. Return to Tab 1 and confirm the Portal session/data remains A1.
6. In Tab 1 choose **Sign out**.
7. Return to Tab 2 and confirm the workspace session remains active.
8. Sign out Owner A through the workspace flow and confirm no Portal session reappears.

### Expected result

Portal uses `johai-customer-portal-session`; workspace uses `johai-auth-session`. Both clients/sessions coexist without merging. Portal local logout leaves the workspace session intact.

### Failure result

One surface overwrites, adopts, or logs out the other; A1 gains workspace access; Owner A gains a Portal profile; or a duplicate-client warning appears.

### Recovery/rollback

Revoke both users' sessions, clear both storage keys and the browser profile, and stop. This scenario proves two-principal session isolation only; it is not mixed-principal RLS evidence.

## Scenario 15 — Demo creates no Supabase client

Identity: none  
Environment: clean development/test context; production behavior checked separately.

### Steps

1. Start with a clean disposable browser profile and no portal/workspace storage entries.
2. Open `/portal/demo` in the approved development/test deployment.
3. Confirm the banner states **Demo environment · Fictional data only** and **No Supabase session, production tenant, or external data service is used.**
4. Navigate through demo Overview, Appointments, Messages, Documents, Profile, and Support.
5. With approved developer tools, confirm no Supabase Auth request, Auth client warning, session, or auth storage entry is created.
6. In the production deployment, open `/portal/demo` and confirm 404.

### Expected result

Demo uses only in-memory fictional data, creates no Supabase client or session, and is unavailable in production.

### Failure result

Any Supabase Auth/client activity, auth storage mutation, external data access, production availability, or real data is Failed.

### Recovery/rollback

Close the demo, clear the disposable browser profile, stop the run if external/real data was contacted, and create a security defect.

## Cross-tenant document checks

These checks supplement scenarios 1, 10, 11, and 12 and use IDs only from the restricted manifest:

1. While signed in as A1, request `DOC_B1_B`, `DOC_A5_A`, and `DOC_A1_REVOKED` through `/api/portal/documents/<id>/download`.
2. While signed in as B1, request `DOC_A1_CURRENT` and `DOC_A5_B`.
3. Repeat once with a malformed ID.
4. Confirm every unauthorized/revoked/malformed request returns the same generic 404 response and no signed URL.
5. Without a bearer session, confirm the endpoint returns 401.
6. Never store the actual IDs or response URLs in ordinary evidence.

Any identifier enumeration, cross-tenant URL, revoked URL, or differential secret-bearing response is a security incident.

## Final procedure closeout

1. Record all 15 outcomes in the authentication validation sprint.
2. Link sanitized evidence references; do not embed secrets.
3. Record defects and owners without inventing names/dates.
4. Execute the complete cleanup checklist, including session revocation and signed-URL wait.
5. Independently verify no synthetic residue remains.
6. Only then rerun certification scoring.

Executing all procedures does not automatically make authentication production-ready. Every scenario must pass, tenant/storage/security evidence must pass, cleanup must be verified, remaining production gates must close, and a human must approve certification.
