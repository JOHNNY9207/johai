import "server-only";

import { isCustomerPortalDemoAvailable } from "@/app/lib/customer-portal-demo-guard";

export const dynamic = "force-dynamic";

const fixtureFiles = {
  "preparation-guide": {
    filename: "harbor-dental-preparation-guide.txt",
    content: [
      "HARBOR DENTAL STUDIO",
      "Fictional preparation guide",
      "",
      "Please arrive 10 minutes early for your fictional pilot appointment.",
      "Bring a fictional insurance card and a current medication list for the demonstration.",
      "",
      "This generated development-only placeholder contains no production, clinical, payment, or personal data.",
      "",
    ].join("\n"),
  },
  "care-summary": {
    filename: "harbor-dental-care-summary.txt",
    content: [
      "HARBOR DENTAL STUDIO",
      "Fictional customer-visible care summary",
      "",
      "This placeholder demonstrates an acknowledged shared document in the Customer Portal pilot.",
      "It is not medical advice and does not contain production, clinical, payment, or personal data.",
      "",
    ].join("\n"),
  },
} as const;

export async function GET(
  _request: Request,
  context: { params: Promise<{ name: string }> }
) {
  if (!isCustomerPortalDemoAvailable()) {
    return new Response("Not found.", { status: 404 });
  }

  const { name } = await context.params;
  const fixture = fixtureFiles[name as keyof typeof fixtureFiles];

  if (!fixture) return new Response("Not found.", { status: 404 });

  return new Response(fixture.content, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "Content-Disposition": `attachment; filename="${fixture.filename}"`,
      "Content-Security-Policy": "default-src 'none'",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
