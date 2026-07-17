import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import { processKnowledgeFile } from "@/app/lib/knowledge-engine";
import {
  SynchronousKnowledgeProcessingQueue,
  type KnowledgeProcessingResult,
} from "@/app/lib/knowledge-processing-queue";
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
      requestId?: string;
    };
    const requestId = body.requestId?.trim();
    if (requestId && requestId.length > 128) {
      return NextResponse.json(
        { error: "The processing request identifier is too long." },
        { status: 400 }
      );
    }
    const supabase = createSupabaseServerClient();
    let query = supabase
      .from("knowledge_files")
      .select("*")
      .eq("business_id", DEFAULT_BUSINESS_ID);

    if (body.fileId) {
      query = query.eq("id", body.fileId);
    } else {
      query = query
        .in("processing_status", ["Uploaded", "Queued", "Failed"])
        .eq("is_active_version", true);
    }

    const { data, error } = await query.order("created_at", {
      ascending: true,
    });

    if (error) {
      throw error;
    }

    const files = (data ?? []) as KnowledgeFile[];
    const results: KnowledgeProcessingResult[] = [];
    const fileById = new Map(files.map((file) => [file.id, file]));
    const queue = new SynchronousKnowledgeProcessingQueue(async (job) => {
      const queuedFile = fileById.get(job.fileId);
      if (!queuedFile) {
        return {
          fileId: job.fileId,
          status: "Failed" as const,
          skipped: true,
          recoverable: false,
          error: "The queued knowledge file was not found.",
        };
      }

      return processKnowledgeFile(supabase, queuedFile, {
        updateKnowledgeItem: queuedFile.is_active_version !== false,
        requestId: job.requestId,
        allowReadyReprocess:
          Boolean(body.fileId) && queuedFile.processing_status === "Ready",
      });
    });

    for (const file of files) {
      try {
        const result = await queue.enqueue({
          fileId: file.id,
          businessId: DEFAULT_BUSINESS_ID,
          requestId: requestId || randomUUID(),
          requestedAt: new Date().toISOString(),
          reason:
            file.processing_status === "Failed"
              ? "retry"
              : file.processing_status === "Ready"
                ? "reprocess"
                : "upload",
        });
        results.push(result);
      } catch (error) {
        results.push({
          fileId: file.id,
          status: "Failed",
          recoverable: true,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      requested: results.length,
      processed: results.filter((result) => !result.skipped).length,
      skipped: results.filter((result) => result.skipped).length,
      queueMode: queue.mode,
      results,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge processing could not run." },
      { status: 500 }
    );
  }
}
