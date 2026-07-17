"use client";

import Link from "next/link";
import { CircleHelp, Sparkles, UserRoundCheck } from "lucide-react";
import type {
  PortalInsight,
  PortalSuggestion,
} from "@/app/lib/customer-portal-contextual-intelligence";
import type { PortalGeneratedGuidance } from "@/app/lib/customer-portal-contextual-provider";
import {
  portalPrimaryButton,
  portalSecondaryButton,
} from "@/components/portal/PortalUi";

export function PortalInsightPanel({
  emptyMessage = "Everything is up to date.",
  insights,
}: {
  emptyMessage?: string;
  insights: readonly PortalInsight[];
}) {
  return (
    <section
      className="rounded-[2rem] border border-cyan-200 bg-cyan-50/60 p-5 sm:p-6"
      aria-labelledby="portal-context-title"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-800 shadow-sm">
          <Sparkles aria-hidden="true" size={19} />
        </span>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-800">
            Contextual Intelligence™
          </p>
          <h2 id="portal-context-title" className="mt-1 text-xl font-semibold">
            What may need your attention
          </h2>
        </div>
      </div>

      {insights.length === 0 ? (
        <p className="mt-5 rounded-2xl bg-white p-4 text-sm font-semibold text-slate-700">
          {emptyMessage}
        </p>
      ) : (
        <div className="mt-5 grid gap-3 lg:grid-cols-3">
          {insights.map((insight) => (
            <article
              key={insight.id}
              className={`rounded-2xl border p-4 ${
                insight.primary
                  ? "border-cyan-300 bg-white shadow-sm"
                  : "border-white bg-white/80"
              }`}
            >
              {insight.primary ? (
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-cyan-800">
                  Recommended first
                </p>
              ) : null}
              <h3 className="mt-1 font-semibold text-slate-950">{insight.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">{insight.detail}</p>
              <p className="mt-3 text-xs leading-5 text-slate-600">{insight.reason}</p>
              {insight.action?.href ? (
                <Link
                  className={`${insight.primary ? portalPrimaryButton : portalSecondaryButton} mt-4 w-full`}
                  href={insight.action.href}
                >
                  {insight.action.label}
                </Link>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export function PortalGeneratedGuidancePanel({
  guidance,
}: {
  guidance: PortalGeneratedGuidance;
}) {
  return (
    <section className="rounded-2xl border border-violet-200 bg-violet-50 p-4" aria-label="Generated guidance">
      <p className="text-[11px] font-black uppercase tracking-[0.16em] text-violet-800">
        {guidance.generatedLabel}
      </p>
      <h3 className="mt-2 font-semibold text-slate-950">{guidance.title}</h3>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {guidance.body}
      </p>
      {guidance.bullets?.length ? (
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-6 text-slate-700">
          {guidance.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-4 rounded-xl bg-white p-3 text-xs leading-5 text-slate-700">
        <p className="font-bold">Source: {guidance.sourceLabel || "No approved source"}</p>
        <p className="mt-1">{guidance.sourceNotice}</p>
        <p className="mt-1 font-semibold">
          The original customer-visible document or record remains the source of truth.
        </p>
      </div>
      {guidance.escalation ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-950">
          <UserRoundCheck className="mt-0.5 shrink-0" aria-hidden="true" size={16} />
          <p>
            <strong>{guidance.escalation.label}.</strong> {guidance.escalation.reason}
            {" No person has been contacted automatically."}
          </p>
        </div>
      ) : null}
    </section>
  );
}

export function PortalContextSuggestion({
  onUse,
  suggestion,
}: {
  onUse: (suggestion: PortalSuggestion) => void;
  suggestion: PortalSuggestion;
}) {
  return (
    <article className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
      <div className="flex items-start gap-3">
        <CircleHelp className="mt-0.5 shrink-0 text-cyan-800" aria-hidden="true" size={18} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">{suggestion.value}</p>
          <p className="mt-1 text-xs leading-5 text-slate-600">{suggestion.reason}</p>
          <button
            type="button"
            className={`${portalSecondaryButton} mt-3`}
            onClick={() => onUse(suggestion)}
          >
            {suggestion.label}
          </button>
        </div>
      </div>
    </article>
  );
}
