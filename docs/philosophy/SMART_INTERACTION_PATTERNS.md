# JOHAI Smart Interaction Patterns

## Status and purpose

- Product-design status: **Planned**
- Constitutional authority: subordinate to the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md) and [Decision Framework](../constitution/DECISION_FRAMEWORK.md)
- Shared Customer Portal core: **Implemented**
- Smart suggestion engine, configurable industry patterns, optional modules, customer-facing AI, and automatic workflows: **Not implemented**
- Application, UI, API, authentication, SQL, migration, and database change in this document: **None**

This document defines reusable interaction patterns for future JOHAI experiences. It is architecture and product-design guidance, not evidence that the suggested behavior exists. Every example is **Planned** and must pass the Constitution, the permissions, tenant-isolation, consent, accessibility, rate-limit, monitoring, and human-support rules in [AI Behavior Guidelines](AI_BEHAVIOR_GUIDELINES.md) and [Customer Portal Industry Adaptation Architecture](../technical/customer-portal-industry-architecture.md).

“Customer never has to ask” is a discoverability goal: relevant, already-authorized information should be easy to find at the right time. It is not a guarantee of availability, completion, provider response, or AI certainty.

## Standard smart-interaction contract

Every pattern must define:

| Element | Required question |
| --- | --- |
| Context trigger | What verified customer-visible state makes the suggestion relevant now? |
| Suggestion | What is the smallest useful next step, expressed without pressure or false certainty? |
| Consent | What must the customer review and explicitly approve? |
| Permission | Which exact tenant, profile, module, record, action, and server rule authorize it? |
| Fallback | What neutral behavior preserves the customer's work when data, configuration, AI, or a provider is unavailable? |
| Human escalation | When is judgment required, what approved channel exists, and what may be shared? |
| Success metric | What measurable customer outcome proves usefulness without rewarding manipulation or unsafe automation? |

Universal rules:

- Resolve authentication, active profile, business, and permissions before evaluating a trigger.
- Derive record and tenant authority from trusted state, never from model output, local storage, labels, or browser parameters.
- Show one relevant suggestion at a time. Make it dismissible and do not repeat it without a meaningful state change.
- Keep suggestions separate from completed actions.
- Require explicit consent for every data mutation, external-provider action, purchase, payment, cancellation, submission, or disclosure.
- Preserve a neutral core experience when optional configuration is invalid or a smart capability is off.
- Never expose internal notes, CRM, Business Brain, Knowledge Center sources, billing administration, provider credentials, staff queues, or another tenant.
- Do not optimize for clicks, message volume, upsell, or urgency at the expense of truth and customer control.

## Core and planned interaction patterns

### Documents

- **Context trigger:** The customer opens an authorized current document, approaches a visible acknowledgement need, or has a related visible appointment or request.
- **Suggestion:** Offer the smallest relevant document aid rather than opening a generic chat.
- **Planned pattern catalog:**
  - **Explain this document:** answer from the exact authorized version and point to the supporting section.
  - **Summarize:** produce a concise, source-grounded overview without replacing the original document.
  - **Translate:** translate only customer-visible text, preserve names/numbers/dates, label the output as a translation, and retain access to the original.
  - **Highlight deadlines:** identify dates expressly present in the file and show their source and timezone context; never invent, recalculate, or guarantee a legal, medical, financial, filing, or provider deadline.
  - **Explain legal or medical terms:** provide reviewed plain-language meaning only, state the limit, and route interpretation, diagnosis, advice, consent, or consequence questions to a qualified person.
  - **Extract key actions:** separate explicit required actions from optional guidance and unconfirmed interpretation.
  - **Generate customer questions:** suggest questions the customer may choose to ask a lawyer, clinician, adviser, provider, or business representative; never answer on that person's behalf.
  - **Show related documents:** display only non-revoked documents already visible to the same active tuple and connected by reviewed customer-visible metadata; similarity does not grant access.
- **Consent:** Require an explicit acknowledgement or download action. A summary is never a signature, acceptance of legal terms, payment authorization, or proof that the customer read the entire file.
- **Permission:** The exact non-revoked document must be RLS-visible for the active business/profile tuple. Downloads remain server-mediated, bucket-allowlisted, canonical-path checked, and short-lived.
- **Fallback:** Show the original authorized document and its existing status. If summarization or download fails, do not guess or expose storage details.
- **Human escalation:** Escalate ambiguous, disputed, legal, medical, financial, inaccessible, corrupted, or revoked content through an approved channel.
- **Success metric:** Customers find the relevant authorized file and complete an intended acknowledgement with fewer errors, while unauthorized/revoked access and mistaken signature claims remain zero.

### Messaging

- **Context trigger:** The customer opens a visible thread, receives a new customer-visible reply, repeats a question, or drafts a message about a visible record.
- **Suggestion:** Offer a concise thread summary, a customer-reviewable draft, a relevant visible record link, or the option to ask a person.
- **Planned pattern catalog:**
  - **Suggested replies:** propose short replies grounded in the visible thread and current record state.
  - **Auto-complete:** complete only the customer's current draft, without adding commitments, sensitive facts, or new recipients.
  - **Intent detection:** classify a likely administrative intent to choose an allowed pattern or human route; intent never creates permission or changes a record.
  - **Escalation:** identify policy, safety, dispute, privacy, regulated, or authority limits and offer the approved human channel.
  - **Follow-up suggestions:** suggest a reminder or question only when the visible thread shows a genuine unresolved item; never manufacture urgency.
  - **Translation:** translate visible messages while preserving the original, authorship, names, dates, and uncertainty.
  - **Context awareness:** use only the active visible conversation and directly authorized records; do not retrieve hidden CRM notes or other threads.
  - **Human takeover:** visibly pause AI suggestions when a person takes over and do not expose private staff work.
- **Consent:** The customer reviews and sends every drafted message. Enabling “ask a person” records intent only.
- **Permission:** Messages use the active tuple. The browser remains limited to customer-authored, customer-visible inserts; only a trusted server may persist a validated AI reply.
- **Fallback:** Preserve the draft locally in the current interaction when safe, show a neutral send failure, and avoid duplicate submission.
- **Human escalation:** Escalate disputes, sensitive data, unsupported questions, repeated failures, regulated judgment, or an explicit request for a person. Do not promise notification or response without verified operations.
- **Success metric:** Fewer repeated questions and faster safe completion, with zero sender spoofing, hidden-message exposure, cross-tenant access, or duplicate sends.

### Appointments

- **Context trigger:** A visible appointment is upcoming, preparation time has arrived, a provider action link is available, or a status change affects the customer.
- **Suggestion:** Surface preparation instructions, timezone-aware details, approved join/reschedule/cancel actions, or a support route when provider state is uncertain.
- **Planned pattern catalog:**
  - **Best available slot:** rank only current slots returned by an authoritative provider using customer-approved constraints; never invent availability or reserve without confirmation.
  - **History-aware booking:** reuse explicit customer preferences and visible prior logistics when still relevant; do not infer sensitive health, protected, or behavioral traits.
  - **Preparation reminders:** show reviewed instructions at the configured time in the customer's explicit locale and timezone.
  - **Travel reminders:** use only consented location precision and current external travel data when an approved integration exists; otherwise show static arrival guidance without claiming traffic knowledge.
  - **Rescheduling:** open or submit only an implemented provider action after the customer reviews the consequences.
  - **Late arrival:** show the reviewed business policy and contact route; never promise that the provider will hold the slot.
  - **Waitlist:** offer opt-in only when a real waitlist contract exists, preserve stated preferences, and never promise priority or availability.
- **Consent:** The customer explicitly chooses every provider action and reviews the destination and known consequence. JOHAI does not claim completion until the provider confirms it.
- **Permission:** The appointment must match the active tuple; only customer-visible fields and validated HTTPS destinations are used.
- **Fallback:** Keep the recorded appointment unchanged, explain that provider status is unconfirmed, and offer the verified business contact when available.
- **Human escalation:** Escalate scheduling disputes, missing or unsafe links, clinical/legal/safety questions, accessibility needs, or time-sensitive uncertainty.
- **Success metric:** Fewer missed appointments and timezone errors, with zero false confirmations, unsafe links, provider-secret exposure, or cross-tenant records.

### Support

- **Context trigger:** A customer encounters a repeated failure, cannot complete an allowed action, opens the support area, or explicitly requests help.
- **Suggestion:** Provide context-aware help from the current visible workflow, not a generic chat response, then offer the smallest approved solution, a prefilled customer-reviewable request, or a verified contact channel.
- **Planned pattern catalog:**
  - **Automatic issue diagnosis:** classify only a known non-regulated product symptom from deterministic visible state and approved diagnostics. It is issue triage, not medical diagnosis, legal judgment, financial advice, safety certification, or unsupported root-cause certainty.
  - **Suggested solutions:** show reviewed, reversible troubleshooting steps whose prerequisites match the current state; stop when a step could lose data, change authority, create a charge, or increase risk.
  - **Context-aware escalation:** attach only the customer-reviewed visible facts needed for the approved support channel.
  - **Human takeover:** clearly mark when AI suggestions stop and a person becomes the responder; do not claim takeover until assignment is verified.
- **Consent:** The customer reviews the subject, category, details, and any information shared before submission.
- **Permission:** The request is created only for the active tuple with server-owned initial status. The customer cannot set assignment, priority, internal notes, or lifecycle status.
- **Fallback:** Preserve a safe draft and state that submission or direct follow-up is unavailable. Never imply monitoring.
- **Human escalation:** Escalate security, privacy, accessibility, disputes, vulnerability, emergencies, regulated judgment, and repeated technical failures.
- **Success metric:** More issues reach the correct approved channel with complete customer-visible context, while false notification/SLA claims and unauthorized status changes remain zero.

### Payments

Status: **Planned; no Customer Portal payment workflow is implemented.**

- **Context trigger:** An authorized, customer-visible payable record shows a current amount, currency, payee, due state, and approved payment-provider action.
- **Suggestion:** Explain the visible amount and offer to open the reviewed provider payment step.
- **Consent:** Require explicit confirmation of amount, currency, payee, purpose, provider, and cancellation/refund limitations. Never treat a stored preference as payment consent.
- **Permission:** A trusted server revalidates the exact payable record, tenant, status, entitlement, provider destination, and idempotency key. AI never holds or submits payment credentials.
- **Fallback:** Leave the payable state unchanged, show that payment was not completed, and provide the verified billing contact. Never retry a charge automatically.
- **Human escalation:** Escalate disputes, duplicate charges, refunds, fraud, accessibility, currency/tax uncertainty, and failed provider reconciliation.
- **Success metric:** Customers reach the correct payment step with fewer errors, while automatic charges, duplicate charges, wrong-payee actions, and false completion claims remain zero.

### Profile

- **Context trigger:** The customer opens Profile, a permitted field is missing or invalid, or a communication preference affects an upcoming visible interaction.
- **Suggestion:** Highlight only the approved editable field and explain why updating it may help.
- **Consent:** The customer reviews and saves every change. No sensitive field is inferred or silently corrected.
- **Permission:** Updates stay within the active profile and the platform-controlled editable-column allowlist. Tenant, Auth linkage, role, status, IDs, and server timestamps are never customer-editable.
- **Fallback:** Keep the last authoritative profile, show field-specific validation, and allow discard/retry without losing unrelated data.
- **Human escalation:** Escalate identity disputes, account ownership, inaccessible fields, suspected compromise, legal-name policy, or cross-profile inconsistency.
- **Success metric:** More valid customer-controlled contact/preference data with fewer save errors, while unauthorized-field mutation and cross-profile updates remain zero.

### Orders

Status: **Planned; no Customer Portal order module is implemented.**

- **Context trigger:** A tenant-enabled order module exposes an authorized draft, current catalog selection, or visible order status for the active customer.
- **Suggestion:** Offer to review a draft, clarify approved item information, or show the next permitted status action.
- **Consent:** The customer confirms items, quantities, options, price, taxes/fees, fulfillment, and final submission. No reorder or substitution is automatic.
- **Permission:** Known item IDs, current server prices, availability, tenant, customer, action, and rate limits are revalidated at submission.
- **Fallback:** Preserve a draft without reserving stock or charging; explain that price or availability must be refreshed.
- **Human escalation:** Escalate substitutions, allergy/safety issues, restricted goods, fulfilment disputes, returns, fraud, and price discrepancies.
- **Success metric:** Fewer correction cycles and abandoned valid drafts, with zero unauthorized orders, automatic purchases, stale-price submission, or hidden substitutions.

### Reservations

Status: **Planned; current appointments do not prove a reservation module.**

- **Context trigger:** An enabled reservation module has current customer-visible availability from an authorized provider.
- **Suggestion:** Present bounded options that match the customer's stated time, party, property, or service constraints.
- **Consent:** The customer reviews date, time, timezone, party/guest details, location, terms, deposit/cancellation implications, and provider before submission.
- **Permission:** Availability is rechecked server-side for the exact tenant and module; provider credentials remain server-only.
- **Fallback:** Do not hold or confirm unavailable inventory. Offer to refresh, choose another approved option, or contact the business.
- **Human escalation:** Escalate accessibility, allergy, special accommodation, policy exceptions, overbooking, emergencies, and disputed cancellation terms.
- **Success metric:** Fewer invalid reservation attempts and timezone mistakes, with zero false confirmations, unapproved deposits, or exposure of another customer's reservation.

### Invoices

Status: **Planned as a smart workflow; shared documents alone do not create invoice operations.**

- **Context trigger:** A current, explicitly shared invoice document or future authorized invoice record is visible to the active customer.
- **Suggestion:** Summarize issuer, invoice number, date, visible line-item totals, due state, and approved next actions without reinterpreting tax or contractual obligations.
- **Consent:** The customer chooses download, dispute, support, or a separately authorized payment step. Viewing or acknowledging is not agreement or payment.
- **Permission:** The exact invoice/document must be current, non-revoked, tenant/profile scoped, and exposed through approved fields. Payment authority is separate.
- **Fallback:** Show the original authorized invoice and verified contact; do not recompute totals, invent missing line items, or mark it paid.
- **Human escalation:** Escalate disputes, credits, refunds, tax questions, duplicate invoices, legal terms, and payment reconciliation.
- **Success metric:** Customers understand and route invoice questions faster, with zero invented totals, status changes, cross-tenant invoices, or automatic payment.

## Planned industry interaction prompts

All examples below are **Planned product-design prompts**, not implemented variants. The four lines describe intended discoverability and suggestion behavior only. They never override the standard pattern contract or create a service promise.

### Restaurant

- **Customer opens:** Their own reservation, event request, approved menu/event document, message thread, or support page.
- **JOHAI understands:** The active restaurant tenant, current customer-visible reservation/event context, approved hours/menu guidance, and whether a reviewed reservation or order module is enabled.
- **JOHAI suggests:** The next safe reservation, preparation, document, or human-support step; allergy uncertainty always goes to a person and no order, deposit, or payment is automatic.
- **Customer never has to ask:** Where to find their confirmed details, approved menu/event file, cancellation contact, or guest-support channel when that information exists.

### Dental

- **Customer opens:** Their own visit, preparation instructions, form, report, receipt, message, or patient-support page.
- **JOHAI understands:** The active clinic tenant, visible appointment status, reviewed administrative preparation content, and the exact shared documents.
- **JOHAI suggests:** Administrative preparation, form/document review, schedule action, or clinic contact; it never diagnoses, recommends treatment/medication, assesses contraindications, or handles emergencies.
- **Customer never has to ask:** Where to find visit time, preparation instructions, current forms, receipt, or verified clinic contact when available.

### Beauty

- **Customer opens:** Their own booking, approved service guide, preparation/aftercare file, receipt, message, or salon support.
- **JOHAI understands:** The active salon tenant, customer-visible booking and service context, reviewed policies, and enabled service modules.
- **JOHAI suggests:** Preparation, aftercare document access, rescheduling, or a person; it never determines medical suitability, contraindications, or guaranteed results and never charges a deposit automatically.
- **Customer never has to ask:** Where to find booking details, approved care instructions, cancellation policy, receipt, or salon contact.

### Legal

- **Customer opens:** Their own consultation, customer-visible case request, shared checklist/document, message, or firm support.
- **JOHAI understands:** The active firm tenant and only the explicitly shared administrative context; attorney work product, conflict data, internal notes, trust accounting, and other matters remain forbidden.
- **JOHAI suggests:** Consultation preparation, an approved document checklist, or a request for counsel; it never gives legal advice, calculates a deadline, predicts an outcome, files, negotiates, or signs.
- **Customer never has to ask:** Where to find their shared appointment, approved checklist, current client-visible document, or verified firm contact.

### Real Estate

- **Customer opens:** Their own viewing, consultation, saved-property module when enabled, shared disclosure, message, or agent support.
- **JOHAI understands:** The active agency tenant, customer-linked visible property/appointment context, and only approved listing facts.
- **JOHAI suggests:** Viewing preparation, document review, schedule action, or agent contact; it never steers, infers protected traits, sets an offer, guarantees value, or gives mortgage/legal advice.
- **Customer never has to ask:** Where to find viewing details, approved listing material, shared disclosure, or the correct agent-support channel.

### Home Services

- **Customer opens:** Their own service visit, estimate/report document, job-status module when enabled, message, or dispatch support.
- **JOHAI understands:** The active service-business tenant, customer/property-linked visible records, reviewed preparation guidance, and whether estimate/job modules are enabled.
- **JOHAI suggests:** Visit preparation, approved estimate/report review, schedule action, or a person; it never gives unsafe repair instructions, remotely certifies safety, guarantees an estimate, or promises dispatch.
- **Customer never has to ask:** Where to find arrival details, preparation steps, current shared estimate/report, or verified service contact.

### Medical

- **Customer opens:** Their own appointment, intake form, approved preparation instruction, report, message, or practice support.
- **JOHAI understands:** The active practice tenant and only reviewed administrative, appointment, and explicitly shared information.
- **JOHAI suggests:** Administrative preparation, form completion, scheduling, or a verified care-team channel; it never diagnoses, triages, recommends treatment/medication, interprets results, or handles emergencies.
- **Customer never has to ask:** Where to find appointment logistics, reviewed preparation instructions, current forms, or the practice's approved contact path.

### Fitness

- **Customer opens:** Their own session/class appointment, approved program information, waiver/document, message, or studio support.
- **JOHAI understands:** The active fitness tenant, visible schedule and customer-approved preferences, and reviewed general preparation content.
- **JOHAI suggests:** Schedule options, equipment/preparation reminders, document review, or a coach; it never diagnoses injury, determines exercise safety, prescribes nutrition, or guarantees results.
- **Customer never has to ask:** Where to find session time, approved preparation information, waiver, or verified studio contact.

### Automotive

- **Customer opens:** Their own service appointment, estimate/report, job-status module when enabled, receipt, message, or shop support.
- **JOHAI understands:** The active automotive tenant, customer/vehicle-linked visible records, and approved service-status information.
- **JOHAI suggests:** Visit preparation, estimate/report review, schedule action, or technician/service-advisor contact; it never remotely diagnoses safety, says a vehicle is safe to drive, guarantees cost, or authorizes repair/payment.
- **Customer never has to ask:** Where to find appointment details, current shared estimate/report, receipt, or verified shop contact.

### Hospitality

- **Customer opens:** Their own stay/reservation, approved property guide, event request, invoice/receipt, message, or guest support.
- **JOHAI understands:** The active property tenant, customer-visible booking context, reviewed property information, and enabled reservation/event modules.
- **JOHAI suggests:** Arrival preparation, approved property information, reservation action, or guest-services contact; it never guarantees an upgrade/accommodation, confirms unavailable inventory, or charges automatically.
- **Customer never has to ask:** Where to find confirmed stay details, arrival guidance, shared receipt, cancellation contact, or guest-support channel.

### Insurance

- **Customer opens:** Their own shared policy document, submitted claim-status module when enabled, appointment, message, invoice, or support page.
- **JOHAI understands:** The active insurer/agency tenant and only customer-visible policy documents and submitted status records.
- **JOHAI suggests:** Document location, administrative checklist, status explanation, or licensed human contact; it never determines coverage, underwrites, adjudicates, settles, predicts claim outcome, or changes a policy.
- **Customer never has to ask:** Where to find the latest shared policy/claim document, visible submitted status, required administrative item, or verified agency contact.

### Finance

- **Customer opens:** Their own consultation, shared statement/document, invoice, message, or financial-service support.
- **JOHAI understands:** The active financial-business tenant and only the exact customer-visible records explicitly published for that relationship.
- **JOHAI suggests:** Administrative document organization, appointment preparation, invoice routing, or an authorized human; it never recommends investments, makes credit/tax/lending decisions, executes a transaction, or guarantees a return.
- **Customer never has to ask:** Where to find their shared document, consultation details, invoice/support route, or verified professional contact.

### Education

- **Customer opens:** Their own class/advising appointment, approved course document, form, invoice/receipt, message, or learner support.
- **JOHAI understands:** The active education tenant and only customer-visible schedule, published course, enrollment-support, and shared document context.
- **JOHAI suggests:** Schedule preparation, approved resource/document access, form routing, or staff support; it never grades, disciplines, decides admission, awards credentials, or changes an academic record.
- **Customer never has to ask:** Where to find current schedule details, approved learning document, required visible form, or learner-support contact.

### Retail

- **Customer opens:** Their own order module when enabled, reservation/pickup record, receipt/invoice, return document, message, or store support.
- **JOHAI understands:** The active retailer tenant, customer-visible order/receipt context, current reviewed policies, and which commerce modules are enabled.
- **JOHAI suggests:** Order-status explanation, pickup preparation, approved return step, or store contact; it never places/reorders, substitutes, charges, refunds, or adjudicates a warranty automatically.
- **Customer never has to ask:** Where to find their visible order status, pickup details, receipt, approved return policy, or verified store-support channel.

## Cross-industry safety limitations

- Suggestions never create authority, inventory, availability, entitlement, professional judgment, or a provider commitment.
- No industry template enables a module, AI capability, payment, or customer action by itself.
- No diagnosis, treatment, medication, emergency triage, legal advice, deadline calculation, financial advice, investment decision, insurance determination, housing steering, safety certification, grading, automatic order, automatic reservation, automatic payment, refund, or status mutation is permitted.
- AI does not read internal Business Brain, Knowledge Center sources, CRM, staff notes, billing administration, provider credentials, or other tenants.
- When customer-visible data is absent, stale, conflicting, or unauthorized, JOHAI states that limitation and uses the approved fallback.
- A human-request flag or support record is not evidence of notification, assignment, response, or SLA.

## Rollout and validation

Implement one pattern and one bounded industry use case at a time:

1. inventory the current customer journey and hard-coded terminology;
2. define the typed capability, trigger, permission, consent, fallback, and escalation contract;
3. confirm that existing RLS and safe columns support the interaction or stop for the mandatory database workflow;
4. validate neutral behavior with the feature off;
5. validate Tenant A/Tenant B isolation and multi-profile switching;
6. test direct routes/APIs, stale configuration, provider failure, duplicate actions, cancellation, accessibility, localization, rate limits, and monitoring;
7. pilot with fictional non-production identities and reviewed evidence;
8. obtain product, security, operational, accessibility, and industry/compliance approval;
9. roll out through internal, pilot, and on states with an immediate flag/configuration rollback; and
10. update certification only after behavior and operations are proven.

Smart interaction design does not increase the current Customer Portal certification score, close existing production blockers, or make the Portal production-ready.
