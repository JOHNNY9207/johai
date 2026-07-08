import type { Business, KnowledgeFile, Lead, OrchestrationLog } from "@/app/lib/supabase";

export type BillingPlanKey = "starter" | "professional" | "enterprise" | "enterprise_plus";
export type BillingInterval = "monthly" | "yearly";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete";

export type PlanLimits = {
  seats: number;
  aiUsage: number;
  storageMb: number;
  knowledgeItems: number;
  conversations: number;
  automations: number;
};

export type BillingPlan = {
  key: BillingPlanKey;
  name: string;
  description: string;
  monthlyPrice: number | null;
  yearlyPrice: number | null;
  trialDays: number;
  limits: PlanLimits;
  features: string[];
};

export type SubscriptionUsage = {
  seats: number;
  aiUsage: number;
  storageMb: number;
  knowledgeItems: number;
  conversations: number;
  automations: number;
};

export type SubscriptionModel = {
  currentPlan: BillingPlan;
  interval: BillingInterval;
  status: SubscriptionStatus;
  trialDaysRemaining: number;
  renewalDate: string;
  featuresEnabled: Record<string, boolean>;
  usageThisMonth: SubscriptionUsage;
  remainingQuota: SubscriptionUsage;
};

export type BillingContext = {
  business: Business | null;
  leads: Lead[];
  knowledgeFiles: KnowledgeFile[];
  orchestrationLogs: OrchestrationLog[];
  now?: Date;
};

export interface PaymentProvider {
  createCheckoutSession(subscription: SubscriptionModel): Promise<{ url: string }>;
  createCustomerPortal(subscription: SubscriptionModel): Promise<{ url: string }>;
}

export type BillingDependencies = {
  paymentProvider?: PaymentProvider;
};

export const billingPlans: Record<BillingPlanKey, BillingPlan> = {
  starter: {
    key: "starter",
    name: "Starter",
    description: "For a business validating JOHAI with one AI workspace.",
    monthlyPrice: 99,
    yearlyPrice: 990,
    trialDays: 14,
    limits: {
      seats: 1,
      aiUsage: 1000,
      storageMb: 500,
      knowledgeItems: 50,
      conversations: 500,
      automations: 100,
    },
    features: ["CRM", "Command Center", "Knowledge Center", "Basic Automations"],
  },
  professional: {
    key: "professional",
    name: "Professional",
    description: "For growing businesses using JOHAI daily across sales and operations.",
    monthlyPrice: 299,
    yearlyPrice: 2990,
    trialDays: 14,
    limits: {
      seats: 5,
      aiUsage: 10000,
      storageMb: 5000,
      knowledgeItems: 500,
      conversations: 5000,
      automations: 1500,
    },
    features: ["CRM", "Command Center", "Knowledge Center", "AI Orchestrator", "Follow-ups", "Calendly"],
  },
  enterprise: {
    key: "enterprise",
    name: "Enterprise",
    description: "For teams that need higher limits, governance, and deeper automation.",
    monthlyPrice: 999,
    yearlyPrice: 9990,
    trialDays: 30,
    limits: {
      seats: 25,
      aiUsage: 100000,
      storageMb: 50000,
      knowledgeItems: 5000,
      conversations: 50000,
      automations: 15000,
    },
    features: ["Everything in Professional", "Advanced Automations", "Audit Engine", "Chief of Staff"],
  },
  enterprise_plus: {
    key: "enterprise_plus",
    name: "Enterprise+",
    description: "For custom deployments, dedicated support, and future private channels.",
    monthlyPrice: null,
    yearlyPrice: null,
    trialDays: 30,
    limits: {
      seats: 100,
      aiUsage: 1000000,
      storageMb: 500000,
      knowledgeItems: 50000,
      conversations: 500000,
      automations: 150000,
    },
    features: ["Everything in Enterprise", "Custom Limits", "Priority Support", "Future Private Channels"],
  },
};

export const featureFlags: Record<string, BillingPlanKey[]> = {
  commandCenter: ["starter", "professional", "enterprise", "enterprise_plus"],
  crm: ["starter", "professional", "enterprise", "enterprise_plus"],
  knowledgeCenter: ["starter", "professional", "enterprise", "enterprise_plus"],
  calendly: ["professional", "enterprise", "enterprise_plus"],
  emailAutomations: ["professional", "enterprise", "enterprise_plus"],
  aiOrchestrator: ["professional", "enterprise", "enterprise_plus"],
  chiefOfStaff: ["enterprise", "enterprise_plus"],
  auditEngine: ["enterprise", "enterprise_plus"],
  semanticMemory: ["enterprise", "enterprise_plus"],
  customChannels: ["enterprise_plus"],
};

function normalizePlan(plan?: string): BillingPlanKey {
  const key = (plan ?? "starter").toLowerCase().replace(/\s+/g, "_");

  if (key === "professional" || key === "enterprise" || key === "enterprise_plus" || key === "starter") {
    return key;
  }

  return "starter";
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(date.getDate() + days);
  return next;
}

function storageMb(files: KnowledgeFile[]) {
  const bytes = files.reduce((sum, file) => sum + (file.file_size ?? 0), 0);
  return Math.ceil(bytes / 1024 / 1024);
}

function buildRemainingQuota(limits: PlanLimits, usage: SubscriptionUsage): SubscriptionUsage {
  return {
    seats: Math.max(0, limits.seats - usage.seats),
    aiUsage: Math.max(0, limits.aiUsage - usage.aiUsage),
    storageMb: Math.max(0, limits.storageMb - usage.storageMb),
    knowledgeItems: Math.max(0, limits.knowledgeItems - usage.knowledgeItems),
    conversations: Math.max(0, limits.conversations - usage.conversations),
    automations: Math.max(0, limits.automations - usage.automations),
  };
}

export class BillingService {
  constructor(private readonly dependencies: BillingDependencies = {}) {}

  buildSubscription(context: BillingContext): SubscriptionModel {
    const now = context.now ?? new Date();
    const plan = billingPlans[normalizePlan(context.business?.plan)];
    const createdAt = context.business?.created_at ? new Date(context.business.created_at) : now;
    const trialEndsAt = addDays(createdAt, plan.trialDays);
    const trialDaysRemaining = Math.max(
      0,
      Math.ceil((trialEndsAt.getTime() - now.getTime()) / 86_400_000)
    );
    const usageThisMonth: SubscriptionUsage = {
      seats: 1,
      aiUsage: context.orchestrationLogs.length,
      storageMb: storageMb(context.knowledgeFiles),
      knowledgeItems: context.knowledgeFiles.length,
      conversations: context.leads.filter((lead) => Array.isArray(lead.conversation)).length,
      automations: context.orchestrationLogs.filter((log) => log.required_actions?.length).length,
    };

    return {
      currentPlan: plan,
      interval: "monthly",
      status: trialDaysRemaining > 0 ? "trialing" : "active",
      trialDaysRemaining,
      renewalDate: addDays(now, 30).toISOString(),
      featuresEnabled: this.buildFeatureFlags(plan.key),
      usageThisMonth,
      remainingQuota: buildRemainingQuota(plan.limits, usageThisMonth),
    };
  }

  buildFeatureFlags(plan: BillingPlanKey) {
    return Object.fromEntries(
      Object.entries(featureFlags).map(([feature, plans]) => [
        feature,
        plans.includes(plan),
      ])
    );
  }

  // Stripe will plug in here later through dependency injection. The Billing
  // service stays provider-neutral until a payment gateway is selected.
  async createCheckout(subscription: SubscriptionModel) {
    if (!this.dependencies.paymentProvider) {
      return null;
    }

    return this.dependencies.paymentProvider.createCheckoutSession(subscription);
  }
}

export function createBillingService(dependencies?: BillingDependencies) {
  return new BillingService(dependencies);
}
