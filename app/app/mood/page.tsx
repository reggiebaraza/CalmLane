import { revalidatePath } from "next/cache";
import { Heart } from "lucide-react";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { getBillingContext } from "@/lib/billing/context";
import { moodQuotaExceeded } from "@/lib/billing/usage";
import { createMoodLog, listMoodLogs } from "@/lib/db";
import { UpgradeCheckoutButton } from "@/components/billing/upgrade-checkout-button";
import { EmptyState } from "@/components/empty-state";
import { MoodIntensityChart } from "@/components/mood-chart";
import { MoodIntensitySlider } from "@/components/mood-intensity-slider";
import { PageHeader } from "@/components/page-header";
import { Button, Card, Input, Textarea } from "@/components/ui";
import Link from "next/link";

const moodSchema = z.object({
  mood: z.string().min(2),
  intensity: z.coerce.number().int().min(1).max(10),
  emotions: z.string().optional(),
  notes: z.string().optional(),
});

export default async function MoodPage({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const session = await requireSession();
  const { notice } = await searchParams;
  const billing = await getBillingContext(session.userId);
  const logs = await listMoodLogs(session.userId, billing.entitlements.maxMoodLogsListed);

  async function saveMood(formData: FormData) {
    "use server";
    const active = await requireSession();
    const billingInner = await getBillingContext(active.userId);
    if (moodQuotaExceeded(billingInner.entitlements, billingInner.usage.moodLogs)) {
      redirect("/app/mood?notice=mood_monthly");
    }
    const parsed = moodSchema.parse({
      mood: formData.get("mood"),
      intensity: formData.get("intensity"),
      emotions: formData.get("emotions"),
      notes: formData.get("notes"),
    });
    await createMoodLog({
      userId: active.userId,
      mood: parsed.mood,
      intensity: parsed.intensity,
      emotions: (parsed.emotions ?? "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
      notes: parsed.notes?.trim() ? parsed.notes.trim() : undefined,
    });
    revalidatePath("/app/mood");
    revalidatePath("/app");
    revalidatePath("/app/insights");
  }

  const atMoodLimit = moodQuotaExceeded(billing.entitlements, billing.usage.moodLogs);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Self-awareness"
        title="Mood check-ins"
        description="Track patterns over time for reflection — not for diagnosis or treatment decisions."
      />

      {notice === "mood_monthly" ? (
        <Card className="border-amber-200/80 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/25">
          <p className="text-sm leading-relaxed text-foreground">
            You have reached this month&apos;s mood check-ins on the Free plan. Premium includes unlimited check-ins and
            a longer history chart.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <UpgradeCheckoutButton>Unlock Premium</UpgradeCheckoutButton>
            <Link
              href="/pricing"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border/90 bg-card px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/25"
            >
              Compare plans
            </Link>
          </div>
        </Card>
      ) : null}

      <Card className="space-y-5 border-border/80">
        <form id="mood-form" action={saveMood} className="space-y-5">
          {atMoodLimit ? (
            <p className="text-sm text-muted-foreground">
              Monthly mood limit reached.{" "}
              <Link href="/pricing" className="font-medium text-accent underline-offset-4 hover:underline">
                Premium
              </Link>{" "}
              unlocks unlimited check-ins.
            </p>
          ) : null}
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="mood-custom">
              How would you name this moment?
            </label>
            <Input
              id="mood-custom"
              name="mood"
              placeholder="e.g. calm, anxious, hopeful, numb…"
              className="mt-2"
              required
              disabled={atMoodLimit}
            />
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Use your own words — there is no wrong answer.</p>
          </div>
          <div className={atMoodLimit ? "pointer-events-none opacity-50" : ""}>
            <MoodIntensitySlider />
          </div>
          <Input name="emotions" placeholder="Emotion tags (comma separated, optional)" disabled={atMoodLimit} />
          <Textarea name="notes" rows={3} placeholder="Optional note — what else is true right now?" disabled={atMoodLimit} />
          <Button type="submit" disabled={atMoodLimit}>
            Save check-in
          </Button>
        </form>
      </Card>

      <Card className="space-y-5 border-border/80">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-medium tracking-tight text-foreground">Recent trend</h2>
          {!billing.isPremium ? (
            <p className="text-xs text-muted-foreground">
              Free shows recent check-ins; Premium keeps a longer history on this chart.
            </p>
          ) : null}
        </div>
        <MoodIntensityChart logs={logs} />
        <div className="space-y-2">
          {logs.length === 0 ? (
            <EmptyState icon={Heart} title="No check-ins yet" className="border-0 bg-muted/10 py-10">
              When you log how you feel, a gentle chart appears here. One entry is enough to begin.
            </EmptyState>
          ) : null}
          {logs.slice(0, 8).map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-border/70 bg-background/40 px-4 py-3 text-sm transition hover:border-accent/15"
            >
              <span className="font-medium text-foreground">{log.mood}</span>
              <span className="text-muted-foreground"> · intensity {log.intensity}/10</span>
              {log.notes ? <p className="mt-1.5 text-muted-foreground line-clamp-2 leading-relaxed">{log.notes}</p> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
