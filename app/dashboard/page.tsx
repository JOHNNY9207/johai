import { redirect } from "next/navigation";
import {
  getDashboardSetupError,
  isDashboardAuthenticated,
  isDashboardPasswordConfigured,
} from "@/app/lib/dashboard-auth";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  type Business,
  type BusinessBrain,
  type BusinessBrainRecommendation,
  type BusinessSettings,
  type AuditReport,
  type KnowledgeItem,
  type Lead,
  type OnboardingStatus,
  type OrchestrationLog,
} from "@/app/lib/supabase";
import { createBusinessBrainService } from "@/app/lib/business-brain";
import { createAuditEngine } from "@/app/lib/audit-engine";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  if (!isDashboardPasswordConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08111f] px-6 py-12 text-white">
        <div className="w-full max-w-xl rounded-2xl border border-red-500/30 bg-[#111827] p-8 shadow-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
            Setup Required
          </p>
          <h1 className="text-3xl font-bold">Dashboard password missing</h1>
          <p className="mt-4 leading-7 text-gray-300">
            {getDashboardSetupError()}
          </p>
        </div>
      </main>
    );
  }

  if (!(await isDashboardAuthenticated())) {
    redirect("/dashboard/login");
  }

  const supabase = createSupabaseServerClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: true });
  const { data: settings } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .maybeSingle();
  const { data: businessBrain } = await supabase
    .from("business_brains")
    .select("*")
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .maybeSingle();
  const { data: knowledgeItems } = await supabase
    .from("knowledge_items")
    .select("*")
    .eq("business_id", DEFAULT_BUSINESS_ID);
  const { data: orchestrationLogs } = await supabase
    .from("ai_orchestration_logs")
    .select("*")
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .order("created_at", { ascending: false })
    .limit(100);
  const { data: audits } = await supabase
    .from("audits")
    .select("*")
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .order("created_at", { ascending: false })
    .limit(20);

  const leadList = (leads ?? []) as Lead[];
  const businessList = (businesses ?? []) as Business[];
  const auditHistory = (audits ?? []) as AuditReport[];
  const onboardingStatus =
    (settings?.onboarding_status as OnboardingStatus | undefined) ??
    "not_started";
  const businessBrainSnapshot = createBusinessBrainService().buildSnapshot({
    business: businessList[0] ?? null,
    settings: (settings ?? null) as BusinessSettings | null,
    brain: (businessBrain ?? null) as BusinessBrain | null,
    knowledgeItems: (knowledgeItems ?? []) as KnowledgeItem[],
  });
  const autonomousAudit = createAuditEngine().generate({
    business: businessList[0] ?? null,
    settings: (settings ?? null) as BusinessSettings | null,
    brain: (businessBrain ?? null) as BusinessBrain | null,
    brainScore: businessBrainSnapshot.score,
    knowledgeItems: (knowledgeItems ?? []) as KnowledgeItem[],
    leads: leadList,
    orchestrationLogs: (orchestrationLogs ?? []) as OrchestrationLog[],
    previousAudits: auditHistory,
  });

  return (
    <DashboardClient
      leads={leadList}
      businesses={businessList}
      orchestrationLogs={(orchestrationLogs ?? []) as OrchestrationLog[]}
      onboardingStatus={onboardingStatus}
      businessBrainScore={businessBrainSnapshot.score}
      businessBrainRecommendations={
        businessBrainSnapshot.recommendations as BusinessBrainRecommendation[]
      }
      businessBrainIndustry={businessBrainSnapshot.industry}
      businessBrainVocabulary={businessBrainSnapshot.vocabulary}
      businessBrainTemplate={businessBrainSnapshot.template}
      autonomousAudit={autonomousAudit}
      auditHistory={auditHistory}
      loadError={Boolean(error)}
    />
  );
}
