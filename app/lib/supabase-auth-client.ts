"use client";

import { getSharedSupabaseBrowserAuthClient } from "@/app/lib/supabase-browser-auth-client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseAuthStorageKey = "johai-auth-session";

export function isSupabaseAuthConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabaseAuthClient() {
  if (!isSupabaseAuthConfigured()) {
    throw new Error("Supabase Auth is not configured.");
  }

  return getSharedSupabaseBrowserAuthClient({
    storageKey: supabaseAuthStorageKey,
    supabaseAnonKey,
    supabaseUrl,
  });
}

export function getAuthRedirectUrl(path = "/auth/callback") {
  if (typeof window === "undefined") {
    return path;
  }

  return `${window.location.origin}${path}`;
}
