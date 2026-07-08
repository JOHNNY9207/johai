import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  type KnowledgeFile,
  type KnowledgeItem,
} from "@/app/lib/supabase";

const bucketName = "knowledge-files";
const allowedExtensions = new Set([
  "pdf",
  "docx",
  "xlsx",
  "pptx",
  "csv",
  "txt",
  "md",
]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/csv",
  "text/plain",
  "text/markdown",
  "application/octet-stream",
]);

function getExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

function safeFilename(filename: string) {
  const cleaned = filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-");

  return cleaned || `knowledge-${Date.now()}`;
}

export async function POST(request: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const extension = getExtension(file.name);
    const mimeType = file.type || "application/octet-stream";

    if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(mimeType)) {
      return NextResponse.json(
        { error: "Unsupported file type." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    const fileId = randomUUID();
    const filename = `${fileId}-${safeFilename(file.name)}`;
    const storagePath = `${DEFAULT_BUSINESS_ID}/${fileId}/${filename}`;

    // Storage is the source of truth for raw files; parsing and chunking plug in after this upload succeeds.
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, await file.arrayBuffer(), {
        contentType: mimeType,
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    // The existing knowledge item remains the human-facing source record for the Knowledge Center.
    const { data: item, error: itemError } = await supabase
      .from("knowledge_items")
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        section: "Documents",
        source_type: "file",
        title: file.name.replace(/\.[^/.]+$/, ""),
        file_name: filename,
        file_type: extension,
        file_size: file.size,
        metadata: {
          storage_path: storagePath,
          original_filename: file.name,
          ingestion_phase: "phase_2_architecture",
          parsers_ready_for: ["pdf", "docx", "xlsx", "pptx", "csv", "txt", "md"],
        },
        ai_learning_status: "Learning queued",
        embedding_status: "not_started",
        knowledge_score: 0,
      })
      .select("*")
      .single();

    if (itemError) {
      await supabase.storage.from(bucketName).remove([storagePath]);
      throw itemError;
    }

    // The file row drives the background processing state machine for Phase 3.
    const { data: knowledgeFile, error: fileError } = await supabase
      .from("knowledge_files")
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        knowledge_item_id: (item as KnowledgeItem).id,
        filename,
        original_filename: file.name,
        file_type: extension,
        mime_type: mimeType,
        file_size: file.size,
        storage_path: storagePath,
        upload_status: "Uploaded",
        processing_status: "Queued",
        chunk_count: 0,
      })
      .select("*")
      .single();

    if (fileError) {
      await supabase.storage.from(bucketName).remove([storagePath]);
      await supabase
        .from("knowledge_items")
        .delete()
        .eq("id", (item as KnowledgeItem).id)
        .eq("business_id", DEFAULT_BUSINESS_ID);
      throw fileError;
    }

    return NextResponse.json({
      status: "Uploaded",
      item: item as KnowledgeItem,
      file: knowledgeFile as KnowledgeFile,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge file could not be uploaded." },
      { status: 500 }
    );
  }
}
