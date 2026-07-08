"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  ShieldAlert,
  Trash2,
  Mail,
  MessageSquareText,
  Search,
  StickyNote,
  UserRound,
} from "lucide-react";
import {
  followUpStatuses,
  leadStatuses,
  type Lead,
  type Business,
  type LeadStatus,
} from "@/app/lib/supabase";
import CalendlyBookingButton from "@/components/CalendlyBookingButton";

type DashboardClientProps = {
  leads: Lead[];
  businesses: Business[];
  loadError?: boolean;
};

type ConversationMessage = {
  role?: string;
  content?: string;
};

const statusStyles: Record<LeadStatus, string> = {
  New: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  Contacted: "border-violet-400/30 bg-violet-400/10 text-violet-200",
  Qualified: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Booked: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Closed: "border-slate-400/30 bg-slate-400/10 text-slate-200",
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
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-slate-200 bg-slate-50 text-slate-500";
}

export default function DashboardClient({
  leads,
  businesses,
  loadError,
}: DashboardClientProps) {
  const [leadList, setLeadList] = useState(leads);
  const [selectedLeadId, setSelectedLeadId] = useState(leads[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "All">("All");
  const [businessTypeFilter, setBusinessTypeFilter] = useState("All");
  const [testLeadFilter, setTestLeadFilter] = useState<
    "hide" | "show" | "only"
  >("hide");
  const [notesDraft, setNotesDraft] = useState(leads[0]?.notes ?? "");
  const [saveMessage, setSaveMessage] = useState("");
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
      const matchesStatus =
        statusFilter === "All" || status === statusFilter;
      const matchesBusinessType =
        businessTypeFilter === "All" ||
        lead.business_type === businessTypeFilter;
      const matchesTestFilter =
        testLeadFilter === "show" ||
        (testLeadFilter === "hide" && !lead.is_test) ||
        (testLeadFilter === "only" && lead.is_test);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesBusinessType &&
        matchesTestFilter
      );
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

  const conversation = getConversation(selectedLead?.conversation);
  const testLeadCount = leadList.filter((lead) => lead.is_test).length;
  const bookedLeads = leadList.filter(
    (lead) => normalizeStatus(lead.status) === "Booked"
  );
  const bookingConversionRate =
    leadList.length > 0
      ? Math.round((bookedLeads.length / leadList.length) * 100)
      : 0;
  const now = new Date();
  const weekFromNow = new Date(now);
  weekFromNow.setDate(now.getDate() + 7);
  const upcomingThisWeek = leadList.filter((lead) => {
    if (!lead.next_meeting_at || lead.meeting_status === "Canceled") {
      return false;
    }

    const meetingDate = new Date(lead.next_meeting_at);

    return meetingDate >= now && meetingDate <= weekFromNow;
  }).length;
  const followUpCounts = followUpStatuses.reduce<Record<string, number>>(
    (counts, status) => {
      counts[status] = leadList.filter(
        (lead) => (lead.follow_up_status ?? "Waiting") === status
      ).length;

      return counts;
    },
    {}
  );

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
        current.map((lead) =>
          lead.id === leadId ? { ...lead, ...updates } : lead
        )
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
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                JOHAI CRM
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">
                Lead Management
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="/dashboard/settings"
                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Settings
              </a>
              <CalendlyBookingButton className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {leadStatuses.map((status) => (
                <div
                  key={status}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs font-medium text-slate-500">
                    {status}
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {statusCounts[status]}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-medium text-slate-500">
                Total booked meetings
              </p>
              <p className="mt-2 text-3xl font-bold">{bookedLeads.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-medium text-slate-500">
                Booking conversion rate
              </p>
              <p className="mt-2 text-3xl font-bold">
                {bookingConversionRate}%
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-sm font-medium text-slate-500">
                Upcoming meetings this week
              </p>
              <p className="mt-2 text-3xl font-bold">{upcomingThisWeek}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h2 className="text-lg font-bold">Businesses</h2>
              <p className="text-sm text-slate-500">
                Platform accounts prepared for future business logins.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Business</th>
                    <th className="px-4 py-3">Slug</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {businesses.length === 0 && (
                    <tr>
                      <td className="px-4 py-4 text-slate-500" colSpan={5}>
                        No businesses found. Apply the multi-tenant migration to
                        create the default JOHAI business.
                      </td>
                    </tr>
                  )}
                  {businesses.map((business) => (
                    <tr key={business.id}>
                      <td className="px-4 py-4 font-semibold">
                        {business.name}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {business.slug}
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {business.plan ?? "internal"}
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {business.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-600">
                        {formatDate(business.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4">
              <h2 className="text-lg font-bold">Follow-up Engine</h2>
              <p className="text-sm text-slate-500">
                Automated reminders stop once a meeting is booked.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-5">
              {followUpStatuses.map((status) => (
                <div
                  key={status}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <p className="text-xs font-medium text-slate-500">
                    {status}
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {followUpCounts[status] ?? 0}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 xl:grid-cols-[1fr_190px_220px_190px_auto]">
            <label className="relative block">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search leads by name, business, email, type, or problem"
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as LeadStatus | "All")
              }
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                setTestLeadFilter(
                  event.target.value as "hide" | "show" | "only"
                )
              }
              className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="hide">Hide test leads</option>
              <option value="show">Show test leads</option>
              <option value="only">Only test leads</option>
            </select>

            <button
              type="button"
              disabled={testLeadCount === 0 || isPending}
              onClick={cleanupTestLeads}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShieldAlert size={16} />
              Clean Tests
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="text-lg font-bold">Leads</h2>
              <p className="text-sm text-slate-500">
                {filteredLeads.length} of {leadList.length} visible ·{" "}
                {testLeadCount} test
              </p>
            </div>
          </div>

          {loadError && (
            <p className="m-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">
              The CRM dashboard could not load leads right now.
            </p>
          )}

          {!loadError && filteredLeads.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-lg font-semibold text-slate-700">
                No matching leads
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Adjust the search or filters to see more records.
              </p>
            </div>
          )}

          {!loadError && filteredLeads.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1280px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Name</th>
                    <th className="px-5 py-3">Business</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Business Type</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Test</th>
                    <th className="px-5 py-3">Next Meeting</th>
                    <th className="px-5 py-3">Booked Date</th>
                    <th className="px-5 py-3">Meeting Status</th>
                    <th className="px-5 py-3">Owner Email</th>
                    <th className="px-5 py-3">Prospect Email</th>
                    <th className="px-5 py-3">Follow-up</th>
                    <th className="px-5 py-3">Created Date</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredLeads.map((lead) => {
                    const status = normalizeStatus(lead.status);
                    const active = selectedLead?.id === lead.id;

                    return (
                      <tr
                        key={lead.id}
                        className={`cursor-pointer transition hover:bg-blue-50/60 ${
                          active ? "bg-blue-50" : "bg-white"
                        }`}
                        onClick={() => selectLead(lead)}
                      >
                        <td className="px-5 py-4 font-semibold">
                          {lead.first_name || "Unknown"}
                        </td>
                        <td className="px-5 py-4">{lead.business_name}</td>
                        <td className="px-5 py-4 text-slate-600">
                          {lead.email}
                        </td>
                        <td className="px-5 py-4">{lead.business_type}</td>
                        <td
                          className="px-5 py-4"
                          onClick={(event) => event.stopPropagation()}
                        >
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
                        <td
                          className="px-5 py-4"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <label className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
                            <input
                              type="checkbox"
                              checked={Boolean(lead.is_test)}
                              onChange={(event) =>
                                updateLead(lead.id, {
                                  is_test: event.target.checked,
                                })
                              }
                              className="h-4 w-4 accent-blue-600"
                            />
                            Test
                          </label>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDateTime(lead.next_meeting_at)}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(lead.booking_date)}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {lead.meeting_status ?? "Not booked"}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${emailStatusClass(
                              lead.owner_email_sent
                            )}`}
                          >
                            {emailStatusLabel(lead.owner_email_sent)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${emailStatusClass(
                              lead.prospect_email_sent
                            )}`}
                          >
                            {emailStatusLabel(lead.prospect_email_sent)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {lead.follow_up_status ?? "Waiting"}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {formatDate(lead.created_at)}
                        </td>
                        <td
                          className="px-5 py-4"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => deleteLead(lead)}
                              className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50"
                              aria-label="Delete lead"
                            >
                              <Trash2 size={16} />
                            </button>
                            <ChevronRight
                              size={18}
                              className="mt-2 text-slate-400"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          {!selectedLead && (
            <div className="p-8 text-center text-slate-500">
              Select a lead to view details.
            </div>
          )}

          {selectedLead && (
            <div className="flex max-h-[calc(100vh-160px)] flex-col">
              <div className="border-b border-slate-200 p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Lead detail</p>
                    <h2 className="mt-1 text-2xl font-bold">
                      {selectedLead.first_name || "Unknown lead"}
                    </h2>
                  </div>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      statusStyles[normalizeStatus(selectedLead.status)]
                    }`}
                  >
                    {normalizeStatus(selectedLead.status)}
                  </span>
                </div>

                {selectedLead.is_test && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                    <FlaskConical size={17} />
                    Marked as test lead
                  </div>
                )}

                <div className="grid gap-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <Building2 size={17} className="text-slate-400" />
                    {selectedLead.business_name}
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={17} className="text-slate-400" />
                    {selectedLead.email}
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={17} className="text-slate-400" />
                    Owner email: {emailStatusLabel(selectedLead.owner_email_sent)}
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail size={17} className="text-slate-400" />
                    Prospect email:{" "}
                    {emailStatusLabel(selectedLead.prospect_email_sent)}
                  </div>
                  <div className="flex items-center gap-3">
                    <UserRound size={17} className="text-slate-400" />
                    {selectedLead.business_type}
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays size={17} className="text-slate-400" />
                    {formatDate(selectedLead.created_at)}
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays size={17} className="text-slate-400" />
                    Next meeting: {formatDateTime(selectedLead.next_meeting_at)}
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays size={17} className="text-slate-400" />
                    Booked date: {formatDate(selectedLead.booking_date)}
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={17} className="text-slate-400" />
                    Meeting status:{" "}
                    {selectedLead.meeting_status ?? "Not booked"}
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={17} className="text-slate-400" />
                    Follow-up: {selectedLead.follow_up_status ?? "Waiting"}
                  </div>
                  <div className="flex items-center gap-3">
                    <CalendarDays size={17} className="text-slate-400" />
                    Last follow-up:{" "}
                    {formatDateTime(selectedLead.last_follow_up_at)}
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={17} className="text-slate-400" />
                    Reminders sent: {selectedLead.follow_up_count ?? 0}/3
                  </div>
                </div>
              </div>

              <div className="space-y-6 overflow-y-auto p-6">
                <section>
                  {selectedLead.email_error && (
                    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                      <p className="font-bold">Email issue</p>
                      <p>{selectedLead.email_error}</p>
                    </div>
                  )}

                  <div className="mb-3 flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-blue-600" />
                    <h3 className="font-bold">AI Recommendations</h3>
                  </div>
                  <div className="whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                    {selectedLead.ai_recommendations ||
                      "No AI recommendations were saved for this lead."}
                  </div>
                </section>

                <section>
                  <div className="mb-3 flex items-center gap-2">
                    <MessageSquareText size={18} className="text-blue-600" />
                    <h3 className="font-bold">Full Conversation</h3>
                  </div>
                  <div className="space-y-3">
                    {conversation.length === 0 && (
                      <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">
                        No conversation was saved for this lead.
                      </p>
                    )}

                    {conversation.map((message, index) => {
                      const isUser = message.role === "user";

                      return (
                        <div
                          key={`${selectedLead.id}-${index}`}
                          className={`rounded-xl p-4 text-sm leading-6 ${
                            isUser
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-700"
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
                    <StickyNote size={18} className="text-blue-600" />
                    <h3 className="font-bold">Internal Notes</h3>
                  </div>
                  <textarea
                    value={notesDraft}
                    onChange={(event) => setNotesDraft(event.target.value)}
                    className="min-h-36 w-full resize-none rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Add private notes for follow-up, objections, next steps, or call outcomes."
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-sm text-slate-500">{saveMessage}</p>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() =>
                        updateLead(selectedLead.id, { notes: notesDraft })
                      }
                      className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-400"
                    >
                      {isPending ? "Saving..." : "Save Notes"}
                    </button>
                  </div>
                </section>
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
