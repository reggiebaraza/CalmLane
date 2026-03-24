import type { SupabaseClient } from "@supabase/supabase-js";

export type CalmLaneExportPayload = {
  exportVersion: 1;
  exportedAt: string;
  userId: string;
  email: string;
  disclaimer: string;
  profile: unknown;
  userPreferences: unknown;
  conversations: unknown[];
  messages: unknown[];
  journalEntries: unknown[];
  moodLogs: unknown[];
  copingToolSessions: unknown[];
  safetyEvents: unknown[];
};

export async function buildUserExportPayload(
  admin: SupabaseClient,
  userId: string,
  email: string,
): Promise<CalmLaneExportPayload> {
  const [
    { data: profile },
    { data: userPreferences },
    { data: conversations },
    { data: messages },
    { data: journalEntries },
    { data: moodLogs },
    { data: copingToolSessions },
    { data: safetyEvents },
  ] = await Promise.all([
    admin.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    admin.from("user_preferences").select("*").eq("user_id", userId).maybeSingle(),
    admin.from("conversations").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    admin.from("messages").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    admin.from("journal_entries").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    admin.from("mood_logs").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    admin.from("coping_tool_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    admin.from("safety_events").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  return {
    exportVersion: 1,
    exportedAt: new Date().toISOString(),
    userId,
    email,
    disclaimer:
      "CalmLane data export for your records. Safety events are included as stored in the database (minimal metadata). This export is not medical or legal documentation.",
    profile,
    userPreferences,
    conversations: conversations ?? [],
    messages: messages ?? [],
    journalEntries: journalEntries ?? [],
    moodLogs: moodLogs ?? [],
    copingToolSessions: copingToolSessions ?? [],
    safetyEvents: safetyEvents ?? [],
  };
}
