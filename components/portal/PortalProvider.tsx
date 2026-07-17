"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { Building2, LogOut, ShieldAlert } from "lucide-react";
import {
  getPortalBranding,
  listPortalProfiles,
} from "@/app/lib/customer-portal-data";
import type {
  PortalAppointment,
  PortalBranding,
  PortalDocument,
  PortalDocumentAcknowledgement,
  PortalMessage,
  PortalProfile,
  PortalRequest,
  PortalTenantContext,
} from "@/app/lib/customer-portal-types";
import {
  createSupabasePortalRepository,
} from "@/app/lib/customer-portal-supabase-repository";
import {
  unavailablePortalContextualIntelligenceProvider,
  type PortalContextualIntelligenceProvider,
} from "@/app/lib/customer-portal-contextual-provider";
import type { PortalRepository } from "@/app/lib/customer-portal-repository";
import { usePortalAuth } from "@/components/portal/PortalAuthProvider";
import {
  PortalScreenLoader,
  portalPrimaryButton,
  portalSecondaryButton,
} from "@/components/portal/PortalUi";

export type PortalDemoControls = {
  dataMode: "error" | "normal" | "empty";
  failNextDownload: () => void;
  failNextMessage: () => void;
  failNextProfileSave: () => void;
  reset: () => void;
  setDataMode: (mode: "error" | "normal" | "empty") => void;
};

export type PortalContextValue = {
  activeProfile: PortalProfile;
  branding: PortalBranding | null;
  context: PortalTenantContext;
  dataVersion: number;
  demoControls?: PortalDemoControls;
  environment: "authenticated" | "demo";
  initialData?: Readonly<{
    acknowledgements: readonly PortalDocumentAcknowledgement[];
    appointments: readonly PortalAppointment[];
    documents: readonly PortalDocument[];
    messages: readonly PortalMessage[];
    requests: readonly PortalRequest[];
  }>;
  intelligenceProvider: PortalContextualIntelligenceProvider;
  profileLabels: Readonly<Record<string, string>>;
  profiles: readonly PortalProfile[];
  referenceTime: string;
  repository: PortalRepository;
  replaceProfile: (profile: PortalProfile) => void;
  routeBase: "/portal" | "/portal/demo";
  selectProfile: (profileId: string) => void;
  signOut: () => Promise<void>;
};

type AccessState = "checking" | "ready" | "select" | "denied" | "error" | "unconfigured";

const PortalContext = createContext<PortalContextValue | null>(null);

export function PortalContextBoundary({
  children,
  value,
}: {
  children: ReactNode;
  value: PortalContextValue;
}) {
  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

function tenantContext(profile: PortalProfile): PortalTenantContext {
  return { businessId: profile.businessId, customerProfileId: profile.id };
}

export function PortalProvider({
  children,
  referenceTime,
}: {
  children: ReactNode;
  referenceTime: string;
}) {
  const router = useRouter();
  const portalAuth = usePortalAuth();
  const [accessState, setAccessState] = useState<AccessState>("checking");
  const [resolvedUserId, setResolvedUserId] = useState("");
  const [profiles, setProfiles] = useState<PortalProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<PortalProfile | null>(null);
  const [brandingByProfile, setBrandingByProfile] = useState<Record<string, PortalBranding | null>>({});

  const profileLabels = useMemo(() => {
    const baseLabels = profiles.map((profile) => brandingByProfile[profile.id]?.displayName || "Customer Portal");
    const counts = new Map<string, number>();
    baseLabels.forEach((label) => counts.set(label, (counts.get(label) ?? 0) + 1));
    const positions = new Map<string, number>();
    return Object.fromEntries(profiles.map((profile, index) => {
      const label = baseLabels[index];
      const position = (positions.get(label) ?? 0) + 1;
      positions.set(label, position);
      return [profile.id, counts.get(label) === 1 ? label : `${label} ${position}`];
    }));
  }, [brandingByProfile, profiles]);

  useEffect(() => {
    if (portalAuth.loading || !portalAuth.configured || !portalAuth.supabase) return;
    if (!portalAuth.session || !portalAuth.user) {
      const pathname = window.location.pathname;
      const next = pathname === "/portal" ? "" : `?next=${encodeURIComponent(pathname)}`;
      router.replace(`/portal/login${next}`);
      return;
    }

    let active = true;
    const userId = portalAuth.user.id;
    const storageKey = `johai-portal-tenant:${userId}`;

    async function resolveAccess() {
      try {
        const availableProfiles = await listPortalProfiles(portalAuth.supabase as SupabaseClient);
        if (!active) return;
        if (availableProfiles.length === 0) {
          setProfiles([]);
          setActiveProfile(null);
          setResolvedUserId(userId);
          setAccessState("denied");
          return;
        }

        const brandEntries = await Promise.all(
          availableProfiles.map(async (profile) => {
            const branding = await getPortalBranding(
              portalAuth.supabase as SupabaseClient,
              tenantContext(profile)
            );
            return [profile.id, branding] as const;
          })
        );
        if (!active) return;

        const brandingMap = Object.fromEntries(brandEntries);
        const rememberedId = window.localStorage.getItem(storageKey);
        const remembered = availableProfiles.find((profile) => profile.id === rememberedId) ?? null;
        const selected = remembered ?? (availableProfiles.length === 1 ? availableProfiles[0] : null);

        setProfiles(availableProfiles);
        setBrandingByProfile(brandingMap);
        setActiveProfile(selected);
        setResolvedUserId(userId);
        setAccessState(selected ? "ready" : "select");
      } catch {
        if (active) {
          setResolvedUserId(userId);
          setAccessState("error");
        }
      }
    }

    void resolveAccess();
    return () => {
      active = false;
    };
  }, [portalAuth.configured, portalAuth.loading, portalAuth.session, portalAuth.supabase, portalAuth.user, router]);

  const selectProfile = useCallback(
    (profileId: string) => {
      if (!portalAuth.user) return;
      const selected = profiles.find((profile) => profile.id === profileId);
      if (!selected) return;
      window.localStorage.setItem(`johai-portal-tenant:${portalAuth.user.id}`, selected.id);
      setActiveProfile(selected);
      setAccessState("ready");
    },
    [portalAuth.user, profiles]
  );

  const replaceProfile = useCallback((profile: PortalProfile) => {
    if (!activeProfile || profile.id !== activeProfile.id || profile.businessId !== activeProfile.businessId) return;
    setProfiles((current) => current.map((item) => (item.id === profile.id ? profile : item)));
    setActiveProfile(profile);
  }, [activeProfile]);

  const signOut = useCallback(async () => {
    if (portalAuth.user) {
      window.localStorage.removeItem(`johai-portal-tenant:${portalAuth.user.id}`);
    }
    const { error } = await portalAuth.supabase?.auth.signOut({ scope: "local" }) ?? { error: null };
    if (error) {
      setAccessState("error");
      return;
    }
    router.replace("/portal/login");
    router.refresh();
  }, [portalAuth.supabase, portalAuth.user, router]);

  const value = useMemo<PortalContextValue | null>(() => {
    if (
      !activeProfile ||
      !portalAuth.session ||
      !portalAuth.supabase ||
      !portalAuth.user ||
      resolvedUserId !== portalAuth.user.id
    ) return null;
    return {
      activeProfile,
      branding: brandingByProfile[activeProfile.id] ?? null,
      context: tenantContext(activeProfile),
      dataVersion: 0,
      environment: "authenticated",
      intelligenceProvider: unavailablePortalContextualIntelligenceProvider,
      profileLabels,
      profiles,
      referenceTime,
      repository: createSupabasePortalRepository(
        portalAuth.supabase,
        tenantContext(activeProfile),
        portalAuth.session.access_token
      ),
      replaceProfile,
      routeBase: "/portal",
      selectProfile,
      signOut,
    };
  }, [activeProfile, brandingByProfile, portalAuth.session, portalAuth.supabase, portalAuth.user, profileLabels, profiles, referenceTime, replaceProfile, resolvedUserId, selectProfile, signOut]);

  const renderedAccessState: AccessState =
    !portalAuth.configured || !portalAuth.supabase
      ? "unconfigured"
      : portalAuth.loading || !portalAuth.session || !portalAuth.user || resolvedUserId !== portalAuth.user.id
        ? "checking"
        : accessState;

  if (renderedAccessState === "checking") return <PortalScreenLoader label="Opening your customer portal" />;

  if (renderedAccessState === "select") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 text-slate-950">
        <section className="w-full max-w-xl rounded-[2.5rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
          <Building2 className="text-cyan-700" aria-hidden="true" size={30} />
          <h1 className="mt-5 text-3xl font-semibold">Choose your customer portal</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Your sign-in is connected to more than one business. Choose where you want to continue.</p>
          <div className="mt-6 grid gap-3">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                className="rounded-2xl border border-slate-200 p-4 text-left transition hover:border-cyan-400 hover:bg-cyan-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-100"
                onClick={() => selectProfile(profile.id)}
              >
                <span className="block font-bold text-slate-950">{profileLabels[profile.id]}</span>
                <span className="mt-1 block text-sm text-slate-600">{profile.fullName}</span>
              </button>
            ))}
          </div>
          <button className={`${portalSecondaryButton} mt-6 w-full`} type="button" onClick={() => void signOut()}>
            <LogOut aria-hidden="true" size={16} /> Sign out
          </button>
        </section>
      </main>
    );
  }

  if (renderedAccessState !== "ready" || !value) {
    const denied = renderedAccessState === "denied";
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 text-slate-950">
        <section className="w-full max-w-md rounded-[2.5rem] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-900/5">
          <ShieldAlert className="mx-auto text-amber-600" aria-hidden="true" size={34} />
          <h1 className="mt-5 text-2xl font-semibold">{denied ? "Portal access is unavailable" : "The portal could not be opened"}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {denied
              ? "This sign-in is not connected to an active customer portal. Contact the business that invited you if you need help."
              : "Try again shortly. Your customer information remains protected."}
          </p>
          {renderedAccessState === "error" ? (
            <button className={`${portalPrimaryButton} mt-6 w-full`} type="button" onClick={() => window.location.reload()}>Try again</button>
          ) : null}
          <button className={`${portalSecondaryButton} mt-3 w-full`} type="button" onClick={() => void signOut()}>
            <LogOut aria-hidden="true" size={16} /> Sign out
          </button>
        </section>
      </main>
    );
  }

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const context = useContext(PortalContext);
  if (!context) throw new Error("usePortal must be used inside PortalProvider");
  return context;
}
