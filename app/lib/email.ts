import "server-only";

import { getPublicCalendlySettings } from "@/app/lib/calendly";

type QualifiedLeadEmailData = {
  id: string;
  first_name: string;
  email: string;
  business_name: string;
  business_type: string;
  biggest_problem: string;
  ai_recommendations?: string;
};

type FollowUpLeadEmailData = QualifiedLeadEmailData & {
  follow_up_count?: number;
};

type EmailResult = {
  ownerEmailSent: boolean;
  prospectEmailSent: boolean;
  emailError: string;
};

const resendApiUrl = "https://api.resend.com/emails";

function getEmailConfig() {
  return {
    resendApiKey: process.env.RESEND_API_KEY?.trim() ?? "",
    fromEmail: process.env.JOHAI_FROM_EMAIL?.trim() ?? "",
    ownerEmail: process.env.JOHAI_OWNER_EMAIL?.trim() ?? "",
  };
}

async function sendResendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { resendApiKey, fromEmail } = getEmailConfig();

  if (!resendApiKey || !fromEmail) {
    throw new Error("Resend email environment variables are missing.");
  }

  const res = await fetch(resendApiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to,
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || "Resend email request failed.");
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendQualifiedLeadEmails({
  lead,
  crmUrl,
}: {
  lead: QualifiedLeadEmailData;
  crmUrl: string;
}): Promise<EmailResult> {
  const { ownerEmail } = getEmailConfig();
  const { defaultBookingUrl } = await getPublicCalendlySettings();
  const errors: string[] = [];
  let ownerEmailSent = false;
  let prospectEmailSent = false;

  if (!ownerEmail) {
    errors.push("JOHAI_OWNER_EMAIL is missing.");
  }

  const leadSummary = `
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(lead.first_name)}</li>
      <li><strong>Email:</strong> ${escapeHtml(lead.email)}</li>
      <li><strong>Business:</strong> ${escapeHtml(lead.business_name)}</li>
      <li><strong>Business Type:</strong> ${escapeHtml(lead.business_type)}</li>
      <li><strong>Problem:</strong> ${escapeHtml(lead.biggest_problem)}</li>
    </ul>
  `;

  if (ownerEmail) {
    try {
      await sendResendEmail({
        to: ownerEmail,
        subject: `New JOHAI qualified lead: ${lead.business_name}`,
        html: `
          <h2>New qualified lead</h2>
          ${leadSummary}
          <p><a href="${escapeHtml(crmUrl)}">Open this lead in JOHAI CRM</a></p>
        `,
      });
      ownerEmailSent = true;
    } catch (error) {
      console.error("Owner email failed:", error);
      errors.push("Owner email failed.");
    }
  }

  try {
    await sendResendEmail({
      to: lead.email,
      subject: "Your JOHAI AI Automation Audit request",
      html: `
        <h2>Thanks, ${escapeHtml(lead.first_name)}.</h2>
        <p>We received your request for a personalized JOHAI AI Automation Audit.</p>
        <h3>Your request summary</h3>
        ${leadSummary}
        <p><strong>AI audit focus:</strong></p>
        <p>${escapeHtml(lead.ai_recommendations || lead.biggest_problem)}</p>
        <p><a href="${escapeHtml(defaultBookingUrl)}">Book your free AI audit</a></p>
      `,
    });
    prospectEmailSent = true;
  } catch (error) {
    console.error("Prospect email failed:", error);
    errors.push("Prospect email failed.");
  }

  return {
    ownerEmailSent,
    prospectEmailSent,
    emailError: errors.join(" "),
  };
}

export async function sendFollowUpEmail({
  lead,
  reminderNumber,
}: {
  lead: FollowUpLeadEmailData;
  reminderNumber: 1 | 2 | 3;
}) {
  const { defaultBookingUrl } = await getPublicCalendlySettings();
  const subject =
    reminderNumber === 3
      ? "Final reminder: book your JOHAI AI audit"
      : `Reminder ${reminderNumber}: book your JOHAI AI audit`;
  const heading =
    reminderNumber === 3
      ? "Last reminder to book your free AI audit"
      : "Quick reminder to book your free AI audit";

  await sendResendEmail({
    to: lead.email,
    subject,
    html: `
      <h2>${heading}</h2>
      <p>Hi ${escapeHtml(lead.first_name)},</p>
      <p>You requested a JOHAI AI Automation Audit for ${escapeHtml(
        lead.business_name
      )}. The audit helps identify practical ways to automate follow-up, booking, lead qualification, customer support, and repetitive workflows.</p>
      <p><strong>Your main focus:</strong> ${escapeHtml(
        lead.biggest_problem
      )}</p>
      <p><a href="${escapeHtml(
        defaultBookingUrl
      )}">Book your free AI audit here</a></p>
      <p>Talk soon,<br />JOHAI</p>
    `,
  });
}
