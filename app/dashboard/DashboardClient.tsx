"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Brain, CircleDollarSign, Gauge, LayoutDashboard, Search, Settings, Sparkles, UserRound, UsersRound, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Business, BusinessBrainRecommendation, BusinessBrainScore, Lead, LeadStatus, OnboardingStatus, OrchestrationLog, AuditReport } from "@/app/lib/supabase";
import type { IndustryTemplate } from "@/app/lib/business-brain";
import type { ChiefOfStaffBriefing } from "@/app/lib/chief-of-staff";
import type { SubscriptionModel } from "@/app/lib/billing";
import type { CustomerSuccessDashboard } from "@/app/lib/customer-lifecycle";
import type { MorningBrief } from "@/app/lib/morning-brief";
import AIEmployeeOverview from "@/components/dashboard/AIEmployeeOverview";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type SetupStatus = "complete" | "warning" | "missing";
type GettingStartedExperience = {
  welcomeMessage: string; progress: number; estimatedSetupTime: string; aiReadiness: number;
  businessBrainProgress: number; knowledgeProgress: number; calendlyStatus: SetupStatus;
  emailStatus: SetupStatus; websiteStatus: SetupStatus;
  setupItems: readonly { label: string; status: SetupStatus; detail: string }[];
  dailyReport: { documentsLearned: number; leadsCaptured: number; appointmentsBooked: number; emailsSent: number; recommendations: number; missingInformation: number };
  tasks: { title: string; detail: string; priority: string; category: string }[];
  timeline: { time: string; title: string; detail: string; status: "complete" | "pending" }[];
};
type DashboardClientProps = {
  leads: Lead[]; businesses: Business[]; orchestrationLogs?: OrchestrationLog[];
  onboardingStatus?: OnboardingStatus; businessBrainScore?: BusinessBrainScore;
  businessBrainRecommendations?: BusinessBrainRecommendation[]; businessBrainIndustry?: string;
  businessBrainVocabulary?: string[]; businessBrainTemplate?: IndustryTemplate;
  autonomousAudit?: AuditReport; auditHistory?: AuditReport[]; morningBrief?: MorningBrief;
  chiefOfStaffBriefing?: ChiefOfStaffBriefing; subscription?: SubscriptionModel;
  customerSuccess?: CustomerSuccessDashboard; gettingStarted?: GettingStartedExperience; loadError?: boolean;
};

const navigation: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: LayoutDashboard, label: "Command Center", href: "#command-center" },
  { icon: UsersRound, label: "CRM", href: "#crm-summary" },
  { icon: Brain, label: "AI Brain", href: "#ai-brain" },
  { icon: Zap, label: "Automations", href: "/dashboard/settings" },
  { icon: Gauge, label: "Analytics", href: "#business-pulse" },
  { icon: UserRound, label: "Customer Success", href: "#crm-summary" },
  { icon: CircleDollarSign, label: "Billing", href: "/pricing/professional" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];
const emptyBrain: BusinessBrainScore = { businessInformationCompleteness: 0, knowledgeCompleteness: 0, servicesDocumented: 0, policiesDocumented: 0, faqDocumented: 0, websiteImported: 0, aiReadiness: 0, overallScore: 0 };

function statusOf(lead: Lead): LeadStatus { return (["New","Contacted","Qualified","Booked","Closed"] as const).includes(lead.status as LeadStatus) ? lead.status as LeadStatus : "New"; }
function formatDateTime(date?: string) { if (!date) return "—"; return new Intl.DateTimeFormat("en", { month:"short", day:"numeric", hour:"numeric", minute:"2-digit" }).format(new Date(date)); }
function isToday(date?: string) { return Boolean(date) && new Date(date as string).toDateString() === new Date().toDateString(); }
export default function DashboardClient({ leads, businesses, orchestrationLogs = [], onboardingStatus = "not_started", businessBrainScore, businessBrainRecommendations = [], morningBrief, chiefOfStaffBriefing, gettingStarted, loadError }: DashboardClientProps) {
  const [search, setSearch] = useState("");
  const brain = businessBrainScore ?? emptyBrain;
  const counts = useMemo(() => ({
    New: leads.filter((lead)=>statusOf(lead)==="New").length,
    Qualified: leads.filter((lead)=>statusOf(lead)==="Qualified").length,
    Booked: leads.filter((lead)=>statusOf(lead)==="Booked").length,
  }), [leads]);
  const todayLogs = orchestrationLogs.filter((log)=>isToday(log.created_at));
  const currentLog = orchestrationLogs[0];
  const qualifiedLead = leads.find((lead)=>statusOf(lead)==="Qualified");
  const upcoming = leads.filter((lead)=>lead.next_meeting_at && new Date(lead.next_meeting_at) >= new Date() && lead.meeting_status !== "Canceled").sort((a,b)=>String(a.next_meeting_at).localeCompare(String(b.next_meeting_at)));
  const emailFailures = leads.filter((lead)=>Boolean(lead.email_error));
  const criticalCards = chiefOfStaffBriefing?.executiveCards.filter((card)=>card.priority==="High" || card.type==="Risk") ?? [];
  const attention = [
    ...emailFailures.slice(0,2).map((lead)=>({ title:"Email delivery failed", detail:`${lead.first_name || lead.business_name || lead.email} did not receive a message.`, action:"Review CRM", href:"#crm-summary" })),
    ...(onboardingStatus !== "completed" ? [{ title:"Business setup is incomplete", detail:"Missing business-critical information is limiting JOHAI's confidence.", action:"Complete onboarding", href:"/dashboard/onboarding" }] : []),
    ...criticalCards.slice(0,2).map((card)=>({ title:card.title, detail:card.explanation, action:"Review risk", href:"#ai-brain" })),
  ].slice(0,3);
  const task = currentLog ? { title:currentLog.detected_intent || "Processing the latest business signal", stage:currentLog.result === "completed" ? "Completed" : "In progress", progress:currentLog.result === "completed" ? 100 : 65, nextAction:currentLog.result === "completed" ? "Monitor for the next business signal" : "Record the outcome when processing completes" } : { title:"No active task", stage:"Ready", progress:0, nextAction:"Respond when a new customer or business event arrives" };
  const activity = orchestrationLogs.slice(0,6).map((log)=>({ time:formatDateTime(log.created_at), title:log.detected_intent || "Business activity reviewed", detail:`${log.required_actions?.length ?? 0} action${log.required_actions?.length === 1 ? "" : "s"} recorded.`, status:log.result === "completed" ? "complete" as const : "working" as const }));
  const greeting = morningBrief?.greeting ?? "Welcome back";
  const briefLines = [
    { label:"What happened", text:morningBrief?.happenedSinceLastVisit[0]?.detail ?? (todayLogs.length ? `${todayLogs.length} AI actions were recorded today.` : "No new activity has been recorded yet.") },
    { label:"What matters", text:morningBrief?.priorityInbox[0]?.why ?? "JOHAI is monitoring leads, customer responses, and bookings." },
    { label:"At risk", text:criticalCards[0]?.explanation ?? (emailFailures.length ? `${emailFailures.length} email delivery issue${emailFailures.length===1?"":"s"} require review.` : "No material risk is currently detected.") },
    { label:"Opportunity", text:morningBrief?.opportunities[0]?.detail ?? (counts.Qualified ? `${counts.Qualified} qualified lead${counts.Qualified===1?" is":"s are"} available to advance.` : "No qualified opportunity is recorded yet.") },
    { label:"JOHAI next", text:morningBrief?.aiFocusToday ?? task.nextAction },
  ];
  const completed = [
    { label:"Leads handled", value:gettingStarted?.dailyReport.leadsCaptured ?? leads.filter((lead)=>isToday(lead.created_at)).length },
    { label:"Questions answered", value:todayLogs.length },
    { label:"Follow-ups completed", value:todayLogs.filter((log)=>log.required_actions?.includes("SendEmail")).length },
    { label:"Meetings booked", value:gettingStarted?.dailyReport.appointmentsBooked ?? leads.filter((lead)=>lead.booked_meeting && isToday(lead.next_meeting_at ?? lead.booking_date)).length },
  ];
  const brainAreas = [
    { label:"Services", learned:brain.servicesDocumented>0 }, { label:"Pricing", learned:gettingStarted?.setupItems.find((item)=>item.label==="Services")?.status==="complete" },
    { label:"Hours", learned:brain.businessInformationCompleteness>=60 }, { label:"FAQs", learned:brain.faqDocumented>0 },
    { label:"Policies", learned:brain.policiesDocumented>0 }, { label:"Procedures", learned:brain.policiesDocumented>=70 },
    { label:"Team", learned:businesses.length>0 }, { label:"Calendar", learned:gettingStarted?.calendlyStatus==="complete" }, { label:"CRM", learned:leads.length>0 },
  ];
  const opportunityEstimate = counts.Qualified*1800 + counts.Booked*3200;
  const latest = orchestrationLogs[0]?.created_at ?? leads[0]?.created_at;
  const businessStatus = loadError ? "Attention required" : criticalCards.length || emailFailures.length ? "Attention required" : onboardingStatus !== "completed" ? "Setup limiting performance" : counts.Booked || counts.Qualified ? "Growth opportunity detected" : "Operating normally";

  return <main className="min-h-screen bg-[#070b12] text-white">
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-white/[0.07] bg-[#090e16] p-5 xl:block">
        <Link href="/" className="flex items-center gap-3 rounded-xl px-2 py-3 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-300 text-slate-950"><Sparkles size={19} /></span><div><p className="font-semibold">JOHAI</p><p className="text-xs text-slate-500">Executive OS</p></div></Link>
        <nav aria-label="Dashboard workspaces" className="mt-8 space-y-1">{navigation.map((item,index)=><Link key={`navigation-${item.label}-${index}`} href={item.href} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-cyan-300 ${index===0?"bg-cyan-300/10 text-cyan-100":"text-slate-400 hover:bg-white/[0.05] hover:text-white"}`}><item.icon size={17} />{item.label}</Link>)}</nav>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#070b12]/95 backdrop-blur-xl">
          <div className="flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8"><div><p className="text-xs text-cyan-300">JOHAI Chief of Staff</p><p className="mt-1 text-lg font-semibold">Executive command center</p></div><div className="flex items-center gap-3"><label className="relative min-w-0 flex-1 lg:w-80"><span className="sr-only">Search dashboard</span><Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16}/><input value={search} onChange={(event)=>setSearch(event.target.value)} placeholder="Search leads and workspaces" className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-cyan-300/40 focus:ring-2 focus:ring-cyan-300/10" /></label><LanguageSwitcher compact /></div></div>
          <nav aria-label="Mobile dashboard navigation" className="flex gap-1 overflow-x-auto border-t border-white/[0.07] px-4 py-2 xl:hidden">{navigation.slice(0,5).map((item,index)=><Link key={`mobile-navigation-${item.label}-${index}`} href={item.href} className="shrink-0 rounded-lg px-3 py-2 text-xs text-slate-400 outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">{item.label}</Link>)}</nav>
        </header>
        <div className="mx-auto max-w-[1500px] px-4 py-6 lg:px-8 lg:py-8">
          {search.trim() && <p role="status" className="mb-4 rounded-xl bg-white/[0.04] px-4 py-3 text-sm text-slate-400">Search is ready for focused workspaces. Open CRM or Business Brain from the navigation to review “{search.trim()}”.</p>}
          <AIEmployeeOverview status={chiefOfStaffBriefing?.status ?? "Monitoring"} businessName={businesses[0]?.name ?? "your business"} businessStatus={businessStatus} updatedAt={formatDateTime(latest)} completed={completed} task={task} attention={attention} opportunityValue={opportunityEstimate?`$${opportunityEstimate.toLocaleString("en-US")}`:"—"} activities={activity} impact={[]} brain={{ completeness:brain.overallScore, confidence:brain.aiReadiness, areas:brainAreas, recommendation:businessBrainRecommendations[0]?.detail ?? gettingStarted?.tasks[0]?.title ?? "Upload the next missing business document." }} brief={{ greeting, lines:briefLines }} crm={{ counts:{new:counts.New,qualified:counts.Qualified,booked:counts.Booked}, interpretation:leads.length?`${leads.length} leads are active. ${counts.Qualified} are qualified and ${counts.Booked} have moved to booking.`:"No leads yet. JOHAI is ready to capture and qualify the first opportunity.", priorityLead:qualifiedLead?.first_name ?? qualifiedLead?.business_name ?? "—", nextMeeting:upcoming[0]?`${upcoming[0].first_name || upcoming[0].business_name} · ${formatDateTime(upcoming[0].next_meeting_at)}`:"—" }} outlook={[...(upcoming[0]?[{id:`meeting-${upcoming[0].id}`,trust:"Expected" as const,text:`The next recorded meeting is ${formatDateTime(upcoming[0].next_meeting_at)}.`}]:[]),...(qualifiedLead?[{id:`lead-${qualifiedLead.id}`,trust:"Recommended" as const,text:`Review ${qualifiedLead.first_name || qualifiedLead.business_name || "the highest-priority qualified lead"} next.`}]:[]),...(opportunityEstimate?[{id:"opportunity-estimate",trust:"Estimated" as const,text:`Qualified and booked leads represent an estimated $${opportunityEstimate.toLocaleString("en-US")} opportunity—not recognized revenue.`}]:[])]} />
        </div>
      </div>
    </div>
  </main>;
}
