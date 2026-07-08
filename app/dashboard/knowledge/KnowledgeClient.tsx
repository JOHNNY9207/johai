"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  Bot,
  ChevronLeft,
  Database,
  Download,
  File,
  FileSpreadsheet,
  FileText,
  Globe2,
  Layers3,
  ListChecks,
  PackageOpen,
  Pencil,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import {
  knowledgeProcessingStatuses,
  knowledgeSections,
  type KnowledgeChunk,
  type KnowledgeFile,
  type KnowledgeItem,
  type KnowledgeProcessingLog,
  type KnowledgeProcessingStatus,
  type KnowledgeSection,
} from "@/app/lib/supabase";
import type { LucideIcon } from "lucide-react";
import type { MemorySearchResult } from "@/app/lib/semantic-memory";

type KnowledgeClientProps = {
  initialItems: KnowledgeItem[];
  initialFiles: KnowledgeFile[];
  initialChunks: KnowledgeChunk[];
  initialLogs: KnowledgeProcessingLog[];
};

type UploadQueueItem = {
  id: string;
  name: string;
  status: "Uploading" | "Uploaded" | "Failed";
  detail: string;
};

type SortMode = "newest" | "oldest" | "name" | "size";

const allowedExtensions = [
  ".pdf",
  ".docx",
  ".xlsx",
  ".pptx",
  ".csv",
  ".txt",
  ".md",
];

const sectionIcons: Record<KnowledgeSection, LucideIcon> = {
  Documents: FileText,
  "Website Import": Globe2,
  FAQ: BookOpen,
  Products: PackageOpen,
  Procedures: ListChecks,
  Policies: ShieldCheck,
};

const statusStyles: Record<KnowledgeProcessingStatus, string> = {
  Queued: "border-sky-300/25 bg-sky-300/10 text-sky-100",
  Processing: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  Ready: "border-emerald-300/25 bg-emerald-300/10 text-emerald-100",
  Failed: "border-red-300/25 bg-red-300/10 text-red-100",
};

function formatDate(date?: string) {
  if (!date) return "No date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatFileSize(size?: number) {
  if (!size) return "Manual entry";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function inputClass() {
  return "w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10";
}

function getFileIcon(fileType?: string) {
  if (fileType?.includes("xls") || fileType?.includes("csv")) {
    return FileSpreadsheet;
  }

  if (fileType?.includes("txt") || fileType?.includes("md")) {
    return FileText;
  }

  return File;
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function KnowledgeClient({
  initialItems,
  initialFiles,
  initialChunks,
  initialLogs,
}: KnowledgeClientProps) {
  const [items, setItems] = useState(initialItems);
  const [files, setFiles] = useState(initialFiles);
  const [chunks, setChunks] = useState(initialChunks);
  const [logs, setLogs] = useState(initialLogs);
  const [activeSection, setActiveSection] =
    useState<KnowledgeSection>("Documents");
  const [search, setSearch] = useState("");
  const [fileSearch, setFileSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<KnowledgeProcessingStatus | "All">("All");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [message, setMessage] = useState("");
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);
  const [memorySearch, setMemorySearch] = useState("");
  const [memoryResults, setMemoryResults] = useState<MemorySearchResult[]>([]);
  const [memoryMessage, setMemoryMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSection = item.section === activeSection;
      const matchesSearch =
        !query ||
        [item.title, item.file_name, item.url, item.content]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return matchesSection && matchesSearch;
    });
  }, [activeSection, items, search]);

  const filteredFiles = useMemo(() => {
    const query = fileSearch.trim().toLowerCase();
    const nextFiles = files.filter((file) => {
      const matchesSearch =
        !query ||
        [
          file.filename,
          file.original_filename,
          file.file_type,
          file.mime_type,
          file.processing_status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus =
        statusFilter === "All" || file.processing_status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return nextFiles.sort((a, b) => {
      if (sortMode === "name") {
        return a.original_filename.localeCompare(b.original_filename);
      }

      if (sortMode === "size") {
        return b.file_size - a.file_size;
      }

      if (sortMode === "oldest") {
        return String(a.created_at).localeCompare(String(b.created_at));
      }

      return String(b.created_at).localeCompare(String(a.created_at));
    });
  }, [fileSearch, files, sortMode, statusFilter]);

  const documentCount = files.length;
  const readyCount = files.filter(
    (file) => file.processing_status === "Ready"
  ).length;
  const queuedCount = files.filter(
    (file) => file.processing_status === "Queued"
  ).length;
  const processingCount = files.filter(
    (file) => file.processing_status === "Processing"
  ).length;
  const failedCount = files.filter(
    (file) => file.processing_status === "Failed"
  ).length;
  const knowledgeScore = Math.min(
    92,
    Math.round(((items.length + files.length) / 24) * 100)
  );
  const totalChunks = chunks.length;
  const averageChunkSize =
    totalChunks > 0
      ? Math.round(
          chunks.reduce((sum, chunk) => sum + chunk.token_count, 0) /
            totalChunks
        )
      : 0;
  const estimatedEmbeddingCost =
    totalChunks > 0 ? `$${((totalChunks * averageChunkSize * 0.00002) / 1000).toFixed(4)}` : "$0.0000";
  const readyForEmbedding = chunks.filter((chunk) => chunk.ready_for_embedding).length;
  const embeddedChunks = chunks.filter(
    (chunk) => chunk.embedding_status === "embedded"
  ).length;
  const searchIndexedChunks = chunks.filter((chunk) => chunk.content).length;
  const memoryHealth =
    totalChunks > 0 ? Math.round((readyForEmbedding / totalChunks) * 100) : 0;
  const estimatedVectorStorage =
    totalChunks > 0
      ? `${((totalChunks * 1536 * 4) / (1024 * 1024)).toFixed(2)} MB`
      : "0 MB";

  function runMemorySearch() {
    if (!memorySearch.trim()) {
      setMemoryMessage("Search query is required.");
      return;
    }

    setMemoryMessage("");

    startTransition(async () => {
      const res = await fetch(
        `/api/knowledge/search?q=${encodeURIComponent(memorySearch)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setMemoryMessage(data.error ?? "Memory search failed.");
        return;
      }

      setMemoryResults(data.results ?? []);
      setMemoryMessage(
        `${data.results?.length ?? 0} memory result${
          data.results?.length === 1 ? "" : "s"
        } found.`
      );
    });
  }

  async function refreshProcessingData() {
    const [filesRes, chunksRes] = await Promise.all([
      fetch("/api/knowledge/files"),
      fetch("/api/knowledge/process", { method: "GET" }).catch(() => null),
    ]);

    if (filesRes.ok) {
      const data = await filesRes.json();
      setFiles(data.files ?? []);
    }

    if (chunksRes?.ok) {
      const data = await chunksRes.json();
      setChunks(data.chunks ?? []);
      setLogs(data.logs ?? []);
    }
  }

  function runProcessing(fileId?: string) {
    setMessage("");

    startTransition(async () => {
      const res = await fetch("/api/knowledge/process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fileId ? { fileId } : {}),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "Processing could not run.");
        return;
      }

      setMessage(`Processed ${data.processed ?? 0} document(s).`);
      await refreshProcessingData();
    });
  }

  async function saveKnowledgeItem(payload: {
    section: KnowledgeSection;
    source_type: string;
    title: string;
    file_name?: string;
    file_type?: string;
    file_size?: number;
    url?: string;
    content?: string;
    metadata?: Record<string, unknown>;
  }) {
    setMessage("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/knowledge", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            ai_learning_status: "Ready to learn",
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setMessage(data.error ?? "Knowledge item could not be saved.");
          return;
        }

        setItems((current) => [data.item as KnowledgeItem, ...current]);
        setMessage("Knowledge item saved.");
      } catch {
        setMessage("Knowledge item could not be saved.");
      }
    });
  }

  function uploadFiles(fileList: FileList | null) {
    if (!fileList?.length) return;

    Array.from(fileList).forEach((file) => {
      const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
      const queueId = crypto.randomUUID();

      if (!allowedExtensions.includes(extension)) {
        setMessage(`${file.name} is not a supported file type.`);
        return;
      }

      setUploadQueue((current) => [
        {
          id: queueId,
          name: file.name,
          status: "Uploading",
          detail: "Uploading to Supabase Storage",
        },
        ...current,
      ]);

      startTransition(async () => {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch("/api/knowledge/upload", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();

          if (!res.ok) {
            setUploadQueue((current) =>
              current.map((item) =>
                item.id === queueId
                  ? {
                      ...item,
                      status: "Failed",
                      detail: data.error ?? "Upload failed",
                    }
                  : item
              )
            );
            return;
          }

          setItems((current) => [data.item as KnowledgeItem, ...current]);
          setFiles((current) => [data.file as KnowledgeFile, ...current]);
          setUploadQueue((current) =>
            current.map((item) =>
              item.id === queueId
                ? {
                    ...item,
                    status: "Uploaded",
                    detail: "Queued for future parsing and chunking",
                  }
                : item
            )
          );
        } catch {
          setUploadQueue((current) =>
            current.map((item) =>
              item.id === queueId
                ? { ...item, status: "Failed", detail: "Upload failed" }
                : item
            )
          );
        }
      });
    });
  }

  function saveWebsiteImport() {
    if (!websiteUrl.trim()) {
      setMessage("Website URL is required.");
      return;
    }

    saveKnowledgeItem({
      section: "Website Import",
      source_type: "website",
      title: websiteUrl,
      url: websiteUrl,
      metadata: {
        crawl_status: "not_started",
        phase_3_ready: true,
      },
    });
    setWebsiteUrl("");
  }

  function saveManualKnowledge() {
    if (!manualTitle.trim() || !manualContent.trim()) {
      setMessage("Title and content are required.");
      return;
    }

    saveKnowledgeItem({
      section: activeSection,
      source_type: "manual",
      title: manualTitle,
      content: manualContent,
      metadata: {
        chunking_ready: true,
        semantic_search_ready: false,
      },
    });
    setManualTitle("");
    setManualContent("");
  }

  function renameFile(file: KnowledgeFile) {
    const nextName = window.prompt("Rename file metadata", file.filename);

    if (!nextName?.trim()) return;

    startTransition(async () => {
      const res = await fetch(`/api/knowledge/files/${file.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filename: nextName }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "File could not be renamed.");
        return;
      }

      setFiles((current) =>
        current.map((item) =>
          item.id === file.id ? (data.file as KnowledgeFile) : item
        )
      );
      setMessage("File renamed.");
    });
  }

  function deleteFile(file: KnowledgeFile) {
    const confirmed = window.confirm(
      `Delete ${file.original_filename}? This removes its storage object and metadata.`
    );

    if (!confirmed) return;

    startTransition(async () => {
      const res = await fetch(`/api/knowledge/files/${file.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "File could not be deleted.");
        return;
      }

      setFiles((current) => current.filter((item) => item.id !== file.id));
      setItems((current) =>
        current.filter((item) => item.id !== file.knowledge_item_id)
      );
      setMessage("File deleted.");
    });
  }

  return (
    <main className="min-h-screen bg-[#050812] text-white">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(135deg,#050812_0%,#071827_52%,#130a23_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.15),transparent_28%),radial-gradient(circle_at_85%_8%,rgba(168,85,247,0.13),transparent_30%)]" />

      <header className="border-b border-white/10 bg-white/[0.04] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
            >
              <ChevronLeft size={16} />
              Back to dashboard
            </Link>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                <Database size={22} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  JOHAI Knowledge Engine
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  Document ingestion pipeline
                </h1>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Metric label="Documents" value={documentCount} />
            <Metric label="AI learning" value={`${readyCount} ready`} />
            <Metric label="Knowledge score" value={`${knowledgeScore}%`} />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[310px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Bot className="text-cyan-300" size={22} />
              <div>
                <p className="font-semibold">AI learning status</p>
                <p className="text-sm text-slate-400">
                  Uploads queue files for future parsing, chunking, embeddings,
                  pgvector, and semantic search.
                </p>
              </div>
            </div>
            <div className="mt-5 h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-cyan-300"
                style={{ width: `${knowledgeScore}%` }}
              />
            </div>
          </div>

          <nav className="rounded-3xl border border-white/10 bg-white/[0.055] p-3 backdrop-blur-xl">
            {knowledgeSections.map((section) => {
              const Icon = sectionIcons[section];
              const count = items.filter((item) => item.section === section).length;

              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                    activeSection === section
                      ? "bg-cyan-300 text-slate-950"
                      : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon size={18} />
                    {section}
                  </span>
                  <span
                    className={
                      activeSection === section ? "text-slate-800" : "text-slate-500"
                    }
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-5">
            <PipelineCard label="Queued" value={queuedCount} />
            <PipelineCard label="Processing" value={processingCount} />
            <PipelineCard label="Ready" value={readyCount} />
            <PipelineCard label="Failed" value={failedCount} />
            <PipelineCard label="Searching" value={fileSearch ? "Active" : "Idle"} />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
              <div className="grid gap-4 sm:grid-cols-4">
                <Metric label="Waiting" value={queuedCount} />
                <Metric label="Processed" value={readyCount} />
                <Metric label="Chunks" value={totalChunks} />
                <Metric label="Avg chunk" value={`${averageChunkSize} tokens`} />
              </div>
              <p className="mt-4 text-sm text-slate-400">
                Estimated embedding cost placeholder:{" "}
                <span className="font-semibold text-cyan-100">
                  {estimatedEmbeddingCost}
                </span>
              </p>
            </div>
            <button
              type="button"
              disabled={isPending || files.length === 0}
              onClick={() => runProcessing()}
              className="inline-flex min-h-28 items-center justify-center rounded-3xl bg-cyan-300 px-5 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Process queue
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl md:p-6">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
                  AI Memory
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Semantic memory readiness
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                  PostgreSQL full-text search is active now. The same interfaces
                  are ready for OpenAI embeddings, VectorStore, SemanticSearch,
                  MemoryRetriever, and KnowledgeRetriever later.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[520px]">
                <Metric label="Processed docs" value={readyCount} />
                <Metric label="Chunks" value={totalChunks} />
                <Metric label="Ready for embedding" value={readyForEmbedding} />
                <Metric label="Embedded" value={embeddedChunks} />
                <Metric label="Search index" value={`${searchIndexedChunks} chunks`} />
                <Metric label="Memory health" value={`${memoryHealth}%`} />
                <Metric label="Avg chunk" value={`${averageChunkSize} tokens`} />
                <Metric label="Vector storage" value={estimatedVectorStorage} />
              </div>
            </div>

            <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px]">
              <label className="relative">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  value={memorySearch}
                  onChange={(event) => setMemorySearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") runMemorySearch();
                  }}
                  placeholder="Search inside processed knowledge chunks"
                  className={`${inputClass()} pl-11`}
                />
              </label>
              <button
                type="button"
                disabled={isPending}
                onClick={runMemorySearch}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Search size={17} />
                Search memory
              </button>
            </div>

            {memoryMessage && (
              <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
                {memoryMessage}
              </p>
            )}

            {memoryResults.length > 0 && (
              <div className="mt-5 grid gap-3">
                {memoryResults.map((result) => (
                  <div
                    key={result.chunk_id}
                    className="rounded-3xl border border-white/10 bg-slate-950/35 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-semibold">{result.document}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          Business: {result.business_name} - Source:{" "}
                          {result.source || "Knowledge chunk"}
                        </p>
                      </div>
                      <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                        Score {Number(result.score ?? 0).toFixed(3)}
                      </span>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-300">
                      {result.chunk_preview}
                    </p>
                    <p className="mt-4 text-xs text-slate-500">
                      Created {formatDate(result.created_at)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl md:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
                  {activeSection}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  Knowledge sources
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Store raw documents, metadata, and queue states now. Phase 3
                  can attach parsers, crawlers, chunking, OpenAI embeddings, and
                  pgvector without changing this surface.
                </p>
              </div>

              <label className="relative min-w-0 xl:w-80">
                <Search
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                  size={18}
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search knowledge"
                  className={`${inputClass()} pl-11`}
                />
              </label>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Sparkles className="text-cyan-300" size={22} />
                  <h3 className="text-lg font-semibold">Add knowledge</h3>
                </div>

                {activeSection === "Documents" && (
                  <div className="mt-5">
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-300/30 bg-cyan-300/10 px-5 py-10 text-center transition hover:bg-cyan-300/15">
                      <Upload className="h-9 w-9 text-cyan-200" />
                      <span className="mt-4 text-sm font-semibold">
                        Upload PDF, DOCX, XLSX, PPTX, CSV, TXT, or MD
                      </span>
                      <span className="mt-2 text-xs leading-5 text-slate-400">
                        Files are stored in the `knowledge-files` bucket and
                        queued for the future parser pipeline.
                      </span>
                      <input
                        type="file"
                        multiple
                        accept={allowedExtensions.join(",")}
                        onChange={(event) => uploadFiles(event.target.files)}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {activeSection === "Website Import" && (
                  <div className="mt-5 space-y-4">
                    <input
                      value={websiteUrl}
                      onChange={(event) => setWebsiteUrl(event.target.value)}
                      className={inputClass()}
                      placeholder="https://example.com"
                    />
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={saveWebsiteImport}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Globe2 size={17} />
                      Save website source
                    </button>
                  </div>
                )}

                {activeSection !== "Documents" &&
                  activeSection !== "Website Import" && (
                    <div className="mt-5 space-y-4">
                      <input
                        value={manualTitle}
                        onChange={(event) => setManualTitle(event.target.value)}
                        className={inputClass()}
                        placeholder={`${activeSection} title`}
                      />
                      <textarea
                        value={manualContent}
                        onChange={(event) => setManualContent(event.target.value)}
                        className={`${inputClass()} min-h-40 resize-none leading-6`}
                        placeholder={`Add ${activeSection.toLowerCase()} content for the AI knowledge base.`}
                      />
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={saveManualKnowledge}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus size={17} />
                        Save {activeSection}
                      </button>
                    </div>
                  )}

                {message && (
                  <p className="mt-4 rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-300">
                    {message}
                  </p>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Layers3 className="text-cyan-300" size={22} />
                  <h3 className="text-lg font-semibold">Upload queue</h3>
                </div>
                <div className="mt-5 space-y-3">
                  {uploadQueue.length === 0 && (
                    <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-400">
                      No active uploads.
                    </p>
                  )}
                  {uploadQueue.map((queueItem) => (
                    <div
                      key={queueItem.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="min-w-0 truncate text-sm font-semibold">
                          {queueItem.name}
                        </p>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs text-slate-300">
                          {queueItem.status}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {queueItem.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Layers3 className="text-cyan-300" size={22} />
                  <h3 className="text-lg font-semibold">Phase 3 hooks</h3>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ["PDF parser", "Attach to knowledge_files"],
                    ["DOCX parser", "Attach to processing queue"],
                    ["Website crawler", "Reads Website Import items"],
                    ["Chunking", "Writes knowledge_chunks"],
                    ["OpenAI embeddings", "Updates embedding_status"],
                    ["pgvector search", "Uses chunk metadata"],
                  ].map(([label, value]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                    >
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        {label}
                      </p>
                      <p className="mt-2 font-semibold text-slate-100">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_150px]">
                  <label className="relative">
                    <Search
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      size={18}
                    />
                    <input
                      value={fileSearch}
                      onChange={(event) => setFileSearch(event.target.value)}
                      placeholder="Search files"
                      className={`${inputClass()} pl-11`}
                    />
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(event) =>
                      setStatusFilter(
                        event.target.value as KnowledgeProcessingStatus | "All"
                      )
                    }
                    className={inputClass()}
                  >
                    <option value="All">All statuses</option>
                    {knowledgeProcessingStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <select
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value as SortMode)}
                    className={inputClass()}
                  >
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                    <option value="name">Name</option>
                    <option value="size">Size</option>
                  </select>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.055] backdrop-blur-xl">
                <div className="border-b border-white/10 p-5">
                  <h3 className="text-lg font-semibold">File pipeline</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {filteredFiles.length} file
                    {filteredFiles.length === 1 ? "" : "s"} visible
                  </p>
                </div>

                <div className="max-h-[760px] space-y-3 overflow-y-auto p-5">
                  {filteredFiles.length === 0 && (
                    <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-8 text-center">
                      <Scale className="mx-auto text-slate-500" size={28} />
                      <p className="mt-4 font-semibold">No files yet</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        Upload a document to create the first ingestion record.
                      </p>
                    </div>
                  )}

                  {filteredFiles.map((file) => {
                    const Icon = getFileIcon(file.file_type);

                    return (
                      <div
                        key={file.id}
                        className="rounded-3xl border border-white/10 bg-slate-950/35 p-5"
                      >
                        <div className="flex items-start gap-4">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                            <Icon size={20} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <p className="truncate font-semibold">
                                  {file.filename}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  Original: {file.original_filename}
                                </p>
                              </div>
                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                                  statusStyles[file.processing_status]
                                }`}
                              >
                                {file.processing_status}
                              </span>
                            </div>

                            <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                              <span>Size: {formatFileSize(file.file_size)}</span>
                              <span>Uploaded: {formatDate(file.created_at)}</span>
                              <span>Chunks: {file.chunk_count}</span>
                            </div>

                            <p className="mt-3 break-all text-xs text-slate-600">
                              {file.storage_path}
                            </p>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => runProcessing(file.id)}
                                className="inline-flex items-center gap-2 rounded-xl border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/15"
                              >
                                <Sparkles size={14} />
                                Process
                              </button>
                              <button
                                type="button"
                                onClick={() => renameFile(file)}
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08]"
                              >
                                <Pencil size={14} />
                                Rename
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  downloadJson(
                                    `${file.original_filename}-metadata.json`,
                                    file
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08]"
                              >
                                <Download size={14} />
                                Metadata
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteFile(file)}
                                className="inline-flex items-center gap-2 rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-400/15"
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.055] backdrop-blur-xl">
                <div className="border-b border-white/10 p-5">
                  <h3 className="text-lg font-semibold">Knowledge library</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {filteredItems.length} item
                    {filteredItems.length === 1 ? "" : "s"} in {activeSection}
                  </p>
                </div>

                <div className="max-h-[420px] space-y-3 overflow-y-auto p-5">
                  {filteredItems.length === 0 && (
                    <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-400">
                      No knowledge records in this section yet.
                    </p>
                  )}

                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                    >
                      <p className="font-semibold">{item.title}</p>
                      <p className="mt-2 text-xs text-slate-500">
                        {item.source_type} - Added {formatDate(item.created_at)}
                      </p>
                      {item.content && (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-400">
                          {item.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/[0.055] backdrop-blur-xl">
                <div className="border-b border-white/10 p-5">
                  <h3 className="text-lg font-semibold">Processing logs</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    Parser, cleaning, chunking and failure events.
                  </p>
                </div>
                <div className="max-h-[360px] space-y-3 overflow-y-auto p-5">
                  {logs.length === 0 && (
                    <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-400">
                      No processing logs yet.
                    </p>
                  )}
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{log.message}</p>
                        <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs uppercase text-slate-300">
                          {log.level}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500">
                        {formatDate(log.created_at)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-cyan-100">{value}</p>
    </div>
  );
}

function PipelineCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}
