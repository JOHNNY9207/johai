# JOHAI Contextual Intelligence™ Philosophy Sprint

## Status

- **Date:** 2026-07-14
- **Sprint type:** Architecture, product design, and permanent governance
- **Implementation status:** Philosophy adopted; runtime capabilities **Planned**
- **Platform scope:** Cross-layer rule for the Public Website, Business Workspace, Customer Portal, AI Layer, JOHAI Super Admin, and Developer Platform
- **Application, UI, API, authentication, or database implementation:** None

## Objective

Define how JOHAI reduces customer effort with permission-aware context instead of becoming another generic chatbot. The intended experience is “the business understands me,” while implementation details and internal systems remain invisible.

## Permanent rule

> The AI never asks for information it can already infer from context.

“Infer” means resolve from authorized, current, relevant, provenance-aware context. It never means guess, stereotype, use another tenant, or retrieve hidden internal information. When a material gap remains, JOHAI asks the smallest necessary clarifying question.

## Business problem

Conventional chat interfaces make customers restate information, navigate away from their task, and learn how the software works. Unbounded AI can also interrupt, overreach, expose internal data, or imply actions that never happened. JOHAI needs one product-wide rule for context, timing, permission, silence, uncertainty, and human takeover before new contextual features are designed.

## Architecture decisions

1. Contextual Intelligence is a cross-layer design contract, not a new platform layer or autonomous agent.
2. The workflow-owning layer resolves actor, tenant, customer/profile, record, source visibility, permissions, business rules, and action authority.
3. The AI Layer receives only the minimized context and capabilities required for the approved interaction.
4. AI appears only when explanation, summarization, translation, drafting, clarification, or a safe recommendation reduces effort.
5. AI remains invisible for deterministic authorization, routing, formatting, validation, prefill, completed workflows, and situations with no useful intervention.
6. Suggestions are distinct from completed actions. Consequential operations require explicit confirmation and deterministic authorization.
7. Human escalation is truthful: recording intent is not proof of notification, assignment, response time, or completion.
8. Missing identity, tenant, permission, source freshness, or authority fails closed.

## Context model

Future context contracts must account for intent, bounded memory, permissions, published business rules, timing, freshness, customer history, document state, appointments, conversation state, required location precision, industry vocabulary, locale, timezone, channel, source, revocation, and completion state.

## Customer-safe boundary

Customer-facing intelligence may use customer-visible information, authorized customer history, shared documents, appointments, messages, and separately published business knowledge for the active tenant and task.

It may not expose CRM internals, Business Brain internals, private notes, internal prompts, billing internals, raw Knowledge Center files or extracted content, orchestration traces, embeddings, vector-search implementation, credentials, storage paths, signed URLs, or another customer or tenant.

## Authoritative artifacts

- [Contextual Intelligence](../philosophy/CONTEXTUAL_INTELLIGENCE.md)
- [Customer Experience Philosophy](../philosophy/CUSTOMER_EXPERIENCE_PHILOSOPHY.md)
- [AI Behavior Guidelines](../philosophy/AI_BEHAVIOR_GUIDELINES.md)
- [Smart Interaction Patterns](../philosophy/SMART_INTERACTION_PATTERNS.md)

## Current implementation truth

JOHAI already has public chat, business knowledge, conversations, appointments, business services, and a tenant-isolated Customer Portal foundation. These are useful building blocks but do not constitute a unified Contextual Intelligence engine.

The typed context envelope, shared resolver, interaction registry, proactive suggestions, smart documents, smart messaging, smart appointments, smart support, contextual payments/orders/reservations/invoices, verified human takeover, fourteen industry scenarios, and outcome instrumentation remain **Planned** unless another authoritative product record explicitly marks a capability Implemented.

## Success measures

Future pilots must establish baselines and report:

- unnecessary questions and repeated fields avoided;
- clicks, typing, steps, and task time reduced;
- suggestion acceptance, successful completion, correction, dismissal, and recovery;
- escalation appropriateness and truthful handoff completion;
- customer satisfaction, accessibility, localization, and trust; and
- zero cross-tenant context, forbidden-source use, secret disclosure, or unauthorized action.

No baseline, target attainment, customer outcome, or commercial result was produced by this documentation sprint.

## Future implementation sequence

1. Inventory customer-visible sources and define typed, provenance-aware context contracts.
2. Implement deterministic permission, freshness, silence, and fallback evaluation.
3. Pilot read-only, reversible suggestions in one existing low-risk workflow.
4. Validate document, message, appointment, profile, and support patterns separately.
5. Prove notification, assignment, takeover, monitoring, abuse controls, and recovery before promising human escalation.
6. Add regulated and transactional patterns only with dedicated security, consent, compliance, and provider contracts.
7. Roll out one industry configuration at a time with tenant, accessibility, localization, safety, and rollback evidence.
8. Certify measurable customer-effort and trust outcomes before claiming production effectiveness.

## Risks

- Treating context as authorization instead of input to an authorized workflow.
- Using stale, revoked, overly broad, or cross-tenant information.
- Interrupting customers or creating automation pressure rather than reducing effort.
- Hiding uncertainty, source limitations, or the difference between suggestion and action.
- Claiming human notification, assignment, regulated advice, or provider completion without operational proof.
- Presenting Planned examples as implemented product capabilities.

## Validation and change boundary

Documentation was reviewed for Implemented/Partial/Planned truth, permission and tenant boundaries, AI/human distinction, silence and escalation rules, industry safety, measurable outcomes, and relative links. No application code, UI, API, authentication, SQL, migration, database state, or Customer Portal implementation was changed. No SQL was executed.

## Next authorized step

Open a separately scoped implementation sprint for one low-risk interaction only. That sprint must identify its owning platform layer, context sources, permission contract, silence rules, consent, fallback, human escalation, accessibility, metrics, tests, and documentation before code is written.
