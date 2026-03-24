import Link from "next/link";

import { UpgradeCheckoutButton } from "@/components/billing/upgrade-checkout-button";
import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getBillingContext } from "@/lib/billing/context";
import { computeMoodStreak } from "@/lib/mood-streak";
import { listJournalEntries, listMoodLogs } from "@/lib/db";
import { hasStripe } from "@/lib/env";

type MoodRow = Awaited<ReturnType<typeof listMoodLogs>>[number];

function buildInsights(logs: MoodRow[], journalCount: number) {
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

function premiumPatternCopy(logs: MoodRow[]) {
  if (logs.length < 2) {
    return {
      headline: "Keep logging — patterns need a little data",
      body: "A few more check-ins will let us summarize variability and recurring moods in a gentle, non-clinical way.",
    };
  }
  const nums = logs.map((l) => Number(l.intensity)).filter((n) => !Number.isNaN(n));
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  const spread = Math.max(...nums) - Math.min(...nums);
  const counts = new Map<string, number>();
  for (const l of logs) {
    const m = String(l.mood ?? "").trim() || "Unnamed";
    counts.set(m, (counts.get(m) ?? 0) + 1);
  }
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [topMood, topN] = sorted[0] ?? ["", 0];
  return {
    headline: "Deeper patterns (self-reflection only)",
    body: `Across recent check-ins, intensity averaged about ${avg.toFixed(1)}/10 with roughly a ${spread.toFixed(1)}-point spread between lowest and highest. "${topMood}" appeared most often (${topN} times). These summaries are for curiosity and self-care — not diagnosis or treatment decisions.`,
  };
}

export default async function InsightsPage() {
  const session = await requireSession();
  const billing = await getBillingContext(session.userId);
  const moodCap = Math.min(90, billing.entitlements.maxMoodLogsListed);
  const journalCap = Math.min(200, billing.entitlements.maxJournalEntriesListed);
  const [logs, journalEntries] = await Promise.all([
    listMoodLogs(session.userId, moodCap),
    listJournalEntries(session.userId, journalCap),
  ]);
  const insight = buildInsights(logs, journalEntries.length);
  const patterns = premiumPatternCopy(logs);

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

      <FadeIn delay={0.1}>
        <Card className="border-border/80">
          <p className="font-display text-base font-medium text-foreground">Journal + mood</p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You have {journalEntries.length} recent journal entr{journalEntries.length === 1 ? "y" : "ies"} on file
            {billing.entitlements.advancedInsights ? " (within your current view)" : ""}. When mood and writing both
            show up in the same week, many people find it easier to notice what tends to help.
          </p>
        </Card>
      </FadeIn>

      {billing.entitlements.advancedInsights ? (
        <FadeIn delay={0.12}>
          <Card className="border-border/80 border-l-4 border-l-accent/40">
            <p className="font-display text-base font-medium text-foreground">{patterns.headline}</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{patterns.body}</p>
          </Card>
        </FadeIn>
      ) : (
        <FadeIn delay={0.12}>
          <Card className="border-dashed border-border/80 bg-muted/[0.08]">
            <p className="font-display text-base font-medium text-foreground">Unlock deeper pattern summaries</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Premium adds gentle variability and mood-theme summaries — still non-clinical, still yours. Upgrade when
              you want more room to reflect.
            </p>
            <div className="mt-5">
              {hasStripe ? (
                <UpgradeCheckoutButton variant="secondary">Continue with more guided support</UpgradeCheckoutButton>
              ) : (
                <p className="text-xs text-muted-foreground">Billing is not configured on this deployment.</p>
              )}
            </div>
          </Card>
        </FadeIn>
      )}

      {billing.entitlements.weeklyReflectionSection ? (
        <FadeIn delay={0.14}>
          <Card className="border-border/80">
            <p className="font-display text-base font-medium text-foreground">Weekly reflection</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              This month so far: {billing.usage.moodLogs} mood check-ins and {billing.usage.journalEntries} journal
              entries. One question, without pressure: what helped even a little — sleep, a message, a short walk, or
              saying no to something?
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              Adjust anytime in journal or mood; this is a mirror, not a grade.
            </p>
          </Card>
        </FadeIn>
      ) : (
        <FadeIn delay={0.14}>
          <Card className="border-dashed border-border/80 bg-muted/[0.08]">
            <p className="font-display text-base font-medium text-foreground">Weekly reflection prompts</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Premium includes a simple monthly snapshot and a gentle prompt tied to your own activity — no streak
              shaming, just space to notice.
            </p>
            <div className="mt-5">
              {hasStripe ? (
                <UpgradeCheckoutButton variant="subtle">Unlock deeper insights and full access</UpgradeCheckoutButton>
              ) : null}
            </div>
          </Card>
        </FadeIn>
      )}
    </div>
  );
}
