# AI Systems

AI systems include chat, semantic-memory services, orchestration, Business Brain, audit, Morning Brief, and Chief of Staff. Some systems are deterministic and should not be described as unrestricted autonomous agents.

## Constitutional AI boundary

All AI systems are subordinate to the [JOHAI Constitution](../constitution/JOHAI_CONSTITUTION.md) and [AI Principles](../constitution/AI_PRINCIPLES.md). They may support understanding and accountable work, but they do not own identity, tenant scope, permission, business policy, human authority, or deterministic execution.

An AI capability must never hallucinate, pretend, manipulate, pressure, fake confidence, hide material uncertainty, or continue after its value or authority ends. AI and human authorship remain distinguishable. The business—not the model or JOHAI—is the hero presented to customers.

## AI Employee operating standard

The [AI Employee Principles](../foundation/AI_EMPLOYEE_PRINCIPLES.md) define the permanent role standard beneath the Constitution: every AI Employee must know its role and limits, respect permissions, reduce work, explain material uncertainty, act consistently, and escalate naturally without faking expertise or exposing internal systems. Role names such as Receptionist, Sales, Support, Legal, Medical, Accounting, CEO Assistant, Operations, and Recruiting describe bounded responsibility patterns; they never create professional authority, identity, tenant access, or permission.

The [Product Promise](../foundation/PRODUCT_PROMISE.md), [Voice and Tone](../foundation/VOICE_AND_TONE.md), and [Company Values](../foundation/COMPANY_VALUES.md) also apply to AI output and evaluation. Adoption of these standards does not implement an autonomous AI Employee runtime; each capability remains subject to its current evidence and deterministic execution contract.

## Status discipline

See [Product Fact Sheet](../PRODUCT_FACT_SHEET.md) for Implemented, Partial, and Planned classifications. Update this chapter when the corresponding product behavior changes.

## Contextual Intelligence™ contract

[JOHAI Contextual Intelligence™](../philosophy/CONTEXTUAL_INTELLIGENCE.md) is a cross-cutting design contract, not a new autonomous agent. Each owning platform layer remains responsible for authentication, tenant resolution, customer-visible data, consent, UI, and the final operation. The AI Layer may interpret or suggest only within the capabilities and context explicitly granted by that workflow.

A bounded typed context snapshot is now implemented for Customer Portal V1. It contains:

- the active business/customer-profile tuple and explicit access state;
- the active customer profile and published branding;
- customer-visible appointments, messages, current document metadata, acknowledgements, and requests;
- typed source, insight, suggestion, action, escalation, confidence, and policy records; and
- one explicit reference time, output limits, visible-source allowlist, confidence wording, and silence conditions.

Snapshot construction discards any record whose business or customer profile does not match the active tuple. Expired, inactive, suspended, unavailable, revoked, completed, or unsupported states remain silent. This deterministic engine supports dashboard, appointment, profile, and support guidance in authenticated production and the demo. It does not own authentication or replace RLS.

Customer Portal document and message generation use a separate provider contract. Authenticated production receives a fail-closed unavailable provider. The development-only demo receives deterministic fictional outputs for document help, suggested replies, and draft rewriting, with source and source-of-truth notices, regulated-answer refusal, and truthful escalation wording. The demo provider uses no Supabase, Auth, OpenAI, or external data service. Suggested output never sends automatically.

The decision sequence remains authorize → assemble → minimize → validate freshness → infer intent → decide whether to stay silent → propose the smallest useful intervention → validate output/action → request confirmation when needed → record sanitized outcome evidence. Configuration, an industry label, a model response, a browser snapshot, or client state can never grant permission.

The Portal V1 snapshot, policy, deterministic evaluators, provider interface, and demo interactions are **Implemented** for their bounded scope. A shared cross-platform resolver, production generative provider, approved customer-visible knowledge publication/retrieval, production document-content processing, interaction registry, operational human takeover, and outcome instrumentation remain **Planned**. Existing chat and AI services remain governed by their own contracts until each integration is explicitly implemented and tested.
