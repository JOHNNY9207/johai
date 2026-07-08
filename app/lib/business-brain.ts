import type {
  Business,
  BusinessBrain,
  BusinessBrainRecommendation,
  BusinessBrainScore,
  BusinessSettings,
  KnowledgeItem,
} from "@/app/lib/supabase";

export type IndustryTemplate = {
  industry: string;
  commonServices: string[];
  commonFaqs: string[];
  vocabulary: string[];
  suggestedAutomations: string[];
};

export type BusinessBrainInput = {
  business: Business | null;
  settings: BusinessSettings | null;
  brain: BusinessBrain | null;
  knowledgeItems: KnowledgeItem[];
};

export type BusinessBrainSnapshot = {
  industry: string;
  vocabulary: string[];
  score: BusinessBrainScore;
  recommendations: BusinessBrainRecommendation[];
  template: IndustryTemplate;
};

export interface BusinessBrainScorer {
  score(input: BusinessBrainInput): BusinessBrainScore;
}

export interface BusinessBrainRecommender {
  recommend(input: BusinessBrainInput, score: BusinessBrainScore): BusinessBrainRecommendation[];
}

export interface IndustryTemplateProvider {
  getTemplate(industry: string): IndustryTemplate;
}

const emptyTemplate: IndustryTemplate = {
  industry: "General Business",
  commonServices: [],
  commonFaqs: [],
  vocabulary: [],
  suggestedAutomations: [],
};

export const industryTemplates: IndustryTemplate[] = [
  {
    industry: "Dental Clinic",
    commonServices: ["cleaning", "implant", "crown", "root canal", "orthodontics"],
    commonFaqs: ["Do you accept insurance?", "Do you offer emergency appointments?"],
    vocabulary: ["implant", "crown", "root canal", "orthodontics", "hygiene"],
    suggestedAutomations: ["missed call text-back", "recall reminders", "insurance intake"],
  },
  {
    industry: "Restaurant",
    commonServices: ["reservation", "takeout", "delivery", "catering", "private events"],
    commonFaqs: ["Do you take reservations?", "Do you handle allergies?"],
    vocabulary: ["reservation", "takeout", "delivery", "menu", "allergy"],
    suggestedAutomations: ["reservation assistant", "menu FAQ", "review requests"],
  },
  {
    industry: "Law Firm",
    commonServices: ["consultation", "case review", "contract review", "litigation"],
    commonFaqs: ["Do you offer free consultations?", "What documents should I bring?"],
    vocabulary: ["retainer", "consultation", "case", "contract", "compliance"],
    suggestedAutomations: ["lead intake", "consultation scheduling", "document checklist"],
  },
  {
    industry: "Beauty Salon",
    commonServices: ["balayage", "highlights", "keratin", "extensions", "color correction"],
    commonFaqs: ["How long does the appointment take?", "Do I need a deposit?"],
    vocabulary: ["balayage", "highlights", "keratin", "extensions", "toner"],
    suggestedAutomations: ["booking assistant", "deposit reminders", "aftercare follow-up"],
  },
  {
    industry: "Real Estate",
    commonServices: ["buyer consultation", "listing appointment", "home valuation", "showings"],
    commonFaqs: ["What is my home worth?", "How fast can I sell?"],
    vocabulary: ["listing", "showing", "valuation", "buyer", "seller"],
    suggestedAutomations: ["lead qualification", "showing scheduler", "valuation intake"],
  },
  {
    industry: "Accounting",
    commonServices: ["bookkeeping", "tax prep", "payroll", "financial reporting"],
    commonFaqs: ["What documents do I need?", "Do you handle payroll?"],
    vocabulary: ["bookkeeping", "tax", "payroll", "deduction", "filing"],
    suggestedAutomations: ["document collection", "tax deadline reminders", "client onboarding"],
  },
  {
    industry: "Fitness",
    commonServices: ["personal training", "group classes", "nutrition coaching", "membership"],
    commonFaqs: ["Do you offer trials?", "What classes are beginner friendly?"],
    vocabulary: ["membership", "class", "trainer", "nutrition", "trial"],
    suggestedAutomations: ["trial booking", "membership follow-up", "class FAQ"],
  },
  {
    industry: "Automotive",
    commonServices: ["oil change", "diagnostic", "brakes", "tires", "repair"],
    commonFaqs: ["Can I get an estimate?", "Do you take walk-ins?"],
    vocabulary: ["diagnostic", "brakes", "tires", "repair", "inspection"],
    suggestedAutomations: ["service scheduler", "estimate intake", "maintenance reminders"],
  },
  {
    industry: "Home Services",
    commonServices: ["inspection", "repair", "installation", "maintenance", "emergency service"],
    commonFaqs: ["Do you offer emergency service?", "Can I get a quote?"],
    vocabulary: ["quote", "inspection", "repair", "installation", "maintenance"],
    suggestedAutomations: ["quote qualification", "dispatch intake", "follow-up reminders"],
  },
  {
    industry: "Medical Practice",
    commonServices: ["consultation", "follow-up", "screening", "treatment plan"],
    commonFaqs: ["Do you accept insurance?", "How do I prepare for my visit?"],
    vocabulary: ["appointment", "insurance", "screening", "referral", "patient"],
    suggestedAutomations: ["patient intake", "appointment reminders", "FAQ assistant"],
  },
];

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function hasText(value: unknown) {
  return asText(value).length > 0;
}

function hasObjectContent(value: unknown) {
  const record = asRecord(value);
  return Object.values(record).some((item) =>
    Array.isArray(item) ? item.length > 0 : hasText(item) || Object.keys(asRecord(item)).length > 0
  );
}

function hasArrayContent(value: unknown) {
  return Array.isArray(value) && value.length > 0;
}

function scoreFromChecks(checks: boolean[]) {
  return Math.round((checks.filter(Boolean).length / Math.max(checks.length, 1)) * 100);
}

class DefaultIndustryTemplateProvider implements IndustryTemplateProvider {
  getTemplate(industry: string) {
    const normalized = industry.toLowerCase();
    return (
      industryTemplates.find((template) =>
        normalized.includes(template.industry.toLowerCase())
      ) ?? emptyTemplate
    );
  }
}

class DefaultBusinessBrainScorer implements BusinessBrainScorer {
  score(input: BusinessBrainInput): BusinessBrainScore {
    const company = asRecord(input.settings?.company_profile);
    const assistant = asRecord(input.settings?.ai_assistant_config);
    const services = asRecord(input.settings?.services_config);
    const communication = asRecord(input.settings?.communication_config);
    const brain = input.brain;
    const knowledge = input.knowledgeItems;

    const businessInformationCompleteness = scoreFromChecks([
      hasText(input.business?.name),
      hasText(company.industry) || hasText(brain?.industry),
      hasText(company.website),
      hasText(company.businessDescription),
      hasText(assistant.language) || hasArrayContent(brain?.languages),
      hasText(assistant.tone) || hasText(brain?.tone_of_voice),
      hasObjectContent(brain?.opening_hours),
      hasArrayContent(brain?.target_customers),
    ]);
    const knowledgeCompleteness = Math.min(100, knowledge.length * 16);
    const servicesDocumented = scoreFromChecks([
      hasText(services.services),
      hasArrayContent(brain?.services),
      hasArrayContent(brain?.products),
      hasObjectContent(brain?.pricing) || hasText(services.pricingNotes),
    ]);
    const policiesDocumented = scoreFromChecks([
      knowledge.some((item) => item.section === "Policies"),
      hasObjectContent(brain?.policies),
      hasObjectContent(brain?.booking_rules),
      hasObjectContent(brain?.escalation_rules),
    ]);
    const faqDocumented = scoreFromChecks([
      knowledge.some((item) => item.section === "FAQ"),
      hasText(services.commonQuestions),
      hasArrayContent(brain?.frequently_asked_questions),
    ]);
    const websiteImported = knowledge.some((item) => item.section === "Website Import") ? 100 : 0;
    const aiReadiness = scoreFromChecks([
      businessInformationCompleteness >= 70,
      knowledgeCompleteness >= 40,
      servicesDocumented >= 50,
      faqDocumented >= 50,
      policiesDocumented >= 50,
      hasObjectContent(communication) || hasObjectContent(brain?.communication_rules),
      hasArrayContent(brain?.vocabulary),
    ]);
    const overallScore = Math.round(
      (businessInformationCompleteness +
        knowledgeCompleteness +
        servicesDocumented +
        policiesDocumented +
        faqDocumented +
        websiteImported +
        aiReadiness) /
        7
    );

    return {
      businessInformationCompleteness,
      knowledgeCompleteness,
      servicesDocumented,
      policiesDocumented,
      faqDocumented,
      websiteImported,
      aiReadiness,
      overallScore,
    };
  }
}

class DefaultBusinessBrainRecommender implements BusinessBrainRecommender {
  recommend(input: BusinessBrainInput, score: BusinessBrainScore) {
    const company = asRecord(input.settings?.company_profile);
    const services = asRecord(input.settings?.services_config);
    const brain = input.brain;
    const knowledge = input.knowledgeItems;
    const recommendations: BusinessBrainRecommendation[] = [];

    const add = (title: string, detail: string, priority: BusinessBrainRecommendation["priority"], category: string) => {
      recommendations.push({ title, detail, priority, category });
    };

    if (!hasObjectContent(brain?.pricing) && !hasText(services.pricingNotes)) {
      add("No pricing information found.", "Add pricing notes, quote rules, or starting prices so the AI can answer buying questions accurately.", "high", "Pricing");
    }
    if (!knowledge.some((item) => item.section === "Policies") && !hasObjectContent(brain?.policies)) {
      add("No cancellation policy.", "Document cancellation, refund, warranty, or service policies for safer responses.", "high", "Policies");
    }
    if (!hasObjectContent(brain?.escalation_rules)) {
      add("No emergency process.", "Define when JOHAI should stop automation and escalate to a human.", "medium", "Escalation");
    }
    if (!hasObjectContent(brain?.opening_hours)) {
      add("No opening hours.", "Add business hours and after-hours rules for bookings and support requests.", "medium", "Operations");
    }
    if (!hasObjectContent(brain?.booking_rules)) {
      add("No booking rules.", "Define appointment length, deposit rules, lead qualification, and unavailable cases.", "high", "Booking");
    }
    if (!knowledge.some((item) => item.section === "FAQ") && !hasText(services.commonQuestions)) {
      add("No FAQ.", "Add common questions so the AI can answer faster and reduce owner interruptions.", "medium", "FAQ");
    }
    if (!hasText(company.website) && !knowledge.some((item) => item.section === "Website Import")) {
      add("Website not imported.", "Import the website or add a URL in onboarding to improve business context.", "low", "Knowledge");
    }
    if (score.overallScore < 70) {
      add("AI readiness needs more context.", "Complete the Business Brain sections before enabling aggressive automation.", "high", "AI readiness");
    }

    return recommendations;
  }
}

export class BusinessBrainService {
  constructor(
    private readonly templateProvider: IndustryTemplateProvider,
    private readonly scorer: BusinessBrainScorer,
    private readonly recommender: BusinessBrainRecommender
  ) {}

  buildSnapshot(input: BusinessBrainInput): BusinessBrainSnapshot {
    const company = asRecord(input.settings?.company_profile);
    const industry = asText(input.brain?.industry) || asText(company.industry) || "General Business";
    const template = this.templateProvider.getTemplate(industry);
    const vocabulary = Array.from(
      new Set([...(input.brain?.vocabulary ?? []), ...template.vocabulary])
    );
    const score = this.scorer.score(input);
    const recommendations = this.recommender.recommend(input, score);

    return { industry, vocabulary, score, recommendations, template };
  }
}

// Dependency injection root for future Semantic Search, Orchestrator, Audit, Voice,
// WhatsApp, and SMS integrations. Swap collaborators here, not in consumers.
export function createBusinessBrainService() {
  return new BusinessBrainService(
    new DefaultIndustryTemplateProvider(),
    new DefaultBusinessBrainScorer(),
    new DefaultBusinessBrainRecommender()
  );
}
