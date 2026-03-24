import Link from "next/link";
import { ArrowRight, BookOpen, HeartPulse, MessageCircle, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getOverviewData } from "@/lib/db";

function StatCard({
  label,
  icon: Icon,
  children,
  footer,
}: {
  label: string;
  icon: typeof HeartPulse;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Card className="flex min-h-[11.5rem] flex-col justify-between border-border/80 p-5">
      <div>
        <div className="flex items-start justify-between gap-3">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <div className="rounded-xl bg-accent/10 p-2 text-accent">
            <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          </div>
        </div>
        <div className="mt-4">{children}</div>
      </div>
      <div className="mt-4 border-t border-border/50 pt-4">{footer}</div>
    </Card>
  );
}

export default async function AppOverviewPage() {
  const session = await requireSession();
  const overview = await getOverviewData(session.userId);
  const name = overview.preferredName?.trim() || session.name?.trim() || "there";

  return (
    <div className="space-y-12">
      <FadeIn>
        <PageHeader
          title={`Welcome back, ${name}`}
          description="A calm command center for your week. CalmLane is AI emotional support — not therapy, diagnosis, or emergency care."
        />
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Mood streak"
            icon={HeartPulse}
            footer={
              <Link
                href="/app/mood"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
              >
                Log mood <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          >
            <p className="font-display text-3xl font-medium tabular-nums tracking-tight text-foreground">
              {overview.moodStreak}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Consecutive days with a check-in (including today if you logged).
            </p>
          </StatCard>

          <StatCard
            label="Journal"
            icon={BookOpen}
            footer={
              <Link
                href="/app/journal"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
              >
                Open journal <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          >
            <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
              {overview.latestJournalTitle ?? "No entries yet"}
            </p>
            {overview.latestJournalExcerpt ? (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {overview.latestJournalExcerpt}
              </p>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">Your words stay private here.</p>
            )}
          </StatCard>

          <StatCard
            label="Chats"
            icon={MessageCircle}
            footer={
              <Link
                href="/app/chat"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
              >
                Go to chat <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          >
            <p className="font-display text-3xl font-medium tabular-nums tracking-tight text-foreground">
              {overview.recentConversations}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Reflections saved to your account.</p>
          </StatCard>

          <StatCard
            label="Suggested"
            icon={Sparkles}
            footer={
              <Link
                href="/app/tools/two-minute-reset"
                className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
              >
                Start tool <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            }
          >
            <p className="text-sm font-medium text-foreground">Two-minute reset</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              A short, body-based pause when your mind is racing.
            </p>
          </StatCard>
        </div>
      </FadeIn>

      {overview.goals.length > 0 ? (
        <FadeIn delay={0.08}>
          <Card className="border-border/80">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              You said you care about
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {overview.goals.map((g: string) => (
                <li
                  key={g}
                  className="rounded-full border border-border/60 bg-muted/20 px-3.5 py-1.5 text-xs font-medium text-foreground"
                >
                  {g}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">Update anytime in Settings.</p>
          </Card>
        </FadeIn>
      ) : null}

      <FadeIn delay={overview.goals.length > 0 ? 0.1 : 0.06}>
        <Card className="border-border/80">
          <h2 className="font-display text-lg font-medium tracking-tight text-foreground">Next gentle steps</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pick one small action — no pressure to finish the list.</p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {[
              { href: "/app/chat", label: "Start a reflection chat" },
              { href: "/app/tools/two-minute-reset", label: "Try a 2-minute reset" },
              { href: "/app/mood", label: "Quick mood check-in" },
              { href: "/app/insights", label: "View insights" },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-background/30 px-4 py-3.5 text-sm font-medium text-foreground transition hover:border-accent/25 hover:bg-accent/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-card"
                >
                  {item.label}
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </FadeIn>

      {overview.recentTools.length > 0 ? (
        <FadeIn delay={0.14}>
          <Card className="border-border/80">
            <h2 className="font-display text-lg font-medium tracking-tight">Recent coping tools</h2>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              {overview.recentTools.map((t) => (
                <li
                  key={`${t.name}-${t.at}`}
                  className="flex flex-col gap-0.5 border-b border-border/40 pb-2.5 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-foreground">{t.name}</span>
                  <time className="text-xs tabular-nums text-muted-foreground">{new Date(t.at).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          </Card>
        </FadeIn>
      ) : null}
    </div>
  );
}
