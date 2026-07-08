import { inflateRawSync } from "zlib";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  DEFAULT_BUSINESS_ID,
  type KnowledgeFile,
  type KnowledgeProcessingLog,
} from "@/app/lib/supabase";

const bucketName = "knowledge-files";
const targetChunkTokens = 650;
const overlapTokens = 100;

type ParseResult = {
  text: string;
  parser: string;
  warnings: string[];
};

type TextChunk = {
  content: string;
  tokenCount: number;
};

type ZipEntry = {
  name: string;
  compressedSize: number;
  uncompressedSize: number;
  compressionMethod: number;
  localHeaderOffset: number;
};

interface DocumentParser {
  readonly type: string;
  extract(buffer: Buffer): ParseResult;
}

function decodeUtf8(buffer: Buffer) {
  return buffer.toString("utf8").replace(/^\uFEFF/, "");
}

function stripXml(xml: string) {
  return xml
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

// TXT is the baseline parser used by simple plain-text knowledge files.
class TxtParser implements DocumentParser {
  readonly type = "txt";

  extract(buffer: Buffer): ParseResult {
    return { text: decodeUtf8(buffer), parser: "TxtParser", warnings: [] };
  }
}

// Markdown keeps text content while removing the most common formatting noise.
class MarkdownParser implements DocumentParser {
  readonly type = "md";

  extract(buffer: Buffer): ParseResult {
    const text = decodeUtf8(buffer)
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
      .replace(/\[([^\]]+)]\([^)]+\)/g, "$1")
      .replace(/[#>*_`~-]+/g, " ");

    return { text, parser: "MarkdownParser", warnings: [] };
  }
}

// CSV parser preserves row meaning by converting separators to readable spaces.
class CsvParser implements DocumentParser {
  readonly type = "csv";

  extract(buffer: Buffer): ParseResult {
    const text = decodeUtf8(buffer)
      .split(/\r?\n/)
      .map((line) => line.split(",").map((cell) => cell.trim()).join(" | "))
      .join("\n");

    return { text, parser: "CsvParser", warnings: [] };
  }
}

// PDF support is intentionally dependency-free for now. It extracts readable
// string literals and hex strings so the pipeline works until a full parser is plugged in.
class PdfParser implements DocumentParser {
  readonly type = "pdf";

  extract(buffer: Buffer): ParseResult {
    const raw = buffer.toString("latin1");
    const literalMatches = Array.from(raw.matchAll(/\(([^()]|\\.){3,}\)/g)).map(
      ([match]) =>
        match
          .slice(1, -1)
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\n")
          .replace(/\\t/g, " ")
          .replace(/\\([()\\])/g, "$1")
    );
    const hexMatches = Array.from(raw.matchAll(/<([0-9a-fA-F\s]{8,})>/g)).map(
      ([, hex]) => {
        const bytes = hex.replace(/\s+/g, "");
        return Buffer.from(bytes, "hex").toString("utf8");
      }
    );

    return {
      text: [...literalMatches, ...hexMatches].join("\n"),
      parser: "PdfParser",
      warnings: [
        "Dependency-free PDF extraction is best-effort; Phase 4 can replace it with a full PDF parser.",
      ],
    };
  }
}

// DOCX and PPTX are ZIP-based Office files. This lightweight reader extracts
// XML parts now and leaves a clean boundary for richer Office parsers later.
abstract class OoxmlParser implements DocumentParser {
  abstract readonly type: string;
  abstract readonly xmlPattern: RegExp;
  abstract readonly parserName: string;

  extract(buffer: Buffer): ParseResult {
    const entries = readZipEntries(buffer);
    const xmlParts = entries
      .filter((entry) => this.xmlPattern.test(entry.name))
      .map((entry) => readZipEntry(buffer, entry))
      .filter(Boolean)
      .map((content) => stripXml(content));

    return {
      text: xmlParts.join("\n"),
      parser: this.parserName,
      warnings:
        xmlParts.length === 0
          ? ["No readable Office XML parts were found."]
          : [],
    };
  }
}

class DocxParser extends OoxmlParser {
  readonly type = "docx";
  readonly xmlPattern = /^word\/.*\.xml$/;
  readonly parserName = "DocxParser";
}

class PptxParser extends OoxmlParser {
  readonly type = "pptx";
  readonly xmlPattern = /^ppt\/slides\/.*\.xml$/;
  readonly parserName = "PptxParser";
}

function readZipEntries(buffer: Buffer): ZipEntry[] {
  const entries: ZipEntry[] = [];
  const signature = 0x02014b50;

  for (let offset = 0; offset < buffer.length - 46; offset += 1) {
    if (buffer.readUInt32LE(offset) !== signature) continue;

    const compressionMethod = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const fileNameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer
      .subarray(offset + 46, offset + 46 + fileNameLength)
      .toString("utf8");

    entries.push({
      name,
      compressedSize,
      uncompressedSize,
      compressionMethod,
      localHeaderOffset,
    });

    offset += 45 + fileNameLength + extraLength + commentLength;
  }

  return entries;
}

function readZipEntry(buffer: Buffer, entry: ZipEntry) {
  const offset = entry.localHeaderOffset;

  if (buffer.readUInt32LE(offset) !== 0x04034b50) return "";

  const fileNameLength = buffer.readUInt16LE(offset + 26);
  const extraLength = buffer.readUInt16LE(offset + 28);
  const dataStart = offset + 30 + fileNameLength + extraLength;
  const data = buffer.subarray(dataStart, dataStart + entry.compressedSize);

  if (entry.compressionMethod === 0) {
    return data.toString("utf8");
  }

  if (entry.compressionMethod === 8) {
    return inflateRawSync(data, { finishFlush: 2 }).toString("utf8");
  }

  return "";
}

function getParser(fileType: string): DocumentParser {
  const normalized = fileType.toLowerCase();
  const parsers: DocumentParser[] = [
    new PdfParser(),
    new DocxParser(),
    new PptxParser(),
    new TxtParser(),
    new CsvParser(),
    new MarkdownParser(),
  ];

  return (
    parsers.find((parser) => parser.type === normalized) ?? new TxtParser()
  );
}

// Cleaning removes common extraction noise while preserving paragraph breaks for chunking.
export function cleanKnowledgeText(text: string) {
  const lines = text
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .filter((line) => !/^page\s+\d+$/i.test(line))
    .filter((line) => !/^\d+$/.test(line));

  const counts = new Map<string, number>();
  lines.forEach((line) => counts.set(line, (counts.get(line) ?? 0) + 1));

  return lines
    .filter((line) => (counts.get(line) ?? 0) < 4 || line.length > 80)
    .join("\n\n");
}

function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3));
}

// Chunking targets 500-800 tokens with a 100-token overlap for future embeddings.
export function chunkKnowledgeText(text: string): TextChunk[] {
  const paragraphs = text.split(/\n{2,}/).filter(Boolean);
  const chunks: TextChunk[] = [];
  let current: string[] = [];
  let currentTokens = 0;

  paragraphs.forEach((paragraph) => {
    const paragraphTokens = estimateTokens(paragraph);

    if (currentTokens + paragraphTokens > targetChunkTokens && current.length) {
      const content = current.join("\n\n");
      chunks.push({ content, tokenCount: estimateTokens(content) });

      const overlapWords = content.split(/\s+/).slice(-overlapTokens);
      current = overlapWords.length ? [overlapWords.join(" ")] : [];
      currentTokens = estimateTokens(current.join(" "));
    }

    current.push(paragraph);
    currentTokens += paragraphTokens;
  });

  if (current.length) {
    const content = current.join("\n\n");
    chunks.push({ content, tokenCount: estimateTokens(content) });
  }

  return chunks.filter((chunk) => chunk.content.trim().length > 0);
}

async function logProcessing(
  supabase: SupabaseClient,
  file: KnowledgeFile,
  level: KnowledgeProcessingLog["level"],
  message: string,
  metadata: Record<string, unknown> = {}
) {
  await supabase.from("knowledge_processing_logs").insert({
    business_id: file.business_id,
    knowledge_file_id: file.id,
    level,
    message,
    metadata,
  });
}

// EmbeddingProvider, VectorStore, and SemanticSearch are explicit Phase 4 seams.
export interface EmbeddingProvider {
  embed(text: string): Promise<number[]>;
}

export interface VectorStore {
  upsert(chunkId: string, embedding: number[]): Promise<void>;
}

export interface SemanticSearch {
  search(query: string, businessId: string): Promise<unknown[]>;
}

// This is the complete ingestion pipeline up to ready_for_embedding=true.
export async function processKnowledgeFile(
  supabase: SupabaseClient,
  file: KnowledgeFile
) {
  if (file.business_id !== DEFAULT_BUSINESS_ID) {
    throw new Error("Knowledge file does not belong to the active business.");
  }

  await supabase
    .from("knowledge_files")
    .update({ processing_status: "Processing", updated_at: new Date().toISOString() })
    .eq("id", file.id)
    .eq("business_id", DEFAULT_BUSINESS_ID);
  await logProcessing(supabase, file, "info", "Processing started.");

  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(file.storage_path);

    if (error || !data) {
      throw error ?? new Error("Storage download failed.");
    }

    const buffer = Buffer.from(await data.arrayBuffer());
    const parser = getParser(file.file_type);
    const parsed = parser.extract(buffer);
    const cleanedText = cleanKnowledgeText(parsed.text);
    const chunks = chunkKnowledgeText(cleanedText);

    if (!cleanedText || chunks.length === 0) {
      throw new Error("No usable text could be extracted from this document.");
    }

    await supabase
      .from("knowledge_chunks")
      .delete()
      .eq("knowledge_file_id", file.id)
      .eq("business_id", DEFAULT_BUSINESS_ID);

    await supabase.from("knowledge_chunks").insert(
      chunks.map((chunk, index) => ({
        business_id: DEFAULT_BUSINESS_ID,
        knowledge_file_id: file.id,
        chunk_index: index,
        content: chunk.content,
        token_count: chunk.tokenCount,
        processing_status: "Ready",
        ready_for_embedding: true,
        embedding_status: "not_started",
      }))
    );

    await supabase
      .from("knowledge_files")
      .update({
        processing_status: "Ready",
        chunk_count: chunks.length,
        updated_at: new Date().toISOString(),
      })
      .eq("id", file.id)
      .eq("business_id", DEFAULT_BUSINESS_ID);

    await supabase
      .from("knowledge_items")
      .update({
        ai_learning_status: "Learned",
        embedding_status: "queued",
        knowledge_score: Math.min(100, Math.round(chunks.length * 12)),
        updated_at: new Date().toISOString(),
      })
      .eq("id", file.knowledge_item_id)
      .eq("business_id", DEFAULT_BUSINESS_ID);

    await logProcessing(supabase, file, "info", "Processing completed.", {
      parser: parsed.parser,
      chunk_count: chunks.length,
      average_chunk_tokens: Math.round(
        chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0) / chunks.length
      ),
      warnings: parsed.warnings,
    });

    parsed.warnings.forEach((warning) => {
      void logProcessing(supabase, file, "warning", warning, {
        parser: parsed.parser,
      });
    });

    return { chunkCount: chunks.length, parser: parsed.parser };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown processing error.";

    await supabase
      .from("knowledge_files")
      .update({ processing_status: "Failed", updated_at: new Date().toISOString() })
      .eq("id", file.id)
      .eq("business_id", DEFAULT_BUSINESS_ID);
    await logProcessing(supabase, file, "error", message);

    throw error;
  }
}
