import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import { createSemanticMemoryServices } from "@/app/lib/semantic-memory";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
} from "@/app/lib/supabase";

export async function GET(request: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get("q") ?? "";
    const source = (url.searchParams.get("source") ?? "").trim().toLowerCase();
    const documentId = (url.searchParams.get("document") ?? "").trim();
    const requestedLimit = Number(url.searchParams.get("limit") ?? 12);
    const limit = Number.isFinite(requestedLimit)
      ? Math.max(1, Math.min(50, requestedLimit))
      : 12;

    if (!query.trim()) {
      return NextResponse.json({ results: [], mode: "keyword", fallbackActive: true });
    }

    const supabase = createSupabaseServerClient();
    const services = createSemanticMemoryServices(supabase);

    // Business isolation stays at the retriever boundary and inside the SQL function.
    const results = await services.knowledgeRetriever.searchKnowledge({
      businessId: DEFAULT_BUSINESS_ID,
      query,
      limit: source || documentId ? 50 : limit,
    });

    const chunkIds = results.map((result) => result.chunk_id);
    const { data: references, error: referencesError } = chunkIds.length
      ? await supabase
          .from("knowledge_chunks")
          .select("id, section_reference, page_reference")
          .eq("business_id", DEFAULT_BUSINESS_ID)
          .in("id", chunkIds)
      : { data: [], error: null };
    if (referencesError) throw referencesError;
    const referenceMap = new Map(
      (references ?? []).map((reference) => [reference.id, reference])
    );
    const enriched = results.map((result) => ({
      ...result,
      section_reference: referenceMap.get(result.chunk_id)?.section_reference ?? "",
      page_reference: referenceMap.get(result.chunk_id)?.page_reference ?? "",
    }));

    const filtered = enriched
      .filter((result) => !source || result.source.toLowerCase() === source)
      .filter((result) => !documentId || result.knowledge_file_id === documentId)
      .slice(0, limit);

    return NextResponse.json({
      results: filtered,
      mode: services.searchMode,
      fallbackActive: true,
      embeddings: services.embeddingProviderStatus,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge memory search failed." },
      { status: 500 }
    );
  }
}
