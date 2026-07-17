# JOHAI Design Principles

## Constitutional status

- **Status:** Adopted architecture and product-design constitution
- **Scope:** Every JOHAI platform layer, surface, workflow, component, message, and future feature
- **Runtime effect:** None; this document changes governance, not application behavior
- **Capability effect:** None; constitutional adoption does not make a Planned feature Implemented

This document is the permanent design-principles companion to [The JOHAI Constitution](JOHAI_CONSTITUTION.md). Every proposal must follow the Constitution first and must also follow:

- [UX Principles](UX_PRINCIPLES.md)
- [AI Principles](AI_PRINCIPLES.md)
- [Language Guidelines](LANGUAGE_GUIDELINES.md)
- [Decision Framework](DECISION_FRAMEWORK.md)
- [JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md)
- [Customer Experience Philosophy](../philosophy/CUSTOMER_EXPERIENCE_PHILOSOPHY.md)
- [AI Behavior Guidelines](../philosophy/AI_BEHAVIOR_GUIDELINES.md)
- [Smart Interaction Patterns](../philosophy/SMART_INTERACTION_PATTERNS.md)

The Constitution supplies JOHAI's authoritative Ten Laws. This document translates those Laws into operational design constraints. Contextual Intelligence governs how authorized context is used. None of these documents grants product capability, tenant access, data access, or action authority.

## Purpose

JOHAI should make complex work feel prepared, calm, and obvious. It should reduce effort without hiding material decisions, uncertainty, authorship, cost, risk, or data use. A customer should understand what the screen is for, what can be done now, what happened, and what to do if the workflow cannot continue.

Novelty, visual density, engagement, automation volume, and visible AI are never goals by themselves.

## Operational design principles

### Principle 1 — One screen, one purpose

Every screen, panel, dialog, and step must have one primary user purpose that can be stated in one sentence. Secondary information may support that purpose but must not create a competing workspace.

If a surface needs several unrelated primary purposes, divide it into clear steps or destinations. A dashboard may summarize several signals, but each section must still answer one distinct question and must not become an accumulation of widgets.

### Principle 2 — One clear primary action

Every actionable state has at most one visually dominant next action. Secondary actions are quieter, and destructive or irreversible actions are separated and explained.

Two buttons are not equally primary because both are possible. The primary action is the safest action most likely to advance the stated purpose. If no action is useful, do not manufacture one.

### Principle 3 — Reduce cognitive load

Show only the information, choice, and terminology needed for the current decision. Use progressive disclosure, meaningful grouping, stable hierarchy, familiar controls, and useful defaults.

Do not make customers decode internal structure, compare unnecessary options, remember values already present, scan repeated status cards, or learn JOHAI implementation language.

### Principle 4 — Context before conversation

Use current, authorized, relevant, sufficiently fresh context before asking a question. Prefer a known value, prefilled field, direct answer, or bounded suggestion over asking the customer to start a new conversation.

Context never replaces permission, consent, source validation, or clarification when ambiguity matters. Follow the permanent rule in [JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md):

> The AI never asks for information it can already infer from context.

### Principle 5 — Anticipate without interrupting

Surface the next useful step at the moment it becomes relevant. Do not use unnecessary popups, automatic dialogs, repeated prompts, forced tours, promotional overlays, or attention traps.

A popup is justified only when an immediate decision, consent requirement, security event, destructive consequence, or workflow-blocking error cannot be handled safely in the current surface. It must be accessible, dismissible when dismissal is safe, and must return focus correctly.

### Principle 6 — AI must earn its place

AI appears only when it creates material value through supported explanation, summarization, translation, drafting, clarification, or a bounded recommendation. There is no decorative AI, AI mascot, generic chat box, animated “thinking” performance, or AI label added merely to make a screen feel advanced.

Deterministic filtering, formatting, validation, routing, status display, and direct actions should remain deterministic. When AI generates customer-facing language, its authorship and uncertainty are disclosed according to [AI Principles](AI_PRINCIPLES.md).

### Principle 7 — Hierarchy over dashboard clutter

Visual hierarchy must reveal what matters now. Use a small number of meaningful regions, consistent spacing, and a clear reading order. Avoid duplicated metrics, ornamental cards, nested containers, competing calls to action, and dense “control center” layouts without a user decision behind them.

Data belongs on a surface only when it changes understanding or supports an allowed action. More information is not automatically more useful.

### Principle 8 — Design every state and viewport

A feature is not designed until it includes:

- loading and delayed states;
- empty and first-use states;
- success and saved states;
- validation and field-error states;
- unavailable, denied, expired-session, and permission-loss states;
- recoverable and non-recoverable failure states;
- narrow mobile, tablet, desktop, zoom, and text-reflow behavior;
- keyboard, focus, screen-reader, contrast, motion, and touch behavior; and
- explicit locale, language, date, time, and timezone behavior where relevant.

The experience must preserve meaning and safe recovery without relying on color, hover, pointer precision, animation, or a wide viewport.

### Principle 9 — Tell the truth about status and action

Labels, controls, progress, confirmations, and documentation must describe what the system actually does. A suggestion is not an action. A request is not notification or assignment. Opening a provider link is not completing the provider action. An acknowledgement is not a signature. A stored preference is not delivered communication.

Capabilities must be classified as **Implemented**, **Partial**, **Planned**, or **Deliberately unavailable** from evidence. Unknown, unavailable, pending, estimated, and failed states remain visible rather than being converted into optimistic language.

### Principle 10 — Preserve control, permission, and a human path

The customer retains control over consequential actions, disclosures, and changes. Identity, tenant, record, source visibility, and action permission are resolved before personalization or intelligence. Material actions require informed consent and deterministic authorization.

Every workflow defines a safe cancellation or recovery path and an honest route to a person when judgment, safety, privacy, accessibility, policy, or customer preference requires one. A human path must not promise notification, assignment, response time, or completion until those operations are implemented and verified.

## Priority order

When principles compete, use this order:

1. Safety, security, tenant isolation, permission, and truth
2. Accessibility, informed consent, and recoverability
3. The user's stated purpose and successful completion
4. Reduction of effort and cognitive load
5. Consistency and maintainability
6. Aesthetic refinement
7. Novelty, engagement, or visible automation

A lower priority never overrides a higher one. “Delight,” speed, conversion, or visual polish cannot justify misleading status, inaccessible behavior, hidden consequences, cross-tenant risk, manipulative pressure, or unsupported AI output.

## Constitutional application

The Constitution's Ten Laws and these operational principles apply to new work and to material revisions of existing work. Existing behavior is not automatically compliant merely because it predates the Constitution.

Every proposal must pass the [Decision Framework](DECISION_FRAMEWORK.md). A conflict is resolved by changing the proposal, not by silently ignoring a Law or principle. The amendment process in [The JOHAI Constitution](JOHAI_CONSTITUTION.md) is the only exception mechanism.
