<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Documentation requirement

Every future feature sprint must:

1. Update `docs/CHANGELOG.md`.
2. Create or update one sprint record in `docs/sprints/`.
3. Update the relevant product manual chapters.
4. Update investor, customer, and technical documentation when the change affects those audiences.
5. State exactly which documentation files were updated in the final report.

Every new feature must be assigned to one official JOHAI platform layer before implementation: Public Website, Business Workspace, Customer Portal, AI Layer, JOHAI Super Admin, or Developer Platform.

## JOHAI Constitution Policy

Every new feature, UI change, AI behavior, workflow, automation, or interaction must comply with the [JOHAI Constitution](docs/constitution/JOHAI_CONSTITUTION.md).

If a proposal violates the Constitution, implementation must stop until the conflict is resolved. A feature may not be approved by ignoring, weakening, or silently reinterpreting a Constitutional law.

Before implementation, record the owning platform layer, Constitutional laws and product values affected, customer and business outcomes, primary action, context and permission boundaries, accessibility and privacy impact, failure/recovery behavior, human authority, evidence required, status classification, and the completed decision-framework result.

Within JOHAI product governance, the Constitution is the highest design authority. Contextual Intelligence, platform architecture, manuals, feature specifications, components, and implementation decisions are subordinate to it. The Constitution does not override applicable law, security, privacy, accessibility, explicit human approval, or the mandatory database-safety workflow.

Adopting the Constitution changes governance only. It does not authorize application, UI, API, authentication, automation, or database work and does not convert a **Planned** capability into an implemented one.

## JOHAI Foundation Lock

The [JOHAI Foundation](docs/foundation/FOUNDATION_STATUS.md) is **COMPLETE**, locked, and frozen at Version **1.0**.

Every future architecture, product decision, feature, UI change, AI behavior, workflow, automation, interaction, and implementation must comply with:

- the [JOHAI Constitution](docs/constitution/JOHAI_CONSTITUTION.md);
- the [JOHAI North Star](docs/foundation/JOHAI_NORTH_STAR.md);
- the [JOHAI Manifesto](docs/foundation/JOHAI_MANIFESTO.md);
- the [Product Promise](docs/foundation/PRODUCT_PROMISE.md);
- the [Company Values](docs/foundation/COMPANY_VALUES.md);
- the [AI Principles](docs/constitution/AI_PRINCIPLES.md);
- the [UX Principles](docs/constitution/UX_PRINCIPLES.md);
- the [Design Principles](docs/constitution/DESIGN_PRINCIPLES.md);
- [JOHAI Contextual Intelligence™](docs/philosophy/CONTEXTUAL_INTELLIGENCE.md); and
- the Brand System defined by the [Brand Guidelines](docs/foundation/BRAND_GUIDELINES.md) and [Voice and Tone](docs/foundation/VOICE_AND_TONE.md).

The complete locked corpus is listed in the [Foundation Index](docs/foundation/FOUNDATION_INDEX.md). No implementation may violate, weaken, bypass, or silently reinterpret a Foundation document.

The Constitution remains the highest internal product-design authority. The Foundation does not override applicable law, security, privacy, accessibility, explicit human approval, or the mandatory database-safety workflow.

Any Foundation change requires an explicit user request, a documented architectural decision, the reviews required by the affected domain, explicit approval from the designated human authority, versioning, and release validation under the [Foundation Change Policy](docs/foundation/FOUNDATION_CHANGE_POLICY.md). AI may assist analysis but may not request or approve a Foundation change.

Alignment with a mission, promise, value, brand principle, or roadmap does not establish that a capability is implemented, available, certified, or commercially proven. Status claims must still be supported by current repository and operational evidence.

Do not propose another strategic-documentation epic unless the user explicitly requests it. Default future work should focus on Customer Portal Certification, Business Workspace Certification, JOHAI Super Admin, AI Employees, Marketplace, or Business Brain V2.

## Contextual Intelligence Policy

Every new customer-facing feature must follow **JOHAI Contextual Intelligence™**.

The permanent platform rule is:

> The AI never asks for information it can already infer from context.

Before implementation, document the authorized context already available, the customer intent, the smallest useful intervention, the conditions in which AI must remain silent, the permission boundary, the human-escalation path, the fallback when context is incomplete, and the measurable reduction in customer effort.

Customer-facing intelligence may use only information authorized for that customer and workflow. It must never expose CRM internals, Business Brain internals, private notes, internal prompts, billing internals, raw Knowledge Center files, orchestration details, embeddings, vector-search implementation, credentials, or another customer's data.

AI must not interrupt a completed or critical workflow, invent an action or business promise, conceal uncertainty, impersonate a human, or present a suggestion as completed work. AI and human responses must remain distinguishable whenever a response is shown.

Adopting this policy is a design requirement, not evidence that a contextual capability is implemented. Every capability must still be classified as **Implemented**, **Partial**, or **Planned** and complete its normal security, accessibility, validation, and documentation gates.

# SQL Migration Policy

Every SQL migration and every verification SQL file must be saved under:

- supabase/migrations/
- supabase/verification/

Never rely on chat history.

All generated SQL must remain available as project files and always be referenced by filename.

Every migration must have a matching read-only verification SQL file.

No SQL migration may be executed automatically.

Workflow is mandatory:

1. Inspect current schema.
2. Generate migration SQL.
3. Generate verification SQL.
4. Wait for approval.
5. Execute migration only after approval.
6. Execute verification SQL.
7. Continue application development.

# Database Safety Policy

Never execute SQL automatically.

Every database change must follow this workflow:

1. Inspect the live database schema before proposing any change.
2. Generate a versioned migration file under:
   supabase/migrations/
3. Generate a read-only verification SQL file under:
   supabase/verification/
4. Wait for explicit human approval.
5. Apply the migration.
6. Execute the verification SQL.
7. Report the verification results.
8. Only then continue implementation.

Never rely on chat history for SQL.

Every SQL migration and every verification SQL file must exist as project files and always be referenced by filename.

# Database Documentation and Approval Record Policy

Every database or security change must be recorded in `docs/approvals/DATABASE_CHANGE_LOG.md` and in the affected sprint, technical, manual, customer, and investor documentation before implementation continues.

Each record must include the purpose, business problem, platform layer, pre-change live-schema findings, migration and verification filenames, security rules, RLS policies, database functions, grants and revocations, risks, review corrections, approval status, approver, approval date, execution status and date, verification status and results, errors, remaining risks, rollback or recovery considerations, related documentation, related sprint, and next authorized step.

Use only these approval states: `Proposed`, `Under review`, `Approved for manual execution`, `Applied`, `Verified`, or `Rejected`. Use `Pending` for any actor, date, execution fact, verification fact, or result that has not been explicitly confirmed. Never infer or invent those facts.

A database change is not complete merely because SQL files exist or approval was granted. Completion requires explicit human approval, manual execution in Supabase, successful execution of the read-only verification SQL, and recorded verification results.

At minimum, update `docs/CHANGELOG.md`, `docs/PROJECT_HISTORY.md`, the relevant record in `docs/sprints/`, `docs/technical/database.md`, `docs/technical/known-risks.md`, the affected architecture and audience manuals, and an ADR under `docs/decisions/` when identity, security, multi-tenancy, billing, or platform architecture changes.
