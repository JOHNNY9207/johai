"use client";

import type {
  KnowledgeChunk,
  KnowledgeFile,
  KnowledgeProcessingLog,
} from "@/app/lib/supabase";
import { getProcessingStartDecision } from "@/app/lib/knowledge-processing-state";
import KnowledgeDialog from "./KnowledgeDialog";

type Props = {
  file: KnowledgeFile | null;
  chunks: KnowledgeChunk[];
  logs: KnowledgeProcessingLog[];
  versions: KnowledgeFile[];
  onReplace: (file: KnowledgeFile) => void;
  onApprove: (file: KnowledgeFile) => void;
  onClose: () => void;
};

export default function DocumentPreview({
  file,
  chunks,
  logs,
  versions,
  onReplace,
  onApprove,
  onClose,
}: Props) {
  if (!file) return null;

  const fileChunks = chunks
    .filter((chunk) => chunk.knowledge_file_id === file.id)
    .sort((a, b) => a.chunk_index - b.chunk_index);
  const fileLogs = logs.filter((log) => log.knowledge_file_id === file.id);
  const versionHistory = versions
    .filter((version) => version.knowledge_item_id === file.knowledge_item_id)
    .sort((a, b) => (b.version_number ?? 1) - (a.version_number ?? 1));
  const activeVersion = versionHistory.find(
    (version) => version.is_active_version !== false
  );
  const canApproveCurrent =
    file.is_active_version !== false &&
    file.processing_status === "Needs review";
  const canActivateReplacement =
    file.is_active_version === false &&
    (file.processing_status === "Needs review" ||
      file.processing_status === "Ready") &&
    Boolean(activeVersion && file.previous_version_id === activeVersion.id);
  const retryDecision = getProcessingStartDecision(file, {
    allowReadyReprocess: true,
  });

  return (
    <KnowledgeDialog
      open
      title={file.original_filename || file.filename}
      description="Safe plain-text preview of extracted business knowledge."
      onClose={onClose}
    >
      <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <Meta label="Status" value={file.processing_status} />
        <Meta label="Source" value={file.file_type.toUpperCase()} />
        <Meta label="Chunks" value={String(file.chunk_count ?? 0)} />
        <Meta
          label="Version"
          value={`${file.version_number ?? 1}${file.is_active_version === false ? " · Historical" : " · Active"}`}
        />
      </dl>
      <p className="mt-3 text-xs text-slate-500">
        Processing attempts: {file.processing_attempts ?? 0} · Last attempt: {formatTimestamp(file.last_processing_attempt_at)}
      </p>

      {file.processing_error && (
        <div className="mt-5 rounded-2xl border border-rose-300/20 bg-rose-300/10 p-4 text-sm text-rose-100">
          <p className="font-semibold">Processing error</p>
          <p className="mt-1">{file.processing_error}</p>
          <p className="mt-2 text-xs">
            {retryDecision.allowed
              ? "Retry is available."
              : retryDecision.message}
          </p>
        </div>
      )}

      <section className="mt-6">
        <h3 className="font-semibold text-slate-100">Extracted text</h3>
        {fileChunks.length ? (
          <div
            className="mt-3 max-h-80 space-y-3 overflow-y-auto rounded-2xl bg-slate-950/40 p-4"
            aria-label="Extracted document text"
          >
            {fileChunks.map((chunk) => (
              <article
                key={chunk.id}
                className="border-b border-white/10 pb-3 last:border-0"
              >
                <p className="text-xs text-slate-500">
                  {chunk.page_reference ||
                    chunk.section_reference ||
                    `Section ${chunk.chunk_index + 1}`} {" "}
                  · {chunk.token_count} tokens
                </p>
                <pre className="mt-2 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-300">
                  {chunk.content}
                </pre>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No extracted text is available yet. Process or reprocess this source.
          </p>
        )}
      </section>

      <section className="mt-6">
        <h3 className="font-semibold text-slate-100">Version history</h3>
        <ol className="mt-3 space-y-2">
          {versionHistory.map((version) => (
            <li
              key={version.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] p-3 text-sm"
            >
              <span className="min-w-0 truncate text-slate-300">
                Version {version.version_number ?? 1} · {version.original_filename}
              </span>
              <span className="shrink-0 text-xs text-slate-500">
                {version.is_active_version === false
                  ? version.processing_status
                  : "Active"}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6">
        <h3 className="font-semibold text-slate-100">Processing history</h3>
        {fileLogs.length ? (
          <ul className="mt-3 space-y-2">
            {fileLogs.slice(0, 8).map((log) => (
              <li
                key={log.id}
                className="rounded-xl bg-white/[0.04] p-3 text-sm text-slate-400"
              >
                <span className="font-medium text-slate-200">{log.level}</span>
                {" · "}
                {log.message}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-slate-500">
            No processing events recorded.
          </p>
        )}
      </section>

      <div className="mt-6 flex flex-wrap justify-end gap-3">
        {(canApproveCurrent || canActivateReplacement) && (
          <button
            type="button"
            onClick={() => onApprove(file)}
            className="rounded-xl bg-amber-200 px-4 py-2.5 text-sm font-semibold text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            {file.processing_status === "Needs review"
              ? "Approve reviewed version"
              : "Activate this Ready version"}
          </button>
        )}
        {file.is_active_version !== false &&
          file.processing_status === "Ready" && (
            <button
              type="button"
              onClick={() => onReplace(file)}
              className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Replace current version
            </button>
          )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
        >
          Close preview
        </button>
      </div>
    </KnowledgeDialog>
  );
}

function formatTimestamp(value?: string) {
  if (!value) return "Not attempted";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/[0.04] p-3">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 text-slate-200">{value}</dd>
    </div>
  );
}
