import { redirect } from "next/navigation";
import {
  authenticateDashboard,
  getDashboardSetupError,
  isDashboardAuthenticated,
  isDashboardPasswordConfigured,
} from "@/app/lib/dashboard-auth";

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

async function login(formData: FormData) {
  "use server";

  const password = String(formData.get("password") ?? "");
  const result = await authenticateDashboard(password);

  if (result.ok) {
    redirect("/dashboard");
  }

  if (result.reason === "missing-password") {
    redirect("/dashboard/login?error=setup");
  }

  redirect("/dashboard/login?error=invalid");
}

export default async function DashboardLogin({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const passwordConfigured = isDashboardPasswordConfigured();

  if (passwordConfigured && (await isDashboardAuthenticated())) {
    redirect("/dashboard");
  }

  const setupError = !passwordConfigured || params?.error === "setup";
  const invalidPassword = params?.error === "invalid";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08111f] px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111827] p-8 shadow-2xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">
            JOHAI CRM
          </p>
          <h1 className="text-3xl font-bold">Admin Login</h1>
          <p className="mt-3 text-sm leading-6 text-gray-300">
            Enter the dashboard password to view captured leads.
          </p>
        </div>

        {setupError && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm leading-6 text-red-200">
            {getDashboardSetupError()}
          </div>
        )}

        {invalidPassword && !setupError && (
          <div className="mb-6 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-100">
            The password is incorrect. Please try again.
          </div>
        )}

        <form action={login} className="space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-gray-200">
              Password
            </span>
            <input
              name="password"
              type="password"
              required
              disabled={!passwordConfigured}
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Dashboard password"
            />
          </label>

          <button
            type="submit"
            disabled={!passwordConfigured}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-bold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-900 disabled:text-blue-200"
          >
            Log In
          </button>
        </form>
      </div>
    </main>
  );
}
