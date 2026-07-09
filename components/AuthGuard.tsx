"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const { configured, loading, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!configured || loading || user) return;

    router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
  }, [configured, loading, pathname, router, user]);

  if (!configured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-orange-50 px-5 text-slate-950">
        <div className="max-w-lg rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
          <ShieldCheck className="text-cyan-700" size={32} />
          <h1 className="mt-5 text-3xl font-semibold">Authentication is not configured yet.</h1>
          <p className="mt-3 leading-7 text-slate-600">
            Add the Supabase public auth variables, then restart the app. No secrets should be placed in client code.
          </p>
          <Link href="/" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">
            Back home
          </Link>
        </div>
      </main>
    );
  }

  if (loading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050812] px-5 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-sm font-semibold text-slate-200 backdrop-blur-xl">
          Checking your JOHAI session...
        </div>
      </main>
    );
  }

  return children;
}
