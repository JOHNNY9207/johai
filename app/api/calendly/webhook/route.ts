import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getCalendlySettings } from "@/app/lib/calendly";
import { createSupabaseServerClient } from "@/app/lib/supabase";

type CalendlyWebhookPayload = {
  event?: string;
  payload?: {
    uri?: string;
    email?: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    status?: string;
    scheduled_event?: {
      uri?: string;
      start_time?: string;
      end_time?: string;
      status?: string;
    };
  };
};

function parseSignature(header: string) {
  return header.split(",").reduce(
    (parts, item) => {
      const [key, value] = item.split("=");

      if (key === "t") {
        parts.timestamp = value;
      }

      if (key === "v1") {
        parts.signature = value;
      }

      return parts;
    },
    { timestamp: "", signature: "" }
  );
}

function verifySignature(rawBody: string, header: string, signingKey: string) {
  const { timestamp, signature } = parseSignature(header);

  if (!timestamp || !signature || !signingKey) {
    return false;
  }

  const ageMs = Math.abs(Date.now() - Number(timestamp) * 1000);

  if (!Number.isFinite(ageMs) || ageMs > 5 * 60 * 1000) {
    return false;
  }

  const expected = createHmac("sha256", signingKey)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
  const receivedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function getFirstName(payload: CalendlyWebhookPayload["payload"]) {
  if (payload?.first_name) {
    return payload.first_name;
  }

  return payload?.name?.split(" ")[0] || "Calendly";
}

function formatBookingDate(startTime?: string) {
  if (!startTime) {
    return {
      booking_date: null,
      booking_time: "",
      next_meeting_at: null,
    };
  }

  const date = new Date(startTime);

  return {
    booking_date: date.toISOString().slice(0, 10),
    booking_time: new Intl.DateTimeFormat("en", {
      hour: "numeric",
      minute: "2-digit",
      timeZoneName: "short",
    }).format(date),
    next_meeting_at: date.toISOString(),
  };
}

export async function POST(req: Request) {
  const settings = await getCalendlySettings();
  const signingKey = settings?.webhook_signing_key ?? "";
  const signature =
    req.headers.get("calendly-webhook-signature") ??
    req.headers.get("Calendly-Webhook-Signature") ??
    "";
  const rawBody = await req.text();

  if (!verifySignature(rawBody, signature, signingKey)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const body = JSON.parse(rawBody) as CalendlyWebhookPayload;
    const payload = body.payload;
    const email = payload?.email?.trim().toLowerCase();
    const startTime = payload?.scheduled_event?.start_time;
    const meetingStatus =
      body.event === "invitee.canceled" || payload?.status === "canceled"
        ? "Canceled"
        : "Scheduled";

    if (!email) {
      return NextResponse.json({ success: true, skipped: "missing-email" });
    }

    const bookingFields = {
      status: "Booked",
      source: "Calendly",
      meeting_status: meetingStatus,
      booked_meeting: meetingStatus !== "Canceled",
      follow_up_status:
        meetingStatus === "Canceled" ? "Waiting" : "Meeting booked",
      calendly_event_uri: payload?.scheduled_event?.uri ?? "",
      calendly_invitee_uri: payload?.uri ?? "",
      ...formatBookingDate(startTime),
    };

    const supabase = createSupabaseServerClient();
    const { data: existingLead, error: findError } = await supabase
      .from("leads")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (findError) {
      console.error("Calendly lead lookup failed:", findError.message);

      return NextResponse.json(
        { error: "Lead lookup failed" },
        { status: 500 }
      );
    }

    if (existingLead?.id) {
      const { error } = await supabase
        .from("leads")
        .update(bookingFields)
        .eq("id", existingLead.id);

      if (error) {
        console.error("Calendly lead update failed:", error.message);

        return NextResponse.json(
          { error: "Lead update failed" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, action: "updated" });
    }

    const { error } = await supabase.from("leads").insert({
      first_name: getFirstName(payload),
      email,
      business_name: "Unknown",
      business_type: "Unknown",
      biggest_problem: "Booked through Calendly",
      ai_recommendations: "",
      conversation: [],
      notes: "Automatically created from Calendly booking.",
      ...bookingFields,
    });

    if (error) {
      console.error("Calendly lead create failed:", error.message);

      return NextResponse.json(
        { error: "Lead create failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, action: "created" });
  } catch (error) {
    console.error("Calendly webhook failed:", error);

    return NextResponse.json(
      { error: "Webhook could not be processed" },
      { status: 500 }
    );
  }
}
