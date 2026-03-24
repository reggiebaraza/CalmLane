import { PLAN_IDS } from "@/lib/plans";

export type CustomerSubscriptionRow = {
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

/**
 * Derives whether the user should receive Premium entitlements.
 * past_due: keep access (Stripe retries billing; user-facing banner in settings).
 * canceled: keep until current_period_end when present and still in the future.
 */
export function subscriptionGrantsPremium(row: CustomerSubscriptionRow | null): boolean {
  if (!row) return false;
  if (row.plan !== PLAN_IDS.PREMIUM_MONTHLY) return false;

  const status = row.status;
  if (status === "active" || status === "trialing" || status === "past_due") {
    return true;
  }

  if (status === "canceled" && row.current_period_end) {
    return new Date(row.current_period_end).getTime() > Date.now();
  }

  return false;
}

export function displayPlanLabel(row: CustomerSubscriptionRow | null, isPremium: boolean): string {
  if (isPremium) return "Premium";
  return "Free";
}

export function subscriptionStatusForUi(row: CustomerSubscriptionRow | null): string {
  if (!row || row.status === "none") return "Free";
  return row.status;
}
