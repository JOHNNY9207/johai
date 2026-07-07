import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase";

type LeadRequestBody = {
  first_name?: string;
  email?: string;
  business_name?: string;
  business_type?: string;
  biggest_problem?: string;
  ai_recommendations?: string;
  conversation?: unknown;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(req: Request) {
  try {
    const supabase = createSupabaseServerClient();
    const body = (await req.json()) as LeadRequestBody;

    const lead = {
      first_name: cleanValue(body.first_name),
      email: cleanValue(body.email).toLowerCase(),
      business_name: cleanValue(body.business_name),
      business_type: cleanValue(body.business_type),
      biggest_problem: cleanValue(body.biggest_problem),
      ai_recommendations: cleanValue(body.ai_recommendations),
      conversation: body.conversation ?? [],
    };

    const missingFields = [
      "first_name",
      "email",
      "business_name",
      "business_type",
      "biggest_problem",
    ].filter((field) => !lead[field as keyof typeof lead]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: "Lead is incomplete.",
          missingFields,
        },
        { status: 400 }
      );
    }

    if (!emailPattern.test(lead.email)) {
      return NextResponse.json(
        {
          error: "Email address is invalid.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .insert(lead)
      .select()
      .single();

    if (error) {
      console.error("Lead save failed:", error.message);

      return NextResponse.json(
        {
          error: "Lead could not be saved.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, lead: data });
  } catch (error) {
    console.error("Lead route error:", error);

    return NextResponse.json(
      {
        error: "Lead could not be saved.",
      },
      { status: 500 }
    );
  }
}
