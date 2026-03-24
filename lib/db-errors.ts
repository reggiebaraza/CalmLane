import type { PostgrestError } from "@supabase/supabase-js";

export function assertNoSupabaseError(error: PostgrestError | null, userMessage: string) {
  if (!error) return;
  const suffix =
    process.env.NODE_ENV === "development"
      ? ` (${error.code ?? "unknown"}: ${error.message}${error.hint ? ` — ${error.hint}` : ""})`
      : "";
  throw new Error(`${userMessage}${suffix}`);
}
