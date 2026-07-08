# Semantic Memory

## Purpose
Prepare JOHAI to search business knowledge intelligently and later replace placeholder search with vector retrieval.

## Architecture
The design defines interfaces for embedding providers, vector stores, semantic search, memory retrieval, and knowledge retrieval. PostgreSQL full-text search is the current search approach.

## Components
`EmbeddingProvider`, `VectorStore`, `SemanticSearch`, `MemoryRetriever`, `KnowledgeRetriever`, chunk search, and AI Memory dashboard status.

## Current Status
Semantic Memory is architecture-ready and supports full-text search over chunks.

## Future Roadmap
OpenAI embeddings, pgvector storage, hybrid search, reranking, source citation, and retrieval-augmented chatbot answers.

## Dependencies
`knowledge_chunks`, `knowledge_files`, `knowledge_items`, future embedding provider, and future vector store.

## Known Limitations
No external embedding API is called yet. Search quality depends on extracted chunk quality. Vector similarity is not implemented yet.
