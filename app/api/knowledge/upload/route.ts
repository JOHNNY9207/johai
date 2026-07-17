import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  type KnowledgeFile,
  type KnowledgeItem,
} from "@/app/lib/supabase";
import {
  KnowledgeUploadError,
  assertKnowledgeUploadRateLimit,
  knowledgeBucketName,
  validateKnowledgeUpload,
} from "@/app/lib/knowledge-upload";

export async function POST(request: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertKnowledgeUploadRateLimit(request);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    const {
      bytes: fileBuffer,
      extension,
      mimeType,
      safeName,
    } = await validateKnowledgeUpload(file);

    const supabase = createSupabaseServerClient();
    const fileId = randomUUID();
    const filename = `${fileId}-${safeName}`;
    const storagePath = `${DEFAULT_BUSINESS_ID}/${fileId}/${filename}`;

    // Storage is the source of truth for raw files; parsing and chunking plug in after this upload succeeds.
    const { error: uploadError } = await supabase.storage
      .from(knowledgeBucketName)
      .upload(storagePath, fileBuffer, {
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
          ingestion_pipeline: "knowledge_center_v2",
          parser: extension,
        },
        ai_learning_status: "Learning queued",
        embedding_status: "not_started",
        knowledge_score: 0,
      })
      .select("*")
      .single();

    if (itemError) {
      await supabase.storage.from(knowledgeBucketName).remove([storagePath]);
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
        processing_status: "Uploaded",
        chunk_count: 0,
      })
      .select("*")
      .single();

    if (fileError) {
      await supabase.storage.from(knowledgeBucketName).remove([storagePath]);
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
    if (error instanceof KnowledgeUploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Knowledge file could not be uploaded." },
      { status: 500 }
    );
  }
}
