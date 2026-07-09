import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import { createSupabaseServerClient } from "@/app/lib/supabase";

export async function POST(request: Request) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    email?: string;
    role?: string;
  } | null;
  const email = body?.email?.trim().toLowerCase();
  const role = body?.role?.trim() || "member";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const origin = new URL(request.url).origin;
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      role,
      invited_to: "JOHAI",
    },
    redirectTo: `${origin}/auth/welcome`,
  });

  if (error) {
    console.error("Team invite failed", error.message);
    return NextResponse.json({ error: "Could not send invitation right now." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
