# Semantic Memory

## Purpose
Prepare JOHAI to search business knowledge intelligently and later replace placeholder search with vector retrieval.

## Architecture
The design defines interfaces for embedding providers, vector stores, semantic search, memory retrieval, and knowledge retrieval. PostgreSQL full-text search is the current search approach.

## Components
`EmbeddingProvider`, `VectorStore`, `SemanticSearch`, `MemoryRetriever`, `KnowledgeRetriever`, chunk search, and AI Memory dashboard status.

## Current Status
Semantic Memory supports tenant-scoped full-text search over Ready, active, non-archived chunks. An OpenAI embedding-provider adapter exists, but no production vector store or hybrid ranker is connected.

## Future Roadmap
Persist embeddings, add pgvector storage, hybrid search, reranking, multilingual evaluation, and production retrieval monitoring.

## Dependencies
`knowledge_chunks`, `knowledge_files`, `knowledge_items`, future embedding provider, and future vector store.

## Known Limitations
Active retrieval remains keyword full-text search. Search quality depends on extracted chunk quality, and vector similarity is not implemented yet.
