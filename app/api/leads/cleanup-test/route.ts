import { NextResponse } from "next/server";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";
import { createSupabaseServerClient } from "@/app/lib/supabase";

export async function DELETE() {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("leads")
      .delete()
      .eq("is_test", true)
      .select("id");

    if (error) {
      console.error("Test lead cleanup failed:", error.message);

      return NextResponse.json(
        { error: "Test leads could not be deleted." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedCount: data?.length ?? 0,
    });
  } catch (error) {
    console.error("Test lead cleanup route error:", error);

    return NextResponse.json(
      { error: "Test leads could not be deleted." },
      { status: 500 }
    );
  }
}
