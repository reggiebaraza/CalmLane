"use client";

import { format } from "date-fns";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Row = { created_at: string; intensity: number; mood: string };

export function MoodIntensityChart({ logs }: { logs: Row[] }) {
  const ordered = [...logs].reverse();
  const data = ordered.map((r) => ({
    day: format(new Date(r.created_at), "MMM d"),
    intensity: r.intensity,
    mood: r.mood,
  }));

  if (data.length === 0) return null;

  return (
    <div className="h-56 w-full min-w-0" aria-label="Mood intensity over recent check-ins">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" />
          <XAxis dataKey="day" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
          <YAxis domain={[1, 10]} width={28} tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }} />
          <Line type="monotone" dataKey="intensity" stroke="var(--accent)" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
      <p className="mt-2 text-xs text-muted-foreground">
        This chart is for your reflection only — not a clinical measure.
      </p>
    </div>
  );
}
