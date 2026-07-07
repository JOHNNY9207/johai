import { NextResponse } from "next/server";
import {
  createSupabaseServerClient,
  leadStatuses,
  type LeadStatus,
} from "@/app/lib/supabase";
import { isDashboardAuthenticated } from "@/app/lib/dashboard-auth";

type UpdateLeadBody = {
  status?: string;
  notes?: string;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function isLeadStatus(value: string): value is LeadStatus {
  return leadStatuses.includes(value as LeadStatus);
}

export async function PATCH(req: Request, context: RouteContext) {
  if (!(await isDashboardAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body = (await req.json()) as UpdateLeadBody;
    const updates: {
      status?: LeadStatus;
      notes?: string;
    } = {};

    if (typeof body.status === "string") {
      if (!isLeadStatus(body.status)) {
        return NextResponse.json(
          { error: "Invalid lead status." },
          { status: 400 }
        );
      }

      updates.status = body.status;
    }

    if (typeof body.notes === "string") {
      updates.notes = body.notes.trim();
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid lead updates were provided." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("leads")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Lead update failed:", error.message);

      return NextResponse.json(
        { error: "Lead could not be updated." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lead: data });
  } catch (error) {
    console.error("Lead update route error:", error);

    return NextResponse.json(
      { error: "Lead could not be updated." },
      { status: 500 }
    );
  }
}
