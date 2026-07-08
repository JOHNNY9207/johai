import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import { processKnowledgeFile } from "@/app/lib/knowledge-engine";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  type KnowledgeFile,
} from "@/app/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data: chunks, error: chunksError } = await supabase
      .from("knowledge_chunks")
      .select("*")
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .order("chunk_index", { ascending: true });
    const { data: logs, error: logsError } = await supabase
      .from("knowledge_processing_logs")
      .select("*")
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .order("created_at", { ascending: false })
      .limit(40);

    if (chunksError || logsError) {
      throw chunksError ?? logsError;
    }

    return NextResponse.json({ chunks: chunks ?? [], logs: logs ?? [] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge processing data could not be loaded." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      fileId?: string;
    };
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("knowledge_files")
      .select("*")
      .eq("business_id", DEFAULT_BUSINESS_ID);

    if (body.fileId) {
      query = query.eq("id", body.fileId);
    } else {
      query = query.in("processing_status", ["Queued", "Failed"]);
    }

    const { data, error } = await query.order("created_at", {
      ascending: true,
    });

    if (error) {
      throw error;
    }

    const files = (data ?? []) as KnowledgeFile[];
    const results = [];

    for (const file of files) {
      try {
        const result = await processKnowledgeFile(supabase, file);
        results.push({ fileId: file.id, status: "Ready", ...result });
      } catch (error) {
        results.push({
          fileId: file.id,
          status: "Failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({ processed: results.length, results });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge processing could not run." },
      { status: 500 }
    );
  }
}
