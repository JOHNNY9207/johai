"use client";

import { getSharedSupabaseBrowserAuthClient } from "@/app/lib/supabase-browser-auth-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const customerPortalAuthStorageKey = "johai-customer-portal-session";
const protectedPortalPaths = new Set([
  "/portal",
  "/portal/appointments",
  "/portal/documents",
  "/portal/messages",
  "/portal/profile",
  "/portal/support",
]);

export function isCustomerPortalAuthConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getCustomerPortalAuthClient() {
  if (!isCustomerPortalAuthConfigured()) {
    throw new Error("Customer portal authentication is not configured.");
  }

  return getSharedSupabaseBrowserAuthClient({
    flowType: "pkce",
    storageKey: customerPortalAuthStorageKey,
    supabaseAnonKey,
    supabaseUrl,
  });
}

export function getCustomerPortalRedirectUrl(path: string) {
  if (typeof window === "undefined") return path;
  return `${window.location.origin}${path}`;
}

export function getSafePortalPath(value: string | null, fallback = "/portal") {
  if (!value || value.includes("\\") || value.startsWith("//")) return fallback;

  try {
    const url = new URL(value, "https://portal.invalid");
    const isLocal = url.origin === "https://portal.invalid";
    const normalizedPath = url.pathname.length > 1 && url.pathname.endsWith("/")
      ? url.pathname.slice(0, -1)
      : url.pathname;
    return isLocal && protectedPortalPaths.has(normalizedPath)
      ? `${normalizedPath}${url.search}${url.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
