import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import {
  aiLearningStatuses,
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  knowledgeSections,
  type AiLearningStatus,
  type KnowledgeItem,
  type KnowledgeSection,
} from "@/app/lib/supabase";

type KnowledgePayload = {
  section?: KnowledgeSection;
  source_type?: string;
  title?: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  url?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  ai_learning_status?: AiLearningStatus;
};

function cleanText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function cleanNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function normalizeSection(value: unknown): KnowledgeSection {
  return knowledgeSections.includes(value as KnowledgeSection)
    ? (value as KnowledgeSection)
    : "Documents";
}

function normalizeLearningStatus(value: unknown): AiLearningStatus {
  return aiLearningStatuses.includes(value as AiLearningStatus)
    ? (value as AiLearningStatus)
    : "Ready to learn";
}

function normalizeMetadata(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function GET() {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("knowledge_items")
      .select("*")
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ items: (data ?? []) as KnowledgeItem[] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge items could not be loaded." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as KnowledgePayload;
    const title = cleanText(body.title || body.file_name || body.url);

    if (!title) {
      return NextResponse.json(
        { error: "A knowledge title is required." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("knowledge_items")
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        section: normalizeSection(body.section),
        source_type: cleanText(body.source_type) || "manual",
        title,
        file_name: cleanText(body.file_name),
        file_type: cleanText(body.file_type),
        file_size: cleanNumber(body.file_size),
        url: cleanText(body.url),
        content: cleanText(body.content),
        metadata: normalizeMetadata(body.metadata),
        ai_learning_status: normalizeLearningStatus(body.ai_learning_status),
        embedding_status: "not_started",
        embedding_model: "",
        embedding_vector_id: "",
        knowledge_score: 0,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ item: data as KnowledgeItem });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge item could not be saved." },
      { status: 500 }
    );
  }
}
