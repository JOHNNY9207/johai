"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Check,
  Copy,
  Loader2,
  Send,
  Sparkles,
  UserRound,
} from "lucide-react";
import CalendlyBookingButton from "@/components/CalendlyBookingButton";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type LeadData = {
  first_name: string;
  email: string;
  business_name: string;
  business_type: string;
  biggest_problem: string;
};

type ChatResponse = {
  reply?: string;
  lead?: Partial<LeadData>;
};

type CalendlyAvailabilityResponse = {
  connected?: boolean;
  bookingUrl?: string;
  message?: string;
  times?: Array<{
    startTime: string;
    schedulingUrl: string;
  }>;
};

const quickPrompts = [
  "I own a dental clinic.",
  "I own a restaurant.",
  "I own a beauty salon.",
  "I run a real estate business.",
];

const leadSteps: Array<keyof LeadData> = [
  "business_type",
  "biggest_problem",
  "business_name",
  "first_name",
  "email",
];

const leadStepLabels: Record<keyof LeadData, string> = {
  first_name: "Name",
  email: "Email",
  business_name: "Business",
  business_type: "Industry",
  biggest_problem: "Problem",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanLeadValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isCompleteLead(lead: LeadData) {
  return Boolean(
    lead.first_name &&
      lead.email &&
      lead.business_name &&
      lead.business_type &&
      lead.biggest_problem
  );
}

function hasValidEmail(lead: LeadData) {
  return emailPattern.test(lead.email);
}

function isBookingIntent(text: string) {
  return /\b(book|booking|call|meeting|appointment|schedule|calendly|audit)\b/i.test(
    text
  );
}

function formatAvailabilityTime(startTime: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startTime));
}

function renderMessage(content: string) {
  return content.split("\n").map((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return <br key={index} />;
    }

    if (/^\d+\./.test(trimmed)) {
      return (
        <p key={index} className="pl-1">
          {trimmed}
        </p>
      );
    }

    return <p key={index}>{trimmed}</p>;
  });
}

async function getAvailabilityMessage() {
  try {
    const res = await fetch("/api/calendly/availability");

    if (!res.ok) {
      return null;
    }

    const data = (await res.json()) as CalendlyAvailabilityResponse;

    if (data.times?.length) {
      const times = data.times
        .map(
          (time, index) =>
            `${index + 1}. ${formatAvailabilityTime(time.startTime)}`
        )
        .join("\n");

      return `Here are the next available meeting times I found:\n\n${times}\n\nUse the booking button below to confirm the exact time in Calendly.`;
    }

    if (data.message) {
      return `${data.message}\n\nBooking URL: ${data.bookingUrl ?? "https://calendly.com/"}`;
    }
  } catch (error) {
    console.error(error);
  }

  return "I couldn't load live Calendly availability right now. Please use the booking button below to choose a time.";
}

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm JOHAI. Tell me what type of business you own, and I'll show you what AI can automate.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadSaved, setLeadSaved] = useState(false);
  const [savingLead, setSavingLead] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [showBookingButton, setShowBookingButton] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const [lead, setLead] = useState<LeadData>({
    first_name: "",
    email: "",
    business_name: "",
    business_type: "",
    biggest_problem: "",
  });

  async function copyMessage(content: string, index: number) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1200);
    } catch {
      setCopiedIndex(null);
    }
  }

  async function saveLead(
    nextLead: LeadData,
    conversation: Message[],
    aiResponse: string
  ) {
    if (
      leadSaved ||
      savingLead ||
      !isCompleteLead(nextLead) ||
      !hasValidEmail(nextLead)
    ) {
      return;
    }

    setSavingLead(true);
    setSaveError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...nextLead,
          ai_recommendations: aiResponse,
          conversation,
        }),
      });

      if (!res.ok) {
        setSaveError("I could not save this lead in the CRM yet.");
        return;
      }

      setLeadSaved(true);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Perfect - your information has been saved in JOHAI CRM for a personalized AI Automation Audit.",
        },
      ]);
    } catch (error) {
      console.error(error);
      setSaveError("I could not connect to the CRM. Please try again.");
    } finally {
      setSavingLead(false);
    }
  }

  async function sendMessage(customMessage?: string) {
    const text = customMessage || input;

    if (!text.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: text,
    };
    const wantsToBook = isBookingIntent(text);

    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = (await res.json()) as ChatResponse;

      const aiReply = data.reply || "Sorry, I could not respond.";

      const extractedLead: LeadData = {
        first_name: cleanLeadValue(data.lead?.first_name) || lead.first_name,
        email: cleanLeadValue(data.lead?.email).toLowerCase() || lead.email,
        business_name:
          cleanLeadValue(data.lead?.business_name) || lead.business_name,
        business_type:
          cleanLeadValue(data.lead?.business_type) || lead.business_type,
        biggest_problem:
          cleanLeadValue(data.lead?.biggest_problem) || lead.biggest_problem,
      };

      setLead(extractedLead);

      const finalConversation: Message[] = [
        ...updatedMessages,
        {
          role: "assistant",
          content: aiReply,
        },
      ];

      setMessages(finalConversation);

      await saveLead(extractedLead, finalConversation, aiReply);

      const qualifiedForBooking =
        isCompleteLead(extractedLead) && hasValidEmail(extractedLead);

      if (wantsToBook && qualifiedForBooking) {
        setShowBookingButton(true);
        const availabilityMessage = await getAvailabilityMessage();

        if (availabilityMessage) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: availabilityMessage,
            },
          ]);
        }
      } else if (wantsToBook) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I can help with booking after I understand your business, main challenge, name, and email. That way the AI audit is actually useful when you arrive.",
          },
        ]);
      }
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-[620px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#07111f]/95 text-white shadow-2xl shadow-sky-950/40 backdrop-blur-xl">
      <div className="border-b border-white/10 bg-white/[0.04] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
            <Bot size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-semibold">
                JOHAI AI Assistant
              </h3>
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
            <p className="text-xs text-slate-400">
              Live automation audit and lead capture
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => {
            const isUser = message.role === "user";

            return (
              <motion.div
              key={index}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22 }}
              className={`group flex gap-3 ${isUser ? "justify-end" : ""}`}
            >
              {!isUser && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-200">
                  <Sparkles size={16} />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-lg ${
                  isUser
                    ? "bg-cyan-400 text-slate-950 shadow-cyan-950/20"
                    : "border border-white/10 bg-white/[0.06] text-slate-100 shadow-black/20"
                }`}
              >
                <div className="space-y-1 whitespace-pre-line">
                  {renderMessage(message.content)}
                </div>
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => copyMessage(message.content, index)}
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-400 opacity-0 transition hover:text-white group-hover:opacity-100"
                  >
                    {copiedIndex === index ? (
                      <Check size={13} />
                    ) : (
                      <Copy size={13} />
                    )}
                    {copiedIndex === index ? "Copied" : "Copy"}
                  </button>
                )}
              </div>

              {isUser && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-slate-200">
                  <UserRound size={16} />
                </div>
              )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {messages.length === 1 && (
          <div className="grid gap-2 pt-2">
            {quickPrompts.map((prompt, index) => (
              <motion.button
                key={prompt}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                onClick={() => sendMessage(prompt)}
                className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-sm text-slate-200 transition hover:border-cyan-300/40 hover:bg-cyan-300/10"
              >
                {prompt}
              </motion.button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm text-slate-300">
            <Loader2 className="animate-spin text-cyan-300" size={17} />
            JOHAI is thinking
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:120ms]" />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-300 [animation-delay:240ms]" />
            </span>
          </div>
        )}

        {(leadSaved || showBookingButton) && (
          <CalendlyBookingButton
            label="Book My Free AI Audit"
            className="flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
          />
        )}

        {saveError && (
          <div className="rounded-2xl border border-red-400/25 bg-red-500/10 p-4 text-sm text-red-200">
            {saveError}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 bg-white/[0.03] p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {leadSteps.map((step) => (
            <span
              key={step}
              className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
                lead[step]
                  ? "border-emerald-300/25 bg-emerald-400/10 text-emerald-200"
                  : "border-white/10 bg-white/[0.04] text-slate-400"
              }`}
            >
              {lead[step] ? "Saved" : "Need"} {leadStepLabels[step]}
            </span>
          ))}

          {savingLead && (
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-[11px] font-semibold text-cyan-200">
              Saving lead
            </span>
          )}
        </div>

        <div className="flex gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            placeholder="Ask about automation, costs, booking..."
            className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading || savingLead}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
