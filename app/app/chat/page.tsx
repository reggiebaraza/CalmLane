import Link from "next/link";
import { MessageSquare } from "lucide-react";

import {
  archiveConversationAction,
  startNewChatAction,
  unarchiveConversationAction,
} from "@/app/app/chat/actions";
import { DeleteConversationForm } from "@/components/delete-conversation-form";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { CrisisResourcesPanel, SafetyAlert } from "@/components/safety-alert";
import { Button, Card, Input, LinkButton } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getBillingContext } from "@/lib/billing/context";
import { getProfile, listChats } from "@/lib/db";
import { cn } from "@/lib/utils";

export default async function ChatHubPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; view?: string }>;
}) {
  const session = await requireSession();
  const billing = await getBillingContext(session.userId);
  const { q, view } = await searchParams;
  const archivedOnly = view === "archived";
  const searchAllowed = billing.entitlements.searchChat;
  const qTrim = q?.trim() ?? "";
  const ignoredSearch = !searchAllowed && Boolean(qTrim);
  const effectiveQ = searchAllowed ? qTrim : "";
  const maxListed = Number.isFinite(billing.entitlements.maxConversationsListed)
    ? Math.floor(billing.entitlements.maxConversationsListed)
    : undefined;
  const [chats, profile] = await Promise.all([
    listChats(session.userId, {
      search: effectiveQ || undefined,
      archivedOnly,
      includeArchived: archivedOnly ? undefined : false,
      maxItems: maxListed,
    }),
    getProfile(session.userId),
  ]);
  const country = profile?.emergency_country ?? "US";
  const activeTabHref = effectiveQ ? `/app/chat?q=${encodeURIComponent(effectiveQ)}` : "/app/chat";
  const archivedParams = new URLSearchParams();
  if (effectiveQ) archivedParams.set("q", effectiveQ);
  archivedParams.set("view", "archived");
  const archivedTabHref = `/app/chat?${archivedParams.toString()}`;

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Private space"
        title="Companion chat"
        description="Encrypted in transit to your project; stored under your account. AI support — not therapy or crisis care."
      >
        <form action={startNewChatAction}>
          <Button type="submit" className="w-full sm:w-auto">
            New reflection
          </Button>
        </form>
      </PageHeader>

      {ignoredSearch ? (
        <div className="rounded-2xl border border-accent/20 bg-accent/[0.05] px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          Title search is part of Premium. You are seeing recent conversations instead.{" "}
          <Link
            href="/pricing?reason=search"
            className="font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
          >
            Compare plans
          </Link>
        </div>
      ) : null}

      <nav
        className="flex flex-wrap gap-1.5 rounded-xl border border-border/60 bg-muted/15 p-1.5"
        aria-label="Active or archived conversations"
      >
        <Link
          href={activeTabHref}
          aria-current={!archivedOnly ? "page" : undefined}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background",
            !archivedOnly
              ? "bg-card text-foreground shadow-sm ring-1 ring-border/80"
              : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
          )}
        >
          Active
        </Link>
        <Link
          href={archivedTabHref}
          aria-current={archivedOnly ? "page" : undefined}
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background",
            archivedOnly
              ? "bg-card text-foreground shadow-sm ring-1 ring-border/80"
              : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
          )}
        >
          Archived
        </Link>
      </nav>

      <SafetyAlert />

      {searchAllowed ? (
        <Card className="border-border/80 p-4 sm:p-5">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-center" action="/app/chat" method="get">
            {archivedOnly ? <input type="hidden" name="view" value="archived" /> : null}
            <label className="sr-only" htmlFor="chat-search">
              Search conversations
            </label>
            <Input
              id="chat-search"
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search by title…"
              className="sm:max-w-xs"
            />
            <Button type="submit" variant="secondary" className="sm:w-auto">
              Search
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="border-dashed border-border/80 bg-muted/[0.06] p-4 sm:p-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Searchable chat history helps you find an old thread by title. It is included with Premium when you want more
            continuity.
          </p>
          <div className="mt-4">
            <LinkButton href="/app/settings#billing" variant="secondary">
              Upgrade when you are ready
            </LinkButton>
          </div>
        </Card>
      )}

      <section className="space-y-4">
        <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {archivedOnly ? "Archived conversations" : "Your conversations"}
        </h2>
        {chats.length === 0 ? (
          effectiveQ ? (
            <EmptyState icon={MessageSquare} title="No matches" className="py-12">
              Nothing matches that search. Try different words or clear the filter.
            </EmptyState>
          ) : archivedOnly ? (
            <EmptyState icon={MessageSquare} title="Archive is empty" className="py-12">
              Archived chats appear here when you hide them from your active list. You can restore them anytime.
            </EmptyState>
          ) : (
            <EmptyState
              icon={MessageSquare}
              title="Your first reflection"
              className="py-12"
              action={
                <form action={startNewChatAction} className="w-full">
                  <Button type="submit" className="w-full">
                    Start a conversation
                  </Button>
                </form>
              }
            >
              When you are ready, open a new thread. One honest sentence is enough to begin.
            </EmptyState>
          )
        ) : (
          <ul className="space-y-3">
            {chats.map((c) => (
              <li key={c.id}>
                <Card className="flex flex-col gap-4 border-border/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <Link
                    href={`/app/chat/${c.id}`}
                    className="group min-w-0 flex-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-card"
                  >
                    <p className="font-medium text-foreground transition group-hover:text-accent">
                      {c.title}
                      {c.archived ? (
                        <span className="ml-2 inline-block rounded-md bg-muted/50 px-2 py-0.5 text-xs font-normal text-muted-foreground">
                          Archived
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">
                      Updated {new Date(c.updatedAt).toLocaleString()}
                    </p>
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {c.archived ? (
                      <form action={unarchiveConversationAction.bind(null, c.id)}>
                        <Button type="submit" variant="secondary" className="h-9 px-3 text-xs">
                          Restore
                        </Button>
                      </form>
                    ) : (
                      <form action={archiveConversationAction.bind(null, c.id)}>
                        <Button type="submit" variant="subtle" className="h-9 px-3 text-xs">
                          Archive
                        </Button>
                      </form>
                    )}
                    <DeleteConversationForm conversationId={c.id} />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CrisisResourcesPanel country={country} />
    </div>
  );
}
