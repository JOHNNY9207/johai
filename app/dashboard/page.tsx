import { redirect } from "next/navigation";
import {
  getDashboardSetupError,
  isDashboardAuthenticated,
  isDashboardPasswordConfigured,
} from "@/app/lib/dashboard-auth";
import {
  createSupabaseServerClient,
  type Business,
  type Lead,
} from "@/app/lib/supabase";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
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

  const { data: leads, error } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .order("created_at", { ascending: true });

  const leadList = (leads ?? []) as Lead[];
  const businessList = (businesses ?? []) as Business[];

  return (
    <DashboardClient
      leads={leadList}
      businesses={businessList}
      loadError={Boolean(error)}
    />
  );
}
