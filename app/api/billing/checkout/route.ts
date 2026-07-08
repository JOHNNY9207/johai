import { NextResponse } from "next/server";
import {
  createStripeBillingProvider,
  isPublicBillingCycle,
  isPublicBillingPlan,
} from "@/app/lib/stripe-billing";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      plan?: unknown;
      billingCycle?: unknown;
    };

    if (!isPublicBillingPlan(body.plan) || !isPublicBillingCycle(body.billingCycle)) {
      return NextResponse.json(
        { error: "Invalid checkout selection." },
        { status: 400 }
      );
    }

    const stripe = createStripeBillingProvider();
    const result = await stripe.createCheckoutSession({
      plan: body.plan,
      billingCycle: body.billingCycle,
    });

    if (!result.configured) {
      return NextResponse.json(
        { error: "Checkout is not configured yet." },
        { status: 503 }
      );
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("Checkout creation failed", error);

    return NextResponse.json(
      { error: "Checkout is not available right now." },
      { status: 500 }
    );
  }
}
