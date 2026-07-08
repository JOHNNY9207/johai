import type { SupabaseClient } from "@supabase/supabase-js";
import { createSemanticMemoryServices } from "@/app/lib/semantic-memory";
import {
  DEFAULT_BUSINESS_ID,
  orchestrationActions,
  type OrchestrationAction,
  type OrchestrationIntent,
} from "@/app/lib/supabase";

export type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type OrchestrationInput = {
  businessId: string;
  leadId?: string | null;
  conversation: ConversationMessage[];
  assistantReply?: string;
  lead?: Record<string, unknown>;
  channel?: string;
};

export type OrchestrationPlan = {
  intent: OrchestrationIntent;
  confidence: number;
  requiredActions: OrchestrationAction[];
  priority: "low" | "normal" | "high" | "urgent";
  businessContext: Record<string, unknown>;
  knowledgeContext: Record<string, unknown>;
  crmContext: Record<string, unknown>;
};

export type ActionExecutionResult = {
  action: OrchestrationAction;
  status: "completed" | "prepared" | "skipped" | "failed";
  detail: string;
  metadata?: Record<string, unknown>;
};

export interface IntentDetector {
  detect(input: OrchestrationInput): OrchestrationPlan;
}

export interface ActionExecutor {
  readonly action: OrchestrationAction;
  execute(input: OrchestrationInput, plan: OrchestrationPlan): Promise<ActionExecutionResult>;
}

const actionSet = new Set<OrchestrationAction>(orchestrationActions);

function latestUserText(conversation: ConversationMessage[]) {
  return (
    [...conversation].reverse().find((message) => message.role === "user")
      ?.content ?? ""
  );
}

function hasLeadEmail(lead?: Record<string, unknown>) {
  return typeof lead?.email === "string" && lead.email.includes("@");
}

// Rule-based intent detection is deterministic today; an LLM detector can replace this interface later.
export class RuleBasedIntentDetector implements IntentDetector {
  detect(input: OrchestrationInput): OrchestrationPlan {
    const text = latestUserText(input.conversation).toLowerCase();
    const allText = input.conversation.map((message) => message.content).join(" ").toLowerCase();
    let intent: OrchestrationIntent = "General Question";
    let confidence = 0.62;

    if (/\b(price|pricing|cost|how much|budget|rate)\b/.test(text)) {
      intent = "Pricing Request";
      confidence = 0.84;
    } else if (/\b(book|appointment|schedule|meeting|call|calendly|audit)\b/.test(text)) {
      intent = "Book Appointment";
      confidence = 0.88;
    } else if (/\b(human|agent|person|representative|manager)\b/.test(text)) {
      intent = "Need Human";
      confidence = 0.86;
    } else if (/\b(angry|bad|complaint|refund|upset|not happy|terrible)\b/.test(text)) {
      intent = "Complaint";
      confidence = 0.82;
    } else if (/\b(quote|estimate|proposal)\b/.test(text)) {
      intent = "Quote Request";
      confidence = 0.84;
    } else if (/\b(upload|document|pdf|docx|file)\b/.test(text)) {
      intent = "Document Upload";
      confidence = 0.8;
    } else if (/\b(support|help|issue|problem|broken)\b/.test(text)) {
      intent = "Support Request";
      confidence = 0.78;
    } else if (/\b(customer|client|already|existing)\b/.test(text)) {
      intent = "Existing Customer";
      confidence = 0.74;
    } else if (/\b(buy|interested|need this|automation|lead|sales)\b/.test(allText)) {
      intent = "Sales Opportunity";
      confidence = 0.72;
    } else if (!text.trim()) {
      intent = "Unknown";
      confidence = 0.35;
    }

    return {
      intent,
      confidence,
      requiredActions: this.actionsForIntent(intent, input),
      priority: this.priorityForIntent(intent),
      businessContext: { business_id: input.businessId, channel: input.channel ?? "web_chat" },
      knowledgeContext: { should_search: this.shouldSearchKnowledge(intent) },
      crmContext: { lead_present: hasLeadEmail(input.lead), lead: input.lead ?? {} },
    };
  }

  private shouldSearchKnowledge(intent: OrchestrationIntent) {
    return ["General Question", "Pricing Request", "Support Request", "Quote Request"].includes(intent);
  }

  private priorityForIntent(intent: OrchestrationIntent): OrchestrationPlan["priority"] {
    if (intent === "Complaint" || intent === "Need Human") return "urgent";
    if (intent === "Book Appointment" || intent === "Quote Request") return "high";
    if (intent === "Sales Opportunity" || intent === "Pricing Request") return "normal";
    return "low";
  }

  private actionsForIntent(intent: OrchestrationIntent, input: OrchestrationInput): OrchestrationAction[] {
    const actions: OrchestrationAction[] = ["SaveConversation"];

    if (this.shouldSearchKnowledge(intent)) actions.push("SearchKnowledge", "SearchSemanticMemory");
    if (hasLeadEmail(input.lead)) actions.push("CreateLead", "UpdateLead");

    if (intent === "Book Appointment") actions.push("ScheduleCalendly", "AssignFollowUp");
    if (intent === "Need Human" || intent === "Complaint") actions.push("EscalateHuman", "NotifyOwner", "StopAutomation");
    if (intent === "Pricing Request" || intent === "Quote Request") actions.push("GenerateAudit", "SendEmail", "CreateTask");
    if (intent === "Sales Opportunity") actions.push("GenerateAudit", "NotifyOwner", "AssignFollowUp");
    if (intent === "Support Request") actions.push("CreateTask", "NotifyOwner");
    if (intent === "Document Upload") actions.push("CreateTask");

    return Array.from(new Set(actions)).filter((action) => actionSet.has(action));
  }
}

abstract class BaseActionExecutor implements ActionExecutor {
  abstract readonly action: OrchestrationAction;

  protected prepared(detail: string, metadata: Record<string, unknown> = {}): ActionExecutionResult {
    return { action: this.action, status: "prepared", detail, metadata };
  }

  abstract execute(input: OrchestrationInput, plan: OrchestrationPlan): Promise<ActionExecutionResult>;
}

class CreateLeadAction extends BaseActionExecutor {
  readonly action = "CreateLead" as const;
  async execute(input: OrchestrationInput) {
    return this.prepared("Lead creation remains handled by the existing lead capture flow.", { lead: input.lead ?? {} });
  }
}

class UpdateLeadAction extends BaseActionExecutor {
  readonly action = "UpdateLead" as const;
  async execute(input: OrchestrationInput) {
    return this.prepared("Lead update prepared for CRM synchronization.", { lead_id: input.leadId ?? null });
  }
}

class SearchKnowledgeAction extends BaseActionExecutor {
  readonly action = "SearchKnowledge" as const;
  async execute(_input: OrchestrationInput, plan: OrchestrationPlan) {
    return this.prepared("Knowledge Center search requested.", { intent: plan.intent });
  }
}

class SearchSemanticMemoryAction extends BaseActionExecutor {
  readonly action = "SearchSemanticMemory" as const;

  constructor(private readonly supabase: SupabaseClient) {
    super();
  }

  async execute(input: OrchestrationInput) {
    const services = createSemanticMemoryServices(this.supabase);
    const query = latestUserText(input.conversation);
    const results = await services.knowledgeRetriever.searchKnowledge({
      businessId: input.businessId,
      query,
      limit: 3,
    });

    return this.prepared("Semantic memory searched with PostgreSQL full-text search.", {
      result_count: results.length,
    });
  }
}

class GenerateAuditAction extends BaseActionExecutor {
  readonly action = "GenerateAudit" as const;
  async execute() {
    return this.prepared("Audit generation queued for the existing audit workflow.");
  }
}

class ScheduleCalendlyAction extends BaseActionExecutor {
  readonly action = "ScheduleCalendly" as const;
  async execute() {
    return this.prepared("Calendly scheduling suggested; no appointment is created automatically.");
  }
}

class SendEmailAction extends BaseActionExecutor {
  readonly action = "SendEmail" as const;
  async execute() {
    return this.prepared("Email action prepared; existing email safeguards decide actual sending.");
  }
}

class CreateTaskAction extends BaseActionExecutor {
  readonly action = "CreateTask" as const;
  async execute(_input: OrchestrationInput, plan: OrchestrationPlan) {
    return this.prepared("Internal task prepared.", { priority: plan.priority });
  }
}

class NotifyOwnerAction extends BaseActionExecutor {
  readonly action = "NotifyOwner" as const;
  async execute(_input: OrchestrationInput, plan: OrchestrationPlan) {
    return this.prepared("Owner notification prepared.", { intent: plan.intent });
  }
}

class AssignFollowUpAction extends BaseActionExecutor {
  readonly action = "AssignFollowUp" as const;
  async execute() {
    return this.prepared("Follow-up assignment prepared for the existing follow-up engine.");
  }
}

class StopAutomationAction extends BaseActionExecutor {
  readonly action = "StopAutomation" as const;
  async execute() {
    return this.prepared("Automation stop prepared for escalation scenarios.");
  }
}

class EscalateHumanAction extends BaseActionExecutor {
  readonly action = "EscalateHuman" as const;
  async execute() {
    return this.prepared("Human escalation prepared.");
  }
}

class SaveConversationAction extends BaseActionExecutor {
  readonly action = "SaveConversation" as const;
  async execute(input: OrchestrationInput) {
    return this.prepared("Conversation captured in orchestration log.", {
      message_count: input.conversation.length,
    });
  }
}

export function createActionExecutors(supabase: SupabaseClient): ActionExecutor[] {
  return [
    new CreateLeadAction(),
    new UpdateLeadAction(),
    new SearchKnowledgeAction(),
    new SearchSemanticMemoryAction(supabase),
    new GenerateAuditAction(),
    new ScheduleCalendlyAction(),
    new SendEmailAction(),
    new CreateTaskAction(),
    new NotifyOwnerAction(),
    new AssignFollowUpAction(),
    new StopAutomationAction(),
    new EscalateHumanAction(),
    new SaveConversationAction(),
  ];
}

export class AiOrchestrator {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly intentDetector: IntentDetector,
    private readonly actionExecutors: ActionExecutor[]
  ) {}

  async orchestrate(input: OrchestrationInput) {
    const startedAt = Date.now();
    const businessId = input.businessId || DEFAULT_BUSINESS_ID;
    const scopedInput = { ...input, businessId };
    const plan = this.intentDetector.detect(scopedInput);
    const results: ActionExecutionResult[] = [];
    const errors: Array<Record<string, unknown>> = [];

    for (const action of plan.requiredActions) {
      const executor = this.actionExecutors.find((candidate) => candidate.action === action);

      if (!executor) {
        errors.push({ action, error: "Missing action executor" });
        continue;
      }

      try {
        results.push(await executor.execute(scopedInput, plan));
      } catch (error) {
        errors.push({
          action,
          error: error instanceof Error ? error.message : "Unknown action error",
        });
      }
    }

    const executionTimeMs = Date.now() - startedAt;
    const result = errors.length ? "completed_with_errors" : "completed";

    await this.supabase.from("ai_orchestration_logs").insert({
      business_id: businessId,
      lead_id: scopedInput.leadId ?? null,
      conversation: scopedInput.conversation,
      detected_intent: plan.intent,
      confidence: plan.confidence,
      required_actions: plan.requiredActions,
      executed_actions: results,
      priority: plan.priority,
      business_context: plan.businessContext,
      knowledge_context: plan.knowledgeContext,
      crm_context: plan.crmContext,
      execution_time_ms: executionTimeMs,
      result,
      errors,
      channel: scopedInput.channel ?? "web_chat",
    });

    return { plan, results, errors, executionTimeMs, result };
  }
}

// Dependency injection root. Future Voice, WhatsApp, SMS, Instagram, Messenger,
// Slack, and Teams adapters can call this same engine without changing it.
export function createAiOrchestrator(supabase: SupabaseClient) {
  return new AiOrchestrator(
    supabase,
    new RuleBasedIntentDetector(),
    createActionExecutors(supabase)
  );
}
