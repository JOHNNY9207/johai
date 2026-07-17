# User Journey

A visitor discovers JOHAI, creates an account, reviews the welcome flow, configures business information in Dashboard Onboarding, adds knowledge, connects booking, and monitors business activity in the Executive Dashboard.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## End-customer portal journey

A customer whose identity has already been provisioned opens `/portal/login`, signs in through the dedicated PKCE Supabase flow, and can request a password-reset link when needed. Public signup and invitation redemption are not available.

After authentication, the application requires at least one active customer profile visible through RLS. A customer linked to one business enters that portal directly; a customer linked to multiple businesses explicitly selects the portal and can switch only among profiles returned by RLS. The selected profile is remembered locally for that signed-in user.

The overview summarizes upcoming appointments, recent customer-visible messages, shared documents, and open support requests. Dedicated pages let the customer open safe external appointment links, read and send visible messages, download current shared files, acknowledge documents, edit approved personal fields and preferences, and create or follow support requests. Loading, empty, access-denied, retry, and error states explain what happened without exposing internal data.

The customer never enters the business dashboard and never sees CRM-wide records, internal notes, Knowledge Center sources, Business Brain, AI orchestration, billing administration, the Executive Dashboard, or another tenant. Production availability remains dependent on customer provisioning and environment/storage configuration.

## Industry-adapted customer journey

The current implementation uses one shared Customer Portal journey for every business. Authentication, tenant selection, overview, appointments, messages, documents, profile, and support are implemented once and retain the same security boundary. A business can already supply customer-visible service names, appointment details, shared-file content, display name, primary color, booking link, support email, and phone. The current navigation and most page terminology remain fixed, however, and the industry field does not enable a module or permission.

The planned [Customer Portal Industry Adaptation Architecture](../technical/customer-portal-industry-architecture.md) keeps that shared core and adds reviewed configuration rather than separate portals. Planned templates may call scheduled records **Reservations** for restaurants, **Visits** for dental and home services, **Bookings** for beauty, **Viewings** for real estate, or **Consultations** for legal services. They may also order or enable registered optional modules, configure bounded service types and customer actions, present verified support channels, and render more of the approved branding record. These labels and optional modules are **Planned**; they are not six currently implemented variants.

Industry configuration never grants access. It can narrow a released customer action, but it cannot select a tenant, expand RLS, expose another profile, turn an acknowledgement into a signature, or convert an external booking link into a JOHAI-operated reservation, dispatch, clinical, legal, or transaction system. Missing or invalid optional configuration falls back to the neutral shared core with optional modules off.

The Portal currently displays trusted persisted messages labeled **AI-assisted response**, but it does not generate customer-facing AI replies. Industry-specific FAQ assistance, preparation guidance, and document explanations remain **Planned** and must default off until approved customer-visible sources, capability limits, escalation, monitoring, and safety controls exist. Order placement, payments, billing administration, e-signatures, clinical records, legal case management, MLS transactions, technician tracking, realtime chat, and notification delivery are deliberately unavailable in the current Portal.

## Local pilot demo journey

The development-only route `/portal/demo` presents the journey with the fictional Harbor Dental Studio business and Sophie Martin customer. Start it from the JOHAI project root with `npm run dev`, then open `http://localhost:3000/portal/demo`. A production build must return `404` for this route.

The demo is backed by an in-memory repository, not Supabase. It creates no Auth session, performs no Supabase, external, authentication, production-data, or persistence network request, uses no service-role or anonymous key, reads no real tenant, and writes no database or Storage object. The only permitted request beyond local page assets is the development-guarded same-origin generated attachment download. **Demo environment** and **Fictional data** indicators distinguish it from production.

The recommended journey is:

1. Review the overview welcome, business identity, next appointment, recent message, shared document, active request, booking/contact actions, and **Powered by JOHAI**.
2. Review confirmed future and completed past appointments with timezone, location, service, preparation information, and only valid actions.
3. Review human, AI-assisted, and customer messages; submit a fictional message and request human follow-up without claiming realtime delivery.
4. Review available, acknowledged, and withdrawn fictional documents; acknowledge and download only the safe local placeholder.
5. Edit only the permitted profile/contact/preferences fields and review validation, success, expired-session, and unsaved-state behavior.
6. Review and create a local support request while keeping business support separate from JOHAI platform support.
7. Use **Empty states** and **Load error** to inspect safe failure guidance, then select **Reset fictional data**.

The one-shot controls **Fail next message**, **Fail next download**, and **Expire next save** make failures repeatable without a backend. **Complete pilot** returns to the complete fixture. No demo action provisions an account, contacts staff, sends a message, signs a URL, or proves production behavior.

Dates on the overview, appointments, messages, documents, and support pages use the customer's saved language through an explicit locale map. Appointment times use the displayed appointment timezone; records without a stored timezone use `UTC`. The fictional demo is anchored to one fixed reference instant so a server-rendered page and its hydrated browser view show identical dates and appointment groups.

## Production status

The production journey is implemented in repository code but has not been exercised with representative approved production customers in the documented evidence. The recorded pre-hardening inspection found zero rows in all eight portal tables. `/portal/register`, `/portal/dashboard`, and a dedicated auth callback route do not exist. The canonical production dashboard is `/portal`; protected pages use a client gate plus RLS.

The production hardening migration is recorded as **Applied** and the latest certification re-audit removed the earlier hardening-verification blocker after the corrected read-only verifier was reviewed and approved. The Applied design adopts global identity separation: one Supabase Auth identity used as a portal customer must not also be a JOHAI business owner or member anywhere. A person who needs both customer and workspace roles must use distinct Auth identities. Approver identity, approval/execution dates, and raw query-by-query evidence references remain `Pending` documentation details. The applied migration is immutable and must not be rerun. The local pilot does not establish production readiness.

## Synthetic authentication journey plan

The planned manual journey uses two fictional `.test` tenants and eight unprovisioned identities. A1 exercises normal login, refresh, multi-tab, and logout; A2 exercises recovery; B1 exercises genuine expiry/revocation; A3 and A4 prove suspended/invited denial; A5 chooses between two active business profiles; and A1 plus Owner A prove portal/workspace session separation. The demo journey remains identity-free.

The exact identity, profile, invitation, credential, cleanup, and scenario plan is [Customer Portal Synthetic Test Identity Plan](../sprints/CUSTOMER_PORTAL_SYNTHETIC_IDENTITY_PLAN.md). No customer, tester, or operator should receive credentials until a human approves provisioning and the private mail/secret-delivery channels are ready. This planned journey is not production-ready evidence.

## Final certification journey status

The shared fictional journey passed desktop, tablet, and mobile route checks and the 16-test local suite, but the real customer journey remains unexecuted. The latest Customer Portal V1 certification re-audit records **71/100**, certification **FAILED**, and Production Ready **NO**. Do not direct a customer to production access based on the demo, build, or static security review.

The journey gate remains closed until the approved synthetic identities are provisioned and real login, recovery, expiry, suspended/invited denial, multi-profile selection, tenant denial, private document delivery, support operations, accessibility, performance, monitoring, and cleanup complete successfully. No SQL was executed during certification.

## Contextual Customer Portal journey

Customer Portal Contextual Intelligence V1 reduces effort inside the existing six-page journey without becoming a chatbot:

1. **Overview:** up to three grounded insights are ranked from a complete customer-visible snapshot. Only the first has a recommended action. Completed appointments, acknowledged documents, and resolved requests disappear.
2. **Appointments:** the customer can reveal preparation copied from customer-visible appointment notes. Booking, rescheduling, and cancellation remain external-provider links; the Portal does not invent availability or claim completion.
3. **Messages:** the deterministic demo can place one of at most three replies into an unsent draft or offer clear, concise, and polite rewrites. The customer reviews and sends; nothing is auto-sent and no person is contacted automatically.
4. **Documents:** the deterministic demo offers bounded explanation, summary, key actions, important dates, safe questions, explicitly reviewed related context, and supported-language demo translation. Every result is labelled, names its source, and keeps the original document as the source of truth. Regulated interpretation is refused.
5. **Profile:** calm guidance explains why a genuinely missing contact or communication field may help. A disabled notification preference is a valid customer choice.
6. **Support:** one grounded follow-up question may be copied into the request form. Submission remains a deliberate customer action and records intent only; it does not prove assignment, notification, or a response time.

The authenticated production Portal currently uses deterministic record-based guidance only. Production document and message generation is deliberately unavailable until an approved server-side provider and published customer-visible knowledge boundary exist.
