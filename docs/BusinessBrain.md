# Business Brain

## Purpose
Store and evaluate how each business operates so JOHAI can answer, recommend, audit, and automate with business-specific context.

## Architecture
The Business Brain service builds a snapshot from business data, business settings, brain records, and knowledge items. It computes completeness scores and recommendations.

## Components
Business profile, industry, services, products, pricing, opening hours, languages, tone, target customers, policies, FAQ, booking rules, lead qualification rules, escalation rules, vocabulary, and industry templates.

## Current Status
`app/lib/business-brain.ts` provides scoring, recommendations, industry templates, and vocabulary support. The dashboard displays brain health and recommendations.

## Future Roadmap
Tenant-specific assistant prompts, better templates, vocabulary search, AI-generated missing information detection, semantic memory integration, and audit integration.

## Dependencies
`businesses`, `business_settings`, `business_brains`, `knowledge_items`, and onboarding data.

## Known Limitations
Some recommendations are deterministic, and business rules are not yet enforced across every automated action.
