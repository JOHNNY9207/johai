import crypto from "node:crypto";

export type PublicBillingPlan = "starter" | "professional" | "enterprise";
export type PublicBillingCycle = "monthly" | "yearly";

type CheckoutSessionInput = {
  plan: PublicBillingPlan;
  billingCycle: PublicBillingCycle;
};

type StripeProviderDependencies = {
  fetcher?: typeof fetch;
  env?: NodeJS.ProcessEnv;
};

const stripePriceEnv: Record<PublicBillingPlan, Record<PublicBillingCycle, string>> = {
  starter: {
    monthly: "STRIPE_PRICE_STARTER_MONTHLY",
    yearly: "STRIPE_PRICE_STARTER_YEARLY",
  },
  professional: {
    monthly: "STRIPE_PRICE_PROFESSIONAL_MONTHLY",
    yearly: "STRIPE_PRICE_PROFESSIONAL_YEARLY",
  },
  enterprise: {
    monthly: "STRIPE_PRICE_ENTERPRISE_MONTHLY",
    yearly: "STRIPE_PRICE_ENTERPRISE_YEARLY",
  },
};

export function isPublicBillingPlan(plan: unknown): plan is PublicBillingPlan {
  return plan === "starter" || plan === "professional" || plan === "enterprise";
}

export function isPublicBillingCycle(cycle: unknown): cycle is PublicBillingCycle {
  return cycle === "monthly" || cycle === "yearly";
}

export class StripeBillingProvider {
  private readonly fetcher: typeof fetch;
  private readonly env: NodeJS.ProcessEnv;

  constructor(dependencies: StripeProviderDependencies = {}) {
    this.fetcher = dependencies.fetcher ?? fetch;
    this.env = dependencies.env ?? process.env;
  }

  isConfigured(input: CheckoutSessionInput) {
    return Boolean(
      this.env.STRIPE_SECRET_KEY &&
        this.env.NEXT_PUBLIC_APP_URL &&
        this.getPriceId(input.plan, input.billingCycle)
    );
  }

  getPriceId(plan: PublicBillingPlan, billingCycle: PublicBillingCycle) {
    return this.env[stripePriceEnv[plan][billingCycle]];
  }

  async createCheckoutSession(input: CheckoutSessionInput) {
    const secretKey = this.env.STRIPE_SECRET_KEY;
    const appUrl = this.env.NEXT_PUBLIC_APP_URL;
    const priceId = this.getPriceId(input.plan, input.billingCycle);

    if (!secretKey || !appUrl || !priceId) {
      return { configured: false as const };
    }

    const body = new URLSearchParams({
      mode: "subscription",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      success_url: `${appUrl}/start/company?plan=${input.plan}&checkout=success`,
      cancel_url: `${appUrl}/pricing/${input.plan}?checkout=cancelled`,
      "metadata[plan]": input.plan,
      "metadata[billingCycle]": input.billingCycle,
      allow_promotion_codes: "true",
    });

    const response = await this.fetcher("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!response.ok) {
      throw new Error("Stripe checkout session creation failed");
    }

    const data = (await response.json()) as { url?: string };

    if (!data.url) {
      throw new Error("Stripe checkout session did not return a URL");
    }

    return { configured: true as const, url: data.url };
  }
}

export function createStripeBillingProvider(dependencies?: StripeProviderDependencies) {
  return new StripeBillingProvider(dependencies);
}

export function verifyStripeSignature({
  payload,
  signatureHeader,
  webhookSecret,
  toleranceSeconds = 300,
}: {
  payload: string;
  signatureHeader: string | null;
  webhookSecret: string;
  toleranceSeconds?: number;
}) {
  if (!signatureHeader) {
    return false;
  }

  const parts = Object.fromEntries(
    signatureHeader.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key, value];
    })
  );
  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) {
    return false;
  }

  const timestampNumber = Number(timestamp);

  if (!Number.isFinite(timestampNumber)) {
    return false;
  }

  const age = Math.abs(Date.now() / 1000 - timestampNumber);

  if (age > toleranceSeconds) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}
