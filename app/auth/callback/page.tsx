"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useAuth();
  const [error, setError] = useState("");
  const next = searchParams.get("next") || "/auth/welcome";

  useEffect(() => {
    const frame = window.requestAnimationFrame(async () => {
      if (!supabase) {
        setError("Authentication is not configured yet.");
        return;
      }

      const { error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        setError(sessionError.message);
        return;
      }

      router.replace(next);
    });

    return () => window.cancelAnimationFrame(frame);
  }, [next, router, supabase]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-orange-50 px-5 text-slate-950">
      <div className="max-w-md rounded-[2rem] border border-white/70 bg-white/80 p-8 text-center shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
        {error ? (
          <>
            <CheckCircle2 className="mx-auto text-amber-500" size={36} />
            <h1 className="mt-5 text-3xl font-semibold">We could not finish sign-in.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
            <Link href="/auth/login" className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-bold text-white">
              Back to login
            </Link>
          </>
        ) : (
          <>
            <Loader2 className="mx-auto animate-spin text-cyan-700" size={36} />
            <h1 className="mt-5 text-3xl font-semibold">Securing your JOHAI session...</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">You will be redirected automatically.</p>
          </>
        )}
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallbackContent />
    </Suspense>
  );
}
