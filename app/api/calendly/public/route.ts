import { NextResponse } from "next/server";
import { getPublicCalendlySettings } from "@/app/lib/calendly";

export async function GET() {
  const settings = await getPublicCalendlySettings();

  return NextResponse.json(settings);
}
