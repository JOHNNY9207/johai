import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const DEFAULT_BUSINESS_ID = "00000000-0000-0000-0000-000000000001";

export type Business = {
  id: string;
  name: string;
  slug: string;
  status: string;
  plan?: string;
  owner_email?: string;
  created_at?: string;
};

export const onboardingStatuses = [
  "not_started",
  "in_progress",
  "completed",
] as const;

export type OnboardingStatus = (typeof onboardingStatuses)[number];

export type BusinessSettings = {
  id: string;
  business_id: string;
  booking_url?: string;
  calendly_user_uri?: string;
  calendly_account_name?: string;
  calendly_account_email?: string;
  email_provider?: string;
  email_api_key?: string;
  email_from?: string;
  email_owner?: string;
  ai_assistant_name?: string;
  ai_system_prompt?: string;
  onboarding_status?: OnboardingStatus;
  company_profile?: Record<string, unknown>;
  ai_assistant_config?: Record<string, unknown>;
  services_config?: Record<string, unknown>;
  communication_config?: Record<string, unknown>;
  onboarding_completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type BusinessBrain = {
  id: string;
  business_id: string;
  industry?: string;
  business_profile?: Record<string, unknown>;
  products?: unknown[];
  services?: unknown[];
  pricing?: Record<string, unknown>;
  opening_hours?: Record<string, unknown>;
  languages?: string[];
  tone_of_voice?: string;
  target_customers?: string[];
  policies?: Record<string, unknown>;
  frequently_asked_questions?: unknown[];
  booking_rules?: Record<string, unknown>;
  lead_qualification_rules?: Record<string, unknown>;
  escalation_rules?: Record<string, unknown>;
  communication_rules?: Record<string, unknown>;
  vocabulary?: string[];
  industry_template?: string;
  profile_score?: number;
  recommendations?: unknown[];
  created_at?: string;
  updated_at?: string;
};

export type BusinessBrainScore = {
  businessInformationCompleteness: number;
  knowledgeCompleteness: number;
  servicesDocumented: number;
  policiesDocumented: number;
  faqDocumented: number;
  websiteImported: number;
  aiReadiness: number;
  overallScore: number;
};

export type BusinessBrainRecommendation = {
  title: string;
  detail: string;
  priority: "low" | "medium" | "high";
  category: string;
};

export type AuditModuleStatus = "excellent" | "good" | "needs_attention" | "critical" | "not_connected";

export type AuditPriority = "low" | "medium" | "high" | "critical";

export type AuditRecommendation = {
  title: string;
  detail: string;
  priority: AuditPriority;
  module: string;
};

export type AuditResult = {
  module: string;
  score: number;
  status: AuditModuleStatus;
  issues: string[];
  strengths: string[];
  recommendations: AuditRecommendation[];
  priority: AuditPriority;
};

export type AuditScore = {
  overallBusinessScore: number;
  aiReadinessScore: number;
  automationScore: number;
  knowledgeScore: number;
  marketingScore: number;
  crmScore: number;
};

export type AuditReport = {
  id?: string;
  business_id: string;
  lead_id?: string | null;
  status: string;
  audit_type?: string;
  summary?: string;
  scores?: AuditScore;
  module_results?: AuditResult[];
  recommendations?: AuditRecommendation[];
  executive_summary?: string;
  detailed_report?: Record<string, unknown>;
  action_plan?: unknown[];
  implementation_roadmap?: unknown[];
  report_status?: string;
  created_at?: string;
  updated_at?: string;
  completed_at?: string | null;
};

export type Lead = {
  id: string;
  business_id?: string;
  created_at?: string;
  first_name: string;
  email: string;
  business_name: string;
  business_type: string;
  biggest_problem: string;
  ai_recommendations?: string;
  conversation?: unknown;
  status?: LeadStatus;
  notes?: string;
  is_test?: boolean;
  source?: string;
  booking_date?: string;
  booking_time?: string;
  next_meeting_at?: string;
  meeting_status?: string;
  calendly_event_uri?: string;
  calendly_invitee_uri?: string;
  owner_email_sent?: boolean;
  prospect_email_sent?: boolean;
  email_error?: string;
  follow_up_status?: FollowUpStatus;
  last_follow_up_at?: string;
  follow_up_count?: number;
  booked_meeting?: boolean;
};

export const knowledgeSections = [
  "Documents",
  "Website Import",
  "FAQ",
  "Products",
  "Procedures",
  "Policies",
] as const;

export type KnowledgeSection = (typeof knowledgeSections)[number];

export const aiLearningStatuses = [
  "Not learned",
  "Ready to learn",
  "Learning queued",
  "Learned",
] as const;

export type AiLearningStatus = (typeof aiLearningStatuses)[number];

export type KnowledgeItem = {
  id: string;
  business_id: string;
  section: KnowledgeSection;
  source_type: string;
  title: string;
  file_name?: string;
  file_type?: string;
  file_size?: number;
  url?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  ai_learning_status?: AiLearningStatus;
  embedding_status?: string;
  embedding_model?: string;
  embedding_vector_id?: string;
  knowledge_score?: number;
  created_at?: string;
  updated_at?: string;
};

export const knowledgeUploadStatuses = [
  "Uploading",
  "Uploaded",
  "Failed",
] as const;

export type KnowledgeUploadStatus = (typeof knowledgeUploadStatuses)[number];

export const knowledgeProcessingStatuses = [
  "Queued",
  "Processing",
  "Ready",
  "Failed",
] as const;

export type KnowledgeProcessingStatus =
  (typeof knowledgeProcessingStatuses)[number];

export type KnowledgeFile = {
  id: string;
  business_id: string;
  knowledge_item_id: string;
  filename: string;
  original_filename: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  storage_path: string;
  upload_status: KnowledgeUploadStatus;
  processing_status: KnowledgeProcessingStatus;
  chunk_count: number;
  created_at?: string;
  updated_at?: string;
};

export type KnowledgeChunk = {
  id: string;
  business_id: string;
  knowledge_file_id: string;
  chunk_index: number;
  content: string;
  token_count: number;
  processing_status?: string;
  ready_for_embedding?: boolean;
  embedding_status: string;
  embedding_provider?: string;
  vector_store_status?: string;
  created_at?: string;
};

export type KnowledgeProcessingLog = {
  id: string;
  business_id: string;
  knowledge_file_id: string;
  level: "info" | "warning" | "error";
  message: string;
  metadata?: Record<string, unknown>;
  created_at?: string;
};

export const orchestrationIntents = [
  "General Question",
  "Pricing Request",
  "Book Appointment",
  "Need Human",
  "Complaint",
  "Sales Opportunity",
  "Existing Customer",
  "Support Request",
  "Quote Request",
  "Document Upload",
  "Unknown",
] as const;

export type OrchestrationIntent = (typeof orchestrationIntents)[number];

export const orchestrationActions = [
  "CreateLead",
  "UpdateLead",
  "SearchKnowledge",
  "SearchSemanticMemory",
  "GenerateAudit",
  "ScheduleCalendly",
  "SendEmail",
  "CreateTask",
  "NotifyOwner",
  "AssignFollowUp",
  "StopAutomation",
  "EscalateHuman",
  "SaveConversation",
] as const;

export type OrchestrationAction = (typeof orchestrationActions)[number];

export type OrchestrationLog = {
  id: string;
  business_id: string;
  lead_id?: string | null;
  conversation: unknown;
  detected_intent: OrchestrationIntent;
  confidence: number;
  required_actions: OrchestrationAction[];
  executed_actions: unknown;
  priority: string;
  business_context?: Record<string, unknown>;
  knowledge_context?: Record<string, unknown>;
  crm_context?: Record<string, unknown>;
  execution_time_ms: number;
  result: string;
  errors?: unknown;
  channel: string;
  created_at?: string;
};

export const followUpStatuses = [
  "Waiting",
  "Reminder 1 sent",
  "Reminder 2 sent",
  "Final reminder sent",
  "Meeting booked",
] as const;

export type FollowUpStatus = (typeof followUpStatuses)[number];

export const leadStatuses = [
  "New",
  "Contacted",
  "Qualified",
  "Booked",
  "Closed",
] as const;

export type LeadStatus = (typeof leadStatuses)[number];

function assertSupabaseEnv() {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase environment variables are missing.");
  }
}

export function createSupabaseServerClient() {
  assertSupabaseEnv();

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
