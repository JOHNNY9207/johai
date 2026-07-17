# Industry Use Cases

Current examples include beauty, dental, home services, legal, real estate, and restaurants. Use cases include FAQs, qualification, consultation booking, reminders, and owner summaries; validate compliance needs per industry.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

Every industry story must satisfy the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md): reduce effort, create trust, respect context, preserve human authority, and keep the represented business—not JOHAI or AI—as the hero. Industry terminology never excuses pressure, decorative AI, unsafe inference, hidden uncertainty, or unsupported capability claims.

## Contextual Intelligence™ overlay

The [Smart Interaction Patterns](../philosophy/SMART_INTERACTION_PATTERNS.md) describe Planned contextual examples for Restaurant, Dental, Beauty, Legal, Real Estate, Home Services, Medical, Fitness, Automotive, Hospitality, Insurance, Finance, Education, and Retail. Those examples are product-design scenarios, not claims that fourteen industry products or specialized integrations exist.

Across every example, JOHAI may infer only from authorized customer-visible context, should ask only for the unresolved detail, and must remain silent when no useful intervention exists. Regulated, safety-critical, policy-limited, uncertain, or authority-dependent work escalates to an appropriate person without promising that notification, assignment, or response timing exists until those operations are implemented and verified.

## Customer Portal industry configuration roadmap

The common Customer Portal foundation is implemented in the repository. Industry-specific labels and priorities remain planned: reservations for restaurants, preparation for dental, services for beauty, viewings for real estate, case documents for legal, and estimates/visits for home services. These are planned configurations, not six separate products or currently implemented variants.

The governing design is [Customer Portal Industry Adaptation Architecture](../technical/customer-portal-industry-architecture.md). Use the examples below as configuration concepts, not as claims that industry modules, customer-facing AI, realtime support, notification delivery, payments, or third-party operational systems are live.

## Shared Customer Portal foundation — Implemented

Every example uses the same implemented customer-facing areas: overview, appointments, messages, documents, profile, and support. The shared foundation also provides dedicated Portal authentication and recovery, active-profile tenant selection, customer-visible status, responsive loading/empty/error states, safe external booking and appointment links, document download and acknowledgement, approved profile editing, and exact business/profile scoping.

Businesses can already vary customer-visible appointment service names and notes, messages, document titles/types, display name, primary color, booking link, support email, and phone. Current navigation and most page terminology are fixed. A booking, reschedule, cancel, or meeting action opens only a validated external HTTPS link supplied with the customer-visible record; JOHAI does not claim to operate that provider workflow.

Portal messages can display customer, human, and trusted persisted **AI-assisted response** labels. The Portal does not generate AI replies. **Ask a person** and support requests record customer intent but do not prove staff notification, assignment, realtime response, or an SLA. Communication and notification preferences can be stored, but delivery is not implemented.

## Planned configuration and deliberately unavailable behavior

The planned configuration layer may supply reviewed terminology, optional registered modules, bounded service types, allowed customer actions, verified support channels, and richer approved branding. Configuration can narrow a released action but never grants tenant access, expands RLS, exposes internal records, or turns an acknowledgement into a signature or approval. Missing or invalid optional configuration falls back to neutral Portal wording with optional modules off.

Across every industry, CRM internals, Business Brain, Knowledge Center sources, AI orchestration, internal notes, billing administration, the Executive Dashboard, provider credentials, raw storage paths, and other tenants are deliberately unavailable. Ordering, payments, e-signatures, clinical/case/transaction systems, live dispatch, realtime chat, SMS/WhatsApp delivery, and customer-facing AI remain unavailable unless a future reviewed module is explicitly implemented and validated.

## Restaurant example — Planned template

- **Terminology:** guest, reservation, private-event request, menu/event file, guest help.
- **Enabled modules:** all six shared core areas. Reservation, order, waitlist, loyalty, and event modules are not currently implemented.
- **Service types supported by current appointment data:** table reservation, private-dining consultation, catering consultation, event-planning call.
- **Actions:** approved booking/reschedule/cancel/meeting links, messages, human requests, and menu/event document download or acknowledgement use implemented core behavior. Acknowledgement is not a signature or payment.
- **Support channels:** Portal message/request and displayed restaurant support email/phone are implemented. SMS, WhatsApp, waitlist, and realtime chat are planned.
- **Branding:** restaurant name, a dark accessible terracotta such as `#b45309`, booking link, and support contacts are supported. Logo, secondary theme, hours, and address presentation are planned/partial.
- **Permissions:** only the guest's own customer-visible reservations, events, messages, and files; never another guest, table map, kitchen note, margin, CRM, or payment data.
- **AI:** approved menu, hours, reservation, and event FAQ assistance is planned. Allergen or dietary uncertainty must escalate; no ingredient guarantee or autonomous reservation change is allowed.
- **Fallback/disabled:** missing booking actions are hidden and support remains available. Ordering, payment, delivery tracking, gift cards, and loyalty are unavailable.

## Dental example — Planned template

- **Terminology:** patient, visit, care document, patient support.
- **Enabled modules:** all six shared core areas. Clinical chart, insurance claims, prescriptions, and billing are unavailable.
- **Service types:** preventive cleaning, new-patient examination, treatment consultation, orthodontic review, and follow-up visit.
- **Actions:** approved booking/reschedule/cancel/meeting links, customer-visible preparation notes, messages, human requests, and care-document download or acknowledgement use implemented core behavior. Acknowledgement is not informed consent or an e-signature.
- **Support channels:** Portal message/request and displayed clinic email/phone are implemented. Emergency routing, production reminders, and SMS delivery are planned.
- **Branding:** clinic name, teal such as `#0f766e`, booking link, and support contacts are supported. Full logo, secondary palette, hours, and address presentation are planned/partial.
- **Permissions:** only deliberately shared visits, messages, and documents; never diagnoses, clinical charts, imaging, treatment notes, insurance internals, staff notes, or another patient.
- **AI:** administrative FAQs and visit-preparation guidance are planned. Diagnosis, treatment, medication, and emergency decisions are forbidden.
- **Fallback/disabled:** clinical or emergency questions require the approved human/emergency channel. Claims, e-prescribing, medical-record management, consent signing, and payments are unavailable.

## Beauty example — Planned template

- **Terminology:** client, booking, service guide, salon support.
- **Enabled modules:** all six shared core areas. Packages, memberships, ecommerce, deposits/payments, and loyalty are unavailable.
- **Service types:** color consultation, haircut/styling, facial consultation, manicure, extensions maintenance, and aftercare follow-up.
- **Actions:** approved booking/reschedule/cancel links, messages, human requests, and preparation/aftercare document download or acknowledgement use implemented core behavior. Acknowledgement is not a waiver or signature.
- **Support channels:** Portal message/request and displayed salon email/phone are implemented. SMS, WhatsApp, and automated reminder delivery are planned.
- **Branding:** salon name, deep rose such as `#be185d`, booking link, and support contacts are supported. Logo, secondary theme, hours, and address presentation are planned/partial.
- **Permissions:** only the client's shared bookings, messages, and files; never staff schedules, formulation notes, internal photos, commissions, CRM notes, or other clients.
- **AI:** approved preparation, duration, aftercare, and policy FAQs are planned. No medical or skin diagnosis, contraindication decision, or product-safety guarantee.
- **Fallback/disabled:** adverse-reaction or contraindication uncertainty escalates. Visual diagnosis, deposits, package balances, ecommerce, and loyalty are unavailable.

## Real-estate example — Planned template

- **Terminology:** client, viewing, consultation, listing/transaction file, agent support.
- **Enabled modules:** all six shared core areas. MLS search, saved-property feeds, offers, transaction management, and mortgage tools are unavailable.
- **Service types:** buyer consultation, seller consultation, property viewing, valuation meeting, and open-house follow-up.
- **Actions:** approved scheduling/meeting links, messages, human requests, and brochure/disclosure document download or acknowledgement use implemented core behavior. Acknowledgement is not an offer or signature.
- **Support channels:** Portal message/request and displayed agent or office email/phone are implemented. SMS, WhatsApp, and live agent routing are planned.
- **Branding:** agency name, blue such as `#1d4ed8`, booking link, and support contacts are supported. Logo, secondary palette, hours, and address presentation are planned/partial.
- **Permissions:** only explicitly shared customer-linked records; never another client, competing offers, private seller notes, internal valuations or commissions, CRM data, or credentials.
- **AI:** approved listing facts, viewing preparation, document checklists, and intake are planned. Discriminatory qualification, steering, autonomous pricing or offers, legal advice, and mortgage decisions are forbidden.
- **Fallback/disabled:** availability or price uncertainty routes to the agent. MLS synchronization, offer submission, e-signature, escrow, transaction deadlines, and mortgage preapproval are unavailable.

## Legal example — Planned template

- **Terminology:** client, consultation, secure message, case document, client support.
- **Enabled modules:** all six shared core areas. Matter management, docketing, filing, trust accounting, billing, and e-signature are unavailable.
- **Service types:** intake consultation, case review, contract-review meeting, status conference, and document-collection appointment.
- **Actions:** approved scheduling/meeting links, messages, human requests, and checklist/form document download or acknowledgement use implemented core behavior. Acknowledgement is not legal acceptance, a retainer signature, or a filing.
- **Support channels:** Portal message/request and displayed firm email/phone are implemented. Urgent-deadline routing and realtime messaging are planned.
- **Branding:** firm name, dark slate such as `#334155`, booking link, and support contacts are supported. Logo, secondary theme, hours, and address presentation are planned/partial.
- **Permissions:** only material deliberately shared with that customer profile; never another matter, internal work product, attorney notes, conflict data, CRM, billing administration, or court credentials.
- **AI:** administrative intake, consultation preparation, approved FAQs, and document checklists are planned. Legal advice, privilege or conflict decisions, deadline calculation, outcome prediction, negotiation, and filing are forbidden.
- **Fallback/disabled:** substantive, urgent, or deadline questions require a lawyer. Retainer execution, court filing, docketing, trust accounting, invoicing/payment workflow, and autonomous case updates are unavailable.

## Home-services example — Planned template

- **Terminology:** customer, visit, estimate/service record, service support.
- **Enabled modules:** all six shared core areas. Dispatch board, technician GPS, inventory, work-order execution, warranty, and payment modules are unavailable.
- **Service types:** inspection, repair visit, installation consultation, preventive maintenance, and emergency-service intake appointment.
- **Actions:** approved booking/reschedule/cancel links, customer-visible visit details, messages, human requests, and quote/report document download or acknowledgement use implemented core behavior. Acknowledgement does not approve a quote or authorize work.
- **Support channels:** Portal message/request and displayed dispatch email/phone are implemented. SMS, WhatsApp, emergency routing, and live technician updates are planned.
- **Branding:** company name, dark green such as `#047857`, booking link, and support contacts are supported. Logo, secondary theme, hours, and service-area presentation are planned/partial.
- **Permissions:** only the customer's address-linked visits, files, and messages; never technician routes, internal diagnostics, dispatcher queues, pricing margins, CRM, billing, or another property.
- **AI:** approved service FAQs, quote-intake questions, visit preparation, maintenance reminders, and bounded escalation are planned. Remote diagnosis, unsafe repair instructions, guaranteed estimates, and dispatch promises are forbidden.
- **Fallback/disabled:** gas, electrical, water, or other safety emergencies use the approved human/emergency channel. Live tracking, work authorization, quote acceptance/e-signature, payments, inventory, and warranty adjudication are unavailable.

## Sales positioning rule

Present the common Portal foundation as implemented in repository code and the six industry configurations as a planned architecture. Do not say an industry module is live because its information can be represented by an appointment, message, document, or support request. Do not promise production AI, notification delivery, realtime support, customer provisioning, provider synchronization, compliance certification, or production readiness.
