import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import { knowledgeBucketName } from "@/app/lib/knowledge-upload";
import { canMutateKnowledgeFileDuringProcessing } from "@/app/lib/knowledge-processing-state";
import { withKnowledgeOperationLock } from "@/app/lib/knowledge-operation-lock";
import {
  activateKnowledgeVersion,
  KnowledgeVersionConflict,
} from "@/app/lib/knowledge-versioning";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  type KnowledgeFile,
} from "@/app/lib/supabase";

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
    const action = cleanText(body.action);

    if (action === "approve") {
      const supabase = createSupabaseServerClient();
      const file = await activateKnowledgeVersion(supabase, id);
      return NextResponse.json({ file });
    }

    if (action === "archive" || action === "restore") {
      const supabase = createSupabaseServerClient();
      const archived = action === "archive";
      const { data: currentData, error: currentError } = await supabase
        .from("knowledge_files")
        .select("*")
        .eq("id", id)
        .eq("business_id", DEFAULT_BUSINESS_ID)
        .single();
      if (currentError || !currentData) throw currentError;
      let current = currentData as KnowledgeFile;

      return withKnowledgeOperationLock(
        `knowledge:${DEFAULT_BUSINESS_ID}:${current.knowledge_item_id}`,
        async () => {
          const { data: freshData, error: freshError } = await supabase
            .from("knowledge_files")
            .select("*")
            .eq("id", current.id)
            .eq("business_id", DEFAULT_BUSINESS_ID)
            .single();
          if (freshError || !freshData) {
            throw freshError ?? new Error("Knowledge file was not found.");
          }
          current = freshData as KnowledgeFile;

      if (!canMutateKnowledgeFileDuringProcessing(current.processing_status)) {
        return NextResponse.json(
          { error: "A processing document cannot be archived or restored." },
          { status: 409 }
        );
      }

      if (
        (archived && current.processing_status === "Archived") ||
        (!archived && current.processing_status !== "Archived")
      ) {
        return NextResponse.json(
          { error: "The document is already in the requested archive state." },
          { status: 409 }
        );
      }

      if (archived && current.is_active_version !== false) {
        const { data: lineage, error: lineageError } = await supabase
          .from("knowledge_files")
          .select("id")
          .eq("business_id", DEFAULT_BUSINESS_ID)
          .eq("knowledge_item_id", current.knowledge_item_id);
        if (lineageError) throw lineageError;
        if ((lineage ?? []).length > 1) {
          return NextResponse.json(
            {
              error:
                "The active version cannot be archived while version history exists.",
            },
            { status: 409 }
          );
        }
      }

      const { data: file, error } = await supabase
        .from("knowledge_files")
        .update({
          processing_status: archived ? "Archived" : "Queued",
          archived_at: archived ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("business_id", DEFAULT_BUSINESS_ID)
        .eq("processing_status", current.processing_status)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (!file) {
        return NextResponse.json(
          { error: "The document state changed before the archive update." },
          { status: 409 }
        );
      }
          return NextResponse.json({ file: file as KnowledgeFile });
        }
      );
    }

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

    if ((file as KnowledgeFile).is_active_version !== false) {
      const { error: itemError } = await supabase
        .from("knowledge_items")
        .update({
          title: nextName.replace(/\.[^/.]+$/, ""),
          file_name: nextName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", (file as KnowledgeFile).knowledge_item_id)
        .eq("business_id", DEFAULT_BUSINESS_ID);
      if (itemError) throw itemError;
    }

    return NextResponse.json({ file: file as KnowledgeFile });
  } catch (error) {
    console.error(error);
    if (error instanceof KnowledgeVersionConflict) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { error: "Knowledge file could not be updated." },
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

    let knowledgeFile = file as KnowledgeFile;

    return withKnowledgeOperationLock(
      `knowledge:${DEFAULT_BUSINESS_ID}:${knowledgeFile.knowledge_item_id}`,
      async () => {
        const { data: freshData, error: freshError } = await supabase
          .from("knowledge_files")
          .select("*")
          .eq("id", knowledgeFile.id)
          .eq("business_id", DEFAULT_BUSINESS_ID)
          .single();
        if (freshError || !freshData) {
          throw freshError ?? new Error("Knowledge file was not found.");
        }
        knowledgeFile = freshData as KnowledgeFile;

    if (!knowledgeFile.storage_path.startsWith(`${DEFAULT_BUSINESS_ID}/`)) {
      throw new Error("Knowledge storage path does not belong to the active business.");
    }

    if (
      !canMutateKnowledgeFileDuringProcessing(
        knowledgeFile.processing_status
      )
    ) {
      return NextResponse.json(
        { error: "A processing document cannot be deleted." },
        { status: 409 }
      );
    }

    const { data: versionData, error: versionsError } = await supabase
      .from("knowledge_files")
      .select("id, is_active_version")
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .eq("knowledge_item_id", knowledgeFile.knowledge_item_id);
    if (versionsError) throw versionsError;
    const versions = versionData ?? [];

    if (
      knowledgeFile.is_active_version !== false &&
      versions.length > 1
    ) {
      return NextResponse.json(
        {
          error:
            "The active version cannot be deleted while version history exists.",
        },
        { status: 409 }
      );
    }

    const originalStatus = knowledgeFile.processing_status;
    const originalArchivedAt = knowledgeFile.archived_at ?? null;
    let deleteLocked = originalStatus === "Archived";

    if (!deleteLocked) {
      const { data: lockedData, error: lockError } = await supabase
        .from("knowledge_files")
        .update({
          processing_status: "Archived",
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", knowledgeFile.id)
        .eq("business_id", DEFAULT_BUSINESS_ID)
        .eq("knowledge_item_id", knowledgeFile.knowledge_item_id)
        .eq("processing_status", originalStatus)
        .select("id")
        .maybeSingle();
      if (lockError) throw lockError;
      if (!lockedData) {
        return NextResponse.json(
          { error: "The document state changed before deletion." },
          { status: 409 }
        );
      }
      deleteLocked = true;
    }

    if (knowledgeFile.storage_path) {
      const { error: storageError } = await supabase.storage
        .from(knowledgeBucketName)
        .remove([knowledgeFile.storage_path]);
      if (storageError) {
        console.error("Knowledge version storage cleanup failed", storageError);
        if (deleteLocked && originalStatus !== "Archived") {
          await supabase
            .from("knowledge_files")
            .update({
              processing_status: originalStatus,
              archived_at: originalArchivedAt,
              updated_at: new Date().toISOString(),
            })
            .eq("id", knowledgeFile.id)
            .eq("business_id", DEFAULT_BUSINESS_ID)
            .eq("processing_status", "Archived");
        }
        return NextResponse.json(
          { error: "The stored source could not be removed." },
          { status: 502 }
        );
      }
    }

    const deleteOperation =
      versions.length > 1
        ? supabase
            .from("knowledge_files")
            .delete()
            .eq("id", knowledgeFile.id)
            .eq("business_id", DEFAULT_BUSINESS_ID)
        : supabase
            .from("knowledge_items")
            .delete()
            .eq("id", knowledgeFile.knowledge_item_id)
            .eq("business_id", DEFAULT_BUSINESS_ID);
    const { error: deleteError } = await deleteOperation;

    if (deleteError) {
      await supabase
        .from("knowledge_files")
        .update({
          processing_error:
            "The stored source was removed, but metadata cleanup must be retried.",
          updated_at: new Date().toISOString(),
        })
        .eq("id", knowledgeFile.id)
        .eq("business_id", DEFAULT_BUSINESS_ID);
      throw deleteError;
    }

        return NextResponse.json({ deleted: true });
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge file could not be deleted." },
      { status: 500 }
    );
  }
}
