# JOHAI UX Principles

## Constitutional status

- **Status:** Adopted product-design rules
- **Scope:** Public Website, Business Workspace, Customer Portal, AI Layer experiences, JOHAI Super Admin, and Developer Platform
- **Runtime effect:** None; these rules define future and revised experience decisions

This document applies [The JOHAI Constitution](JOHAI_CONSTITUTION.md) and its [operational Design Principles](DESIGN_PRINCIPLES.md) to user experience. Context-sensitive behavior must also follow [JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md) and the [Customer Experience Philosophy](../philosophy/CUSTOMER_EXPERIENCE_PHILOSOPHY.md).

## Experience direction

JOHAI should create:

- **less typing, more understanding;**
- **less navigation, more anticipation;**
- **less searching, more relevant context;**
- **less explaining, more responsible knowing;** and
- **less recovery anxiety, more visible control.**

“Knowing” means resolving authorized, current, purpose-bound context. It never means guessing, using hidden information, inferring sensitive traits, or crossing a customer, profile, business, environment, or platform-layer boundary.

## Purpose and action hierarchy

Each surface must define:

1. the one user purpose;
2. the information required for that purpose;
3. the one primary action, if any;
4. the secondary and escape actions;
5. the completion state; and
6. the safe failure or recovery path.

The primary action must be visually and semantically clear. Do not place several equally prominent buttons beside each other. Do not use a destructive action as the default. Do not add a call to action simply to fill empty space.

## Cognitive load

- Prefer recognition over recall: carry forward authorized values, show selected context, and keep source records reachable.
- Ask one coherent question at a time when clarification is genuinely required.
- Use progressive disclosure for advanced, rare, technical, or destructive choices.
- Group information by the customer's decision, not by database table or internal team.
- Keep terminology stable across navigation, headings, controls, confirmations, and support.
- Remove repeated summaries, duplicate metrics, decorative labels, and status cards that do not change a decision.
- Preserve customer work across validation errors and recoverable failures.

## Context and anticipation

Before asking the customer to type, navigate, search, or explain, determine whether the answer is already available from authorized context.

Good anticipation:

- opens the relevant record from the current task;
- prefills an editable value and lets the customer review it;
- surfaces preparation before a visible appointment;
- links a current non-revoked document to the workflow that needs it;
- offers a relevant next action after a verified state change; or
- remembers a customer-approved preference within its retention and tenant boundary.

Bad anticipation:

- infers identity, health, protected traits, intent, urgency, or consent from weak signals;
- reuses context after logout, revocation, suspension, or tenant/profile switching;
- surprises the customer with an action, disclosure, purchase, booking, or message;
- relies on stale provider state or an unverified external destination; or
- repeats a suggestion after dismissal without a meaningful state change.

## Interruption and overlays

The default interaction is inline and non-blocking. Use no unnecessary popups.

An interrupting dialog is permitted only for:

- informed consent that cannot be obtained safely inline;
- confirmation of a destructive, irreversible, externally committed, or financially material action;
- an immediate security or privacy event;
- a session or permission change that blocks continued work; or
- a critical error whose consequence would otherwise be missed.

Every permitted dialog has a precise title, one primary action, a safe escape when possible, correct initial and returned focus, keyboard operation, screen-reader semantics, and no surprise continuation.

## Customer control and consent

Consent must be specific, current, informed, and reversible when the operation permits reversal. It is never inferred from silence, browsing, an unrelated agreement, a preselected choice, or a stored preference.

Before a material action, show:

- what will happen;
- which record, tenant, business, provider, or recipient is involved;
- what information will be shared;
- any cost, date, time, timezone, deadline, cancellation effect, or other material consequence;
- whether the result can be undone; and
- whether JOHAI or an external provider performs the action.

## Recovery

Errors should preserve context and provide the smallest safe next step.

- Keep valid input when one field fails.
- Prevent duplicate submissions and explain whether a prior attempt completed.
- Separate retryable failures from actions that require a person or later return.
- Never fall back to another tenant, profile, record, source, or broader permission.
- State when status is unknown instead of displaying fabricated progress.
- Give the customer a way to cancel, return, copy a safe draft, retry, or contact an approved human channel when those options genuinely exist.

## Human handoff

A human handoff begins only when a verified operation supports it. Until then, use truthful language such as **Request a person** or **Contact the business**.

The customer reviews the information included in a handoff. Send only the minimum customer-visible context required for the approved channel. AI suggestions stop when verified human takeover begins, and private staff work remains private.

A request record or human-assistance flag does not prove that anyone was notified, assigned, or committed to a response time.

## Responsive and accessible behavior

Every feature must work at narrow mobile, tablet, desktop, zoomed, and reflowed text sizes without changing meaning or hiding an essential action.

Required evidence includes:

- semantic headings, regions, lists, tables, labels, and controls;
- logical reading, tab, and focus order;
- visible focus and keyboard-only operation;
- screen-reader names, descriptions, errors, and status announcements;
- sufficient contrast without color-only meaning;
- touch targets and spacing that tolerate limited precision;
- motion that respects reduced-motion preferences;
- content that survives text enlargement and localization;
- explicit locale and timezone for dates and times; and
- equivalent recovery without drag, hover, animation, or pointer-only gestures.

## Required states

Every surface documents and designs:

| State | Required behavior |
| --- | --- |
| Loading | Identify the region loading, preserve layout, and avoid fabricated progress. |
| Empty | Explain what is absent, why that is normal or actionable, and offer only a real next step. |
| Success | Confirm the exact completed operation without overstating downstream effects. |
| Validation error | Identify the field and correction while preserving unrelated work. |
| Permission denied | Deny safely without revealing whether another tenant's record exists. |
| Session expired | Preserve safe local work where appropriate and provide a verified sign-in path. |
| Provider unavailable | Keep authoritative JOHAI state unchanged and do not imply provider completion. |
| Recoverable failure | Explain retry impact and prevent duplicate work. |
| Non-recoverable failure | State the limitation and offer a verified human or later-return path when available. |
| Partial capability | Name the available behavior and the unavailable portion explicitly. |

## UX acceptance test

A design is not ready for implementation unless all answers are yes:

1. Can the screen's purpose be stated in one sentence?
2. Is there at most one visually dominant primary action?
3. Has avoidable typing, navigation, searching, and explanation been removed?
4. Is every reused value authorized, current, relevant, and reviewable?
5. Can the customer decline, cancel, recover, and request a person truthfully?
6. Are all loading, empty, success, error, denied, and expired states defined?
7. Does the experience work accessibly and responsively without optional AI?
8. Do labels describe the exact action and current implementation status?

If any answer is no, the design returns to revision under the [Decision Framework](DECISION_FRAMEWORK.md).
