"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  CalendarDays,
  FileText,
  HelpCircle,
  Home,
  LogOut,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import { PortalDemoControlsDialog } from "@/components/portal/PortalDemoControls";
import { usePortal } from "@/components/portal/PortalProvider";

const navigation = [
  { suffix: "", label: "Overview", icon: Home },
  { suffix: "/appointments", label: "Appointments", icon: CalendarDays },
  { suffix: "/messages", label: "Messages", icon: MessageSquareText },
  { suffix: "/documents", label: "Documents", icon: FileText },
  { suffix: "/profile", label: "Profile", icon: UserRound },
  { suffix: "/support", label: "Support", icon: HelpCircle },
] as const;

export function PortalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const {
    activeProfile,
    branding,
    context,
    dataVersion,
    demoControls,
    environment,
    profileLabels,
    profiles,
    routeBase,
    selectProfile,
    signOut,
  } = usePortal();
  const displayName = branding?.displayName || "Customer Portal";
  const accentColor = branding?.primaryColor || "#0e7490";
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const exitLabel = environment === "demo" ? "Exit demo" : "Sign out";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <a
        href="#portal-main"
        className="fixed left-4 top-3 z-50 -translate-y-20 rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white transition focus:translate-y-0"
      >
        Skip to content
      </a>
      <div className="fixed inset-x-0 top-0 z-40 h-1" style={{ backgroundColor: accentColor }} aria-hidden="true" />

      <div className="mx-auto flex min-h-screen max-w-[96rem]">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white p-6 lg:flex lg:flex-col">
          <Link href={routeBase} className="rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-black text-white" style={{ backgroundColor: accentColor }} aria-hidden="true">
              {initials || "CP"}
            </span>
            <span className="mt-3 block text-xl font-semibold text-slate-950">{displayName}</span>
            <span className="mt-1 block text-xs font-black uppercase tracking-[0.18em] text-slate-600">Customer Portal</span>
          </Link>

          <nav className="mt-9 space-y-1" aria-label="Customer portal">
            {navigation.map((item) => {
              const href = `${routeBase}${item.suffix}`;
              const active = item.suffix === "" ? pathname === href : pathname.startsWith(href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.suffix || "overview"}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100 ${
                    active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  <Icon aria-hidden="true" size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto rounded-3xl bg-slate-50 p-4">
            <p className="truncate text-sm font-bold">{activeProfile.fullName}</p>
            <p className="mt-1 truncate text-xs text-slate-500">{activeProfile.email}</p>
            <button
              type="button"
              onClick={() => void signOut()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg text-sm font-bold text-slate-600 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
            >
              <LogOut aria-hidden="true" size={15} /> {exitLabel}
            </button>
            <p className="mt-4 border-t border-slate-200 pt-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600">
              Powered by JOHAI
            </p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-1 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-8">
            {environment === "demo" && demoControls ? (
              <div className="mb-3 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800">Demo environment · Fictional data only</p>
                  <p className="mt-1 text-xs text-amber-950">No Supabase session, production tenant, or external data service is used.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <PortalDemoControlsDialog controls={demoControls} />
                  <Link className="rounded-full px-3 py-2 text-xs font-bold text-amber-950 underline underline-offset-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200" href="/">
                    Return to website
                  </Link>
                </div>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4 lg:hidden">
              <Link href={routeBase} className="min-w-0 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100">
                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">JOHAI customer portal</span>
                <span className="block truncate text-sm font-bold">{displayName}</span>
              </Link>
              <button
                type="button"
                aria-label={exitLabel}
                onClick={() => void signOut()}
                className="rounded-full border border-slate-200 p-2.5 text-slate-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
              >
                <LogOut aria-hidden="true" size={17} />
              </button>
            </div>

            {profiles.length > 1 ? (
              <label className="mt-3 block lg:mt-0 lg:ml-auto lg:max-w-xs">
                <span className="sr-only">Current customer portal</span>
                <select
                  value={activeProfile.id}
                  onChange={(event) => selectProfile(event.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                >
                  {profiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>{profileLabels[profile.id]}</option>
                  ))}
                </select>
              </label>
            ) : null}

            <nav className="mt-3 flex gap-1 overflow-x-auto pb-1 lg:hidden" aria-label="Customer portal">
              {navigation.map((item) => {
                const href = `${routeBase}${item.suffix}`;
                const active = item.suffix === "" ? pathname === href : pathname.startsWith(href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.suffix || "overview"}
                    href={href}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100 ${
                      active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon aria-hidden="true" size={15} /> {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>

          <main id="portal-main" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-7 outline-none sm:px-6 sm:py-10 lg:px-10">
            <div key={`${context.businessId}:${context.customerProfileId}:${dataVersion}`}>{children}</div>
          </main>
          <footer className="px-4 pb-8 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-600 lg:hidden">
            Powered by JOHAI
          </footer>
        </div>
      </div>
    </div>
  );
}
