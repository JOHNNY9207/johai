# Knowledge Engine

## Purpose
Prepare business-owned documents and knowledge records for future AI use.

## Architecture
Knowledge starts as metadata in `knowledge_items`, uploaded files in `knowledge_files`, and extracted chunks in `knowledge_chunks`. Processing status tracks ingestion readiness.

## Components
Knowledge Center UI, document metadata, Supabase Storage bucket, upload API, file listing API, parser interfaces, chunk generation, and processing logs.

## Current Status
The platform supports validated private uploads, maintained PDF/DOCX/XLSX/CSV/TXT extraction, manual-source processing, overlapping chunks, observable processing, safe preview, keyword retrieval, copy-on-write replacement, guarded approval, and inspectable version history.

## Future Roadmap
Durable processing jobs, transaction-backed version allocation and activation, website crawling, vector persistence, hybrid semantic retrieval, and knowledge freshness alerts.

## Dependencies
Supabase tables, Supabase Storage, Knowledge APIs, and multi-tenant `business_id`.

## Known Limitations
Vector persistence and ranking are not connected, processing remains request-scoped, version activation is multi-step rather than transactional, and large-file processing needs background job infrastructure.
