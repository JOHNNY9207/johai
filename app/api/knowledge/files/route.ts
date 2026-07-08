import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import {
  createSupabaseServerClient,
  DEFAULT_BUSINESS_ID,
  type KnowledgeFile,
} from "@/app/lib/supabase";

export async function GET() {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();

    // The business filter is mandatory; this endpoint never returns cross-tenant files.
    const { data, error } = await supabase
      .from("knowledge_files")
      .select("*")
      .eq("business_id", DEFAULT_BUSINESS_ID)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ files: (data ?? []) as KnowledgeFile[] });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Knowledge files could not be loaded." },
      { status: 500 }
    );
  }
}
