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
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import {
  getCustomerPortalAuthClient,
  isCustomerPortalAuthConfigured,
} from "@/app/lib/customer-portal-auth-client";

type PortalAuthContextValue = {
  completeRecovery: () => void;
  configured: boolean;
  loading: boolean;
  recoveryMode: boolean;
  session: Session | null;
  supabase: SupabaseClient | null;
  user: User | null;
};

const PortalAuthContext = createContext<PortalAuthContextValue | null>(null);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const configured = isCustomerPortalAuthConfigured();
  const [loading, setLoading] = useState(configured);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const supabase = configured ? getCustomerPortalAuthClient() : null;

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        const nextSession = error ? null : data.session;
        setSession(nextSession);
        try {
          const marker = JSON.parse(window.sessionStorage.getItem("johai-portal-recovery") ?? "null") as {
            at?: number;
            userId?: string;
          } | null;
          setRecoveryMode(Boolean(
            nextSession &&
            marker?.userId === nextSession.user.id &&
            typeof marker.at === "number" &&
            Date.now() - marker.at < 15 * 60 * 1000
          ));
        } catch {
          window.sessionStorage.removeItem("johai-portal-recovery");
          setRecoveryMode(false);
        }
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setSession(null);
        setRecoveryMode(false);
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === "PASSWORD_RECOVERY" && nextSession) {
        window.sessionStorage.setItem(
          "johai-portal-recovery",
          JSON.stringify({ at: Date.now(), userId: nextSession.user.id })
        );
        setRecoveryMode(true);
      }
      if (event === "SIGNED_OUT") {
        window.sessionStorage.removeItem("johai-portal-recovery");
        setRecoveryMode(false);
      }
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const completeRecovery = useCallback(() => {
    window.sessionStorage.removeItem("johai-portal-recovery");
    setRecoveryMode(false);
  }, []);

  const value = useMemo<PortalAuthContextValue>(
    () => ({
      completeRecovery,
      configured,
      loading,
      recoveryMode,
      session,
      supabase,
      user: session?.user ?? null,
    }),
    [completeRecovery, configured, loading, recoveryMode, session, supabase]
  );

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (!context) throw new Error("usePortalAuth must be used inside PortalAuthProvider");
  return context;
}
