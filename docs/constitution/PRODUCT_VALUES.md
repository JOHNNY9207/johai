# JOHAI Product Values

## Authority and status

- **Document type:** Constitutional product-values standard
- **Authority:** Subordinate to the [JOHAI Constitution](JOHAI_CONSTITUTION.md) and binding on future product decisions
- **Values status:** Adopted
- **Runtime status:** Unchanged by adoption of this document
- **Capability status:** Status-specific; no value statement changes a capability from `Planned` or `Partial` to `Implemented`
- **Application, UI, API, authentication, database, migration, or production-state change created by this document:** None

These values translate the Constitution into observable product behavior. They apply to strategy, design, engineering, AI, automation, operations, documentation, support, sales, and certification.

A value is not satisfied by tone or intention alone. A proposal must show how the value appears in the customer or business experience, which anti-patterns it avoids, and how the value changes an actual decision.

When values appear to compete, law, safety, security, privacy, accessibility, explicit human approval, the mandatory database workflow, and the [JOHAI Constitution](JOHAI_CONSTITUTION.md) take precedence. Teams then choose the option that preserves the greatest long-term trust and business value with the least customer effort.

## 1. Trust

### Definition

Trust is the customer's and business's justified belief that JOHAI will behave as represented, protect boundaries, state limitations honestly, and preserve control. Trust comes from repeated truthful behavior, not from claims that the product is intelligent, secure, or reliable.

### Observable behaviors

- Status, authorship, source, action outcome, external-provider boundary, and human-handoff state are represented accurately.
- A suggestion, draft, recorded request, queued operation, completed action, and verified result are visibly distinct.
- Material uncertainty is explained without alarm or false reassurance.
- Errors preserve the user's work where safe and provide a truthful recovery path.
- The same permissions and promises apply through pages, direct routes, APIs, automation, and AI.

### Anti-patterns

- Fake certainty, fake progress, fake urgency, or a false “success” state.
- Claiming that a person was notified, an action completed, or a result verified without evidence.
- Hiding limitations in fine print or changing behavior unpredictably across channels.
- Using warm language to mask a missing safety, privacy, or operational control.

### Decision implications

- Prefer a clear limitation over an unsupported promise.
- Require evidence before using `Implemented`, `Verified`, `Production Ready`, `realtime`, or similar claims.
- Stop rollout when behavior cannot be explained or reconciled with the represented state.
- Choose recoverable, reviewable, and attributable behavior over impressive but opaque automation.

## 2. Simplicity

### Definition

Simplicity is the disciplined removal of unnecessary choices, steps, explanation, navigation, and visual competition. It preserves necessary safety, consent, context, and capability; it does not merely hide complexity until it fails.

### Observable behaviors

- Each screen and state has one clear purpose and an obvious primary action.
- Known authorized information is carried forward rather than requested again.
- Language is plain, concise, and specific to the current task.
- Progressive disclosure keeps essential information visible and optional detail accessible.
- Shared patterns behave consistently across industries and platform surfaces.

### Anti-patterns

- Dashboard clutter, duplicated navigation, unnecessary popups, and decorative AI.
- Replacing one direct action with a longer conversational flow.
- Hiding material consequences, recovery, or settings to make an interface look clean.
- Scattering industry-specific conditions across components instead of using governed configuration.

### Decision implications

- Remove a feature, field, control, or message when it adds no measurable value.
- Prefer a deterministic interaction over AI when it completes the task more directly.
- Keep advanced choices available only where they are genuinely needed.
- Reject local exceptions that make the shared product harder to understand or maintain.

## 3. Speed

### Definition

Speed is the time and effort required to reach a correct, safe, recoverable outcome. It includes perceived responsiveness, comprehension, completion, error recovery, and human handoff—not only server response time or number of clicks.

### Observable behaviors

- Important content and the next permitted action become available promptly.
- Loading, empty, retry, offline, timeout, and failure states preserve orientation.
- Drafts and valid inputs survive recoverable failures where appropriate.
- Context removes repeated typing, searching, and navigation.
- Performance is measured on representative devices, networks, data volumes, and accessible interaction paths.

### Anti-patterns

- Optimizing animation or first paint while the complete task remains slow or confusing.
- Automating a consequential action so aggressively that correction takes longer than confirmation would have.
- Blocking the primary task on optional AI, analytics, or external-provider work.
- Treating accessibility or informed consent as avoidable delay.

### Decision implications

- Measure end-to-end task time, correction rate, retry rate, and recovery—not isolated technical latency alone.
- Load optional intelligence progressively and preserve the deterministic core when it is unavailable.
- Eliminate steps only when safety, clarity, and control remain intact.
- Prefer predictable performance over an occasionally faster but unreliable path.

## 4. Transparency

### Definition

Transparency means people can understand who or what is responding, which state is authoritative, what will happen next, what data is being used, and where a limitation or external dependency exists.

### Observable behaviors

- AI-generated, human-authored, business-provided, recorded, inferred, and external-provider information are distinguishable where the difference matters.
- Consequential actions state the object, effect, scope, and confirmation required.
- Uncertainty, freshness, revocation, provider boundaries, and failure are expressed in plain language.
- Privacy choices and data use are discoverable at the point where they matter.
- Documentation distinguishes adopted architecture from implemented runtime behavior.

### Anti-patterns

- Anthropomorphic or vague wording that conceals automation.
- Silent status changes, hidden defaults, undisclosed data use, or ambiguous ownership.
- Exposing internal prompts, raw traces, secrets, or implementation details in place of meaningful transparency.
- Treating a disclaimer as permission to make an unsupported claim.

### Decision implications

- Reveal material facts and boundaries, not confidential internals.
- Add an explanation when it changes understanding or consent; omit implementation trivia that adds noise or risk.
- Do not launch a workflow whose success, failure, or human ownership cannot be represented truthfully.
- Correct documentation immediately when evidence supersedes a prior status.

## 5. Respect

### Definition

Respect protects attention, dignity, agency, accessibility, language, expertise, and the right to decline. JOHAI helps without managing, pressuring, stereotyping, or making a person prove information already known safely.

### Observable behaviors

- Interruptions occur only for clear value, safety, or a required decision.
- Customers can dismiss suggestions, correct context, choose a person, and recover without punishment.
- Language is calm, professional, inclusive, and free of condescension or manufactured urgency.
- Accessibility is built into every interaction and tested as part of the primary experience.
- Industry adaptation changes useful terminology and workflows without inferring sensitive traits.

### Anti-patterns

- Dark patterns, guilt, pressure, nagging, engagement traps, or forced conversation.
- Personalization that feels invasive or emphasizes how much JOHAI knows.
- Treating disability, language, age, industry, location, or behavior as permission to stereotype.
- Blocking human help to protect an automation metric.

### Decision implications

- Default to customer control and reversible choices.
- Suppress assistance after dismissal unless a new safety-critical condition arises.
- Require accessible alternatives for visual, auditory, motor, cognitive, and language-dependent interactions.
- Reject success metrics that reward unwanted attention, dependency, or manipulation.

## 6. Reliability

### Definition

Reliability is consistent, correct, and recoverable behavior under normal, edge, degraded, and failure conditions. A reliable system does not depend on a best-case model response, external provider, network, cache, or operator assumption.

### Observable behaviors

- The same input, authority, and state produce consistent permitted outcomes.
- Operations are validated server-side, protected from duplication, and report authoritative results.
- Degraded AI, integration, network, or notification service does not corrupt the deterministic core.
- Stale, revoked, missing, malformed, or conflicting data fails safely.
- Monitoring and testing cover failure, retry, timeout, duplication, tenant switch, and rollback.

### Anti-patterns

- Treating a model output, browser flag, URL, or cached label as authority.
- Silent failure, destructive retry, duplicate action, or an unrecoverable empty state.
- A demo path that bypasses real security or is mistaken for production evidence.
- Declaring production readiness from the existence of code or documentation alone.

### Decision implications

- Design failure and rollback before enabling a capability.
- Keep core tasks available when optional intelligence fails.
- Require representative evidence for claims about refresh, delivery, external actions, and multi-tenant behavior.
- Delay rollout when operations cannot be monitored, recovered, or explained.

## 7. Privacy

### Definition

Privacy is purposeful, minimal, authorized, bounded, and revocable use of information. Access to data never implies permission to expose, combine, retain, infer from, or reuse it for another purpose.

### Observable behaviors

- Data is limited to the active authenticated user, tenant, profile, purpose, and permitted fields.
- The minimum necessary context is assembled only after authorization.
- Tenant switches, logout, suspension, revocation, and deletion clear or invalidate derived context and caches.
- Customer-visible AI uses only approved customer-visible records and separately published knowledge.
- Retention, consent, correction, and revocation behavior are documented and testable.

### Anti-patterns

- Cross-tenant memory, hidden enrichment, excessive context, or collecting data “just in case.”
- Exposing CRM internals, Business Brain internals, private notes, internal prompts, raw Knowledge Center files, billing internals, credentials, or another customer's data.
- Logging secrets, recovery links, tokens, signed URLs, sensitive prompts, or unnecessary personal data.
- Using industry, behavior, or location to infer sensitive facts without a lawful and approved purpose.

### Decision implications

- If purpose, authority, or retention is unclear, do not collect or use the data.
- Prefer a smaller customer-safe projection over access to a broad internal source.
- Treat new persisted context, memory, permission, or customer-visible knowledge as a security and database-governance change.
- Privacy failures stop implementation and rollout regardless of convenience or commercial pressure.

## 8. Context

### Definition

Context is the authorized, relevant, current information needed to understand the task before deciding what to show, ask, suggest, or leave alone. It reduces repetition but never creates authority.

The subordinate [JOHAI Contextual Intelligence™ doctrine](../philosophy/CONTEXTUAL_INTELLIGENCE.md) defines the detailed context model and safety boundary.

### Observable behaviors

- The active user, tenant, profile, surface, selected record, intent, permissions, language, locale, timezone, freshness, and business rules are resolved in a safe order.
- Known authorized values are carried forward and remain reviewable where consequences matter.
- The interface uses the business's approved terminology and current customer-visible state.
- Genuine ambiguity produces the smallest useful clarification.
- Assistance remains silent when context is missing, stale, forbidden, or irrelevant.

### Anti-patterns

- Asking broad questions before inspecting the safe current context.
- Guessing across ambiguity or treating personalization as authorization.
- Reusing context after tenant switch, logout, suspension, or revocation.
- Allowing internal knowledge, hidden notes, or another business's history to influence customer output.

### Decision implications

- Context resolution precedes personalization and AI generation.
- Every contextual feature documents sources, permission, freshness, purpose, fallback, retention, revocation, and measurable effort reduction.
- When context cannot be trusted, fall back to a neutral authorized experience.
- Prefer direct contextual UI over conversation when conversation adds no value.

## 9. Elegance

### Definition

Elegance is the coherent combination of usefulness, restraint, clarity, accessibility, and craftsmanship. It makes complex capability feel calm without hiding material complexity or sacrificing control.

### Observable behaviors

- Visual hierarchy makes the current state and primary action immediately understandable.
- Motion, color, spacing, typography, language, and feedback have functional purpose.
- Shared patterns remain consistent across platforms and adapt gracefully to screen, input, language, and industry.
- Empty, error, loading, success, and denied states receive the same care as the ideal path.
- AI is present only when its contribution is clearer than the deterministic alternative.

### Anti-patterns

- Decoration that competes with the task, inaccessible contrast, motion without purpose, or novelty for novelty's sake.
- Dashboard density used as a proxy for capability.
- Inconsistent components or terminology that reveal internal architecture to the user.
- Polished happy paths paired with confusing or unsafe failure states.

### Decision implications

- Subtract before adding.
- Reuse governed patterns and tokens rather than creating one-off visual or interaction rules.
- Evaluate accessibility, content, behavior, and failure as parts of the design—not post-design checks.
- Choose quiet coherence over theatrical intelligence.

## 10. Business value

### Definition

Business value is a measurable improvement in the relationship between a business and its customers or in the business's safe operation. It may reduce effort, cost, delay, error, missed opportunity, or service inconsistency, or improve completion, retention, trust, or customer satisfaction. AI engagement by itself is not business value.

### Observable behaviors

- Every proposal names the business problem, affected platform layer, intended customer outcome, operational owner, and measurable result.
- The business's approved identity, policies, terminology, authority, and human relationships remain primary.
- Automation removes repetitive work while keeping consequential judgment and exceptions under appropriate human control.
- Metrics include quality, correction, failure, support burden, trust, accessibility, privacy, and tenant-isolation guardrails.
- Costs, dependencies, rollout, support, recovery, and remaining risks are visible before approval.

### Anti-patterns

- Building a feature because AI can produce it, a competitor has it, or it creates more engagement.
- Transferring hidden labor, risk, or confusion to customers or support teams.
- Claiming return, productivity, conversion, or readiness without evidence.
- Letting JOHAI compete with the business for credit, attention, data, or customer loyalty.

### Decision implications

- Prioritize outcomes over feature count and AI-message volume.
- Require a baseline and success measure proportionate to the proposal.
- Stop or retire capabilities whose operational cost, risk, or customer effort exceeds their demonstrated value.
- The business remains the hero; JOHAI succeeds when the business serves its customers better.

## Cross-value decision rules

1. **Trust is never traded for apparent speed.** A truthful limitation is better than a fast false answer.
2. **Simplicity never removes necessary transparency.** Material consequences remain visible.
3. **Context never overrides privacy.** Information must be authorized for the current purpose.
4. **Elegance never overrides accessibility.** A beautiful inaccessible experience is not elegant.
5. **Reliability includes failure.** A design without safe retry, recovery, and rollback is incomplete.
6. **Respect constrains growth.** Manipulation, pressure, and unwanted engagement are not business value.
7. **Business value requires customer value.** Short-term operational gain cannot depend on deception, unsafe transfer of effort, or loss of agency.
8. **Transparency protects confidence.** Real uncertainty is explained; it is never hidden or exaggerated.
9. **Human approval remains meaningful.** A confirmation or review step cannot be engineered as a formality.
10. **Status remains truthful.** Adopted design architecture does not imply implemented runtime behavior.

## Product-value review

Before work proceeds, the proposal owner must be able to answer:

- Which values does the proposal advance, and through what observable behavior?
- Which values could it put at risk?
- What anti-patterns have been explicitly excluded?
- What customer effort and business outcome will be measured?
- What is the permission, privacy, accessibility, security, failure, and human-approval boundary?
- What happens when AI, context, data, an integration, or a human channel is unavailable?
- What status can be claimed today, and what evidence is required for the next status?

If these answers are missing, contradictory, or unsupported, the proposal is not ready for implementation.

## Adoption record

JOHAI adopts these Product Values as constitutional design governance. Their adoption changes the standard for future decisions. It does not change application behavior, implement a user experience, enable AI, alter an API, modify authentication, change a database, execute SQL, or create a migration.
