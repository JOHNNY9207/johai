# Customer Portal Synthetic Identity Provisioning Guide

## Purpose and status

This is the human-operator provisioning guide for the **Customer Portal** synthetic authentication environment. It prepares a repeatable non-production run; it does not authorize a run.

- Package revision: **2026-07-14.1**
- Status: **Prepared; provisioning approval Pending**
- Identities created by this documentation work: **None**
- Production customer data allowed: **No**
- SQL Editor allowed: **No**
- Migration changes or reruns allowed: **No**
- Application changes allowed: **No**

The production-security migration is already Applied and immutable. Do not modify, delete, replace, or rerun it. This guide never instructs an operator to open Supabase **SQL Editor**.

## Source-of-truth order

1. [Customer Portal Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md) — scope and security policy.
2. [Test Data Matrix](TEST_DATA_MATRIX.md) — exact aliases, state, values, and relationships.
3. This guide — operator sequence and screen instructions.
4. [Synthetic Environment Checklist](SYNTHETIC_ENVIRONMENT_CHECKLIST.md) — go/no-go, execution, cleanup, and sign-off.
5. [Authentication Test Procedures](AUTH_TEST_PROCEDURES.md) — scenario execution.
6. [Customer Portal Authentication Validation](../sprints/CUSTOMER_PORTAL_AUTH_VALIDATION.md) — actual evidence and results.
7. [Customer Portal V1 Final Certification](../sprints/CUSTOMER_PORTAL_V1_FINAL_CERTIFICATION.md) — production-readiness decision.

## Mandatory creation order

Follow this order without skipping or parallelizing stages:

1. Businesses
2. Owners
3. Invitations
4. Auth Users
5. Customer Profiles
6. Documents
7. Appointments
8. Messages
9. Support Requests

In this sequence, **Owners** means the two Business Workspace Auth records, Owner A and Owner B. **Auth Users** means the six customer Auth records, A1 through A5 and B1. Businesses are initially created with no `owner_user_id`; each is linked immediately after its owner exists. The current schema permits a temporarily empty owner field.

## UI-label and tool boundary

Supabase Dashboard labels in this guide were checked against current Supabase documentation on July 14, 2026. Supabase can change labels. If a named button or screen is absent, stop and ask the project administrator to identify the current equivalent; do not switch to SQL or improvise a different privilege path.

Official operator references:

- [Supabase users and Dashboard invitations](https://supabase.com/docs/guides/auth/users)
- [Password recovery](https://supabase.com/docs/guides/auth/passwords)
- [Redirect URL configuration](https://supabase.com/docs/guides/auth/redirect-urls)
- [Database and Table Editor](https://supabase.com/docs/guides/database/overview)
- [Storage Dashboard quickstart](https://supabase.com/docs/guides/storage/quickstart)
- [Private bucket access model](https://supabase.com/docs/guides/storage/buckets/fundamentals)

Supabase's **Send invitation** action is an Auth invitation. It is not a JOHAI `customer_portal_invitations` record and must not be used as a substitute for Customer Portal provisioning.

## Roles required for a run

No person may silently fill two approval roles unless the approving organization explicitly permits it.

| Role | Responsibility |
| --- | --- |
| Human approver | Authorizes environment, scope, operator, time window, evidence rules, and cleanup |
| Supabase operator | Performs Dashboard Auth and approved administrative data actions |
| Trusted-service operator | Runs the existing approved server-only invitation creation/redemption operation |
| Tester | Executes the 15 procedures without receiving service-role access |
| Security reviewer | Reviews tenant-denial, secret handling, incident, and cleanup evidence |
| Cleanup owner and backup | Revokes sessions and removes only this run's fixtures |

Names, approval times, and results stay **Pending** until a human supplies them. Do not invent them.

## Before opening Supabase: hard go/no-go

The operator completes [Synthetic Environment Checklist](SYNTHETIC_ENVIRONMENT_CHECKLIST.md) and confirms all of the following:

1. The selected project or branch is explicitly approved and isolated from production customer data.
2. The project reference is recorded in a restricted run record, not Git.
3. Schema and security-hardening state match the approved Customer Portal foundation.
4. The Applied migration will not be rerun.
5. The exact scope is 2 businesses, 8 Auth users, 7 profiles, and 7 invitations.
6. Every reserved alias and synthetic slug is absent before creation.
7. A private `.test` mail sink accepts all reserved aliases without public delivery.
8. The portal origin and `/portal/reset-password` are in Supabase Auth's redirect allowlist.
9. A password manager with expiring delivery is approved.
10. A trusted server operation can create/hash invitations and call the service-role-only redemption function without exposing the service key or raw token.
11. Approved privileged data paths exist for A3 suspension, A4 invited state, fixture creation, session revocation, and dependency-safe cleanup.
12. A private document bucket and exact server bucket allowlist are ready.
13. The maximum access-token lifetime and session-revocation method are documented.
14. Evidence location, retention, redaction, cleanup owner, backup owner, and deadline are approved.

Any missing item is **NO-GO**. Stop before creating the first business.

## Restricted run manifest

Before creation, the cleanup owner opens an encrypted temporary run manifest outside the repository. It contains:

- package revision and `RUN_ID`;
- approved project reference and environment classification;
- `T0`, test-window start/end, and cleanup deadline;
- every generated business, Auth, profile, invitation, document, and object identifier mapped to its symbolic alias;
- exact creation timestamps and operator initials;
- per-stage pass/fail/rollback state;
- secret-manager record references, never secret values;
- the exact Storage object paths needed for cleanup;
- session-revocation and cleanup evidence references.

Never put a password, service key, raw invitation token, recovery link, access/refresh token, cookie, authorization header, or signed URL in the manifest. Destroy the manifest only after independent cleanup verification.

## Stage 1 — Businesses

### Screen and buttons

1. Sign in to Supabase Dashboard using the approved administrator identity.
2. Select the approved organization and project. Compare the displayed project reference with the approved run record.
3. In the left navigation, choose **Table Editor**.
4. Select schema **public**, then table **businesses**.
5. Choose **Insert** → **Insert row**. If the Dashboard shows only **Insert row**, choose it.

### Tenant A row

Enter the Tenant A values from [Test Data Matrix](TEST_DATA_MATRIX.md):

- name `Northstar Lantern Test Studio`
- slug `northstar-lantern-test-studio`
- status `active`
- plan `internal`
- owner email `owner-a@tenant-a.johai.test`
- owner user ID empty

Leave generated ID and timestamps at their defaults. Choose **Save**. Copy the generated business ID only into the restricted manifest as `BUS_A_ID`.

### Tenant B row

Repeat **Insert** → **Insert row** for `Blue Meadow Test Workshop`, slug `blue-meadow-test-workshop`, owner email `owner-b@tenant-b.johai.test`, and an empty owner user ID. Choose **Save** and record the generated ID as `BUS_B_ID` only in the manifest.

### Expected result

- Exactly two new synthetic rows exist.
- Their slugs and names are visibly different.
- Neither row is linked to an owner yet.
- No pre-existing business row changed.

### Failure result and rollback

If a slug already exists, the wrong project is selected, an unexpected constraint appears, or any pre-existing row changes, stop. Do not rename an existing record. If the two new rows have no dependencies, delete only the exact rows listed in the manifest using the row action **Delete row**, confirm, record the rollback, and end the run. If dependencies exist or deletion is uncertain, do not cascade blindly; isolate the environment and escalate to the cleanup owner.

## Stage 2 — Owners

### Create Owner A

1. In Supabase Dashboard, choose **Authentication** → **Users**.
2. Choose **Add user** → **Create new user**. Do not choose **Send invitation**.
3. Enter `owner-a@tenant-a.johai.test`.
4. Retrieve Owner A's unique temporary password from the approved secret manager without copying it into notes or chat.
5. Confirm the **Auto Confirm User** control is present and enable it; all eight matrix users must be confirmed. If the control is absent, stop before creation. Do not substitute **Send invitation**. A project administrator must approve and attach a trusted Auth Admin creation procedure that sets the email-confirmed state before the run can restart.
6. Choose **Create user**.
7. Open the new user detail. Confirm the displayed email is exact and email confirmation is complete.
8. In **User Metadata**, choose **Edit** if available, set only `full_name` to `Avery Example Owner`, and save. If metadata editing is not present, stop and use only the separately approved trusted Auth Admin path; do not edit the Auth schema in Table Editor.
9. Record the generated UUID as `OWNER_A_ID` only in the restricted manifest.

### Link Owner A to Tenant A

1. Return to **Table Editor** → schema **public** → **businesses**.
2. Open the exact `northstar-lantern-test-studio` row.
3. Choose **Edit row**, set owner user ID to `OWNER_A_ID` from the manifest, and choose **Save**.
4. Confirm Tenant B remains ownerless.

### Create and link Owner B

Repeat the same sequence with `owner-b@tenant-b.johai.test`, display name `Blair Example Owner`, and `BUS_B`. Confirm Tenant A still points only to Owner A.

### Expected result

- Two confirmed owner Auth users exist.
- Tenant A points only to Owner A; Tenant B points only to Owner B.
- Owners have no Customer Portal invitation or profile.
- No customer Auth user exists yet.

### Failure result and rollback

If the wrong owner is linked, clear only the incorrect owner link first, save, and record the correction. On stage failure, remove owner links before deleting the two newly created Auth users. Never delete a pre-existing Auth user. If ownership cannot be cleared through the approved UI, stop and escalate; do not open SQL Editor.

## Stage 3 — Portal invitations

### Required trusted screen

JOHAI V1 currently has no customer-facing invitation creation or redemption screen. The Supabase **Authentication → Users → Add user → Send invitation** option is not the JOHAI portal invitation system. Therefore:

- use only the separately approved trusted server provisioning operation named in the run approval;
- that operation must generate a high-entropy raw token, calculate its lowercase SHA-256 hash, store only the hash, and retain the raw token only in the approved secret system;
- the service-role key and raw token must never enter a browser, Dashboard form, terminal transcript, documentation, screenshot, or tester device;
- if no approved operation exists, this screen is a hard stop and the run remains **Not provisioned**.

The operator selects the operation's **Create invitation** action only if its name, version, screen, and audit destination were approved before the run. Because no such JOHAI operator UI exists in this repository, this package does not invent button labels for it.

### Exact invitation order

Create, one at a time:

1. `INV_A1_A`
2. `INV_A2_A`
3. `INV_A3_A`
4. `INV_A4_A`
5. `INV_A5_A`
6. `INV_A5_B`
7. `INV_B1_B`

For each, select the exact business ID from the manifest, use the exact reserved email, leave lead ID empty, and apply the `T0` timestamps from the matrix. Every hash must be unique. A4 remains unaccepted and its raw token must never be redeemed.

### Expected result

- Seven invitation rows exist.
- All are unaccepted at this stage.
- All are unexpired through the approved redemption window.
- No Auth user or customer profile was created by invitation creation.

### Failure result and rollback

On any duplicate, wrong business/email, invalid hash shape, secret exposure, or audit failure, stop. Revoke/destroy the affected raw token, remove only the unaccepted invitation rows from this run using the approved trusted cleanup action, and record the failure. A service-role exposure is a security incident requiring credential rotation and audit review before any retry.

## Stage 4 — Customer Auth users

Create customer users in this exact order: A1, A2, A3, A4, A5, B1.

For each identity:

1. Go to **Authentication** → **Users**.
2. Choose **Add user** → **Create new user**. Never use **Send invitation** for this step.
3. Enter the exact `.test` email from the matrix.
4. Retrieve a unique generated password from the secret manager and enter it without copying it elsewhere.
5. Confirm **Auto Confirm User** is present and enable it, then choose **Create user**. If it is absent, stop before creation and use only a separately approved trusted Auth Admin creation procedure that guarantees confirmed email state; never substitute **Send invitation** or leave the user unconfirmed.
6. Open the new user and confirm the email and confirmation state.
7. Choose **Edit** in **User Metadata** if available; set only `full_name` to the matrix display name. If unavailable, use only the approved trusted Auth Admin path.
8. Record the UUID under the identity alias in the restricted manifest.
9. Check **Table Editor** → **businesses** and **business_members**: the new UUID must be absent globally. Do not add it anywhere.

### Expected result

- There are exactly eight run-owned Auth users: two owners and six customers.
- Every email is confirmed and exact.
- A5 has one Auth user only.
- Customer identities have no owner/member role.
- No profile is active yet.

### Failure result and rollback

If an alias already exists, do not reuse or reset it. Stop and have the approver select a clean environment or authorize a new reserved alias package revision. If a customer appears in any owner/member record, remove that newly created mixed assignment immediately through the approved admin UI, revoke its sessions, and stop the run for security review. Delete new customer Auth users only after any profile or invitation dependencies are removed.

## Stage 5 — Customer profiles

### Active profile redemption

Use the approved trusted server **Redeem invitation** operation for these six tuples, in order:

1. A1 / Tenant A
2. A2 / Tenant A
3. A3 / Tenant A
4. A5 / Tenant A
5. A5 / Tenant B
6. B1 / Tenant B

For each operation, the trusted server supplies the invitation hash and authoritative Auth UUID. It must call the existing service-role-only redemption function. The browser and tester never call it. Record only the returned symbolic profile mapping and success/failure, not raw identifiers or tokens, in ordinary evidence.

After each redemption, use the approved privileged admin data screen to apply the safe contact/address/notification values from the matrix. If Supabase Table Editor is the approved data screen, use **Table Editor** → **customer_profiles** → select exact row → **Edit row** → **Save**. Never change business ID, Auth user ID, profile ID, or status during this enrichment.

### Suspend A3

After A3 redemption succeeds:

1. Open the approved admin profile screen. If Supabase Table Editor is approved, open **Table Editor** → **customer_profiles** → A3's exact profile.
2. Choose **Edit row**.
3. Change only status from `active` to `suspended`.
4. Choose **Save**.
5. Confirm no active profile exists for A3 anywhere.

### Create A4 invited profile

Do not redeem A4. Through the approved privileged admin path, create exactly one A4/Tenant A profile with status `invited` and matrix values. If Supabase Table Editor is the approved path, use **Table Editor** → **customer_profiles** → **Insert** → **Insert row** → **Save**. Confirm A4's invitation remains unaccepted and unexpired.

### Add branding

Using the approved admin data screen, open `customer_portal_branding` and create one row per business with the matrix values. If using Table Editor, choose **Insert** → **Insert row** → **Save**. Never copy private business settings into portal branding.

### Expected result

- Exactly seven profiles exist.
- A1, A2, A5-A, A5-B, and B1 are active.
- A3 is suspended.
- A4 is invited and its invitation is unaccepted.
- Six invitations are accepted; A4's is not.
- A5 has exactly two active profiles under one Auth UUID.
- Tenant branding is visibly distinct.

### Failure result and rollback

If redemption reports `Invitation unavailable`, do not retry repeatedly and do not loosen security. Check only the approved alias-level prerequisites: confirmation, exact email, unexpired/unaccepted invitation, unique hash, and absence of owner/member roles. On partial failure, stop, revoke sessions, and delete only this run's child/profile/invitation records in reverse dependency order through approved tooling. Never mark an invitation accepted manually to imitate successful redemption.

## Stage 6 — Documents

### Confirm or create the private bucket

1. In Supabase Dashboard choose **Storage**.
2. If the approved dedicated bucket already exists, open it and verify it is **Private**. Do not reuse an unrelated bucket.
3. If bucket creation is explicitly approved, choose **New Bucket**, enter `customer-portal-synthetic-private`, keep **Public bucket** disabled, then choose **Create Bucket**.
4. Confirm the deployed server's exact allowlist includes this bucket. Do not expose or change secrets in this runbook.

### Upload objects

For each matrix document:

1. In **Storage**, open the private bucket.
2. Navigate/create folders matching the exact manifest path `<business_uuid>/<profile_uuid>/`.
3. Choose **Upload File** and select the prepared plain-text synthetic file.
4. Confirm the displayed filename, path, MIME type, and byte size.
5. Record the path under its alias in the restricted manifest.

### Create document metadata

Using the approved admin data screen, add one `customer_portal_documents` row per uploaded object. If Table Editor is approved: **Table Editor** → `customer_portal_documents` → **Insert** → **Insert row** → enter exact business/profile tuple, type, title, bucket, path, MIME type, displayed byte size, and revocation value → **Save**.

After `DOC_A1_ACK` exists, create its acknowledgement using the exact document/profile/business tuple through the approved admin path. Do not acknowledge `DOC_A1_REVOKED`.

### Expected result

- Nine metadata rows correspond to nine private objects.
- The revoked row is invisible to the customer and never creates a signed URL.
- The acknowledged record displays as acknowledged.
- No public URL exists.

### Failure result and rollback

If upload succeeds but metadata fails, delete only that uploaded object using the Storage file action **Delete** and confirm. If metadata succeeds but the path/bucket/size is wrong, delete the exact metadata row first, then the exact object, and recreate only after review. Never overwrite an existing object or enable a public bucket to make the test pass.

## Stage 7 — Appointments

1. Open the approved admin data screen for `customer_portal_appointments`.
2. If Table Editor is approved, choose **Table Editor** → table → **Insert** → **Insert row**.
3. Add matrix appointments in listed order, using explicit offset-bearing timestamps derived from `T0` and the exact matching business/profile tuple.
4. Choose **Save** after each row and record its symbolic alias in the manifest.

Expected: ten appointments exist; the five A1 statuses render in the correct upcoming/history group, A3/A4 markers remain inaccessible, A5 shows different A/B records, and B1 sees only B1-B.

Failure: if timezone, tuple, status, or date classification is wrong, delete only that new row and recreate it after correction. Do not change database constraints or application formatting.

## Stage 8 — Messages

1. Open the approved admin data screen for `customer_portal_messages`.
2. Add the nine pre-seeded rows in matrix order.
3. For `MSG_A1_HIDDEN`, set customer-visible to false; all others are true.
4. Choose **Save** per row.

Expected: visible customer messages render only under the matching tuple; the hidden control never renders. Customer-authored insertion is tested later in the Portal, not pre-seeded with elevated tooling.

Failure: if hidden content appears through the Portal or a customer can set sender/visibility, stop immediately, revoke sessions, preserve sanitized evidence, and treat it as a security incident. Do not continue to later stages.

## Stage 9 — Support requests

1. Open the approved admin data screen for `customer_portal_requests`.
2. Add the nine pre-seeded rows in matrix order using the exact type, status, subject, detail, and tuple.
3. Choose **Save** after each row.

Expected: A1 sees the four display states, A3/A4 see no Portal, A5 sees one distinct request per selected tenant, and B1 sees only B1-B. Browser-created `open` behavior is tested later through **Support** → **New request**.

Failure: if a tuple is wrong, delete only that new row before testing. Pre-seeded states do not prove status-transition workflow; record them as rendering fixtures only.

## Provisioning completion gate

Provisioning is **Complete for testing** only when the checklist independently confirms:

- exact counts and aliases;
- correct owner/customer separation;
- six accepted invitations plus A4 unaccepted;
- exact profile states;
- A5's two active profiles;
- distinct branding and tuple-scoped child data;
- private bucket and allowlist;
- credential delivery to named testers;
- session revocation and cleanup paths rehearsed;
- no secret exposure and no real data.

This status does not mean scenarios passed, authentication is production-ready, or Customer Portal V1 is certified.

## Cleanup and rollback summary

Detailed checkboxes are in [Synthetic Environment Checklist](SYNTHETIC_ENVIRONMENT_CHECKLIST.md). The mandatory sequence is:

1. Close the test window and revoke all run-owned sessions.
2. Preserve sanitized results and incident evidence.
3. Remove acknowledgements.
4. Remove messages, support requests, and appointments.
5. Remove private Storage objects, then document metadata.
6. Remove remaining portal child data.
7. Remove profiles.
8. Remove invitations and branding.
9. Remove owner/member links, then businesses.
10. Delete the eight Auth users last.
11. Purge mail and secrets; clear both auth storage keys, selected-profile storage, cookies, service workers, and disposable browser profiles.
12. Wait longer than the 60-second signed-URL lifetime and run approved read-only cleanup checks through trusted tooling.

Rollback means selective teardown of this run's fixtures. It never means reversing/rerunning a migration, dropping schema objects, restoring the full database, or deleting by wildcard. A disposable branch reset requires separate approval and proof that the branch contains no unrelated work.

## Operator stop conditions

Stop immediately for any wrong project, real data, unexpected schema or policy drift, extra principal, mixed customer/workspace identity, cross-tenant visibility, hidden-message visibility, public document access, secret exposure, missing cleanup capability, or unapproved tool. Revoke sessions, contain the environment, preserve sanitized evidence, notify the security reviewer, and do not resume without a new go/no-go decision.
