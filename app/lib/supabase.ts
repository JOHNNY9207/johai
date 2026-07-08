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
