import type {
  AuditReport,
  Business,
  BusinessBrainRecommendation,
  BusinessBrainScore,
  BusinessSettings,
  KnowledgeFile,
  KnowledgeItem,
  Lead,
  OrchestrationLog,
} from "@/app/lib/supabase";

export type ExecutivePriority = "High" | "Medium" | "Low";

export type ExecutiveCardType =
  | "High Priority"
  | "Risk"
  | "Opportunity"
  | "Recommendation"
  | "Success"
  | "Information";

export type ExecutiveInsight = {
  id: string;
  type: ExecutiveCardType;
  title: string;
  explanation: string;
  businessImpact: string;
  estimatedValue: string;
  suggestedAction: string;
  priority: ExecutivePriority;
  deadline: string;
};

export type ExecutiveTimelineEvent = {
  time: string;
  whatJohaiDid: string;
  whyItDidIt: string;
  whatShouldHappenNext: string;
};

export type BusinessPulse = {
  overallBusinessHealth: number;
  salesMomentum: number;
  automationHealth: number;
  customerSatisfaction: number;
  aiConfidence: number;
  knowledgeGrowth: number;
};

export type NotificationPlan = {
  channel: "Morning Brief" | "Email" | "Push" | "SMS" | "WhatsApp" | "Slack" | "Microsoft Teams";
  urgency: ExecutivePriority;
  reason: string;
};

export type ChiefOfStaffBriefing = {
  status: string;
  executiveSummary: string;
  executiveCards: ExecutiveInsight[];
  executiveTimeline: ExecutiveTimelineEvent[];
  businessPulse: BusinessPulse;
  notificationPlan: NotificationPlan[];
};

export type ChiefOfStaffInput = {
  business: Business | null;
  settings: BusinessSettings | null;
  businessBrainScore: BusinessBrainScore;
  businessBrainRecommendations: BusinessBrainRecommendation[];
  autonomousAudit: AuditReport;
  auditHistory: AuditReport[];
  leads: Lead[];
  knowledgeItems: KnowledgeItem[];
  knowledgeFiles: KnowledgeFile[];
  orchestrationLogs: OrchestrationLog[];
  now?: Date;
};

export interface ChiefOfStaffDeliveryChannel {
  send(briefing: ChiefOfStaffBriefing, plan: NotificationPlan): Promise<void>;
}

export type ChiefOfStaffDependencies = {
  riskAnalyzer?: RiskAnalyzer;
  opportunityDetector?: OpportunityDetector;
  priorityManager?: PriorityManager;
  notificationPlanner?: NotificationPlanner;
  deliveryChannels?: ChiefOfStaffDeliveryChannel[];
};

function daysAgo(now: Date, days: number) {
  const date = new Date(now);
  date.setDate(now.getDate() - days);
  return date;
}

function isBefore(date: string | undefined, threshold: Date) {
  return date ? new Date(date) < threshold : false;
}

function isAfter(date: string | undefined, threshold: Date) {
  return date ? new Date(date) >= threshold : false;
}

function formatTime(date?: string) {
  if (!date) {
    return "Now";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function priorityRank(priority: ExecutivePriority) {
  return priority === "High" ? 0 : priority === "Medium" ? 1 : 2;
}

function cardRank(type: ExecutiveCardType) {
  const ranks: Record<ExecutiveCardType, number> = {
    "High Priority": 0,
    Risk: 1,
    Opportunity: 2,
    Recommendation: 3,
    Success: 4,
    Information: 5,
  };

  return ranks[type];
}

function createInsight(input: Omit<ExecutiveInsight, "id">): ExecutiveInsight {
  return {
    id: `${input.type}-${input.title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    ...input,
  };
}

export class RiskAnalyzer {
  // Risk analysis stays deterministic and data-only so it can later run safely
  // inside scheduled jobs, Morning Brief delivery, or real-time monitors.
  analyze(input: ChiefOfStaffInput): ExecutiveInsight[] {
    const now = input.now ?? new Date();
    const twoDaysAgo = daysAgo(now, 2);
    const sevenDaysAgo = daysAgo(now, 7);
    const risks: ExecutiveInsight[] = [];
    const waitingTooLong = input.leads.filter(
      (lead) =>
        lead.status !== "Closed" &&
        lead.status !== "Booked" &&
        isBefore(lead.created_at, twoDaysAgo)
    );
    const unconfirmedAppointments = input.leads.filter(
      (lead) =>
        lead.status === "Booked" &&
        lead.meeting_status !== "Confirmed" &&
        Boolean(lead.next_meeting_at ?? lead.booking_date)
    );
    const staleFollowUps = input.leads.filter(
      (lead) =>
        lead.status === "Qualified" &&
        !lead.booked_meeting &&
        isBefore(lead.last_follow_up_at ?? lead.created_at, sevenDaysAgo)
    );
    const automationFailures = input.orchestrationLogs.filter(
      (log) => log.result !== "completed" || Boolean(log.errors)
    );
    const failedKnowledge = input.knowledgeFiles.filter(
      (file) => file.processing_status === "Failed"
    );

    if (waitingTooLong.length > 0) {
      risks.push(
        createInsight({
          type: "Risk",
          title: "Leads are waiting too long",
          explanation: `${waitingTooLong.length} open lead${waitingTooLong.length === 1 ? "" : "s"} have not reached booked or closed status after 48 hours.`,
          businessImpact: "Slow response can reduce conversion and make warm prospects go cold.",
          estimatedValue: `${waitingTooLong.length} possible deal${waitingTooLong.length === 1 ? "" : "s"} at risk`,
          suggestedAction: "Review these leads in the CRM and trigger the next follow-up.",
          priority: "High",
          deadline: "Today",
        })
      );
    }

    if (unconfirmedAppointments.length > 0) {
      risks.push(
        createInsight({
          type: "High Priority",
          title: "Appointments need confirmation",
          explanation: `${unconfirmedAppointments.length} booked appointment${unconfirmedAppointments.length === 1 ? "" : "s"} do not show confirmed status.`,
          businessImpact: "Unconfirmed meetings create no-show risk and reduce owner preparedness.",
          estimatedValue: "Protect booked revenue opportunities",
          suggestedAction: "Confirm meeting details and prepare the lead notes before the call.",
          priority: "High",
          deadline: "Before the next meeting",
        })
      );
    }

    if (staleFollowUps.length > 0) {
      risks.push(
        createInsight({
          type: "Risk",
          title: "Customers have not been followed up",
          explanation: `${staleFollowUps.length} qualified lead${staleFollowUps.length === 1 ? " has" : "s have"} not booked and need renewed attention.`,
          businessImpact: "Follow-up gaps leave money in the pipeline without a clear next step.",
          estimatedValue: `${staleFollowUps.length} recoverable opportunity${staleFollowUps.length === 1 ? "" : "ies"}`,
          suggestedAction: "Send the next reminder or mark the lead as no longer active.",
          priority: "Medium",
          deadline: "Next 24 hours",
        })
      );
    }

    if (input.businessBrainScore.aiReadiness < 60) {
      risks.push(
        createInsight({
          type: "Risk",
          title: "AI confidence is low",
          explanation: `AI readiness is ${input.businessBrainScore.aiReadiness}%, below the recommended operating threshold.`,
          businessImpact: "The AI may answer less confidently or miss business-specific context.",
          estimatedValue: "Higher quality conversations",
          suggestedAction: "Complete Business Brain, FAQ, services, and policy gaps.",
          priority: "High",
          deadline: "This week",
        })
      );
    }

    if (input.businessBrainRecommendations.length > 0 || failedKnowledge.length > 0) {
      risks.push(
        createInsight({
          type: "Recommendation",
          title: "Business knowledge gaps need attention",
          explanation: `${input.businessBrainRecommendations.length} Business Brain gap${input.businessBrainRecommendations.length === 1 ? "" : "s"} and ${failedKnowledge.length} failed document${failedKnowledge.length === 1 ? "" : "s"} were detected.`,
          businessImpact: "Missing knowledge limits the AI employee's ability to answer and act.",
          estimatedValue: "Improved AI answer accuracy",
          suggestedAction: "Upload missing documents and resolve failed knowledge processing.",
          priority: failedKnowledge.length > 0 ? "High" : "Medium",
          deadline: "This week",
        })
      );
    }

    if (automationFailures.length > 0) {
      risks.push(
        createInsight({
          type: "Risk",
          title: "Automation failures detected",
          explanation: `${automationFailures.length} orchestration log${automationFailures.length === 1 ? "" : "s"} reported an error or incomplete result.`,
          businessImpact: "Failed automations can interrupt emails, follow-ups, audits, or CRM actions.",
          estimatedValue: "Operational reliability",
          suggestedAction: "Review orchestration logs and rerun any missed action.",
          priority: "High",
          deadline: "Today",
        })
      );
    }

    return risks;
  }
}

export class OpportunityDetector {
  // Opportunities are separated from risks so future connectors can add revenue,
  // calendar, ecommerce, or support signals without changing the executive engine.
  detect(input: ChiefOfStaffInput): ExecutiveInsight[] {
    const now = input.now ?? new Date();
    const sevenDaysAgo = daysAgo(now, 7);
    const opportunities: ExecutiveInsight[] = [];
    const qualifiedLeads = input.leads.filter((lead) => lead.status === "Qualified");
    const largeSalesOpportunities = input.leads.filter((lead) =>
      [lead.biggest_problem, lead.ai_recommendations]
        .join(" ")
        .toLowerCase()
        .match(/scale|growth|revenue|sales|automation|enterprise|multi-location|multiple|team/)
    );
    const inactiveCustomers = input.leads.filter(
      (lead) => lead.status !== "Closed" && isBefore(lead.created_at, sevenDaysAgo)
    );
    const recentSuccesses = input.orchestrationLogs.filter(
      (log) => log.result === "completed" && isAfter(log.created_at, daysAgo(now, 1))
    );
    const readyKnowledge = input.knowledgeFiles.filter(
      (file) => file.processing_status === "Ready"
    );

    if (qualifiedLeads.length > 0) {
      opportunities.push(
        createInsight({
          type: "Opportunity",
          title: "Qualified pipeline is ready to convert",
          explanation: `${qualifiedLeads.length} qualified lead${qualifiedLeads.length === 1 ? "" : "s"} can be moved toward booking or closing.`,
          businessImpact: "Fast action can increase booked meetings and sales momentum.",
          estimatedValue: `${qualifiedLeads.length} active sales opportunity${qualifiedLeads.length === 1 ? "" : "ies"}`,
          suggestedAction: "Open the CRM and prioritize qualified leads with clear business pain.",
          priority: "High",
          deadline: "Today",
        })
      );
    }

    if (largeSalesOpportunities.length > 0) {
      opportunities.push(
        createInsight({
          type: "Opportunity",
          title: "Large sales opportunities detected",
          explanation: `${largeSalesOpportunities.length} lead${largeSalesOpportunities.length === 1 ? "" : "s"} mention growth, revenue, automation, or larger operational needs.`,
          businessImpact: "These conversations may deserve a more strategic owner follow-up.",
          estimatedValue: "Potential high-value pipeline",
          suggestedAction: "Review lead notes and prepare a tailored AI audit proposal.",
          priority: "High",
          deadline: "Next 24 hours",
        })
      );
    }

    if (inactiveCustomers.length > 0) {
      opportunities.push(
        createInsight({
          type: "Information",
          title: "Inactive customers can be reactivated",
          explanation: `${inactiveCustomers.length} older open record${inactiveCustomers.length === 1 ? "" : "s"} still exist in the CRM.`,
          businessImpact: "Reactivation campaigns can recover dormant demand.",
          estimatedValue: "Recovered pipeline",
          suggestedAction: "Segment inactive records and send a reactivation follow-up.",
          priority: "Low",
          deadline: "This month",
        })
      );
    }

    if (readyKnowledge.length > 0) {
      opportunities.push(
        createInsight({
          type: "Success",
          title: "Knowledge base is growing",
          explanation: `${readyKnowledge.length} knowledge file${readyKnowledge.length === 1 ? " is" : "s are"} ready for AI use.`,
          businessImpact: "A richer knowledge base improves answer quality and future semantic memory.",
          estimatedValue: "Higher AI confidence",
          suggestedAction: "Keep uploading policies, services, pricing, and FAQs.",
          priority: "Low",
          deadline: "Ongoing",
        })
      );
    }

    if (recentSuccesses.length > 0) {
      opportunities.push(
        createInsight({
          type: "Success",
          title: "JOHAI completed autonomous actions",
          explanation: `${recentSuccesses.length} action${recentSuccesses.length === 1 ? "" : "s"} completed successfully in the last 24 hours.`,
          businessImpact: "The AI employee is already producing operational leverage.",
          estimatedValue: "Time saved for the owner",
          suggestedAction: "Review the executive timeline for next-step recommendations.",
          priority: "Low",
          deadline: "Review today",
        })
      );
    }

    return opportunities;
  }
}

export class PriorityManager {
  // PriorityManager centralizes ranking so future channels can share the same
  // executive ordering instead of duplicating urgency rules.
  rank(insights: ExecutiveInsight[]) {
    return [...insights]
      .sort((a, b) => {
        const priorityDelta = priorityRank(a.priority) - priorityRank(b.priority);

        if (priorityDelta !== 0) {
          return priorityDelta;
        }

        return cardRank(a.type) - cardRank(b.type);
      })
      .slice(0, 10);
  }
}

export class NotificationPlanner {
  // Notification planning is transport-agnostic. Email, Push, SMS, WhatsApp,
  // Slack, and Teams adapters can be injected later without changing analysis.
  plan(insights: ExecutiveInsight[]): NotificationPlan[] {
    const hasHighPriority = insights.some((insight) => insight.priority === "High");
    const hasRisk = insights.some((insight) => insight.type === "Risk" || insight.type === "High Priority");

    return [
      {
        channel: "Morning Brief",
        urgency: hasHighPriority ? "High" : "Medium",
        reason: "Always include executive insights in the daily owner report.",
      },
      ...(hasHighPriority
        ? [
            {
              channel: "Email" as const,
              urgency: "High" as const,
              reason: "High-priority insights should reach the owner outside the dashboard.",
            },
          ]
        : []),
      ...(hasRisk
        ? [
            {
              channel: "Push" as const,
              urgency: "Medium" as const,
              reason: "Operational risks are useful as lightweight real-time alerts.",
            },
          ]
        : []),
    ];
  }
}

export class ExecutiveInsightEngine {
  private readonly riskAnalyzer: RiskAnalyzer;
  private readonly opportunityDetector: OpportunityDetector;
  private readonly priorityManager: PriorityManager;
  private readonly notificationPlanner: NotificationPlanner;

  constructor(private readonly dependencies: ChiefOfStaffDependencies = {}) {
    this.riskAnalyzer = dependencies.riskAnalyzer ?? new RiskAnalyzer();
    this.opportunityDetector =
      dependencies.opportunityDetector ?? new OpportunityDetector();
    this.priorityManager = dependencies.priorityManager ?? new PriorityManager();
    this.notificationPlanner =
      dependencies.notificationPlanner ?? new NotificationPlanner();
  }

  build(input: ChiefOfStaffInput): ChiefOfStaffBriefing {
    const risks = this.riskAnalyzer.analyze(input);
    const opportunities = this.opportunityDetector.detect(input);
    const executiveCards = this.priorityManager.rank([...risks, ...opportunities]);
    const businessPulse = this.buildBusinessPulse(input);
    const executiveTimeline = this.buildTimeline(input, executiveCards);
    const notificationPlan = this.notificationPlanner.plan(executiveCards);

    return {
      status: executiveCards.some((card) => card.priority === "High")
        ? "Attention needed"
        : "Monitoring",
      executiveSummary: this.buildSummary(input, executiveCards),
      executiveCards,
      executiveTimeline,
      businessPulse,
      notificationPlan,
    };
  }

  async deliver(input: ChiefOfStaffInput) {
    const briefing = this.build(input);

    await Promise.all(
      (this.dependencies.deliveryChannels ?? []).flatMap((channel) =>
        briefing.notificationPlan.map((plan) => channel.send(briefing, plan))
      )
    );

    return briefing;
  }

  private buildBusinessPulse(input: ChiefOfStaffInput): BusinessPulse {
    const now = input.now ?? new Date();
    const recentLeads = input.leads.filter((lead) =>
      isAfter(lead.created_at, daysAgo(now, 7))
    );
    const bookedLeads = input.leads.filter((lead) => lead.status === "Booked");
    const failedAutomations = input.orchestrationLogs.filter(
      (log) => log.result !== "completed" || Boolean(log.errors)
    );
    const successfulAutomations = input.orchestrationLogs.filter(
      (log) => log.result === "completed"
    );
    const readyKnowledge = input.knowledgeFiles.filter(
      (file) => file.processing_status === "Ready"
    );
    const failedKnowledge = input.knowledgeFiles.filter(
      (file) => file.processing_status === "Failed"
    );
    const emailIssues = input.leads.filter((lead) => Boolean(lead.email_error));
    const salesMomentum = clampScore(recentLeads.length * 12 + bookedLeads.length * 10);
    const automationHealth = clampScore(
      successfulAutomations.length === 0
        ? 45
        : 100 - failedAutomations.length * 15
    );
    const customerSatisfaction = clampScore(
      85 - emailIssues.length * 10 - failedAutomations.length * 5
    );
    const knowledgeGrowth = clampScore(
      readyKnowledge.length * 12 - failedKnowledge.length * 10
    );
    const aiConfidence = clampScore(input.businessBrainScore.aiReadiness);
    const overallBusinessHealth = clampScore(
      (
        input.businessBrainScore.overallScore +
        salesMomentum +
        automationHealth +
        customerSatisfaction +
        aiConfidence +
        knowledgeGrowth
      ) / 6
    );

    return {
      overallBusinessHealth,
      salesMomentum,
      automationHealth,
      customerSatisfaction,
      aiConfidence,
      knowledgeGrowth,
    };
  }

  private buildTimeline(
    input: ChiefOfStaffInput,
    executiveCards: ExecutiveInsight[]
  ): ExecutiveTimelineEvent[] {
    const now = input.now ?? new Date();
    const recentWindow = daysAgo(now, 1);
    const events: Array<ExecutiveTimelineEvent & { rawDate: string }> = [];

    input.orchestrationLogs
      .filter((log) => isAfter(log.created_at, recentWindow))
      .forEach((log) => {
        const rawDate = log.created_at ?? now.toISOString();
        events.push({
          rawDate,
          time: formatTime(rawDate),
          whatJohaiDid: `Detected ${log.detected_intent}`,
          whyItDidIt: `The conversation required ${log.required_actions?.join(", ") || "monitoring"}.`,
          whatShouldHappenNext:
            log.result === "completed"
              ? "Keep monitoring for the next customer signal."
              : "Review the failed action and retry if needed.",
        });
      });

    input.knowledgeFiles
      .filter((file) => isAfter(file.updated_at ?? file.created_at, recentWindow))
      .forEach((file) => {
        const rawDate = file.updated_at ?? file.created_at ?? now.toISOString();
        events.push({
          rawDate,
          time: formatTime(rawDate),
          whatJohaiDid: `Processed ${file.original_filename}`,
          whyItDidIt: "Knowledge growth improves AI answers and future semantic memory.",
          whatShouldHappenNext:
            file.processing_status === "Ready"
              ? "Use this knowledge in AI conversations and audits."
              : "Check processing status and resolve blockers.",
        });
      });

    executiveCards.slice(0, 4).forEach((card) => {
      events.push({
        rawDate: now.toISOString(),
        time: formatTime(now.toISOString()),
        whatJohaiDid: `Generated executive insight: ${card.title}`,
        whyItDidIt: card.explanation,
        whatShouldHappenNext: card.suggestedAction,
      });
    });

    return events
      .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
      .slice(-8)
      .map((event) => ({
        time: event.time,
        whatJohaiDid: event.whatJohaiDid,
        whyItDidIt: event.whyItDidIt,
        whatShouldHappenNext: event.whatShouldHappenNext,
      }));
  }

  private buildSummary(input: ChiefOfStaffInput, executiveCards: ExecutiveInsight[]) {
    const highPriorityCount = executiveCards.filter(
      (card) => card.priority === "High"
    ).length;
    const riskCount = executiveCards.filter(
      (card) => card.type === "Risk" || card.type === "High Priority"
    ).length;
    const opportunityCount = executiveCards.filter(
      (card) => card.type === "Opportunity"
    ).length;
    const businessName = input.business?.name ?? "this business";

    if (highPriorityCount > 0) {
      return `JOHAI found ${highPriorityCount} high-priority item${highPriorityCount === 1 ? "" : "s"} for ${businessName}, including ${riskCount} risk${riskCount === 1 ? "" : "s"} and ${opportunityCount} opportunity signal${opportunityCount === 1 ? "" : "s"}.`;
    }

    return `JOHAI is monitoring ${businessName}. No urgent executive risks require immediate action, and ${opportunityCount} opportunity signal${opportunityCount === 1 ? "" : "s"} are available for review.`;
  }
}

export function createExecutiveInsightEngine(
  dependencies?: ChiefOfStaffDependencies
) {
  return new ExecutiveInsightEngine(dependencies);
}
