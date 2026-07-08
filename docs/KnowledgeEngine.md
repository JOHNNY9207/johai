# Knowledge Engine

## Purpose
Prepare business-owned documents and knowledge records for future AI use.

## Architecture
Knowledge starts as metadata in `knowledge_items`, uploaded files in `knowledge_files`, and extracted chunks in `knowledge_chunks`. Processing status tracks ingestion readiness.

## Components
Knowledge Center UI, document metadata, Supabase Storage bucket, upload API, file listing API, parser interfaces, chunk generation, and processing logs.

## Current Status
The platform supports knowledge metadata, file upload architecture, file management, status badges, processing pipeline architecture, and chunk storage preparation.

## Future Roadmap
Production document parsing, website crawler, chunk scoring, embedding generation, semantic retrieval, and knowledge freshness alerts.

## Dependencies
Supabase tables, Supabase Storage, Knowledge APIs, and multi-tenant `business_id`.

## Known Limitations
Embeddings are not generated yet, parser integrations are architecture placeholders, and large file processing needs background job infrastructure.
