import { format, subDays } from "date-fns";

/** Calendar days (local) with at least one mood log, for streak math. */
export function moodLogDayKeys(logs: { created_at: string }[]): Set<string> {
  return new Set(logs.map((l) => format(new Date(l.created_at), "yyyy-MM-dd")));
}

/**
 * Consecutive days with a check-in, counting backward from today (or yesterday if today is empty).
 */
export function computeMoodStreak(logs: { created_at: string }[]): number {
  const days = moodLogDayKeys(logs);
  if (days.size === 0) return 0;
  let start = new Date();
  const todayKey = format(start, "yyyy-MM-dd");
  if (!days.has(todayKey)) {
    start = subDays(start, 1);
  }
  let streak = 0;
  for (let i = 0; i < 366; i++) {
    const key = format(subDays(start, i), "yyyy-MM-dd");
    if (days.has(key)) streak++;
    else break;
  }
  return streak;
}
