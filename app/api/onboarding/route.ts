import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  onboardingStatuses,
  type Business,
  type BusinessSettings,
  type OnboardingStatus,
} from "@/app/lib/supabase";

type OnboardingPayload = {
  onboarding_status?: OnboardingStatus;
  company_profile?: Record<string, unknown>;
  ai_assistant_config?: Record<string, unknown>;
  services_config?: Record<string, unknown>;
  communication_config?: Record<string, unknown>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeRecord(value: unknown) {
  return isRecord(value) ? value : {};
}

function normalizeStatus(value: unknown): OnboardingStatus {
  return onboardingStatuses.includes(value as OnboardingStatus)
    ? (value as OnboardingStatus)
    : "in_progress";
}

async function getDefaultBusinessAndSettings() {
  const supabase = createSupabaseServerClient();

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", DEFAULT_BUSINESS_ID)
    .single();

  if (businessError) {
    throw businessError;
  }

  const { data: existingSettings, error: settingsError } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .maybeSingle();

  if (settingsError) {
    throw settingsError;
  }

  if (existingSettings) {
    return {
      business: business as Business,
      settings: existingSettings as BusinessSettings,
    };
  }

  const { data: createdSettings, error: createError } = await supabase
    .from("business_settings")
    .insert({
      business_id: DEFAULT_BUSINESS_ID,
      ai_assistant_name: "JOHAI",
      onboarding_status: "not_started",
    })
    .select("*")
    .single();

  if (createError) {
    throw createError;
  }

  return {
    business: business as Business,
    settings: createdSettings as BusinessSettings,
  };
}

export async function GET() {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await getDefaultBusinessAndSettings();

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Onboarding settings could not be loaded." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as OnboardingPayload;
    const companyProfile = normalizeRecord(body.company_profile);
    const aiAssistantConfig = normalizeRecord(body.ai_assistant_config);
    const servicesConfig = normalizeRecord(body.services_config);
    const communicationConfig = normalizeRecord(body.communication_config);
    const onboardingStatus = normalizeStatus(body.onboarding_status);
    const businessName =
      typeof companyProfile.businessName === "string"
        ? companyProfile.businessName.trim()
        : "";

    const supabase = createSupabaseServerClient();

    if (businessName) {
      await supabase
        .from("businesses")
        .update({
          name: businessName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", DEFAULT_BUSINESS_ID);
    }

    const updatePayload = {
      business_id: DEFAULT_BUSINESS_ID,
      onboarding_status: onboardingStatus,
      company_profile: companyProfile,
      ai_assistant_config: aiAssistantConfig,
      services_config: servicesConfig,
      communication_config: communicationConfig,
      booking_url:
        typeof communicationConfig.bookingUrl === "string"
          ? communicationConfig.bookingUrl
          : "",
      ai_assistant_name:
        typeof aiAssistantConfig.assistantName === "string" &&
        aiAssistantConfig.assistantName.trim()
          ? aiAssistantConfig.assistantName.trim()
          : "JOHAI",
      onboarding_completed_at:
        onboardingStatus === "completed" ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    };

    const { data: settings, error } = await supabase
      .from("business_settings")
      .upsert(updatePayload, { onConflict: "business_id" })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const { data: business } = await supabase
      .from("businesses")
      .select("*")
      .eq("id", DEFAULT_BUSINESS_ID)
      .single();

    return NextResponse.json({
      business: business as Business,
      settings: settings as BusinessSettings,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Onboarding settings could not be saved." },
      { status: 500 }
    );
  }
}
