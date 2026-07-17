import {
  portalContextPolicy,
  getPortalConfidenceLabel,
  shouldOfferHumanHelp,
  type PortalConfidence,
  type PortalContextSnapshot,
  type PortalEscalation,
  type PortalSuggestion,
} from "./customer-portal-contextual-intelligence.ts";
import type { PortalDocument } from "./customer-portal-types.ts";

export const portalDocumentAssistanceOperations = [
  "explain",
  "summarize",
  "key-actions",
  "important-dates",
  "questions",
  "translate",
  "related-context",
] as const;

export type PortalDocumentAssistanceOperation =
  (typeof portalDocumentAssistanceOperations)[number];

export type PortalMessageRewriteTone =
  | "clear"
  | "concise"
  | "polite"
  | "translate";

export type PortalGeneratedGuidance = Readonly<{
  body: string;
  bullets?: readonly string[];
  confidence: PortalConfidence;
  escalation?: PortalEscalation;
  generatedLabel: "AI-generated" | "Deterministic demo guidance";
  sourceLabel: string;
  sourceNotice: string;
  title: string;
}>;

export type PortalDocumentAssistanceRequest = Readonly<{
  document: PortalDocument;
  operation: PortalDocumentAssistanceOperation;
  snapshot: PortalContextSnapshot;
  targetLanguage?: string;
}>;

export type PortalMessageAssistanceRequest = Readonly<{
  draft?: string;
  snapshot: PortalContextSnapshot;
  targetLanguage?: string;
  tone?: PortalMessageRewriteTone;
}>;

export type PortalContextualIntelligenceProvider = Readonly<{
  assistDocument: (
    request: PortalDocumentAssistanceRequest
  ) => Promise<PortalGeneratedGuidance>;
  messageSuggestions: (
    request: PortalMessageAssistanceRequest
  ) => Promise<readonly PortalSuggestion[]>;
  mode: "deterministic-demo" | "unavailable";
  rewriteMessage: (
    request: PortalMessageAssistanceRequest
  ) => Promise<PortalGeneratedGuidance>;
  supportedLanguages: readonly string[];
}>;

const unavailableGuidance: PortalGeneratedGuidance = Object.freeze({
  body:
    "Contextual assistance is not available because no approved provider and customer-visible source are configured for this action.",
  confidence: "unsupported",
  generatedLabel: "AI-generated",
  sourceLabel: "No approved customer-visible source",
  sourceNotice: portalContextPolicy.confidenceWording.unavailable,
  title: "Assistance unavailable",
});

export const unavailablePortalContextualIntelligenceProvider: PortalContextualIntelligenceProvider =
  Object.freeze({
    async assistDocument() {
      return unavailableGuidance;
    },
    async messageSuggestions() {
      return [];
    },
    mode: "unavailable",
    async rewriteMessage() {
      return unavailableGuidance;
    },
    supportedLanguages: [],
  });

function canUseDocument(
  snapshot: PortalContextSnapshot,
  document: PortalDocument
) {
  return (
    snapshot.access === "active" &&
    snapshot.profile !== null &&
    document.availability === "available" &&
    document.businessId === snapshot.context.businessId &&
    document.customerProfileId === snapshot.context.customerProfileId &&
    snapshot.documents.some((item) => item.id === document.id)
  );
}

function sourceNotice(confidence: PortalConfidence) {
  return portalContextPolicy.confidenceWording[
    getPortalConfidenceLabel(confidence)
  ];
}

function guidance(
  title: string,
  body: string,
  sourceLabel: string,
  options?: {
    bullets?: readonly string[];
    confidence?: PortalConfidence;
    escalation?: PortalEscalation;
  }
): PortalGeneratedGuidance {
  const confidence = options?.confidence ?? "supported";
  return {
    body,
    bullets: options?.bullets,
    confidence,
    escalation: options?.escalation,
    generatedLabel: "Deterministic demo guidance",
    sourceLabel,
    sourceNotice: sourceNotice(confidence),
    title,
  };
}

const regulatedEscalation: PortalEscalation = Object.freeze({
  action: "contact",
  label: "Ask the business for clarification",
  reason:
    "A person must interpret clinical, legal, financial, or contractual meaning.",
});

const portalDemoSupportedLanguages = ["es", "fr"] as const;
const portalDemoDocumentRelations: Readonly<
  Record<string, Readonly<{ appointmentId?: string; requestId?: string }>>
> = Object.freeze({
  "66666666-6666-4666-8666-666666666661": {
    appointmentId: "33333333-3333-4333-8333-333333333331",
  },
  "66666666-6666-4666-8666-666666666662": {
    appointmentId: "33333333-3333-4333-8333-333333333332",
  },
});

function regulatedDocumentGuidance(document: PortalDocument) {
  return guidance(
    "A person should confirm the meaning",
    "This demo can identify the customer-visible document, but it will not interpret clinical findings, legal terms, financial obligations, or required actions.",
    document.title,
    {
      confidence: "prohibited",
      escalation: regulatedEscalation,
    }
  );
}

function demoDocumentGuidance(
  request: PortalDocumentAssistanceRequest
): PortalGeneratedGuidance {
  const { document, operation, snapshot } = request;
  if (!canUseDocument(snapshot, document)) return unavailableGuidance;

  const regulated = ["contract", "invoice", "report"].includes(
    document.documentType
  );
  if (regulated && operation !== "questions" && operation !== "related-context") {
    return regulatedDocumentGuidance(document);
  }

  if (operation === "explain") {
    return guidance(
      "What this document is for",
      "This fictional preparation guide collects the customer-visible steps shared for the upcoming preventive cleaning. The downloaded document remains the source of truth.",
      document.title
    );
  }
  if (operation === "summarize") {
    return guidance(
      "Short summary",
      "The fictional guide helps Sophie prepare for the visit without adding instructions that are not in the approved demo content.",
      document.title,
      {
        bullets: [
          "Arrive 10 minutes early.",
          "Bring the insurance card shown in the appointment guidance.",
          "Bring a current medication list.",
        ],
      }
    );
  }
  if (operation === "key-actions") {
    return guidance(
      "Key actions",
      "These actions repeat the customer-visible preparation information in the fictional demo.",
      document.title,
      {
        bullets: [
          "Review the appointment time and location.",
          "Prepare the insurance card and medication list.",
          "Contact the business if any instruction is unclear.",
        ],
      }
    );
  }
  if (operation === "important-dates") {
    const relatedAppointmentId =
      portalDemoDocumentRelations[document.id]?.appointmentId;
    const appointment = relatedAppointmentId
      ? snapshot.appointments.find((item) => item.id === relatedAppointmentId)
      : undefined;
    return appointment
      ? guidance(
          "Important date",
          "The related fictional appointment time is shown in the Appointments page. Use that appointment record as the source of truth for the date and timezone.",
          `${document.title}; ${appointment.serviceName || "appointment"}`
        )
      : guidance(
          "No supported date found",
          "The approved customer-visible context does not contain a related upcoming date.",
          document.title,
          { confidence: "partially_supported" }
        );
  }
  if (operation === "questions") {
    return guidance(
      "Questions you may want to ask",
      "These prompts do not assume an answer or obligation.",
      document.title,
      {
        bullets: [
          "Is there anything else I should bring?",
          "Who should I contact if my information changes?",
          "Can a person clarify any instruction that is specific to me?",
        ],
      }
    );
  }
  if (operation === "translate") {
    const language = request.targetLanguage?.toLowerCase() ?? "";
    if (!(portalDemoSupportedLanguages as readonly string[]).includes(language)) {
      return guidance(
        "Translation unavailable",
        "The requested language is not supported by the approved demo provider.",
        document.title,
        { confidence: "unsupported" }
      );
    }
    return language === "fr"
      ? guidance(
          "Résumé traduit en français",
          "Ce guide fictif aide Sophie à préparer sa visite. Le document original en anglais reste la source de vérité.",
          document.title,
          {
            bullets: [
              "Arrivez dix minutes à l’avance.",
              "Apportez votre carte d’assurance.",
              "Apportez la liste actuelle de vos médicaments.",
            ],
            confidence: "partially_supported",
          }
        )
      : guidance(
          "Resumen traducido al español",
          "Esta guía ficticia ayuda a Sophie a preparar su visita. El documento original en inglés sigue siendo la fuente de verdad.",
          document.title,
          {
            bullets: [
              "Llegue diez minutos antes.",
              "Traiga su tarjeta del seguro.",
              "Traiga su lista actual de medicamentos.",
            ],
            confidence: "partially_supported",
          }
        );
  }

  const relation = portalDemoDocumentRelations[document.id];
  const appointment = relation?.appointmentId
    ? snapshot.appointments.find((item) => item.id === relation.appointmentId)
    : undefined;
  const requestItem = relation?.requestId
    ? snapshot.requests.find((item) => item.id === relation.requestId)
    : undefined;
  return guidance(
    "Related customer-visible context",
    appointment || requestItem
      ? "This deterministic demo relation was explicitly reviewed. Open the related page to verify the current details."
      : "No explicitly reviewed relation to an appointment or support request is available.",
    [document.title, appointment?.serviceName, requestItem?.subject]
      .filter(Boolean)
      .join("; "),
    {
      confidence:
        appointment || requestItem ? "supported" : "partially_supported",
    }
  );
}

function normalizeDraft(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export const demoPortalContextualIntelligenceProvider: PortalContextualIntelligenceProvider =
  Object.freeze({
    async assistDocument(request) {
      return demoDocumentGuidance(request);
    },
    async messageSuggestions({ snapshot }) {
      if (snapshot.access !== "active" || !snapshot.profile) return [];
      const lastMessage = [...snapshot.messages]
        .reverse()
        .find((item) => item.senderType !== "customer");
      if (!lastMessage) return [];

      return [
        {
          confidence: "supported" as const,
          id: "reply-confirm-preparation",
          label: "Confirm preparation",
          reason: "Based on the latest customer-visible message.",
          sourceIds: [lastMessage.id],
          value: "Thank you. I have the requested items ready for my appointment.",
        },
        {
          confidence: "supported" as const,
          id: "reply-ask-anything-else",
          label: "Ask what else is needed",
          reason: "Based on the latest customer-visible message.",
          sourceIds: [lastMessage.id],
          value: "Could you confirm whether I need to prepare anything else?",
        },
        {
          confidence: "supported" as const,
          id: "reply-request-human",
          label: "Ask a person",
          reason: "Use this when the visible information is not enough.",
          sourceIds: [lastMessage.id],
          value: "I would like a person to help me with this question.",
        },
      ].slice(0, portalContextPolicy.maximumMessageSuggestions);
    },
    mode: "deterministic-demo",
    async rewriteMessage(request) {
      if (request.snapshot.access !== "active" || !request.snapshot.profile) {
        return unavailableGuidance;
      }
      const draft = normalizeDraft(request.draft ?? "");
      if (!draft) return unavailableGuidance;
      const tone = request.tone ?? "clear";
      if (tone === "translate") {
        const language = request.targetLanguage?.toLowerCase() ?? "";
        if (!(portalDemoSupportedLanguages as readonly string[]).includes(language)) {
          return unavailableGuidance;
        }
        return guidance(
          "Translation draft",
          `A deterministic ${language} demo translation is unavailable without an approved phrase for this exact draft. Your original text is unchanged.`,
          "Your unsent message draft",
          { confidence: "partially_supported" }
        );
      }

      const rewritten =
        tone === "polite"
          ? `Hello, ${draft} Thank you.`
          : tone === "concise"
            ? draft
            : draft.charAt(0).toUpperCase() + draft.slice(1);
      return guidance(
        `${tone.charAt(0).toUpperCase() + tone.slice(1)} draft`,
        rewritten,
        "Your unsent message draft",
        {
          confidence: shouldOfferHumanHelp(draft)
            ? "partially_supported"
            : "supported",
          escalation: shouldOfferHumanHelp(draft)
            ? {
                action: "request",
                label: "Ask a person to follow up",
                reason:
                  "Your draft may need human judgment or an authoritative answer.",
              }
            : undefined,
        }
      );
    },
    supportedLanguages: portalDemoSupportedLanguages,
  });
