# JOHAI Company Values

## Authority and status

- **Document type:** Permanent company operating standard
- **Status:** Adopted company values
- **Authority:** Subordinate to applicable law, binding obligations, security, privacy, accessibility, explicit human approval, mandatory database safety, and the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md)
- **Scope:** Employees, founders, contractors, advisors, leaders, partners acting for JOHAI, and AI-assisted work used by those people
- **Runtime effect:** None
- **Capability effect:** None; adopting a value does not implement a product behavior or prove a company outcome

The [Product Values](../constitution/PRODUCT_VALUES.md) define how JOHAI products must behave. These Company Values define how the people building and operating JOHAI must behave. Both are binding strategic standards; neither can relax the Constitution or a protective requirement.

Values are observable choices under pressure. They are not adjectives for recruiting or marketing. A value matters when it changes what JOHAI builds, says, measures, approves, delays, or refuses.

## 1. Humility

### Meaning

We work from the possibility that our assumptions, designs, models, and interpretations may be wrong. Expertise increases responsibility to test and explain; it does not create exemption from evidence or review.

### Observable behavior

- Separate what we know from what we infer, expect, or hope.
- Ask for domain, customer, accessibility, security, and operational expertise before a decision exceeds our competence.
- Make it easy for colleagues and customers to correct us.
- Revise a decision when better evidence appears and preserve the reason in the record.
- Credit the business, team, and source rather than performing individual or AI brilliance.

### Anti-patterns

- Treating confidence, seniority, investor interest, or model fluency as proof.
- Defending a design because we built it or announced it.
- Hiding uncertainty to appear decisive.
- Assuming one industry, customer, language, ability, or culture represents all others.

### Decision implication

When evidence is incomplete, narrow the claim and the scope. When the consequence is material, seek qualified review or stop.

## 2. Truth

### Meaning

We describe current reality accurately, including limitations, failure, uncertainty, and work that remains. We do not let a persuasive narrative outrun evidence.

### Observable behavior

- Classify capabilities as `Implemented`, `Partial`, `Planned`, or deliberately unavailable from current evidence.
- Distinguish a proposal, draft, approval, attempt, queue, provider result, completion, and verification.
- Correct stale documentation and claims when the underlying fact changes.
- State which evidence exists, which does not, and who must confirm the next status.
- Use exact customer-facing language about AI, humans, external providers, and authoritative state.

### Anti-patterns

- Calling a demo production-ready, a design implemented, or a request assigned.
- Omitting a material risk or dependency to protect momentum.
- Using “secure,” “verified,” “realtime,” “complete,” or “autonomous” without the evidence those words require.
- Allowing sales, fundraising, or deadlines to redefine a fact.

### Decision implication

If the truthful statement makes the proposal less attractive, use the truthful statement and fix the underlying reality.

## 3. Craftsmanship

### Meaning

We care about the complete quality of the experience and system: purpose, language, interaction, accessibility, correctness, security, performance, failure, recovery, documentation, and maintainability.

### Observable behavior

- Design and test loading, empty, denied, expired, degraded, retry, and rollback states—not only the happy path.
- Prefer coherent shared foundations and typed contracts over duplicated local exceptions.
- Use plain language, accessible semantics, deterministic state, and proportionate validation.
- Review details that affect trust, such as timezone, focus, status wording, idempotency, and tenant switch behavior.
- Leave code, documentation, evidence, and operational ownership clearer than we found them.

### Anti-patterns

- Polishing visuals while failure, accessibility, or authorization remains undefined.
- Shipping a clever abstraction without a demonstrated user or operating need.
- Treating documentation and tests as cleanup after “real” work.
- Accepting recurring manual correction as normal product behavior.

### Decision implication

Scope may shrink to protect complete quality. Quality is not permission for endless refinement; it is fitness for the real purpose and conditions.

## 4. Respect

### Meaning

We respect people's attention, dignity, agency, time, language, accessibility needs, expertise, privacy, and right to decline. We treat businesses and customers as participants in a relationship, not optimization targets.

### Observable behavior

- Make the purpose, consequence, and escape path clear.
- Listen to the person closest to the customer, operation, risk, or affected community.
- Provide accessible ways to participate, review, correct, and escalate.
- Avoid unnecessary interruption, repetition, jargon, pressure, and surveillance.
- Disagree with the idea directly while preserving the person's dignity and psychological safety.

### Anti-patterns

- Dark patterns, manipulation, manufactured urgency, or engagement traps.
- Dismissing an accessibility, privacy, cultural, or support concern as an edge case.
- Requiring people to restate information already available safely.
- Using customer vulnerability or employee power imbalance to secure agreement.

### Decision implication

When a metric improves by reducing agency or increasing unwanted attention, reject the metric or the tactic.

## 5. Learning

### Meaning

We improve through evidence, feedback, experiments with explicit boundaries, post-incident learning, and disciplined revision. Learning is not permission to expose people to ungoverned risk.

### Observable behavior

- Define the question, baseline, guardrails, evidence, and stop condition before an experiment.
- Record failures and corrections without rewriting history.
- Turn repeated incidents, support patterns, and customer confusion into system improvements.
- Evaluate outcomes across relevant tenants, industries, languages, abilities, devices, and failure states.
- Share reusable knowledge instead of letting it remain with one person or team.

### Anti-patterns

- Calling unmeasured release an experiment.
- Cherry-picking successful model outputs or customer stories.
- Repeating a failure without updating a control, test, document, or decision.
- Collecting more data without a defined purpose or retention boundary.

### Decision implication

Learn in the smallest safe scope. A test that cannot protect participants, explain data use, or stop cleanly does not proceed.

## 6. Curiosity

### Meaning

We seek the real problem behind a request and the operating context behind a symptom. Curiosity is disciplined inquiry, not uncontrolled scope or collection.

### Observable behavior

- Ask what outcome a person needs before choosing a technology or interface.
- Investigate the complete journey, including upstream causes and downstream correction.
- Compare deterministic, human, AI-assisted, and no-change options.
- Examine why the system should remain silent or why a feature should not exist.
- Look for disconfirming evidence and unintended effects.

### Anti-patterns

- Starting with “Where can we add AI?”
- Expanding scope because an idea is technically interesting.
- Treating novelty as value.
- Using curiosity to justify access to hidden, excessive, or unrelated data.

### Decision implication

Curiosity opens questions; the Constitution, purpose, evidence, and boundaries determine what may be built.

## 7. Customer obsession

### Meaning

Customer obsession means sustained attention to the customer's legitimate outcome and to the business relationship that serves it. It does not mean maximizing engagement, granting every request, tracking everything, or ignoring the business's sustainability and obligations.

### Observable behavior

- Start with the customer's real task, effort, uncertainty, and recovery needs.
- Use authorized context to avoid repetition and make the next safe step clear.
- Measure completion, time, correction, trust, accessibility, and successful human help.
- Preserve the represented business's identity and ability to provide judgment.
- Refuse requests that would harm another customer, employee, business, or protected boundary.

### Anti-patterns

- Optimizing message count, time in product, conversion, or upsell as a proxy for customer value.
- Building a requested feature without understanding the underlying problem.
- Personalization that becomes surveillance or pressure.
- Treating the loudest customer as the only customer.

### Decision implication

Choose the option that produces the best legitimate customer outcome and durable business relationship, not the most visible product activity.

## 8. Privacy

### Meaning

We treat information as entrusted for a defined purpose, not as an asset available for every useful idea. Privacy applies to customers, business teams, candidates, employees, partners, and people represented in operational data.

### Observable behavior

- Collect, expose, retain, and derive only what the approved purpose requires.
- Resolve identity, tenant, role, source visibility, and consent before personalization or AI use.
- Design deletion, revocation, logout, suspension, and tenant-switch behavior with the feature.
- Keep secrets, credentials, private notes, internal prompts, raw sources, and other tenants outside unauthorized outputs and logs.
- Escalate new persisted context, memory, or permissions through the required security and database workflow.

### Anti-patterns

- “Collect now, decide later.”
- Treating legal permission as sufficient ethical purpose.
- Copying production personal data into demos, prompts, tests, documentation, or chat.
- Broad access justified by convenience, debugging, personalization, or model performance.

### Decision implication

If purpose, authority, retention, or deletion is unclear, do not collect or use the information.

## 9. Quality

### Meaning

Quality is a correct, useful, accessible, secure, understandable, maintainable, and recoverable outcome under representative conditions. It is not the absence of visible defects in one demonstration.

### Observable behavior

- Define acceptance evidence before implementation.
- Test permissions, direct access, tenant boundaries, failure, retries, duplication, revocation, accessibility, localization, and performance proportionate to risk.
- Keep optional AI from becoming a dependency for essential deterministic work.
- Identify and record remaining risks rather than averaging them away.
- Stop release for cross-tenant access, unsupported high-impact guidance, fabricated completion, or inaccessible critical paths.

### Anti-patterns

- Equating lint, build, a happy-path test, or stakeholder approval with production readiness.
- Shipping with no operational owner, monitoring, rollback, or support path.
- Treating security and accessibility defects as ordinary backlog items after launch.
- Masking intermittent or external-provider uncertainty with optimistic status.

### Decision implication

Release only the scope for which evidence and operations are sufficient. Unproven scope remains Partial or Planned.

## 10. Long-term thinking

### Meaning

We make decisions that compound trust, product coherence, knowledge, customer relationships, and operating capability. We do not trade durable integrity for a temporary metric, deadline, or story.

### Observable behavior

- Prefer shared governed foundations over duplicated code and inconsistent rules.
- Design versioning, migration, compatibility, rollback, and stewardship before scale requires them.
- Preserve immutable history and explain superseded decisions.
- Consider maintenance, support, privacy, accessibility, and failure cost over the capability's life.
- Invest in evidence, documentation, and reusable contracts that make future work safer and faster.

### Anti-patterns

- Permanent shortcuts labeled temporary without an owner or removal condition.
- Fragmenting products by customer or industry to meet a local deadline.
- Revenue or fundraising claims that future teams must later repair.
- Dependence on one model, provider, person, or undocumented manual process without a recovery plan.

### Decision implication

Prefer the decision that preserves future trust and optionality, even when it requires a smaller or slower first release.

## Values in conflict

Values do not create exceptions to protective rules. When values appear to conflict:

1. follow law, security, privacy, accessibility, explicit human approval, database safety, and the Constitution;
2. protect truth, rights, safety, and tenant boundaries;
3. protect the customer's legitimate outcome and the business relationship;
4. prefer reversible, reviewable, evidence-producing action;
5. narrow scope rather than pretending the conflict is resolved; and
6. document the decision and remaining risk.

Speed is not a Company Value because speed without truth and quality is damage delivered sooner. Speed remains a [Product Value](../constitution/PRODUCT_VALUES.md#3-speed) when it measures safe end-to-end outcomes.

## Hiring, performance, and partnership use

These values should inform hiring, onboarding, performance feedback, promotion, leadership review, vendor selection, partnerships, and incident response. They must not become vague personality tests or a pretext for excluding constructive disagreement.

Evidence of values includes decisions, review quality, corrections, outcomes, and how a person behaves under pressure. Agreement with a leader is not a value. Raising a well-supported risk is.

## Current capability and aspiration boundary

Adopting Company Values does not prove that JOHAI consistently realizes them today. The company must evaluate its behavior against observable evidence and correct gaps. These values do not implement product behavior, authorize data access, certify culture, or establish commercial outcomes.
