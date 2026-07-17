import { redirect } from "next/navigation";
import {
  getDashboardSetupError,
  isDashboardAuthenticated,
  isDashboardPasswordConfigured,
} from "@/app/lib/dashboard-auth";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  type KnowledgeFile,
  type KnowledgeItem,
  type KnowledgeChunk,
  type KnowledgeProcessingLog,
} from "@/app/lib/supabase";
import KnowledgeClient from "./KnowledgeClient";

export const dynamic = "force-dynamic";

export default async function KnowledgePage() {
  if (!isDashboardPasswordConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08111f] px-6 py-12 text-white">
        <div className="w-full max-w-xl rounded-2xl border border-red-500/30 bg-[#111827] p-8 shadow-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
            Setup Required
          </p>
          <h1 className="text-3xl font-bold">Dashboard password missing</h1>
          <p className="mt-4 leading-7 text-gray-300">
            {getDashboardSetupError()}
          </p>
        </div>
      </main>
    );
  }

  if (!(await isDashboardAuthenticated())) {
    redirect("/dashboard/login");
  }

  const supabase = createSupabaseServerClient();
  const { data, error: itemsError } = await supabase
    .from("knowledge_items")
    .select("*")
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .order("created_at", { ascending: false });
  const { data: files, error: filesError } = await supabase
    .from("knowledge_files")
    .select("*")
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .order("created_at", { ascending: false });
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

  const loadError = itemsError ?? filesError ?? chunksError ?? logsError;
  if (loadError) {
    throw new Error(`Knowledge Center data could not be loaded: ${loadError.message}`);
  }

  return (
    <KnowledgeClient
      initialItems={(data ?? []) as KnowledgeItem[]}
      initialFiles={(files ?? []) as KnowledgeFile[]}
      initialChunks={(chunks ?? []) as KnowledgeChunk[]}
      initialLogs={(logs ?? []) as KnowledgeProcessingLog[]}
    />
  );
}
