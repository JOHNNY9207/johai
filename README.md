# JOHAI

JOHAI is an AI-enabled operating system for owner-led service businesses. It connects customer conversations, trusted business knowledge, lead operations, appointments, and executive decision support while keeping the Public Website, Business Workspace, Customer Portal, AI Layer, JOHAI Super Admin, and Developer Platform explicitly separated.

## Product constitution

The [JOHAI Constitution](docs/constitution/JOHAI_CONSTITUTION.md) is the highest product-design authority for every feature, UI decision, AI behavior, workflow, automation, and interaction. JOHAI should feel like an intelligent business operating system: calm, contextual, trustworthy, and focused on making the represented business successful.

If a proposal does not reduce effort, create trust, remove friction, respect context, and satisfy the Ten Laws, it must not be implemented. Constitutional adoption is a governance change; runtime behavior remains classified as **Implemented**, **Partial**, or **Planned** in the Product Fact Sheet.

## Strategic foundation

The [JOHAI North Star](docs/foundation/JOHAI_NORTH_STAR.md) explains why JOHAI exists and what must still be true in ten years. The [Manifesto](docs/foundation/JOHAI_MANIFESTO.md), [Mission and Vision](docs/foundation/MISSION_AND_VISION.md), [Product Promise](docs/foundation/PRODUCT_PROMISE.md), [Company Values](docs/foundation/COMPANY_VALUES.md), [Brand Guidelines](docs/foundation/BRAND_GUIDELINES.md), [Voice and Tone](docs/foundation/VOICE_AND_TONE.md), [AI Employee Principles](docs/foundation/AI_EMPLOYEE_PRINCIPLES.md), [Culture](docs/foundation/CULTURE.md), and [Long-Term Roadmap](docs/foundation/LONG_TERM_ROADMAP.md) translate that direction for teams and audiences.

These are adopted strategic and brand references beneath the Constitution. They guide decisions but do not, by themselves, implement a feature or prove a customer, commercial, or production outcome.

The Foundation is **COMPLETE**, frozen, and locked at Version **1.0**. See the [Foundation Status](docs/foundation/FOUNDATION_STATUS.md), [official Foundation Index](docs/foundation/FOUNDATION_INDEX.md), [Foundation Change Policy](docs/foundation/FOUNDATION_CHANGE_POLICY.md), and [Foundation V1 Release](docs/releases/FOUNDATION_V1_RELEASE.md). Future changes require an explicit architectural decision and human approval.

## Contextual Intelligence principle

Every new customer-facing feature follows **JOHAI Contextual Intelligence™**:

> The AI never asks for information it can already infer from context.

The goal is to reduce customer effort through timely, permission-aware assistance instead of adding another generic chatbot. The full philosophy is documented in [Contextual Intelligence](docs/philosophy/CONTEXTUAL_INTELLIGENCE.md). The philosophy is an architecture and product-design contract; individual smart interactions remain **Planned** until implemented and validated.

## Documentation

- [Documentation portal](docs/README.md)
- [JOHAI Constitution](docs/constitution/JOHAI_CONSTITUTION.md)
- [JOHAI North Star](docs/foundation/JOHAI_NORTH_STAR.md)
- [JOHAI Manifesto](docs/foundation/JOHAI_MANIFESTO.md)
- [Foundation Version 1.0](docs/foundation/FOUNDATION_STATUS.md)
- [Foundation Index](docs/foundation/FOUNDATION_INDEX.md)
- [Master index](docs/MASTER_INDEX.md)
- [Product fact sheet](docs/PRODUCT_FACT_SHEET.md)
- [Platform architecture](docs/technical/platform-architecture.md)
- [Project history](docs/PROJECT_HISTORY.md)

## Getting started

Install dependencies and run the development server:

```bash
npm ci
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Repository-specific operating and safety rules are in [AGENTS.md](AGENTS.md).

## Validation

```bash
npm run lint
npm run test:portal
npm run build
```
