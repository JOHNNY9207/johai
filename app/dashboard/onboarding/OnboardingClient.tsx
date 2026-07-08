"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  ChevronLeft,
  Globe2,
  Image as ImageIcon,
  Languages,
  Mail,
  Rocket,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";
import type {
  Business,
  BusinessSettings,
  OnboardingStatus,
} from "@/app/lib/supabase";

type CompanyProfile = {
  businessName: string;
  industry: string;
  website: string;
  logoPlaceholder: string;
  businessDescription: string;
};

type AssistantConfig = {
  assistantName: string;
  language: string;
  tone: string;
  mainGoal: string;
  allowedActions: string;
  disallowedActions: string;
};

type ServicesConfig = {
  services: string;
  pricingNotes: string;
  commonQuestions: string;
};

type CommunicationConfig = {
  emailSenderStatus: string;
  calendlyStatus: string;
  bookingUrl: string;
};

type OnboardingClientProps = {
  business: Business | null;
  settings: BusinessSettings | null;
};

const steps = [
  {
    title: "Company profile",
    text: "Define the client workspace identity.",
    icon: BriefcaseBusiness,
  },
  {
    title: "AI assistant setup",
    text: "Shape the assistant behavior.",
    icon: Bot,
  },
  {
    title: "Services/products",
    text: "Teach JOHAI what the business sells.",
    icon: Store,
  },
  {
    title: "Communication setup",
    text: "Review email and booking readiness.",
    icon: Mail,
  },
  {
    title: "Final review",
    text: "Confirm and activate the AI workspace.",
    icon: Rocket,
  },
];

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function statusLabel(status?: OnboardingStatus) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-200">
        {label}
      </span>
      {children}
    </label>
  );
}

function inputClass() {
  return "w-full rounded-2xl border border-white/10 bg-slate-950/35 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40 focus:ring-4 focus:ring-cyan-300/10";
}

function textAreaClass() {
  return `${inputClass()} min-h-32 resize-none leading-6`;
}

export default function OnboardingClient({
  business,
  settings,
}: OnboardingClientProps) {
  const companyProfile = asRecord(settings?.company_profile);
  const assistantConfig = asRecord(settings?.ai_assistant_config);
  const servicesConfig = asRecord(settings?.services_config);
  const communicationConfig = asRecord(settings?.communication_config);

  const [activeStep, setActiveStep] = useState(0);
  const [saveMessage, setSaveMessage] = useState("");
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus>(
    settings?.onboarding_status ?? "not_started"
  );
  const [isPending, startTransition] = useTransition();

  const [company, setCompany] = useState<CompanyProfile>({
    businessName:
      stringValue(companyProfile.businessName) || business?.name || "",
    industry: stringValue(companyProfile.industry),
    website: stringValue(companyProfile.website),
    logoPlaceholder:
      stringValue(companyProfile.logoPlaceholder) || "Logo placeholder",
    businessDescription: stringValue(companyProfile.businessDescription),
  });

  const [assistant, setAssistant] = useState<AssistantConfig>({
    assistantName:
      stringValue(assistantConfig.assistantName) ||
      settings?.ai_assistant_name ||
      "JOHAI",
    language: stringValue(assistantConfig.language) || "English",
    tone: stringValue(assistantConfig.tone) || "Professional and friendly",
    mainGoal:
      stringValue(assistantConfig.mainGoal) ||
      "Qualify leads and book AI audits",
    allowedActions: stringValue(assistantConfig.allowedActions),
    disallowedActions: stringValue(assistantConfig.disallowedActions),
  });

  const [services, setServices] = useState<ServicesConfig>({
    services: stringValue(servicesConfig.services),
    pricingNotes: stringValue(servicesConfig.pricingNotes),
    commonQuestions: stringValue(servicesConfig.commonQuestions),
  });

  const [communication, setCommunication] = useState<CommunicationConfig>({
    emailSenderStatus:
      stringValue(communicationConfig.emailSenderStatus) ||
      (settings?.email_from || settings?.email_owner
        ? "Email sender configured"
        : "Email sender not configured"),
    calendlyStatus:
      stringValue(communicationConfig.calendlyStatus) ||
      (settings?.calendly_user_uri
        ? "Calendly connected"
        : "Calendly not connected"),
    bookingUrl:
      stringValue(communicationConfig.bookingUrl) ||
      settings?.booking_url ||
      "",
  });

  const completion = useMemo(() => {
    const groups = [
      company.businessName,
      company.industry,
      company.website,
      company.businessDescription,
      assistant.assistantName,
      assistant.language,
      assistant.tone,
      assistant.mainGoal,
      assistant.allowedActions,
      assistant.disallowedActions,
      services.services,
      services.pricingNotes,
      services.commonQuestions,
      communication.emailSenderStatus,
      communication.calendlyStatus,
      communication.bookingUrl,
    ];

    return Math.round(
      (groups.filter((item) => item.trim().length > 0).length / groups.length) *
        100
    );
  }, [assistant, communication, company, services]);

  function saveOnboarding(nextStatus: OnboardingStatus, nextStep?: number) {
    setSaveMessage("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/onboarding", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            onboarding_status: nextStatus,
            company_profile: company,
            ai_assistant_config: assistant,
            services_config: services,
            communication_config: communication,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setSaveMessage(data.error ?? "Onboarding could not be saved.");
          return;
        }

        setOnboardingStatus(data.settings?.onboarding_status ?? nextStatus);
        setSaveMessage(
          nextStatus === "completed"
            ? "JOHAI AI workspace activated."
            : "Progress saved."
        );

        if (typeof nextStep === "number") {
          setActiveStep(nextStep);
        }
      } catch {
        setSaveMessage("Onboarding could not be saved.");
      }
    });
  }

  return (
    <main className="min-h-screen bg-[#050812] text-white">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(135deg,#050812_0%,#071827_52%,#130a23_100%)]" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_0%,rgba(34,211,238,0.15),transparent_28%),radial-gradient(circle_at_85%_8%,rgba(168,85,247,0.13),transparent_30%)]" />

      <header className="border-b border-white/10 bg-white/[0.04] backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white"
            >
              <ChevronLeft size={16} />
              Back to dashboard
            </Link>
            <div className="mt-5 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300 text-slate-950">
                <Sparkles size={22} />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                  Client onboarding
                </p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  Configure the AI workspace
                </h1>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Onboarding status
            </p>
            <p className="mt-1 font-semibold text-cyan-100">
              {statusLabel(onboardingStatus)}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-5">
          <div className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <p className="font-semibold">Workspace readiness</p>
              <p className="text-sm text-cyan-200">{completion}%</p>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div
                className="h-2 rounded-full bg-cyan-300 transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
          </div>

          <nav className="rounded-3xl border border-white/10 bg-white/[0.055] p-3 backdrop-blur-xl">
            {steps.map((step, index) => (
              <button
                key={step.title}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`flex w-full items-start gap-3 rounded-2xl p-4 text-left transition ${
                  activeStep === index
                    ? "bg-cyan-300 text-slate-950"
                    : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <step.icon size={19} className="mt-0.5 shrink-0" />
                <span>
                  <span className="block text-sm font-semibold">
                    {step.title}
                  </span>
                  <span
                    className={`mt-1 block text-xs leading-5 ${
                      activeStep === index ? "text-slate-800" : "text-slate-500"
                    }`}
                  >
                    {step.text}
                  </span>
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="rounded-3xl border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl md:p-8">
          {activeStep === 0 && (
            <div>
              <StepHeader
                icon={BriefcaseBusiness}
                title="Company profile"
                text="This information becomes the foundation for the client workspace."
              />
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Business name">
                  <input
                    value={company.businessName}
                    onChange={(event) =>
                      setCompany({ ...company, businessName: event.target.value })
                    }
                    className={inputClass()}
                    placeholder="JOHAI"
                  />
                </Field>
                <Field label="Industry">
                  <input
                    value={company.industry}
                    onChange={(event) =>
                      setCompany({ ...company, industry: event.target.value })
                    }
                    className={inputClass()}
                    placeholder="Dental clinic, restaurant, med spa..."
                  />
                </Field>
                <Field label="Website">
                  <div className="relative">
                    <Globe2
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      value={company.website}
                      onChange={(event) =>
                        setCompany({ ...company, website: event.target.value })
                      }
                      className={`${inputClass()} pl-11`}
                      placeholder="https://example.com"
                    />
                  </div>
                </Field>
                <Field label="Logo placeholder">
                  <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-slate-950/35 p-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06] text-slate-400">
                      <ImageIcon size={20} />
                    </span>
                    <input
                      value={company.logoPlaceholder}
                      onChange={(event) =>
                        setCompany({
                          ...company,
                          logoPlaceholder: event.target.value,
                        })
                      }
                      className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                      placeholder="Logo placeholder"
                    />
                  </div>
                </Field>
                <div className="md:col-span-2">
                  <Field label="Business description">
                    <textarea
                      value={company.businessDescription}
                      onChange={(event) =>
                        setCompany({
                          ...company,
                          businessDescription: event.target.value,
                        })
                      }
                      className={textAreaClass()}
                      placeholder="Describe what the company does, who it serves, and what makes it valuable."
                    />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div>
              <StepHeader
                icon={Bot}
                title="AI assistant setup"
                text="Define how the assistant speaks, what it should achieve, and the boundaries it must respect."
              />
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Assistant name">
                  <input
                    value={assistant.assistantName}
                    onChange={(event) =>
                      setAssistant({
                        ...assistant,
                        assistantName: event.target.value,
                      })
                    }
                    className={inputClass()}
                    placeholder="JOHAI"
                  />
                </Field>
                <Field label="Language">
                  <div className="relative">
                    <Languages
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />
                    <input
                      value={assistant.language}
                      onChange={(event) =>
                        setAssistant({
                          ...assistant,
                          language: event.target.value,
                        })
                      }
                      className={`${inputClass()} pl-11`}
                      placeholder="English, French, Spanish..."
                    />
                  </div>
                </Field>
                <Field label="Tone">
                  <input
                    value={assistant.tone}
                    onChange={(event) =>
                      setAssistant({ ...assistant, tone: event.target.value })
                    }
                    className={inputClass()}
                    placeholder="Professional, warm, concise..."
                  />
                </Field>
                <Field label="Main goal">
                  <input
                    value={assistant.mainGoal}
                    onChange={(event) =>
                      setAssistant({
                        ...assistant,
                        mainGoal: event.target.value,
                      })
                    }
                    className={inputClass()}
                    placeholder="Qualify leads and book consultations"
                  />
                </Field>
                <Field label="What the AI is allowed to do">
                  <textarea
                    value={assistant.allowedActions}
                    onChange={(event) =>
                      setAssistant({
                        ...assistant,
                        allowedActions: event.target.value,
                      })
                    }
                    className={textAreaClass()}
                    placeholder="Answer service questions, collect lead info, suggest booking, explain benefits..."
                  />
                </Field>
                <Field label="What the AI must not do">
                  <textarea
                    value={assistant.disallowedActions}
                    onChange={(event) =>
                      setAssistant({
                        ...assistant,
                        disallowedActions: event.target.value,
                      })
                    }
                    className={textAreaClass()}
                    placeholder="Do not make guarantees, do not give legal/medical advice, do not quote unsupported prices..."
                  />
                </Field>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div>
              <StepHeader
                icon={Store}
                title="Services/products"
                text="Give JOHAI the context needed to answer common buyer questions."
              />
              <div className="mt-8 space-y-5">
                <Field label="List of services">
                  <textarea
                    value={services.services}
                    onChange={(event) =>
                      setServices({ ...services, services: event.target.value })
                    }
                    className={textAreaClass()}
                    placeholder="AI audit, appointment automation, CRM setup, lead follow-up..."
                  />
                </Field>
                <Field label="Pricing notes">
                  <textarea
                    value={services.pricingNotes}
                    onChange={(event) =>
                      setServices({
                        ...services,
                        pricingNotes: event.target.value,
                      })
                    }
                    className={textAreaClass()}
                    placeholder="Explain starting prices, ranges, custom quote rules, or what should be discussed on a call."
                  />
                </Field>
                <Field label="Common questions">
                  <textarea
                    value={services.commonQuestions}
                    onChange={(event) =>
                      setServices({
                        ...services,
                        commonQuestions: event.target.value,
                      })
                    }
                    className={textAreaClass()}
                    placeholder="How long does setup take? What integrations are supported? What results should clients expect?"
                  />
                </Field>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div>
              <StepHeader
                icon={Mail}
                title="Communication setup"
                text="Review email sender, Calendly connection, and the booking URL shown to prospects."
              />
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <StatusCard
                  icon={Mail}
                  label="Email sender status"
                  value={communication.emailSenderStatus}
                />
                <StatusCard
                  icon={CalendarDays}
                  label="Calendly status"
                  value={communication.calendlyStatus}
                />
                <StatusCard
                  icon={ShieldCheck}
                  label="Booking readiness"
                  value={communication.bookingUrl ? "Booking URL ready" : "Booking URL missing"}
                />
              </div>
              <div className="mt-6">
                <Field label="Booking URL">
                  <input
                    value={communication.bookingUrl}
                    onChange={(event) =>
                      setCommunication({
                        ...communication,
                        bookingUrl: event.target.value,
                      })
                    }
                    className={inputClass()}
                    placeholder="https://calendly.com/..."
                  />
                </Field>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div>
              <StepHeader
                icon={Rocket}
                title="Final review"
                text="Confirm the setup before activating the JOHAI AI workspace."
              />
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <ReviewBlock title="Company" items={[company.businessName, company.industry, company.website, company.businessDescription]} />
                <ReviewBlock title="AI Assistant" items={[assistant.assistantName, assistant.language, assistant.tone, assistant.mainGoal]} />
                <ReviewBlock title="Services" items={[services.services, services.pricingNotes, services.commonQuestions]} />
                <ReviewBlock title="Communication" items={[communication.emailSenderStatus, communication.calendlyStatus, communication.bookingUrl]} />
              </div>
              <button
                type="button"
                disabled={isPending}
                onClick={() => saveOnboarding("completed")}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-300 px-6 py-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Rocket size={18} />
                {isPending ? "Activating..." : "Activate JOHAI AI"}
              </button>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-400">{saveMessage}</p>
            <div className="flex gap-3">
              <button
                type="button"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
                className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  saveOnboarding(
                    activeStep === steps.length - 1 ? "completed" : "in_progress",
                    Math.min(activeStep + 1, steps.length - 1)
                  )
                }
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {activeStep === steps.length - 1 ? (
                  <>
                    <Save size={17} />
                    Save
                  </>
                ) : (
                  <>
                    Save and continue
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function StepHeader({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof BriefcaseBusiness;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-200">
        <Icon size={22} />
      </span>
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-400">
          {text}
        </p>
      </div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
      <Icon className="text-cyan-300" size={21} />
      <p className="mt-4 text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function ReviewBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div key={`${title}-${index}`} className="flex gap-3 text-sm">
            <Check size={16} className="mt-0.5 shrink-0 text-emerald-300" />
            <p className="line-clamp-3 text-slate-300">
              {item || "Not provided yet"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
