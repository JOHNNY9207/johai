import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import { processKnowledgeFile } from "@/app/lib/knowledge-engine";
import { withKnowledgeOperationLock } from "@/app/lib/knowledge-operation-lock";
import {
  KnowledgeUploadError,
  assertKnowledgeUploadRateLimit,
  knowledgeBucketName,
  validateKnowledgeUpload,
} from "@/app/lib/knowledge-upload";
import {
  activateKnowledgeVersion,
  KnowledgeVersionConflict,
} from "@/app/lib/knowledge-versioning";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  type KnowledgeFile,
  type KnowledgeItem,
} from "@/app/lib/supabase";

export const runtime = "nodejs";

function getReplacementRequestId(file: KnowledgeFile) {
  const value = file.source_metadata?.replacement_request_id;
  return typeof value === "string" ? value : "";
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const suppliedRequestId = request.headers.get("idempotency-key")?.trim();
    if (suppliedRequestId && suppliedRequestId.length > 128) {
      return NextResponse.json(
        { error: "The replacement request identifier is too long." },
        { status: 400 }
      );
    }
    const replacementRequestId = suppliedRequestId || randomUUID();

    const supabase = createSupabaseServerClient();
    const { data: currentData, error: currentError } = await supabase
      .from("knowledge_files")
      .select("*")
      .eq("id", id)
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .single();

    if (currentError || !currentData) {
      return NextResponse.json(
        { error: "The current document version was not found." },
        { status: 404 }
      );
    }

    const current = currentData as KnowledgeFile;

    if (!current.storage_path.startsWith(`${DEFAULT_BUSINESS_ID}/`)) {
      return NextResponse.json(
        { error: "The current document storage path is outside the active business." },
        { status: 409 }
      );
    }

    const { data: currentItemData, error: itemLoadError } = await supabase
      .from("knowledge_items")
      .select("*")
      .eq("id", current.knowledge_item_id)
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .single();

    if (itemLoadError || !currentItemData) {
      throw itemLoadError ?? new Error("Current knowledge source was not found.");
    }

    const currentItem = currentItemData as KnowledgeItem;
    const { data: versionData, error: versionError } = await supabase
      .from("knowledge_files")
      .select("*")
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .eq("knowledge_item_id", current.knowledge_item_id);

    if (versionError) throw versionError;

    const versions = (versionData ?? []) as KnowledgeFile[];
    const existingRequest = versions.find(
      (version) =>
        getReplacementRequestId(version) === replacementRequestId
    );

    if (existingRequest) {
      if (
        existingRequest.processing_status === "Ready" &&
        existingRequest.is_active_version === false
      ) {
        const activated = await activateKnowledgeVersion(
          supabase,
          existingRequest.id
        );
        return NextResponse.json({
          file: activated,
          previousFileId: existingRequest.previous_version_id,
          activated: true,
          requiresReview: false,
          idempotentReplay: true,
        });
      }

      if (existingRequest.processing_status === "Failed") {
        return NextResponse.json(
          {
            error:
              existingRequest.processing_error ||
              "This replacement request previously failed.",
          },
          { status: 409 }
        );
      }

      const requiresReview =
        existingRequest.processing_status === "Needs review";
      const activated =
        existingRequest.processing_status === "Ready" &&
        existingRequest.is_active_version !== false;
      return NextResponse.json(
        {
          file: existingRequest,
          previousFileId: existingRequest.previous_version_id,
          activated,
          requiresReview,
          pending: !activated && !requiresReview,
          idempotentReplay: true,
        },
        { status: activated ? 200 : 202 }
      );
    }

    if (
      current.is_active_version === false ||
      current.processing_status !== "Ready"
    ) {
      return NextResponse.json(
        { error: "Only the active Ready document can be replaced." },
        { status: 409 }
      );
    }

    const pendingVersion = versions.find(
      (version) =>
        version.id !== current.id &&
        version.previous_version_id === current.id &&
        version.is_active_version === false &&
        ["Uploaded", "Queued", "Processing", "Needs review", "Ready"].includes(
          version.processing_status
        )
    );

    if (pendingVersion) {
      return NextResponse.json(
        {
          error:
            "A replacement version is already processing or waiting for review.",
        },
        { status: 409 }
      );
    }

    assertKnowledgeUploadRateLimit(request);
    const formData = await request.formData();
    const upload = formData.get("file");

    if (!(upload instanceof File)) {
      return NextResponse.json(
        { error: "A replacement file is required." },
        { status: 400 }
      );
    }

    const { bytes, extension, mimeType, safeName } =
      await validateKnowledgeUpload(upload);
    const slot = await withKnowledgeOperationLock(
      `knowledge:${DEFAULT_BUSINESS_ID}:${current.knowledge_item_id}`,
      async () => {
        const { data: freshCurrentData, error: freshCurrentError } =
          await supabase
            .from("knowledge_files")
            .select("*")
            .eq("id", current.id)
            .eq("business_id", DEFAULT_BUSINESS_ID)
            .eq("knowledge_item_id", current.knowledge_item_id)
            .single();
        if (freshCurrentError || !freshCurrentData) {
          throw freshCurrentError ?? new Error("Active document was not found.");
        }
        const freshCurrent = freshCurrentData as KnowledgeFile;

        const { data: freshVersionData, error: freshVersionError } =
          await supabase
            .from("knowledge_files")
            .select("*")
            .eq("business_id", DEFAULT_BUSINESS_ID)
            .eq("knowledge_item_id", current.knowledge_item_id);
        if (freshVersionError) throw freshVersionError;
        const freshVersions = (freshVersionData ?? []) as KnowledgeFile[];
        const replay = freshVersions.find(
          (version) =>
            getReplacementRequestId(version) === replacementRequestId
        );
        if (replay) return { replacement: replay, created: false };

        if (
          freshCurrent.is_active_version === false ||
          freshCurrent.processing_status !== "Ready"
        ) {
          throw new KnowledgeVersionConflict(
            "The active document changed before replacement staging."
          );
        }

        const unresolvedChild = freshVersions.find(
          (version) =>
            version.previous_version_id === freshCurrent.id &&
            version.is_active_version === false &&
            [
              "Uploaded",
              "Queued",
              "Processing",
              "Needs review",
              "Ready",
            ].includes(version.processing_status)
        );
        if (unresolvedChild) {
          throw new KnowledgeVersionConflict(
            "A replacement version is already processing or waiting for review."
          );
        }

        const nextVersion =
          Math.max(
            freshCurrent.version_number ?? 1,
            ...freshVersions.map((version) => version.version_number ?? 1)
          ) + 1;
        const replacementId = randomUUID();
        const filename = `${replacementId}-${safeName}`;
        const storagePath = `${DEFAULT_BUSINESS_ID}/${replacementId}/${filename}`;
        const { error: uploadError } = await supabase.storage
          .from(knowledgeBucketName)
          .upload(storagePath, bytes, { contentType: mimeType, upsert: false });
        if (uploadError) throw uploadError;

        const { data: replacementData, error: replacementError } =
          await supabase
            .from("knowledge_files")
            .insert({
              id: replacementId,
              business_id: DEFAULT_BUSINESS_ID,
              knowledge_item_id: freshCurrent.knowledge_item_id,
              filename,
              original_filename: upload.name,
              file_type: extension,
              mime_type: mimeType,
              file_size: upload.size,
              storage_path: storagePath,
              upload_status: "Uploaded",
              processing_status: "Uploaded",
              chunk_count: 0,
              source_metadata: {
                source_type: currentItem.source_type,
                replaces_file_id: freshCurrent.id,
                replacement_request_id: replacementRequestId,
              },
              version_number: nextVersion,
              is_active_version: false,
              previous_version_id: freshCurrent.id,
            })
            .select("*")
            .single();

        if (replacementError || !replacementData) {
          await supabase.storage
            .from(knowledgeBucketName)
            .remove([storagePath]);
          throw (
            replacementError ??
            new Error("Replacement version could not be created.")
          );
        }

        return {
          replacement: replacementData as KnowledgeFile,
          created: true,
        };
      }
    );
    const replacement = slot.replacement;

    if (!slot.created) {
      if (replacement.processing_status === "Failed") {
        return NextResponse.json(
          {
            error:
              replacement.processing_error ||
              "This replacement request previously failed.",
          },
          { status: 409 }
        );
      }
      const activated =
        replacement.processing_status === "Ready" &&
        replacement.is_active_version !== false;
      const requiresReview =
        replacement.processing_status === "Needs review";
      return NextResponse.json(
        {
          file: replacement,
          previousFileId: replacement.previous_version_id,
          activated,
          requiresReview,
          pending: !activated && !requiresReview,
          idempotentReplay: true,
        },
        { status: activated ? 200 : 202 }
      );
    }

    const processing = await processKnowledgeFile(supabase, replacement, {
      updateKnowledgeItem: false,
      requestId: replacementRequestId,
    });

    if (processing.status === "Failed") {
      const { data: failedData } = await supabase
        .from("knowledge_files")
        .select("*")
        .eq("id", replacement.id)
        .eq("business_id", DEFAULT_BUSINESS_ID)
        .maybeSingle();
      return NextResponse.json(
        {
          error: processing.error || "Replacement processing failed.",
          file: (failedData as KnowledgeFile | null) ?? replacement,
          previousFileId: current.id,
          activated: false,
          requiresReview: false,
          recoverable: processing.recoverable,
        },
        { status: 422 }
      );
    }

    if (processing.skipped && processing.status !== "Ready") {
      return NextResponse.json(
        {
          error:
            processing.error || "Replacement processing did not complete.",
          file: replacement,
          previousFileId: current.id,
          activated: false,
          requiresReview: false,
          pending: processing.status === "Processing",
        },
        { status: processing.status === "Processing" ? 202 : 409 }
      );
    }

    const activatedFile =
      processing.status === "Ready"
        ? await activateKnowledgeVersion(supabase, replacement.id)
        : null;
    let finalData: KnowledgeFile = activatedFile ?? replacement;

    if (!activatedFile) {
      const { data, error: finalError } = await supabase
        .from("knowledge_files")
        .select("*")
        .eq("id", replacement.id)
        .eq("business_id", DEFAULT_BUSINESS_ID)
        .single();
      if (finalError) throw finalError;
      finalData = data as KnowledgeFile;
    }

    return NextResponse.json(
      {
        file: finalData,
        previousFileId: current.id,
        activated: Boolean(activatedFile),
        requiresReview: processing.status === "Needs review",
      },
      { status: processing.status === "Needs review" ? 202 : 201 }
    );
  } catch (error) {
    console.error(error);

    if (error instanceof KnowledgeUploadError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    if (error instanceof KnowledgeVersionConflict) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "The document replacement could not be completed." },
      { status: 500 }
    );
  }
}
