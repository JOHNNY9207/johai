"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function isSupabaseAuthConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function createSupabaseAuthClient() {
  if (!isSupabaseAuthConfigured()) {
    throw new Error("Supabase Auth is not configured.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storageKey: "johai-auth-session",
    },
  });
}

export function getAuthRedirectUrl(path = "/auth/callback") {
  if (typeof window === "undefined") {
    return path;
  }

  return `${window.location.origin}${path}`;
}
