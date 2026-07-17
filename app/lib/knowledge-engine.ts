import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { KnowledgeProcessingResult } from "@/app/lib/knowledge-processing-queue";
import {
  classifyKnowledgeProcessingFailure,
  getProcessingStartDecision,
  isCurrentProcessingAttempt,
} from "@/app/lib/knowledge-processing-state";
import {
  DEFAULT_BUSINESS_ID,
  type KnowledgeChunk,
  type KnowledgeFile,
  type KnowledgeProcessingLog,
} from "@/app/lib/supabase";

const bucketName = "knowledge-files";
export const defaultChunkingOptions = { targetTokens: 650, overlapTokens: 90, maxTokens: 900 } as const;
const maxExtractedCharacters = 4_000_000;
const extractionTimeoutMs = 30_000;

type ParseResult = { text: string; parser: string; warnings: string[] };
type TextChunk = { content: string; tokenCount: number; characterCount: number; sectionReference: string; pageReference: string };
interface DocumentParser { readonly type: string; extract(buffer: Buffer): Promise<ParseResult>; }

function decodeUtf8(buffer: Buffer) { return buffer.toString("utf8").replace(/^\uFEFF/, ""); }

class TxtParser implements DocumentParser {
  readonly type = "txt";
  async extract(buffer: Buffer) { return { text: decodeUtf8(buffer), parser: "TxtParser", warnings: [] }; }
}

class MarkdownParser implements DocumentParser {
  readonly type = "md";
  async extract(buffer: Buffer) {
    const text = decodeUtf8(buffer).replace(/!\[[^\]]*]\([^)]+\)/g, "").replace(/\[([^\]]+)]\([^)]+\)/g, "$1").replace(/^```[^\n]*$/gm, "");
    return { text, parser: "MarkdownParser", warnings: [] };
  }
}

function parseCsv(input: string) {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  for (let index = 0; index < input.length; index += 1) {
    const char = input[index], next = input[index + 1];
    if (char === '"' && quoted && next === '"') { cell += '"'; index += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell.trim()); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell.trim()); if (row.some(Boolean)) rows.push(row); row = []; cell = "";
    } else cell += char;
  }
  row.push(cell.trim()); if (row.some(Boolean)) rows.push(row);
  return rows.map((cells, rowIndex) => `${rowIndex === 0 ? "Columns" : `Row ${rowIndex}`}: ${cells.map((value, column)=>`${rowIndex === 0 ? `Column ${column + 1}` : rows[0]?.[column] || `Column ${column + 1}`}: ${value}`).join(" | ")}`).join("\n");
}

class CsvParser implements DocumentParser {
  readonly type = "csv";
  async extract(buffer: Buffer) { return { text: parseCsv(decodeUtf8(buffer)), parser: "CsvParser", warnings: [] }; }
}

class PdfParser implements DocumentParser {
  readonly type = "pdf";
  async extract(buffer: Buffer): Promise<ParseResult> {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const document = await pdfjs.getDocument({ data: new Uint8Array(buffer), useSystemFonts: true }).promise;
    const pages: string[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const text = content.items.map((item) => "str" in item ? item.str : "").join(" ");
      pages.push(`[Page ${pageNumber}]\n${text}`);
    }
    return { text: pages.join("\n\n"), parser: "PdfJsParser", warnings: [] };
  }
}

class DocxParser implements DocumentParser {
  readonly type = "docx";
  async extract(buffer: Buffer): Promise<ParseResult> {
    const mammoth = await import("mammoth");
    const result = await mammoth.extractRawText({ buffer });
    return { text: result.value, parser: "MammothDocxParser", warnings: result.messages.map((message)=>message.message) };
  }
}

class XlsxParser implements DocumentParser {
  readonly type = "xlsx";
  async extract(buffer: Buffer): Promise<ParseResult> {
    const { Workbook } = await import("exceljs");
    const workbook = new Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    const sheets: string[] = [];
    workbook.eachSheet((sheet) => {
      const rows: string[] = [`[Sheet: ${sheet.name}]`];
      const headings: string[] = [];
      sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        const values = Array.from({ length: row.cellCount }, (_, index) => row.getCell(index + 1).text.trim());
        if (rowNumber === 1) headings.push(...values);
        rows.push(`${rowNumber === 1 ? "Columns" : `Row ${rowNumber}`}: ${values.map((value,index)=>`${headings[index] || `Column ${index + 1}`}: ${value}`).join(" | ")}`);
      });
      sheets.push(rows.join("\n"));
    });
    return { text: sheets.join("\n\n"), parser: "ExcelJsXlsxParser", warnings: [] };
  }
}

function getParser(fileType: string): DocumentParser {
  const parsers: DocumentParser[] = [new PdfParser(), new DocxParser(), new XlsxParser(), new TxtParser(), new CsvParser(), new MarkdownParser()];
  const parser = parsers.find((candidate)=>candidate.type === fileType.toLowerCase());
  if (!parser) throw new Error(`Unsupported document parser: ${fileType}.`);
  return parser;
}

async function withExtractionTimeout<T>(operation: Promise<T>) {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(
          () => reject(new Error("Document extraction exceeded the 30-second safety limit.")),
          extractionTimeoutMs
        );
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export function cleanKnowledgeText(text: string) {
  return text.replace(/\0/g, "").replace(/\r\n?/g, "\n").split("\n").map((line)=>line.replace(/[\t ]+/g," ").trim()).filter(Boolean).filter((line)=>!/^page\s+\d+$/i.test(line)).join("\n\n").slice(0, maxExtractedCharacters);
}

function estimateTokens(text: string) { return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3)); }
function splitOversized(text: string, maxTokens: number) {
  if (estimateTokens(text) <= maxTokens) return [text];
  const sentences = text.split(/(?<=[.!?])\s+/); const result: string[] = []; let current = "";
  for (const sentence of sentences) {
    if (estimateTokens(`${current} ${sentence}`) > maxTokens && current) { result.push(current.trim()); current = sentence; }
    else current = `${current} ${sentence}`;
  }
  if (current.trim()) result.push(current.trim());
  return result.flatMap((part)=>estimateTokens(part) <= maxTokens ? [part] : part.split(/\s+/).reduce<string[]>((parts,word)=>{ const last=parts.at(-1)??""; if(estimateTokens(`${last} ${word}`)>maxTokens) parts.push(word); else parts[parts.length-1]=`${last} ${word}`.trim(); return parts; },[""]).filter(Boolean));
}

export function chunkKnowledgeText(text: string, options: { targetTokens?: number; overlapTokens?: number; maxTokens?: number } = {}): TextChunk[] {
  const target = options.targetTokens ?? defaultChunkingOptions.targetTokens;
  const overlap = options.overlapTokens ?? defaultChunkingOptions.overlapTokens;
  const max = options.maxTokens ?? defaultChunkingOptions.maxTokens;
  const blocks = text.split(/\n{2,}/).filter(Boolean).flatMap((block)=>splitOversized(block,max));
  const chunks: TextChunk[] = []; let current: string[] = []; let tokens = 0; let section = "Document"; let page = "";
  for (const block of blocks) {
    const pageMatch = block.match(/^\[Page (\d+)]/); const sheetMatch = block.match(/^\[Sheet: ([^\]]+)]/);
    if (pageMatch) page = `Page ${pageMatch[1]}`;
    if (sheetMatch) section = `Sheet: ${sheetMatch[1]}`;
    if (!pageMatch && !sheetMatch && block.length < 120 && !/[.!?]$/.test(block)) section = block.replace(/^#+\s*/,"");
    const blockTokens = estimateTokens(block);
    if (current.length && tokens + blockTokens > target) {
      const content = current.join("\n\n"); chunks.push({ content, tokenCount:estimateTokens(content), characterCount:content.length, sectionReference:section, pageReference:page });
      const overlapWords = content.split(/\s+/).slice(-Math.round(overlap / 1.3)); current = overlapWords.length ? [overlapWords.join(" ")] : []; tokens = estimateTokens(current.join(" "));
    }
    current.push(block); tokens += blockTokens;
  }
  if (current.length) { const content=current.join("\n\n"); chunks.push({content,tokenCount:estimateTokens(content),characterCount:content.length,sectionReference:section,pageReference:page}); }
  return chunks.filter((chunk)=>chunk.content.trim().length >= 20);
}

async function requireSuccess<T>(operation: PromiseLike<{ data: T; error: { message?: string } | null }>, fallback: string) { const result=await operation; if(result.error) throw new Error(result.error.message || fallback); return result.data; }
async function logProcessing(supabase: SupabaseClient, file: KnowledgeFile, level: KnowledgeProcessingLog["level"], message: string, metadata: Record<string,unknown>={}) { await requireSuccess(supabase.from("knowledge_processing_logs").insert({business_id:file.business_id,knowledge_file_id:file.id,level,message,metadata}),"Processing log could not be saved."); }

export interface EmbeddingProvider { embed(text: string): Promise<number[]>; }
export interface VectorStore { upsert(chunkId: string, embedding: number[]): Promise<void>; }
export interface SemanticSearch { search(query: string, businessId: string): Promise<unknown[]>; }

class StaleKnowledgeProcessingAttempt extends Error {
  constructor() {
    super("A newer document state superseded this processing attempt.");
    this.name = "StaleKnowledgeProcessingAttempt";
  }
}

type ProcessingAttempt = {
  file: KnowledgeFile;
  attemptId: string;
  attemptNumber: number;
  requestId: string;
};

type ProcessingAttemptStart =
  | { claimed: true; attempt: ProcessingAttempt }
  | { claimed: false; result: KnowledgeProcessingResult };

function metadataString(
  metadata: Record<string, unknown> | undefined,
  key: string
) {
  const value = metadata?.[key];
  return typeof value === "string" ? value : "";
}

async function loadKnowledgeFile(
  supabase: SupabaseClient,
  fileId: string
) {
  const { data, error } = await supabase
    .from("knowledge_files")
    .select("*")
    .eq("id", fileId)
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .single();

  if (error || !data) {
    throw error ?? new Error("Knowledge file was not found.");
  }

  return data as KnowledgeFile;
}

async function beginProcessingAttempt(
  supabase: SupabaseClient,
  fileId: string,
  options: {
    requestId?: string;
    allowReadyReprocess?: boolean;
  }
): Promise<ProcessingAttemptStart> {
  let current = await loadKnowledgeFile(supabase, fileId);
  const requestId = options.requestId?.trim() || randomUUID();
  const completedRequestId = metadataString(
    current.source_metadata,
    "last_completed_processing_request_id"
  );
  const failedRequestId = metadataString(
    current.source_metadata,
    "last_failed_processing_request_id"
  );

  if (requestId === completedRequestId || requestId === failedRequestId) {
    return {
      claimed: false,
      result: {
        fileId: current.id,
        status: current.processing_status,
        attempt: current.processing_attempts ?? 0,
        skipped: true,
        recoverable: current.processing_status === "Failed",
        error:
          current.processing_status === "Failed"
            ? current.processing_error
            : "This processing request was already completed.",
      },
    };
  }

  if (current.processing_status === "Uploaded") {
    const { data: queuedData, error: queueError } = await supabase
      .from("knowledge_files")
      .update({
        processing_status: "Queued",
        updated_at: new Date().toISOString(),
      })
      .eq("id", current.id)
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .eq("processing_status", "Uploaded")
      .select("*")
      .maybeSingle();

    if (queueError) throw queueError;
    current = queuedData
      ? (queuedData as KnowledgeFile)
      : await loadKnowledgeFile(supabase, fileId);
  }

  const decision = getProcessingStartDecision(current, {
    allowReadyReprocess: options.allowReadyReprocess,
  });
  if (!decision.allowed) {
    return {
      claimed: false,
      result: {
        fileId: current.id,
        status: current.processing_status,
        attempt: current.processing_attempts ?? 0,
        skipped: true,
        recoverable: decision.recoverable,
        error: decision.message,
      },
    };
  }

  const attemptId = randomUUID();
  const attemptNumber = (current.processing_attempts ?? 0) + 1;
  const attemptedAt = new Date().toISOString();
  const { data: claimedData, error: claimError } = await supabase
    .from("knowledge_files")
    .update({
      processing_status: "Processing",
      processing_error: null,
      last_processing_attempt_at: attemptedAt,
      processing_attempts: attemptNumber,
      source_metadata: {
        ...(current.source_metadata ?? {}),
        processing_attempt_id: attemptId,
        processing_request_id: requestId,
        processing_started_at: attemptedAt,
        processing_failure: null,
      },
      updated_at: attemptedAt,
    })
    .eq("id", current.id)
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .eq("processing_status", current.processing_status)
    .eq("processing_attempts", current.processing_attempts ?? 0)
    .select("*")
    .maybeSingle();

  if (claimError) throw claimError;
  if (!claimedData) {
    const latest = await loadKnowledgeFile(supabase, fileId);
    return {
      claimed: false,
      result: {
        fileId: latest.id,
        status: latest.processing_status,
        attempt: latest.processing_attempts ?? 0,
        skipped: true,
        recoverable: latest.processing_status === "Processing",
        error: "Another processing request claimed this document first.",
      },
    };
  }

  return {
    claimed: true,
    attempt: {
      file: claimedData as KnowledgeFile,
      attemptId,
      attemptNumber,
      requestId,
    },
  };
}

async function assertCurrentAttempt(
  supabase: SupabaseClient,
  attempt: ProcessingAttempt
) {
  const current = await loadKnowledgeFile(supabase, attempt.file.id);
  if (!isCurrentProcessingAttempt(current, attempt.attemptId)) {
    throw new StaleKnowledgeProcessingAttempt();
  }
  return current;
}

function chunkInsertShape(chunk: KnowledgeChunk) {
  return {
    business_id: chunk.business_id,
    knowledge_file_id: chunk.knowledge_file_id,
    chunk_index: chunk.chunk_index,
    content: chunk.content,
    token_count: chunk.token_count,
    character_count: chunk.character_count ?? chunk.content.length,
    source_reference: chunk.source_reference,
    section_reference: chunk.section_reference,
    page_reference: chunk.page_reference,
    processing_status: chunk.processing_status ?? "Ready",
    ready_for_embedding: chunk.ready_for_embedding ?? true,
    embedding_status: chunk.embedding_status,
    embedding_provider: chunk.embedding_provider,
    vector_store_status: chunk.vector_store_status,
  };
}

async function restoreKnowledgeChunks(
  supabase: SupabaseClient,
  fileId: string,
  chunks: KnowledgeChunk[]
) {
  await requireSuccess(
    supabase
      .from("knowledge_chunks")
      .delete()
      .eq("knowledge_file_id", fileId)
      .eq("business_id", DEFAULT_BUSINESS_ID),
    "Partial replacement chunks could not be removed."
  );

  if (chunks.length) {
    await requireSuccess(
      supabase.from("knowledge_chunks").insert(chunks.map(chunkInsertShape)),
      "Previous document chunks could not be restored."
    );
  }
}

async function replaceKnowledgeChunks(
  supabase: SupabaseClient,
  attempt: ProcessingAttempt,
  chunks: TextChunk[]
) {
  await assertCurrentAttempt(supabase, attempt);
  const { data: oldData, error: oldError } = await supabase
    .from("knowledge_chunks")
    .select("*")
    .eq("knowledge_file_id", attempt.file.id)
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .order("chunk_index", { ascending: true });
  if (oldError) throw oldError;
  const previousChunks = (oldData ?? []) as KnowledgeChunk[];

  await requireSuccess(
    supabase
      .from("knowledge_chunks")
      .delete()
      .eq("knowledge_file_id", attempt.file.id)
      .eq("business_id", DEFAULT_BUSINESS_ID),
    "Previous chunks could not be replaced."
  );

  try {
    await requireSuccess(
      supabase.from("knowledge_chunks").insert(
        chunks.map((chunk, index) => ({
          business_id: DEFAULT_BUSINESS_ID,
          knowledge_file_id: attempt.file.id,
          chunk_index: index,
          content: chunk.content,
          token_count: chunk.tokenCount,
          character_count: chunk.characterCount,
          source_reference: attempt.file.original_filename,
          section_reference: chunk.sectionReference,
          page_reference: chunk.pageReference,
          processing_status: "Ready",
          ready_for_embedding: true,
          embedding_status: "not_started",
        }))
      ),
      "Extracted chunks could not be saved."
    );
  } catch (error) {
    await restoreKnowledgeChunks(
      supabase,
      attempt.file.id,
      previousChunks
    );
    throw error;
  }

  return previousChunks;
}

export async function processKnowledgeFile(
  supabase: SupabaseClient,
  file: KnowledgeFile,
  options: {
    updateKnowledgeItem?: boolean;
    requestId?: string;
    allowReadyReprocess?: boolean;
  } = {}
): Promise<KnowledgeProcessingResult> {
  if (file.business_id !== DEFAULT_BUSINESS_ID) throw new Error("Knowledge file does not belong to the active business.");
  if (!file.storage_path.startsWith(`${DEFAULT_BUSINESS_ID}/`)) throw new Error("Knowledge storage path does not belong to the active business.");
  const start = await beginProcessingAttempt(supabase, file.id, options);
  if (!start.claimed) return start.result;

  const attempt = start.attempt;
  const started = Date.now();
  let previousChunks: KnowledgeChunk[] | null = null;
  try {
    await logProcessing(supabase, attempt.file, "info", "Processing started.", {
      attempt: attempt.attemptNumber,
      attempt_id: attempt.attemptId,
      request_id: attempt.requestId,
    });
  } catch (logError) {
    console.error("Knowledge start log could not be saved", logError);
  }

  try {
    const {data,error}=await supabase.storage.from(bucketName).download(attempt.file.storage_path); if(error||!data) throw new Error(error?.message || "Storage download failed.");
    const buffer=Buffer.from(await data.arrayBuffer()); const parsed=await withExtractionTimeout(getParser(attempt.file.file_type).extract(buffer));
    if (parsed.text.length > maxExtractedCharacters) parsed.warnings.push("Extracted text exceeded the safe indexing limit and was truncated for review.");
    const cleaned=cleanKnowledgeText(parsed.text); const chunks=chunkKnowledgeText(cleaned).slice(0, 2_000);
    if (chunks.length === 2_000) parsed.warnings.push("Document produced the maximum 2,000 searchable sections and requires review.");
    if(cleaned.length<20||chunks.length===0) throw new Error("No usable text could be extracted from this document.");
    previousChunks = await replaceKnowledgeChunks(supabase, attempt, chunks);
    const duration=Date.now()-started; const status=parsed.warnings.length ? "Needs review" : "Ready"; const processedAt=new Date().toISOString();
    const { data: completedData, error: completeError } = await supabase
      .from("knowledge_files")
      .update({
        processing_status: status,
        chunk_count: chunks.length,
        processed_at: processedAt,
        processing_duration_ms: duration,
        processing_error: null,
        source_metadata: {
          ...(attempt.file.source_metadata ?? {}),
          parser: parsed.parser,
          warnings: parsed.warnings,
          extracted_characters: cleaned.length,
          processing_attempt_id: null,
          processing_request_id: null,
          last_completed_processing_request_id: attempt.requestId,
          processing_failure: null,
        },
        updated_at: processedAt,
      })
      .eq("id", attempt.file.id)
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .eq("processing_status", "Processing")
      .contains("source_metadata", {
        processing_attempt_id: attempt.attemptId,
      })
      .select("*")
      .maybeSingle();

    if (completeError || !completedData) {
      await restoreKnowledgeChunks(
        supabase,
        attempt.file.id,
        previousChunks
      );
      if (completeError) throw completeError;
      throw new StaleKnowledgeProcessingAttempt();
    }

    if (options.updateKnowledgeItem !== false) {
      const activeVersions = await requireSuccess(
        supabase
          .from("knowledge_files")
          .select("id")
          .eq("business_id", DEFAULT_BUSINESS_ID)
          .eq("knowledge_item_id", attempt.file.knowledge_item_id)
          .eq("is_active_version", true),
        "Active knowledge version could not be verified."
      );
      const fileIsSoleActiveVersion =
        Array.isArray(activeVersions) &&
        activeVersions.length === 1 &&
        activeVersions[0]?.id === attempt.file.id;

      if (fileIsSoleActiveVersion) {
        const { error: itemError } = await supabase.from("knowledge_items").update({ai_learning_status:status==="Ready"?"Learned":"Needs review",embedding_status:"queued",knowledge_score:Math.min(100,Math.round(chunks.length*12)),updated_at:processedAt}).eq("id",attempt.file.knowledge_item_id).eq("business_id",DEFAULT_BUSINESS_ID);
        if (itemError) {
          console.error("Knowledge source status synchronization failed", itemError);
        }
      }
    }
    try {
      await logProcessing(supabase,attempt.file,parsed.warnings.length?"warning":"info",parsed.warnings.length?"Processing completed with review required.":"Processing completed.",{parser:parsed.parser,chunk_count:chunks.length,duration_ms:duration,warnings:parsed.warnings,attempt_id:attempt.attemptId,request_id:attempt.requestId});
    } catch (logError) {
      console.error("Knowledge completion log could not be saved", logError);
    }
    return {fileId:attempt.file.id,chunkCount:chunks.length,parser:parsed.parser,status,durationMs:duration,attempt:attempt.attemptNumber,attemptId:attempt.attemptId,recoverable:false};
  } catch(error) {
    if (error instanceof StaleKnowledgeProcessingAttempt) {
      const latest = await loadKnowledgeFile(supabase, attempt.file.id);
      return {fileId:latest.id,status:latest.processing_status,attempt:latest.processing_attempts??attempt.attemptNumber,attemptId:attempt.attemptId,skipped:true,recoverable:false,error:error.message};
    }

    const failure=classifyKnowledgeProcessingFailure(error); const duration=Date.now()-started; const failedAt=new Date().toISOString();
    const { data: failedData, error: failureUpdateError } = await supabase
      .from("knowledge_files")
      .update({
        processing_status: "Failed",
        processing_error: failure.message,
        processing_duration_ms: duration,
        source_metadata: {
          ...(attempt.file.source_metadata ?? {}),
          processing_attempt_id: null,
          processing_request_id: null,
          last_failed_processing_request_id: attempt.requestId,
          processing_failure: {
            code: failure.code,
            recoverable: failure.recoverable,
          },
        },
        updated_at: failedAt,
      })
      .eq("id", attempt.file.id)
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .eq("processing_status", "Processing")
      .contains("source_metadata", {
        processing_attempt_id: attempt.attemptId,
      })
      .select("*")
      .maybeSingle();

    if (failureUpdateError) throw failureUpdateError;
    if (!failedData) {
      const latest = await loadKnowledgeFile(supabase, attempt.file.id);
      return {fileId:latest.id,status:latest.processing_status,attempt:latest.processing_attempts??attempt.attemptNumber,attemptId:attempt.attemptId,skipped:true,recoverable:false,error:"A newer document state superseded this failed attempt."};
    }

    try {
      await logProcessing(supabase,attempt.file,"error",failure.message,{duration_ms:duration,attempt_id:attempt.attemptId,request_id:attempt.requestId,failure_code:failure.code,recoverable:failure.recoverable});
    } catch (logError) {
      console.error("Knowledge failure log could not be saved", logError);
    }
    return {fileId:attempt.file.id,status:"Failed",attempt:attempt.attemptNumber,attemptId:attempt.attemptId,durationMs:duration,recoverable:failure.recoverable,error:failure.message};
  }
}
