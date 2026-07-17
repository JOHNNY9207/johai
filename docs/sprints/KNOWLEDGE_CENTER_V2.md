# Knowledge Center V2

## Date

July 10, 2026

## Status

Implemented with documented partial capabilities

## Objective

Turn the existing knowledge engineering console into a professional workspace for trusted business sources, reliable extraction, observable processing, safe search, and grounded chat answers.

## Problem Solved

XLSX uploads could be marked ready after binary-text fallback, PDF/DOCX extraction was placeholder-grade, processing mutations could fail silently, search was mislabeled semantic, the search RPC could bypass tenant RLS, and the UI exposed technical scaffolding rather than business workflows.

## Business Value

Businesses can add approved PDF, DOCX, XLSX, CSV, TXT, FAQ, product/service, policy, procedure, and manual sources; see processing failures; preview extracted text; search Ready knowledge; and identify evidence-based content gaps.

## User Experience

The workspace now contains Overview, Sources, Documents, Processing queue, Search, Knowledge gaps, and Settings. Documents have accessible rename/delete/replacement dialogs, preview, reprocess, archive/restore, version history, status, size, dates, chunks, error, and observability fields.

## Features Added

- PDF.js, Mammoth, and ExcelJS extraction
- Quoted CSV parsing and normalized TXT/manual text
- Configurable section-aware chunking
- Size, MIME/extension-pair, signature, and basic rate controls
- Ready, Failed, Needs review, and Archived lifecycle
- Processing duration, attempts, errors, and timestamps
- Keyword search disclosure, source/document filters, citations, and provider status
- Grounded chat retrieval with uncertainty instruction
- Version-ready metadata boundary, activated by the July 11 document-versioning follow-on sprint

## Files Changed

Knowledge APIs, engine, semantic memory, chat, Supabase types, Knowledge Center UI, package manifests, documentation, and one additive migration.

## Architecture Changes

Maintained parsers replace placeholder extraction. Manual sources enter the same storage/extraction/chunk path. OpenAI embeddings have a provider implementation, while keyword search remains active until a vector store is connected.

## Data Model Changes

Added processing observability, archive fields, version-ready fields, chunk character/source/section/page references, unique chunk indexing, extended statuses, and secured RPC execution.

## API Changes

Search accepts source/document filters and returns explicit mode/fallback/provider metadata. File PATCH supports archive, restore, and guarded version approval. Manual creation also creates and processes a text-backed knowledge file. The follow-on versioning sprint added copy-on-write replacement without another migration.

## Security Considerations

Search RPC execution is restricted to the service role; Ready/active/non-archived sources are searched. Uploads are size-, type-, and signature-checked, filenames and storage paths remain scoped, uploaded content is never executed, and previews render plain text only. Malware scanning is not implemented.

## Multi-Tenant Considerations

Database, storage paths, processing, search, archive, and delete operations remain filtered by the active business. The current application still uses `DEFAULT_BUSINESS_ID` and shared dashboard authentication, so production request-scoped tenant resolution remains a risk.

## Billing Considerations

None.

## Testing and Validation

TypeScript, ESLint, and production build. Source upload flows, extraction code paths, status transitions, search filters, archive/delete/reprocess paths, empty states, and tenant filters were statically reviewed.

## Known Limitations

Website crawling is planned. Vector storage and hybrid search are partial. Version replacement/history is active through a guarded multi-step workflow, but database-enforced single-active/version-number uniqueness and transactional activation remain incomplete. Processing runs in request scope rather than a durable job. Parser behavior needs a production fixture suite.

## Remaining Risks

Default-business tenant resolution, service-role scope, lack of malware scanning, limited multilingual search, parser resource exhaustion, dependency advisories, and missing transactional chunk replacement.

## Screenshots Required

Overview, source upload, document library, preview dialog, processing failure, search result, and mobile document card.

## Investor Summary

Knowledge Center V2 strengthens JOHAI's business-memory architecture with real extraction, auditable status, secure retrieval, and grounded chat evidence without overstating semantic search.

## Customer Summary

Customers can upload or enter trusted business information, watch it process, preview what JOHAI learned, search it, and correct gaps or failures.

## Technical Summary

The sprint adds parser dependencies, strict validation, observable schema fields, secure RPC execution, checked mutations, filterable keyword retrieval, and an injectable OpenAI embedding provider.

## Next Recommended Step

Add a durable processing worker, fixture-based parser tests, transactional reprocessing, pgvector storage, hybrid ranking, and request-scoped tenant membership.
