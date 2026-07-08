# JOHAI Engineering Documentation

## Purpose
Entry point for JOHAI v2 engineering documentation.

## Architecture
JOHAI is a Next.js SaaS platform backed by Supabase. The experience centers on the Command Center and connects CRM, Knowledge Engine, Semantic Memory, Business Brain, AI Orchestrator, Chief of Staff, Audit Engine, Calendly, email, and multi-tenant business ownership.

## Components
- [Product Vision](./ProductVision.md)
- [Roadmap](./Roadmap.md)
- [Architecture](./Architecture.md)
- [Database](./Database.md)
- [API](./API.md)
- [Business Brain](./BusinessBrain.md)
- [Knowledge Engine](./KnowledgeEngine.md)
- [Semantic Memory](./SemanticMemory.md)
- [AI Orchestrator](./AIOrchestrator.md)
- [Chief of Staff](./ChiefOfStaff.md)
- [Audit Engine](./AuditEngine.md)
- [Coding Standards](./CodingStandards.md)
- [Deployment](./Deployment.md)
- [Billing](./Billing.md)
- [Customer Lifecycle](./CustomerLifecycle.md)
- [Changelog](./CHANGELOG.md)

## Current Status
The platform includes dashboard authentication, CRM, Calendly, email notifications, follow-ups, onboarding, Knowledge Center, document ingestion architecture, semantic memory architecture, AI Orchestrator, Business Brain, autonomous audit engine, Morning Brief, Chief of Staff, and JOHAI v2 Command Center.

## Future Roadmap
Split the dashboard into smaller workspace components, complete business user authentication, implement embeddings and vector search, add external communication channels, and add subscription workflows.

## Dependencies
Next.js, React, Tailwind CSS, Supabase, Calendly API, Resend, and existing AI chat infrastructure.

## Known Limitations
Admin authentication is intentionally simple, some AI modules are architecture-first, and the dashboard UI is still concentrated in one large client component.
