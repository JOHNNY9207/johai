import "server-only";

import {
  DEFAULT_BUSINESS_ID,
  createSupabaseServerClient,
} from "@/app/lib/supabase";

export type CalendlySettings = {
  id?: string;
  business_id?: string;
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

export type CalendlyAvailableTime = {
  startTime: string;
  schedulingUrl: string;
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
    .eq("business_id", DEFAULT_BUSINESS_ID)
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
    business_id: DEFAULT_BUSINESS_ID,
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

async function calendlyFetch<T>(path: string, token: string) {
  const res = await fetch(`https://api.calendly.com${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as T;
}

export async function getCalendlyAvailability() {
  const settings = await getCalendlySettings();
  const bookingUrl = settings?.default_booking_url?.trim() || fallbackBookingUrl;

  if (!settings?.calendly_pat || !settings.calendly_user_uri) {
    return {
      connected: false,
      bookingUrl,
      times: [] as CalendlyAvailableTime[],
      message:
        "Calendly is not connected yet. Please use the booking button to choose a time.",
    };
  }

  const eventTypes = await calendlyFetch<{
    collection?: Array<{
      uri?: string;
      active?: boolean;
      scheduling_url?: string;
    }>;
  }>(
    `/event_types?${new URLSearchParams({
      user: settings.calendly_user_uri,
      active: "true",
    }).toString()}`,
    settings.calendly_pat
  );
  const eventType = eventTypes?.collection?.find(
    (item) => item.active !== false && item.uri
  );

  if (!eventType?.uri) {
    return {
      connected: true,
      bookingUrl,
      times: [] as CalendlyAvailableTime[],
      message:
        "Calendly is connected, but no active event type is available. Please use the booking button to choose a time.",
    };
  }

  const start = new Date();
  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  const availableTimes = await calendlyFetch<{
    collection?: Array<{
      start_time?: string;
      scheduling_url?: string;
    }>;
  }>(
    `/event_type_available_times?${new URLSearchParams({
      event_type: eventType.uri,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
    }).toString()}`,
    settings.calendly_pat
  );

  const times =
    availableTimes?.collection
      ?.filter((item) => item.start_time)
      .slice(0, 5)
      .map((item) => ({
        startTime: item.start_time!,
        schedulingUrl:
          item.scheduling_url || eventType.scheduling_url || bookingUrl,
      })) ?? [];

  return {
    connected: true,
    bookingUrl,
    times,
    message:
      times.length > 0
        ? "Calendly availability loaded."
        : "Calendly is connected, but no available times were returned for the next 7 days. Please use the booking button to choose a time.",
  };
}
