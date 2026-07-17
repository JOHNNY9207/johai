# How JOHAI Works

## Authority and status

- **Document type:** Permanent culture and operating standard
- **Status:** Adopted cultural direction
- **Authority:** Subordinate to applicable law, employment obligations, security, privacy, accessibility, explicit human approval, mandatory database safety, and the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md)
- **Scope:** Teams, leaders, developers, designers, product managers, researchers, operators, sales, support, partners acting for JOHAI, and AI-assisted work used by them
- **Runtime effect:** None
- **Capability effect:** None; cultural adoption does not implement product behavior or certify organizational performance

Culture is the repeated way decisions are made when requirements are incomplete, incentives conflict, or no one is watching. It is not a list of benefits, personality traits, or slogans.

The [Company Values](COMPANY_VALUES.md) define how JOHAI people are expected to behave. The [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md) defines what the product must protect. This document translates both into daily work.

## The operating premise

JOHAI should be built with the same qualities it promises:

- prepared rather than reactive;
- clear rather than theatrical;
- evidence-led rather than narrative-led;
- calm under failure;
- respectful of attention and expertise;
- explicit about authority and limits;
- accessible and secure by design;
- willing to stop when a boundary is unresolved; and
- focused on durable customer and business value.

The purpose of the culture is not to maximize output. It is to make trustworthy progress repeatable.

## How teams work

### Start with the real problem

Before discussing a feature or technology, the team writes:

- whose problem this is;
- the owning JOHAI platform layer;
- the current behavior and evidence;
- the intended customer and business outcome;
- the one purpose of the workflow or surface;
- the baseline effort, failure, and recovery burden;
- the authority, data, security, privacy, accessibility, and human boundaries; and
- why doing nothing or using a deterministic solution is insufficient.

A request is input, not a complete problem definition. “Add AI,” “match a competitor,” “make it engaging,” and “automate this” are not acceptable problem statements.

### Work in the smallest coherent increment

Teams prefer one bounded, testable outcome over several partially resolved ideas. Scope includes the necessary loading, empty, denied, expired, failure, retry, responsive, accessible, localization, monitoring, and rollback behavior.

Small does not mean fragmenting responsibility. A slice is coherent only when it can be understood, secured, operated, and represented truthfully.

### One blocker at a time when risk requires focus

For certification, incident recovery, and high-risk security or reliability work, teams remove one clearly prioritized blocker at a time. They rerun the appropriate validation, update the evidence, and recalculate status before moving on. This prevents several incomplete fixes from hiding the real state.

### Make ownership explicit

Every material initiative has:

- one accountable owner;
- named reviewers appropriate to product, design, engineering, security, privacy, accessibility, operations, and domain risk;
- a current decision and status;
- evidence required for the next status;
- an operational owner after release; and
- a rollback or retirement owner.

Ownership creates responsibility, not unilateral authority. Protective approvals and the Constitution remain independent constraints.

### Document decisions where future teams can find them

Teams record the problem, alternatives, decision, evidence, risks, status, and next authorized step in the repository. Chat history, memory, and an individual's private notes are not durable operating records.

Documentation is part of the work. It must distinguish what exists from what is intended and preserve superseded decisions rather than silently rewriting history.

### Disagree with evidence and respect

Constructive disagreement is expected. The strongest available evidence and the highest applicable authority decide—not title, confidence, speed of speech, or proximity to a founder.

A person may stop work for a credible concern involving law, security, privacy, accessibility, tenant isolation, human approval, database safety, misleading claims, or a Constitutional conflict. The concern must be examined without retaliation. Work resumes only after the issue is resolved or the accountable authority documents the safe decision.

## How developers think

Developers are custodians of authority and state, not only implementers of interfaces.

### Developer commitments

- Read the current repository and framework documentation before changing behavior.
- Identify the authoritative source of identity, tenant, role, permission, record state, time, and outcome.
- Treat browser state, routes, labels, configuration, feature flags, and model output as untrusted for authorization.
- Make material writes deterministic, validated, bounded, and safe under retry and concurrency.
- Design failure, idempotency, recovery, rollback, observability, and support before calling a workflow complete.
- Preserve user work where safe and never fall back to a broader identity, tenant, record, or data source.
- Minimize data and secrets in logs, prompts, test artifacts, documentation, and error messages.
- Keep optional AI and external providers from breaking the essential deterministic experience.
- Use shared typed contracts and module boundaries instead of scattered industry or customer exceptions.
- Make accessibility, localization, timezone, performance, and state truth technical requirements.

### Database discipline

No developer executes SQL automatically or treats an application deadline as permission to alter the database. Every database change follows live-schema inspection, a versioned migration, a matching read-only verifier, human approval, manual execution, recorded successful verification, and only then continued implementation.

Applied migrations are immutable history. A new correction receives a new reviewed migration. A schema proposal is not an applied change, and an applied change is not verified until the verification evidence is recorded.

### Developer anti-patterns

- Hiding a security or data problem in client-side UI logic.
- Assuming a successful response means an external or asynchronous outcome completed.
- Solving one tenant's need with hard-coded logic that weakens the shared architecture.
- Treating generated code as reviewed code.
- Adding abstraction, dependency, or AI because it is technically interesting rather than necessary.
- Calling lint, build, or unit success complete validation for a production behavior.

## How designers think

Designers are responsible for comprehension, agency, status truth, accessibility, and recovery—not only visual polish.

### Designer commitments

- Give each screen and state one clear purpose and at most one visually dominant primary action.
- Use current authorized context before requiring typing, searching, navigation, or explanation.
- Prefer inline, non-blocking assistance and avoid unnecessary popups, tours, prompts, and AI affordances.
- Make facts, suggestions, AI-assisted language, human responses, provider state, and completed actions distinguishable.
- Show material consequence, destination, cost, timing, disclosure, and reversibility before a consequential action.
- Design loading, empty, success, validation, denied, expired, degraded, failure, retry, and human-handoff states.
- Design first-class keyboard, focus, screen-reader, contrast, zoom, reflow, reduced-motion, touch, localization, and responsive behavior.
- Let AI disappear when a deterministic interface is clearer or the task is complete.
- Keep the represented business visually and relationally primary.
- Test whether the experience saves time across the complete task, including correction and recovery.

### Designer anti-patterns

- Dashboard density as evidence of capability.
- Decorative AI, fake progress, animation theatre, and celebratory noise.
- A clean happy path that hides error, consent, uncertainty, or human-service limitations.
- Treating accessibility review as a final compliance pass.
- Using brand consistency to override industry safety, cultural context, or truthful status.

## How product managers think

Product managers are accountable for problem clarity, scope truth, value evidence, and the sequence of approval—not for maximizing roadmap volume.

### Product-manager commitments

- Classify current capability before describing future work.
- Define the customer and business baseline, expected outcome, guardrails, remaining risks, and evidence needed to change status.
- Complete the [Constitutional Decision Framework](../constitution/DECISION_FRAMEWORK.md) before implementation.
- Explain why AI is needed and compare the deterministic, human, integration, and no-change alternatives.
- Keep one primary problem and one owning platform layer per initiative.
- Plan security, privacy, accessibility, localization, operations, support, rollout, monitoring, rollback, and documentation with the product behavior.
- Protect the distinction between a roadmap, a design, an implementation, a deployment, a verified outcome, and commercial traction.
- Remove or stop work that lacks demonstrated customer or business value.
- Prevent sales, investor, customer, and internal documentation from drifting apart.
- Never trade tenant isolation, informed consent, human authority, or status truth for schedule.

### Product-manager anti-patterns

- Counting features shipped instead of problems resolved.
- Using engagement or AI-message volume as a proxy for value.
- Moving unresolved security, accessibility, operations, or evidence into a later phase while describing the feature as complete.
- Treating a stakeholder's urgency as a substitute for a safe next step.
- Bundling multiple blockers so progress on one obscures failure on another.

## How researchers and domain reviewers work

Research involving people or customer data requires a defined purpose, informed participation where applicable, minimum necessary data, retention and deletion rules, accessible participation, and a safe way to decline. Production secrets and personal data do not enter ad hoc tools, prompts, recordings, or shared documents.

Domain reviewers identify where administrative assistance ends and professional judgment begins. Legal, medical, insurance, finance, housing, employment, education, safety, and other regulated or high-impact domains require qualified review and explicit limits. An industry template never creates professional authority.

Research findings are reported with method, sample limits, conflicts, uncertainty, and negative evidence. Individual anecdotes can reveal a problem; they do not establish prevalence or production readiness.

## How AI is evaluated

AI evaluation asks whether the complete governed interaction is useful and safe, not whether a model can produce an impressive response.

### Evaluation contract

Every AI capability defines:

- the actor, tenant, role, purpose, and allowed task;
- permitted sources and fields, provenance, freshness, revocation, and forbidden sources;
- allowed output type and actions that remain unavailable;
- when AI should appear, ask, abstain, remain silent, or escalate;
- deterministic validation and execution boundaries;
- customer-visible authorship and uncertainty language;
- failure, timeout, rate-limit, provider, and fallback behavior;
- human takeover trigger, data transfer, verified destination, and status truth;
- privacy-safe evidence and retention; and
- thresholds and release blockers proportionate to risk.

### What is measured

- grounded and source-supported answer rate;
- unsupported-claim, fabricated-action, and stale-context rate;
- cross-tenant, forbidden-source, secret, and personal-data exposure attempts and outcomes;
- correct clarification, abstention, silence, and escalation;
- distinction between fact, inference, recommendation, draft, and action;
- customer effort, task completion, correction, dismissal, and recovery;
- accessibility, language, locale, timezone, latency, and degraded-provider behavior;
- consistency across representative industries and adversarial phrasing; and
- whether a deterministic or human alternative performs the task better.

Cross-tenant disclosure, accepted unauthorized action, fabricated completion, hidden material uncertainty, professional impersonation, and unsafe regulated guidance are release blockers. They are not averaged into a passing quality score.

### Evaluation practice

- Use fictional or properly governed test data; never paste credentials, recovery links, secrets, raw customer records, or private business sources into evaluation tools.
- Include ordinary, edge, ambiguous, adversarial, stale, revoked, denied, tenant-switch, multilingual, accessibility, and provider-failure cases.
- Preserve failed examples and correction history; do not curate only strong outputs.
- Review system behavior around the model, including retrieval, permissions, tools, validation, status, and handoff.
- Re-evaluate when models, prompts, sources, permissions, tools, policies, business configuration, or customer-facing behavior materially change.
- Treat internal confidence scores as diagnostics, not customer truth.
- Require human review appropriate to domain and consequence.

An AI capability remains Planned or Partial until evidence supports its claimed status. Evaluation results do not grant production access or action authority.

## How leaders lead

Leaders make trade-offs visible and protect the conditions for truthful work.

They must:

- reward surfaced risk and corrected assumptions, not only delivery speed;
- state who decides and which approvals remain independent;
- refuse goals that require manipulation, hidden uncertainty, unsafe data use, or status inflation;
- provide time for security, accessibility, operations, documentation, and learning;
- distinguish urgency from importance and incident command from permanent culture;
- preserve psychological safety for good-faith disagreement and stop-work concerns;
- use the same evidence standard in internal, investor, sales, and customer communication; and
- accept accountability when incentives or scope made a failure more likely.

Leaders do not ask teams to “own” an outcome while withholding authority, context, time, or support. They do not use Company Values to suppress dissent or reward personal similarity.

## How sales and partnerships work

Sales and partnership teams explain current capability, Partial behavior, Planned direction, dependencies, and risks using the same source of truth as product and engineering.

They may describe the North Star and vision as strategy. They may not present strategy as deployment, customer outcome, production readiness, compliance, or guaranteed return. A prospect, deadline, contract value, or partner request does not create permission to bypass the Constitution or database workflow.

JOHAI does not win by trapping a customer in an overstatement. It wins by earning a durable operating relationship.

## How incidents are handled

During an incident:

1. protect people, data, tenant boundaries, and authoritative state;
2. stop unsafe continuation and contain the smallest possible scope;
3. establish one accountable incident owner and a clear communication path;
4. distinguish what is known, suspected, attempted, completed, and still unknown;
5. preserve privacy-safe evidence;
6. avoid duplicate, destructive, or speculative remediation;
7. communicate customer-visible impact and next steps truthfully;
8. obtain the required human approvals for recovery or database action; and
9. record causes, contributing incentives, corrections, remaining risks, and follow-up ownership.

Post-incident review is for learning and system improvement, not blame avoidance or narrative control. Sensitive personnel conduct follows the appropriate confidential process rather than public technical documentation.

## Decision cadence

At each stage, teams ask:

- **Before design:** Is the problem real, scoped, owned, and consistent with the North Star?
- **Before implementation:** Did the proposal pass the Constitution and required specialist reviews?
- **Before release:** Do code, security, accessibility, operations, tests, documentation, and evidence support the claimed scope?
- **After release:** Did customer and business outcomes improve without violating guardrails?
- **During maintenance:** Is the capability still useful, current, supported, and worthy of its cost and risk?

A no, unknown, or unsupported answer narrows, revises, pauses, or stops the work.

## What this culture rejects

- Hero culture and dependence on undocumented individuals.
- Activity, meetings, messages, or code volume as performance by themselves.
- “Move fast” as permission to move risk onto customers or future teams.
- Fear of changing a published decision when evidence changes.
- AI novelty as a substitute for customer understanding.
- Secrecy about ordinary product limitations or failure.
- Performative process with no effect on decisions.
- Values language used to override law, policy, expertise, or dissent.

## Current capability and aspiration boundary

This document defines how JOHAI intends to work. It does not certify that every current process, team, product, or decision already meets the standard. Culture must be evaluated through decisions, evidence, outcomes, incidents, corrections, and the experience of people affected by the work.

Adopting this culture does not modify application code, enable AI, change authentication, alter a database, execute SQL, create a migration, certify compliance, or establish production readiness.
