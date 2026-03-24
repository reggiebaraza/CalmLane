import { assertNoSupabaseError } from "@/lib/db-errors";
import { computeMoodStreak } from "@/lib/mood-streak";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ChatListItem = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

export async function listChats(
  userId: string,
  opts?: { search?: string; includeArchived?: boolean; archivedOnly?: boolean; maxItems?: number },
) {
  const supabase = await createSupabaseServerClient();
  let query = supabase
    .from("conversations")
    .select("id,title,created_at,updated_at,archived")
    .eq("user_id", userId);
  if (opts?.archivedOnly) {
    query = query.eq("archived", true);
  } else if (!opts?.includeArchived) {
    query = query.eq("archived", false);
  }
  const term = opts?.search?.trim();
  if (term) {
    query = query.ilike("title", `%${term.replace(/%/g, "\\%").replace(/_/g, "\\_")}%`);
  }
  const { data, error } = await query.order("updated_at", { ascending: false });
  if (error) return [];
  let rows = data ?? [];
  if (opts?.maxItems != null && opts.maxItems >= 0) {
    rows = rows.slice(0, opts.maxItems);
  }
  return rows.map(
    (row): ChatListItem => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      archived: Boolean(row.archived),
    }),
  );
}

export async function createChat(userId: string, title = "New reflection") {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, title })
    .select("id")
    .single();
  assertNoSupabaseError(error, "Unable to create conversation");
  if (!data?.id) throw new Error("Unable to create conversation");
  return data.id as string;
}

export async function getConversation(userId: string, conversationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("conversations")
    .select("id,title,archived,user_id")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return data;
}

export async function listMessagesForConversation(
  userId: string,
  conversationId: string,
  limit = 80,
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id,role,content,created_at")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .in("role", ["user", "assistant"])
    .order("created_at", { ascending: true })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}

export async function insertChatMessages(
  userId: string,
  conversationId: string,
  rows: Array<{ role: "user" | "assistant"; content: string }>,
) {
  if (rows.length === 0) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("messages").insert(
    rows.map((r) => ({
      conversation_id: conversationId,
      user_id: userId,
      role: r.role,
      content: r.content,
    })),
  );
  assertNoSupabaseError(error, "Unable to save messages");
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId)
    .eq("user_id", userId);
}

export async function updateConversationTitle(
  userId: string,
  conversationId: string,
  title: string,
) {
  const supabase = await createSupabaseServerClient();
  const trimmed = title.trim().slice(0, 120);
  if (!trimmed) return;
  const { error } = await supabase
    .from("conversations")
    .update({ title: trimmed })
    .eq("id", conversationId)
    .eq("user_id", userId);
  assertNoSupabaseError(error, "Unable to rename conversation");
}

export async function setConversationArchived(
  userId: string,
  conversationId: string,
  archived: boolean,
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("conversations")
    .update({ archived })
    .eq("id", conversationId)
    .eq("user_id", userId);
  assertNoSupabaseError(error, "Unable to update conversation");
}

export async function deleteConversation(userId: string, conversationId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId);
  assertNoSupabaseError(error, "Unable to delete conversation");
}

export async function createJournalEntry(params: {
  userId: string;
  content: string;
  title?: string;
  mood?: string;
  tags?: string[];
}) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("journal_entries").insert({
    user_id: params.userId,
    content: params.content,
    title: params.title ?? null,
    mood: params.mood ?? null,
    tags: params.tags ?? [],
  });
  assertNoSupabaseError(error, "Unable to save journal entry");
}

export async function listJournalEntries(userId: string, limit = 10, search?: string) {
  const supabase = await createSupabaseServerClient();
  const term = search?.trim().replace(/[,%]/g, " ");
  let query = supabase
    .from("journal_entries")
    .select("id,title,content,mood,tags,created_at")
    .eq("user_id", userId);
  if (term) {
    const safe = term.replace(/%/g, "\\%").replace(/_/g, "\\_");
    query = query.or(`title.ilike.%${safe}%,content.ilike.%${safe}%`);
  }
  const cap = Math.max(1, Math.min(limit, 500));
  const { data } = await query.order("created_at", { ascending: false }).limit(cap);
  return data ?? [];
}

export async function deleteJournalEntry(userId: string, entryId: string) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", entryId)
    .eq("user_id", userId);
  assertNoSupabaseError(error, "Unable to delete journal entry");
}

export async function createMoodLog(params: {
  userId: string;
  mood: string;
  intensity: number;
  emotions: string[];
  notes?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("mood_logs").insert({
    user_id: params.userId,
    mood: params.mood,
    intensity: params.intensity,
    emotions: params.emotions,
    notes: params.notes ?? null,
  });
  assertNoSupabaseError(error, "Unable to save mood log");
}

export async function listMoodLogs(userId: string, limit = 30) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("mood_logs")
    .select("id,mood,intensity,emotions,notes,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function saveToolSession(params: {
  userId: string;
  toolName: string;
  durationSeconds?: number;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("coping_tool_sessions").insert({
    user_id: params.userId,
    tool_name: params.toolName,
    duration_seconds: params.durationSeconds ?? null,
    metadata: params.metadata ?? {},
  });
  assertNoSupabaseError(error, "Unable to save tool session");
}

export async function listToolSessions(userId: string, limit = 20) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("coping_tool_sessions")
    .select("id,tool_name,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) return [];
  return data ?? [];
}

export async function upsertProfile(params: {
  userId: string;
  preferredName?: string;
  pronouns?: string;
  goals?: string[];
  tonePreference?: string;
  checkinFrequency?: string;
  emergencyCountry?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: params.userId,
      preferred_name: params.preferredName ?? null,
      pronouns: params.pronouns ?? null,
      goals: params.goals ?? [],
      tone_preference: params.tonePreference ?? "gentle",
      checkin_frequency: params.checkinFrequency ?? null,
      emergency_country: params.emergencyCountry ?? "US",
    },
    { onConflict: "user_id" },
  );
  assertNoSupabaseError(error, "Unable to save profile");
}

export async function getProfile(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("profiles")
    .select("preferred_name,pronouns,goals,tone_preference,checkin_frequency,emergency_country")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function getUserPreferences(userId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("user_preferences")
    .select("conversation_style,notifications_enabled,dark_mode,cookie_consent")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

export async function upsertUserPreferences(params: {
  userId: string;
  conversationStyle?: string;
  notificationsEnabled?: boolean;
  darkMode?: boolean;
  cookieConsent?: boolean;
}) {
  const supabase = await createSupabaseServerClient();
  const existing = await getUserPreferences(params.userId);
  const row = {
    user_id: params.userId,
    conversation_style: params.conversationStyle ?? existing?.conversation_style ?? "gentle listener",
    notifications_enabled: params.notificationsEnabled ?? existing?.notifications_enabled ?? true,
    dark_mode: params.darkMode ?? existing?.dark_mode ?? false,
    cookie_consent: params.cookieConsent ?? existing?.cookie_consent ?? false,
  };
  const { error } = await supabase.from("user_preferences").upsert(row, { onConflict: "user_id" });
  assertNoSupabaseError(error, "Unable to save preferences");
}

function startOfUtcMonthIso(): string {
  const n = new Date();
  return new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), 1)).toISOString();
}

export async function countJournalEntriesUtcMonth(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("journal_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfUtcMonthIso());
  if (error) return 0;
  return count ?? 0;
}

export async function countMoodLogsUtcMonth(userId: string): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const { count, error } = await supabase
    .from("mood_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfUtcMonthIso());
  if (error) return 0;
  return count ?? 0;
}

export async function getOverviewData(
  userId: string,
  options?: { maxListedChats?: number; moodLogLimit?: number },
) {
  const [chats, journals, moods, tools, profile] = await Promise.all([
    listChats(
      userId,
      options?.maxListedChats != null ? { maxItems: options.maxListedChats } : undefined,
    ),
    listJournalEntries(userId, 3),
    listMoodLogs(userId, options?.moodLogLimit ?? 60),
    listToolSessions(userId, 5),
    getProfile(userId),
  ]);
  const moodStreak = computeMoodStreak(moods);
  const latestJournal = journals[0];
  return {
    moodStreak,
    latestJournalTitle: latestJournal?.title?.trim() || latestJournal?.content?.slice(0, 48) || null,
    latestJournalExcerpt: latestJournal?.content?.slice(0, 120) ?? null,
    recentConversations: chats.length,
    recentTools: tools.map((t) => ({ name: t.tool_name, at: t.created_at })),
    preferredName: profile?.preferred_name ?? null,
    goals: profile?.goals ?? [],
  };
}

export async function logSafetyEvent(params: {
  userId: string;
  source: "chat" | "journal";
  riskLevel: string;
  category: string;
}) {
  const supabase = await createSupabaseServerClient();
  await supabase.from("safety_events").insert({
    user_id: params.userId,
    source: params.source,
    risk_level: params.riskLevel,
    category: params.category,
    metadata: { minimal: true },
  });
}
