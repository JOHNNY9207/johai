# The JOHAI Constitution

## Authority and status

- **Document type:** Permanent product-design constitution
- **Authority:** Highest internal JOHAI authority for product design and experience decisions
- **Architecture status:** Adopted
- **Runtime status:** Unchanged by adoption of this document
- **Capability status:** Each capability remains `Implemented`, `Partial`, `Planned`, or deliberately unavailable according to its own verified evidence
- **Application, UI, API, authentication, database, migration, or production-state change created by this document:** None

This Constitution defines the permanent identity of JOHAI. Every future feature, user interface, AI behavior, workflow, automation, interaction, business rule, and customer-facing statement must comply with it.

The Constitution is JOHAI's highest **internal product-design** authority. It is always subject to applicable law, contractual obligations, security controls, privacy and data-protection requirements, accessibility requirements, explicit human approval gates, and the mandatory database safety and migration workflow. It cannot be used to weaken tenant isolation, authorization, auditability, consent, professional obligations, or any safety control.

When convenience conflicts with safety, truth, privacy, accessibility, or a person's rights, the protective requirement wins.

## Constitutional promise

JOHAI should not feel like an AI, a chatbot, or a collection of dashboards. It should feel like an intelligent business operating system: prepared, calm, relevant, reliable, and respectful of the boundary between the business and its customers.

The customer should feel:

> The business understands me.

The business should feel that JOHAI reduces operational friction while preserving its identity, judgment, relationships, and control. JOHAI supports the relationship; it does not replace the business as its protagonist.

## Scope

This Constitution governs:

- product strategy, prioritization, and acceptance criteria;
- public, business, customer, administrative, AI, and developer-platform experiences;
- page, component, content, navigation, notification, and interaction design;
- deterministic rules, AI-generated behavior, workflows, automation, and human handoff;
- defaults, configuration, industry adaptation, and feature rollout;
- customer and business language, promises, status messages, and error handling;
- data use, context use, permissions, privacy, accessibility, safety, and recovery; and
- documentation, sales claims, product-status claims, and certification decisions.

It applies whether an experience is visible, background, automated, assisted, or performed through an integration. A proposal does not escape constitutional review because it is called an experiment, pilot, configuration, internal tool, AI feature, or temporary workaround.

## Document hierarchy

The following precedence applies when JOHAI documents appear to conflict:

1. Applicable law, binding contractual obligations, security and privacy controls, accessibility requirements, explicit human approval conditions, and mandatory database safety policy.
2. This JOHAI Constitution.
3. The constitutional companion documents, including `PRODUCT_VALUES.md` and the permanent design, UX, AI, customer-experience, business-experience, language, and decision principles.
4. The adopted strategic and brand foundation: North Star, Manifesto, Mission and Vision, Product Promise, Company Values, Brand Guidelines, Voice and Tone, AI Employee Principles, Culture, and Long-Term Roadmap.
5. Approved architecture decisions, security policies, platform architecture, and operating policies.
6. Product, technical, customer, investor, sales, and operating manuals.
7. Sprint records, implementation plans, specifications, tickets, and local component guidance.

The [JOHAI North Star](../foundation/JOHAI_NORTH_STAR.md) and its companion foundation documents define enduring direction and expression beneath this Constitution. They cannot amend a Constitutional law by implication, and a roadmap horizon cannot establish implementation or production status.

[JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md) is an adopted subordinate product and architecture doctrine. It interprets how authorized context should reduce effort and guide intelligent behavior. It must comply with this Constitution. If the doctrine, an example, or an implementation plan conflicts with this Constitution, the Constitution controls.

Lower-level documents may make a rule more specific or more protective. They may not silently weaken or waive a constitutional requirement.

## Enforcement and stop rule

Every proposal must be reviewed against the Ten Laws, Product Values, applicable safety boundaries, and the documented status of the capability before implementation begins.

The mandatory stop rule is:

> If a proposed feature, UI change, AI behavior, workflow, automation, interaction, or claim violates this Constitution, implementation must stop until the conflict is resolved.

Resolution requires one of the following:

1. revise the proposal so that it complies;
2. remove the unsafe, misleading, inaccessible, or unnecessary behavior;
3. narrow the scope and document the resulting limitations; or
4. amend the Constitution through explicit human approval and a documented governance review.

A deadline, customer request, sales opportunity, experiment, model output, industry convention, or feature flag is not authority to bypass the stop rule. Local exceptions and undocumented waivers are prohibited.

Constitutional review must be visible in the relevant decision record, specification, or sprint record. Review must include:

- the customer or business problem being solved;
- the authorized context and permission boundary;
- the effort reduced and time saved;
- why intervention is useful and when it remains silent;
- truthful status and limitations;
- accessibility, privacy, security, failure, and human-handoff behavior; and
- the evidence required before the capability may be described as implemented or production-ready.

## Status truth

Adopting an architecture, value, law, principle, or design pattern does not implement a runtime capability. Documentation must distinguish at least these states:

- **Implemented:** Present in the repository and supported by current, relevant evidence.
- **Partial:** Some required behavior exists, but material behavior, operations, evidence, or safety gates remain incomplete.
- **Planned:** Approved as a direction or design but not implemented.
- **Deliberately unavailable:** Withheld because it is out of scope, unsafe, unauthorized, unsupported, or awaiting separate approval.

No document may transform a Planned capability into an Implemented capability by changing language alone. Production readiness requires the applicable security, tenant-isolation, accessibility, operational, validation, documentation, and human-approval gates.

The phrases “AI,” “intelligent,” “automatic,” “connected,” “realtime,” “human support,” “secure,” “verified,” and “complete” must describe proven behavior, not intention. A recorded request is not proof that a human was notified or assigned. A suggestion is not a completed action. An architecture is not a deployed system.

## The Ten Laws of JOHAI

### Law 1 — The AI never asks for information it can already infer

#### Purpose

Reduce repetition and demonstrate preparation. “Infer” means resolve from authorized, relevant, sufficiently fresh, and reliable context. It never means guess, stereotype, inspect hidden information, or cross a permission boundary.

#### Examples

- Use the authenticated customer's current name and active business context instead of asking them to identify themselves again.
- When assistance starts from one visible appointment, carry that appointment into the next step unless genuine ambiguity exists.
- Present two authorized choices when both could be meant instead of asking the customer to reconstruct the entire situation.

#### Counterexamples

- Asking for a document title that is already selected and visible.
- Guessing a service, identity, diagnosis, legal intent, or desired action from weak signals.
- Using a CRM note, another tenant's record, or an internal Knowledge Center source as customer context.

#### Implementation consequences

- Context resolution follows authentication, tenant resolution, authorization, freshness, and purpose checks.
- Known safe values are prefilled or carried forward; consequential values remain reviewable before submission.
- Ambiguity that could change the result triggers the smallest necessary clarifying question.
- Missing or forbidden context produces a truthful limitation, never a fabricated inference.

### Law 2 — The AI never interrupts without adding value

#### Purpose

Protect attention and keep the customer's task primary. AI earns its presence by materially reducing effort, preventing a meaningful error, or clarifying an important decision.

#### Examples

- Surface a preparation instruction before a relevant appointment when the instruction is current and customer-visible.
- Warn once that a selected document was revoked before the customer attempts to rely on it.
- Offer help after a repeated recoverable failure when a verified next step exists.

#### Counterexamples

- Opening an assistant on every page merely because AI is available.
- Interrupting a completed payment, submission, booking, or critical workflow with a suggestion.
- Repeating information already clear on the screen or showing generic “How can I help?” prompts without context.

#### Implementation consequences

- Every intervention defines a trigger, measurable value, suppression conditions, frequency limit, and dismissal behavior.
- Critical, completed, private, or high-concentration workflows remain uninterrupted unless safety requires a clear notice.
- Silence is the default when relevance, authority, or value is uncertain.
- Decorative AI and attention-seeking AI affordances are rejected.

### Law 3 — The AI always reduces customer effort

#### Purpose

Make intelligence useful in practical terms. AI should remove unnecessary typing, searching, navigation, repetition, or interpretation without removing consent or control.

#### Examples

- Summarize a current customer-visible thread and link directly to the relevant next action.
- Draft a support request from facts the customer can review and edit.
- Present only the service options available to the active customer and business context.

#### Counterexamples

- Adding a conversation before a direct action that already takes one clear step.
- Making the customer verify data JOHAI already holds merely to train or reassure the system.
- Replacing a short form with a longer chat flow.

#### Implementation consequences

- Proposals identify the baseline task and the specific clicks, typing, time, or confusion removed.
- AI is not selected when deterministic UI completes the task more simply.
- Consent, privacy notices, accessibility, and consequential confirmation are not counted as removable friction.
- A capability that shifts effort from the system to the customer fails this law.

### Law 4 — The AI explains only what is necessary

#### Purpose

Preserve clarity and momentum. Customers receive what they need to understand the situation and act safely, with optional detail available when useful.

#### Examples

- State why an action is unavailable and offer the verified next step.
- Give a concise answer first, then provide a clearly labeled route to details or sources.
- Explain the material consequence before a consequential confirmation.

#### Counterexamples

- Exposing prompts, orchestration, model selection, internal reasoning, or implementation jargon.
- Producing a long explanation for a simple status.
- Omitting a fee, risk, uncertainty, data use, or irreversible consequence in the name of brevity.

#### Implementation consequences

- Content uses progressive disclosure and plain language.
- Explanations distinguish facts, business-provided information, generated guidance, uncertainty, and human messages.
- Material limits and consequences are never hidden.
- Internal system details remain internal unless a legal, privacy, security, or support obligation requires a safe disclosure.

### Law 5 — The AI disappears when it has nothing useful to contribute

#### Purpose

Keep JOHAI calm and task-centered. Intelligence should often be experienced through good defaults and prepared workflows rather than through an AI persona.

#### Examples

- Use deterministic validation silently when the error and correction are already clear.
- Keep the assistant absent when a customer is simply downloading an authorized document.
- Remove a suggestion after it becomes stale, irrelevant, completed, or dismissed.

#### Counterexamples

- Maintaining a persistent chat bubble that obscures content or implies assistance that is unavailable.
- Generating commentary about routine filtering, formatting, or navigation.
- Showing an AI summary that duplicates the page without improving comprehension.

#### Implementation consequences

- AI affordances are conditional, dismissible, accessible, and absent by default.
- Deterministic functions remain deterministic and do not receive decorative AI language.
- Stale, low-confidence, unauthorized, or redundant suggestions are suppressed.
- Product success is measured by customer outcomes, not AI-message volume or visibility.

### Law 6 — The customer should feel understood, never managed

#### Purpose

Use context with respect. JOHAI supports customer agency and never turns personalization into surveillance, control, pressure, or judgment.

#### Examples

- Remember an approved language or communication preference within the authorized relationship.
- Explain why a recommendation is relevant and let the customer decline it without penalty.
- Offer a person when the customer wants judgment, reassurance, or an exception.

#### Counterexamples

- Using manipulative urgency, guilt, dark patterns, or repeated prompts after refusal.
- Revealing sensitive inferences or emphasizing how much the system “knows” about the customer.
- Steering a customer toward a business outcome that is not aligned with the customer's stated task.

#### Implementation consequences

- Personalization is purpose-bound, minimally necessary, revocable, and explainable.
- Customers retain meaningful choice and a clear path to correction or human assistance.
- Sensitive traits are not inferred from behavior or industry templates.
- Metrics must not reward pressure, dependency, or unwanted engagement.

### Law 7 — Every interaction should save time

#### Purpose

Respect the finite time of customers and business teams. Time saved is measured across the complete task, including recovery, correction, and handoff—not merely the first click.

#### Examples

- Preserve a valid draft after a recoverable failure.
- Route a request to the correct verified channel with customer-reviewed context.
- Show the current timezone and status where they prevent scheduling mistakes.

#### Counterexamples

- Sending a customer through repeated pages to obtain one known answer.
- Claiming speed while creating downstream corrections, support contacts, or uncertainty.
- Automating a high-risk step so aggressively that the customer must later undo it.

#### Implementation consequences

- Workflows minimize steps, waits, re-entry, and avoidable recovery.
- Performance budgets and loading, empty, error, retry, and offline behavior are part of experience design.
- Accessibility and informed confirmation are essential task time, not waste to remove.
- A faster unsafe or unreliable workflow does not satisfy this law.

### Law 8 — AI creates confidence, never uncertainty

#### Purpose

Create **justified confidence through clarity**. This law never permits fabricated certainty or concealment of real uncertainty. JOHAI reduces avoidable uncertainty by showing what is known, what is not known, why, and what safe next step is available.

#### Examples

- Distinguish a confirmed appointment from a suggested time or an external-provider link.
- State that available information is insufficient and offer a verified human channel.
- Cite the current approved source or visible record behind a factual explanation.

#### Counterexamples

- Presenting a prediction, draft, or inferred answer as a confirmed fact.
- Hiding uncertainty to make AI appear capable.
- Giving vague disclaimers without identifying the actual limitation or next step.

#### Implementation consequences

- Generated language is clearly distinguishable from authoritative records and human responses.
- Confidence, provenance, freshness, and conflicts are evaluated before output.
- Material uncertainty is stated plainly and proportionately; low authority or high risk requires clarification or human escalation.
- Fake precision, unsupported promises, hallucination, and certainty theatre are prohibited.

### Law 9 — Human takeover must feel natural

#### Purpose

Preserve continuity when judgment, empathy, authority, safety, or customer preference requires a person. Escalation is a normal part of a competent system, not a failure to conceal.

#### Examples

- Carry a customer-reviewed summary and relevant visible records into an approved human-support request.
- Clearly mark when AI stops and a verified human response begins.
- Let the customer request a person without arguing, looping, or restarting the task.

#### Counterexamples

- Claiming “a specialist has been notified” when only a database row was created.
- Trapping the customer in repeated automated answers after they request a person.
- Passing hidden, excessive, or unreviewed personal information to a human channel.

#### Implementation consequences

- Handoff defines trigger, consent, minimum data, verified destination, ownership, status, failure, and recovery.
- Notification, assignment, response, and service-level claims require operational evidence.
- AI and human authorship remain distinguishable.
- When no verified handoff exists, JOHAI states that limitation and supplies only an available, truthful alternative.

### Law 10 — The business is always the hero. Not JOHAI.

#### Purpose

Strengthen the relationship between the business and its customer. JOHAI provides infrastructure and intelligence without competing for attention, credit, identity, or trust that belongs to the business.

#### Examples

- Use the business's approved identity, terminology, policies, and verified support channels.
- Phrase assistance as helping the customer work with the business, not as replacing the business.
- Let successful workflows feel like excellent service delivered by the business.

#### Counterexamples

- Branding every helpful moment as an AI achievement.
- Impersonating an employee or allowing JOHAI to make an unauthorized business promise.
- Hiding the business contact path to keep the customer inside JOHAI.

#### Implementation consequences

- JOHAI branding and AI presence remain subordinate to business identity and customer purpose.
- Business-approved content is attributable, while generated content is identified honestly.
- The platform never fabricates authority, policy, availability, expertise, or a commitment on the business's behalf.
- Product metrics prioritize business and customer outcomes over AI engagement.

## Applying the laws together

The Ten Laws are cumulative. No law authorizes violation of another.

- Saving time never overrides consent, security, privacy, accessibility, or professional judgment.
- Disappearing never permits JOHAI to hide AI authorship, material automation, uncertainty, or risk.
- Using context never creates authorization.
- Concision never permits omission of material consequences.
- Business primacy never permits deceptive impersonation or an unverified promise.
- Confidence must be warranted, not performed.

When two laws appear to pull in different directions, choose the interpretation that best preserves safety, truth, customer agency, and the long-term business relationship.

## Constitutional decision test

Before approval, every future proposal must answer:

1. Does it reduce effort?
2. Does it create justified trust and confidence?
3. Does it remove friction without removing consent or control?
4. Does it respect authorized context and remain silent when context is unsafe or unnecessary?
5. Does it save time across the complete task, including recovery?
6. Does it preserve privacy, tenant isolation, accessibility, security, and truthful status?
7. Does human takeover work honestly and naturally when needed?
8. Does the business remain the hero?
9. Does it comply with all Ten Laws and Product Values?
10. Is every capability claim supported by current evidence?

If any answer is no, unknown, or unsupported, implementation must not proceed until the issue is resolved.

## Amendment and stewardship

The Constitution is permanent but not immune to responsible improvement. An amendment requires:

1. a documented reason and affected laws or values;
2. security, privacy, accessibility, legal, product, and operational review as applicable;
3. explicit human approval;
4. updates to subordinate doctrines and conflicting manuals; and
5. a truthful historical record of what changed and why.

Foundation Version 1.0 is locked. Any future amendment also requires an explicit user request, documented architectural decision, named human approval, version update, and release validation under the [Foundation Change Policy](../foundation/FOUNDATION_CHANGE_POLICY.md).

An amendment cannot retroactively certify a capability or erase an unresolved risk. Examples may evolve with the product, but the protective meaning of a law cannot be weakened through wording changes in a lower-level document.

## Adoption record

JOHAI adopts this Constitution as product and architecture governance. Adoption changes how future work is evaluated. It does not change present runtime behavior, implement AI, alter an interface, create an API, change authentication, modify a database, execute SQL, or create a migration.
