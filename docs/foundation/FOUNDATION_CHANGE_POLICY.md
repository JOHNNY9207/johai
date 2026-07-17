# JOHAI Foundation Change Policy

## Purpose

This policy controls every future change to the locked JOHAI Foundation. It protects the coherence of the Constitution, North Star, Manifesto, Product Promise, Company Values, principles, Contextual Intelligence doctrine, brand system, culture, and long-term direction.

- **Current Foundation Version:** 1.0
- **Current status:** COMPLETE and FROZEN
- **Authority:** Subordinate to applicable law, binding obligations, security, privacy, accessibility, explicit human approval, mandatory database safety, and the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md)
- **Change initiation:** Explicit user request required
- **Approval:** Explicit designated human approval required; AI approval is invalid

## Permanent change rule

Foundation documents are not edited as routine documentation maintenance or as a side effect of feature implementation. A proposed change must have an explicit architectural decision before the locked text changes.

No deadline, customer request, sales opportunity, investor narrative, design trend, model capability, implementation convenience, or AI recommendation creates authority to bypass this policy.

## Roles and approval

Every Foundation change record must identify:

- **Requester:** the person explicitly requesting that Foundation work reopen;
- **Proposer:** the person responsible for the exact proposed wording and rationale;
- **Document steward:** the person responsible for consistency, versioning, links, and release records;
- **Affected-domain reviewers:** the human reviewers required by the subject, such as product, architecture, design, AI, security, privacy, accessibility, legal, regulated-domain, operations, customer, or brand reviewers;
- **Final approver:** the human authority designated by JOHAI ownership for the decision; and
- **Implementation owner:** the person responsible for any authorized downstream work.

The decision record must name the actual approver when approval occurs. Names, approval dates, and outcomes must never be inferred or invented. Use `Pending` until explicitly confirmed.

An AI system may analyze evidence, identify contradictions, or draft options. It may not act as requester, final approver, or evidence that human approval occurred.

## Approval matrix

| Change class | Required final approval | Required supporting review |
| --- | --- | --- |
| Correction | Designated human Foundation/architecture authority | Document steward; affected specialist if the corrected fact concerns security, privacy, accessibility, law, database safety, or a regulated domain |
| Clarification | Designated human Foundation/architecture authority | Document steward and every affected product, design, AI, security, privacy, accessibility, legal, operations, customer, or brand reviewer |
| Architectural Change | Designated human architecture authority; explicit JOHAI ownership/user approval when constitutional authority, a protective boundary, or Foundation governance changes | Full affected-domain review, including independent protective reviewers |
| Product Strategy Change | Human authority explicitly designated by JOHAI ownership/user for product strategy | Product, architecture, customer, business, financial, operational, brand, and affected protective-domain review |

The named final approver is accountable for the decision but cannot waive an independent legal, security, privacy, accessibility, human-approval, or database-safety gate. If required approval is absent or disputed, the status remains `Pending` and the locked Foundation does not change.

## Change classifications

### Correction

A Correction repairs an objective defect without changing intent, obligation, authority, scope, priority, or product strategy.

Examples:

- spelling, punctuation, grammar, or formatting;
- a broken relative link or incorrect filename;
- a duplicate paragraph introduced accidentally;
- an objectively wrong cross-reference, date, or version label where the correct fact is already established; or
- accessibility remediation that preserves the exact meaning.

A Correction is not a wording change that makes a rule weaker, broader, narrower, more marketable, or easier to implement.

**Required decision:** A concise Foundation architectural decision identifying the defect, evidence, exact correction, no-meaning-change assessment, and approver.

**Version effect:** Patch version when released, such as `1.0.1`, unless the correction is held for a larger approved release.

### Clarification

A Clarification explains existing intent where reasonable readers could interpret the locked text differently. It may add examples, counterexamples, definitions, or decision guidance, but it cannot create a new principle or change the outcome required by the current Foundation.

Examples:

- defining how an existing principle applies to a new interaction pattern;
- distinguishing two terms already used by the Foundation;
- adding a counterexample that exposes a known misinterpretation; or
- making an existing limit more explicit without changing its scope.

**Required decision:** A Foundation architectural decision containing the ambiguity, competing readings, authoritative interpretation, affected documents, review evidence, and explicit human approval.

**Version effect:** Patch version when meaning and required outcomes remain unchanged; minor version if the clarification materially expands the operating guidance.

### Architectural Change

An Architectural Change modifies authority, platform boundaries, design laws, permission rules, context rules, AI behavior, human-control requirements, brand architecture, governance, or another durable system constraint.

Examples:

- changing a Constitutional law or its precedence;
- changing the relationship between platform layers;
- changing what Contextual Intelligence may infer or expose;
- changing an AI Employee authority or professional boundary;
- changing mandatory accessibility, privacy, security, or human-approval behavior; or
- changing the Foundation change-control process itself.

**Required decision:** A full ADR under `docs/decisions/` with alternatives, constitutional analysis, security/privacy/accessibility and operational impact, migration or compatibility impact, rollback considerations, affected audiences, dissent, evidence, and explicit approval from the designated human architecture authority. Additional specialist approval is mandatory where law, security, privacy, accessibility, database, or regulated work is affected.

**Version effect:** Minor version for a compatible addition or strengthening; major version for changed authority, removed protection, incompatible meaning, or a new strategic identity.

### Product Strategy Change

A Product Strategy Change modifies why JOHAI exists, whom it serves, the Product Promise, Company Values, market direction, long-term priorities, business model direction, or what JOHAI refuses to become.

Examples:

- changing the North Star, Mission, Vision, Manifesto, or Product Promise;
- changing a Company Value or the definition of success;
- changing the priority markets, platform ambition, or ten-year direction;
- adding a strategy that conflicts with an existing refusal or invariant; or
- changing the business/customer relationship JOHAI intends to support.

**Required decision:** An explicit product-strategy decision and, whenever architecture or product-design authority changes, a full ADR. The record must include customer and business evidence, options considered, constitutional fit, risks, financial and operating assumptions, affected roadmap, affected claims, and explicit approval from the human authority designated by JOHAI ownership.

**Version effect:** Minor version for a compatible extension; major version when purpose, promise, values, audience, or durable direction changes materially.

## When a change is justified

A Foundation change may be justified when:

- a verified contradiction or objective defect prevents correct use;
- new law, binding obligation, security, privacy, accessibility, or professional guidance requires a safer rule;
- representative product evidence shows that existing guidance produces material harm, confusion, or failure;
- a durable architecture decision cannot be expressed truthfully under the current Foundation;
- a major product-strategy decision has been explicitly requested and supported by evidence; or
- an existing rule needs clarification to preserve, rather than alter, its intended outcome.

A change is not justified merely to refresh language, follow a trend, match a competitor, make a planned capability sound implemented, reduce review effort, accommodate an unsafe implementation, or create additional strategic-documentation work.

## Proposal and approval sequence

1. **Explicit request:** Record the user's request to reopen Foundation work.
2. **Freeze the baseline:** Identify the current Foundation version and exact affected text.
3. **Classify:** Correction, Clarification, Architectural Change, or Product Strategy Change.
4. **Gather evidence:** Document the problem, source, affected audiences, and why no lower-level solution is sufficient.
5. **Draft the decision:** Record alternatives, consequences, compatibility, risks, and proposed version.
6. **Review:** Obtain all required human domain reviews without weakening independent protective gates.
7. **Approve or reject:** Record the actual final approver, date, and decision. `Pending` is not approval.
8. **Apply narrowly:** Change only the approved documents and dependent references.
9. **Validate:** Check hierarchy, contradictions, links, Markdown, accessibility, status truth, and affected implementation guidance.
10. **Release:** Update `FOUNDATION_STATUS.md`, `FOUNDATION_INDEX.md`, the release record, changelog, project history, Product Fact Sheet, documentation portal, and affected manuals.
11. **Communicate:** State the new version, change class, compatibility, downstream action, and remaining risk.

No application implementation may begin from an unapproved Foundation proposal.

## Versioning

- **Patch (`1.0.1`):** Approved Correction or narrow Clarification with no changed required outcome.
- **Minor (`1.1`):** Compatible approved addition, substantial clarification, or strengthened rule that preserves the Foundation's identity.
- **Major (`2.0`):** Changed purpose, authority, Constitutional meaning, Product Promise, Company Values, or incompatible architecture/product strategy.

Version numbers describe the Foundation corpus, not product release readiness.

## Preservation and rollback

Never silently overwrite Foundation history. Preserve the prior version and decision record in version control and the release history. If an approved change causes an unintended contradiction or unsafe result, stop downstream implementation, document the finding, and use this same policy to approve a correction or rollback.

Rollback does not erase the superseded decision. It records why the previous version was restored and what evidence changed.

## Strategic-documentation stop rule

After Foundation Version 1.0, no new strategic-documentation epic should be proposed by default. Strategic Foundation work resumes only when the user explicitly requests it. Normal future work should focus on scoped product implementation, certification, operations, or the approved development priorities recorded in [Foundation Status](FOUNDATION_STATUS.md).
