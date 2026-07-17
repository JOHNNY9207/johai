# The JOHAI Experience

## Status and scope

- **Document type:** Permanent product-experience constitution
- **Platform scope:** Every JOHAI platform layer and every industry configuration
- **Status:** Adopted design direction; capabilities described as future behavior remain **Planned** until implementation and validation evidence exists
- **Runtime change created by this document:** None

This document defines the experience JOHAI must create for business owners, teams, and customers. It is subordinate to the [JOHAI Constitution](JOHAI_CONSTITUTION.md) and must be applied together with [JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md), the [Customer Experience Principles](./CUSTOMER_EXPERIENCE_PRINCIPLES.md), and the [Business Experience Principles](./BUSINESS_EXPERIENCE_PRINCIPLES.md).

## Constitutional proposition

**JOHAI is an intelligent business operating system.**

It is not an AI product with business features attached. It is not a chatbot, a collection of dashboards, an automation theatre, or a set of disconnected tools. Chat, dashboards, workflows, documents, assistants, and reports are interfaces through which one governed operating system helps a business understand its situation and act.

The customer-facing experience should produce one simple feeling:

> **The business understands me.**

The business-facing experience should produce a complementary feeling:

> **I understand my business, it is moving, and I remain in control.**

Neither feeling may be manufactured through false familiarity, hidden surveillance, fabricated certainty, fake autonomy, or claims unsupported by operational evidence.

The business is always the hero of the customer relationship. JOHAI should make the business feel prepared, responsive, and trustworthy, then recede. It must not compete for attention, insert an assistant persona into every moment, or make the customer feel managed by software.

## One system, two coherent experiences

JOHAI serves two perspectives without exposing one to the other.

| Perspective | What JOHAI should make possible | What must remain hidden |
| --- | --- | --- |
| Customer | Arrive with relevant context preserved, understand the current situation, complete the next allowed action, and receive honest help without repeating known information. | CRM internals, Business Brain, private notes, staff deliberation, internal Knowledge Center sources, billing administration, prompts, tools, orchestration, and other customers. |
| Business | See an accurate operating picture, recognize exceptions, make decisions, delegate bounded work, and verify outcomes without losing human authority. | Customer secrets outside the business's lawful purpose, platform credentials, hidden model reasoning, other tenants, and unsupported claims of autonomous work. |

The views may share an underlying business event, but they do not share unrestricted data. Every surface receives only the projection appropriate to its actor, tenant, purpose, permission, and moment.

## The experience loop

Every JOHAI interaction should follow the same operating rhythm:

1. **Resolve authority.** Establish identity, tenant, role, permissions, and current record before applying intelligence.
2. **Understand the moment.** Use the minimum authorized, relevant, and sufficiently fresh context.
3. **Reduce the problem.** Present the smallest useful explanation, decision, or next step.
4. **Preserve control.** Make consequential actions reviewable and require the appropriate human confirmation.
5. **Execute deterministically.** Use registered, independently authorized operations rather than model output as authority.
6. **Prove the result.** Show what actually happened, what remains pending, and which authoritative source supports the status.
7. **Leave quietly.** Once the user can proceed safely, the system stops adding prompts, narration, or AI ceremony.

If identity, tenant, permission, evidence, or execution state cannot be resolved, JOHAI must fail closed and offer the safest truthful next step.

## Experience moments

### Customer moments

| Moment | Required experience |
| --- | --- |
| Arrival | The correct authorized business and customer context are ready. The customer is not asked to restate known information. |
| Orientation | Current appointments, messages, documents, requests, and allowed actions are understandable without learning JOHAI's internal structure. |
| Intention | JOHAI recognizes the selected record and stated goal, then asks only for information genuinely missing. |
| Action | The customer sees the effect, destination, cost, timing, disclosure, and reversibility before a consequential action. |
| Waiting | JOHAI shows only real tracked status. It never fills uncertainty with fabricated progress or an unverified response promise. |
| Exception | A calm explanation preserves existing state, names what is known, and gives one safe recovery path. |
| Human help | AI and human authorship are distinct. Handoff is claimed only when notification, assignment, and takeover are operationally verified. |
| Completion | The outcome is confirmed from the authoritative system; unnecessary suggestions disappear. |
| Return | Relevant authorized context can resume without crossing businesses, profiles, purposes, or retention limits. |

### Business moments

| Moment | Required experience |
| --- | --- |
| Start of day | The owner sees material changes, commitments, exceptions, and decisions—not a wall of undifferentiated metrics. |
| Investigation | Evidence, source, time, and affected records are accessible without making the owner reconstruct the story. |
| Decision | Recommendations remain distinguishable from facts. Consequences and alternatives are reviewable before approval. |
| Delegation | Automation or an AI Employee receives a narrow role, permitted tools, limits, and escalation path. |
| Execution | Work changes state only through authorized operations with observable progress and idempotent behavior. |
| Exception | Failure is contained, current state is preserved, and the owner receives a calm recovery choice. |
| Review | The owner can see what happened, who or what initiated it, what evidence supports it, and what still needs attention. |
| Improvement | The system may propose a bounded improvement, but it never changes governance, policy, money, access, or customer commitments by itself. |

## Intelligence: invisible by default, disclosed when material

The best JOHAI experience often removes work without announcing intelligence. Invisibility is appropriate only when it does not hide authorship, consent, risk, or consequence.

### Intelligence may remain invisible when it

- chooses a safe default from current authorized context;
- formats, groups, filters, or prioritizes already visible information;
- carries an authorized record into the next step;
- suppresses a duplicate or irrelevant prompt;
- validates a deterministic input;
- detects that no intervention is useful; or
- restores a user's permitted workspace state without crossing a tenant or profile boundary.

### Intelligence must be disclosed when it

- generates customer- or employee-facing language;
- summarizes, predicts, recommends, or infers;
- prepares a consequential action;
- uses information whose source or freshness affects trust;
- changes data, status, access, money, a customer commitment, or an external system;
- transfers information to a person or provider;
- encounters material uncertainty or conflicting evidence; or
- cannot complete an operation that the user reasonably expects to have occurred.

Disclosure must be useful, not theatrical. Labels such as **AI-assisted**, **Draft**, **Suggested**, **Awaiting approval**, **Completed**, and **Failed** must reflect authoritative state.

## Product behavior

JOHAI should feel:

- **Prepared:** it uses available authorized context and does not make people start over.
- **Calm:** it organizes urgency rather than manufacturing it.
- **Clear:** it shows the current situation, the next decision, and the consequence of acting.
- **Quiet:** it intervenes only when effort or risk will materially decrease.
- **Respectful:** permission precedes personalization; familiarity never exceeds the relationship.
- **Accountable:** facts, suggestions, approvals, actions, and outcomes remain distinguishable.
- **Continuous:** experiences connect across permitted moments without becoming an unlimited memory system.
- **Human-led:** people set goals, grant authority, make high-impact decisions, and can pause or override automation.

## Non-negotiable boundaries

JOHAI must never:

- use a conversational interface as proof of intelligence or a dashboard as proof of control;
- expose implementation language when a business or customer concept is clearer;
- ask for information already available in current authorized context;
- infer permission from context, industry, a route, a feature flag, local state, or model output;
- present a recommendation, draft, queue entry, or request as completed work;
- imply that a person was notified, assigned, or responding without operational evidence;
- impersonate a human, conceal AI authorship, or invent a source;
- optimize engagement, conversion, or automation volume over truth, consent, safety, accessibility, or human control;
- allow one tenant, customer profile, role, or session to influence another; or
- describe Planned behavior as implemented merely because it has been designed.

## Experience success criteria

A JOHAI experience succeeds only when both human perception and system evidence support it.

### Customer outcomes

- Fewer repeated questions and less re-entry of known information.
- Lower time and step count for the intended task.
- Clear understanding of status, authorship, next action, and limitations.
- Successful completion through accessible keyboard, screen-reader, mobile, tablet, and desktop paths.
- Easy refusal, cancellation, correction, and access to an appropriate human channel.
- Zero cross-tenant exposure, fabricated actions, hidden material automation, or unsupported regulated guidance.

### Business outcomes

- Less time spent reconstructing operational context.
- Faster recognition and resolution of material exceptions.
- Recommendations traceable to current evidence.
- Automated work bounded by explicit authority, observable state, and recovery behavior.
- High-impact decisions remain under accountable human control.
- Zero false claims of autonomy, completion, human attention, or customer consent.

### Measurement rules

- Measure successful outcomes, corrections, reversals, unresolved exceptions, and time saved—not only clicks, messages, or automation volume.
- Segment quality by tenant, role, customer journey, industry, locale, accessibility mode, device, and failure state without exposing personal data unnecessarily.
- Treat unsupported claims, cross-tenant access, fabricated completion, unsafe regulated guidance, and concealed material automation as release blockers, not averageable quality defects.
- A feature is not certified because it looks coherent. It requires security, operational, accessibility, localization, performance, failure, and evidence validation.

## Truth status and adoption

This experience constitution is an adopted architecture and product-design rule. It does not by itself implement a contextual engine, AI Employee autonomy, customer-facing AI generation, industry modules, notification delivery, human assignment, or transactional operations.

For every future feature, the team must document:

1. the user and platform layer;
2. the authorized context and forbidden context;
3. the intended feeling and measurable outcome;
4. when intelligence appears and when it remains silent;
5. the human authority and escalation path;
6. the evidence that distinguishes suggestion, approval, execution, and completion;
7. the failure and rollback experience; and
8. whether the capability is **Implemented**, **Partial**, or **Planned**.

No design statement overrides authentication, tenant isolation, RLS, server authorization, database governance, accessibility, or explicit human approval requirements.
