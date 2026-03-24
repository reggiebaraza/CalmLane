import type Stripe from "stripe";

import { PLAN_IDS } from "@/lib/plans";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

function premiumPriceId(): string | null {
  return env.STRIPE_PRICE_PREMIUM_MONTHLY ?? null;
}

function planFromSubscription(sub: Stripe.Subscription): typeof PLAN_IDS.FREE | typeof PLAN_IDS.PREMIUM_MONTHLY {
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const expected = premiumPriceId();
  if (expected && priceId === expected) return PLAN_IDS.PREMIUM_MONTHLY;
  return PLAN_IDS.FREE;
}

function normalizeStatus(status: Stripe.Subscription.Status): string {
  return status;
}

export async function resolveUserIdForStripeSubscription(
  sub: Stripe.Subscription,
  admin: ReturnType<typeof createSupabaseAdminClient>,
): Promise<string | null> {
  const meta = sub.metadata?.supabase_user_id;
  if (meta && typeof meta === "string") return meta;

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  if (!customerId) return null;

  const { data } = await admin
    .from("customer_subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  return data?.user_id ?? null;
}

export async function syncStripeSubscriptionToSupabase(sub: Stripe.Subscription, overrideUserId?: string) {
  const admin = createSupabaseAdminClient();
  const userId = overrideUserId ?? (await resolveUserIdForStripeSubscription(sub, admin));
  if (!userId) {
    console.error("[stripe sync] missing supabase_user_id for subscription", sub.id);
    return;
  }

  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id;
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const plan = planFromSubscription(sub);

  const row = {
    user_id: userId,
    stripe_customer_id: customerId ?? null,
    stripe_subscription_id: sub.id,
    stripe_price_id: priceId,
    plan,
    status: normalizeStatus(sub.status),
    current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
    current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
    cancel_at_period_end: sub.cancel_at_period_end,
  };

  const { error } = await admin.from("customer_subscriptions").upsert(row, { onConflict: "user_id" });
  if (error) console.error("[stripe sync] upsert failed", error);
}

export async function clearStripeSubscriptionInSupabase(stripeSubscriptionId: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("customer_subscriptions")
    .update({
      stripe_subscription_id: null,
      stripe_price_id: null,
      plan: PLAN_IDS.FREE,
      status: "canceled",
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
    })
    .eq("stripe_subscription_id", stripeSubscriptionId);
  if (error) console.error("[stripe sync] clear subscription failed", error);
}

export async function markSubscriptionPastDue(stripeSubscriptionId: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("customer_subscriptions")
    .update({ status: "past_due" })
    .eq("stripe_subscription_id", stripeSubscriptionId);
  if (error) console.error("[stripe sync] past_due failed", error);
}

export async function syncFromCheckoutSession(session: Stripe.Checkout.Session) {
  const { getStripe } = await import("@/lib/billing/stripe");
  const stripe = getStripe();
  if (!stripe) return;
  const subField = session.subscription;
  if (!subField || session.mode !== "subscription") return;
  const subId = typeof subField === "string" ? subField : subField.id;
  const sub = await stripe.subscriptions.retrieve(subId);
  const ref = session.client_reference_id;
  await syncStripeSubscriptionToSupabase(sub, ref ?? undefined);
}
