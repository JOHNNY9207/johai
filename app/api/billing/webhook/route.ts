import { NextResponse } from "next/server";
import { verifyStripeSignature } from "@/app/lib/stripe-billing";

type StripeWebhookEvent = {
  id?: string;
  type?: string;
  data?: {
    object?: {
      id?: string;
      customer?: string;
      subscription?: string;
      metadata?: Record<string, string>;
    };
  };
};

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook is not configured." },
      { status: 503 }
    );
  }

  const payload = await request.text();
  const signatureHeader = request.headers.get("stripe-signature");
  const verified = verifyStripeSignature({
    payload,
    signatureHeader,
    webhookSecret,
  });

  if (!verified) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const event = JSON.parse(payload) as StripeWebhookEvent;

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;

    console.info("Stripe checkout completed", {
      eventId: event.id,
      sessionId: session?.id,
      plan: session?.metadata?.plan,
      billingCycle: session?.metadata?.billingCycle,
      hasCustomer: Boolean(session?.customer),
      hasSubscription: Boolean(session?.subscription),
    });

    // TODO: Store subscription status in Supabase after the business/account
    // ownership model is connected to Stripe customer and subscription IDs.
  }

  return NextResponse.json({ received: true });
}
