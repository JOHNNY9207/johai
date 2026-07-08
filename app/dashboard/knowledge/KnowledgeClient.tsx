"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  BookOpen,
  Bot,
  ChevronLeft,
  Database,
  File,
  FileSpreadsheet,
  FileText,
  Globe2,
  Layers3,
  ListChecks,
  PackageOpen,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import {
  knowledgeSections,
  type KnowledgeItem,
  type KnowledgeSection,
} from "@/app/lib/supabase";
import type { LucideIcon } from "lucide-react";

type KnowledgeClientProps = {
  initialItems: KnowledgeItem[];
};

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
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function inputClass() {
  return "w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10";
}

function getFileIcon(fileType?: string) {
  if (fileType?.includes("sheet") || fileType?.includes("csv")) {
    return FileSpreadsheet;
  }

  if (fileType?.includes("text") || fileType?.includes("markdown")) {
    return FileText;
  }

  return File;
}

export default function KnowledgeClient({
  initialItems,
}: KnowledgeClientProps) {
  const [items, setItems] = useState(initialItems);
  const [activeSection, setActiveSection] =
    useState<KnowledgeSection>("Documents");
  const [search, setSearch] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [message, setMessage] = useState("");
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

  const documentCount = items.filter(
    (item) => item.section === "Documents"
  ).length;
  const readyCount = items.filter(
    (item) => item.ai_learning_status === "Ready to learn"
  ).length;
  const knowledgeScore = Math.min(
    92,
    Math.round((items.length / Math.max(knowledgeSections.length * 3, 1)) * 100)
  );

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

  function uploadFiles(files: FileList | null) {
    if (!files?.length) return;

    Array.from(files).forEach((file) => {
      const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;

      if (!allowedExtensions.includes(extension)) {
        setMessage(`${file.name} is not a supported file type.`);
        return;
      }

      saveKnowledgeItem({
        section: "Documents",
        source_type: "file",
        title: file.name.replace(/\.[^/.]+$/, ""),
        file_name: file.name,
        file_type: file.type || extension,
        file_size: file.size,
        metadata: {
          extension,
          upload_note:
            "Metadata stored now. File storage and embeddings are prepared for a future phase.",
        },
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
        semantic_search_ready: false,
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
        semantic_search_ready: false,
      },
    });
    setManualTitle("");
    setManualContent("");
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
                  JOHAI Knowledge Center
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  Train each business workspace
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
                  Embeddings are prepared, not active yet.
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
                  Store source metadata now and prepare every business knowledge
                  base for future embeddings and semantic search.
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

          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
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
                        Metadata is saved now. File storage and parsing can be
                        added in the embeddings phase.
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
                  <h3 className="text-lg font-semibold">Embedding readiness</h3>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Metadata", "Stored per business"],
                    ["Embeddings", "Prepared, not implemented"],
                    ["Semantic search", "Future-ready"],
                    ["Isolation", "Business-owned records"],
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

            <div className="rounded-3xl border border-white/10 bg-white/[0.055] backdrop-blur-xl">
              <div className="border-b border-white/10 p-5">
                <h3 className="text-lg font-semibold">Knowledge library</h3>
                <p className="mt-1 text-sm text-slate-400">
                  {filteredItems.length} item
                  {filteredItems.length === 1 ? "" : "s"} in {activeSection}
                </p>
              </div>

              <div className="max-h-[780px] space-y-3 overflow-y-auto p-5">
                {filteredItems.length === 0 && (
                  <div className="rounded-3xl border border-white/10 bg-slate-950/35 p-8 text-center">
                    <Scale className="mx-auto text-slate-500" size={28} />
                    <p className="mt-4 font-semibold">No knowledge yet</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Add sources to help JOHAI learn this business in a future
                      embeddings phase.
                    </p>
                  </div>
                )}

                {filteredItems.map((item) => {
                  const Icon = getFileIcon(item.file_type);

                  return (
                    <div
                      key={item.id}
                      className="rounded-3xl border border-white/10 bg-slate-950/35 p-5"
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                          <Icon size={20} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="truncate font-semibold">
                                {item.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {item.source_type} - {formatFileSize(item.file_size)}
                              </p>
                            </div>
                            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                              {item.ai_learning_status ?? "Ready to learn"}
                            </span>
                          </div>
                          {item.url && (
                            <p className="mt-3 break-all text-xs text-cyan-200">
                              {item.url}
                            </p>
                          )}
                          {item.content && (
                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-400">
                              {item.content}
                            </p>
                          )}
                          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                              Embedding: {item.embedding_status ?? "not_started"}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                              Score: {item.knowledge_score ?? 0}%
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1">
                              Added {formatDate(item.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
