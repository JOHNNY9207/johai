# Customer Experience Philosophy

## Status and scope

- **Document type:** Permanent Customer Portal product-design philosophy
- **Constitutional authority:** Subordinate to the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md)
- **Experience philosophy:** Adopted
- **Shared Customer Portal experience:** Implemented in repository code
- **Industry adaptation, Contextual Intelligence, and customer-facing AI:** Planned unless explicitly identified as implemented
- **Production readiness:** This document makes no production-readiness claim
- **Application, UI, API, authentication, database, or migration change created by this document:** None

The Customer Portal should feel like a business prepared for the customer, not a collection of software features asking the customer to reconstruct context. This philosophy applies the Constitution to customer-visible information, assistance, actions, failure, and human support; any conflict is resolved in favor of the Constitution.

## Experience promise

The customer experience should be:

- clear about which business and customer profile are active;
- relevant to the customer's current task;
- calm, accessible, and easy to recover when something fails;
- truthful about what JOHAI, the represented business, an external provider, AI, and a person each did;
- private by default and confined to customer-visible information;
- consistent across industries without becoming generic or misleading; and
- respectful of the customer's time, language, location, and existing information.

## Permanent rule

> **The AI never asks for information it can already infer from context.**

The broader product rule is similar: the experience should not make a customer repeat information that is already authorized, current, relevant, and safe to reuse.

This rule never authorizes guessing. If context is missing, ambiguous, stale, sensitive, or outside the customer's permissions, ask the smallest necessary question or explain the limitation.

## Experience principles

### 1. Begin from the customer's situation

Resolve the authenticated customer, active business, selected profile, current page, selected record, language, timezone, and available actions before presenting assistance. The customer should not need to know internal IDs, database names, or organizational structure.

### 2. Never make the customer start over

Carry safe context from the appointment, document, conversation, support request, business, or location the customer is already using. If confirmation is required for a consequential action, show the known value and ask for confirmation rather than requesting the entire value again.

### 3. Show what matters now

Use progressive disclosure. The overview should surface current appointments, recent messages, current shared documents, open requests, and the next useful action without becoming an internal dashboard. Detail belongs on the relevant customer page.

### 4. Make authority visible

Clearly distinguish:

- information recorded by the represented business;
- a customer-authored message or request;
- an **AI-assisted response**;
- a human response;
- an external provider link or operation; and
- a JOHAI platform/account issue.

Never make a generated suggestion look like a completed booking, payment, approval, diagnosis, legal conclusion, assignment, or human decision.

### 5. Use AI only where it reduces effort safely

Customer-facing AI is Planned and defaults off. If implemented, it should explain, summarize, prepare, or clarify approved customer-visible information. It should not interrupt a clear deterministic flow, narrate routine interface behavior, or become the center of the experience.

### 6. Preserve a real human path

A customer must be able to request a person when confidence, authority, safety, privacy, accessibility, or preference requires one. Recording the request is not the same as notifying or assigning staff. Response targets may be shown only when the supporting operation has been implemented and verified.

### 7. Never inflate an action

Names must match outcomes:

- **Acknowledge** means receipt was recorded; it does not mean sign, accept, approve, pay, or consent.
- **Request a person** means intent was recorded; it does not mean a person was notified or assigned.
- **Book**, **Reschedule**, **Cancel**, or **Join** may open an approved external link; JOHAI must not claim the provider completed the action.
- **AI-assisted response** means generated assistance is visible; it does not mean a licensed, authorized, or human decision.

### 8. Industry relevance must not fragment the product

Restaurant reservations, dental visits, beauty bookings, real-estate viewings, legal consultations, and home-service visits are planned configurations of one Portal. They share authentication, tenant isolation, accessible components, error handling, and customer-safe data rules. Industry terminology never grants access or creates a separate security model.

### 9. Failure should be calm and actionable

Explain what the customer can safely do next without exposing internal objects, other tenants, infrastructure, secrets, or security rules. Preserve unrelated authorized features when one optional module fails. Never “solve” an error by loosening access or asking for a service credential.

### 10. Accessibility and localization are core behavior

Use semantic structure, keyboard access, visible focus, clear labels, adequate contrast, understandable errors, live status announcements, explicit locale, and explicit timezone. Do not use browser defaults or client-only locale discovery for initial rendering. Accessibility is not an optional industry theme.

## The customer journey

### Arrival and sign-in

The customer enters through the dedicated Portal authentication surface. After sign-in, the system resolves active RLS-visible profiles. A single authorized profile enters directly; multiple authorized profiles require an explicit choice. The remembered browser choice is a convenience, not authority.

**Implemented:** login/recovery structure, protected customer routes, active-profile selection, local preference, and tenant-bound repositories.

**Not implemented:** public signup and customer-facing invitation redemption.

### Overview

The overview answers: “What is current, what changed, and what can I do next?” It uses customer-visible appointments, messages, documents, and requests. It does not expose business metrics, CRM stages, internal tasks, scores, billing administration, or executive information.

### Appointments

Show the service, state, time, timezone, location, customer-visible preparation, and only actions valid for the current state. External HTTPS actions must be presented as provider links, not as actions JOHAI guarantees.

Planned industry terminology may call this a reservation, visit, booking, viewing, consultation, or service visit. The underlying permission and customer-visible record boundary remains unchanged.

### Messages

Keep customer, human, and AI-assisted authorship visually distinct. Show only customer-visible messages for the active tuple. Avoid passwords, payment details, and secrets. Refresh-based replies must not be described as realtime.

The current Portal can display a trusted persisted AI-labeled message. It does not generate a customer-facing AI response.

### Documents

Show current authorized files, safe metadata, revocation state, download, and acknowledgement. A revoked or unavailable document fails safely. An acknowledgement records receipt only.

Raw Knowledge Center files, internal source documents, storage paths, hidden provider metadata, and another customer's files are never part of the customer experience.

### Profile and preferences

Let customers maintain approved contact, address, language, communication, and notification-preference fields. Explain unsaved changes and errors. Notification preferences do not imply that email, SMS, push, or realtime delivery is implemented.

### Support

Offer bounded requests, visible status, business contact information when configured, and a human-assistance intent. Keep service support separate from JOHAI account/platform support. Do not promise assignment, response time, or an emergency service unless that operation and channel are verified.

### Multi-business switching

Switch business identity, branding, records, configuration, modules, actions, and any future AI context as one transaction from the customer's perspective. Nothing from the previous business may remain visible or influence the next interaction.

### Failure and recovery

Use honest loading, empty, unavailable, denied, retry, and expired-session states. Missing optional configuration falls back to neutral core wording with optional modules off. Authorization uncertainty denies access; it never falls back to another profile or tenant.

## When AI appears and when it stays invisible

### AI may appear later when

- the customer explicitly asks a question;
- approved customer-visible information can answer it safely;
- a selected appointment or document would otherwise require the customer to repeat context;
- a visible conversation can be summarized without introducing hidden information;
- a support request can be drafted for customer review; or
- ambiguity can be reduced to a small set of authorized choices.

### AI stays invisible when

- context can prefill a form or preserve a selection deterministically;
- security, permissions, validation, sorting, formatting, or routing determines the result;
- a direct customer action is clearer and faster;
- a status already answers the question;
- generated language would add no value; or
- context, permission, source freshness, or confidence is insufficient.

The customer must be told when language is AI-generated. The system need not announce every deterministic use of context, but it must explain material automation, uncertainty, and consequential actions.

## Personality

JOHAI's customer-facing personality is:

- warm without becoming overly familiar;
- prepared without sounding like surveillance;
- concise without becoming abrupt;
- confident about verified facts and candid about uncertainty;
- supportive without making commitments for the business;
- plain-spoken rather than technical;
- respectful of cultural, language, accessibility, and communication preferences; and
- quick to involve a person when judgment or authority is required.

Preferred language:

- “I can use the appointment you selected.”
- “Two upcoming visits match. Which one do you mean?”
- “This information is not available here. You can ask the business through Support.”
- “Your request was recorded.”

Avoid:

- “Tell me your name” when the active authorized profile already supplies it.
- “I remember everything about you.”
- “A person has been notified” when only a flag or request row was created.
- “Your appointment was changed” when an external provider link merely opened.
- medical, legal, financial, emergency, or compliance conclusions beyond approved authority.

## Industry adaptation

The planned [Customer Portal Industry Adaptation Architecture](../technical/customer-portal-industry-architecture.md) supports one shared Portal with reviewed terminology and optional modules.

| Industry | Planned customer terminology | Safety boundary |
| --- | --- | --- |
| Restaurant | Guest, reservation, private event, guest help | No allergen guarantee, order/payment claim, or autonomous reservation change |
| Dental | Patient, visit, care document, patient support | No diagnosis, treatment, medication, emergency decision, clinical chart, or consent claim |
| Beauty | Client, booking, service guide, salon support | No medical diagnosis, contraindication decision, waiver, deposit, or payment claim |
| Real estate | Client, viewing, listing/transaction file, agent support | No discriminatory steering, autonomous offer, legal advice, or mortgage decision |
| Legal | Client, consultation, case document, client support | No legal advice, privilege/conflict decision, deadline calculation, filing, or retainer claim |
| Home services | Customer, visit, estimate/service record, service support | No unsafe repair instruction, guaranteed estimate, dispatch promise, work authorization, or payment claim |

These are Planned templates. The Harbor Dental demo is fictional development-only content, not an implemented Dental product variant.

## Customer-safe boundaries

The experience may use only information already authorized and appropriate for the active customer/profile/business purpose. It must never reveal or use customer-facing output to expose:

- CRM internals, lead records, scores, or business-wide conversations;
- Business Brain internals, recommendations, business-only rules, or readiness scores;
- private notes, hidden messages, internal case/clinical/service records, or staff deliberation;
- internal prompts, model reasoning, tool traces, orchestration state, or audit internals;
- billing internals, payments administration, margins, subscriptions, or entitlement internals;
- raw Knowledge Center files, extracted source content, unpublished drafts, or internal indexes;
- another customer's records, memory, identity, location, or activity;
- another business, profile, environment, or session; or
- credentials, tokens, recovery links, signed URLs, authorization headers, provider secrets, or raw storage paths.

If the customer cannot see a source directly or through an approved customer-visible projection, the future assistant cannot use it to answer them.

## Implemented, Planned, and unavailable

### Implemented Customer Portal experience

- Dedicated login and recovery structure.
- Active-profile business selection.
- Overview, appointments, messages, documents, profile, and support.
- Customer-safe repository contracts and exact tenant tuple use.
- Safe external appointment actions.
- Document download, acknowledgement, and revocation presentation.
- Profile and preference editing.
- Responsive loading, empty, retry, error, and access states.
- Explicit locale and timezone formatting.
- Trusted persisted human, customer, and AI-assisted message labels.
- A customer option to request a person, recorded as intent only.

### Planned

- Versioned industry configuration, terminology, module registry, and feature rollout.
- Richer approved branding presentation.
- Customer-visible knowledge publication and retrieval.
- Contextual Intelligence and bounded customer-visible memory.
- Customer-facing AI explanation, summarization, drafting, and FAQ assistance.
- Verified notification delivery, human assignment, response targets, and operational monitoring.
- Additional reviewed industry modules and deterministic confirmed actions.

### Deliberately unavailable today

- Public signup and customer invitation redemption.
- Production customer-facing AI generation.
- Realtime chat or guaranteed human response.
- Email, SMS, WhatsApp, or push delivery from Portal notification preferences.
- Ordering, payment, billing administration, e-signature, clinical record, legal case, property transaction, live dispatch, or technician-tracking systems.
- Autonomous changes to customer status, appointments, documents, support status, tenant access, provider records, or billing.

## Measurable customer outcomes

The experience should be evaluated through approved evidence, not aspirational claims.

### Effort and completion

- percentage of prompts or forms that unnecessarily repeat known authorized information;
- task steps, completion time, abandonment, and retry rates;
- successful appointment, document, message, profile, and support journeys;
- customer corrections caused by wrong business, profile, appointment, document, locale, or timezone context; and
- recovery success after loading, action, session, or external-provider failure.

### Clarity and trust

- customer ability to distinguish business, JOHAI, AI, human, and external-provider actions;
- unsupported claim, stale information, and false-completion rates;
- comprehension of acknowledgement, request, external-link, and AI-assisted labels;
- appropriate escalation without false assignment or SLA claims; and
- customer-reported relevance, trust, and perceived effort.

### Inclusion and safety

- keyboard, screen-reader, focus, contrast, language, locale, timezone, and responsive success;
- zero cross-tenant or cross-customer disclosures;
- zero use of forbidden internal sources in customer output;
- zero accepted unauthorized actions; and
- zero secrets or raw internal identifiers exposed to customers.

No outcome, target, or production result is established merely by listing it here. Baselines and targets require approved testing, instrumentation, privacy review, and recorded results.

## Product decision test

Before adding a customer-facing feature, ask:

1. Does it reduce customer effort without asking for information already available in authorized context?
2. Does it preserve the exact tenant, profile, permission, and source boundary?
3. Is the action name identical to what the system actually does?
4. Is AI necessary, or would a deterministic interface be clearer?
5. Can the customer understand who produced the information and what happens next?
6. Is there a safe fallback and an honest human path?
7. Does it remain accessible, localizable, and usable without the optional intelligence?
8. Can its customer and security outcomes be measured without collecting excessive data?

If any answer is no, the feature is not ready for customer release.
