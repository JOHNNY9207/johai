"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, animate, motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  BarChart3,
  CalendarCheck,
  Check,
  Mail,
  MessageCircle,
  Sparkles,
  Target,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import CalendlyBookingButton from "@/components/CalendlyBookingButton";
import FloatingChat from "@/components/FloatingChat";

type Room = "AI Employee" | "Industries" | "Customers" | "Pricing";

const rooms: Room[] = ["AI Employee", "Industries", "Customers", "Pricing"];

const aiFlow = [
  { label: "Visitor asks", detail: "Can AI help my business book more customers?", icon: MessageCircle },
  { label: "AI listening", detail: "JOHAI understands intent and urgency.", icon: Sparkles },
  { label: "Knowledge retrieved", detail: "Services, FAQ, and policies are matched.", icon: Brain },
  { label: "CRM record appears", detail: "Lead context is saved automatically.", icon: Target },
  { label: "Lead score rises", detail: "Opportunity is marked as high intent.", icon: TrendingUp },
  { label: "Calendar suggested", detail: "Booking appears only after qualification.", icon: CalendarCheck },
  { label: "Email sent", detail: "Confirmation and follow-up are prepared.", icon: Mail },
  { label: "Owner notified", detail: "The team sees what matters next.", icon: UsersRound },
];

const industries = [
  {
    name: "Restaurant",
    color: "from-amber-200 via-orange-100 to-white",
    photo: "/images/photo-restaurant.jpg",
    replacement: "/public/images/photo-restaurant.jpg",
    workflow: "Answers menu questions, captures private event leads, books reservations.",
  },
  {
    name: "Dental",
    color: "from-cyan-200 via-sky-100 to-white",
    photo: "/images/photo-dental.jpg",
    replacement: "/public/images/photo-dental.jpg",
    workflow: "Qualifies treatment requests and guides patients toward consultations.",
  },
  {
    name: "Beauty",
    color: "from-rose-200 via-pink-100 to-white",
    photo: "/images/photo-beauty.jpg",
    replacement: "/public/images/photo-beauty.jpg",
    workflow: "Books consultations, answers service questions, and follows up gently.",
  },
  {
    name: "Real Estate",
    color: "from-blue-200 via-slate-100 to-white",
    photo: "/images/photo-real-estate.jpg",
    replacement: "/public/images/photo-real-estate.jpg",
    workflow: "Qualifies buyers, sellers, valuation requests, and meeting intent.",
  },
  {
    name: "Legal",
    color: "from-stone-200 via-zinc-100 to-white",
    photo: "/images/photo-legal.jpg",
    replacement: "/public/images/photo-legal.jpg",
    workflow: "Routes consultation requests and prepares intake context for the team.",
  },
  {
    name: "Home Services",
    color: "from-emerald-200 via-teal-100 to-white",
    photo: "/images/photo-home-services.jpg",
    replacement: "/public/images/photo-home-services.jpg",
    workflow: "Captures urgent repair leads and keeps dispatch context organized.",
  },
];

const customerStories = [
  {
    name: "Sarah",
    business: "Beauty salon owner",
    photo: "/images/photo-customer-sarah.jpg",
    replacement: "/public/images/photo-customer-sarah.jpg",
    stats: [
      ["284", "conversations answered"],
      ["41", "consultations booked"],
      ["18", "missed leads recovered"],
      ["21h", "saved this month"],
    ],
    timeline: ["Website question answered", "Consultation booked", "Follow-up sent", "CRM updated"],
  },
  {
    name: "Marcus",
    business: "Restaurant operator",
    photo: "/images/photo-customer-marcus.jpg",
    replacement: "/public/images/photo-customer-marcus.jpg",
    stats: [
      ["196", "guest questions answered"],
      ["33", "events captured"],
      ["27", "reservations influenced"],
      ["16h", "saved this month"],
    ],
    timeline: ["Menu question answered", "Private event lead scored", "Owner notified", "Follow-up scheduled"],
  },
];

const plans = [
  {
    name: "Starter",
    slug: "starter",
    price: 299,
    text: "For one business ready to automate the first conversation.",
    features: ["AI Employee", "Lead capture", "Calendly booking", "CRM updates"],
  },
  {
    name: "Professional",
    slug: "professional",
    price: 699,
    text: "For teams that want follow-up, audit, and knowledge workflows.",
    features: ["Everything in Starter", "Follow-ups", "Knowledge Center", "AI Audit"],
  },
  {
    name: "Enterprise",
    slug: "enterprise",
    price: 1499,
    text: "For multi-location operators and agencies building an AI layer.",
    features: ["Multi-business", "Advanced automation", "Priority setup", "Custom workflows"],
  },
];

const liveDashboardActions = [
  ["09:12", "Conversation arrived", "Restaurant owner asked about private events"],
  ["09:13", "Knowledge searched", "Menu, event policy, pricing notes matched"],
  ["09:14", "Lead qualified", "High intent, booking ready"],
  ["09:16", "Meeting booked", "Strategy call added to calendar"],
  ["09:17", "CRM updated", "Timeline, notes, and next action saved"],
  ["09:18", "Owner notified", "Priority summary sent"],
];

function Counter({ value }: { value: string }) {
  const numeric = Number.parseInt(value.replace(/\D/g, ""), 10);
  const suffix = value.replace(/[0-9]/g, "");
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!numeric) return;
    const controls = animate(0, numeric, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (latest) => setCurrent(Math.round(latest)),
    });
    return () => controls.stop();
  }, [numeric]);

  return (
    <span>
      {current}
      {suffix}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`rounded-full px-5 py-3 text-sm font-bold transition ${
        active
          ? "bg-slate-950 text-white shadow-2xl shadow-slate-900/20"
          : "border border-white/70 bg-white/60 text-slate-800 shadow-lg shadow-slate-900/5 backdrop-blur-xl hover:bg-white"
      }`}
    >
      {children}
    </motion.button>
  );
}

function PhotoStage({
  src,
  alt,
  replacement,
  priority,
}: {
  src: string;
  alt: string;
  replacement: string;
  priority?: boolean;
}) {
  return (
    <div
      data-replacement={replacement}
      className="relative overflow-hidden rounded-[3rem] border border-white/70 bg-white/60 p-3 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl"
    >
      {/* Replace this premium photo placeholder by dropping your JPG at: {replacement} */}
      <Image
        src={src}
        alt={alt}
        width={1600}
        height={1100}
        priority={priority}
        className="h-[58vh] min-h-[420px] w-full rounded-[2.45rem] object-cover"
      />
      <div className="absolute inset-3 rounded-[2.45rem] bg-gradient-to-t from-slate-950/35 via-transparent to-white/15" />
    </div>
  );
}

function AiEmployeeRoom() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setStep((current) => (current + 1) % aiFlow.length);
    }, 1700);
    return () => window.clearInterval(id);
  }, []);

  const active = aiFlow[step];
  const ActiveIcon = active.icon;

  return (
    <RoomShell tone="from-cyan-100 via-white to-orange-50">
      <div className="grid min-h-[calc(100vh-9rem)] items-center gap-10 lg:grid-cols-[0.82fr_1.18fr]">
        <motion.div
          initial={{ opacity: 0, y: 34, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.7 }}
        >
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">AI Employee</p>
          <h1 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-tight text-slate-950 md:text-8xl">
            Watch JOHAI run the work.
          </h1>
          <p className="mt-7 max-w-xl text-xl leading-9 text-slate-600">
            Leads, answers, bookings, emails, follow-ups, and CRM updates move while your team stays focused.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/executive-dashboard" className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-900/20">
              <ArrowRight size={17} />
              Open Executive Dashboard
            </Link>
            <CalendlyBookingButton
              label="Book Strategy Call"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/70 px-6 py-4 text-sm font-bold text-slate-900 shadow-lg shadow-slate-900/5 backdrop-blur-xl transition hover:bg-white"
            />
          </div>
        </motion.div>

        <ExecutiveDashboardMock active={active} ActiveIcon={ActiveIcon} step={step} />
      </div>
    </RoomShell>
  );
}

function ExecutiveDashboardMock({
  active,
  ActiveIcon,
  step,
}: {
  active: (typeof aiFlow)[number];
  ActiveIcon: (typeof aiFlow)[number]["icon"];
  step: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-[3rem] border border-white/70 bg-white/70 p-4 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(34,211,238,0.16),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(251,191,36,0.14),transparent_26%)]" />
      <div className="relative rounded-[2.4rem] border border-slate-200 bg-slate-950 p-5 text-white shadow-2xl shadow-slate-900/20">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">JOHAI Operating System</p>
            <h2 className="mt-2 text-2xl font-semibold">Executive Dashboard</h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
            Live
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {[
            ["Business Health", "92%", BarChart3],
            ["Bookings", "14", CalendarCheck],
            ["Conversations", "38", MessageCircle],
            ["Revenue Forecast", "$18k", TrendingUp],
          ].map(([label, value, Icon]) => (
            <motion.div
              key={label as string}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"
            >
              <Icon className="text-cyan-200" size={18} />
              <p className="mt-3 text-2xl font-semibold">{value as string}</p>
              <p className="mt-1 text-xs text-slate-400">{label as string}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950">
                <ActiveIcon size={20} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">{active.label}</p>
                <p className="mt-1 text-sm text-slate-300">{active.detail}</p>
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-cyan-300"
                animate={{ width: `${((step + 1) / aiFlow.length) * 100}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Live activity feed</p>
            <div className="space-y-2">
              {liveDashboardActions.slice(0, 5).map(([time, title, detail], index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="flex gap-3 rounded-xl bg-slate-900/70 p-3"
                >
                  <span className="text-xs font-bold text-cyan-200">{time}</span>
                  <div>
                    <p className="text-sm font-semibold">{title}</p>
                    <p className="text-xs text-slate-500">{detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["Urgent: call event lead", "Recommendation: upload pricing", "Calendar: 3 calls today"].map((item) => (
            <div key={item} className="rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm text-cyan-50">
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IndustriesRoom() {
  const [active, setActive] = useState(0);
  const industry = industries[active];

  return (
    <RoomShell tone={industry.color}>
      <div className="grid min-h-[calc(100vh-9rem)] items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">Industries</p>
          <h2 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-tight text-slate-950 md:text-8xl">
            One AI layer. Every business rhythm.
          </h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {industries.map((item, index) => (
              <ActionButton key={item.name} active={index === active} onClick={() => setActive(index)}>
                {item.name}
              </ActionButton>
            ))}
          </div>
        </div>

        <motion.div
          key={industry.name}
          initial={{ opacity: 0, x: 30, filter: "blur(12px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55 }}
          className="relative"
        >
          <PhotoStage src={industry.photo} alt={`${industry.name} business using JOHAI`} replacement={industry.replacement} />
          <div className="absolute bottom-8 left-8 right-8 rounded-[2rem] border border-white/70 bg-white/82 p-6 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-700">{industry.name}</p>
            <p className="mt-3 text-3xl font-semibold leading-tight text-slate-950">{industry.workflow}</p>
          </div>
        </motion.div>
      </div>
    </RoomShell>
  );
}

function CustomersRoom() {
  const [active, setActive] = useState(0);
  const story = customerStories[active];

  return (
    <RoomShell tone="from-rose-50 via-white to-cyan-50">
      <div className="grid min-h-[calc(100vh-9rem)] items-center gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">Customers</p>
          <h2 className="mt-6 text-6xl font-semibold leading-[0.9] tracking-tight text-slate-950 md:text-8xl">
            Customer stories, not testimonials.
          </h2>
          <div className="mt-8 flex gap-2">
            {customerStories.map((item, index) => (
              <ActionButton key={item.name} active={index === active} onClick={() => setActive(index)}>
                {item.name}
              </ActionButton>
            ))}
          </div>
        </div>

        <motion.div
          key={story.name}
          initial={{ opacity: 0, y: 26, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <PhotoStage src={story.photo} alt={`${story.name} JOHAI customer story`} replacement={story.replacement} />
          <div className="absolute bottom-8 left-8 right-8 rounded-[2rem] border border-white/70 bg-white/84 p-6 shadow-2xl shadow-slate-900/15 backdrop-blur-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-700">
              {story.name} - {story.business}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              {story.stats.map(([value, label]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white/80 p-3">
                  <p className="text-2xl font-semibold text-slate-950">
                    <Counter value={value} />
                  </p>
                  <p className="mt-1 text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {story.timeline.map((item) => (
                <span key={item} className="rounded-full bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </RoomShell>
  );
}

function PricingRoom() {
  const [yearly, setYearly] = useState(false);
  const [expanded, setExpanded] = useState("Professional");
  const multiplier = yearly ? 10 : 1;
  const roi = yearly ? "$18k+" : "$1.8k+";

  return (
    <RoomShell tone="from-slate-50 via-white to-cyan-50">
      <div className="min-h-[calc(100vh-9rem)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-cyan-700">Pricing</p>
            <h2 className="mt-6 max-w-4xl text-6xl font-semibold leading-[0.9] tracking-tight text-slate-950 md:text-8xl">
              Choose the AI layer your business needs.
            </h2>
          </div>
          <div className="flex rounded-full border border-white/70 bg-white/70 p-1 shadow-lg shadow-slate-900/5 backdrop-blur-xl">
            <ActionButton active={!yearly} onClick={() => setYearly(false)}>Monthly</ActionButton>
            <ActionButton active={yearly} onClick={() => setYearly(true)}>Yearly</ActionButton>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-3">
          {plans.map((plan) => {
            const active = expanded === plan.name;
            return (
              <motion.div
                key={plan.name}
                layout
                onClick={() => setExpanded(plan.name)}
                whileHover={{ y: -8 }}
                className={`cursor-pointer rounded-[2rem] border p-6 text-left shadow-2xl backdrop-blur-2xl transition ${
                  active
                    ? "border-slate-950 bg-slate-950 text-white shadow-slate-900/25"
                    : "border-white/70 bg-white/70 text-slate-950 shadow-slate-900/8"
                }`}
              >
                <p className="text-xl font-semibold">{plan.name}</p>
                <p className="mt-5 text-5xl font-semibold">${plan.price * multiplier}</p>
                <p className={`mt-4 text-sm leading-6 ${active ? "text-slate-300" : "text-slate-600"}`}>{plan.text}</p>
                <AnimatePresence>
                  {active && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 space-y-3 overflow-hidden"
                    >
                      {plan.features.map((feature) => (
                        <p key={feature} className="flex items-center gap-2 text-sm">
                          <Check size={15} className="text-cyan-300" />
                          {feature}
                        </p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    href={`/pricing/${plan.slug}`}
                    onClick={(event) => event.stopPropagation()}
                    className={`rounded-full px-4 py-2 text-sm font-bold ${
                      active ? "bg-white text-slate-950" : "bg-slate-950 text-white"
                    }`}
                  >
                    View plan
                  </Link>
                  <Link
                    href={`/pricing/${plan.slug}#checkout`}
                    onClick={(event) => event.stopPropagation()}
                    className={`rounded-full border px-4 py-2 text-sm font-bold ${
                      active ? "border-white/20 text-white" : "border-slate-200 text-slate-800"
                    }`}
                  >
                    Start
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 rounded-[2rem] border border-white/70 bg-white/70 p-6 shadow-2xl shadow-slate-900/8 backdrop-blur-2xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-cyan-700">Estimated ROI</p>
              <p className="mt-2 text-3xl font-semibold">Projected monthly value: {roi}</p>
            </div>
            <CalendlyBookingButton
              label="Book Strategy Call"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white shadow-2xl shadow-slate-900/20 transition hover:bg-slate-800"
            />
          </div>
        </div>
      </div>
    </RoomShell>
  );
}

function RoomShell({ children, tone }: { children: ReactNode; tone: string }) {
  return (
    <motion.section
      key={tone}
      initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -28, filter: "blur(12px)" }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${tone} px-5 pb-10 pt-28 lg:px-8`}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_18%,rgba(125,211,252,0.34),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(253,186,116,0.28),transparent_28%)]" />
      <div className="mx-auto max-w-7xl">{children}</div>
    </motion.section>
  );
}

export default function Home() {
  const [room, setRoom] = useState<Room>("AI Employee");

  return (
    <main id="experience" className="min-h-screen overflow-hidden bg-white text-slate-950">
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
          <button
            type="button"
            onClick={() => setRoom("AI Employee")}
            className="flex items-center gap-3 rounded-full border border-white/70 bg-white/70 px-3 py-2 shadow-lg shadow-slate-900/5 backdrop-blur-2xl"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white">
              <Sparkles size={18} />
            </span>
            <span className="text-sm font-semibold">JOHAI</span>
          </button>
          <div className="hidden rounded-full border border-white/70 bg-white/70 p-1 shadow-lg shadow-slate-900/5 backdrop-blur-2xl md:flex">
            <Link
              href="/product"
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white"
            >
              Product
            </Link>
            {rooms.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setRoom(item)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  room === item ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-white"
                }`}
              >
                {item === "Industries" ? "Solutions" : item === "AI Employee" ? "Demo" : item}
              </button>
            ))}
            <Link
              href="/dashboard"
              className="rounded-full px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-white"
            >
              Dashboard
            </Link>
          </div>
          <CalendlyBookingButton
            label="Book Call"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-slate-900/20 transition hover:bg-slate-800"
          />
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {room === "AI Employee" && <AiEmployeeRoom key="ai" />}
        {room === "Industries" && <IndustriesRoom key="industries" />}
        {room === "Customers" && <CustomersRoom key="customers" />}
        {room === "Pricing" && <PricingRoom key="pricing" />}
      </AnimatePresence>

      <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 gap-2 rounded-full border border-white/70 bg-white/75 p-2 shadow-2xl shadow-slate-900/10 backdrop-blur-2xl md:hidden">
        {rooms.map((item) => (
          <button
            key={`mobile-${item}`}
            type="button"
            onClick={() => setRoom(item)}
            className={`rounded-full px-3 py-2 text-xs font-bold ${
              room === item ? "bg-slate-950 text-white" : "text-slate-700"
            }`}
          >
            {item.split(" ")[0]}
          </button>
        ))}
      </div>

      <FloatingChat />
    </main>
  );
}
