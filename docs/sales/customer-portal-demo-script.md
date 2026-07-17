# Customer Portal Pilot Demo Script

Use this script only with the development-only Customer Portal demo. The presentation uses the fictional Harbor Dental Studio business and Sophie Martin customer. Never substitute a production identity or production record.

## Before the meeting

1. From the JOHAI project root, run `npm run dev`.
2. Open `http://localhost:3000/portal/demo`.
3. Confirm the **Demo environment** and **Fictional data** indicators.
4. Select **Reset fictional data**, then **Complete pilot**.
5. Confirm that no customer, access token, recovery link, private storage URL, or browser credential is visible.
6. Run `npm run test:portal`; the dedicated suite contains 16 tests (12 required portal contracts plus four complementary scenario and guard cases).
7. Keep the public JOHAI website available so the return path can be shown.

Do not present the route from a production build. A production `404` is intentional.

## Opening statement

> This is JOHAI's local Customer Portal pilot using entirely fictional data. It demonstrates the intended customer experience without connecting to Supabase, using a real login session, or touching production records. It is not a production-readiness or customer-availability claim.

## 1. Customer overview

Show Sophie Martin's Harbor Dental Studio overview.

Point out:

- the business-branded customer surface;
- the personal welcome;
- the next appointment;
- the latest customer-visible message;
- the shared preparation document;
- the open support request;
- booking and contact actions; and
- **Powered by JOHAI**.

Say:

> The portal is intentionally narrower than the Business Workspace. Customers see only the information shared for their own service journey. CRM scoring, internal notes, Business Brain, Knowledge Center sources, billing, administration, and executive metrics are excluded.

## 2. Appointments

Open Appointments. Show the confirmed future visit and completed past visit, including timezone-safe date/time, location, service, preparation instructions, and only the actions available for the appointment status.

Say:

> Scheduling links may be supplied by an external provider. JOHAI presents only validated HTTPS actions and does not claim to control provider availability or synchronization.

## 3. Messages

Open Messages. Identify the human reply, AI-assisted customer-safe reply, and Sophie’s message. Submit a short fictional message and select the human-follow-up option if useful.

Say:

> This pilot updates local demo state. It does not claim realtime delivery, staff notification, or a production response SLA.

For the failure demonstration:

1. Select **Fail next message**.
2. Submit the message once.
3. Point out the safe error and retained draft.
4. Retry and show recovery.

## 4. Documents

Open Documents. Show the available preparation file, the acknowledged file, and the withdrawn/revoked fictional state. Acknowledge the available document and demonstrate the safe local placeholder download.

For the failure demonstration:

1. Select **Fail next download**.
2. Attempt the download.
3. Explain the generic customer-safe failure.
4. Retry after the one-shot failure is consumed.

Say:

> The demo never accesses Supabase Storage or the Knowledge Center. In production, download authorization additionally requires the customer bearer session, RLS-visible tenant tuple, non-revoked status, an allowlisted private bucket, a canonical tenant path, and a short-lived signed URL.

## 5. Profile

Open Profile and update one fictional customer field. Show validation, notification preferences, and the local save confirmation.

For the session demonstration:

1. Select **Expire next save**.
2. Attempt one save.
3. Explain that the resulting session error is fictional and one-shot.
4. Retry or use **Reset fictional data**.

Say:

> Customers can edit only approved contact and preference fields. Tenant IDs, Auth IDs, lead linkage, internal status, creation timestamps, and CRM data are not customer-editable.

## 6. Support

Open Support, review the open fictional request, and create a local request.

State the boundary clearly:

- Harbor Dental Studio handles services, appointments, shared files, and business-specific follow-up.
- JOHAI handles platform-account and technical access issues.
- The pilot does not send a production ticket or notify either organization.

## 7. Honest states

Select **Empty states** and move through the portal to show honest no-data guidance. Select **Load error** to show generic protected errors and retry behavior. Return to **Complete pilot**, then select **Reset fictional data**.

Say:

> A customer-facing system must explain missing or unavailable information without leaking internal implementation or another tenant's existence.

## Security explanation

The development demo is isolated by all of the following:

- a server-side development-only route guard;
- an in-memory repository containing only fictional records;
- no Supabase client or Auth session;
- no Supabase, external, authentication, production-data, or persistence network operations; the guarded same-origin generated attachment request is the sole permitted non-asset request;
- no service-role or anonymous key;
- no production session mutation;
- no production tenant identifier accepted from the browser; and
- no database or Storage write.

Production routes continue to use the dedicated PKCE session and RLS. The Customer Portal hardening migration is recorded as **Applied**, and the earlier hardening-verification blocker is resolved in the current certification state; approver identity, dates, and raw verifier evidence references remain `Pending` documentation details. The applied migration is immutable and must not be rerun.

## Claims not permitted

Do not say that the pilot proves:

- production readiness or deployment;
- real customer adoption or traction;
- successful production authentication;
- completed cross-tenant or Storage testing;
- working invitation delivery;
- rate limiting or abuse prevention;
- realtime messaging;
- guaranteed external scheduling availability; or
- production support response times.

## Troubleshooting during a presentation

- If the route is missing locally, confirm the server was started with `npm run dev` from the JOHAI root and open the exact `/portal/demo` path.
- If an intentional failure persists, select **Reset fictional data** and **Complete pilot**.
- If the page was opened from a production build, stop; the route must remain unavailable there.
- If the development server is locked, identify and stop only the confirmed JOHAI process gracefully. Never delete source files or terminate an unidentified process.

## Closing statement

> The pilot demonstrates a complete, customer-only experience and the failure states needed for an honest product conversation. Production activation remains a separate evidence-based process covering authentication, tenant isolation, private Storage, signed downloads, abuse controls, browser QA, operations, and recovery.

## Recovery

Use **Reset fictional data** or refresh to discard local mutations, then stop the confirmed development server. No database rollback is required because the pilot executes no SQL and persists no production data.

## Contextual Intelligence presentation

Use this sequence without implying production AI capability:

1. On **Overview**, say: “The portal ranks at most three customer-visible facts and recommends one action. Each card says why it appeared.”
2. On **Appointments**, open **Show preparation guidance** and say: “This repeats only notes the business shared with this fictional appointment. External links, not JOHAI, confirm availability or completion.”
3. On **Messages**, choose one suggested reply and say: “The suggestion fills an unsent draft. Sophie still reviews and sends it.” Demonstrate a rewrite only if useful; do not press Send.
4. On **Documents**, open **Context help** on the fictional preparation guide. Show the deterministic-demo label, named source, support wording, and source-of-truth warning. On the fictional care report, show that regulated interpretation is refused and routed to a person.
5. On **Profile**, open **Why this guidance appears** and explain that customers control their contact and notification choices.
6. On **Support**, copy the single follow-up question into the form. Say: “No request or human notification occurs until the customer submits.”

Closing qualification: “These are deterministic fictional demo outputs. The authenticated production generative provider is deliberately unavailable pending a separately approved server-side provider and customer-visible knowledge publication boundary. Customer Portal remains 71/100, FAILED, and not production ready.”
