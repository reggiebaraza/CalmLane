import Link from "next/link";
import { revalidatePath } from "next/cache";
import { BookOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { getBillingContext } from "@/lib/billing/context";
import { journalQuotaExceeded } from "@/lib/billing/usage";
import { createJournalEntry, listJournalEntries } from "@/lib/db";
import { UpgradeCheckoutButton } from "@/components/billing/upgrade-checkout-button";
import { DeleteJournalForm } from "@/components/delete-journal-form";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Button, Card, Input, Textarea } from "@/components/ui";

const prompts = [
  "What felt heavy today — and what felt a little lighter?",
  "What do you need someone to understand without fixing?",
  "What thought keeps looping, and what might be underneath it?",
  "One kind sentence you wish you heard earlier:",
  "What boundary would help you feel safer this week?",
];

const journalSchema = z.object({
  content: z.string().min(3),
  title: z.string().optional(),
  mood: z.string().optional(),
  tags: z.string().optional(),
});

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; notice?: string }>;
}) {
  const session = await requireSession();
  const { q, notice } = await searchParams;
  const billing = await getBillingContext(session.userId);
  const searchTerm = billing.entitlements.searchJournal ? q : undefined;
  const entries = await listJournalEntries(
    session.userId,
    billing.entitlements.maxJournalEntriesListed,
    searchTerm,
  );

  async function saveEntry(formData: FormData) {
    "use server";
    const active = await requireSession();
    const billingInner = await getBillingContext(active.userId);
    if (journalQuotaExceeded(billingInner.entitlements, billingInner.usage.journalEntries)) {
      redirect("/app/journal?notice=journal_monthly");
    }
    const parsed = journalSchema.parse({
      content: formData.get("content"),
      title: formData.get("title"),
      mood: formData.get("mood"),
      tags: formData.get("tags"),
    });
    await createJournalEntry({
      userId: active.userId,
      content: parsed.content,
      title: parsed.title,
      mood: parsed.mood,
      tags: (parsed.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    });
    revalidatePath("/app/journal");
    revalidatePath("/app");
  }

  const atJournalLimit = journalQuotaExceeded(billing.entitlements, billing.usage.journalEntries);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Private writing"
        title="Journal"
        description="A quiet page for your words. CalmLane does not diagnose or replace professional care."
      />

      {notice === "journal_monthly" ? (
        <Card className="border-amber-200/80 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/25">
          <p className="text-sm leading-relaxed text-foreground">
            You have reached this month&apos;s journal entries on the Free plan. Upgrade when you want more room to
            write — or your allowance resets next month (UTC).
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <UpgradeCheckoutButton>Unlock Premium journaling</UpgradeCheckoutButton>
            <Link
              href="/pricing"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border/90 bg-card px-4 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted/25"
            >
              Compare plans
            </Link>
          </div>
        </Card>
      ) : null}

      <Card className="border-border/80">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Gentle prompts</p>
        <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
          {prompts.map((p) => (
            <li key={p} className="flex gap-2 border-l-2 border-accent/20 pl-3">
              {p}
            </li>
          ))}
        </ul>
      </Card>

      <Card className="border-border/80">
        <form action={saveEntry} className="space-y-4">
          {atJournalLimit ? (
            <p className="text-sm text-muted-foreground">
              Monthly journal limit reached.{" "}
              <Link href="/pricing" className="font-medium text-accent underline-offset-4 hover:underline">
                Premium
              </Link>{" "}
              includes unlimited entries.
            </p>
          ) : null}
          <div>
            <label className="sr-only" htmlFor="journal-title">
              Optional title
            </label>
            <Input id="journal-title" name="title" placeholder="Optional title" disabled={atJournalLimit} />
          </div>
          <Textarea
            name="content"
            rows={10}
            placeholder="Write freely. You can add mood and tags below before saving."
            required
            className="min-h-[12rem]"
            disabled={atJournalLimit}
          />
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="sr-only" htmlFor="journal-mood">
                Mood label (optional)
              </label>
              <Input id="journal-mood" name="mood" placeholder="Mood label (optional)" disabled={atJournalLimit} />
            </div>
            <div>
              <label className="sr-only" htmlFor="journal-tags">
                Tags (comma separated)
              </label>
              <Input id="journal-tags" name="tags" placeholder="Tags (comma separated)" disabled={atJournalLimit} />
            </div>
          </div>
          <Button type="submit" disabled={atJournalLimit}>
            Save entry
          </Button>
        </form>
      </Card>

      <section className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-lg font-medium tracking-tight text-foreground">Recent entries</h2>
          <form className="flex flex-wrap gap-2" action="/app/journal" method="get">
            <label className="sr-only" htmlFor="journal-search">
              Search journal
            </label>
            <Input
              id="journal-search"
              name="q"
              defaultValue={searchTerm ?? ""}
              placeholder={billing.entitlements.searchJournal ? "Search title or body…" : "Search (Premium)"}
              className="min-w-[12rem] max-w-full sm:max-w-xs"
              disabled={!billing.entitlements.searchJournal}
            />
            <Button type="submit" variant="secondary" disabled={!billing.entitlements.searchJournal}>
              Search
            </Button>
          </form>
        </div>
        {!billing.entitlements.searchJournal ? (
          <p className="text-xs text-muted-foreground">
            Full-text search across your journal is a Premium feature — your recent entries still appear below.
          </p>
        ) : null}
        <div className="space-y-3">
          {entries.length === 0 ? (
            searchTerm ? (
              <EmptyState icon={BookOpen} title="No entries match" className="py-12">
                Try different words, or clear search to see everything you have saved.
              </EmptyState>
            ) : (
              <EmptyState icon={BookOpen} title="Your journal is open" className="py-12">
                One honest line is enough to start. There is no audience here — only you.
              </EmptyState>
            )
          ) : null}
          {entries.map((entry) => (
            <article
              key={entry.id}
              className="rounded-2xl border border-border/80 bg-card/50 p-5 transition hover:border-accent/20 hover:bg-card"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-display text-base font-medium text-foreground">
                    {entry.title?.trim() || "Untitled entry"}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{entry.content}</p>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {entry.mood ? <span>Mood · {entry.mood}</span> : null}
                    {entry.tags?.length ? <span>Tags · {entry.tags.join(", ")}</span> : null}
                    <time className="tabular-nums">{new Date(entry.created_at).toLocaleString()}</time>
                  </div>
                </div>
                <DeleteJournalForm entryId={entry.id} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <p className="text-center text-sm leading-relaxed text-muted-foreground">
        <Link
          href="/app/tools"
          className="font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
        >
          Try a grounding tool
        </Link>{" "}
        before or after writing if your body feels activated.
      </p>
    </div>
  );
}
