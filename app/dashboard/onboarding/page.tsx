import { redirect } from "next/navigation";
import {
  getDashboardSetupError,
  isDashboardAuthenticated,
  isDashboardPasswordConfigured,
} from "@/app/lib/dashboard-auth";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  type Business,
  type BusinessSettings,
} from "@/app/lib/supabase";
import OnboardingClient from "./OnboardingClient";

export const dynamic = "force-dynamic";

export default async function DashboardOnboarding() {
  if (!isDashboardPasswordConfigured()) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08111f] px-6 py-12 text-white">
        <div className="w-full max-w-xl rounded-2xl border border-red-500/30 bg-[#111827] p-8 shadow-2xl">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
            Setup Required
          </p>
          <h1 className="text-3xl font-bold">Dashboard password missing</h1>
          <p className="mt-4 leading-7 text-gray-300">
            {getDashboardSetupError()}
          </p>
        </div>
      </main>
    );
  }

  if (!(await isDashboardAuthenticated())) {
    redirect("/dashboard/login");
  }

  const supabase = createSupabaseServerClient();

  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("id", DEFAULT_BUSINESS_ID)
    .single();

  const { data: existingSettings } = await supabase
    .from("business_settings")
    .select("*")
    .eq("business_id", DEFAULT_BUSINESS_ID)
    .maybeSingle();

  let settings = existingSettings as BusinessSettings | null;

  if (!settings) {
    const { data: createdSettings } = await supabase
      .from("business_settings")
      .insert({
        business_id: DEFAULT_BUSINESS_ID,
        ai_assistant_name: "JOHAI",
        onboarding_status: "not_started",
      })
      .select("*")
      .single();

    settings = createdSettings as BusinessSettings | null;
  }

  return (
    <OnboardingClient
      business={business as Business}
      settings={settings}
    />
  );
}
