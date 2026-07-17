"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type BrowserAuthFlowType = "implicit" | "pkce";

type CachedBrowserAuthClient<T> = {
  configurationKey: string;
  client: T;
};

type BrowserAuthClientCache<T> = Map<string, CachedBrowserAuthClient<T>>;

type SharedBrowserAuthClientOptions = {
  flowType?: BrowserAuthFlowType;
  storageKey: string;
  supabaseAnonKey: string;
  supabaseUrl: string;
};

const browserAuthClientRegistryKey = Symbol.for(
  "johai.supabase.browser-auth-client-registry"
);

type BrowserAuthClientGlobal = typeof globalThis & {
  [browserAuthClientRegistryKey]?: BrowserAuthClientCache<SupabaseClient>;
};

export function getOrCreateCachedBrowserAuthClient<T>({
  cache,
  configurationKey,
  createClient,
  storageKey,
}: {
  cache: BrowserAuthClientCache<T>;
  configurationKey: string;
  createClient: () => T;
  storageKey: string;
}) {
  const cached = cache.get(storageKey);

  if (cached) {
    if (cached.configurationKey !== configurationKey) {
      throw new Error(
        `Conflicting Supabase browser auth configuration for storage key "${storageKey}".`
      );
    }

    return cached.client;
  }

  const client = createClient();
  cache.set(storageKey, { client, configurationKey });
  return client;
}

function getBrowserAuthClientCache() {
  if (typeof window === "undefined") return null;

  const browserGlobal = globalThis as BrowserAuthClientGlobal;
  browserGlobal[browserAuthClientRegistryKey] ??= new Map();
  return browserGlobal[browserAuthClientRegistryKey];
}

export function getSharedSupabaseBrowserAuthClient({
  flowType = "implicit",
  storageKey,
  supabaseAnonKey,
  supabaseUrl,
}: SharedBrowserAuthClientOptions) {
  const createAuthClient = () =>
    createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType,
        persistSession: true,
        storageKey,
      },
    });
  const cache = getBrowserAuthClientCache();

  if (!cache) {
    return createAuthClient();
  }

  return getOrCreateCachedBrowserAuthClient({
    cache,
    configurationKey: JSON.stringify([supabaseUrl, supabaseAnonKey, flowType]),
    createClient: createAuthClient,
    storageKey,
  });
}
