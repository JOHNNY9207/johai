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
  type KnowledgeFile,
  type KnowledgeItem,
  type Lead,
  type OnboardingStatus,
  type OrchestrationLog,
} from "@/app/lib/supabase";
import { createBusinessBrainService } from "@/app/lib/business-brain";
import { createAuditEngine } from "@/app/lib/audit-engine";
import { createMorningBriefService } from "@/app/lib/morning-brief";
import { createExecutiveInsightEngine } from "@/app/lib/chief-of-staff";
import { createBillingService } from "@/app/lib/billing";
import { createCustomerLifecycleService } from "@/app/lib/customer-lifecycle";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

type SetupStatus = "complete" | "warning" | "missing";

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasArrayItems(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? value as Record<string, unknown> : {};
}

function setupStatus(isComplete: boolean, isPartial = false): SetupStatus {
  if (isComplete) {
    return "complete";
  }

  return isPartial ? "warning" : "missing";
}

function formatTimelineTime(date?: string) {
  if (!date) {
    return "Ready";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function isToday(date?: string) {
  if (!date) {
    return false;
  }

  return new Date(date).toDateString() === new Date().toDateString();
}

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
  const { data: knowledgeFiles } = await supabase
    .from("knowledge_files")
    .select("*")
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .order("created_at", { ascending: false });
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
  const settingsRecord = (settings ?? null) as BusinessSettings | null;
  const knowledgeItemList = (knowledgeItems ?? []) as KnowledgeItem[];
  const knowledgeFileList = (knowledgeFiles ?? []) as KnowledgeFile[];
  const auditHistory = (audits ?? []) as AuditReport[];
  const onboardingStatus =
    (settings?.onboarding_status as OnboardingStatus | undefined) ??
    "not_started";
  const businessBrainSnapshot = createBusinessBrainService().buildSnapshot({
    business: businessList[0] ?? null,
    settings: settingsRecord,
    brain: (businessBrain ?? null) as BusinessBrain | null,
    knowledgeItems: knowledgeItemList,
  });
  const autonomousAudit = createAuditEngine().generate({
    business: businessList[0] ?? null,
    settings: settingsRecord,
    brain: (businessBrain ?? null) as BusinessBrain | null,
    brainScore: businessBrainSnapshot.score,
    knowledgeItems: knowledgeItemList,
    leads: leadList,
    orchestrationLogs: (orchestrationLogs ?? []) as OrchestrationLog[],
    previousAudits: auditHistory,
  });
  const morningBrief = createMorningBriefService().build({
    business: businessList[0] ?? null,
    settings: settingsRecord,
    businessBrainScore: businessBrainSnapshot.score,
    businessBrainRecommendations:
      businessBrainSnapshot.recommendations as BusinessBrainRecommendation[],
    autonomousAudit,
    auditHistory,
    leads: leadList,
    knowledgeItems: knowledgeItemList,
    knowledgeFiles: knowledgeFileList,
    orchestrationLogs: (orchestrationLogs ?? []) as OrchestrationLog[],
  });
  const chiefOfStaffBriefing = createExecutiveInsightEngine().build({
    business: businessList[0] ?? null,
    settings: settingsRecord,
    businessBrainScore: businessBrainSnapshot.score,
    businessBrainRecommendations:
      businessBrainSnapshot.recommendations as BusinessBrainRecommendation[],
    autonomousAudit,
    auditHistory,
    leads: leadList,
    knowledgeItems: knowledgeItemList,
    knowledgeFiles: knowledgeFileList,
    orchestrationLogs: (orchestrationLogs ?? []) as OrchestrationLog[],
  });
  const subscription = createBillingService().buildSubscription({
    business: businessList[0] ?? null,
    leads: leadList,
    knowledgeFiles: knowledgeFileList,
    orchestrationLogs: (orchestrationLogs ?? []) as OrchestrationLog[],
  });
  const customerSuccess = createCustomerLifecycleService().build({
    business: businessList[0] ?? null,
    businesses: businessList,
    subscription,
    leads: leadList,
    knowledgeFiles: knowledgeFileList,
    orchestrationLogs: (orchestrationLogs ?? []) as OrchestrationLog[],
    auditHistory,
    businessBrainScore: businessBrainSnapshot.score,
    onboardingStatus,
  });
  const companyProfile = asRecord(settingsRecord?.company_profile);
  const servicesConfig = asRecord(settingsRecord?.services_config);
  const communicationConfig = asRecord(settingsRecord?.communication_config);
  const services = servicesConfig.services;
  const commonQuestions =
    servicesConfig.commonQuestions ?? servicesConfig.common_questions;
  const businessProfileReady =
    hasText(companyProfile.businessName) ||
    hasText(companyProfile.business_name) ||
    hasText(businessList[0]?.name);
  const businessProfilePartial =
    hasText(companyProfile.industry) ||
    hasText(companyProfile.website) ||
    hasText(companyProfile.description);
  const documentsLearned = knowledgeFileList.filter(
    (file) => file.processing_status === "Ready"
  ).length;
  const knowledgeReady =
    knowledgeItemList.some((item) => item.ai_learning_status === "Learned") ||
    documentsLearned > 0;
  const calendlyReady =
    hasText(settingsRecord?.calendly_user_uri) ||
    hasText(settingsRecord?.booking_url) ||
    hasText(communicationConfig.bookingUrl);
  const emailReady =
    hasText(settingsRecord?.email_from) ||
    hasText(settingsRecord?.email_owner) ||
    hasText(communicationConfig.emailSenderStatus);
  const websiteReady =
    hasText(companyProfile.website) ||
    knowledgeItemList.some((item) => item.section === "Website Import");
  const faqReady =
    hasArrayItems(commonQuestions) ||
    knowledgeItemList.some((item) => item.section === "FAQ");
  const servicesReady =
    hasArrayItems(services) ||
    Boolean((businessBrain ?? null as BusinessBrain | null)?.services?.length);
  const automationReady =
    (orchestrationLogs ?? []).length > 0 ||
    leadList.some((lead) => Boolean(lead.follow_up_status));
  const setupItems = [
    {
      label: "Business Profile",
      status: setupStatus(businessProfileReady, businessProfilePartial),
      detail: businessProfileReady ? "Core business identity is ready." : "Add company basics.",
    },
    {
      label: "Knowledge",
      status: setupStatus(knowledgeReady, knowledgeItemList.length > 0),
      detail: knowledgeReady ? "Documents are available for AI learning." : "Upload source documents.",
    },
    {
      label: "Calendly",
      status: setupStatus(calendlyReady),
      detail: calendlyReady ? "Booking flow is connected." : "Connect booking link.",
    },
    {
      label: "Website",
      status: setupStatus(websiteReady),
      detail: websiteReady ? "Website context is available." : "Add or import website.",
    },
    {
      label: "FAQ",
      status: setupStatus(faqReady, knowledgeItemList.length > 0),
      detail: faqReady ? "FAQ content is ready." : "Import common questions.",
    },
    {
      label: "Services",
      status: setupStatus(servicesReady, Boolean(businessBrainSnapshot.template)),
      detail: servicesReady ? "Services are documented." : "Add services and pricing notes.",
    },
    {
      label: "Automation",
      status: setupStatus(automationReady, leadList.length > 0),
      detail: automationReady ? "Automation signals are active." : "Start with lead follow-up rules.",
    },
  ] as const;
  const completedSetupItems = setupItems.filter((item) => item.status === "complete").length;
  const gettingStartedProgress = Math.round(
    (completedSetupItems / setupItems.length) * 100
  );
  const remainingSetupItems = setupItems.length - completedSetupItems;
  const bookingToday = leadList.filter(
    (lead) =>
      lead.booked_meeting &&
      isToday(lead.next_meeting_at ?? lead.booking_date ?? lead.created_at)
  ).length;
  const leadsCapturedToday = leadList.filter((lead) => isToday(lead.created_at)).length;
  const emailsSentToday = leadList.filter(
    (lead) => isToday(lead.created_at) && (lead.owner_email_sent || lead.prospect_email_sent)
  ).length;
  const recommendationsCount =
    businessBrainSnapshot.recommendations.length +
    (autonomousAudit.recommendations?.length ?? 0);
  const missingInformationCount = setupItems.filter(
    (item) => item.status !== "complete"
  ).length;
  const taskCandidates = [
    !servicesReady && {
      title: "Upload your pricing",
      detail: "Give the AI accurate pricing notes before it qualifies prospects.",
      priority: "high",
      category: "Services",
    },
    {
      title: "Connect Google Business",
      detail: "Prepare local trust data for the next audit connector phase.",
      priority: "medium",
      category: "Marketing",
    },
    !faqReady && {
      title: "Import your FAQ",
      detail: "Teach JOHAI the answers prospects ask every day.",
      priority: "high",
      category: "Knowledge",
    },
    businessBrainSnapshot.score.policiesDocumented < 70 && {
      title: "Add cancellation policy",
      detail: "Reduce booking confusion with clear rules.",
      priority: "medium",
      category: "Policies",
    },
    !websiteReady && {
      title: "Import website",
      detail: "Let the AI learn offers, positioning, and contact details.",
      priority: "high",
      category: "Website",
    },
    !calendlyReady && {
      title: "Connect Calendly",
      detail: "Turn qualified conversations into booked meetings.",
      priority: "high",
      category: "Booking",
    },
    !emailReady && {
      title: "Configure email sender",
      detail: "Enable confirmations, owner alerts, and follow-ups.",
      priority: "medium",
      category: "Email",
    },
  ].filter(
    (
      task
    ): task is {
      title: string;
      detail: string;
      priority: string;
      category: string;
    } => Boolean(task)
  );
  const latestKnowledgeFile = knowledgeFileList[0];
  const websiteItem = knowledgeItemList.find((item) => item.section === "Website Import");
  const gettingStarted = {
    welcomeMessage: businessProfileReady
      ? `Welcome back. JOHAI is preparing ${businessList[0]?.name ?? "your business"} for autonomous AI work.`
      : "Welcome to JOHAI. Complete the essentials so your AI employee can start producing value today.",
    progress: gettingStartedProgress,
    estimatedSetupTime:
      remainingSetupItems === 0
        ? "Ready now"
        : `${Math.max(10, remainingSetupItems * 8)} min remaining`,
    aiReadiness: businessBrainSnapshot.score.aiReadiness,
    businessBrainProgress: businessBrainSnapshot.score.overallScore,
    knowledgeProgress: knowledgeReady
      ? Math.max(70, businessBrainSnapshot.score.knowledgeCompleteness)
      : businessBrainSnapshot.score.knowledgeCompleteness,
    calendlyStatus: setupStatus(calendlyReady),
    emailStatus: setupStatus(emailReady),
    websiteStatus: setupStatus(websiteReady),
    setupItems,
    dailyReport: {
      documentsLearned,
      leadsCaptured: leadsCapturedToday,
      appointmentsBooked: bookingToday,
      emailsSent: emailsSentToday,
      recommendations: recommendationsCount,
      missingInformation: missingInformationCount,
    },
    tasks: taskCandidates.slice(0, 6),
    timeline: [
      {
        time: formatTimelineTime(settingsRecord?.created_at ?? businessList[0]?.created_at),
        title: "Workspace created.",
        detail: "Default JOHAI business is active.",
        status: "complete" as const,
      },
      {
        time: websiteReady ? formatTimelineTime(websiteItem?.created_at) : "Pending",
        title: "Website imported.",
        detail: websiteReady ? "Website context is available." : "Import the website to enrich answers.",
        status: websiteReady ? "complete" as const : "pending" as const,
      },
      {
        time: formatTimelineTime(settingsRecord?.updated_at),
        title: "Business Brain updated.",
        detail: `${businessBrainSnapshot.score.overallScore}% profile health.`,
        status: businessBrainSnapshot.score.overallScore > 0 ? "complete" as const : "pending" as const,
      },
      {
        time: documentsLearned > 0 ? formatTimelineTime(latestKnowledgeFile?.updated_at) : "Pending",
        title: "Knowledge processed.",
        detail: `${documentsLearned} document${documentsLearned === 1 ? "" : "s"} ready.`,
        status: documentsLearned > 0 ? "complete" as const : "pending" as const,
      },
      {
        time: formatTimelineTime(auditHistory[0]?.created_at),
        title: "Audit completed.",
        detail: `${autonomousAudit.scores?.overallBusinessScore ?? 0}% current audit score.`,
        status: autonomousAudit.scores ? "complete" as const : "pending" as const,
      },
      {
        time: automationReady ? formatTimelineTime((orchestrationLogs ?? [])[0]?.created_at) : "Pending",
        title: "Follow-up engine ready.",
        detail: automationReady ? "Automation signals are online." : "Needs one active lead or automation run.",
        status: automationReady ? "complete" as const : "pending" as const,
      },
    ],
  };

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
      morningBrief={morningBrief}
      chiefOfStaffBriefing={chiefOfStaffBriefing}
      subscription={subscription}
      customerSuccess={customerSuccess}
      gettingStarted={gettingStarted}
      loadError={Boolean(error)}
    />
  );
}
