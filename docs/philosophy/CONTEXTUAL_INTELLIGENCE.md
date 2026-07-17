# JOHAI Contextual Intelligence™

## Status and scope

- **Document type:** Permanent product and architecture philosophy
- **Constitutional authority:** Subordinate to the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md)
- **Platform scope:** All JOHAI surfaces, with customer-safe application to the Customer Portal
- **Philosophy status:** Adopted design rule
- **Contextual Intelligence engine:** Planned; not implemented as a production customer-facing system
- **Customer-facing AI generation in the Portal:** Not implemented
- **Application, API, authentication, database, or migration change created by this document:** None

This document defines how JOHAI should use context to make an experience feel prepared, relevant, and safe. It applies the Constitution to contextual behavior and cannot override a Constitutional law, product value, security/privacy/accessibility boundary, or human approval. It is a design contract, not a claim that a context engine, customer memory service, customer-facing AI assistant, or autonomous action system exists today.

## Permanent rule

> **The AI never asks for information it can already infer from context.**

In this rule, **infer** means resolve from current, authorized, sufficiently fresh, customer-safe context. It does not mean guess, stereotype, recover hidden data, or use an internal record that the customer is not allowed to see.

If the required context is missing, ambiguous, stale, unsupported, or outside the customer's permissions, JOHAI asks the smallest clarifying question needed or states that it cannot determine the answer. It must never pretend certainty.

Examples:

- If the authenticated profile already supplies the customer's name, do not ask for the name again merely to begin a conversation.
- If the customer opened assistance from one appointment, do not ask which appointment they mean unless multiple records are genuinely relevant.
- If the customer is viewing one shared document, do not ask them to retype its title or identifier.
- If the active business and customer profile are already authorized, do not ask the customer to provide a tenant or account ID.
- If two authorized appointments could match “my next visit,” present the two safe choices instead of guessing.
- If a fact exists only in an internal CRM note or another customer's record, it is not available context and must not influence the response.

## Definition

**Contextual Intelligence** is the governed ability to understand the customer's current situation before deciding what to show, ask, explain, suggest, or leave alone. It combines authorized context, business rules, timing, current task, and explicit customer intent while minimizing repetition.

Contextual Intelligence is not “memory everywhere.” It is selective, permission-aware, purpose-bound, and revocable. The best contextual experience often feels simple because the system quietly resolves what is already known and asks only for what is truly missing.

## How it differs from familiar interaction models

| Model | Typical behavior | Relationship to Contextual Intelligence |
| --- | --- | --- |
| Chatbot | Waits for a message and produces a conversational answer | Conversation is one possible interface. Contextual Intelligence determines what the conversation may safely know and whether a conversation is needed at all. |
| Digital assistant | Helps complete broad tasks and may retain preferences | Contextual Intelligence is narrower and governed: permission, tenant, source, timing, and business rules are resolved before assistance. |
| Copilot | Works beside a user who remains in control of a task | A copilot may use Contextual Intelligence, but customer actions still require an allowed deterministic operation and explicit confirmation. |
| Search | Retrieves matching records or documents | Search finds candidates. Contextual Intelligence decides which authorized candidates matter to the current task and how much clarification is required. |
| FAQ | Returns a predefined answer to a common question | An FAQ is a source. Contextual Intelligence applies the right approved answer only when industry, business, customer, time, and permissions support it. |
| Live chat | Connects a customer with a person | Live chat is a support channel. Contextual Intelligence may prepare safe context, but it must not claim a person was notified or assigned unless that operation is verified. |

Contextual Intelligence can support a page, form, message, search result, notification, or human handoff. It is an experience and decision discipline, not a synonym for a chat box.

## Context dimensions

Every dimension is optional and must pass authorization, relevance, freshness, and purpose checks before use.

| Dimension | Customer-safe meaning | Guardrail |
| --- | --- | --- |
| Intent | What the customer is explicitly trying to understand or complete now | Do not infer a high-impact intent from weak behavioral signals. Ask when ambiguity changes the outcome. |
| Memory | Bounded customer-visible facts or preferences that remain useful across interactions | Never imply unlimited memory. Respect deletion, revocation, tenant switches, and changing preferences. |
| Permissions | The exact records and operations allowed for the authenticated customer/profile/business tuple | Permission is evaluated before personalization. Labels, local storage, routes, or model output never grant access. |
| Business rules | Published customer-facing policies, allowed actions, hours, escalation rules, and provider constraints | Internal policies and unpublished exceptions remain private. Rules must be current and attributable. |
| Timing | Current time, appointment state, customer-visible deadlines, business hours, and data freshness | Use explicit locale and timezone. Never invent urgency or treat stale data as current. |
| Customer context | The active authorized customer profile, language, communication preference, and approved contact fields | Use only fields needed for the current purpose. Do not surface sensitive or hidden attributes. |
| Customer history | Prior customer-visible appointments, messages, documents, requests, preferences, and completed actions that remain relevant to the current task | History is bounded by the active tenant/profile, retention, revocation, purpose, and freshness. Never infer sensitive traits or reuse another business's history. |
| Document context | The selected current, non-revoked, customer-visible document and an approved customer-visible projection | Raw storage paths, internal source files, superseded content, and hidden metadata are forbidden. |
| Appointment context | The selected customer-visible appointment, status, service, time, location, notes, and allowed external actions | Provider availability and external links may be stale; do not promise a booking change JOHAI did not perform. |
| Conversation context | The current customer's visible thread and explicit human-assistance request | Internal notes, hidden messages, other channels, and staff-only deliberation are not conversation context. |
| Location context | A customer-approved service location or business location relevant to the task | Do not infer precise location from device data or reuse one property's location for another without confirmation. |
| Industry context | Reviewed terminology, safety constraints, service vocabulary, and enabled module defaults | Industry selects defaults only. It never grants permission or justifies a stereotype. |
| Channel context | The current Portal page, selected record, device constraints, and verified support channels | A displayed email or phone does not prove delivery, monitoring, assignment, or an SLA. |
| Confidence and source | How directly the answer follows from current approved context | Low confidence, conflicting sources, or missing provenance requires clarification or human escalation. |

## Context resolution order

The planned model follows a strict order:

1. Authenticate the current user and validate session state.
2. Resolve the active RLS-visible customer profile and exact business.
3. Determine the current surface, selected customer-visible record, and explicit intent.
4. Check operation permissions, module availability, record state, and business rules.
5. Assemble only the minimum relevant customer-visible context.
6. Apply language, locale, timezone, timing, source freshness, and industry safety rules.
7. Identify genuine ambiguity or missing information.
8. Show, ask, explain, suggest, or escalate with the least unnecessary friction.

No later step can repair a failure in authentication, tenant resolution, permission, or source safety. When those are uncertain, the system denies or falls back safely.

## When AI should appear

Customer-facing AI is Planned and defaults off. If implemented later, it should appear only when it creates clear customer value, such as:

- answering an explicit question from approved customer-visible sources;
- explaining preparation instructions already shared with the customer;
- summarizing the current customer's visible conversation;
- explaining a current shared document without changing or legally interpreting it;
- helping draft a support request for customer review and confirmation;
- presenting a small set of current authorized choices when clarification is necessary; or
- explaining why a deterministic action is unavailable in customer-safe language.

AI must be visibly identified when it generates customer-facing language. It must distinguish generated guidance, recorded facts, business-provided content, and human messages.

## When AI should remain invisible

AI should not become a character in every interaction. It should remain invisible when:

- authentication, authorization, tenant selection, filtering, formatting, or validation is deterministic;
- the customer can complete a clear action directly with fewer steps;
- a page can prefill an authorized value without commentary;
- a known appointment, document, business, language, or location can be carried into the next step safely;
- the system is enforcing a security or business rule;
- the answer is a simple status already shown in the interface; or
- AI would add ceremony, latency, uncertainty, or a false sense of surveillance.

Invisible intelligence reduces repetition and chooses the right default. It does not hide material automated decisions, generated content, risk, uncertainty, or data use.

## Personality

Contextual Intelligence should feel:

- **Prepared:** uses authorized context without asking the customer to start over.
- **Calm:** presents the next useful step without urgency theatre.
- **Concise:** says what matters now and makes more detail available when needed.
- **Respectful:** never treats access to data as permission to expose or overuse it.
- **Transparent:** labels AI-generated language, uncertainty, external-provider boundaries, and human handoff truthfully.
- **Competent without pretending certainty:** explains what is known, what is missing, and what the customer can do next.
- **Human-centered:** offers an appropriate person when judgment, safety, privacy, or authority exceeds the system's role.

It must not sound omniscient, overly familiar, manipulative, diagnostic, legalistic, or eager to prove that it “remembers” the customer.

## Platform rules

1. **Permission before personalization.** Resolve access before gathering or using context.
2. **Minimum necessary context.** Use only what the current purpose requires.
3. **No repeated questions.** Do not ask for a known, authorized, current value unless the customer needs to confirm it for a consequential action.
4. **No guessing across ambiguity.** Ask the smallest clarifying question when multiple safe interpretations could change the result.
5. **No hidden-source answers.** Customer-facing output may rely only on records and published knowledge approved for that customer context.
6. **No context as authority.** Industry, memory, labels, feature flags, model output, and browser state never grant tenant access or permissions.
7. **Explicit confirmation for consequential actions.** AI may prepare an action, but a registered deterministic operation validates and performs it after customer confirmation.
8. **Truthful channel claims.** Recording a request is not the same as notifying, assigning, or receiving a reply from a person.
9. **Freshness matters.** Appointments, external links, documents, hours, and rules must be checked for current state before use.
10. **Fail safely.** If context resolution or AI fails, preserve the authorized core experience and offer a verified fallback without leaking internal details.
11. **Tenant switches reset context.** Branding, records, modules, memory, AI context, and caches reload together for the new authorized tuple.
12. **Audit important boundaries.** Future generated answers, source selection, confirmation, escalation, and denied actions need privacy-safe operational evidence.

## Customer-safe context boundary

A future Customer Portal context envelope may contain only information already authorized and appropriate for the active customer/profile/business purpose, including customer-visible profile fields, appointments, messages, support requests, current documents, approved business contacts, and separately published customer-visible knowledge.

It must never expose or retrieve for the customer experience:

- CRM internals, including CRM-wide records, lead scores, and internal conversation history;
- Business Brain internals, recommendations, scores, or business-only rules;
- private notes, including staff notes, hidden messages, internal case/clinical/service notes, and internal audit records;
- internal prompts, chain-of-thought, model traces, tool traces, or orchestration state;
- billing internals, including billing administration, payment operations, margins, subscription state, and entitlement internals;
- Knowledge Center raw files, extracted source text, unpublished drafts, or internal search indexes;
- other customers' identities, profiles, appointments, messages, documents, requests, locations, or memory;
- service-role credentials, provider secrets, raw storage paths, tokens, recovery links, signed URLs, or authorization headers; or
- data from another business, environment, profile, or session.

## Implemented, Planned, and deliberately unavailable

### Implemented foundations

- Dedicated Customer Portal authentication and recovery structure.
- Active RLS-visible profile and business selection.
- Exact business/profile scoping in Portal repository operations.
- Customer-visible appointments, messages, documents, acknowledgements, profile fields, and support requests.
- Explicit locale and timezone formatting for deterministic dates.
- Safe loading, empty, retry, denied, and error states.
- A visible **AI-assisted response** label for a trusted persisted message whose sender type is already `ai`.
- Customer controls to request a person; this records intent only.

These foundations do not constitute a Contextual Intelligence engine.

### Planned

- A versioned customer-safe context envelope and context resolver.
- Bounded customer-visible memory with revocation, freshness, and tenant-switch rules.
- Approved customer-visible knowledge publication and retrieval.
- Context-aware terminology, service types, modules, actions, and human channels.
- Customer-facing AI question answering, explanation, summarization, drafting, and escalation.
- Source attribution, confidence handling, monitoring, rate limits, privacy-safe audits, and evaluation.
- Deterministic confirmed operations exposed through reviewed module actions.

### Deliberately unavailable until separately implemented and approved

- Autonomous mutation of appointments, documents, profile status, support status, tenancy, billing, or provider records.
- Unrestricted access to internal JOHAI systems or business-only information.
- Cross-customer or cross-tenant memory.
- Customer-facing diagnosis, legal advice, financial decisions, emergency decisions, or unsupported business commitments.
- Claims of realtime human support, notification delivery, or successful external action without verified operations.

## Measurable outcomes

Contextual Intelligence should be judged by observed customer outcomes, not the number of AI messages generated.

### Customer-effort outcomes

- clicks and navigation steps saved against the approved baseline;
- typing or characters reduced without lowering accuracy or informed consent;
- questions avoided because the answer or action was surfaced from authorized context;
- unnecessary-question rate;
- repeated-field rate for information already available and authorized;
- steps and time required to complete a customer task;
- clarification rate caused by genuine ambiguity versus poor context use;
- task completion, abandonment, retry, and recovery rates; and
- frequency of customers correcting the business, appointment, document, or service context.

### Quality and trust outcomes

- successful-suggestion acceptance and completion rate, measured separately from dismissal and correction;
- supported-answer rate from approved customer-visible sources;
- unsupported-claim and stale-context rates;
- human-escalation appropriateness and successful verified handoff rate without false notification claims;
- customer comprehension of AI, human, recorded, and external-provider boundaries;
- accessibility, language, locale, and timezone success; and
- customer satisfaction plus customer-reported trust, relevance, and effort.

### Security guardrails

- cross-tenant or cross-customer disclosure incidents: target must remain zero;
- use of forbidden internal context: target must remain zero;
- unauthorized action attempts accepted: target must remain zero;
- secrets or raw internal identifiers in customer output: target must remain zero; and
- context retained after logout, suspension, tenant switch, or revocation: target must remain zero.

Targets and baselines must be established from approved testing and production evidence. This philosophy document does not invent performance results or claim that these measurements currently exist.

## Governance

Every future feature that gathers, stores, derives, or applies customer context must document its purpose, data sources, permission boundary, freshness rule, retention, tenant-switch behavior, fallback, human escalation, measurable outcomes, and deletion/revocation behavior.

A new persisted context, memory, permission, or customer-visible knowledge model is a database and security concern. It must follow live-schema inspection, versioned migration, read-only verification, human approval, manual execution, recorded verification, and only then application implementation.
