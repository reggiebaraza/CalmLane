/**
 * Single source of truth for plan IDs and entitlements (server + UI).
 * Premium checks must use subscription state from Supabase, not this alone.
 */

export const PLAN_IDS = {
  FREE: "free",
  PREMIUM_MONTHLY: "premium_monthly",
} as const;

export type PlanId = (typeof PLAN_IDS)[keyof typeof PLAN_IDS];

/** Tool slugs available on the free plan (full library for Premium). */
export const FREE_TOOL_SLUGS = [
  "two-minute-reset",
  "breathing",
  "grounding",
  "reframing",
  "self-compassion",
  "panic",
] as const;

export const PREMIUM_ONLY_TOOL_SLUGS = [
  "sleep",
  "work-stress",
  "conversation-prep",
  "relationships",
] as const;

export const ALL_TOOL_SLUGS = [...FREE_TOOL_SLUGS, ...PREMIUM_ONLY_TOOL_SLUGS] as const;

/** Companion tone values allowed on Free (Premium unlocks all). */
export const FREE_TONE_IDS = ["gentle"] as const;
export const ALL_TONE_IDS = ["gentle", "direct", "reflective", "structured"] as const;

export type Entitlements = {
  planId: PlanId;
  isPremium: boolean;
  /** Max user-sent chat messages per UTC month (Infinity = unlimited). */
  maxChatUserMessagesPerMonth: number;
  maxJournalEntriesPerMonth: number;
  maxMoodLogsPerMonth: number;
  /** How many recent non-archived conversations appear in the chat hub. */
  maxConversationsListed: number;
  maxMessagesLoadedPerChat: number;
  maxContextTurnsForLlm: number;
  maxMoodLogsListed: number;
  maxJournalEntriesListed: number;
  searchJournal: boolean;
  searchChat: boolean;
  advancedInsights: boolean;
  weeklyReflectionSection: boolean;
  allowAccountDataExport: boolean;
  allowedToolSlugs: readonly string[] | null;
  allowedToneIds: readonly string[];
};

const PREMIUM_LIMITS: Entitlements = {
  planId: PLAN_IDS.PREMIUM_MONTHLY,
  isPremium: true,
  maxChatUserMessagesPerMonth: Number.POSITIVE_INFINITY,
  maxJournalEntriesPerMonth: Number.POSITIVE_INFINITY,
  maxMoodLogsPerMonth: Number.POSITIVE_INFINITY,
  maxConversationsListed: Number.POSITIVE_INFINITY,
  maxMessagesLoadedPerChat: 120,
  maxContextTurnsForLlm: 20,
  maxMoodLogsListed: 90,
  maxJournalEntriesListed: 200,
  searchJournal: true,
  searchChat: true,
  advancedInsights: true,
  weeklyReflectionSection: true,
  allowAccountDataExport: true,
  allowedToolSlugs: null,
  allowedToneIds: ALL_TONE_IDS,
};

const FREE_LIMITS: Entitlements = {
  planId: PLAN_IDS.FREE,
  isPremium: false,
  maxChatUserMessagesPerMonth: 35,
  maxJournalEntriesPerMonth: 18,
  maxMoodLogsPerMonth: 24,
  maxConversationsListed: 6,
  maxMessagesLoadedPerChat: 28,
  maxContextTurnsForLlm: 8,
  maxMoodLogsListed: 14,
  maxJournalEntriesListed: 22,
  searchJournal: false,
  searchChat: false,
  advancedInsights: false,
  weeklyReflectionSection: false,
  allowAccountDataExport: false,
  allowedToolSlugs: FREE_TOOL_SLUGS,
  allowedToneIds: FREE_TONE_IDS,
};

export function entitlementsForPremium(isPremium: boolean): Entitlements {
  return isPremium ? { ...PREMIUM_LIMITS } : { ...FREE_LIMITS };
}

export function isPremiumToolSlug(slug: string): boolean {
  return (PREMIUM_ONLY_TOOL_SLUGS as readonly string[]).includes(slug);
}

export function canUseToolSlug(slug: string, ent: Entitlements): boolean {
  if (ent.allowedToolSlugs === null) return true;
  return ent.allowedToolSlugs.includes(slug);
}
