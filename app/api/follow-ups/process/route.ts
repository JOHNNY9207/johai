import { NextResponse } from "next/server";
import { sendFollowUpEmail } from "@/app/lib/email";
import { createSupabaseServerClient, type Lead } from "@/app/lib/supabase";

const reminderSchedule = [
  {
    count: 0,
    delayMs: 24 * 60 * 60 * 1000,
    nextStatus: "Reminder 1 sent",
  },
  {
    count: 1,
    delayMs: 72 * 60 * 60 * 1000,
    nextStatus: "Reminder 2 sent",
  },
  {
    count: 2,
    delayMs: 7 * 24 * 60 * 60 * 1000,
    nextStatus: "Final reminder sent",
  },
] as const;

function isDue(lead: Lead, now: Date) {
  const followUpCount = lead.follow_up_count ?? 0;
  const schedule = reminderSchedule.find((item) => item.count === followUpCount);

  if (!schedule || lead.booked_meeting || followUpCount >= 3) {
    return null;
  }

  const baseDate =
    followUpCount === 0
      ? new Date(lead.created_at ?? now)
      : new Date(lead.last_follow_up_at ?? lead.created_at ?? now);

  return now.getTime() - baseDate.getTime() >= schedule.delayMs
    ? schedule
    : null;
}

export async function POST() {
  const supabase = createSupabaseServerClient();
  const now = new Date();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("booked_meeting", false)
    .lt("follow_up_count", 3)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("Follow-up lead fetch failed:", error.message);

    return NextResponse.json(
      { error: "Follow-ups could not be processed." },
      { status: 500 }
    );
  }

  const leads = (data ?? []) as Lead[];
  const results = {
    checked: leads.length,
    sent: 0,
    skipped: 0,
    failed: 0,
  };

  for (const lead of leads) {
    const schedule = isDue(lead, now);

    if (!schedule) {
      results.skipped += 1;
      continue;
    }

    try {
      await sendFollowUpEmail({
        lead,
        reminderNumber: (schedule.count + 1) as 1 | 2 | 3,
      });

      const { error: updateError } = await supabase
        .from("leads")
        .update({
          follow_up_status: schedule.nextStatus,
          follow_up_count: schedule.count + 1,
          last_follow_up_at: now.toISOString(),
          email_error: "",
        })
        .eq("id", lead.id)
        .eq("follow_up_count", schedule.count)
        .eq("booked_meeting", false);

      if (updateError) {
        throw new Error(updateError.message);
      }

      results.sent += 1;
    } catch (error) {
      console.error("Follow-up email failed:", error);
      results.failed += 1;

      await supabase
        .from("leads")
        .update({
          email_error: "Follow-up email failed.",
        })
        .eq("id", lead.id);
    }
  }

  return NextResponse.json({ success: true, ...results });
}

export async function GET() {
  return POST();
}
