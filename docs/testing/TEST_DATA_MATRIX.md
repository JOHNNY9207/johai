# Customer Portal Synthetic Test Data Matrix

## Document status

- Platform layer: **Customer Portal**
- Package revision: **2026-07-14.1**
- Status: **Prepared; not approved for provisioning; not provisioned; not tested**
- Database migrations: **unchanged and immutable**
- SQL execution: **not authorized by this document**
- Production customer data: **forbidden**

This matrix defines aliases and safe fictional values only. Supabase-generated UUIDs, passwords, invitation hashes and raw tokens, recovery links, cookies, access or refresh tokens, service-role credentials, and signed URLs must never be copied into this file, Git, chat, tickets, screenshots, or ordinary logs. Keep the live alias-to-ID mapping in the access-controlled, short-lived run manifest described in [Synthetic Environment Setup](SYNTHETIC_ENVIRONMENT_SETUP.md).

## Source-of-truth order

If two documents appear to conflict, use this order:

1. [Customer Portal Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md) for approved scope and security policy.
2. This matrix for exact aliases, relationships, fixture values, and expected visibility.
3. [Synthetic Environment Setup](SYNTHETIC_ENVIRONMENT_SETUP.md) for operator sequence.
4. [Synthetic Environment Checklist](SYNTHETIC_ENVIRONMENT_CHECKLIST.md) for go/no-go and sign-off.
5. [Authentication Test Procedures](AUTH_TEST_PROCEDURES.md) for scenario execution.
6. [Customer Portal Authentication Validation](../sprints/CUSTOMER_PORTAL_AUTH_VALIDATION.md) for actual results.
7. [Customer Portal V1 Final Certification](../sprints/CUSTOMER_PORTAL_V1_FINAL_CERTIFICATION.md) for the production-readiness decision.

Preparation, approval, provisioning, testing, cleanup, and certification are separate facts. Never infer one from another.

## Run variables

The authorized operator records these values only in the restricted run manifest:

| Variable | Meaning |
| --- | --- |
| `RUN_ID` | Unique synthetic run identifier |
| `T0` | Approved test-window reference timestamp, stored with an explicit UTC offset |
| `BUS_A_ID`, `BUS_B_ID` | Generated business UUIDs |
| `OWNER_A_ID`, `OWNER_B_ID` | Generated owner Auth UUIDs |
| `A1_ID` through `A5_ID`, `B1_ID` | Generated customer Auth UUIDs |
| `CP_*_ID` | Generated customer-profile UUIDs |
| `INV_*_ID` | Generated invitation UUIDs |
| `DOC_*_ID` | Generated document UUIDs |

The manifest must be encrypted, access controlled, excluded from Git, and destroyed after cleanup verification.

## Required record counts

| Record type | Required count | Symbolic records |
| --- | ---: | --- |
| Businesses | 2 | `BUS_A`, `BUS_B` |
| Supabase Auth users | 8 | Owner A, Owner B, A1, A2, A3, A4, A5, B1 |
| Customer profiles | 7 | A1-A, A2-A, A3-A, A4-A, A5-A, A5-B, B1-B |
| Portal invitations | 7 | One per customer-profile tuple |
| Portal branding rows | 2 | Tenant A and Tenant B |

Any additional principal or tenant is out of scope. A no-profile customer and deliberately mixed owner/member/customer principals require a separate security-test approval.

## Businesses and owners

| Alias | Fictional name | Slug | Status | Plan | Owner alias | Owner email field |
| --- | --- | --- | --- | --- | --- | --- |
| `BUS_A` | Northstar Lantern Test Studio | `northstar-lantern-test-studio` | `active` | `internal` | Owner A | `owner-a@tenant-a.johai.test` |
| `BUS_B` | Blue Meadow Test Workshop | `blue-meadow-test-workshop` | `active` | `internal` | Owner B | `owner-b@tenant-b.johai.test` |

Create each business first with `owner_user_id` empty. After creating its owner Auth record, set `owner_user_id` to the generated owner UUID. The owner email field is descriptive only and is not authorization.

No `business_members` rows are required because ownership uses `owner_user_id`. If an independently approved workspace procedure requires membership rows, only Owner A → Tenant A and Owner B → Tenant B are allowed. No customer Auth UUID may appear in any business owner or member record anywhere in the environment.

## Supabase Auth identities

| Identity | Fictional display name | Reserved `.test` email | Required state | Portal relationship |
| --- | --- | --- | --- | --- |
| Owner A | Avery Example Owner | `owner-a@tenant-a.johai.test` | Confirmed | None; owns Tenant A only |
| Owner B | Blair Example Owner | `owner-b@tenant-b.johai.test` | Confirmed | None; owns Tenant B only |
| A1 | Casey Example Customer | `a1.active@tenant-a.johai.test` | Confirmed | One active Tenant A profile |
| A2 | Morgan Example Customer | `a2.recovery@tenant-a.johai.test` | Confirmed | One active Tenant A profile; controlled recovery inbox |
| A3 | Riley Example Customer | `a3.suspended@tenant-a.johai.test` | Confirmed | One suspended Tenant A profile; no active profile anywhere |
| A4 | Taylor Example Customer | `a4.invited@tenant-a.johai.test` | Confirmed | One invited Tenant A profile; invitation remains unaccepted |
| A5 | Jordan Example Customer | `a5.multi@customers.johai.test` | Confirmed | One active Tenant A profile and one active Tenant B profile |
| B1 | Quinn Example Customer | `b1.expiry@tenant-b.johai.test` | Confirmed | One active Tenant B profile; dedicated session-expiry identity |

For every Auth record:

- Set `raw_user_meta_data.full_name` to the exact fictional display name before redemption.
- Store no business UUID, customer-profile UUID, owner/member role, password, token, or authorization claim in user metadata.
- Use one unique temporary password generated and delivered through the approved secret manager.
- Keep the generated Auth UUID in the restricted run manifest only.

A5 is one Auth user, not two. Owner A and Owner B must have no customer profile or portal invitation.

## Customer profiles

Shared values:

- `lead_id`: empty
- `preferred_language`: `en`
- `notification_preferences`: exactly `{"appointments":true,"messages":true,"documents":true}`
- `address`: exactly `{"line1":"<matrix address line 1>","line2":"","city":"Example City","region":"Test Region","postalCode":"00000","country":"Test"}` with only the listed profile's line 1 substituted
- `created_at` and `updated_at`: leave at database defaults

| Profile alias | Auth identity | Business | Status | Full name | Contact email | Phone | Communication | Address line 1 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `CP_A1_A` | A1 | Tenant A | `active` | Casey Example Customer | `a1.active@tenant-a.johai.test` | `+1 202 555 0101` | `email` | `101 Fixture Way` |
| `CP_A2_A` | A2 | Tenant A | `active` | Morgan Example Customer | `a2.recovery@tenant-a.johai.test` | `+1 202 555 0102` | `email` | `102 Fixture Way` |
| `CP_A3_A` | A3 | Tenant A | `suspended` | Riley Example Customer | `a3.suspended@tenant-a.johai.test` | `+1 202 555 0103` | `email` | `103 Fixture Way` |
| `CP_A4_A` | A4 | Tenant A | `invited` | Taylor Example Customer | `a4.invited@tenant-a.johai.test` | `+1 202 555 0104` | `email` | `104 Fixture Way` |
| `CP_A5_A` | A5 | Tenant A | `active` | Jordan Example Customer | `a5.multi@customers.johai.test` | `+1 202 555 0151` | `email` | `151 Tenant A Fixture Way` |
| `CP_A5_B` | A5 | Tenant B | `active` | Jordan Example Customer | `a5.multi@customers.johai.test` | `+1 202 555 0152` | `portal` | `152 Tenant B Fixture Way` |
| `CP_B1_B` | B1 | Tenant B | `active` | Quinn Example Customer | `b1.expiry@tenant-b.johai.test` | `+1 202 555 0161` | `email` | `161 Fixture Way` |

The tuple `(auth_user_id, business_id)` must be unique. Every child record must repeat the exact profile/business tuple. Names must be no more than 200 characters, emails no more than 320, phones no more than 64, language and communication values must use the approved lowercase formats, and both JSON fields must remain bounded objects.

Six active profiles are created or activated only by the trusted server redemption path. A3 is redeemed while active and then changed to suspended by the approved admin path. A4 is created directly in invited state only through an approved trusted admin path and is never redeemed during the test window.

## Portal invitations

| Invitation alias | Customer/business | Final state | Relative timestamps |
| --- | --- | --- | --- |
| `INV_A1_A` | A1 / Tenant A | Accepted by trusted redemption | Created `T0 - 2 days`; expires `T0 + 5 days`; accepted during provisioning |
| `INV_A2_A` | A2 / Tenant A | Accepted by trusted redemption | Created `T0 - 2 days`; expires `T0 + 5 days`; accepted during provisioning |
| `INV_A3_A` | A3 / Tenant A | Accepted before suspension | Created `T0 - 2 days`; expires `T0 + 5 days`; accepted during provisioning |
| `INV_A4_A` | A4 / Tenant A | Unaccepted and unexpired | Created `T0 - 1 day`; expires `T0 + 5 days`; `accepted_at` empty |
| `INV_A5_A` | A5 / Tenant A | Accepted by trusted redemption | Created `T0 - 2 days`; expires `T0 + 5 days`; accepted during provisioning |
| `INV_A5_B` | A5 / Tenant B | Accepted by a separate trusted redemption | Created `T0 - 2 days`; expires `T0 + 5 days`; accepted during provisioning |
| `INV_B1_B` | B1 / Tenant B | Accepted by trusted redemption | Created `T0 - 2 days`; expires `T0 + 5 days`; accepted during provisioning |

Each invitation has an empty `lead_id`, the exact lowercased email, and its own unique lowercase 64-character SHA-256 token hash. The trusted server receives only the hash for redemption. Never store the raw token in the database or this package. If `T0 + 5 days` does not cover the complete approved test window, stop and have the approver set a longer bounded expiry before any invitation is created.

## Portal branding

| Field | Tenant A | Tenant B |
| --- | --- | --- |
| Display name | Northstar Lantern Test Studio | Blue Meadow Test Workshop |
| Logo URL | Empty | Empty |
| Primary color | `#0f766e` | `#1d4ed8` |
| Secondary color | `#ecfeff` | `#eff6ff` |
| Contact email | `hello@tenant-a.johai.test` | `hello@tenant-b.johai.test` |
| Contact phone | `+1 202 555 0110` | `+1 202 555 0120` |
| Address | `1 Fixture Way, Example City` | `2 Fixture Way, Example City` |
| Business hours | `{"monday":"09:00-17:00"}` | `{"monday":"10:00-18:00"}` |
| Support email | `support@tenant-a.johai.test` | `support@tenant-b.johai.test` |
| Booking URL | `https://tenant-a.johai.test/book` | `https://tenant-b.johai.test/book` |
| Industry | Synthetic services | Synthetic services |

The business-hours values are exact JSON objects; unlisted days are absent. The reserved `.test` links are non-production markers. External navigation is expected to fail unless a separate controlled endpoint is approved; that failure is not a Portal defect.

## Documents and private Storage

Required bucket contract:

- Alias: `BUCKET_PORTAL_TEST`
- Suggested name: `customer-portal-synthetic-private`
- Public: `false`
- The deployment's `CUSTOMER_PORTAL_DOCUMENT_BUCKETS` allowlist must include the exact bucket name.
- Object path template: `<business_uuid>/<customer_profile_uuid>/<safe-filename>`
- Never place a leading slash, empty segment, `.` or `..`, backslash, percent sign, control character, query, or fragment in a path.

| Document alias | Profile | Type | Filename | Title | Revoked |
| --- | --- | --- | --- | --- | --- |
| `DOC_A1_CURRENT` | A1-A | `instructions` | `tenant-a-current.txt` | Tenant A current instructions | No |
| `DOC_A1_ACK` | A1-A | `report` | `tenant-a-acknowledged.txt` | Tenant A acknowledged report | No |
| `DOC_A1_REVOKED` | A1-A | `form` | `tenant-a-revoked.txt` | Tenant A revoked form | `T0 - 1 day` |
| `DOC_A2_MARKER` | A2-A | `instructions` | `tenant-a-recovery.txt` | Tenant A recovery marker | No |
| `DOC_A3_DENIED` | A3-A | `other` | `tenant-a-suspended.txt` | Tenant A suspended marker | No |
| `DOC_A4_DENIED` | A4-A | `other` | `tenant-a-invited.txt` | Tenant A invited marker | No |
| `DOC_A5_A` | A5-A | `report` | `tenant-a-multi.txt` | Tenant A multi-profile report | No |
| `DOC_A5_B` | A5-B | `report` | `tenant-b-multi.txt` | Tenant B multi-profile report | No |
| `DOC_B1_B` | B1-B | `instructions` | `tenant-b-expiry.txt` | Tenant B expiry marker | No |

Use MIME type `text/plain`. Tenant A files contain only `Tenant A synthetic portal document.` followed by a newline. Tenant B files use the corresponding Tenant B sentence. The revoked file contains only `Synthetic document intentionally revoked.` followed by a newline. Record the actual UTF-8 byte count displayed by the upload tool rather than assuming it.

Create one acknowledgement for `DOC_A1_ACK` using the exact A1-A document/profile/business tuple. Do not acknowledge the revoked document.

Expected security behavior:

- Current documents create a no-store signed URL with a 60-second lifetime through the Portal download endpoint.
- Revoked, nonexistent, malformed, wrong-profile, wrong-business, wrong-prefix, and nonallowlisted-bucket requests create no signed URL.
- A1 requesting a B1 or A5 document, and B1 requesting an A1 or A5 document, receives the same generic 404 response.
- Direct unauthenticated or ordinary authenticated Storage object access fails; the bucket is private.
- A URL issued before revocation may remain usable only until its existing 60-second expiry. Wait beyond that lifetime before declaring cleanup complete.

## Appointments

Every row uses these exact field rules:

- `external_provider`: `synthetic_test`
- `external_event_id`: the lowercase appointment alias with underscores changed to hyphens, for example `appt-a1-scheduled`
- `ends_at`: exactly one hour after `starts_at`
- `location`: `Online synthetic fixture` for scheduled/confirmed rows; `Synthetic archive` for completed/cancelled/no-show rows
- `meeting_url`, `reschedule_url`, and `cancel_url`: for scheduled/confirmed rows, use `https://<tenant-domain>/appointments/<lowercase-hyphenated-alias>/join`, `/reschedule`, and `/cancel`; for completed/cancelled/no-show rows, use empty strings
- `customer_visible_notes`: `Synthetic Tenant A appointment; no real customer data.` or the corresponding Tenant B sentence
- `created_at` and `updated_at`: leave at database defaults

| Appointment alias | Profile | Status | Start | Timezone | Service name |
| --- | --- | --- | --- | --- | --- |
| `APPT_A1_SCHEDULED` | A1-A | `scheduled` | `T0 + 1 day` | `America/Toronto` | Tenant A scheduled fixture |
| `APPT_A1_CONFIRMED` | A1-A | `confirmed` | `T0 + 2 days` | `America/Toronto` | Tenant A confirmed fixture |
| `APPT_A1_COMPLETED` | A1-A | `completed` | `T0 - 1 day` | `America/Toronto` | Tenant A completed fixture |
| `APPT_A1_CANCELLED` | A1-A | `cancelled` | `T0 - 2 days` | `America/Toronto` | Tenant A cancelled fixture |
| `APPT_A1_NO_SHOW` | A1-A | `no_show` | `T0 - 3 days` | `America/Toronto` | Tenant A no-show fixture |
| `APPT_A3_DENIED` | A3-A | `confirmed` | `T0 + 3 days` | `America/Toronto` | Suspended-profile marker |
| `APPT_A4_DENIED` | A4-A | `confirmed` | `T0 + 4 days` | `America/Toronto` | Invited-profile marker |
| `APPT_A5_A` | A5-A | `confirmed` | `T0 + 5 days` | `America/Toronto` | Tenant A multi-profile marker |
| `APPT_A5_B` | A5-B | `confirmed` | `T0 + 6 days` | `America/Vancouver` | Tenant B multi-profile marker |
| `APPT_B1_B` | B1-B | `scheduled` | `T0 + 7 days` | `America/Vancouver` | Tenant B expiry marker |

Use explicit offset-bearing timestamps. For `<tenant-domain>`, use `tenant-a.johai.test` for Tenant A rows and `tenant-b.johai.test` for Tenant B rows. The reserved links are intentionally non-production; navigation is expected to fail unless a separate controlled endpoint is approved. The database does not validate IANA timezones or URL syntax, so the operator must verify both before saving.

## Messages

| Message alias | Profile | Sender | Customer visible | Human support requested | Exact body |
| --- | --- | --- | --- | --- | --- |
| `MSG_A1_HUMAN` | A1-A | `human` | Yes | No | `Tenant A synthetic customer-visible human reply.` |
| `MSG_A1_AI` | A1-A | `ai` | Yes | No | `Tenant A synthetic customer-visible AI-assisted reply.` |
| `MSG_A1_HIDDEN` | A1-A | `human` | No | No | `Tenant A synthetic hidden control message.` |
| `MSG_A2_MARKER` | A2-A | `human` | Yes | No | `Tenant A recovery-account marker.` |
| `MSG_A3_DENIED` | A3-A | `human` | Yes | No | `Tenant A suspended-profile marker.` |
| `MSG_A4_DENIED` | A4-A | `human` | Yes | No | `Tenant A invited-profile marker.` |
| `MSG_A5_A` | A5-A | `human` | Yes | No | `Tenant A multi-profile message marker.` |
| `MSG_A5_B` | A5-B | `human` | Yes | No | `Tenant B multi-profile message marker.` |
| `MSG_B1_B` | B1-B | `human` | Yes | No | `Tenant B expiry-account marker.` |

During browser validation A1 creates exactly one message with body `Tenant A synthetic customer message.` and enables **Request a person**. Expected server-owned values are sender `customer` and customer-visible `true`. A customer must never be able to choose `human` or `ai`, submit a hidden message, or view `MSG_A1_HIDDEN`.

## Support requests

| Request alias | Profile | Type | Status | Subject |
| --- | --- | --- | --- | --- |
| `REQ_A1_OPEN` | A1-A | `general` | `open` | Tenant A open fixture |
| `REQ_A1_PROGRESS` | A1-A | `human_assistance` | `in_progress` | Tenant A in-progress fixture |
| `REQ_A1_RESOLVED` | A1-A | `document` | `resolved` | Tenant A resolved fixture |
| `REQ_A1_CLOSED` | A1-A | `appointment` | `closed` | Tenant A closed fixture |
| `REQ_A3_DENIED` | A3-A | `general` | `open` | Suspended-profile request marker |
| `REQ_A4_DENIED` | A4-A | `general` | `open` | Invited-profile request marker |
| `REQ_A5_A` | A5-A | `general` | `open` | Tenant A multi-profile request |
| `REQ_A5_B` | A5-B | `general` | `open` | Tenant B multi-profile request |
| `REQ_B1_B` | B1-B | `general` | `open` | Tenant B expiry-account request |

Use the detail `Synthetic request detail; no real customer information.` During browser validation A1 uses **New request**, type **Human assistance**, subject `Tenant A synthetic support request`, details `Please confirm this fictional request.`, and **Send request**. The resulting status must be `open`.

Pre-seeded status rows prove rendering only. The application does not contain a trusted request-status transition screen, so this package does not claim that the full support lifecycle has been operationally proven.

## Expected visibility matrix

| Principal | Expected portal profiles | Expected customer data | Forbidden data |
| --- | --- | --- | --- |
| A1 | A1-A only | A1-A records only | A2/A3/A4/A5 records and all Tenant B records |
| A2 | A2-A only | A2-A records only | Every other profile tuple |
| A3 | None while suspended | None | All portal child data, including A3 markers |
| A4 | None while invited | None | All portal child data, including A4 markers |
| A5 | A5-A and A5-B | Only the currently selected tuple | Other customers in either tenant and mixed A/B results |
| B1 | B1-B only | B1-B records only | All Tenant A records and A5-B records |
| Owner A | No portal profile | Business Workspace Tenant A only | Customer Portal session/data |
| Owner B | No portal profile | Business Workspace Tenant B only | Customer Portal session/data |

Changing a browser-supplied business ID, profile ID, document ID, local-storage selection, URL, or request body never creates authority. Invitations are not browser-readable or browser-redeemable. Customers cannot create or mutate appointments or documents, change profile status/tenant/Auth linkage, spoof a non-customer message sender, or set support-request status.

## Matrix acceptance criteria

The matrix is ready for a run only when:

- a human approves the exact two-business/eight-user/seven-profile/seven-invitation scope;
- every alias is absent from the selected isolated environment before creation;
- an approved trusted redemption path exists and can run without exposing service-role credentials;
- approved admin paths exist for A3 suspension, A4 invited state, child fixture creation, session revocation, and dependency-safe cleanup;
- private mail, secret delivery, private Storage, redirect allowlist, evidence retention, and cleanup ownership are ready;
- the checklist records a **GO** decision.

Otherwise, the result is **NO-GO** and no record is created.
