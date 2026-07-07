import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export type Lead = {
  id: string;
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
};

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
