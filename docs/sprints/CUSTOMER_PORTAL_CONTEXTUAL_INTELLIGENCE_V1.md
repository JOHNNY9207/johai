# Customer Portal Contextual Intelligence V1

- **Date:** 2026-07-14
- **Platform layer:** Customer Portal
- **Sprint objective:** Add bounded, customer-safe contextual assistance to the existing Portal without creating a chatbot or widening access
- **Implementation status:** Implemented for deterministic customer-visible rules and the fictional demo interactions described below
- **Production generative provider:** Unavailable; fails closed
- **Customer-visible knowledge publication:** Planned; not implemented
- **Database impact:** None
- **Certification status:** 71/100, **FAILED**, Production Ready **NO**

## Authority and decision

This sprint implements the locked [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md), [North Star](../foundation/JOHAI_NORTH_STAR.md), [Product Promise](../foundation/PRODUCT_PROMISE.md), and [Contextual Intelligence](../philosophy/CONTEXTUAL_INTELLIGENCE.md) within the Customer Portal. It does not amend a Foundation document.

The customer outcome is a Portal that uses the active customer's already authorized information to present the smallest useful next step. The business remains the visible service provider. Context never creates permission, suggested text never sends automatically, provider output never changes an authoritative record, and a person is never described as notified unless an operational workflow proves that fact.

The implementation passed the Constitutional decision test for this bounded scope: it reduces repeated navigation and interpretation, explains why assistance appears, stays silent when assistance is unsafe or unnecessary, preserves customer control, and keeps the existing tenant, authentication, Storage, and human-authority boundaries intact.

## Current-state audit

Before this sprint, the Portal already implemented dedicated authentication, active-profile tenant selection, customer-safe repositories, a summary dashboard, appointments with explicit timezones and external provider links, customer-visible messaging, current documents and acknowledgements, editable profile preferences, support requests, deterministic demo dates, and a development-only fictional repository.

The following were not implemented before this sprint: a typed contextual snapshot, explicit silence and confidence rules, ranked dashboard insights, contextual appointment/profile/support guidance, document assistance, suggested replies, message rewriting, or a provider boundary. The existing persisted `ai` sender label represented a trusted stored message; it was not customer-facing generation.

No approved customer-visible knowledge projection or production document-content provider existed. That remains true after this sprint.

## Context engine and policy

`app/lib/customer-portal-contextual-intelligence.ts` now defines:

- `PortalContextSnapshot`, `PortalContextSource`, `PortalInsight`, `PortalSuggestion`, `PortalAction`, `PortalEscalation`, and confidence/access classifications;
- one explicit policy with a maximum of three dashboard insights, a maximum of three message suggestions, customer-visible source kinds, confidence wording, and silence conditions;
- exact business/profile filtering for appointments, messages, documents, acknowledgements, requests, and profiles before they become contextual sources;
- safe reference-time normalization rather than a render-time browser clock;
- deterministic dashboard, appointment, support, and profile guidance; and
- silence for expired, inactive, suspended, unavailable, foreign-tenant, revoked, completed, unsupported, or unsafe cases.

The engine consumes only the existing customer-facing domain types. It does not import CRM, Business Brain, Knowledge Center, semantic-memory, billing, service-role, prompt, orchestration, or internal-note systems.

## Provider boundary

`app/lib/customer-portal-contextual-provider.ts` defines a narrow provider contract for document assistance, message suggestions, and message rewriting.

- Authenticated production routes receive `unavailablePortalContextualIntelligenceProvider`. It returns no suggestions and a safe unavailable result. Production document explanation, summarization, translation, and generated rewriting are therefore not exposed.
- `/portal/demo` receives `demoPortalContextualIntelligenceProvider`. It produces fixed fictional outputs from the approved Harbor Dental fixture and does not call Supabase, OpenAI, another network service, or a production data source.
- The demo provider supports bounded document explain, summarize, key-action, important-date, question, related-context, and limited translation demonstrations. It refuses regulated interpretation and directs the customer to the business.
- Suggested replies and rewrites only fill an unsent draft. The customer's existing submit action remains the only send path.

A future production provider requires a separately approved server-side design that reconstructs authorized context, enforces sources and freshness, validates output, applies abuse controls, and publishes only approved customer-visible knowledge. A browser snapshot must never be treated as authorization.

## Surface behavior

| Surface | Implemented behavior | Availability boundary |
| --- | --- | --- |
| Dashboard | Up to three ranked insights from upcoming preparation, unacknowledged available documents, and active requests; one primary recommendation; every insight explains why it appears | Authenticated production and demo; deterministic only |
| Documents | Explain, summarize, key actions, important dates, questions, related context, and limited demo translation; generated label, source, confidence wording, source-of-truth warning, and regulated refusal | Demo only; production provider unavailable |
| Messages | Up to three suggested replies, clear/concise/polite draft help, and a human-judgment notice; suggestions never auto-send | Generated suggestions and rewriting are demo only; the deterministic human-help notice is shared |
| Appointments | Preparation guidance repeats only the customer-visible appointment notes; external link copy states that availability and completion belong to the provider | Authenticated production and demo |
| Support | One contextual prompt based on an active customer-visible request, with appointment fallback where that data is available; using it prefills the request form | Authenticated production and demo; no staff-notification claim |
| Profile | Optional guidance explains why contact language and communication fields may be useful and confirms when preferences are set | Authenticated production and demo |

When a complete dashboard snapshot has no useful insight, the Portal says **Everything is up to date.** When a page does not have enough approved context, contextual UI remains absent or reports assistance as unavailable without inventing an answer.

## Trust, authorship, and human escalation

- Deterministic demo output is labeled **Deterministic demo guidance**.
- Persisted AI-authored messages remain labeled **AI-assisted response**.
- Every generated guidance panel names its customer-visible source and says that the original document or record remains the source of truth.
- Confidence is mapped to customer-facing `supported`, `limited`, or `unavailable` wording; there is no decorative confidence meter.
- Regulated clinical, legal, financial, or contractual interpretation is refused.
- Escalation says that a person may be requested and explicitly states that no person was contacted automatically.
- Appointment assistance never invents provider availability or booking completion.

## Security boundary

The implementation does not change authentication, RLS, grants, table schemas, Storage, signed-download behavior, or the active business/profile authorization tuple. Context snapshots discard records whose business or customer profile does not match the active tuple. Revoked documents are not contextual sources.

Customer-facing context remains limited to the active profile, published branding, customer-visible appointments, messages, documents, acknowledgements, and requests. CRM internals, lead scores, Business Brain, private Knowledge Center sources, internal notes, billing, prompts, orchestration, credentials, Storage paths, signed URLs, and other tenants remain forbidden.

Expired, suspended, inactive, or unavailable access produces no insights or provider output. The demo remains guarded from production and creates no Supabase or Auth client.

## Accessibility and responsive design

Contextual controls use native buttons, explicit button types, visible focus styles, labelled regions, `aria-expanded` and `aria-controls` where content opens, and polite live regions for generated results. Suggestions do not steal focus automatically. Existing responsive layouts and touch-sized actions were preserved.

Automated structural accessibility checks passed, and keyboard activation of the native appointment-guidance disclosure passed at 1440×900. A complete browser keyboard traversal, real screen-reader evaluation, and the remaining tablet/mobile interaction matrix for the new contextual controls remain Pending.

## Automated test coverage

The Portal suite now contains 31 passing tests, including the fifteen Contextual Intelligence requirements:

1. foreign-tenant and foreign-profile records are rejected;
2. only allowlisted customer-visible source kinds are exposed;
3. dashboard insights are capped at three with one primary recommendation;
4. completed work produces silence;
5. suggested replies do not send or mutate a conversation;
6. document help preserves source and source-of-truth warnings;
7. regulated interpretation is refused;
8. appointment guidance does not invent slots;
9. human escalation wording does not claim notification;
10. demo intelligence is deterministic;
11. demo intelligence creates no Supabase or Auth client;
12. production demo exposure remains blocked;
13. expired access receives no contextual output;
14. suspended and inactive access remain silent; and
15. generated authorship and keyboard-safe control contracts are explicit.

These tests are local application evidence. They do not prove deployed Auth, RLS, direct-REST denial, private Storage, signed URLs, production performance, rate limiting, monitoring, or assistive-technology behavior.

## Validation

- `npm run test:portal`: passed, 31/31 tests.
- `npm run lint`: passed.
- `npm run build`: passed.
- Browser validation: partial. At 1440×900 the contextual dashboard rendered three insights with exactly one primary action and no page-level horizontal overflow; keyboard activation revealed the appointment preparation guidance. No browser warning or error was captured during those observations. The browser safety policy then blocked the private-network preview before document, message, support, and profile interactions and the 768×1024 and 390×844 passes could finish. Those interactions, complete keyboard traversal, and real screen-reader evaluation remain Pending.
- SQL executed: none.

## Capability classification

### Implemented

- Typed customer-safe snapshot, source, insight, suggestion, action, escalation, confidence, access, and policy contracts.
- Exact tuple filtering, silence rules, confidence labels, maximum insight/suggestion limits, and deterministic dashboard/appointment/profile/support guidance.
- Shared contextual UI with source, reason, authorship, source-of-truth, and truthful escalation language.
- Deterministic fictional demo provider and its document and messaging interactions.

### Demo-only

- Document explanation, summarization, key actions, important dates, question prompts, related context, and limited fictional translation.
- Suggested replies and clear/concise/polite rewrite demonstrations.

### Partial

- Contextual Intelligence is implemented for this bounded Portal V1, but it is not a shared platform runtime and has no measured production customer-effort outcomes.
- The customer-facing human-help flow records intent through messages or support requests; notification, assignment, response, and service-level operations are not proven.

### Planned or unavailable

- Production generative provider and external model integration.
- Production document-content extraction, explanation, summarization, and translation.
- Approved customer-visible knowledge publication, retrieval, citation, freshness, and revocation.
- Industry configuration, dynamic modules, outcome instrumentation, production abuse controls, and monitored human takeover.
- Autonomous sending, appointment mutation, invented availability, professional advice, or access to internal systems remains deliberately unavailable.

## Certification and next gate

This sprint does not certify Customer Portal V1. The authoritative score remains **71/100**, certification **FAILED**, and Production Ready **NO**.

The remaining gates are approved synthetic identity provisioning; credential-backed authentication; behavioral tenant/RLS/direct-REST denial; private Storage and signed-URL behavior; invitation and suspension operations; support lifecycle; abuse controls, monitoring, and incident evidence; complete keyboard/screen-reader validation; and production performance.

## Database and execution record

No schema change was required. No migration or verification file was created, modified, deleted, replaced, or executed. All applied migrations remain immutable. No SQL was executed.
