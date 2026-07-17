# Database

## Purpose
Summarize the Supabase data model used by JOHAI.

## Architecture
The schema is migration-driven. Migrations cover lead management, Calendly, email status, follow-ups, multi-tenant businesses, RLS ownership preparation, onboarding, knowledge, document ingestion, semantic memory, AI orchestration, Business Brain, and audits.

## Components
`businesses`, `business_settings`, `leads`, Calendly settings, `knowledge_items`, `knowledge_files`, `knowledge_chunks`, processing logs, orchestration logs, `business_brains`, and `audits`.

## Current Status
Existing data is preserved through additive migrations. Current leads are assigned to the default JOHAI business. Knowledge and AI records include `business_id` for tenant isolation. Knowledge files include processing evidence and `version_number`, `is_active_version`, and `previous_version_id`; the active replacement workflow uses those verified fields without another migration.

## Future Roadmap
Complete Supabase Auth ownership with `auth.uid()`, strengthen RLS, add transaction-backed version allocation/activation constraints, add pgvector embeddings, add business memberships/roles, and add billing tables.

## Dependencies
Supabase SQL migrations, Supabase service client, and future RLS policies.

## Known Limitations
Singleton settings logic evolved over time and should be audited before production. Embeddings are not yet stored as vectors.
