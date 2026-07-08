import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import {
  getCalendlyMe,
  getCalendlySettings,
  maskSecret,
  upsertCalendlySettings,
} from "@/app/lib/calendly";

type SettingsBody = {
  calendly_pat?: string;
  default_booking_url?: string;
  webhook_signing_key?: string;
};

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function GET() {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getCalendlySettings();

  return NextResponse.json({
    calendly_pat_set: Boolean(settings?.calendly_pat),
    calendly_pat_masked: maskSecret(settings?.calendly_pat),
    calendly_user_uri: settings?.calendly_user_uri ?? "",
    calendly_account_name: settings?.calendly_account_name ?? "",
    calendly_account_email: settings?.calendly_account_email ?? "",
    calendly_connected: Boolean(
      settings?.calendly_pat &&
        settings.calendly_user_uri &&
        settings.calendly_account_email
    ),
    default_booking_url: settings?.default_booking_url ?? "",
    webhook_signing_key_set: Boolean(settings?.webhook_signing_key),
    webhook_signing_key_masked: maskSecret(settings?.webhook_signing_key),
  });
}

export async function PATCH(req: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const current = await getCalendlySettings();
    const body = (await req.json()) as SettingsBody;
    const calendlyPat = clean(body.calendly_pat);
    const webhookSigningKey = clean(body.webhook_signing_key);
    const activeToken = calendlyPat || current?.calendly_pat || "";
    const calendlyMe = calendlyPat ? await getCalendlyMe(calendlyPat) : null;

    if (calendlyPat && !calendlyMe) {
      return NextResponse.json(
        { error: "Calendly token could not be validated." },
        { status: 400 }
      );
    }

    const nextSettings = {
      calendly_pat: activeToken,
      calendly_user_uri:
        calendlyMe?.uri || current?.calendly_user_uri || "",
      calendly_account_name:
        calendlyMe?.name || current?.calendly_account_name || "",
      calendly_account_email:
        calendlyMe?.email || current?.calendly_account_email || "",
      default_booking_url:
        clean(body.default_booking_url) ||
        calendlyMe?.scheduling_url ||
        current?.default_booking_url ||
        "",
      webhook_signing_key:
        webhookSigningKey || current?.webhook_signing_key || "",
    };

    if (!nextSettings.default_booking_url.startsWith("https://")) {
      return NextResponse.json(
        { error: "Default Booking URL must start with https://" },
        { status: 400 }
      );
    }

    const saved = await upsertCalendlySettings(nextSettings);

    return NextResponse.json({
      success: true,
      calendly_pat_set: Boolean(saved.calendly_pat),
      calendly_pat_masked: maskSecret(saved.calendly_pat),
      calendly_user_uri: saved.calendly_user_uri,
      calendly_account_name: saved.calendly_account_name,
      calendly_account_email: saved.calendly_account_email,
      calendly_connected: Boolean(
        saved.calendly_pat &&
          saved.calendly_user_uri &&
          saved.calendly_account_email
      ),
      default_booking_url: saved.default_booking_url,
      webhook_signing_key_set: Boolean(saved.webhook_signing_key),
      webhook_signing_key_masked: maskSecret(saved.webhook_signing_key),
    });
  } catch (error) {
    console.error("Calendly settings save failed:", error);

    return NextResponse.json(
      { error: "Calendly settings could not be saved." },
      { status: 500 }
    );
  }
}
