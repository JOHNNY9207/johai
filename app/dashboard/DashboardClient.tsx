"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Bell,
  Bot,
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  FlaskConical,
  KanbanSquare,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  MoreHorizontal,
  Database,
  Brain,
  Search,
  Settings,
  ShieldAlert,
  Sparkles,
  StickyNote,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";
import {
  followUpStatuses,
  leadStatuses,
  type Business,
  type AuditReport,
  type AuditResult,
  type BusinessBrainRecommendation,
  type BusinessBrainScore,
  type Lead,
  type LeadStatus,
  type OnboardingStatus,
  type OrchestrationAction,
  type OrchestrationLog,
} from "@/app/lib/supabase";
import type { IndustryTemplate } from "@/app/lib/business-brain";
import type {
  ChiefOfStaffBriefing,
  ExecutiveCardType,
  ExecutivePriority,
} from "@/app/lib/chief-of-staff";
import type { MorningBrief, MorningBriefPriority } from "@/app/lib/morning-brief";
import CalendlyBookingButton from "@/components/CalendlyBookingButton";
import type { LucideIcon } from "lucide-react";

type DashboardClientProps = {
  leads: Lead[];
  businesses: Business[];
  orchestrationLogs?: OrchestrationLog[];
  onboardingStatus?: OnboardingStatus;
  businessBrainScore?: BusinessBrainScore;
  businessBrainRecommendations?: BusinessBrainRecommendation[];
  businessBrainIndustry?: string;
  businessBrainVocabulary?: string[];
  businessBrainTemplate?: IndustryTemplate;
  autonomousAudit?: AuditReport;
  auditHistory?: AuditReport[];
  morningBrief?: MorningBrief;
  chiefOfStaffBriefing?: ChiefOfStaffBriefing;
  gettingStarted?: GettingStartedExperience;
  loadError?: boolean;
};

type ConversationMessage = {
  role?: string;
  content?: string;
};

type SetupStatus = "complete" | "warning" | "missing";

type GettingStartedItem = {
  label: string;
  status: SetupStatus;
  detail: string;
};

type DailyAiReport = {
  documentsLearned: number;
  leadsCaptured: number;
  appointmentsBooked: number;
  emailsSent: number;
  recommendations: number;
  missingInformation: number;
};

type AiTask = {
  title: string;
  detail: string;
  priority: string;
  category: string;
};

type TimelineEvent = {
  time: string;
  title: string;
  detail: string;
  status: "complete" | "pending";
};

type GettingStartedExperience = {
  welcomeMessage: string;
  progress: number;
  estimatedSetupTime: string;
  aiReadiness: number;
  businessBrainProgress: number;
  knowledgeProgress: number;
  calendlyStatus: SetupStatus;
  emailStatus: SetupStatus;
  websiteStatus: SetupStatus;
  setupItems: readonly GettingStartedItem[];
  dailyReport: DailyAiReport;
  tasks: AiTask[];
  timeline: TimelineEvent[];
};

const statusStyles: Record<LeadStatus, string> = {
  New: "border-sky-300/30 bg-sky-300/10 text-sky-100",
  Contacted: "border-violet-300/30 bg-violet-300/10 text-violet-100",
  Qualified: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
  Booked: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  Closed: "border-slate-300/30 bg-slate-300/10 text-slate-200",
};

const statusBars: Record<LeadStatus, string> = {
  New: "bg-sky-300",
  Contacted: "bg-violet-300",
  Qualified: "bg-emerald-300",
  Booked: "bg-amber-300",
  Closed: "bg-slate-300",
};

function normalizeStatus(status?: string): LeadStatus {
  return leadStatuses.includes(status as LeadStatus)
    ? (status as LeadStatus)
    : "New";
}

function formatDate(date?: string) {
  if (!date) {
    return "No date";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date?: string) {
  if (!date) {
    return "No meeting";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

function getConversation(conversation: unknown): ConversationMessage[] {
  return Array.isArray(conversation)
    ? conversation.filter(
        (message): message is ConversationMessage =>
          typeof message === "object" && message !== null
      )
    : [];
}

function emailStatusLabel(sent?: boolean) {
  return sent ? "Sent" : "Not sent";
}

function emailStatusClass(sent?: boolean) {
  return sent
    ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100"
    : "border-white/10 bg-white/[0.06] text-slate-400";
}

function setupStatusClass(status: SetupStatus) {
  if (status === "complete") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "warning") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-rose-300/30 bg-rose-300/10 text-rose-100";
}

function setupStatusLabel(status: SetupStatus) {
  if (status === "complete") {
    return "Ready";
  }

  if (status === "warning") {
    return "Needs review";
  }

  return "Missing";
}

function priorityClass(priority: MorningBriefPriority | ExecutivePriority) {
  if (priority === "High") {
    return "border-rose-300/30 bg-rose-300/10 text-rose-100";
  }

  if (priority === "Medium") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  return "border-cyan-300/30 bg-cyan-300/10 text-cyan-100";
}

function executiveCardClass(type: ExecutiveCardType) {
  if (type === "High Priority" || type === "Risk") {
    return "border-rose-300/25 bg-rose-300/10";
  }

  if (type === "Opportunity" || type === "Success") {
    return "border-emerald-300/25 bg-emerald-300/10";
  }

  if (type === "Recommendation") {
    return "border-amber-300/25 bg-amber-300/10";
  }

  return "border-cyan-300/25 bg-cyan-300/10";
}

function Card({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={`border border-white/10 bg-white/[0.055] backdrop-blur-xl ${className}`}
    >
      {children}
    </div>
  );
}

const sidebarItems: Array<{
  icon: LucideIcon;
  label: string;
  meta: string;
  href: string;
}> = [
  { icon: LayoutDashboard, label: "Overview", meta: "Active", href: "#crm" },
  { icon: UsersRound, label: "CRM", meta: "Leads", href: "#crm" },
  { icon: KanbanSquare, label: "Pipeline", meta: "Booked", href: "#crm" },
  { icon: Sparkles, label: "Onboarding", meta: "Setup", href: "/dashboard/onboarding" },
  { icon: Database, label: "Knowledge", meta: "AI data", href: "/dashboard/knowledge" },
  { icon: Bot, label: "AI Insights", meta: "Live", href: "#crm" },
  { icon: Mail, label: "Email Activity", meta: "Health", href: "#crm" },
  { icon: Building2, label: "Businesses", meta: "Accounts", href: "#businesses" },
];

const metricCards: Array<{
  icon: LucideIcon;
  label: string;
  key: "total" | "booked" | "week" | "email";
  meta: string;
}> = [
  { icon: UsersRound, label: "Total leads", key: "total", meta: "All captured clients" },
  { icon: CalendarDays, label: "Booked meetings", key: "booked", meta: "Booking conversion" },
  { icon: Clock3, label: "This week", key: "week", meta: "Upcoming meetings" },
  { icon: Mail, label: "Email issues", key: "email", meta: "Needs attention" },
];

export default function DashboardClient({
  leads,
  businesses,
  orchestrationLogs = [],
  onboardingStatus = "not_started",
  businessBrainScore,
  businessBrainRecommendations = [],
  businessBrainIndustry = "General Business",
  businessBrainVocabulary = [],
  businessBrainTemplate,
  autonomousAudit,
  auditHistory = [],
  morningBrief,
  chiefOfStaffBriefing,
  gettingStarted,
  loadError,
}: DashboardClientProps) {
  const [leadList, setLeadList] = useState(leads);
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("All");
  const [testLeadFilter, setTestLeadFilter] = useState<"hide" | "show" | "only">("hide");
  const [notesDraft, setNotesDraft] = useState(leads[0]?.notes ?? "");
  const [saveMessage, setSaveMessage] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [isPending, startTransition] = useTransition();

  const selectedLead =
    leadList.find((lead) => lead.id === selectedLeadId) ?? leadList[0];

  const businessTypes = useMemo(() => {
    const types = leadList
      .map((lead) => lead.business_type)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    return ["All", ...Array.from(new Set(types))];
  }, [leadList]);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();

    return leadList.filter((lead) => {
      const status = normalizeStatus(lead.status);
      const matchesSearch =
        !query ||
        [
          lead.first_name,
          lead.business_name,
          lead.email,
          lead.business_type,
          lead.biggest_problem,
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);
      const matchesStatus = statusFilter === "All" || status === statusFilter;
      const matchesBusinessType =
        businessTypeFilter === "All" || lead.business_type === businessTypeFilter;
      const matchesTestFilter =
        testLeadFilter === "show" ||
        (testLeadFilter === "hide" && !lead.is_test) ||
        (testLeadFilter === "only" && lead.is_test);

      return matchesSearch && matchesStatus && matchesBusinessType && matchesTestFilter;
    });
  }, [businessTypeFilter, leadList, search, statusFilter, testLeadFilter]);

  const statusCounts = useMemo(() => {
    return leadStatuses.reduce<Record<LeadStatus, number>>((counts, status) => {
      counts[status] = leadList.filter(
        (lead) => normalizeStatus(lead.status) === status
      ).length;

      return counts;
    }, {} as Record<LeadStatus, number>);
  }, [leadList]);

  const testLeadCount = leadList.filter((lead) => lead.is_test).length;
  const bookedLeads = leadList.filter((lead) => normalizeStatus(lead.status) === "Booked");
  const bookingConversionRate =
    leadList.length > 0 ? Math.round((bookedLeads.length / leadList.length) * 100) : 0;
  const now = new Date();
  const weekFromNow = new Date(now);
  weekFromNow.setDate(now.getDate() + 7);
  const upcomingMeetings = leadList
    .filter((lead) => {
      if (!lead.next_meeting_at || lead.meeting_status === "Canceled") {
        return false;
      }

      const meetingDate = new Date(lead.next_meeting_at);
      return meetingDate >= now && meetingDate <= weekFromNow;
    })
    .sort((a, b) => String(a.next_meeting_at).localeCompare(String(b.next_meeting_at)));
  const upcomingThisWeek = upcomingMeetings.length;
  const followUpCounts = followUpStatuses.reduce<Record<string, number>>(
    (counts, status) => {
      counts[status] = leadList.filter(
        (lead) => (lead.follow_up_status ?? "Waiting") === status
      ).length;

      return counts;
    },
    {}
  );
  const conversation = getConversation(selectedLead?.conversation);
  const recentConversations = leadList
    .filter((lead) => getConversation(lead.conversation).length > 0)
    .slice(0, 4);
  const emailErrors = leadList.filter((lead) => lead.email_error).length;
  const maxStatusCount = Math.max(...leadStatuses.map((status) => statusCounts[status]), 1);
  const onboardingComplete = onboardingStatus === "completed";
  const todayKey = new Date().toDateString();
  const orchestrationsToday = orchestrationLogs.filter(
    (log) => new Date(log.created_at ?? "").toDateString() === todayKey
  );
  const countAction = (action: OrchestrationAction) =>
    orchestrationsToday.filter((log) => log.required_actions?.includes(action)).length;
  const successfulOrchestrations = orchestrationsToday.filter(
    (log) => log.result === "completed"
  ).length;
  const successRate =
    orchestrationsToday.length > 0
      ? Math.round((successfulOrchestrations / orchestrationsToday.length) * 100)
      : 100;
  const averageResponseTime =
    orchestrationsToday.length > 0
      ? Math.round(
          orchestrationsToday.reduce(
            (sum, log) => sum + (log.execution_time_ms ?? 0),
            0
          ) / orchestrationsToday.length
        )
      : 0;
  const currentOrchestration = orchestrationLogs[0];
  const brainScore = businessBrainScore ?? {
    businessInformationCompleteness: 0,
    knowledgeCompleteness: 0,
    servicesDocumented: 0,
    policiesDocumented: 0,
    faqDocumented: 0,
    websiteImported: 0,
    aiReadiness: 0,
    overallScore: 0,
  };
  const auditScores = autonomousAudit?.scores;
  const moduleResults = autonomousAudit?.module_results ?? [];
  const criticalIssues = moduleResults.flatMap((moduleResult) =>
    moduleResult.priority === "critical" ? moduleResult.issues : []
  );
  const topAuditPriorities =
    autonomousAudit?.recommendations?.slice(0, 5) ?? [];
  const progressHistory = [
    ...auditHistory
      .slice(0, 5)
      .map((audit) => audit.scores?.overallBusinessScore ?? 0)
      .reverse(),
    auditScores?.overallBusinessScore ?? 0,
  ].filter((score) => score > 0);

  function selectLead(lead: Lead) {
    setSelectedLeadId(lead.id);
    setNotesDraft(lead.notes ?? "");
    setSaveMessage("");
  }

  function updateLead(
    leadId: string,
    updates: Partial<Pick<Lead, "status" | "notes" | "is_test">>
  ) {
    setSaveMessage("");

    startTransition(async () => {
      const previousLeads = leadList;

      setLeadList((current) =>
        current.map((lead) => (lead.id === leadId ? { ...lead, ...updates } : lead))
      );

      try {
        const res = await fetch(`/api/leads/${leadId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });

        if (!res.ok) {
          throw new Error("Lead update failed");
        }

        const data = (await res.json()) as { lead?: Lead };

        if (data.lead) {
          setLeadList((current) =>
            current.map((lead) => (lead.id === leadId ? data.lead! : lead))
          );
          setNotesDraft(data.lead.notes ?? "");
        }

        setSaveMessage("Saved");
      } catch (error) {
        console.error(error);
        setLeadList(previousLeads);
        setSaveMessage("Could not save changes");
      }
    });
  }

  function deleteLead(lead: Lead) {
    const confirmed = window.confirm(
      `Delete ${lead.first_name || "this lead"} from the CRM? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setSaveMessage("");

    startTransition(async () => {
      const previousLeads = leadList;

      setLeadList((current) => current.filter((item) => item.id !== lead.id));

      if (selectedLeadId === lead.id) {
        const nextLead = previousLeads.find((item) => item.id !== lead.id);
        setSelectedLeadId(nextLead?.id ?? "");
        setNotesDraft(nextLead?.notes ?? "");
      }

      try {
        const res = await fetch(`/api/leads/${lead.id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Lead delete failed");
        }

        setSaveMessage("Lead deleted");
      } catch (error) {
        console.error(error);
        setLeadList(previousLeads);
        setSelectedLeadId(lead.id);
        setNotesDraft(lead.notes ?? "");
        setSaveMessage("Could not delete lead");
      }
    });
  }

  function cleanupTestLeads() {
    const confirmed = window.confirm(
      `Delete ${testLeadCount} test lead${testLeadCount === 1 ? "" : "s"}? Real leads will not be deleted.`
    );

    if (!confirmed) {
      return;
    }

    setSaveMessage("");

    startTransition(async () => {
      const previousLeads = leadList;
      const nextLeads = previousLeads.filter((lead) => !lead.is_test);

      setLeadList(nextLeads);

      if (selectedLead?.is_test) {
        setSelectedLeadId(nextLeads[0]?.id ?? "");
        setNotesDraft(nextLeads[0]?.notes ?? "");
      }

      try {
        const res = await fetch("/api/leads/cleanup-test", {
          method: "DELETE",
        });

        if (!res.ok) {
          throw new Error("Test cleanup failed");
        }

        const data = (await res.json()) as { deletedCount?: number };
        setSaveMessage(`Deleted ${data.deletedCount ?? 0} test leads`);
      } catch (error) {
        console.error(error);
        setLeadList(previousLeads);
        setSaveMessage("Could not clean up test leads");
      }
    });
  }

  return (
    <main className="min-h-screen bg-[#050812] text-white">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(135deg,#050812_0%,#081827_48%,#130a23_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.13),transparent_26%),radial-gradient(circle_at_90%_8%,rgba(168,85,247,0.12),transparent_30%),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:auto,auto,80px_80px,80px_80px]" />

      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl xl:block">
          <Link href="/" className="flex items-center gap-3 px-2 py-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
              <Sparkles size={21} />
            </span>
            <div>
              <p className="font-semibold tracking-tight">JOHAI</p>
              <p className="text-xs text-slate-400">Platform console</p>
            </div>
          </Link>

          <nav className="mt-8 space-y-2">
            {sidebarItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
              >
                <span className="flex items-center gap-3">
                  <item.icon size={18} />
                  {item.label}
                </span>
                <span className="text-xs text-slate-500">
                  {item.label === "CRM"
                    ? `${leadList.length} leads`
                    : item.label === "Pipeline"
                      ? `${bookedLeads.length} booked`
                      : item.label === "Email Activity"
                        ? `${emailErrors} issues`
                        : item.label === "Businesses"
                          ? `${businesses.length} accounts`
                          : item.meta}
                </span>
              </a>
            ))}
          </nav>

          <div className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-5">
            <CalendarDays className="text-cyan-200" size={24} />
            <p className="mt-4 text-sm font-semibold">Book Free AI Audit</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Use the connected Calendly link from CRM settings.
            </p>
            <CalendlyBookingButton className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050812]/80 backdrop-blur-xl">
            <div className="flex min-h-20 flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  JOHAI CRM
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                  Lead management command center
                </h1>
              </div>
              <div className="flex flex-1 flex-col gap-3 lg:max-w-2xl lg:flex-row lg:items-center">
                <label className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    size={18}
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search leads, businesses, emails, problems"
                    className="h-12 w-full rounded-2xl border border-white/10 bg-white/[0.06] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10"
                  />
                </label>
                <div className="flex items-center gap-2">
                  <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-slate-300 transition hover:bg-white/10" aria-label="Notifications">
                    <Bell size={18} />
                  </button>
                  <Link
                    href="/dashboard/settings"
                    className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-slate-300 transition hover:bg-white/10"
                    aria-label="Settings"
                  >
                    <Settings size={18} />
                  </Link>
                  <div className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-300 text-slate-950">
                      <UserRound size={16} />
                    </span>
                    <span className="hidden text-sm font-semibold text-slate-200 sm:inline">
                      Admin
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 lg:px-8">
            {!onboardingComplete && (
              <section className="mb-6 rounded-3xl border border-cyan-300/25 bg-cyan-300/10 p-5 backdrop-blur-xl">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                      <Sparkles size={22} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">
                        Onboarding required
                      </p>
                      <h2 className="mt-1 text-xl font-semibold">
                        Finish configuring the JOHAI AI workspace.
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Complete company profile, AI behavior, services,
                        communication setup, and final activation.
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/onboarding"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100"
                  >
                    Continue onboarding
                    <ChevronRight size={17} />
                  </Link>
                </div>
              </section>
            )}

            {morningBrief && (
              <Card className="mb-6 overflow-hidden rounded-3xl">
                <div className="border-b border-white/10 bg-white/[0.045] p-5 lg:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-4xl">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-950">
                          <Sparkles size={23} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                            Today&apos;s Brief
                          </p>
                          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                            {morningBrief.greeting}
                          </h1>
                        </div>
                      </div>
                      <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300">
                        Here is what happened, what matters, and what JOHAI
                        recommends for {morningBrief.businessName} today.
                      </p>
                    </div>

                    <div className="grid min-w-full gap-3 sm:grid-cols-3 xl:min-w-[520px]">
                      {[
                        ["Date", morningBrief.currentDate],
                        ["Business", morningBrief.businessName],
                        ["AI Employee", morningBrief.aiEmployeeStatus],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                        >
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {label}
                          </p>
                          <p className="mt-2 text-sm font-semibold leading-5 text-white">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr]">
                  <div className="border-white/10 p-5 lg:p-6 xl:border-r">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="font-semibold text-slate-100">
                        What happened since your last visit
                      </h2>
                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-400">
                        Last 24 hours
                      </span>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      {morningBrief.happenedSinceLastVisit.map((metric) => (
                        <div
                          key={metric.label}
                          className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                        >
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {metric.label}
                          </p>
                          <p className="mt-2 text-3xl font-semibold">
                            {metric.value}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {metric.detail}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      <div>
                        <h2 className="mb-3 font-semibold text-slate-100">
                          Priority Inbox
                        </h2>
                        <div className="space-y-3">
                          {["High", "Medium", "Low"].map((priority) => {
                            const items = morningBrief.priorityInbox.filter(
                              (item) => item.priority === priority
                            );

                            return (
                              <div
                                key={priority}
                                className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                              >
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-slate-100">
                                    {priority} Priority
                                  </p>
                                  <span
                                    className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${priorityClass(priority as MorningBriefPriority)}`}
                                  >
                                    {items.length}
                                  </span>
                                </div>
                                <div className="mt-3 space-y-3">
                                  {items.length === 0 && (
                                    <p className="text-xs leading-5 text-slate-500">
                                      Nothing urgent in this lane.
                                    </p>
                                  )}
                                  {items.map((item) => (
                                    <div key={item.title}>
                                      <p className="text-sm font-semibold text-slate-200">
                                        {item.title}
                                      </p>
                                      <p className="mt-1 text-xs leading-5 text-slate-500">
                                        {item.why}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <h2 className="mb-3 font-semibold text-slate-100">
                          AI Recommendations
                        </h2>
                        <div className="space-y-3">
                          {morningBrief.recommendations.map((recommendation) => (
                            <div
                              key={recommendation.title}
                              className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="font-semibold text-slate-100">
                                  {recommendation.title}
                                </p>
                                <span
                                  className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${priorityClass(recommendation.priority)}`}
                                >
                                  {recommendation.priority}
                                </span>
                              </div>
                              <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-500 sm:grid-cols-2">
                                <p>
                                  Impact:{" "}
                                  <span className="text-slate-300">
                                    {recommendation.estimatedImpact}
                                  </span>
                                </p>
                                <p>
                                  Time:{" "}
                                  <span className="text-slate-300">
                                    {recommendation.estimatedCompletionTime}
                                  </span>
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h2 className="mb-3 font-semibold text-slate-100">
                        Business Health
                      </h2>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {morningBrief.businessHealth.map((health) => (
                          <div
                            key={health.label}
                            className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-200">
                                {health.label}
                              </p>
                              <span className="text-sm font-semibold text-cyan-200">
                                {health.score}%
                              </span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-cyan-300"
                                style={{ width: `${health.score}%` }}
                              />
                            </div>
                            <p className="mt-3 text-xs leading-5 text-slate-500">
                              {health.detail}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 lg:p-6">
                    <div>
                      <h2 className="mb-3 font-semibold text-slate-100">
                        Today&apos;s Opportunities
                      </h2>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                        {morningBrief.opportunities.map((opportunity) => (
                          <div
                            key={opportunity.title}
                            className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-100">
                                  {opportunity.title}
                                </p>
                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                  {opportunity.detail}
                                </p>
                              </div>
                              <span className="text-2xl font-semibold text-white">
                                {opportunity.value}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200">
                        AI Focus Today
                      </p>
                      <p className="mt-3 text-sm leading-6 text-slate-100">
                        {morningBrief.aiFocusToday}
                      </p>
                    </div>

                    <div className="mt-6">
                      <h2 className="mb-3 font-semibold text-slate-100">
                        Success Timeline
                      </h2>
                      <div className="space-y-4">
                        {morningBrief.successTimeline.length === 0 && (
                          <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-slate-400">
                            No completed activity yet today. JOHAI is ready to
                            capture the next signal.
                          </p>
                        )}
                        {morningBrief.successTimeline.map((event) => (
                          <div key={`${event.time}-${event.title}-${event.detail}`} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <span className="mt-1 h-3 w-3 rounded-full bg-cyan-300" />
                              <span className="mt-2 h-full w-px bg-white/10" />
                            </div>
                            <div className="pb-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {event.time}
                              </p>
                              <p className="mt-1 font-semibold text-slate-100">
                                {event.title}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {event.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h2 className="mb-3 font-semibold text-slate-100">
                        Quick Actions
                      </h2>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {[
                          ["Open CRM", "#crm"],
                          ["Open Knowledge", "/dashboard/knowledge"],
                          ["Run Audit", "#ai-audit"],
                          ["View Calendar", "#meetings"],
                          ["Configure Business Brain", "/dashboard/onboarding"],
                        ].map(([label, href]) => (
                          <Link
                            key={label}
                            href={href}
                            className="inline-flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/30 hover:bg-cyan-300/10 hover:text-cyan-100"
                          >
                            {label}
                            <ChevronRight size={16} />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {chiefOfStaffBriefing && (
              <Card className="mb-6 overflow-hidden rounded-3xl">
                <div className="border-b border-white/10 bg-white/[0.045] p-5 lg:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-4xl">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-300 text-slate-950">
                          <Brain size={23} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
                            AI Chief of Staff
                          </p>
                          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                            Executive briefing center
                          </h1>
                        </div>
                      </div>
                      <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-300">
                        {chiefOfStaffBriefing.executiveSummary}
                      </p>
                    </div>

                    <div className="grid min-w-full gap-3 sm:grid-cols-2 xl:min-w-[430px]">
                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Current status
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {chiefOfStaffBriefing.status}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          Delivery ready
                        </p>
                        <p className="mt-2 text-lg font-semibold text-white">
                          {chiefOfStaffBriefing.notificationPlan.length} channel
                          {chiefOfStaffBriefing.notificationPlan.length === 1 ? "" : "s"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-0 xl:grid-cols-[1.1fr_0.9fr]">
                  <div className="border-white/10 p-5 lg:p-6 xl:border-r">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="font-semibold text-slate-100">
                        Executive Cards
                      </h2>
                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-400">
                        {chiefOfStaffBriefing.executiveCards.length} insights
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      {chiefOfStaffBriefing.executiveCards.map((card) => (
                        <div
                          key={card.id}
                          className={`rounded-2xl border p-4 ${executiveCardClass(card.type)}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                {card.type}
                              </p>
                              <h3 className="mt-2 font-semibold text-slate-100">
                                {card.title}
                              </h3>
                            </div>
                            <span
                              className={`shrink-0 rounded-full border px-2 py-1 text-[11px] font-semibold ${priorityClass(card.priority)}`}
                            >
                              {card.priority}
                            </span>
                          </div>
                          <p className="mt-3 text-sm leading-6 text-slate-300">
                            {card.explanation}
                          </p>
                          <div className="mt-4 grid gap-3 text-xs leading-5 text-slate-500 sm:grid-cols-2">
                            <p>
                              Impact:{" "}
                              <span className="text-slate-300">
                                {card.businessImpact}
                              </span>
                            </p>
                            <p>
                              Value:{" "}
                              <span className="text-slate-300">
                                {card.estimatedValue}
                              </span>
                            </p>
                            <p>
                              Deadline:{" "}
                              <span className="text-slate-300">
                                {card.deadline}
                              </span>
                            </p>
                            <p>
                              Action:{" "}
                              <span className="text-slate-300">
                                {card.suggestedAction}
                              </span>
                            </p>
                          </div>
                        </div>
                      ))}

                      {chiefOfStaffBriefing.executiveCards.length === 0 && (
                        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                          No executive risks detected. JOHAI is monitoring the business.
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <h2 className="mb-3 font-semibold text-slate-100">
                        Business Pulse
                      </h2>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {[
                          ["Overall Business Health", chiefOfStaffBriefing.businessPulse.overallBusinessHealth],
                          ["Sales Momentum", chiefOfStaffBriefing.businessPulse.salesMomentum],
                          ["Automation Health", chiefOfStaffBriefing.businessPulse.automationHealth],
                          ["Customer Satisfaction", chiefOfStaffBriefing.businessPulse.customerSatisfaction],
                          ["AI Confidence", chiefOfStaffBriefing.businessPulse.aiConfidence],
                          ["Knowledge Growth", chiefOfStaffBriefing.businessPulse.knowledgeGrowth],
                        ].map(([label, score]) => (
                          <div
                            key={label}
                            className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-semibold text-slate-200">
                                {label}
                              </p>
                              <span className="text-sm font-semibold text-emerald-200">
                                {score}%
                              </span>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                              <div
                                className="h-full rounded-full bg-emerald-300"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-5 lg:p-6">
                    <div>
                      <h2 className="mb-3 font-semibold text-slate-100">
                        Executive Timeline
                      </h2>
                      <div className="space-y-4">
                        {chiefOfStaffBriefing.executiveTimeline.map((event) => (
                          <div
                            key={`${event.time}-${event.whatJohaiDid}`}
                            className="flex gap-3"
                          >
                            <div className="flex flex-col items-center">
                              <span className="mt-1 h-3 w-3 rounded-full bg-emerald-300" />
                              <span className="mt-2 h-full w-px bg-white/10" />
                            </div>
                            <div className="pb-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {event.time}
                              </p>
                              <p className="mt-1 font-semibold text-slate-100">
                                {event.whatJohaiDid}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                Why: {event.whyItDidIt}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                Next: {event.whatShouldHappenNext}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6">
                      <h2 className="mb-3 font-semibold text-slate-100">
                        Notification Planner
                      </h2>
                      <div className="space-y-3">
                        {chiefOfStaffBriefing.notificationPlan.map((plan) => (
                          <div
                            key={`${plan.channel}-${plan.reason}`}
                            className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <p className="font-semibold text-slate-100">
                                {plan.channel}
                              </p>
                              <span
                                className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${priorityClass(plan.urgency)}`}
                              >
                                {plan.urgency}
                              </span>
                            </div>
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {plan.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {gettingStarted && (
              <Card className="mb-6 overflow-hidden rounded-3xl">
                <div className="border-b border-white/10 bg-white/[0.045] p-5 lg:p-6">
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div className="max-w-4xl">
                      <div className="flex items-center gap-3">
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                          <Bot size={23} />
                        </span>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                            AI Welcome Center
                          </p>
                          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
                            First 24 hours command center
                          </h1>
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-300">
                        {gettingStarted.welcomeMessage}
                      </p>
                    </div>

                    <div className="grid min-w-full gap-3 sm:grid-cols-2 xl:min-w-[430px]">
                      {[
                        ["AI readiness", `${gettingStarted.aiReadiness}%`],
                        ["Setup time", gettingStarted.estimatedSetupTime],
                        ["Business Brain", `${gettingStarted.businessBrainProgress}%`],
                        ["Knowledge", `${gettingStarted.knowledgeProgress}%`],
                      ].map(([label, value]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                        >
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {label}
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-white">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="font-semibold text-slate-200">
                        AI Setup Progress
                      </span>
                      <span className="text-cyan-200">
                        {gettingStarted.progress}%
                      </span>
                    </div>
                    <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-cyan-300 transition-all"
                        style={{ width: `${gettingStarted.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-0 xl:grid-cols-[1.25fr_0.85fr]">
                  <div className="border-white/10 p-5 lg:p-6 xl:border-r">
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {gettingStarted.setupItems.map((item) => {
                        const Icon =
                          item.status === "complete"
                            ? CheckCircle2
                            : item.status === "warning"
                              ? ShieldAlert
                              : Clock3;

                        return (
                          <div
                            key={item.label}
                            className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-slate-100">
                                  {item.label}
                                </p>
                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                  {item.detail}
                                </p>
                              </div>
                              <span
                                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${setupStatusClass(item.status)}`}
                              >
                                <Icon size={13} />
                                {setupStatusLabel(item.status)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 grid gap-4 lg:grid-cols-2">
                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h2 className="font-semibold text-slate-100">
                            Daily AI Report
                          </h2>
                          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs text-slate-400">
                            Today
                          </span>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {[
                            ["Documents learned", gettingStarted.dailyReport.documentsLearned],
                            ["Leads captured", gettingStarted.dailyReport.leadsCaptured],
                            ["Appointments booked", gettingStarted.dailyReport.appointmentsBooked],
                            ["Emails sent", gettingStarted.dailyReport.emailsSent],
                            ["Recommendations", gettingStarted.dailyReport.recommendations],
                            ["Missing information", gettingStarted.dailyReport.missingInformation],
                          ].map(([label, value]) => (
                            <div
                              key={label}
                              className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                            >
                              <p className="text-xs uppercase tracking-wide text-slate-500">
                                {label}
                              </p>
                              <p className="mt-2 text-2xl font-semibold">
                                {value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="mb-3 flex items-center justify-between">
                          <h2 className="font-semibold text-slate-100">
                            AI Tasks
                          </h2>
                          <Link
                            href="/dashboard/knowledge"
                            className="text-xs font-semibold text-cyan-200 transition hover:text-cyan-100"
                          >
                            Open Knowledge
                          </Link>
                        </div>
                        <div className="space-y-3">
                          {gettingStarted.tasks.map((task) => (
                            <div
                              key={`${task.category}-${task.title}`}
                              className="rounded-2xl border border-white/10 bg-white/[0.045] p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="font-semibold text-slate-100">
                                    {task.title}
                                  </p>
                                  <p className="mt-2 text-xs leading-5 text-slate-500">
                                    {task.detail}
                                  </p>
                                </div>
                                <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-1 text-[11px] font-semibold text-cyan-100">
                                  {task.category}
                                </span>
                              </div>
                            </div>
                          ))}
                          {gettingStarted.tasks.length === 0 && (
                            <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                              No urgent setup tasks. JOHAI is ready for the next lead.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 lg:p-6">
                    <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                      {[
                        ["Calendly", gettingStarted.calendlyStatus],
                        ["Email", gettingStarted.emailStatus],
                        ["Website", gettingStarted.websiteStatus],
                      ].map(([label, status]) => (
                        <div
                          key={label}
                          className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                        >
                          <p className="text-xs uppercase tracking-wide text-slate-500">
                            {label} status
                          </p>
                          <p
                            className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${setupStatusClass(status as SetupStatus)}`}
                          >
                            {setupStatusLabel(status as SetupStatus)}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6">
                      <h2 className="font-semibold text-slate-100">
                        AI Success Timeline
                      </h2>
                      <div className="mt-4 space-y-4">
                        {gettingStarted.timeline.map((event) => (
                          <div key={`${event.time}-${event.title}`} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <span
                                className={`mt-1 h-3 w-3 rounded-full ${
                                  event.status === "complete"
                                    ? "bg-cyan-300"
                                    : "bg-white/30"
                                }`}
                              />
                              <span className="mt-2 h-full w-px bg-white/10" />
                            </div>
                            <div className="pb-2">
                              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                {event.time}
                              </p>
                              <p className="mt-1 font-semibold text-slate-100">
                                {event.title}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-slate-500">
                                {event.detail}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {metricCards.map((metric) => {
                const value =
                  metric.key === "total"
                    ? leadList.length
                    : metric.key === "booked"
                      ? bookedLeads.length
                      : metric.key === "week"
                        ? upcomingThisWeek
                        : emailErrors;
                const meta =
                  metric.key === "booked"
                    ? `${bookingConversionRate}% conversion`
                    : metric.meta;

                return (
                <Card key={metric.label} className="rounded-3xl p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">{metric.label}</p>
                      <p className="mt-3 text-3xl font-semibold">{value}</p>
                    </div>
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                      <metric.icon size={21} />
                    </span>
                  </div>
                  <p className="mt-4 text-xs text-slate-500">{meta}</p>
                </Card>
                );
              })}
            </section>

            <Card id="ai-audit" className="mt-6 rounded-3xl p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
                      <Bot size={21} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-300">
                        AI Employee
                      </p>
                      <h2 className="mt-1 text-xl font-semibold">
                        Orchestration command center
                      </h2>
                    </div>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
                    Current flow: Prospect asks a question, intent detection runs,
                    knowledge and semantic memory can be searched, business rules
                    create an action plan, actions execute in isolation, then CRM
                    and follow-up systems continue.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm">
                  <p className="text-slate-500">Current status</p>
                  <p className="mt-1 font-semibold text-emerald-100">
                    {currentOrchestration ? "Active" : "Waiting for conversation"}
                  </p>
                  <p className="mt-3 text-slate-500">Current conversation</p>
                  <p className="mt-1 font-semibold text-slate-200">
                    {currentOrchestration?.detected_intent ?? "No intent yet"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Actions today", orchestrationsToday.length],
                  ["Knowledge searches", countAction("SearchKnowledge")],
                  ["Appointments booked", countAction("ScheduleCalendly")],
                  ["Emails sent", countAction("SendEmail")],
                  ["Audits generated", countAction("GenerateAudit")],
                  ["Follow-ups started", countAction("AssignFollowUp")],
                  ["Escalations", countAction("EscalateHuman")],
                  ["Success rate", `${successRate}%`],
                  ["Avg response", `${averageResponseTime} ms`],
                  ["Semantic searches", countAction("SearchSemanticMemory")],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mt-6 rounded-3xl p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-300/10 text-emerald-200">
                      <Brain size={21} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">
                        Business Brain
                      </p>
                      <h2 className="mt-1 text-xl font-semibold">
                        {businessBrainIndustry} operating intelligence
                      </h2>
                    </div>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
                    Each business gets its own AI identity: services, policies,
                    vocabulary, booking rules, escalation rules, target customers,
                    and communication style. This layer is ready for Semantic
                    Search, the Orchestrator, Audit Engine, Voice AI, WhatsApp,
                    and SMS.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm">
                  <p className="text-slate-500">Brain health</p>
                  <p className="mt-1 text-4xl font-semibold text-emerald-100">
                    {brainScore.overallScore}%
                  </p>
                  <p className="mt-3 text-slate-500">AI confidence</p>
                  <p className="mt-1 font-semibold text-slate-200">
                    {brainScore.aiReadiness}%
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  ["Business completeness", `${brainScore.businessInformationCompleteness}%`],
                  ["Knowledge coverage", `${brainScore.knowledgeCompleteness}%`],
                  ["Products documented", `${brainScore.servicesDocumented}%`],
                  ["FAQs", `${brainScore.faqDocumented}%`],
                  ["Policies", `${brainScore.policiesDocumented}%`],
                  ["Procedures", `${brainScore.policiesDocumented}%`],
                  ["Website imported", `${brainScore.websiteImported}%`],
                  ["AI readiness", `${brainScore.aiReadiness}%`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Recommendation cards
                  </h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {businessBrainRecommendations.length === 0 && (
                      <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                        Business Brain has enough core context for this phase.
                      </div>
                    )}
                    {businessBrainRecommendations.slice(0, 6).map((recommendation) => (
                      <div
                        key={recommendation.title}
                        className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-semibold text-white">
                            {recommendation.title}
                          </p>
                          <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs uppercase text-slate-400">
                            {recommendation.priority}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-400">
                          {recommendation.detail}
                        </p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                          {recommendation.category}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <h3 className="font-semibold">Industry template</h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {businessBrainTemplate?.industry ?? businessBrainIndustry}
                  </p>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Business vocabulary
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {businessBrainVocabulary.slice(0, 12).map((word) => (
                          <span
                            key={word}
                            className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100"
                          >
                            {word}
                          </span>
                        ))}
                        {businessBrainVocabulary.length === 0 && (
                          <span className="text-sm text-slate-500">
                            No vocabulary yet
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        Suggested automations
                      </p>
                      <div className="mt-2 space-y-2">
                        {(businessBrainTemplate?.suggestedAutomations ?? [])
                          .slice(0, 4)
                          .map((automation) => (
                            <p
                              key={automation}
                              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300"
                            >
                              {automation}
                            </p>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="mt-6 rounded-3xl p-5">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-300/10 text-amber-200">
                      <ClipboardCheck size={21} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
                        AI Audit Center
                      </p>
                      <h2 className="mt-1 text-xl font-semibold">
                        Autonomous business audit engine
                      </h2>
                    </div>
                  </div>
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-400">
                    Modular audits analyze the business profile, knowledge,
                    website placeholders, SEO placeholders, Google Business,
                    social, automation, CRM, AI readiness, and communications.
                    Report architecture is ready for PDF export, executive
                    summary, detailed report, action plan, and roadmap.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                  <p className="text-sm text-slate-500">Overall score</p>
                  <p className="mt-1 text-4xl font-semibold text-amber-100">
                    {auditScores?.overallBusinessScore ?? 0}%
                  </p>
                  <p className="mt-3 text-sm text-slate-500">Audit status</p>
                  <p className="mt-1 font-semibold text-slate-200">
                    {autonomousAudit?.report_status ?? "ready"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                {[
                  ["Overall", `${auditScores?.overallBusinessScore ?? 0}%`],
                  ["AI readiness", `${auditScores?.aiReadinessScore ?? 0}%`],
                  ["Automation", `${auditScores?.automationScore ?? 0}%`],
                  ["Knowledge", `${auditScores?.knowledgeScore ?? 0}%`],
                  ["Marketing", `${auditScores?.marketingScore ?? 0}%`],
                  ["CRM", `${auditScores?.crmScore ?? 0}%`],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                  >
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-white">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Module scores
                  </h3>
                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {moduleResults.map((moduleResult: AuditResult) => (
                      <div
                        key={moduleResult.module}
                        className="rounded-2xl border border-white/10 bg-slate-950/35 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">
                              {moduleResult.module}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                              {moduleResult.status}
                            </p>
                          </div>
                          <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100">
                            {moduleResult.score}%
                          </span>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-amber-300"
                            style={{ width: `${moduleResult.score}%` }}
                          />
                        </div>
                        {moduleResult.issues[0] && (
                          <p className="mt-3 text-sm leading-6 text-slate-400">
                            {moduleResult.issues[0]}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <h3 className="font-semibold">Top priorities</h3>
                    <div className="mt-4 space-y-3">
                      {topAuditPriorities.length === 0 && (
                        <p className="text-sm text-slate-400">
                          No audit priorities yet.
                        </p>
                      )}
                      {topAuditPriorities.map((recommendation) => (
                        <div
                          key={`${recommendation.module}-${recommendation.title}`}
                          className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold">
                              {recommendation.title}
                            </p>
                            <span className="text-xs uppercase text-amber-200">
                              {recommendation.priority}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-5 text-slate-400">
                            {recommendation.detail}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <h3 className="font-semibold">Critical issues</h3>
                    <div className="mt-4 space-y-2">
                      {criticalIssues.length === 0 && (
                        <p className="text-sm text-slate-400">
                          No critical issues detected in this audit.
                        </p>
                      )}
                      {criticalIssues.slice(0, 5).map((issue) => (
                        <p
                          key={issue}
                          className="rounded-xl border border-red-300/20 bg-red-400/10 px-3 py-2 text-sm text-red-100"
                        >
                          {issue}
                        </p>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <h3 className="font-semibold">Progress over time</h3>
                    <div className="mt-4 flex h-24 items-end gap-2">
                      {progressHistory.length === 0 && (
                        <p className="text-sm text-slate-400">
                          First audit snapshot ready.
                        </p>
                      )}
                      {progressHistory.map((score, index) => (
                        <div
                          key={`${score}-${index}`}
                          className="flex flex-1 flex-col items-center gap-2"
                        >
                          <div
                            className="w-full rounded-t-lg bg-amber-300/70"
                            style={{ height: `${Math.max(8, score)}%` }}
                          />
                          <span className="text-[10px] text-slate-500">
                            {score}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <h3 className="font-semibold">Audit history</h3>
                    <div className="mt-4 space-y-2">
                      {auditHistory.length === 0 && (
                        <p className="text-sm text-slate-400">
                          No saved audit reports yet.
                        </p>
                      )}
                      {auditHistory.slice(0, 4).map((audit) => (
                        <div
                          key={audit.id}
                          className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2"
                        >
                          <p className="text-sm font-semibold">
                            {audit.audit_type ?? "AI audit"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(audit.created_at)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(380px,0.6fr)]">
              <div className="space-y-6">
                <Card id="meetings" className="rounded-3xl p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Pipeline</h2>
                      <p className="mt-1 text-sm text-slate-400">
                        Status distribution across the current lead base.
                      </p>
                    </div>
                    <div className="flex rounded-2xl border border-white/10 bg-white/[0.05] p-1">
                      {(["table", "kanban"] as const).map((mode) => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => setViewMode(mode)}
                          className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize transition ${
                            viewMode === mode
                              ? "bg-cyan-300 text-slate-950"
                              : "text-slate-400 hover:text-white"
                          }`}
                        >
                          {mode}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 md:grid-cols-5">
                    {leadStatuses.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(statusFilter === status ? "All" : status)}
                        className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-left transition hover:bg-white/[0.07]"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">{status}</p>
                          <p className="text-xl font-semibold">{statusCounts[status]}</p>
                        </div>
                        <div className="mt-4 h-2 rounded-full bg-white/10">
                          <div
                            className={`h-2 rounded-full ${statusBars[status]}`}
                            style={{
                              width: `${Math.max(10, (statusCounts[status] / maxStatusCount) * 100)}%`,
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card id="crm" className="rounded-3xl">
                  <div className="border-b border-white/10 p-5">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Professional CRM</h2>
                        <p className="mt-1 text-sm text-slate-400">
                          {filteredLeads.length} of {leadList.length} visible - {testLeadCount} test leads
                        </p>
                      </div>
                      <div className="grid gap-3 md:grid-cols-4">
                        <select
                          value={statusFilter}
                          onChange={(event) =>
                            setStatusFilter(event.target.value as LeadStatus | "All")
                          }
                          className="h-11 rounded-2xl border border-white/10 bg-[#07111f] px-4 text-sm text-white outline-none"
                        >
                          <option value="All">All statuses</option>
                          {leadStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <select
                          value={businessTypeFilter}
                          onChange={(event) => setBusinessTypeFilter(event.target.value)}
                          className="h-11 rounded-2xl border border-white/10 bg-[#07111f] px-4 text-sm text-white outline-none"
                        >
                          {businessTypes.map((type) => (
                            <option key={type} value={type}>
                              {type === "All" ? "All business types" : type}
                            </option>
                          ))}
                        </select>
                        <select
                          value={testLeadFilter}
                          onChange={(event) =>
                            setTestLeadFilter(event.target.value as "hide" | "show" | "only")
                          }
                          className="h-11 rounded-2xl border border-white/10 bg-[#07111f] px-4 text-sm text-white outline-none"
                        >
                          <option value="hide">Hide test leads</option>
                          <option value="show">Show test leads</option>
                          <option value="only">Only test leads</option>
                        </select>
                        <button
                          type="button"
                          disabled={testLeadCount === 0 || isPending}
                          onClick={cleanupTestLeads}
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-red-300/20 bg-red-400/10 px-4 text-sm font-semibold text-red-100 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ShieldAlert size={16} />
                          Clean tests
                        </button>
                      </div>
                    </div>
                  </div>

                  {loadError && (
                    <p className="m-5 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
                      The CRM dashboard could not load leads right now.
                    </p>
                  )}

                  {!loadError && filteredLeads.length === 0 && (
                    <div className="p-12 text-center">
                      <p className="text-lg font-semibold">No matching leads</p>
                      <p className="mt-2 text-sm text-slate-400">
                        Adjust the search or filters to see more records.
                      </p>
                    </div>
                  )}

                  {!loadError && filteredLeads.length > 0 && viewMode === "table" && (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1280px] text-left text-sm">
                        <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-500">
                          <tr>
                            <th className="px-5 py-3">Name</th>
                            <th className="px-5 py-3">Business</th>
                            <th className="px-5 py-3">Email</th>
                            <th className="px-5 py-3">Business Type</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Tags</th>
                            <th className="px-5 py-3">Next Meeting</th>
                            <th className="px-5 py-3">Meeting Status</th>
                            <th className="px-5 py-3">Email Activity</th>
                            <th className="px-5 py-3">Follow-up</th>
                            <th className="px-5 py-3">Created Date</th>
                            <th className="px-5 py-3" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {filteredLeads.map((lead) => {
                            const status = normalizeStatus(lead.status);
                            const active = selectedLead?.id === lead.id;

                            return (
                              <tr
                                key={lead.id}
                                className={`cursor-pointer transition hover:bg-cyan-300/[0.06] ${
                                  active ? "bg-cyan-300/[0.08]" : ""
                                }`}
                                onClick={() => selectLead(lead)}
                              >
                                <td className="px-5 py-4 font-semibold">
                                  {lead.first_name || "Unknown"}
                                </td>
                                <td className="px-5 py-4 text-slate-300">{lead.business_name}</td>
                                <td className="px-5 py-4 text-slate-400">{lead.email}</td>
                                <td className="px-5 py-4 text-slate-300">{lead.business_type}</td>
                                <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                                  <select
                                    value={status}
                                    onChange={(event) =>
                                      updateLead(lead.id, {
                                        status: event.target.value as LeadStatus,
                                      })
                                    }
                                    className={`rounded-full border px-3 py-2 text-xs font-semibold outline-none ${statusStyles[status]}`}
                                  >
                                    {leadStatuses.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                                  <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-semibold text-slate-300">
                                    <input
                                      type="checkbox"
                                      checked={Boolean(lead.is_test)}
                                      onChange={(event) =>
                                        updateLead(lead.id, {
                                          is_test: event.target.checked,
                                        })
                                      }
                                      className="h-4 w-4 accent-cyan-300"
                                    />
                                    Test
                                  </label>
                                </td>
                                <td className="px-5 py-4 text-slate-400">
                                  {formatDateTime(lead.next_meeting_at)}
                                </td>
                                <td className="px-5 py-4 text-slate-400">
                                  {lead.meeting_status ?? "Not booked"}
                                </td>
                                <td className="px-5 py-4">
                                  <div className="flex gap-2">
                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${emailStatusClass(lead.owner_email_sent)}`}>
                                      Owner {emailStatusLabel(lead.owner_email_sent)}
                                    </span>
                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${emailStatusClass(lead.prospect_email_sent)}`}>
                                      Prospect {emailStatusLabel(lead.prospect_email_sent)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-slate-400">
                                  {lead.follow_up_status ?? "Waiting"}
                                </td>
                                <td className="px-5 py-4 text-slate-400">
                                  {formatDate(lead.created_at)}
                                </td>
                                <td className="px-5 py-4" onClick={(event) => event.stopPropagation()}>
                                  <div className="flex justify-end gap-2">
                                    <button
                                      type="button"
                                      onClick={() => deleteLead(lead)}
                                      className="rounded-xl border border-red-300/20 p-2 text-red-200 transition hover:bg-red-400/10"
                                      aria-label="Delete lead"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                    <ChevronRight size={18} className="mt-2 text-slate-500" />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {!loadError && filteredLeads.length > 0 && viewMode === "kanban" && (
                    <div className="grid gap-4 overflow-x-auto p-5 lg:grid-cols-5">
                      {leadStatuses.map((status) => (
                        <div key={status} className="min-w-[220px] rounded-2xl border border-white/10 bg-slate-950/35 p-3">
                          <div className="mb-3 flex items-center justify-between">
                            <p className="text-sm font-semibold">{status}</p>
                            <span className="text-xs text-slate-500">{statusCounts[status]}</span>
                          </div>
                          <div className="space-y-3">
                            {filteredLeads
                              .filter((lead) => normalizeStatus(lead.status) === status)
                              .map((lead) => (
                                <button
                                  key={lead.id}
                                  type="button"
                                  onClick={() => selectLead(lead)}
                                  className="w-full rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-left transition hover:bg-white/[0.08]"
                                >
                                  <p className="font-semibold">{lead.first_name || "Unknown"}</p>
                                  <p className="mt-1 text-xs text-slate-400">{lead.business_name}</p>
                                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-500">
                                    {lead.biggest_problem || "No problem captured"}
                                  </p>
                                </button>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>

                <Card id="businesses" className="rounded-3xl p-5">
                  <div className="mb-5 flex items-center gap-3">
                    <BriefcaseBusiness className="text-cyan-300" />
                    <div>
                      <h2 className="text-lg font-semibold">Businesses</h2>
                      <p className="text-sm text-slate-400">
                        Platform accounts prepared for future business logins.
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-slate-500">
                        <tr>
                          <th className="px-4 py-3">Business</th>
                          <th className="px-4 py-3">Slug</th>
                          <th className="px-4 py-3">Plan</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Created</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {businesses.length === 0 && (
                          <tr>
                            <td className="px-4 py-4 text-slate-400" colSpan={5}>
                              No businesses found. Apply the multi-tenant migration to create the default JOHAI business.
                            </td>
                          </tr>
                        )}
                        {businesses.map((business) => (
                          <tr key={business.id}>
                            <td className="px-4 py-4 font-semibold">{business.name}</td>
                            <td className="px-4 py-4 text-slate-400">{business.slug}</td>
                            <td className="px-4 py-4 text-slate-400">{business.plan ?? "internal"}</td>
                            <td className="px-4 py-4">
                              <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">
                                {business.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-slate-400">{formatDate(business.created_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>

              <aside className="space-y-6">
                <Card className="rounded-3xl p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <Bot className="text-cyan-300" />
                    <h2 className="text-lg font-semibold">AI insights</h2>
                  </div>
                  <div className="space-y-3 text-sm text-slate-300">
                    <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                      {statusCounts.Qualified + statusCounts.Booked} leads are audit-ready or already booked.
                    </p>
                    <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                      {followUpCounts.Waiting ?? 0} leads are waiting for the next automation step.
                    </p>
                    <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                      {emailErrors === 0 ? "Email delivery is healthy." : `${emailErrors} email records need review.`}
                    </p>
                  </div>
                </Card>

                <Card className="rounded-3xl p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <CalendarDays className="text-cyan-300" />
                    <h2 className="text-lg font-semibold">Upcoming meetings</h2>
                  </div>
                  <div className="space-y-3">
                    {upcomingMeetings.slice(0, 4).length === 0 && (
                      <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-400">
                        No upcoming meetings this week.
                      </p>
                    )}
                    {upcomingMeetings.slice(0, 4).map((lead) => (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={() => selectLead(lead)}
                        className="w-full rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-left transition hover:bg-white/[0.07]"
                      >
                        <p className="font-semibold">{lead.first_name || lead.business_name}</p>
                        <p className="mt-1 text-xs text-slate-400">{formatDateTime(lead.next_meeting_at)}</p>
                      </button>
                    ))}
                  </div>
                </Card>

                <Card className="rounded-3xl p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <CircleDollarSign className="text-cyan-300" />
                    <h2 className="text-lg font-semibold">Follow-up status</h2>
                  </div>
                  <div className="space-y-3">
                    {followUpStatuses.map((status) => (
                      <div key={status}>
                        <div className="mb-1 flex justify-between text-xs text-slate-400">
                          <span>{status}</span>
                          <span>{followUpCounts[status] ?? 0}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10">
                          <div
                            className="h-2 rounded-full bg-cyan-300"
                            style={{
                              width: `${Math.max(6, ((followUpCounts[status] ?? 0) / Math.max(leadList.length, 1)) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="rounded-3xl p-5">
                  <div className="mb-4 flex items-center gap-3">
                    <MessageSquareText className="text-cyan-300" />
                    <h2 className="text-lg font-semibold">Recent conversations</h2>
                  </div>
                  <div className="space-y-3">
                    {recentConversations.length === 0 && (
                      <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-400">
                        No saved conversations yet.
                      </p>
                    )}
                    {recentConversations.map((lead) => (
                      <button
                        key={lead.id}
                        type="button"
                        onClick={() => selectLead(lead)}
                        className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-left transition hover:bg-white/[0.07]"
                      >
                        <span>
                          <span className="block font-semibold">{lead.first_name || "Unknown"}</span>
                          <span className="text-xs text-slate-400">{lead.business_name}</span>
                        </span>
                        <MoreHorizontal className="text-slate-500" size={18} />
                      </button>
                    ))}
                  </div>
                </Card>
              </aside>
            </section>

            <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
              <Card className="rounded-3xl p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Mail className="text-cyan-300" />
                  <h2 className="text-lg font-semibold">Email activity</h2>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-sm text-slate-400">Owner sent</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {leadList.filter((lead) => lead.owner_email_sent).length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-sm text-slate-400">Prospect sent</p>
                    <p className="mt-2 text-2xl font-semibold">
                      {leadList.filter((lead) => lead.prospect_email_sent).length}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                    <p className="text-sm text-slate-400">Errors</p>
                    <p className="mt-2 text-2xl font-semibold">{emailErrors}</p>
                  </div>
                </div>
              </Card>

              <Card className="rounded-3xl">
                {!selectedLead && (
                  <div className="p-8 text-center text-slate-400">
                    Select a lead to view details.
                  </div>
                )}

                {selectedLead && (
                  <div className="flex max-h-[920px] flex-col">
                    <div className="border-b border-white/10 p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-400">Lead detail</p>
                          <h2 className="mt-1 text-2xl font-semibold">
                            {selectedLead.first_name || "Unknown lead"}
                          </h2>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyles[normalizeStatus(selectedLead.status)]}`}>
                          {normalizeStatus(selectedLead.status)}
                        </span>
                      </div>

                      {selectedLead.is_test && (
                        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
                          <FlaskConical size={17} />
                          Marked as test lead
                        </div>
                      )}

                      <div className="mt-5 grid gap-3 text-sm text-slate-300 md:grid-cols-2">
                        <div className="flex items-center gap-3">
                          <Building2 size={17} className="text-slate-500" />
                          {selectedLead.business_name}
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail size={17} className="text-slate-500" />
                          {selectedLead.email}
                        </div>
                        <div className="flex items-center gap-3">
                          <UserRound size={17} className="text-slate-500" />
                          {selectedLead.business_type}
                        </div>
                        <div className="flex items-center gap-3">
                          <CalendarDays size={17} className="text-slate-500" />
                          Created {formatDate(selectedLead.created_at)}
                        </div>
                        <div className="flex items-center gap-3">
                          <CalendarDays size={17} className="text-slate-500" />
                          Next meeting {formatDateTime(selectedLead.next_meeting_at)}
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle2 size={17} className="text-slate-500" />
                          Follow-up {selectedLead.follow_up_status ?? "Waiting"}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 overflow-y-auto p-5">
                      {selectedLead.email_error && (
                        <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">
                          <p className="font-semibold">Email issue</p>
                          <p>{selectedLead.email_error}</p>
                        </div>
                      )}

                      <section>
                        <div className="mb-3 flex items-center gap-2">
                          <Sparkles size={18} className="text-cyan-300" />
                          <h3 className="font-semibold">AI recommendations</h3>
                        </div>
                        <div className="whitespace-pre-line rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-slate-300">
                          {selectedLead.ai_recommendations ||
                            "No AI recommendations were saved for this lead."}
                        </div>
                      </section>

                      <section>
                        <div className="mb-3 flex items-center gap-2">
                          <MessageSquareText size={18} className="text-cyan-300" />
                          <h3 className="font-semibold">Conversation history</h3>
                        </div>
                        <div className="space-y-3">
                          {conversation.length === 0 && (
                            <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm text-slate-400">
                              No conversation was saved for this lead.
                            </p>
                          )}

                          {conversation.map((message, index) => {
                            const isUser = message.role === "user";

                            return (
                              <div
                                key={`${selectedLead.id}-${index}`}
                                className={`rounded-2xl p-4 text-sm leading-6 ${
                                  isUser
                                    ? "bg-cyan-300 text-slate-950"
                                    : "border border-white/10 bg-white/[0.06] text-slate-200"
                                }`}
                              >
                                <p className="mb-1 text-xs font-bold uppercase opacity-70">
                                  {isUser ? "Visitor" : "JOHAI"}
                                </p>
                                {message.content || "Empty message"}
                              </div>
                            );
                          })}
                        </div>
                      </section>

                      <section>
                        <div className="mb-3 flex items-center gap-2">
                          <Clock3 size={18} className="text-cyan-300" />
                          <h3 className="font-semibold">Timeline</h3>
                        </div>
                        <div className="space-y-3 text-sm text-slate-300">
                          <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                            Lead created on {formatDate(selectedLead.created_at)}
                          </p>
                          <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                            Booked date {formatDate(selectedLead.booking_date)} - {selectedLead.meeting_status ?? "Not booked"}
                          </p>
                          <p className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                            Last follow-up {formatDateTime(selectedLead.last_follow_up_at)} - reminders sent {selectedLead.follow_up_count ?? 0}/3
                          </p>
                        </div>
                      </section>

                      <section>
                        <div className="mb-3 flex items-center gap-2">
                          <StickyNote size={18} className="text-cyan-300" />
                          <h3 className="font-semibold">Internal notes</h3>
                        </div>
                        <textarea
                          value={notesDraft}
                          onChange={(event) => setNotesDraft(event.target.value)}
                          className="min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/35 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10"
                          placeholder="Add private notes for follow-up, objections, next steps, or call outcomes."
                        />
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-sm text-slate-400">{saveMessage}</p>
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => updateLead(selectedLead.id, { notes: notesDraft })}
                            className="rounded-2xl bg-cyan-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isPending ? "Saving..." : "Save notes"}
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                )}
              </Card>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
