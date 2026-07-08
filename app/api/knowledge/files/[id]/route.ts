import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  type KnowledgeFile,
} from "@/app/lib/supabase";

const bucketName = "knowledge-files";

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = await request.json();
    const nextName = cleanText(body.filename);

    if (!nextName) {
      return NextResponse.json({ error: "Filename is required." }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // Rename only changes metadata. The storage path remains stable for future parsers and chunks.
    const { data: file, error } = await supabase
      .from("knowledge_files")
      .update({
        filename: nextName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    await supabase
      .from("knowledge_items")
      .update({
        title: nextName.replace(/\.[^/.]+$/, ""),
        file_name: nextName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", (file as KnowledgeFile).knowledge_item_id)
      .eq("business_id", DEFAULT_BUSINESS_ID);

    return NextResponse.json({ file: file as KnowledgeFile });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge file could not be renamed." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const supabase = createSupabaseServerClient();

    const { data: file, error: loadError } = await supabase
      .from("knowledge_files")
      .select("*")
      .eq("id", id)
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .single();

    if (loadError) {
      throw loadError;
    }

    const knowledgeFile = file as KnowledgeFile;

    // Delete storage first, then the metadata graph. Database cascades remove future chunks.
    if (knowledgeFile.storage_path) {
      await supabase.storage.from(bucketName).remove([knowledgeFile.storage_path]);
    }

    const { error: deleteError } = await supabase
      .from("knowledge_items")
      .delete()
      .eq("id", knowledgeFile.knowledge_item_id)
      .eq("business_id", DEFAULT_BUSINESS_ID);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge file could not be deleted." },
      { status: 500 }
    );
  }
}
