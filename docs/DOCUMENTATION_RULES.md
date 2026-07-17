# Documentation Rules

JOHAI documentation is part of the product. A feature is not complete until its behavior, value, risks, and operating implications are recorded.

## Required sprint record

Every feature sprint must document:

- Feature name and objective
- Business value and user problem solved
- Files changed
- Architecture, database, API, UI, security, and billing impact
- Known limitations and testing performed
- Screenshots needed
- Future improvements
- Investor relevance
- Customer explanation
- Technical explanation

Use [SPRINT_TEMPLATE.md](sprints/SPRINT_TEMPLATE.md). Facts must be supported by repository evidence. Mark capabilities as **Implemented**, **Partial**, or **Planned**. Never describe derived metrics as recorded facts or partially automated behavior as fully autonomous.

## JOHAI Constitution requirement

Every feature, UI change, AI behavior, workflow, automation, and interaction must comply with the [JOHAI Constitution](constitution/JOHAI_CONSTITUTION.md). If a proposal fails the [Decision Framework](constitution/DECISION_FRAMEWORK.md) or conflicts with a Constitutional law, implementation stops until the proposal is changed or the Constitution is explicitly amended through a documented architecture review.

The sprint record must identify the affected laws, product values, owning platform layer, primary user and business outcome, effort/trust/friction/context result, accessibility, privacy, security, human authority, failure/recovery behavior, evidence, and truthful status. Constitutional compliance is a design gate, not proof that the capability is implemented.

## Strategic foundation requirement

Every future architectural or product decision must align with the [JOHAI North Star](foundation/JOHAI_NORTH_STAR.md), [JOHAI Manifesto](foundation/JOHAI_MANIFESTO.md), [AI Employee Principles](foundation/AI_EMPLOYEE_PRINCIPLES.md), [Product Promise](foundation/PRODUCT_PROMISE.md), and [Company Values](foundation/COMPANY_VALUES.md), while remaining governed by the Constitution.

Foundation Version 1.0 is **COMPLETE** and **FROZEN**. The canonical corpus is recorded in the [Foundation Index](foundation/FOUNDATION_INDEX.md). A Foundation change requires an explicit user request and the [Foundation Change Policy](foundation/FOUNDATION_CHANGE_POLICY.md); it may not be introduced incidentally through a feature sprint, lower-level manual, implementation, or AI-generated proposal. Do not propose a new strategic-documentation epic unless the user explicitly requests it.

The decision record must identify the strategic objective, promise or value affected, relevant AI Employee and brand constraints, expected customer and business benefit, evidence required, and any tension between long-term ambition and present capability. The Constitution controls any internal product-design conflict. Law, security, privacy, accessibility, explicit human approval, and mandatory database safety remain higher protective requirements.

Foundation and roadmap language is directional. It must never be cited as proof that a feature, market position, customer outcome, international presence, or production capability currently exists.

## Contextual Intelligence requirement

Every new customer-facing feature must follow [JOHAI Contextual Intelligence™](philosophy/CONTEXTUAL_INTELLIGENCE.md). Its permanent rule is: **The AI never asks for information it can already infer from context.**

The feature record must identify the authorized context, intended customer outcome, permission boundary, smallest useful intervention, silence conditions, uncertainty behavior, human-escalation path, fallback, and measurable reduction in effort. The rule is a design obligation and must not be used to imply that a Planned contextual capability already exists.

## Update checklist

1. Update `docs/CHANGELOG.md`.
2. Create or update a sprint record.
3. Update affected manual chapters.
4. Update audience-specific documents when their claims change.
5. Link new documents from `MASTER_INDEX.md` when appropriate.

## Database and security approval records

Every database or security change must be recorded in [Database Change Log](approvals/DATABASE_CHANGE_LOG.md). The record must explain why the change was proposed, the business problem, platform layer, live-schema findings, migration and read-only verification filenames, security and RLS rules, functions, grants and revocations, review risks and corrections, approval and execution facts, verification results, errors, remaining risks, recovery considerations, related documents, related sprint, and the next authorized step.

Use only `Proposed`, `Under review`, `Approved for manual execution`, `Applied`, `Verified`, or `Rejected` as the change status. Use `Pending` whenever the approver, date, execution, verification, error resolution, or result has not been explicitly confirmed.

The existence of a migration file is not completion. A database change is complete only after explicit human approval, manual execution in Supabase, successful execution of its read-only verification SQL, and recorded verification results.

Database and security work must update the changelog, project history, relevant sprint record, technical database and risk chapters, affected architecture/manual/audience chapters, and an ADR when identity, security, multi-tenancy, billing, or platform architecture is affected.
