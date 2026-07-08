import type {
  AuditReport,
  Business,
  BusinessBrainScore,
  KnowledgeFile,
  Lead,
  OnboardingStatus,
  OrchestrationLog,
} from "@/app/lib/supabase";
import type { BillingPlanKey, SubscriptionModel } from "@/app/lib/billing";

export type CustomerLifecycleStatus =
  | "Lead"
  | "Trial Started"
  | "Trial Active"
  | "Trial Ending Soon"
  | "Converted"
  | "Active"
  | "Past Due"
  | "Suspended"
  | "Cancelled"
  | "Archived";

export type CustomerTimelineEvent = {
  label: string;
  status: "completed" | "pending";
  date?: string;
  detail: string;
};

export type CustomerHealthScore = {
  adoptionScore: number;
  featureUsage: number;
  knowledgeCompletion: number;
  automationCompletion: number;
  businessBrainCompletion: number;
  engagementScore: number;
  overallHealth: number;
};

export type CustomerLifecycleRisk = {
  title: string;
  detail: string;
  severity: "High" | "Medium" | "Low";
};

export type CustomerSuccessRecommendation = {
  title: string;
  reason: string;
  priority: "High" | "Medium" | "Low";
};

export type CustomerLifecycleModel = {
  businessName: string;
  lifecycleStatus: CustomerLifecycleStatus;
  currentPlan: string;
  trialDaysRemaining: number;
  timeline: CustomerTimelineEvent[];
  healthScore: CustomerHealthScore;
  risks: CustomerLifecycleRisk[];
  recommendations: CustomerSuccessRecommendation[];
};

export type CustomerSuccessDashboard = {
  activeTrials: number;
  trialsEndingSoon: number;
  conversionRate: number;
  customersByPlan: Record<BillingPlanKey, number>;
  mrrPlaceholder: string;
  arrPlaceholder: string;
  churnPlaceholder: string;
  lifecycle: CustomerLifecycleModel;
};

export type CustomerLifecycleInput = {
  business: Business | null;
  businesses: Business[];
  subscription: SubscriptionModel;
  leads: Lead[];
  knowledgeFiles: KnowledgeFile[];
  orchestrationLogs: OrchestrationLog[];
  auditHistory: AuditReport[];
  businessBrainScore: BusinessBrainScore;
  onboardingStatus: OnboardingStatus;
};

export interface CustomerLifecycleConnector {
  syncCustomer(lifecycle: CustomerLifecycleModel): Promise<void>;
}

export type CustomerLifecycleDependencies = {
  stripeConnector?: CustomerLifecycleConnector;
  paddleConnector?: CustomerLifecycleConnector;
  chargebeeConnector?: CustomerLifecycleConnector;
  hubspotConnector?: CustomerLifecycleConnector;
  intercomConnector?: CustomerLifecycleConnector;
};

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function normalizePlan(plan?: string): BillingPlanKey {
  const key = (plan ?? "starter").toLowerCase().replace(/\s+/g, "_");

  if (key === "starter" || key === "professional" || key === "enterprise" || key === "enterprise_plus") {
    return key;
  }

  return "starter";
}

function formatDate(date?: string) {
  return date ? new Date(date).toISOString() : undefined;
}

export class CustomerLifecycleService {
  constructor(private readonly dependencies: CustomerLifecycleDependencies = {}) {}

  build(input: CustomerLifecycleInput): CustomerSuccessDashboard {
    const lifecycle = this.buildLifecycle(input);
    const activeTrials = input.subscription.status === "trialing" ? 1 : 0;
    const trialsEndingSoon =
      input.subscription.status === "trialing" && input.subscription.trialDaysRemaining <= 3
        ? 1
        : 0;
    const convertedCustomers = input.businesses.filter(
      (business) => business.status === "active" || business.status === "converted"
    ).length;
    const conversionRate =
      input.businesses.length > 0
        ? Math.round((convertedCustomers / input.businesses.length) * 100)
        : lifecycle.lifecycleStatus === "Active"
          ? 100
          : 0;
    const customersByPlan = input.businesses.reduce<Record<BillingPlanKey, number>>(
      (counts, business) => {
        counts[normalizePlan(business.plan)] += 1;
        return counts;
      },
      { starter: 0, professional: 0, enterprise: 0, enterprise_plus: 0 }
    );

    if (input.business && input.businesses.length === 0) {
      customersByPlan[input.subscription.currentPlan.key] = 1;
    }

    return {
      activeTrials,
      trialsEndingSoon,
      conversionRate,
      customersByPlan,
      mrrPlaceholder: "Pending billing provider",
      arrPlaceholder: "Pending billing provider",
      churnPlaceholder: "Pending billing provider",
      lifecycle,
    };
  }

  // Connectors are intentionally injected so Stripe, Paddle, Chargebee,
  // HubSpot, and Intercom can sync lifecycle state later without changing the
  // core lifecycle scoring model.
  async sync(input: CustomerLifecycleInput) {
    const dashboard = this.build(input);
    const connectors = [
      this.dependencies.stripeConnector,
      this.dependencies.paddleConnector,
      this.dependencies.chargebeeConnector,
      this.dependencies.hubspotConnector,
      this.dependencies.intercomConnector,
    ].filter(Boolean);

    await Promise.all(
      connectors.map((connector) => connector!.syncCustomer(dashboard.lifecycle))
    );

    return dashboard;
  }

  private buildLifecycle(input: CustomerLifecycleInput): CustomerLifecycleModel {
    const lifecycleStatus = this.determineStatus(input);
    const healthScore = this.buildHealthScore(input);
    const timeline = this.buildTimeline(input);
    const risks = this.detectRisks(input, healthScore);
    const recommendations = this.buildRecommendations(input, risks);

    return {
      businessName: input.business?.name ?? "Default business",
      lifecycleStatus,
      currentPlan: input.subscription.currentPlan.name,
      trialDaysRemaining: input.subscription.trialDaysRemaining,
      timeline,
      healthScore,
      risks,
      recommendations,
    };
  }

  private determineStatus(input: CustomerLifecycleInput): CustomerLifecycleStatus {
    const businessStatus = input.business?.status?.toLowerCase();

    if (businessStatus === "archived") return "Archived";
    if (businessStatus === "cancelled" || input.subscription.status === "canceled") return "Cancelled";
    if (businessStatus === "suspended") return "Suspended";
    if (input.subscription.status === "past_due") return "Past Due";
    if (input.subscription.status === "active") return "Active";
    if (input.subscription.status === "trialing" && input.subscription.trialDaysRemaining <= 3) return "Trial Ending Soon";
    if (input.subscription.status === "trialing" && input.onboardingStatus === "completed") return "Trial Active";
    if (input.subscription.status === "trialing") return "Trial Started";

    return input.leads.length > 0 ? "Lead" : "Trial Started";
  }

  private buildHealthScore(input: CustomerLifecycleInput): CustomerHealthScore {
    const adoptionScore = input.onboardingStatus === "completed" ? 90 : input.onboardingStatus === "in_progress" ? 55 : 20;
    const enabledFeatures = Object.values(input.subscription.featuresEnabled).filter(Boolean).length;
    const featureUsage = clampScore(enabledFeatures * 12 + input.orchestrationLogs.length * 2);
    const knowledgeCompletion = clampScore(input.businessBrainScore.knowledgeCompleteness);
    const automationCompletion = clampScore(input.orchestrationLogs.length > 0 ? 75 : 20);
    const businessBrainCompletion = clampScore(input.businessBrainScore.overallScore);
    const conversations = input.leads.filter((lead) => Array.isArray(lead.conversation)).length;
    const engagementScore = clampScore(input.leads.length * 8 + conversations * 12);
    const overallHealth = clampScore(
      (
        adoptionScore +
        featureUsage +
        knowledgeCompletion +
        automationCompletion +
        businessBrainCompletion +
        engagementScore
      ) / 6
    );

    return {
      adoptionScore,
      featureUsage,
      knowledgeCompletion,
      automationCompletion,
      businessBrainCompletion,
      engagementScore,
      overallHealth,
    };
  }

  private buildTimeline(input: CustomerLifecycleInput): CustomerTimelineEvent[] {
    const firstConversation = input.leads.find((lead) => Array.isArray(lead.conversation));
    const firstAppointment = input.leads.find((lead) => lead.next_meeting_at || lead.booking_date);

    return [
      {
        label: "Signup",
        status: input.business?.created_at ? "completed" : "pending",
        date: formatDate(input.business?.created_at),
        detail: "Business account created.",
      },
      {
        label: "Onboarding completed",
        status: input.onboardingStatus === "completed" ? "completed" : "pending",
        detail: "Company profile, AI setup, services, and communication settings completed.",
      },
      {
        label: "Business Brain completed",
        status: input.businessBrainScore.overallScore >= 80 ? "completed" : "pending",
        detail: `${input.businessBrainScore.overallScore}% Business Brain health.`,
      },
      {
        label: "Knowledge uploaded",
        status: input.knowledgeFiles.length > 0 ? "completed" : "pending",
        date: formatDate(input.knowledgeFiles[0]?.created_at),
        detail: `${input.knowledgeFiles.length} knowledge file${input.knowledgeFiles.length === 1 ? "" : "s"} uploaded.`,
      },
      {
        label: "First conversation",
        status: firstConversation ? "completed" : "pending",
        date: formatDate(firstConversation?.created_at),
        detail: "First saved AI conversation.",
      },
      {
        label: "First lead",
        status: input.leads.length > 0 ? "completed" : "pending",
        date: formatDate(input.leads[0]?.created_at),
        detail: "First customer lead captured.",
      },
      {
        label: "First appointment",
        status: firstAppointment ? "completed" : "pending",
        date: formatDate(firstAppointment?.next_meeting_at ?? firstAppointment?.booking_date),
        detail: "First meeting booked.",
      },
      {
        label: "First audit",
        status: input.auditHistory.length > 0 ? "completed" : "pending",
        date: formatDate(input.auditHistory[0]?.created_at),
        detail: "First AI audit generated.",
      },
      {
        label: "Trial conversion",
        status: input.subscription.status === "active" ? "completed" : "pending",
        detail: "Trial converted into a paid subscription.",
      },
      {
        label: "Subscription",
        status: ["active", "trialing"].includes(input.subscription.status) ? "completed" : "pending",
        date: formatDate(input.subscription.renewalDate),
        detail: `${input.subscription.currentPlan.name} plan status: ${input.subscription.status}.`,
      },
    ];
  }

  private detectRisks(input: CustomerLifecycleInput, health: CustomerHealthScore): CustomerLifecycleRisk[] {
    const risks: CustomerLifecycleRisk[] = [];
    const conversations = input.leads.filter((lead) => Array.isArray(lead.conversation)).length;
    const appointments = input.leads.filter((lead) => lead.next_meeting_at || lead.booking_date).length;

    if (health.engagementScore < 30) {
      risks.push({ title: "Inactive business", detail: "The account has low engagement signals.", severity: "High" });
    }
    if (input.orchestrationLogs.length === 0) {
      risks.push({ title: "Low usage", detail: "No AI orchestration activity has been recorded.", severity: "High" });
    }
    if (conversations === 0) {
      risks.push({ title: "No conversations", detail: "No saved customer conversations exist yet.", severity: "Medium" });
    }
    if (input.knowledgeFiles.length === 0) {
      risks.push({ title: "Knowledge missing", detail: "No knowledge files have been uploaded.", severity: "High" });
    }
    if (appointments === 0) {
      risks.push({ title: "No appointments", detail: "No appointments have been booked yet.", severity: "Medium" });
    }
    if (health.automationCompletion < 50) {
      risks.push({ title: "No automation", detail: "Automation usage is not established yet.", severity: "Medium" });
    }
    if (input.businessBrainScore.aiReadiness < 60) {
      risks.push({ title: "Low AI confidence", detail: "AI readiness is below the recommended threshold.", severity: "High" });
    }

    return risks;
  }

  private buildRecommendations(
    input: CustomerLifecycleInput,
    risks: CustomerLifecycleRisk[]
  ): CustomerSuccessRecommendation[] {
    const recommendations: CustomerSuccessRecommendation[] = [];

    if (input.onboardingStatus !== "completed") {
      recommendations.push({ title: "Complete onboarding", reason: "A complete setup improves adoption and health score.", priority: "High" });
    }
    if (input.businessBrainScore.servicesDocumented < 70) {
      recommendations.push({ title: "Upload pricing", reason: "Pricing helps JOHAI qualify leads accurately.", priority: "High" });
    }
    if (!input.subscription.featuresEnabled.calendly) {
      recommendations.push({ title: "Connect calendar", reason: "Calendar booking is enabled on higher plans and improves conversion.", priority: "Medium" });
    }
    if (input.subscription.currentPlan.limits.seats > 1 && input.subscription.usageThisMonth.seats <= 1) {
      recommendations.push({ title: "Invite team members", reason: "Additional seats increase adoption across the business.", priority: "Low" });
    }
    if (input.businessBrainScore.websiteImported < 70) {
      recommendations.push({ title: "Import website", reason: "Website context improves answers and audit quality.", priority: "Medium" });
    }
    if (input.auditHistory.length === 0) {
      recommendations.push({ title: "Run first audit", reason: "The first audit gives the customer a clear success baseline.", priority: "Medium" });
    }

    risks.slice(0, 2).forEach((risk) => {
      recommendations.push({
        title: `Resolve: ${risk.title}`,
        reason: risk.detail,
        priority: risk.severity,
      });
    });

    return recommendations.slice(0, 8);
  }
}

export function createCustomerLifecycleService(dependencies?: CustomerLifecycleDependencies) {
  return new CustomerLifecycleService(dependencies);
}
