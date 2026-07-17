import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_BUSINESS_ID,
  type KnowledgeFile,
  type KnowledgeItem,
} from "@/app/lib/supabase";

export class KnowledgeVersionConflict extends Error {
  readonly status = 409;

  constructor(message: string) {
    super(message);
    this.name = "KnowledgeVersionConflict";
  }
}

async function restoreVersionState(
  supabase: SupabaseClient,
  candidate: KnowledgeFile,
  previous: KnowledgeFile | null,
  originalStatus: KnowledgeFile["processing_status"]
) {
  const rollbackErrors: unknown[] = [];

  if (previous) {
    const { data: activeData, error: activeError } = await supabase
      .from("knowledge_files")
      .select("id")
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .eq("knowledge_item_id", candidate.knowledge_item_id)
      .eq("is_active_version", true);
    if (activeError) {
      rollbackErrors.push(activeError);
    } else {
      const activeVersions = activeData ?? [];
      const previousCanBeRestored =
        activeVersions.length === 0 ||
        (activeVersions.length === 1 &&
          activeVersions[0].id === candidate.id);

      if (previousCanBeRestored) {
        const { data, error } = await supabase
          .from("knowledge_files")
          .update({
            is_active_version: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", previous.id)
          .eq("business_id", DEFAULT_BUSINESS_ID)
          .eq("knowledge_item_id", candidate.knowledge_item_id)
          .eq("is_active_version", false)
          .select("id")
          .maybeSingle();
        if (error) rollbackErrors.push(error);
        if (!error && !data) {
          rollbackErrors.push(
            new Error("Previous knowledge version could not be restored.")
          );
        }
      }
    }
  }

  const { error } = await supabase
    .from("knowledge_files")
    .update({
      processing_status: originalStatus,
      is_active_version: candidate.is_active_version !== false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", candidate.id)
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .eq("knowledge_item_id", candidate.knowledge_item_id);
  if (error) rollbackErrors.push(error);

  if (rollbackErrors.length) {
    console.error("Knowledge version activation rollback was incomplete", rollbackErrors);
  }
}

export async function activateKnowledgeVersion(
  supabase: SupabaseClient,
  fileId: string
) {
  const { data: candidateData, error: candidateError } = await supabase
    .from("knowledge_files")
    .select("*")
    .eq("id", fileId)
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .single();

  if (candidateError || !candidateData) {
    throw candidateError ?? new Error("Knowledge version was not found.");
  }

  const candidate = candidateData as KnowledgeFile;
  const candidateIsActive = candidate.is_active_version !== false;
  const canApproveCurrent =
    candidateIsActive && candidate.processing_status === "Needs review";
  const canActivateReplacement =
    !candidateIsActive &&
    (candidate.processing_status === "Needs review" ||
      candidate.processing_status === "Ready") &&
    Boolean(candidate.previous_version_id);

  if (!canApproveCurrent && !canActivateReplacement) {
    throw new KnowledgeVersionConflict(
      "This document version is not eligible for approval."
    );
  }

  const { data: lineageData, error: lineageError } = await supabase
    .from("knowledge_files")
    .select("*")
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .eq("knowledge_item_id", candidate.knowledge_item_id);

  if (lineageError) throw lineageError;

  const lineage = (lineageData ?? []) as KnowledgeFile[];
  const activeVersions = lineage.filter(
    (version) => version.is_active_version !== false
  );

  if (activeVersions.length !== 1) {
    throw new KnowledgeVersionConflict(
      "The document lineage does not have exactly one active version."
    );
  }

  let previous: KnowledgeFile | null = null;
  if (canActivateReplacement) {
    previous =
      lineage.find(
        (version) =>
          version.id === candidate.previous_version_id &&
          version.is_active_version !== false
      ) ?? null;

    if (
      !previous ||
      activeVersions[0].id !== previous.id ||
      previous.processing_status !== "Ready"
    ) {
      throw new KnowledgeVersionConflict(
        "The active document changed before this replacement could be approved."
      );
    }
  } else if (activeVersions[0].id !== candidate.id) {
    throw new KnowledgeVersionConflict(
      "Another document version is already active."
    );
  }

  const { data: itemData, error: itemError } = await supabase
    .from("knowledge_items")
    .select("*")
    .eq("id", candidate.knowledge_item_id)
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .single();

  if (itemError || !itemData) {
    throw itemError ?? new Error("Knowledge source was not found.");
  }

  const item = itemData as KnowledgeItem;
  const originalStatus = candidate.processing_status;
  const now = new Date().toISOString();
  let candidateQuery = supabase
    .from("knowledge_files")
    .update({
      processing_status: "Ready",
      is_active_version: true,
      updated_at: now,
    })
    .eq("id", candidate.id)
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .eq("knowledge_item_id", candidate.knowledge_item_id)
    .eq("processing_status", originalStatus);

  candidateQuery = candidateIsActive
    ? candidateQuery.eq("is_active_version", true)
    : candidateQuery.eq("is_active_version", false);

  const { data: activatedData, error: activateError } = await candidateQuery
    .select("*")
    .maybeSingle();

  if (activateError) throw activateError;
  if (!activatedData) {
    throw new KnowledgeVersionConflict(
      "The replacement changed before it could be activated."
    );
  }

  if (previous) {
    const { data: deactivatedData, error: deactivateError } = await supabase
      .from("knowledge_files")
      .update({ is_active_version: false, updated_at: now })
      .eq("id", previous.id)
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .eq("knowledge_item_id", candidate.knowledge_item_id)
      .eq("processing_status", "Ready")
      .eq("is_active_version", true)
      .select("id")
      .maybeSingle();

    if (deactivateError || !deactivatedData) {
      await restoreVersionState(
        supabase,
        candidate,
        previous,
        originalStatus
      );
      if (deactivateError) throw deactivateError;
      throw new KnowledgeVersionConflict(
        "The active document changed during replacement activation."
      );
    }
  }

  const { error: updateItemError } = await supabase
    .from("knowledge_items")
    .update({
      title: candidate.original_filename.replace(/\.[^/.]+$/, ""),
      file_name: candidate.filename,
      file_type: candidate.file_type,
      file_size: candidate.file_size,
      metadata: {
        ...(item.metadata ?? {}),
        storage_path: candidate.storage_path,
        original_filename: candidate.original_filename,
        active_file_id: candidate.id,
        ingestion_pipeline: "knowledge_center_v2_versioning",
      },
      ai_learning_status: "Learned",
      embedding_status: "queued",
      updated_at: now,
    })
    .eq("id", candidate.knowledge_item_id)
    .eq("business_id", DEFAULT_BUSINESS_ID);

  if (updateItemError) {
    await restoreVersionState(
      supabase,
      candidate,
      previous,
      originalStatus
    );
    throw updateItemError;
  }

  return activatedData as KnowledgeFile;
}
