import Link from "next/link";

import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { computeMoodStreak } from "@/lib/mood-streak";
import { listJournalEntries, listMoodLogs } from "@/lib/db";

function buildInsights(logs: Awaited<ReturnType<typeof listMoodLogs>>, journalCount: number) {
  const streak = computeMoodStreak(logs);
  if (logs.length === 0 && journalCount === 0) {
    return {
      headline: "You're at the beginning — that's enough.",
      body: "Try one mood check-in and one short journal line this week. Patterns emerge gently; there's no score to hit.",
      actions: [
        { label: "Log your first mood", href: "/app/mood" },
        { label: "Write one journal line", href: "/app/journal" },
      ],
    };
  }
  if (logs.length === 0) {
    return {
      headline: "Your journal is active — add mood data when you can.",
      body: "Pairing a few words about mood with journaling can make trends easier to notice over time. This is for reflection, not diagnosis.",
      actions: [
        { label: "Add a mood check-in", href: "/app/mood" },
        { label: "Continue journaling", href: "/app/journal" },
      ],
    };
  }
  const avg = logs.reduce((acc, log) => acc + Number(log.intensity), 0) / logs.length;
  const highest = [...logs].sort((a, b) => Number(b.intensity) - Number(a.intensity))[0];
  return {
    headline: `You're on a ${streak}-day streak · average intensity ${avg.toFixed(1)}/10`,
    body: `A recent peak was "${highest.mood}" at ${highest.intensity}/10. Intensity is subjective — use it as a compass, not a verdict. If journaling and mood both feel heavy, a short grounding tool before deciding your next step can help.`,
    actions: [
      { label: "Two-minute reset", href: "/app/tools/two-minute-reset" },
      { label: "View mood chart", href: "/app/mood" },
    ],
  };
}

export default async function InsightsPage() {
  const session = await requireSession();
  const [logs, journalEntries] = await Promise.all([
    listMoodLogs(session.userId, 30),
    listJournalEntries(session.userId, 50),
  ]);
  const insight = buildInsights(logs, journalEntries.length);

  return (
    <div className="space-y-10">
      <FadeIn>
        <PageHeader
          eyebrow="From your data"
          title="Insights"
          description="Supportive patterns from your own logs — not clinical analysis or medical advice."
        />
      </FadeIn>

      <FadeIn delay={0.06}>
        <Card className="border-border/80">
          <p className="font-display text-lg font-medium leading-snug text-foreground">{insight.headline}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{insight.body}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {insight.actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="rounded-xl border border-border/90 bg-background/40 px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition hover:border-accent/25 hover:bg-accent/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-card"
              >
                {a.label}
              </Link>
            ))}
          </div>
        </Card>
      </FadeIn>

      <FadeIn delay={0.12}>
        <Card className="border-border/80">
          <p className="font-display text-base font-medium text-foreground">Journal + mood</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You have {journalEntries.length} recent journal entr{journalEntries.length === 1 ? "y" : "ies"} on file.
            When mood and writing both show up in the same week, many people find it easier to notice what tends to
            help.
          </p>
        </Card>
      </FadeIn>
    </div>
  );
}
