"use client";

import { useState } from "react";
import { Send } from "lucide-react";
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

const quickPrompts = [
  "I own a dental clinic.",
  "I own a restaurant.",
  "I own a beauty salon.",
  "I run a real estate business.",
];

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

  const [lead, setLead] = useState<LeadData>({
    first_name: "",
    email: "",
    business_name: "",
    business_type: "",
    biggest_problem: "",
  });

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
        email:
          cleanLeadValue(data.lead?.email).toLowerCase() || lead.email,
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
    <div className="flex h-[560px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0B1220] shadow-2xl">
      <div className="border-b border-white/10 bg-blue-600 p-5">
        <h3 className="text-xl font-bold text-white">JOHAI AI Assistant</h3>
        <p className="text-sm text-blue-100">
          Get a quick automation audit for your business.
        </p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-[85%] whitespace-pre-line rounded-2xl p-4 ${
              message.role === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "bg-white/10 text-gray-100"
            }`}
          >
            {message.content}
          </div>
        ))}

        {messages.length === 1 && (
          <div className="grid gap-2">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-gray-200 transition hover:bg-white/10"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="max-w-[85%] rounded-2xl bg-white/10 p-4 text-gray-300">
            JOHAI is thinking...
          </div>
        )}

        {leadSaved && (
          <CalendlyBookingButton
            label="Book My Free AI Audit"
            className="flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-black transition hover:bg-blue-100"
          />
        )}

        {saveError && (
          <div className="max-w-[85%] rounded-2xl bg-red-500/10 p-4 text-sm text-red-200">
            {saveError}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
          {!lead.business_type && (
            <span className="rounded-full bg-white/10 px-3 py-2 text-gray-300">
              Need: business type
            </span>
          )}

          {!lead.biggest_problem && (
            <span className="rounded-full bg-white/10 px-3 py-2 text-gray-300">
              Need: main problem
            </span>
          )}

          {!lead.business_name && (
            <span className="rounded-full bg-white/10 px-3 py-2 text-gray-300">
              Need: business name
            </span>
          )}

          {!lead.first_name && (
            <span className="rounded-full bg-white/10 px-3 py-2 text-gray-300">
              Need: first name
            </span>
          )}

          {!lead.email && (
            <span className="rounded-full bg-white/10 px-3 py-2 text-gray-300">
              Need: email
            </span>
          )}

          {leadSaved && (
            <span className="col-span-2 rounded-full bg-green-500/20 px-3 py-2 text-green-300">
              Lead saved in JOHAI CRM
            </span>
          )}

          {savingLead && (
            <span className="col-span-2 rounded-full bg-blue-500/20 px-3 py-2 text-blue-200">
              Saving lead...
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
            placeholder="Type your message..."
            className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-white outline-none placeholder:text-gray-500"
          />

          <button
            onClick={() => sendMessage()}
            disabled={loading || savingLead}
            className="rounded-xl bg-blue-600 px-4 transition hover:bg-blue-500"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
