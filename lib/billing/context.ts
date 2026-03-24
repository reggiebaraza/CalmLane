import { createSupabaseServerClient } from "@/lib/supabase/server";

import { entitlementsForPremium } from "@/lib/plans";
import type { Entitlements } from "@/lib/plans";

import type { CustomerSubscriptionRow } from "@/lib/billing/subscription-row";
import { displayPlanLabel, subscriptionGrantsPremium } from "@/lib/billing/subscription-row";
import { currentPeriodYm, getChatUsageCount } from "@/lib/billing/usage";
import { countJournalEntriesUtcMonth, countMoodLogsUtcMonth } from "@/lib/db";

export type BillingContext = {
  subscription: CustomerSubscriptionRow | null;
  isPremium: boolean;
  entitlements: Entitlements;
  usage: {
    periodYm: string;
    chatUserMessages: number;
    journalEntries: number;
    moodLogs: number;
  };
  planLabel: string;
};

export async function getBillingContext(userId: string): Promise<BillingContext> {
  const supabase = await createSupabaseServerClient();
  const { data: subRow, error: subErr } = await supabase
    .from("customer_subscriptions")
    .select(
      "user_id,stripe_customer_id,stripe_subscription_id,stripe_price_id,plan,status,current_period_start,current_period_end,cancel_at_period_end",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (subErr) {
    console.warn("[billing] customer_subscriptions read:", subErr.message);
  }

  const subscription = !subErr && subRow ? (subRow as CustomerSubscriptionRow) : null;
  const isPremium = subscriptionGrantsPremium(subscription);
  const entitlements = entitlementsForPremium(isPremium);
  const periodYm = currentPeriodYm();
  const [chatUserMessages, journalEntries, moodLogs] = await Promise.all([
    getChatUsageCount(userId, periodYm),
    countJournalEntriesUtcMonth(userId),
    countMoodLogsUtcMonth(userId),
  ]);
  const usage = { chatUserMessages, journalEntries, moodLogs };

  return {
    subscription,
    isPremium,
    entitlements,
    usage: { periodYm, ...usage },
    planLabel: displayPlanLabel(subscription, isPremium),
  };
}
