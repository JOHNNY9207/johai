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
