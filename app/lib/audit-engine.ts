import type {
  AuditPriority,
  AuditRecommendation,
  AuditReport,
  AuditResult,
  AuditScore,
  Business,
  BusinessBrain,
  BusinessBrainScore,
  BusinessSettings,
  KnowledgeItem,
  Lead,
  OrchestrationLog,
} from "@/app/lib/supabase";

export type AuditContext = {
  business: Business | null;
  settings: BusinessSettings | null;
  brain: BusinessBrain | null;
  brainScore: BusinessBrainScore | null;
  knowledgeItems: KnowledgeItem[];
  leads: Lead[];
  orchestrationLogs: OrchestrationLog[];
  previousAudits: AuditReport[];
};

export interface AuditModule {
  readonly name: string;
  run(context: AuditContext): AuditResult;
}

export interface AuditRunner {
  run(context: AuditContext): AuditResult[];
}

export interface AuditEngine {
  generate(context: AuditContext): AuditReport;
}

export interface AuditConnector {
  readonly name: string;
  isConnected(): boolean;
}

function hasText(value: unknown) {
  return typeof value === "string" && value.trim().length > 0;
}

function scoreStatus(score: number): AuditResult["status"] {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 45) return "needs_attention";
  return "critical";
}

function priorityFromScore(score: number): AuditPriority {
  if (score < 35) return "critical";
  if (score < 55) return "high";
  if (score < 75) return "medium";
  return "low";
}

function result(
  module: string,
  score: number,
  issues: string[],
  strengths: string[],
  recommendations: AuditRecommendation[] = [],
  status?: AuditResult["status"]
): AuditResult {
  return {
    module,
    score,
    status: status ?? scoreStatus(score),
    issues,
    strengths,
    recommendations,
    priority: priorityFromScore(score),
  };
}

function rec(module: string, title: string, detail: string, priority: AuditPriority): AuditRecommendation {
  return { module, title, detail, priority };
}

class BusinessProfileAudit implements AuditModule {
  readonly name = "Business Profile Audit";

  run(context: AuditContext) {
    const checks = [
      hasText(context.business?.name),
      hasText(context.brain?.industry),
      Boolean(context.brainScore && context.brainScore.businessInformationCompleteness > 60),
      Boolean(context.brain?.languages?.length),
      hasText(context.brain?.tone_of_voice),
    ];
    const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
    const issues = [];
    const strengths = [];

    if (!hasText(context.brain?.industry)) issues.push("Industry is not fully defined.");
    if (!context.brain?.languages?.length) issues.push("Languages are not documented.");
    if (hasText(context.business?.name)) strengths.push("Business identity exists.");
    if (hasText(context.brain?.tone_of_voice)) strengths.push("Tone of voice is available.");

    return result(this.name, score, issues, strengths, [
      rec(this.name, "Complete the business identity", "Add industry, languages, tone, target customers, and operating context.", "high"),
    ]);
  }
}

class KnowledgeAudit implements AuditModule {
  readonly name = "Knowledge Audit";

  run(context: AuditContext) {
    const sections = new Set(context.knowledgeItems.map((item) => item.section));
    const score = Math.min(100, sections.size * 16 + context.knowledgeItems.length * 4);
    const issues = [];
    const strengths = [];

    if (!sections.has("FAQ")) issues.push("FAQ knowledge is missing.");
    if (!sections.has("Policies")) issues.push("Policies are not documented.");
    if (!sections.has("Website Import")) issues.push("Website has not been imported.");
    if (context.knowledgeItems.length > 0) strengths.push(`${context.knowledgeItems.length} knowledge items are available.`);

    return result(this.name, score, issues, strengths, [
      rec(this.name, "Expand the knowledge base", "Upload policies, procedures, services, FAQs, and website content.", "high"),
    ]);
  }
}

class PlaceholderAudit implements AuditModule {
  constructor(
    readonly name: string,
    private readonly connectorName: string
  ) {}

  run() {
    return result(
      this.name,
      25,
      [`${this.connectorName} connector is not connected yet.`],
      ["Connector boundary is prepared."],
      [
        rec(this.name, `Connect ${this.connectorName}`, `Phase 8 can plug in ${this.connectorName} without changing the audit engine.`, "medium"),
      ],
      "not_connected"
    );
  }
}

class AutomationAudit implements AuditModule {
  readonly name = "Automation Audit";

  run(context: AuditContext) {
    const actionCount = context.orchestrationLogs.reduce(
      (sum, log) => sum + (log.required_actions?.length ?? 0),
      0
    );
    const score = Math.min(100, actionCount * 8 + (context.orchestrationLogs.length ? 30 : 0));

    return result(
      this.name,
      score,
      actionCount === 0 ? ["No AI orchestration actions have been captured yet."] : [],
      actionCount > 0 ? [`${actionCount} orchestration actions captured.`] : [],
      [rec(this.name, "Increase automated action coverage", "Use the orchestrator logs to identify repeated actions and automate safe workflows.", "medium")]
    );
  }
}

class CrmAudit implements AuditModule {
  readonly name = "CRM Audit";

  run(context: AuditContext) {
    const total = context.leads.length;
    const qualified = context.leads.filter((lead) => ["Qualified", "Booked", "Closed"].includes(lead.status ?? "")).length;
    const withNotes = context.leads.filter((lead) => hasText(lead.notes)).length;
    const score = total ? Math.round(((qualified / total) * 55) + ((withNotes / total) * 45)) : 20;

    return result(
      this.name,
      score,
      total === 0 ? ["No CRM leads are available yet."] : [],
      total > 0 ? [`${total} CRM leads available.`] : [],
      [rec(this.name, "Improve CRM follow-up quality", "Keep statuses and internal notes updated for every qualified lead.", "medium")]
    );
  }
}

class AiReadinessAudit implements AuditModule {
  readonly name = "AI Readiness Audit";

  run(context: AuditContext) {
    const score = context.brainScore?.aiReadiness ?? 0;

    return result(
      this.name,
      score,
      score < 70 ? ["Business Brain needs more operating context before aggressive automation."] : [],
      score >= 70 ? ["Business Brain is ready for controlled AI workflows."] : [],
      [rec(this.name, "Raise AI readiness", "Complete Business Brain rules, vocabulary, policies, and communication guidance.", "high")]
    );
  }
}

class CommunicationAudit implements AuditModule {
  readonly name = "Communication Audit";

  run(context: AuditContext) {
    const checks = [
      hasText(context.settings?.booking_url),
      hasText(context.settings?.calendly_user_uri),
      hasText(context.settings?.email_from),
      hasText(context.settings?.email_owner),
      Boolean(context.brain?.communication_rules && Object.keys(context.brain.communication_rules).length),
    ];
    const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);

    return result(
      this.name,
      score,
      checks.filter(Boolean).length < checks.length ? ["Some communication channels or rules are incomplete."] : [],
      score >= 60 ? ["Core communication configuration is partially available."] : [],
      [rec(this.name, "Document communication rules", "Add sender rules, booking expectations, escalation language, and response boundaries.", "medium")]
    );
  }
}

class DefaultAuditRunner implements AuditRunner {
  constructor(private readonly modules: AuditModule[]) {}

  run(context: AuditContext) {
    return this.modules.map((module) => module.run(context));
  }
}

function average(results: AuditResult[], names: string[]) {
  const selected = results.filter((resultItem) => names.includes(resultItem.module));
  return selected.length
    ? Math.round(selected.reduce((sum, item) => sum + item.score, 0) / selected.length)
    : 0;
}

class DefaultAuditEngine implements AuditEngine {
  constructor(private readonly runner: AuditRunner) {}

  generate(context: AuditContext): AuditReport {
    const moduleResults = this.runner.run(context);
    const recommendations = moduleResults
      .flatMap((moduleResult) => moduleResult.recommendations)
      .sort((a, b) => ["critical", "high", "medium", "low"].indexOf(a.priority) - ["critical", "high", "medium", "low"].indexOf(b.priority));
    const scores: AuditScore = {
      overallBusinessScore: average(moduleResults, moduleResults.map((item) => item.module)),
      aiReadinessScore: average(moduleResults, ["AI Readiness Audit", "Business Profile Audit"]),
      automationScore: average(moduleResults, ["Automation Audit"]),
      knowledgeScore: average(moduleResults, ["Knowledge Audit"]),
      marketingScore: average(moduleResults, ["Website Audit", "SEO Audit", "Google Business Audit", "Social Media Audit"]),
      crmScore: average(moduleResults, ["CRM Audit"]),
    };
    const criticalIssues = moduleResults.flatMap((item) =>
      item.priority === "critical" ? item.issues : []
    );

    return {
      business_id: context.business?.id ?? "",
      status: "ready",
      audit_type: "autonomous_ai_audit",
      summary: `Autonomous audit generated across ${moduleResults.length} modules.`,
      scores,
      module_results: moduleResults,
      recommendations,
      executive_summary: `Overall score ${scores.overallBusinessScore}%. ${criticalIssues.length} critical issue(s) require attention.`,
      detailed_report: {
        modules: moduleResults,
        report_exports_ready_for: ["PDF export", "Executive summary", "Detailed report", "Action plan", "Implementation roadmap"],
      },
      action_plan: recommendations.slice(0, 6),
      implementation_roadmap: [
        { phase: "Stabilize", focus: "Fix critical gaps and missing policies." },
        { phase: "Automate", focus: "Connect safe workflows to the orchestrator." },
        { phase: "Scale", focus: "Add external marketing and analytics connectors." },
      ],
      report_status: "ready",
    };
  }
}

// Dependency injection root. Future Google, Meta, LinkedIn, crawler, SEO,
// OpenAI, and PDF exporters plug in by replacing modules/connectors here.
export function createAuditEngine(): AuditEngine {
  return new DefaultAuditEngine(
    new DefaultAuditRunner([
      new BusinessProfileAudit(),
      new KnowledgeAudit(),
      new PlaceholderAudit("Website Audit", "Website crawler"),
      new PlaceholderAudit("SEO Audit", "SEO scanner"),
      new PlaceholderAudit("Google Business Audit", "Google Business"),
      new PlaceholderAudit("Social Media Audit", "Meta and LinkedIn"),
      new AutomationAudit(),
      new CrmAudit(),
      new AiReadinessAudit(),
      new CommunicationAudit(),
    ])
  );
}
