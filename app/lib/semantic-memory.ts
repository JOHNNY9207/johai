import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_BUSINESS_ID } from "@/app/lib/supabase";

export type MemorySearchResult = {
  chunk_id: string;
  business_id: string;
  business_name: string;
  knowledge_file_id: string;
  document: string;
  source: string;
  chunk_preview: string;
  score: number;
  created_at?: string;
};

export type MemoryQuery = {
  businessId: string;
  query: string;
  limit?: number;
};

// Phase 4 contract: OpenAI can replace this placeholder without touching routes or UI.
export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

// Phase 4 contract: pgvector or another vector DB can implement this later.
export interface VectorStore {
  upsert(chunkId: string, embedding: number[]): Promise<void>;
  search(embedding: number[], businessId: string, limit: number): Promise<MemorySearchResult[]>;
}

// Search abstraction used by the API. Today it is PostgreSQL full-text search.
export interface SemanticSearch {
  search(query: MemoryQuery): Promise<MemorySearchResult[]>;
}

// MemoryRetriever is the AI-facing read model that later combines vector and keyword memory.
export interface MemoryRetriever {
  retrieve(query: MemoryQuery): Promise<MemorySearchResult[]>;
}

// KnowledgeRetriever is the product-facing read model used by dashboards and tools.
export interface KnowledgeRetriever {
  searchKnowledge(query: MemoryQuery): Promise<MemorySearchResult[]>;
}

export class PlaceholderEmbeddingProvider implements EmbeddingProvider {
  async embed(): Promise<number[]> {
    throw new Error("EmbeddingProvider is not configured yet.");
  }
}

export class PlaceholderVectorStore implements VectorStore {
  async upsert(): Promise<void> {
    throw new Error("VectorStore is not configured yet.");
  }

  async search(): Promise<MemorySearchResult[]> {
    return [];
  }
}

export class PostgresFullTextSemanticSearch implements SemanticSearch {
  constructor(private readonly supabase: SupabaseClient) {}

  async search(query: MemoryQuery) {
    if (!query.query.trim()) {
      return [];
    }

    const { data, error } = await this.supabase.rpc("search_knowledge_chunks", {
      target_business_id: query.businessId,
      search_query: query.query,
      max_results: query.limit ?? 12,
    });

    if (error) {
      throw error;
    }

    return (data ?? []) as MemorySearchResult[];
  }
}

export class DefaultMemoryRetriever implements MemoryRetriever {
  constructor(private readonly semanticSearch: SemanticSearch) {}

  async retrieve(query: MemoryQuery) {
    return this.semanticSearch.search(query);
  }
}

export class DefaultKnowledgeRetriever implements KnowledgeRetriever {
  constructor(private readonly memoryRetriever: MemoryRetriever) {}

  async searchKnowledge(query: MemoryQuery) {
    return this.memoryRetriever.retrieve(query);
  }
}

// Dependency injection root for Phase 4. Phase 5 can swap providers here only.
export function createSemanticMemoryServices(supabase: SupabaseClient) {
  const semanticSearch = new PostgresFullTextSemanticSearch(supabase);
  const memoryRetriever = new DefaultMemoryRetriever(semanticSearch);
  const knowledgeRetriever = new DefaultKnowledgeRetriever(memoryRetriever);

  return {
    embeddingProvider: new PlaceholderEmbeddingProvider(),
    vectorStore: new PlaceholderVectorStore(),
    semanticSearch,
    memoryRetriever,
    knowledgeRetriever,
    defaultBusinessId: DEFAULT_BUSINESS_ID,
  };
}
