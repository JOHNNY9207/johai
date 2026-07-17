# JOHAI Constitutional Decision Framework

## Constitutional status

- **Status:** Mandatory fail-closed design review
- **Scope:** Every new feature, material redesign, customer-facing AI behavior, workflow, component system, notification, integration, and significant copy change
- **Effect:** A proposal that fails a mandatory gate does not proceed to implementation

This framework enforces [The JOHAI Constitution](JOHAI_CONSTITUTION.md), its [operational Design Principles](DESIGN_PRINCIPLES.md), [UX Principles](UX_PRINCIPLES.md), [AI Principles](AI_PRINCIPLES.md), [Language Guidelines](LANGUAGE_GUIDELINES.md), and [JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md).

It is a design and governance process. It does not authorize runtime behavior, database access, security exceptions, implementation, release, or production use.

Every review must also record alignment with the [JOHAI North Star](../foundation/JOHAI_NORTH_STAR.md), [JOHAI Manifesto](../foundation/JOHAI_MANIFESTO.md), [AI Employee Principles](../foundation/AI_EMPLOYEE_PRINCIPLES.md), [Product Promise](../foundation/PRODUCT_PROMISE.md), and [Company Values](../foundation/COMPANY_VALUES.md). These strategic references guide purpose, conduct, and expression beneath the Constitution; they cannot excuse a failed Constitutional or protective gate.

## Five required questions

Every proposal must answer, with evidence:

1. **Does it reduce effort?** Which typing, navigation, searching, repetition, delay, or recovery burden is removed, and against what baseline?
2. **Does it create trust?** How are status, authorship, uncertainty, source, consequence, consent, and completion made truthful?
3. **Does it remove friction?** Which friction is unnecessary, and which safety, accessibility, permission, or confirmation friction must remain?
4. **Does it respect context?** Which authorized context is used, why is it relevant, how is freshness proven, and what happens when it is missing or revoked?
5. **Does it fit the Ten Laws?** Provide a pass and evidence for every Law; “not applicable” requires a written explanation and cannot bypass a mandatory principle.

An unanswered question is a failed gate.

## Gate 0 — Proposal classification

Before design review, record:

- proposal title, owner, reviewers, and date;
- one-sentence customer or operator problem;
- North Star outcome, Product Promise, Company Values, and AI Employee principles affected;
- one-sentence screen or workflow purpose;
- affected users and environments;
- owning platform layer: Public Website, Business Workspace, Customer Portal, AI Layer, JOHAI Super Admin, or Developer Platform;
- capability status: **Implemented**, **Partial**, **Planned**, or **Deliberately unavailable**;
- current-state evidence and the exact behavior being proposed;
- affected data, integrations, providers, and customer-visible sources;
- whether AI is necessary and, if so, the allowlisted capability;
- security, privacy, tenant, permission, retention, and audit impact;
- responsive, accessibility, localization, and state requirements;
- success metric, baseline plan, guardrails, and rollback signal; and
- documentation, operational, support, and implementation dependencies.

### Status classification rules

- **Implemented:** Code, configuration, security, operations, accessibility, tests, and recorded evidence support the claimed behavior.
- **Partial:** Some behavior exists; the available and unavailable portions, dependencies, and risks are named explicitly.
- **Planned:** Architecture, design, or intent exists without verified runtime behavior.
- **Deliberately unavailable:** The capability is withheld because it is out of scope, unsafe, unauthorized, unsupported, or awaiting separate approval.

A proposal cannot use future work to improve the classification of current behavior. Unknown evidence does not become Implemented by assumption.

If the owning platform layer, current status, user problem, or evidence is missing, review stops.

## Gate 1 — Constitution and design review

### Constitutional Ten Laws

Record pass/fail evidence for every authoritative Law in [The JOHAI Constitution](JOHAI_CONSTITUTION.md):

| Constitutional Law | Required evidence | Automatic failure |
| --- | --- | --- |
| 1. The AI never asks for information it can already infer | Authorized-context inventory, freshness, provenance, and clarification rule | Re-asking for known safe context or guessing across material ambiguity. |
| 2. The AI never interrupts without adding value | Trigger, measurable value, suppression, frequency, and dismissal behavior | Unnecessary interruption, generic prompt, repeated suggestion, or critical-workflow disruption. |
| 3. The AI always reduces customer effort | Baseline and specific typing, searching, navigation, repetition, or interpretation removed | AI adds steps or shifts avoidable work to the customer. |
| 4. The AI explains only what is necessary | Concise answer, progressive detail, and material-limit disclosure | Internal implementation detail, excessive explanation, or omitted material consequence. |
| 5. The AI disappears when it has nothing useful to contribute | Silence rules and deterministic alternative | Decorative, redundant, unauthorized, stale, or low-value AI. |
| 6. The customer should feel understood, never managed | Purpose-bound personalization, choice, dismissal, and correction | Surveillance, pressure, sensitive inference, or steering unrelated to the customer's task. |
| 7. Every interaction should save time | Complete-task timing including recovery, correction, and handoff | Local speed creates downstream correction, risk, waiting, or support burden. |
| 8. AI creates confidence, never uncertainty | Source, freshness, uncertainty, and safe-next-step contract | Fake certainty, unsupported promise, hidden uncertainty, or vague disclaimer. |
| 9. Human takeover must feel natural | Trigger, consent, minimum context, verified destination, status, and failure behavior | Looping after a human request, false assignment claim, or excessive private disclosure. |
| 10. The business is always the hero, not JOHAI | Business identity, attribution, verified channels, and subordinate JOHAI presence | AI self-promotion, employee impersonation, or unauthorized promise on the business's behalf. |

All Ten Laws are cumulative. A failure under one Law cannot be offset by another Law or by a high score.

### Operational design principles

| Design principle | Required evidence | Automatic failure |
| --- | --- | --- |
| One screen, one purpose | One-sentence purpose and content map | Unrelated primary purposes share a surface without a justified sequence. |
| One clear primary action | Action hierarchy for every state | Multiple equally dominant actions or a manufactured call to action. |
| Reduce cognitive load | Before/after task path and removed burden | More fields, choices, widgets, terminology, or memory burden without measurable need. |
| Context before conversation | Context inventory, provenance, freshness, and clarification rule | The feature asks for authorized current information already available or guesses when context is ambiguous. |
| Anticipate without interrupting | Trigger, timing, dismissal, deduplication, and overlay justification | An unnecessary popup, forced tour, repeated prompt, or attention trap. |
| AI must earn its place | Deterministic alternative analysis and value case | Decorative AI, generic chat, unsupported generation, or AI used where deterministic behavior is clearer. |
| Hierarchy over dashboard clutter | Reading order and information-to-decision trace | Duplicated metrics, ornamental cards, nested panels, or data with no decision purpose. |
| Design every state and viewport | State matrix and responsive/accessibility evidence plan | Missing loading, empty, error, denied, recovery, mobile, keyboard, or screen-reader behavior. |
| Tell the truth about status and action | Copy/action contract and capability classification | A label overstates completion, notification, assignment, delivery, availability, authorship, or implementation status. |
| Preserve control, permission, and a human path | Consent, authorization, cancellation, recovery, and handoff contract | Hidden consequence, permission ambiguity, no safe exit, or false human-service promise. |

Every operational design principle must also pass. There is no compensating score: strengths elsewhere do not offset a constitutional or design failure.

## Gate 2 — Security and context

The proposal must document:

1. authenticated actor and session boundary;
2. exact tenant, business, customer/profile, record, and environment scope;
3. authoritative source and allowed fields;
4. permission and deterministic server enforcement;
5. freshness, revocation, retention, deletion, and tenant-switch behavior;
6. forbidden sources and cross-layer exclusions;
7. consent and material disclosure;
8. provider credentials, external destinations, and action authority;
9. failure behavior that remains fail-closed; and
10. privacy-safe audit evidence.

AI, client state, route visibility, feature flags, configuration, local storage, and customer-supplied identifiers never count as authorization.

Review stops if a proposal can expose another tenant, rely on hidden customer-inaccessible data, broaden permission through configuration or AI, retain context after revocation, leak secrets, or fall back to a broader identity or data source.

## Gate 3 — Accessibility, responsiveness, and recovery

The proposal must include evidence plans for:

- mobile, tablet, desktop, zoom, text reflow, and localization expansion;
- semantic structure, accessible names, descriptions, and status announcements;
- keyboard, focus, screen-reader, contrast, motion, and touch behavior;
- loading, empty, success, validation, unavailable, denied, expired, provider-failure, and retry states;
- preservation of customer work and duplicate-action prevention; and
- a usable deterministic experience when optional AI is unavailable.

An inaccessible critical path, missing recovery state, or AI-dependent essential function is a failed gate.

## Gate 4 — Language and status truth

Review all headings, labels, actions, instructions, disclosures, errors, empty states, confirmations, AI output, handoff language, sales claims, and documentation against [Language Guidelines](LANGUAGE_GUIDELINES.md).

Review stops when language:

- uses internal jargon or AI buzzwords instead of the customer consequence;
- creates pressure, urgency, manipulation, or fake confidence;
- hides uncertainty, authorship, provider boundaries, or material consequences;
- calls a suggestion, request, acknowledgement, link, preference, or draft a completed operation;
- promises human notification, assignment, response, or SLA without verification; or
- describes a Planned or Partial capability as Implemented.

## Gate 5 — Measurement and operational proof

Every proposal defines at least:

- one customer-effort measure, such as typing, clicks, navigation, search time, repeated questions, or task time;
- one outcome measure, such as completion, recovery, comprehension, satisfaction, or successful supported suggestion;
- one trust or safety guardrail, such as unsupported claims, false completion, mistaken handoff, unauthorized action, or cross-tenant exposure;
- baseline collection and comparison method;
- accessibility and localization acceptance evidence;
- operational owner, monitoring signal, rollback trigger, and support path; and
- the evidence required before status may change from Planned to Partial or Implemented.

Metrics must not reward interruption, message volume, conversion, automation volume, or engagement at the expense of truth, safety, consent, accessibility, or customer control.

## Mandatory stop conditions

A proposal is automatically **Stopped** if any of the following is true:

- its purpose or owning platform layer is unclear;
- it creates more than one primary action without a justified sequence;
- it adds avoidable typing, navigation, searching, explanation, or cognitive load;
- it requires an unnecessary popup, dashboard clutter, or decorative AI;
- it asks for information already available in authorized current context;
- identity, tenant, permission, source, freshness, consent, or action authority is uncertain;
- it uses CRM internals, Business Brain internals, private notes, raw Knowledge Center content, billing internals, prompts, orchestration, secrets, or another customer as customer-facing context;
- it cannot distinguish AI, human, business-provided, recorded, suggested, and completed content;
- it hallucinates, pretends, manipulates, pressures, or fakes confidence by design;
- it lacks a safe silence, fallback, recovery, cancellation, or human-handoff path;
- it omits responsive, accessibility, loading, empty, error, denied, or expired-state behavior;
- it overstates current capability or lacks an Implemented/Partial/Planned/Deliberately unavailable classification;
- it has no measurable customer outcome and safety guardrail; or
- it requires an exception to a constitutional rule.

Stopped proposals return to revision. They do not proceed through implementation on the promise that the issue will be fixed later.

## Decision outcomes

- **Proceed to scoped design:** Every gate passes with sufficient evidence. This does not authorize implementation.
- **Revise:** The problem is valid, but evidence or design is incomplete. List every required correction.
- **Stop:** A mandatory condition fails or the proposal conflicts with the Constitution.
- **Superseded:** A later reviewed proposal replaces the record; preserve the earlier decision history.

Implementation, security, database, operational, release, and production approvals remain separate. Passing this framework never bypasses those workflows.

## Required review record

Use this record for every proposal:

```markdown
# Proposal title

## Record
- Date:
- Owner:
- Reviewers:
- Decision: Proceed to scoped design | Revise | Stop | Superseded
- Capability status: Implemented | Partial | Planned | Deliberately unavailable
- Platform layer:

## Problem and purpose
- User problem:
- One-screen or workflow purpose:
- Current-state evidence:

## Five required answers
1. Reduce effort:
2. Create trust:
3. Remove friction:
4. Respect context:
5. Fit the Ten Laws:

## Constitutional Ten Laws evidence
- Law 1 — Context before questions:
- Law 2 — No interruption without value:
- Law 3 — Reduce customer effort:
- Law 4 — Explain only what is necessary:
- Law 5 — Disappear without useful contribution:
- Law 6 — Understood, never managed:
- Law 7 — Save time across the complete task:
- Law 8 — Create justified confidence:
- Law 9 — Natural human takeover:
- Law 10 — Business remains the hero:

## Operational design-principle evidence
- One screen, one purpose:
- One clear primary action:
- Cognitive load:
- Context before conversation:
- Anticipation without interruption:
- AI earns its place:
- Hierarchy without dashboard clutter:
- Every state and viewport:
- Status and action truth:
- Control, permission, and human path:

## Context, security, and permission
- Actor and tenant:
- Sources and allowed fields:
- Permission enforcement:
- Freshness, revocation, retention, and tenant switch:
- Forbidden sources:
- Consent and action authority:
- Failure and audit behavior:

## UX, accessibility, and language
- Primary action:
- State matrix:
- Responsive behavior:
- Accessibility evidence:
- Localization and timezone:
- Recovery and human handoff:
- Copy review:

## Measurement
- Effort baseline and metric:
- Outcome metric:
- Safety/trust guardrail:
- Monitoring and rollback trigger:

## Risks and corrections
- Risks:
- Corrections required:
- Remaining limitations:

## Next authorized step
- Step:
- Required approvals and evidence:
```

Do not invent reviewers, approval, evidence, dates, metrics, or results. Use **Pending** until a fact is explicitly recorded.

## Constitutional amendments and exceptions

There are no informal, temporary, executive, sales, pilot, deadline, experiment, or “one-off” exceptions to [The JOHAI Constitution](JOHAI_CONSTITUTION.md) or its companion principles.

A rule may change only through an explicit constitutional amendment that:

1. names the exact Law or clause being changed;
2. explains the customer problem and why compliant alternatives failed;
3. analyzes security, tenant, accessibility, language, AI, operational, and trust impact;
4. updates the Constitution and every affected companion document and linked governing philosophy;
5. records human approval without inventing the approver or date;
6. defines migration, compatibility, measurement, rollback, and communication requirements; and
7. preserves the prior wording and decision history.

Until the amendment is approved and documented, the existing Constitution remains authoritative and the conflicting proposal stays **Stopped**.
