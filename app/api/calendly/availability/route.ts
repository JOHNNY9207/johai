import { NextResponse } from "next/server";
import { getCalendlyAvailability } from "@/app/lib/calendly";

export async function GET() {
  try {
    const availability = await getCalendlyAvailability();

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Calendly availability failed:", error);

    return NextResponse.json(
      {
        connected: false,
        bookingUrl: "https://calendly.com/",
        times: [],
        message:
          "Calendly availability could not be loaded. Please use the booking button to choose a time.",
      },
      { status: 200 }
    );
  }
}
