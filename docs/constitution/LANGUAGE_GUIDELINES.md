# JOHAI Language Guidelines

## Constitutional status

- **Status:** Adopted customer and product language rules
- **Scope:** Interface copy, navigation, actions, errors, empty states, confirmations, AI output, human handoff, sales claims, and documentation
- **Runtime effect:** None; these guidelines govern future and revised language

Language must follow [The JOHAI Constitution](JOHAI_CONSTITUTION.md), the [operational Design Principles](DESIGN_PRINCIPLES.md), [UX Principles](UX_PRINCIPLES.md), [AI Principles](AI_PRINCIPLES.md), and [JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md).

## Voice

JOHAI language is:

- **Simple:** familiar words, short sentences, and one idea at a time.
- **Professional:** precise, respectful, and appropriate to the business relationship.
- **Calm:** factual without alarm, artificial urgency, celebration theatre, or blame.
- **Human:** direct and considerate without pretending the system is a person.
- **Honest:** exact about status, authorship, limitations, consequences, and next steps.

Concise does not mean incomplete. Include information required for informed consent, safety, recovery, or trust.

## Writing rules

Avoid technical jargon, AI buzzwords, and internal implementation language. Prefer simple, professional, calm, human wording that explains the customer-visible fact, limit, and next step.

1. Lead with what the customer needs to know or do.
2. Use active voice and concrete verbs.
3. Name the exact object and action.
4. Use one term for one concept throughout a journey.
5. Put the primary action in the control label, not only in supporting text.
6. State limitations before they can cause a mistaken commitment.
7. Separate recorded facts, AI-assisted language, human messages, estimates, and suggestions.
8. Do not imply delivery, assignment, completion, monitoring, or availability without verified evidence.
9. Do not expose internal implementation language to customers.
10. Write for translation, text expansion, screen readers, and low-context reading.

## Vocabulary

| Prefer | Avoid | Reason |
| --- | --- | --- |
| AI-assisted response | AI employee said, intelligent answer, magic response | Discloses authorship without hype or impersonation. |
| Request a person | Agent notified, specialist assigned | A request does not prove notification or assignment. |
| Contact the business | Escalate immediately | Names the real available channel without false urgency. |
| Open booking site | Book now | Use when JOHAI opens an external provider but does not complete booking. |
| Open payment provider | Pay now | Use when JOHAI cannot itself confirm payment. |
| Save changes | Update profile | Prefer the exact action when only approved fields are saved. |
| Acknowledge document | Accept terms, sign document | Acknowledgement is not acceptance or signature. |
| Current document | Latest truth | “Current” describes status without claiming universal correctness. |
| Not available | Coming soon, almost ready | State the present capability truth. |
| We couldn't save your changes | System error, operation failed | Plain language with a specific affected action. |
| I don't have enough approved information | Low confidence, retrieval failure | Explains the customer-relevant limitation without implementation jargon. |
| Try again | Re-run operation | Familiar recovery wording. |
| Sign in again | Refresh authentication token | Uses the customer's task language. |

## Terms not exposed to customers

Do not use these as customer-facing explanations unless a technical audience explicitly needs them:

- RLS, ACL, JWT, RPC, PostgREST, schema, service role, anon key, row policy;
- orchestration, agent loop, prompt, system prompt, tool call, chain of thought;
- embedding, vector search, semantic index, chunk, retrieval pipeline;
- tenant ID, profile UUID, storage path, signed URL, provider credential;
- confidence score, hallucination score, model temperature, token limit; or
- database constraint, migration, trigger, queue lease, idempotency key.

Translate implementation into the customer consequence: what is available, what is protected, what did not complete, and what can safely happen next. Never reveal secrets or hidden system behavior while translating.

## AI and automation language

Avoid decorative AI and buzzwords such as **revolutionary**, **magical**, **fully autonomous**, **human-like**, **always learning**, **knows everything**, **instant intelligence**, or **zero-error AI**.

Do not personify AI with emotions, consciousness, personal memory, or human authority. Use **AI-assisted** when generated language needs disclosure. Use a direct product action label when behavior is deterministic.

Never use “I did this” unless the system can truthfully attribute and verify the exact action. Prefer recorded outcomes:

- **Saved** when the authoritative save succeeded.
- **Request created** when only a request record exists.
- **Provider opened** when the customer was sent to an external provider.
- **Status unavailable** when no authoritative result is available.

## Do and don't examples

### Errors

**Do:** “We couldn't save your phone number. Your other changes are still here. Check the number and try again.”

**Don't:** “Something went wrong.”

**Do:** “The booking provider is unavailable. Your appointment has not changed.”

**Don't:** “Booking failed. Please retry.”

Error copy should identify the affected action, preserve status truth, explain consequence, and offer one safe next step.

### Uncertainty

**Do:** “I don't have an approved cancellation policy for this appointment. Contact the business before cancelling.”

**Don't:** “The cancellation fee is probably waived.”

**Do:** “This document lists July 21 as the due date. I can't determine whether a later legal deadline applies.”

**Don't:** “Your legal deadline is July 21.”

Uncertainty copy states what is supported, what is not, and the safest next step. It does not expose hidden confidence scores or internal reasoning.

### Actions and confirmations

**Do:** “Open booking site” when the action opens an external provider.

**Don't:** “Reschedule appointment” unless JOHAI performs and verifies the reschedule.

**Do:** “Request created. This does not confirm that a team member has been assigned.”

**Don't:** “Help is on the way.”

Action labels must match the exact operation. Confirmation copy must describe only the completed portion.

### Human handoff

**Do:** “Request a person. You can review the details before sending.”

**Don't:** “Talk to a human now” when live connection is not implemented.

**Do:** “Your request was saved. The business has not confirmed a response time.”

**Don't:** “An agent will reply shortly.”

Human language distinguishes intent, request creation, notification, assignment, connection, and response. Each is a separate verifiable state.

### AI disclosure

**Do:** “AI-assisted summary. Review the original document before making a decision.”

**Don't:** “Here's everything you need to know.”

**Do:** label a human message as from the business or named authorized sender when that identity is verified.

**Don't:** rewrite or display AI output as if it came from a person.

## Action labels

- Begin with a specific verb: **Save**, **Download**, **Acknowledge**, **Open**, **Review**, **Retry**, **Cancel**, **Request**.
- Include the object when context could be unclear: **Download document**, **Save language**, **Request a person**.
- Avoid vague labels: **Continue**, **Submit**, **Go**, **OK**, **Done**, or **Yes**, unless the surrounding question makes the consequence unmistakable.
- Use destructive verbs honestly: **Delete document**, **Cancel appointment**, **Revoke access**.
- Do not use urgency or reward language to pressure completion.

## Loading, empty, and status language

- Loading: name the real operation without invented progress — **Loading appointments…**
- Empty: state what is absent without blame — **No upcoming appointments.**
- Partial: name both sides — **Messages are available. Realtime delivery is not.**
- Pending: state the dependency — **Waiting for the provider's confirmation.**
- Failed: state the unchanged truth — **The payment did not complete. No charge is confirmed.**
- Denied: avoid record enumeration — **You don't have access to this item.**
- Expired: give one recovery action — **Your session expired. Sign in again to continue.**

Never fill silence or waiting with fabricated progress, fake precision, celebratory animation, or a countdown that does not represent a real tracked operation.

## Accessibility and localization

- Write headings that describe the section and links that make sense out of context.
- Put essential information in text, not only color, icon, tooltip, or placeholder.
- Keep error messages adjacent to and programmatically associated with the relevant field.
- Use explicit dates, locale, time, and timezone where ambiguity matters.
- Avoid idioms, jokes, cultural assumptions, and wordplay that do not translate reliably.
- Allow text expansion without truncating the action or consequence.
- Do not use all caps, repeated punctuation, or emoji as the only status signal.
- Announce important asynchronous status changes with concise accessible text.

Language review is a mandatory part of the [Decision Framework](DECISION_FRAMEWORK.md). Copy that violates status truth, permission boundaries, accessibility, or the AI/human distinction blocks release.
