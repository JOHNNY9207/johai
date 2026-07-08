import "server-only";

import { createSupabaseServerClient } from "@/app/lib/supabase";

export type CalendlySettings = {
  id?: string;
  calendly_pat: string;
  calendly_user_uri: string;
  calendly_account_name: string;
  calendly_account_email: string;
  default_booking_url: string;
  webhook_signing_key: string;
};

export type PublicCalendlySettings = {
  defaultBookingUrl: string;
};

const fallbackBookingUrl = "https://calendly.com/";

export function maskSecret(value?: string | null) {
  if (!value) {
    return "";
  }

  if (value.length <= 8) {
    return "********";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export async function getCalendlySettings() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("calendly_settings")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Calendly settings load failed:", error.message);
    return null;
  }

  return (data ?? null) as CalendlySettings | null;
}

export async function getPublicCalendlySettings(): Promise<PublicCalendlySettings> {
  const settings = await getCalendlySettings();

  return {
    defaultBookingUrl:
      settings?.default_booking_url?.trim() || fallbackBookingUrl,
  };
}

export async function upsertCalendlySettings(
  settings: Partial<CalendlySettings>
) {
  const supabase = createSupabaseServerClient();
  const current = await getCalendlySettings();
  const payload = {
    ...settings,
    updated_at: new Date().toISOString(),
  };

  if (current?.id) {
    const { data, error } = await supabase
      .from("calendly_settings")
      .update(payload)
      .eq("id", current.id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as CalendlySettings;
  }

  const { data, error } = await supabase
    .from("calendly_settings")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CalendlySettings;
}

export type CalendlyMe = {
  uri: string;
  name: string;
  email: string;
  scheduling_url?: string;
};

export async function getCalendlyMe(token: string): Promise<CalendlyMe | null> {
  const res = await fetch("https://api.calendly.com/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as {
    resource?: Partial<CalendlyMe>;
  };

  if (!data.resource?.uri || !data.resource?.email) {
    return null;
  }

  return {
    uri: data.resource.uri,
    name: data.resource.name ?? "",
    email: data.resource.email,
    scheduling_url: data.resource.scheduling_url,
  };
}
