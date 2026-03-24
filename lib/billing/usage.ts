import { createSupabaseServerClient } from "@/lib/supabase/server";

import type { Entitlements } from "@/lib/plans";

export function currentPeriodYm(): string {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export async function getChatUsageCount(userId: string, periodYm: string): Promise<number> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("usage_counters")
      .select("count")
      .eq("user_id", userId)
      .eq("period_ym", periodYm)
      .eq("metric", "chat_user_messages")
      .maybeSingle();
    if (error) return 0;
    return data?.count ?? 0;
  } catch {
    return 0;
  }
}

export async function incrementChatUserMessageUsage() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("increment_usage_counter", { p_metric: "chat_user_messages" });
  if (error) throw new Error(error.message);
  return typeof data === "number" ? data : Number(data);
}

export function chatQuotaExceeded(ent: Entitlements, used: number): boolean {
  if (!Number.isFinite(ent.maxChatUserMessagesPerMonth)) return false;
  return used >= ent.maxChatUserMessagesPerMonth;
}

export function journalQuotaExceeded(ent: Entitlements, used: number): boolean {
  if (!Number.isFinite(ent.maxJournalEntriesPerMonth)) return false;
  return used >= ent.maxJournalEntriesPerMonth;
}

export function moodQuotaExceeded(ent: Entitlements, used: number): boolean {
  if (!Number.isFinite(ent.maxMoodLogsPerMonth)) return false;
  return used >= ent.maxMoodLogsPerMonth;
}
