# Semantic Memory

## Current search behavior

JOHAI currently uses tenant-scoped PostgreSQL full-text keyword search over Ready, active, non-archived chunks. Uploaded, Queued, Processing, pending replacements, review-required versions, failed versions, archived versions, and historical versions are excluded, so partial or stale extraction cannot become searchable. The UI and API label this as keyword fallback, return ranked relevance, support source/document filters, and provide document citations.

## Embedding architecture

An injectable OpenAI embedding provider is implemented and reports whether configuration is available. Vector storage and hybrid semantic/keyword ranking are not connected, so current results are never labeled semantic.

## Security

The search RPC is executable only by the service role and does not return raw storage paths as citations. Server routes fix the active business ID and filter all results by that business.

## Planned

Persist embeddings, add pgvector or another replaceable vector store, implement hybrid ranking, add multilingual retrieval, and evaluate relevance with a labeled test set.
