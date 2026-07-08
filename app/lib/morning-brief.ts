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

export type MorningBriefPriority = "High" | "Medium" | "Low";

export type MorningBriefMetric = {
  label: string;
  value: number;
  detail: string;
};

export type MorningBriefInboxItem = {
  title: string;
  priority: MorningBriefPriority;
  why: string;
};

export type MorningBriefRecommendation = {
  title: string;
  estimatedImpact: string;
  estimatedCompletionTime: string;
  priority: MorningBriefPriority;
};

export type MorningBriefHealthCard = {
  label: string;
  score: number;
  detail: string;
};

export type MorningBriefOpportunity = {
  title: string;
  value: string;
  detail: string;
};

export type MorningBriefTimelineEvent = {
  time: string;
  title: string;
  detail: string;
};

export type MorningBrief = {
  greeting: string;
  currentDate: string;
  businessName: string;
  aiEmployeeStatus: string;
  happenedSinceLastVisit: MorningBriefMetric[];
  priorityInbox: MorningBriefInboxItem[];
  recommendations: MorningBriefRecommendation[];
  businessHealth: MorningBriefHealthCard[];
  opportunities: MorningBriefOpportunity[];
  successTimeline: MorningBriefTimelineEvent[];
  aiFocusToday: string;
};

export type MorningBriefInput = {
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

export interface MorningBriefRenderer {
  render(brief: MorningBrief): Promise<string> | string;
}

export interface MorningBriefDeliveryChannel {
  send(brief: MorningBrief, renderedBrief: string): Promise<void>;
}

export type MorningBriefDependencies = {
  renderer?: MorningBriefRenderer;
  deliveryChannels?: MorningBriefDeliveryChannel[];
};

function isAfter(date: string | undefined, since: Date) {
  return date ? new Date(date) >= since : false;
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatTime(date?: string) {
  if (!date) {
    return "Today";
  }

  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function countEmails(leads: Lead[]) {
  return leads.reduce((count, lead) => {
    return count + Number(Boolean(lead.owner_email_sent)) + Number(Boolean(lead.prospect_email_sent));
  }, 0);
}

function clampScore(score: number | undefined) {
  return Math.max(0, Math.min(100, Math.round(score ?? 0)));
}

function priorityRank(priority: MorningBriefPriority) {
  return priority === "High" ? 0 : priority === "Medium" ? 1 : 2;
}

export class MorningBriefService {
  constructor(private readonly dependencies: MorningBriefDependencies = {}) {}

  build(input: MorningBriefInput): MorningBrief {
    const now = input.now ?? new Date();
    const sinceLastVisit = new Date(now);
    sinceLastVisit.setDate(now.getDate() - 1);

    const recentLeads = input.leads.filter((lead) => isAfter(lead.created_at, sinceLastVisit));
    const recentQualified = recentLeads.filter((lead) => lead.status === "Qualified");
    const recentBooked = input.leads.filter((lead) =>
      isAfter(lead.next_meeting_at ?? lead.booking_date ?? lead.created_at, sinceLastVisit)
    );
    const recentAudits = input.auditHistory.filter((audit) =>
      isAfter(audit.completed_at ?? audit.created_at, sinceLastVisit)
    );
    const recentKnowledgeFiles = input.knowledgeFiles.filter((file) =>
      isAfter(file.updated_at ?? file.created_at, sinceLastVisit)
    );
    const recentOrchestrations = input.orchestrationLogs.filter((log) =>
      isAfter(log.created_at, sinceLastVisit)
    );
    const followUpsStarted = input.leads.filter((lead) =>
      isAfter(lead.last_follow_up_at, sinceLastVisit)
    );
    const businessName = input.business?.name ?? "your business";
    const aiEmployeeStatus =
      recentOrchestrations.length > 0 ? "Active and monitoring conversations" : "Ready for the next conversation";
    const knowledgeReadyCount = input.knowledgeFiles.filter(
      (file) => file.processing_status === "Ready"
    ).length;
    const crmScore =
      input.leads.length === 0
        ? 35
        : Math.min(100, 45 + recentQualified.length * 10 + recentBooked.length * 15);
    const communicationScore =
      input.settings?.email_from || input.settings?.email_owner ? 85 : 45;
    const automationScore =
      input.autonomousAudit.scores?.automationScore ??
      (followUpsStarted.length > 0 ? 80 : 40);
    const knowledgeScore =
      input.autonomousAudit.scores?.knowledgeScore ??
      input.businessBrainScore.knowledgeCompleteness;
    const overallHealth = Math.round(
      (
        input.businessBrainScore.overallScore +
        knowledgeScore +
        automationScore +
        crmScore +
        input.businessBrainScore.aiReadiness +
        communicationScore
      ) / 6
    );

    const priorityInbox = this.buildPriorityInbox({
      recentQualified: recentQualified.length,
      recentBooked: recentBooked.length,
      emailIssues: input.leads.filter((lead) => Boolean(lead.email_error)).length,
      pendingKnowledge: input.knowledgeFiles.filter((file) =>
        ["Queued", "Processing", "Failed"].includes(file.processing_status)
      ).length,
      recommendations: input.businessBrainRecommendations.length,
      followUpsWaiting: input.leads.filter((lead) => lead.follow_up_status === "Waiting").length,
    });

    const recommendations = this.buildRecommendations(input);
    const successTimeline = this.buildTimeline({
      leads: input.leads,
      knowledgeFiles: input.knowledgeFiles,
      auditHistory: input.auditHistory,
      orchestrationLogs: input.orchestrationLogs,
      since: sinceLastVisit,
    });

    return {
      greeting: this.buildGreeting(now, input.business?.owner_email),
      currentDate: formatDate(now),
      businessName,
      aiEmployeeStatus,
      happenedSinceLastVisit: [
        {
          label: "Conversations",
          value: recentOrchestrations.length,
          detail: "AI interactions reviewed in the last 24 hours.",
        },
        {
          label: "New qualified leads",
          value: recentQualified.length,
          detail: "Prospects with buying intent or clear fit.",
        },
        {
          label: "Appointments booked",
          value: recentBooked.length,
          detail: "Meetings detected through CRM or Calendly fields.",
        },
        {
          label: "Emails sent",
          value: countEmails(recentLeads),
          detail: "Owner alerts and prospect confirmations recorded.",
        },
        {
          label: "Audits completed",
          value: recentAudits.length,
          detail: "Business audit reports completed recently.",
        },
        {
          label: "Follow-ups started",
          value: followUpsStarted.length,
          detail: "Leads that entered or advanced follow-up.",
        },
        {
          label: "Documents processed",
          value: recentKnowledgeFiles.filter((file) => file.processing_status === "Ready").length,
          detail: "Knowledge documents ready for the AI Brain.",
        },
      ],
      priorityInbox,
      recommendations,
      businessHealth: [
        {
          label: "Business Brain",
          score: clampScore(input.businessBrainScore.overallScore),
          detail: "Operating context, policies, services, and identity.",
        },
        {
          label: "Knowledge",
          score: clampScore(knowledgeScore),
          detail: `${knowledgeReadyCount} document${knowledgeReadyCount === 1 ? "" : "s"} ready.`,
        },
        {
          label: "Automation",
          score: clampScore(automationScore),
          detail: "Follow-up and orchestration readiness.",
        },
        {
          label: "CRM",
          score: clampScore(crmScore),
          detail: `${input.leads.length} lead${input.leads.length === 1 ? "" : "s"} tracked.`,
        },
        {
          label: "AI Readiness",
          score: clampScore(input.businessBrainScore.aiReadiness),
          detail: "How prepared JOHAI is to answer and act.",
        },
        {
          label: "Communication",
          score: clampScore(communicationScore),
          detail: "Email sender and customer messaging readiness.",
        },
        {
          label: "Overall Health",
          score: clampScore(overallHealth),
          detail: "Combined operational health for today.",
        },
      ],
      opportunities: [
        {
          title: "Potential sales",
          value: String(input.leads.filter((lead) => lead.status === "Qualified").length),
          detail: "Qualified leads that can move toward booking or closing.",
        },
        {
          title: "Customers needing follow-up",
          value: String(input.leads.filter((lead) => lead.follow_up_status === "Waiting").length),
          detail: "Waiting leads are the fastest path to recovered pipeline.",
        },
        {
          title: "Appointments to confirm",
          value: String(input.leads.filter((lead) => lead.status === "Booked").length),
          detail: "Booked meetings should stay confirmed and prepared.",
        },
        {
          title: "Documents waiting",
          value: String(input.knowledgeFiles.filter((file) => file.processing_status !== "Ready").length),
          detail: "Unprocessed documents reduce answer confidence.",
        },
        {
          title: "Knowledge gaps",
          value: String(input.businessBrainRecommendations.length),
          detail: "Missing context JOHAI has identified for the business.",
        },
      ],
      successTimeline,
      aiFocusToday: this.buildFocus({
        priorityInbox,
        recentQualified: recentQualified.length,
        followUpsWaiting: input.leads.filter((lead) => lead.follow_up_status === "Waiting").length,
      }),
    };
  }

  async deliver(input: MorningBriefInput) {
    const brief = this.build(input);
    const renderedBrief = this.dependencies.renderer
      ? await this.dependencies.renderer.render(brief)
      : JSON.stringify(brief);

    // Delivery channels are intentionally injected so future Email, Push, SMS,
    // and WhatsApp transports can be added without changing the brief engine.
    await Promise.all(
      (this.dependencies.deliveryChannels ?? []).map((channel) =>
        channel.send(brief, renderedBrief)
      )
    );

    return brief;
  }

  private buildGreeting(now: Date, ownerEmail?: string) {
    const hour = now.getHours();
    const name = ownerEmail?.split("@")[0]?.split(/[._-]/)[0];
    const displayName = name
      ? `${name.charAt(0).toUpperCase()}${name.slice(1)}`
      : "";

    if (hour < 12) {
      return displayName ? `Good morning, ${displayName}.` : "Good morning.";
    }

    return "Welcome back.";
  }

  private buildPriorityInbox(input: {
    recentQualified: number;
    recentBooked: number;
    emailIssues: number;
    pendingKnowledge: number;
    recommendations: number;
    followUpsWaiting: number;
  }) {
    const inbox: MorningBriefInboxItem[] = [];

    if (input.emailIssues > 0) {
      inbox.push({
        title: "Review email delivery",
        priority: "High",
        why: "Email issues can block owner notifications, confirmations, and automated follow-ups.",
      });
    }

    if (input.recentQualified > 0) {
      inbox.push({
        title: "Act on new qualified leads",
        priority: "High",
        why: "Fresh qualified leads are most likely to book when contacted quickly.",
      });
    }

    if (input.followUpsWaiting > 0) {
      inbox.push({
        title: "Move waiting follow-ups",
        priority: "Medium",
        why: "Waiting prospects can lose urgency if reminders do not continue.",
      });
    }

    if (input.pendingKnowledge > 0) {
      inbox.push({
        title: "Finish knowledge processing",
        priority: "Medium",
        why: "Documents that are not ready lower AI answer quality.",
      });
    }

    if (input.recommendations > 0) {
      inbox.push({
        title: "Close Business Brain gaps",
        priority: "Low",
        why: "Better business context improves every answer, audit, and automation.",
      });
    }

    if (input.recentBooked > 0) {
      inbox.push({
        title: "Prepare booked appointments",
        priority: "Medium",
        why: "Confirmed meetings convert better when notes and audit context are ready.",
      });
    }

    return inbox.sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority)).slice(0, 6);
  }

  private buildRecommendations(input: MorningBriefInput) {
    const recommendations: MorningBriefRecommendation[] = [];
    const settings = input.settings;
    const companyProfile = settings?.company_profile ?? {};
    const servicesConfig = settings?.services_config ?? {};
    const hasWebsite =
      typeof companyProfile.website === "string" && companyProfile.website.length > 0;
    const hasServices = Array.isArray(servicesConfig.services) && servicesConfig.services.length > 0;
    const hasFaq =
      Array.isArray(servicesConfig.commonQuestions) ||
      input.knowledgeItems.some((item) => item.section === "FAQ");

    if (!hasServices) {
      recommendations.push({
        title: "Complete pricing information.",
        estimatedImpact: "High impact on lead qualification accuracy.",
        estimatedCompletionTime: "15 min",
        priority: "High",
      });
    }

    if (input.businessBrainScore.policiesDocumented < 70) {
      recommendations.push({
        title: "Upload cancellation policy.",
        estimatedImpact: "Reduces booking friction and repetitive questions.",
        estimatedCompletionTime: "10 min",
        priority: "Medium",
      });
    }

    if (!hasWebsite) {
      recommendations.push({
        title: "Import website.",
        estimatedImpact: "Improves offers, positioning, and local context.",
        estimatedCompletionTime: "8 min",
        priority: "High",
      });
    }

    recommendations.push({
      title: "Connect Google Business.",
      estimatedImpact: "Prepares local reputation and search audit intelligence.",
      estimatedCompletionTime: "12 min",
      priority: "Medium",
    });

    if (!hasFaq) {
      recommendations.push({
        title: "Improve FAQ.",
        estimatedImpact: "Raises answer confidence for common buyer questions.",
        estimatedCompletionTime: "20 min",
        priority: "Medium",
      });
    }

    input.businessBrainRecommendations.slice(0, 3).forEach((recommendation) => {
      recommendations.push({
        title: recommendation.title,
        estimatedImpact: "Improves Business Brain completeness.",
        estimatedCompletionTime: "10 min",
        priority: recommendation.priority === "high" ? "High" : "Medium",
      });
    });

    return recommendations
      .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
      .slice(0, 7);
  }

  private buildTimeline(input: {
    leads: Lead[];
    knowledgeFiles: KnowledgeFile[];
    auditHistory: AuditReport[];
    orchestrationLogs: OrchestrationLog[];
    since: Date;
  }) {
    const events: Array<MorningBriefTimelineEvent & { rawDate: string }> = [];

    input.knowledgeFiles
      .filter((file) => file.processing_status === "Ready" && isAfter(file.updated_at ?? file.created_at, input.since))
      .forEach((file) => {
        const rawDate = file.updated_at ?? file.created_at ?? new Date().toISOString();
        events.push({
          rawDate,
          time: formatTime(rawDate),
          title: "Knowledge updated",
          detail: file.original_filename,
        });
      });

    input.auditHistory
      .filter((audit) => isAfter(audit.completed_at ?? audit.created_at, input.since))
      .forEach((audit) => {
        const rawDate = audit.completed_at ?? audit.created_at ?? new Date().toISOString();
        events.push({
          rawDate,
          time: formatTime(rawDate),
          title: "Audit completed",
          detail: audit.audit_type ?? "AI audit",
        });
      });

    input.leads
      .filter((lead) => lead.status === "Booked" && isAfter(lead.next_meeting_at ?? lead.booking_date ?? lead.created_at, input.since))
      .forEach((lead) => {
        const rawDate = lead.next_meeting_at ?? lead.booking_date ?? lead.created_at ?? new Date().toISOString();
        events.push({
          rawDate,
          time: formatTime(rawDate),
          title: "Appointment booked",
          detail: lead.business_name || lead.first_name,
        });
      });

    input.orchestrationLogs
      .filter((log) => isAfter(log.created_at, input.since))
      .forEach((log) => {
        const rawDate = log.created_at ?? new Date().toISOString();
        events.push({
          rawDate,
          time: formatTime(rawDate),
          title: "AI action completed",
          detail: log.detected_intent,
        });
      });

    return events
      .sort((a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime())
      .slice(-8)
      .map((event) => ({
        time: event.time,
        title: event.title,
        detail: event.detail,
      }));
  }

  private buildFocus(input: {
    priorityInbox: MorningBriefInboxItem[];
    recentQualified: number;
    followUpsWaiting: number;
  }) {
    if (input.recentQualified > 0) {
      return "Today I will prioritize lead qualification and appointment booking while monitoring overdue follow-ups.";
    }

    if (input.followUpsWaiting > 0) {
      return "Today I will focus on moving waiting prospects through follow-up and keeping the pipeline warm.";
    }

    if (input.priorityInbox.some((item) => item.priority === "High")) {
      return "Today I will resolve high-priority operational gaps before they affect customer conversations.";
    }

    return "Today I will monitor conversations, strengthen the Business Brain, and prepare the next growth opportunities.";
  }
}

export function createMorningBriefService(dependencies?: MorningBriefDependencies) {
  return new MorningBriefService(dependencies);
}
