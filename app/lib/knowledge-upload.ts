import "server-only";

export const knowledgeBucketName = "knowledge-files";
export const maxKnowledgeFileSize = 25 * 1024 * 1024;
const uploadWindows = new Map<string, { count: number; resetAt: number }>();
const uploadWindowMs = 10 * 60 * 1000;
const maxUploadsPerWindow = 20;

const allowedTypes: Record<string, Set<string>> = {
  pdf: new Set(["application/pdf"]),
  docx: new Set([
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]),
  xlsx: new Set([
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ]),
  csv: new Set(["text/csv", "text/plain", "application/vnd.ms-excel"]),
  txt: new Set(["text/plain"]),
};

export function getKnowledgeFileExtension(filename: string) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}

export function sanitizeKnowledgeFilename(filename: string) {
  const cleaned = filename
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-");

  return cleaned || `knowledge-${Date.now()}`;
}

function hasExpectedSignature(extension: string, bytes: Uint8Array) {
  if (extension === "pdf") {
    return new TextDecoder("ascii").decode(bytes.slice(0, 5)) === "%PDF-";
  }

  if (extension === "docx" || extension === "xlsx") {
    return bytes[0] === 0x50 && bytes[1] === 0x4b;
  }

  return !bytes.slice(0, 4096).some((value) => value === 0);
}

export async function validateKnowledgeUpload(file: File) {
  const extension = getKnowledgeFileExtension(file.name);
  const mimeType = file.type || "application/octet-stream";

  if (!allowedTypes[extension]?.has(mimeType)) {
    throw new KnowledgeUploadError(
      "The file extension and MIME type do not match a supported source.",
      400
    );
  }

  if (file.size <= 0 || file.size > maxKnowledgeFileSize) {
    throw new KnowledgeUploadError(
      "Files must contain data and be no larger than 25 MB.",
      413
    );
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  if (!hasExpectedSignature(extension, bytes)) {
    throw new KnowledgeUploadError(
      "The file signature does not match its declared type.",
      400
    );
  }

  return {
    bytes,
    extension,
    mimeType,
    safeName: sanitizeKnowledgeFilename(file.name),
  };
}

export function assertKnowledgeUploadRateLimit(request: Request) {
  const forwardedFor = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const clientKey = forwardedFor || "dashboard-session";
  const now = Date.now();
  const currentWindow = uploadWindows.get(clientKey);
  const windowState =
    !currentWindow || currentWindow.resetAt <= now
      ? { count: 0, resetAt: now + uploadWindowMs }
      : currentWindow;

  if (windowState.count >= maxUploadsPerWindow) {
    throw new KnowledgeUploadError(
      "Upload limit reached. Try again after the current ten-minute window.",
      429
    );
  }

  windowState.count += 1;
  uploadWindows.set(clientKey, windowState);
}

export class KnowledgeUploadError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = "KnowledgeUploadError";
  }
}
