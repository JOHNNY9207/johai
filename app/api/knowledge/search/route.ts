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
    const limit = Number(url.searchParams.get("limit") ?? 12);

    if (!query.trim()) {
      return NextResponse.json({ results: [] });
    }

    const supabase = createSupabaseServerClient();
    const services = createSemanticMemoryServices(supabase);

    // Business isolation stays at the retriever boundary and inside the SQL function.
    const results = await services.knowledgeRetriever.searchKnowledge({
      businessId: DEFAULT_BUSINESS_ID,
      query,
      limit: Number.isFinite(limit) ? limit : 12,
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge memory search failed." },
      { status: 500 }
    );
  }
}
