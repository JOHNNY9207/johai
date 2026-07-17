export const maxKnowledgeProcessingAttempts = 5;

export type KnowledgeProcessingState =
  | "Uploaded"
  | "Queued"
  | "Processing"
  | "Ready"
  | "Failed"
  | "Needs review"
  | "Archived";

export type KnowledgeProcessingFailureCode =
  | "timeout"
  | "unsupported_file"
  | "empty_extraction"
  | "storage_unavailable"
  | "tenant_violation"
  | "processing_error";

export type KnowledgeProcessingFailure = {
  code: KnowledgeProcessingFailureCode;
  message: string;
  recoverable: boolean;
};

type ProcessingCandidate = {
  processing_status: KnowledgeProcessingState;
  processing_attempts?: number;
  source_metadata?: Record<string, unknown>;
};

export type ProcessingStartDecision =
  | { allowed: true }
  | {
      allowed: false;
      code:
        | "already_processing"
        | "already_ready"
        | "archived"
        | "non_recoverable_failure"
        | "retry_limit";
      message: string;
      recoverable: boolean;
    };

export function getProcessingStartDecision(
  file: ProcessingCandidate,
  options: { allowReadyReprocess?: boolean } = {}
): ProcessingStartDecision {
  if (file.processing_status === "Processing") {
    return {
      allowed: false,
      code: "already_processing",
      message: "This document is already processing.",
      recoverable: true,
    };
  }

  if (file.processing_status === "Archived") {
    return {
      allowed: false,
      code: "archived",
      message: "Archived documents cannot be processed.",
      recoverable: false,
    };
  }

  if (
    file.processing_status === "Ready" &&
    options.allowReadyReprocess !== true
  ) {
    return {
      allowed: false,
      code: "already_ready",
      message: "This document is already Ready.",
      recoverable: false,
    };
  }

  const failure = file.source_metadata?.processing_failure;
  if (
    file.processing_status === "Failed" &&
    failure &&
    typeof failure === "object" &&
    "recoverable" in failure &&
    failure.recoverable === false
  ) {
    return {
      allowed: false,
      code: "non_recoverable_failure",
      message:
        "This failure requires the source to be corrected or replaced before retrying.",
      recoverable: false,
    };
  }

  if ((file.processing_attempts ?? 0) >= maxKnowledgeProcessingAttempts) {
    return {
      allowed: false,
      code: "retry_limit",
      message:
        "The automatic retry limit was reached. Review the source before trying again.",
      recoverable: false,
    };
  }

  return { allowed: true };
}

export function isKnowledgeRetryEligible(file: ProcessingCandidate) {
  return getProcessingStartDecision(file).allowed;
}

export function canMutateKnowledgeFileDuringProcessing(
  state: KnowledgeProcessingState
) {
  return state !== "Processing";
}

export function classifyKnowledgeProcessingFailure(
  error: unknown
): KnowledgeProcessingFailure {
  const message =
    error instanceof Error ? error.message : "Unknown processing error.";
  const normalized = message.toLowerCase();

  if (normalized.includes("30-second safety limit")) {
    return { code: "timeout", message, recoverable: true };
  }

  if (normalized.includes("unsupported document parser")) {
    return { code: "unsupported_file", message, recoverable: false };
  }

  if (normalized.includes("no usable text")) {
    return { code: "empty_extraction", message, recoverable: false };
  }

  if (normalized.includes("does not belong") || normalized.includes("outside")) {
    return { code: "tenant_violation", message, recoverable: false };
  }

  if (
    normalized.includes("storage download") ||
    normalized.includes("storage object")
  ) {
    return { code: "storage_unavailable", message, recoverable: true };
  }

  return { code: "processing_error", message, recoverable: true };
}

export function getProcessingAttemptId(
  metadata?: Record<string, unknown>
) {
  const value = metadata?.processing_attempt_id;
  return typeof value === "string" ? value : "";
}

export function isCurrentProcessingAttempt(
  file: {
    processing_status: KnowledgeProcessingState;
    source_metadata?: Record<string, unknown>;
  },
  attemptId: string
) {
  return (
    file.processing_status === "Processing" &&
    getProcessingAttemptId(file.source_metadata) === attemptId
  );
}
