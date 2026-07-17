# Customer Portal Pilot Demo Walkthrough

The Customer Portal pilot demo is a local, development-only presentation of the customer experience. It uses only fictional in-memory data and is not a production tenant, customer account, authentication flow, or readiness claim.

## Fictional pilot

- **Business:** Harbor Dental Studio
- **Customer:** Sophie Martin
- **Data status:** Every name, address, appointment, message, document, profile value, and support request is fictional.
- **Portal URL:** `http://localhost:3000/portal/demo`

The demo must never be used to enter, copy, or display production information.

## Launch the demo

1. Open a terminal in the JOHAI project root.
2. Run `npm run dev`.
3. Wait for Next.js to report the local address.
4. Open `http://localhost:3000/portal/demo` in a browser.
5. Confirm that the page displays the **Demo environment** and **Fictional data** indicators before presenting it.

The route is intentionally unavailable in a production build. A production `404` is the correct security behavior, not a deployment error.

## Isolation model

The demo uses a local in-memory repository boundary. It does not:

- create or read a Supabase Auth session;
- contact Supabase or any other data API;
- read or write a production tenant;
- use a service-role or anonymous Supabase key;
- mutate browser authentication state;
- bypass RLS on a production route; or
- weaken the approved Customer Portal schema.

Refreshing or using **Reset fictional data** restores the fixture rather than changing a database. Production portal routes remain protected by their dedicated authentication flow and RLS.

## Scenario controls

Use the demo controls to present normal and failure behavior without changing code or data:

- **Complete pilot** restores the complete fictional journey.
- **Empty states** returns empty customer collections so the portal's empty states can be reviewed.
- **Load error** makes repository reads fail so safe loading-error and retry behavior can be reviewed.
- **Fail next message** causes only the next message submission to fail; retrying demonstrates recovery.
- **Fail next download** causes only the next document download to fail; retrying demonstrates recovery.
- **Expire next save** causes only the next profile save to return the fictional expired-session state.
- **Reset fictional data** clears demo mutations and one-shot failures and restores Harbor Dental Studio and Sophie Martin.

These controls are local presentation tools. They are not production feature flags and must not appear on authenticated production routes.

## Recommended presentation journey

### 1. Overview

Start on the portal home and confirm:

- Sophie is welcomed by name;
- Harbor Dental Studio is the active business identity;
- the next appointment is visible;
- a recent customer-visible message is summarized;
- a shared preparation document is shown;
- an active support request is shown;
- booking and business-contact actions are available;
- **Powered by JOHAI** is visible; and
- no CRM score, internal note, Business Brain, Knowledge Center content, billing, AI orchestration, or platform administration appears.

### 2. Appointments

Open Appointments and show the fictional confirmed future visit and completed previous visit. Review the displayed timezone, location, service, customer preparation instructions, and safe external actions. Actions that are not available for a status must be hidden or clearly unavailable.

### 3. Messages

Open Messages and show the human message, AI-assisted customer-safe response, and customer reply. Submit a fictional message and optionally request human follow-up. Explain that this is not a realtime claim: the demo updates local state only.

Select **Fail next message**, submit once, review the safe error, then retry. Never enter passwords, payment information, health details, or real customer information during a demonstration.

### 4. Documents

Open Documents and show:

- an available preparation document;
- a previously acknowledged fictional document;
- a withdrawn/revoked fictional document state;
- acknowledgement status and action; and
- a safe local download action.

Select **Fail next download** to demonstrate a generic failure and retry. Demo documents are generated fictional placeholders and are not read from Supabase Storage or the Knowledge Center bucket.

### 5. Profile

Open Profile and edit only the allowed customer fields: full name, contact email, phone, language, communication preference, address, and notification preferences. Show validation and a successful local save.

Select **Expire next save** before saving to demonstrate the fictional expired-session response. The demo never exposes or edits `auth_user_id`, `lead_id`, `business_id`, internal status, creation timestamps, or CRM fields.

### 6. Support

Open Support, review the open fictional request, and create another local request. Explain the support boundary:

- Harbor Dental Studio handles appointments, services, shared documents, and business-specific questions.
- JOHAI handles platform-account or technical access issues.
- The demo does not send email, notify staff, create a production ticket, or promise realtime response.

### 7. Empty and error states

Use **Empty states** to inspect honest no-data guidance on every area. Use **Load error** to inspect generic customer-safe errors without internal details. Finish with **Reset fictional data**.

## Production differences

The local demo is not a substitute for production validation. Production differs in the following ways:

- `/portal/login` uses a dedicated PKCE Supabase session.
- Active customer profiles and business tenants are resolved through RLS.
- Production messages, acknowledgements, profile updates, and support requests persist only after authorized database operations.
- Production documents require bearer validation, an RLS-visible document, a private allowlisted bucket, canonical tenant path validation, and a short-lived signed URL.
- Invitation provisioning, rate limiting, storage policy validation, behavioral cross-tenant tests, monitoring, and recovery evidence remain separate production concerns.

The Customer Portal hardening migration is recorded as **Applied**, and the earlier hardening-verification blocker is resolved in the current certification state. Approver identity, approval/execution dates, and raw query-by-query verifier evidence references remain `Pending` documentation details. The migration must not be modified or rerun.

## Local validation

Run `npm run test:portal` from the project root before a planned presentation. The dedicated suite contains 16 tests: the 12 required Customer Portal contracts plus four complementary scenario and development-guard cases. Also run the repository's required lint and build commands when preparing a validated handoff.

A passing local suite confirms only the deterministic fixture, explicit customer-language/date formatting, stable timezone fallbacks, repository actions, scenario controls, and development guard covered by those tests. Appointment dates show their named timezone; other portal timestamps use `UTC`. It does not prove production RLS, Auth, Storage, signed downloads, rate limiting, or broad browser compatibility.

## Stop and recovery

- To discard local demo changes, select **Reset fictional data** or refresh the page.
- To stop the demo, stop the confirmed `npm run dev` process gracefully.
- If the route unexpectedly appears in a production build, treat that as a release blocker and restore the development-only server guard before deployment.
- Do not attempt a database rollback: the demo performs no SQL and stores no database records.
- Do not weaken authentication or RLS to make a production route resemble the demo.

## Readiness statement

The pilot demo proves only that the local customer journey can be presented with controlled fictional states. It does not prove production authentication, tenant isolation, Supabase availability, Storage configuration, signed-download behavior, rate limiting, browser compatibility, or production readiness.

No SQL is executed by the demo workflow.

## Contextual Intelligence demo interactions

The local fictional demo now demonstrates one bounded interaction on every main page:

- **Overview:** three grounded insights appear with exactly one recommended action and a reason for each item.
- **Appointments:** open **Show preparation guidance** to reveal only the notes shared with the fictional appointment.
- **Messages:** choose a suggested reply to fill the unsent draft, or request a deterministic clear, concise, or polite rewrite. Review the draft; do not imply it was sent.
- **Documents:** open **Context help**, choose one operation, and point out the deterministic-demo label, source, confidence wording, and source-of-truth warning. The care report refuses regulated interpretation.
- **Profile:** open **Why this guidance appears** to see why the portal surfaces customer-controlled communication settings.
- **Support:** use the single contextual follow-up question to prefill a request. Do not submit during a presentation unless explicitly intended.

All output is fixed fictional demo content. It is not proof of a production AI provider, live availability, operational human assignment, customer outcomes, or production certification.
