"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquareText, Send, Sparkles, UserRoundCheck } from "lucide-react";
import {
  createPortalContextSnapshot,
  shouldOfferHumanHelp,
  type PortalSuggestion,
} from "@/app/lib/customer-portal-contextual-intelligence";
import type {
  PortalGeneratedGuidance,
  PortalMessageRewriteTone,
} from "@/app/lib/customer-portal-contextual-provider";
import type { PortalMessage } from "@/app/lib/customer-portal-types";
import { usePortal } from "@/components/portal/PortalProvider";
import { PortalGeneratedGuidancePanel } from "@/components/portal/PortalContextualUi";
import {
  PortalEmptyState,
  PortalInlineError,
  PortalPageHeader,
  PortalPageLoader,
  formatPortalDate,
  getPortalLocale,
  portalDefaultTimeZone,
  portalInput,
  portalPrimaryButton,
} from "@/components/portal/PortalUi";

export function PortalMessages() {
  const {
    activeProfile,
    branding,
    context,
    dataVersion,
    environment,
    initialData,
    intelligenceProvider,
    referenceTime,
    repository,
  } = usePortal();
  const [messages, setMessages] = useState<PortalMessage[] | null>(() =>
    initialData ? [...initialData.messages] : null
  );
  const [body, setBody] = useState("");
  const [requestHuman, setRequestHuman] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sentNotice, setSentNotice] = useState("");
  const [suggestions, setSuggestions] = useState<readonly PortalSuggestion[]>([]);
  const [draftGuidance, setDraftGuidance] = useState<PortalGeneratedGuidance | null>(null);
  const [assistanceBusy, setAssistanceBusy] = useState(false);
  const [draftNotice, setDraftNotice] = useState("");
  const [sending, setSending] = useState(false);
  const [revision, setRevision] = useState(0);
  const endRef = useRef<HTMLDivElement>(null);
  const locale = getPortalLocale(activeProfile.preferredLanguage);

  useEffect(() => {
    let active = true;
    repository.listMessages()
      .then((result) => {
        if (active) {
          setLoadingError(false);
          setMessages(result);
        }
      })
      .catch(() => active && setLoadingError(true));
    return () => {
      active = false;
    };
  }, [dataVersion, repository, revision]);

  useEffect(() => {
    if (messages?.length) endRef.current?.scrollIntoView({ block: "nearest" });
  }, [messages]);

  useEffect(() => {
    let active = true;
    if (!messages) return;
    const snapshot = createPortalContextSnapshot({
      acknowledgements: initialData?.acknowledgements,
      appointments: initialData?.appointments,
      branding,
      context,
      documents: initialData?.documents,
      messages,
      profile: activeProfile,
      referenceTime,
      requests: initialData?.requests,
    });
    intelligenceProvider
      .messageSuggestions({ snapshot })
      .then((result) => {
        if (active) setSuggestions(result.slice(0, 3));
      })
      .catch(() => {
        if (active) setSuggestions([]);
      });
    return () => {
      active = false;
    };
  }, [activeProfile, branding, context, initialData, intelligenceProvider, messages, referenceTime]);

  function applySuggestion(suggestion: PortalSuggestion) {
    setBody(suggestion.value);
    setDraftGuidance(null);
    setDraftNotice("Suggestion added to your unsent draft. Review it before sending.");
  }

  async function rewriteDraft(tone: PortalMessageRewriteTone) {
    if (!messages || !body.trim()) return;
    setAssistanceBusy(true);
    setDraftNotice("");
    const snapshot = createPortalContextSnapshot({
      acknowledgements: initialData?.acknowledgements,
      appointments: initialData?.appointments,
      branding,
      context,
      documents: initialData?.documents,
      messages,
      profile: activeProfile,
      referenceTime,
      requests: initialData?.requests,
    });
    try {
      setDraftGuidance(
        await intelligenceProvider.rewriteMessage({
          draft: body,
          snapshot,
          targetLanguage: activeProfile.preferredLanguage.toLowerCase(),
          tone,
        })
      );
    } finally {
      setAssistanceBusy(false);
    }
  }

  async function sendCurrentMessage() {
    const trimmed = body.trim();
    if (!trimmed) {
      setSendError("Write a message before sending.");
      return;
    }

    setSending(true);
    setSendError("");
    setSentNotice("");
    try {
      const message = await repository.sendMessage({
        body: trimmed,
        humanSupportRequested: requestHuman,
      });
      setMessages((current) => [...(current ?? []), message]);
      setBody("");
      setRequestHuman(false);
      setSentNotice(
        environment === "demo"
          ? "Your message was added to the fictional conversation."
          : "Your message was sent."
      );
    } catch {
      setSendError("Your message could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendCurrentMessage();
  }

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow="Messages"
        title="Your conversation"
        description={`Send a secure message to ${branding?.displayName || "the business serving you"}. Only customer-visible replies appear here; replies are refresh-based, not realtime.`}
      />

      {loadingError ? (
        <PortalInlineError message="Messages could not be loaded." retry={() => setRevision((value) => value + 1)} />
      ) : !messages ? (
        <PortalPageLoader label="Loading messages" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_21rem]">
          <section className="rounded-[2rem] border border-slate-200 bg-white shadow-sm" aria-label="Message history">
            <div className="max-h-[34rem] overflow-y-auto p-4 sm:p-6">
              {messages.length === 0 ? (
                <PortalEmptyState icon={MessageSquareText} title="Start the conversation" description="Your messages and customer-visible replies will remain together here." />
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => {
                    const fromCustomer = message.senderType === "customer";
                    const senderLabel = fromCustomer
                      ? "You"
                      : message.senderType === "ai"
                        ? `${branding?.displayName || "Customer support"} · AI-assisted response`
                        : `${branding?.displayName || "Customer support"} team`;
                    return (
                      <article key={message.id} className={`flex ${fromCustomer ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[88%] rounded-3xl px-4 py-3 sm:max-w-[75%] ${fromCustomer ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-800"}`}>
                          <p className={`text-xs font-bold ${fromCustomer ? "text-slate-300" : "text-cyan-800"}`}>
                            {senderLabel}
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
                          <p className={`mt-2 text-[11px] ${fromCustomer ? "text-slate-400" : "text-slate-600"}`}>
                            {formatPortalDate(message.createdAt, {
                              locale,
                              timeZone: portalDefaultTimeZone,
                            })}
                          </p>
                        </div>
                      </article>
                    );
                  })}
                  <div ref={endRef} />
                </div>
              )}
            </div>

            <form className="sticky bottom-0 border-t border-slate-200 bg-white p-4 sm:p-6" onSubmit={submit}>
              {suggestions.length > 0 ? (
                <section className="mb-5 rounded-2xl border border-cyan-200 bg-cyan-50 p-4" aria-labelledby="suggested-replies-title">
                  <div className="flex items-center gap-2">
                    <Sparkles className="text-cyan-800" aria-hidden="true" size={17} />
                    <h2 id="suggested-replies-title" className="text-sm font-semibold">Suggested replies</h2>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-600">Suggestions only fill your draft. Nothing is sent until you confirm.</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        className="min-h-11 rounded-full border border-cyan-200 bg-white px-4 py-2 text-left text-xs font-bold text-slate-800 transition hover:border-cyan-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                </section>
              ) : null}
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">New message</span>
                <textarea
                  className={`${portalInput} min-h-28 resize-y`}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  maxLength={10_000}
                  required
                  placeholder="How can we help?"
                />
              </label>
              {body.trim() && intelligenceProvider.mode !== "unavailable" ? (
                <div className="mt-3">
                  <p className="text-xs font-bold text-slate-600">Writing help</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["clear", "concise", "polite"] as const).map((tone) => (
                      <button
                        key={tone}
                        type="button"
                        className="min-h-11 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold capitalize text-slate-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
                        disabled={assistanceBusy}
                        onClick={() => void rewriteDraft(tone)}
                      >
                        {tone}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {shouldOfferHumanHelp(body) && !requestHuman ? (
                <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-950">
                  This question may need human judgment. You can ask a person to follow up; no one has been contacted automatically.
                </div>
              ) : null}
              <div className="mt-3" aria-live="polite">
                {draftNotice ? <p className="text-xs font-semibold text-cyan-800">{draftNotice}</p> : null}
                {draftGuidance ? (
                  <div className="mt-3">
                    <PortalGeneratedGuidancePanel guidance={draftGuidance} />
                    {draftGuidance.confidence === "supported" || draftGuidance.confidence === "partially_supported" ? (
                      <button
                        type="button"
                        className="mt-3 text-sm font-bold text-cyan-800 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
                        onClick={() => {
                          setBody(draftGuidance.body);
                          setDraftNotice("Rewritten text added to your unsent draft. Review it before sending.");
                        }}
                      >
                        Use this draft
                      </button>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-start gap-2 text-sm text-slate-600">
                  <input
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-500"
                    type="checkbox"
                    checked={requestHuman}
                    onChange={(event) => setRequestHuman(event.target.checked)}
                  />
                  Ask a person to follow up
                </label>
                <button className={portalPrimaryButton} type="submit" disabled={sending || !body.trim()}>
                  <Send aria-hidden="true" size={16} /> {sending ? "Sending..." : "Send message"}
                </button>
              </div>
              <div className="mt-3" aria-live="polite">
                {sendError ? <PortalInlineError message={sendError} retry={() => void sendCurrentMessage()} /> : null}
                {sentNotice ? <p className="text-sm font-semibold text-emerald-700">{sentNotice}</p> : null}
              </div>
            </form>
          </section>

          <aside className="h-fit rounded-[2rem] bg-cyan-950 p-6 text-white">
            <UserRoundCheck aria-hidden="true" size={26} />
            <h2 className="mt-5 text-lg font-semibold">Customer-safe messaging</h2>
            <p className="mt-2 text-sm leading-6 text-cyan-100">
              This view contains only messages intentionally shared with your customer account. Avoid sending passwords or payment details.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}
