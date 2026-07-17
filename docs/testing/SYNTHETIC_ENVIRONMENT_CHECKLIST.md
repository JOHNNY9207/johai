# Customer Portal Synthetic Environment Checklist

## Record header

- Platform layer: **Customer Portal**
- Package revision: **2026-07-14.1**
- `RUN_ID`: Pending
- Target environment: Pending
- Environment classification: Pending
- Human approver: Pending
- Supabase operator: Pending
- Trusted-service operator: Pending
- Tester: Pending
- Security reviewer: Pending
- Cleanup owner: Pending
- Cleanup backup: Pending
- Approved test-window start/end: Pending
- Cleanup deadline: Pending
- Final go/no-go: **Pending**

This checklist is the run record. Store the completed copy in the approved access-controlled evidence location. Do not enter passwords, UUIDs, tokens, cookies, headers, service keys, invitation or recovery links, signed URLs, or real customer content.

## Source-of-truth order

Scope and security policy come from [Customer Portal Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md). Exact values come from [Test Data Matrix](TEST_DATA_MATRIX.md). Operator steps come from [Synthetic Environment Setup](SYNTHETIC_ENVIRONMENT_SETUP.md). Scenario steps come from [Authentication Test Procedures](AUTH_TEST_PROCEDURES.md). Actual results belong in [Customer Portal Authentication Validation](../sprints/CUSTOMER_PORTAL_AUTH_VALIDATION.md), and production readiness belongs in the final certification record.

## Evidence rules

- [ ] Evidence location and retention period approved.
- [ ] Evidence uses only aliases, timestamps, response classes, routes, sanitized messages, and pass/fail outcomes.
- [ ] Screenshots hide browser address-bar codes, email links, Auth identifiers, row identifiers, and project secrets.
- [ ] Network capture redacts cookies and authorization values before storage.
- [ ] No secret appears in Git, docs, chat, tickets, terminal history, CI logs, screenshots, or ordinary browser logs.
- [ ] The restricted run manifest is encrypted, access controlled, excluded from Git, and assigned a destruction deadline.

Any failed evidence rule is **NO-GO**.

## Approval and environment go/no-go

- [ ] A human explicitly approved this package revision and exact fixture scope.
- [ ] The target Supabase project/branch and project reference were independently confirmed.
- [ ] The target is isolated non-production and contains no production customer data.
- [ ] The target is not a production project. Any production project is an unconditional **NO-GO** for this package; a different future plan would require separate review.
- [ ] Schema/version parity with the approved Customer Portal foundation is confirmed.
- [ ] Production-security hardening is recorded as resolved in the current project state.
- [ ] The Applied migration is marked immutable and will not be repeated.
- [ ] No migration, verification file, schema object, policy, function, grant, or application file will be changed by provisioning.
- [ ] Reserved tenant slugs and all eight `.test` aliases are absent before creation.
- [ ] Exact scope is 2 businesses, 8 Auth users, 7 profiles, 7 invitations, and only the matrix child fixtures.
- [ ] No-profile and mixed owner/member/customer principals are recorded as out of scope.
- [ ] Named operator, tester, security reviewer, cleanup owner, and backup accepted their roles.
- [ ] Test window and cleanup deadline are bounded and approved.
- [ ] Any Pending item above results in **NO-GO**.

Go/no-go decision: Pending  
Decided by: Pending  
Decision date/time: Pending  
Evidence reference: Pending

## Tooling and security preflight

- [ ] Private `.test` SMTP sink receives all reserved aliases without public delivery.
- [ ] Password manager generates unique temporary passwords and supports expiring access-controlled delivery.
- [ ] Trusted server provisioning operation is named, versioned, approved, and auditable.
- [ ] Trusted operation can create unique invitation hashes and call service-role-only redemption without exposing the service key or raw token.
- [ ] Approved privileged admin path exists for A3 suspension.
- [ ] Approved privileged admin path exists for A4 invited-profile creation without redemption.
- [ ] Approved privileged admin path exists for child-fixture creation and dependency-safe deletion.
- [ ] Supabase session-revocation method is documented and available.
- [ ] Access-token lifetime and refresh boundary are known.
- [ ] Portal origin plus `/portal/reset-password` are in Auth redirect URLs.
- [ ] Portal environment has the correct public Supabase URL and anon/publishable key.
- [ ] Portal and workspace use separate storage keys: `johai-customer-portal-session` and `johai-auth-session`.
- [ ] Private Storage bucket is approved, private, and present in the exact server allowlist.
- [ ] Cleanup can remove exact run resources without wildcard deletion or schema changes.
- [ ] Supabase SQL Editor is not part of the run.

## Business checklist

- [ ] `BUS_A` created as Northstar Lantern Test Studio with exact slug and no initial owner UUID.
- [ ] `BUS_B` created as Blue Meadow Test Workshop with exact slug and no initial owner UUID.
- [ ] Generated IDs recorded only in the restricted manifest.
- [ ] No pre-existing business changed.
- [ ] Tenant names, slugs, branding markers, and support addresses are visibly distinguishable.

Expected result: exactly two run-owned businesses.  
Failure result: stop; remove only dependency-free run-owned rows or escalate cleanup.  
Rollback evidence: Pending

## Supabase Auth checklist

### Owners

- [ ] Owner A created through **Authentication → Users → Add user → Create new user**.
- [ ] Owner B created through **Authentication → Users → Add user → Create new user**.
- [ ] **Send invitation** was not used as a portal invitation substitute.
- [ ] Both owner emails are exact and confirmed.
- [ ] Owner metadata contains only the exact fictional full name.
- [ ] Tenant A owner field links only Owner A.
- [ ] Tenant B owner field links only Owner B.
- [ ] Owners have no customer profile or portal invitation.

### Customer users

- [ ] A1 created, confirmed, and has exact full-name metadata.
- [ ] A2 created, confirmed, and has exact full-name metadata.
- [ ] A3 created, confirmed, and has exact full-name metadata.
- [ ] A4 created, confirmed, and has exact full-name metadata.
- [ ] A5 created once, confirmed, and has exact full-name metadata.
- [ ] B1 created, confirmed, and has exact full-name metadata.
- [ ] Every temporary password is unique.
- [ ] No password value appears in the run record.
- [ ] A1–A5 and B1 are absent from all owner/member records globally.
- [ ] There are exactly eight run-owned Auth users.

Expected result: two workspace-only owners and six portal-only customers.  
Failure result: revoke the affected session, remove mixed assignments, stop, and obtain security review.  
Rollback evidence: Pending

## Invitation checklist

- [ ] Trusted server operation—not Supabase Auth invitation—created every portal invitation.
- [ ] `INV_A1_A` exact business/email, unique valid hash, accepted by redemption.
- [ ] `INV_A2_A` exact business/email, unique valid hash, accepted by redemption.
- [ ] `INV_A3_A` exact business/email, unique valid hash, accepted before suspension.
- [ ] `INV_A4_A` exact business/email, unique valid hash, unaccepted and unexpired.
- [ ] `INV_A5_A` exact Tenant A business/email, unique valid hash, accepted.
- [ ] `INV_A5_B` exact Tenant B business/email, different unique hash, accepted.
- [ ] `INV_B1_B` exact business/email, unique valid hash, accepted.
- [ ] All lead IDs are empty unless a separate same-tenant lead fixture was explicitly approved.
- [ ] Every expiry covers the complete redemption/test window.
- [ ] No raw token, actual hash, service key, or invitation link appears in evidence.
- [ ] A4 was not redeemed.

Expected result: six accepted invitations and one unaccepted A4 invitation.  
Failure result: stop, revoke/destroy affected raw material, and remove only unaccepted run-owned invitations through trusted cleanup.  
Rollback evidence: Pending

## Customer-profile checklist

- [ ] A1-A active.
- [ ] A2-A active.
- [ ] A3-A redeemed active first, then suspended through approved administration.
- [ ] A4-A invited and never redeemed.
- [ ] A5-A active.
- [ ] A5-B active under the same A5 Auth UUID.
- [ ] B1-B active.
- [ ] Exactly seven profiles exist.
- [ ] Each child tuple uses its profile's exact business.
- [ ] Shared contact, language, communication, address, and notification values match the matrix.
- [ ] A3 has zero active profile anywhere.
- [ ] A4 has zero active profile anywhere.
- [ ] Owners have zero profiles.
- [ ] No profile belongs to a real customer.

## Portal checklist

- [ ] `/portal/login` shows **Welcome back**, **Email address**, **Password**, **Sign in**, and **Forgot your password?**.
- [ ] `/portal` is the canonical dashboard; `/portal/dashboard` is not used.
- [ ] Protected navigation exposes only Overview, Appointments, Messages, Documents, Profile, and Support.
- [ ] No CRM internals, Business Brain, Knowledge Center, AI orchestration, internal notes, billing, or Executive Dashboard appears.
- [ ] Tenant A branding is correct.
- [ ] Tenant B branding is visibly different.
- [ ] A single-profile customer enters its one Portal without a selector.
- [ ] A5 sees **Choose your customer portal** and later **Current customer portal**.
- [ ] **Sign out** removes only the local Portal session.
- [ ] `/portal/demo` uses no Supabase client in development/test and returns 404 in production.
- [ ] No duplicate GoTrue client or hydration warning appears.

## Document and Storage checklist

- [ ] Dedicated bucket exists and is private.
- [ ] Bucket name is present in the exact server allowlist.
- [ ] Object paths are `<business_uuid>/<profile_uuid>/<filename>` with no unsafe segments.
- [ ] Nine synthetic objects and nine matching metadata rows exist.
- [ ] Metadata tuple, path, MIME type, and actual byte size match each object.
- [ ] `DOC_A1_ACK` has one matching acknowledgement.
- [ ] `DOC_A1_REVOKED` is marked revoked and has no acknowledgement.
- [ ] Valid Portal download returns a no-store 60-second signed URL.
- [ ] Revoked, wrong-tenant, wrong-profile, malformed, nonallowlisted, wrong-prefix, and missing documents return no URL.
- [ ] Direct anonymous and ordinary authenticated Storage access fails.
- [ ] Public bucket access is disabled.

## Appointment checklist

- [ ] All ten rows match the profile/business tuple.
- [ ] A1 has scheduled, confirmed, completed, cancelled, and no-show states.
- [ ] All timestamps have explicit offsets and are classified correctly relative to `T0`.
- [ ] Timezones are valid IANA values.
- [ ] Provider/external IDs never render to customers.
- [ ] Only customer-safe meeting/reschedule/cancel links are used.
- [ ] A3/A4 markers remain inaccessible.
- [ ] A5-A and A5-B display only under their selected Portal.
- [ ] B1 sees only B1-B.

## Message checklist

- [ ] Nine pre-seeded message rows match exact tuples.
- [ ] `MSG_A1_HIDDEN` is not customer-visible and never renders.
- [ ] No internal operational note or secret exists in any fixture.
- [ ] Customer-created message is forced to sender `customer` and visible `true`.
- [ ] Customer cannot choose sender `human`/`ai` or visibility.
- [ ] **Request a person** behavior records human support requested without exposing internal workflow.
- [ ] Tenant A/B markers never mix.

## Support checklist

- [ ] Nine pre-seeded requests match exact tuples.
- [ ] A1 renders open, in-progress, resolved, and closed fixtures.
- [ ] **Support → New request** opens **Create a support request**.
- [ ] Browser-created request uses **Human assistance**, exact synthetic subject/detail, and **Send request**.
- [ ] New browser request receives status `open`.
- [ ] Customer cannot set or change status.
- [ ] A3/A4 requests remain inaccessible.
- [ ] A5 and B1 see only matching selected tuples.
- [ ] Pre-seeded status rendering is not reported as proven lifecycle transition.

## Authentication checklist

- [ ] Scenario 1 valid A1 login executed.
- [ ] Scenario 2 invalid A1 password executed without retaining the attempted value.
- [ ] Scenario 3 A1 local logout executed.
- [ ] Scenario 4 protected-route redirect after logout executed.
- [ ] Scenario 5 active-session browser refresh executed.
- [ ] Scenario 6 token refresh executed at an approved boundary.
- [ ] Scenario 7 B1 real expiry/revocation executed without substituting local-storage deletion.
- [ ] Scenario 8 A2 successful password recovery executed.
- [ ] Scenario 9 A2 used/expired/malformed recovery failure executed.
- [ ] Scenario 10 A3 suspended denial executed.
- [ ] Scenario 11 A4 invited/inactive denial executed.
- [ ] Scenario 12 A5 multi-profile selection and switching executed.
- [ ] Scenario 13 A1 multi-tab propagation executed.
- [ ] Scenario 14 A1/Owner A Portal-workspace session isolation executed.
- [ ] Scenario 15 identity-free demo boundary executed.
- [ ] Every result is recorded as Passed, Failed, or Blocked—never inferred.

## Recovery checklist

- [ ] A2 mailbox is controlled and private.
- [ ] Redirect allowlist includes the exact `/portal/reset-password` origin.
- [ ] `/portal/login` → **Forgot your password?** → **Send reset email** used.
- [ ] Generic success message appears without confirming account existence.
- [ ] Valid newest link opens **Choose a new password**.
- [ ] Password has at least 8 characters, matches confirmation, and remains secret.
- [ ] **Update password** succeeds and redirects to `/portal`.
- [ ] New password works; old password does not.
- [ ] Missing/malformed/expired/used link displays the unavailable/expired state.
- [ ] Failed link does not mutate password or create an unintended session.
- [ ] Mail message and secret-manager records are purged at cleanup.

## Suspended-account checklist

- [ ] A3 Auth email is confirmed.
- [ ] A3-A status is suspended.
- [ ] A3 has no active profile anywhere.
- [ ] A3 is absent from all owner/member roles.
- [ ] A3 may authenticate, but Portal displays **Portal access is unavailable**.
- [ ] A3 sees no profile selector, branding, appointments, messages, documents, or support data.
- [ ] A3 cannot download a known document ID.
- [ ] No attempt is made to redeem A3 again while suspended.

## Invited-account checklist

- [ ] A4 Auth email is confirmed.
- [ ] A4-A status is invited.
- [ ] A4 has no active profile anywhere.
- [ ] A4 invitation remains unaccepted and unexpired.
- [ ] A4 is absent from all owner/member roles.
- [ ] A4 may authenticate, but Portal displays **Portal access is unavailable**.
- [ ] A4 sees no Portal child data.
- [ ] A4 invitation is never redeemed during the test window.

## Multi-profile checklist

- [ ] A5 is exactly one Auth user.
- [ ] A5-A and A5-B are both active.
- [ ] No third profile exists for A5.
- [ ] Stored selection `johai-portal-tenant:<A5 user id>` is cleared before the first run.
- [ ] First entry shows **Choose your customer portal** with both distinct businesses.
- [ ] Selecting Tenant A shows only A5-A branding and fixtures.
- [ ] **Current customer portal** switches to Tenant B.
- [ ] Tenant B shows only A5-B branding and fixtures.
- [ ] Refresh preserves the selected allowed profile.
- [ ] Manually changing local selection to another customer's profile grants nothing.

## Cross-tenant checklist

- [ ] A1 sees only A1-A, not other Tenant A customers and not Tenant B.
- [ ] A2 sees only A2-A after recovery.
- [ ] B1 sees only B1-B.
- [ ] A5 sees only A5-A or A5-B according to current selection; results never mix.
- [ ] A1 requesting a B1/A5 document ID receives generic 404 and no signed URL.
- [ ] B1 requesting an A1/A5 document ID receives generic 404 and no signed URL.
- [ ] Revoked and hidden known IDs do not reveal existence through different messages.
- [ ] Browser-supplied wrong business/profile IDs create no authority.
- [ ] Direct REST denial, if executed, uses approved security tooling and redacts authorization; actual results are recorded separately.
- [ ] Any cross-tenant visibility triggers incident handling and stops the run.

## Cleanup checklist

- [ ] Test window closed; no further tester actions allowed.
- [ ] All eight run-owned access/refresh sessions revoked before data teardown.
- [ ] Sanitized results and defects captured before deletion.
- [ ] Security-incident evidence preserved separately without secrets.
- [ ] Exact acknowledgements deleted.
- [ ] Exact messages deleted.
- [ ] Exact support requests deleted.
- [ ] Exact appointments deleted.
- [ ] Exact private Storage objects deleted.
- [ ] Exact document metadata deleted after objects.
- [ ] Any remaining portal child fixtures deleted.
- [ ] Seven profiles deleted.
- [ ] Seven invitations deleted.
- [ ] Two branding rows deleted.
- [ ] Owner/member links cleared.
- [ ] Two synthetic businesses deleted.
- [ ] Eight Auth users deleted last.
- [ ] Private mail-sink messages purged.
- [ ] Temporary passwords, raw invitation material, recovery links, and secret references destroyed.
- [ ] Portal and workspace auth storage keys cleared on every test device.
- [ ] Selected-profile storage, cookies, service workers, and disposable browser profiles cleared.
- [ ] Waited longer than the maximum 60-second issued signed-URL lifetime.
- [ ] Approved read-only cleanup checks report no reserved aliases, businesses, profiles, invitations, child rows, objects, or sessions.
- [ ] Production/unrelated records confirmed unchanged.
- [ ] Restricted run manifest destroyed after independent cleanup confirmation.

Cleanup status: Pending  
Cleanup owner: Pending  
Cleanup date/time: Pending  
Independent verifier: Pending  
Exceptions: Pending

## Rollback checklist

- [ ] Rollback means selective fixture teardown, never migration reversal or rerun.
- [ ] Provisioning stopped immediately at the first failed stage.
- [ ] Created sessions revoked.
- [ ] Only resources listed in this run's manifest selected for removal.
- [ ] Reverse dependency order followed.
- [ ] No wildcard deletion, schema/table drop, or full-database restore used.
- [ ] Disposable branch reset used only with separate approval and proof of no unrelated work.
- [ ] Missing cleanup capability resulted in quarantine/disablement, assigned owner/deadline, and escalation—not ad hoc SQL.
- [ ] Secret exposure resulted in immediate revocation and incident review.
- [ ] Service-role exposure resulted in approved credential rotation and audit.
- [ ] Cross-tenant exposure resulted in containment, evidence preservation, and security-incident escalation.
- [ ] A retry requires a new go/no-go decision and new `RUN_ID`.

## Final run disposition

- Provisioning: Pending
- Authentication procedures: Pending
- Cross-tenant procedures: Pending
- Cleanup: Pending
- Exceptions: Pending
- Authentication production-ready: **NO**
- Customer Portal V1 certified by this checklist: **NO**

Completed by: Pending  
Reviewed by: Pending  
Date/time: Pending
