import Link from "next/link";
import { notFound } from "next/navigation";

import {
  archiveConversationAction,
  renameConversationAction,
  unarchiveConversationAction,
} from "@/app/app/chat/actions";
import { DeleteConversationForm } from "@/components/delete-conversation-form";
import { ChatWindow } from "@/components/chat-window";
import { CrisisResourcesPanel, SafetyAlert } from "@/components/safety-alert";
import { Button, Card, Input } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getConversation, getProfile, listMessagesForConversation } from "@/lib/db";

export default async function ChatDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  const { id } = await params;
  const conv = await getConversation(session.userId, id);
  if (!conv) notFound();
  const [rows, profile] = await Promise.all([
    listMessagesForConversation(session.userId, id, 100),
    getProfile(session.userId),
  ]);
  const initialMessages = rows.map((r) => ({
    id: r.id,
    role: r.role as "user" | "assistant",
    content: r.content,
  }));
  const country = profile?.emergency_country ?? "US";
  const backHref = conv.archived ? "/app/chat?view=archived" : "/app/chat";

  return (
    <div className="space-y-10">
      {conv.archived ? (
        <Card className="border-amber-200/80 bg-amber-50/60 dark:border-amber-900/45 dark:bg-amber-950/25">
          <p className="text-sm leading-relaxed text-amber-950 dark:text-amber-50">
            This conversation is archived — it stays out of your active list. Restore it anytime.
          </p>
          <form action={unarchiveConversationAction.bind(null, id)} className="mt-4">
            <Button type="submit" variant="secondary">
              Restore to active
            </Button>
          </form>
        </Card>
      ) : null}

      <header className="border-b border-border/80 pb-10">
        <Link
          href={backHref}
          className="inline-flex text-sm font-medium text-accent transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
        >
          ← All conversations
        </Link>
        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl space-y-2">
            <h1 className="font-display text-[1.75rem] font-medium tracking-tight text-foreground md:text-[2rem]">
              Conversation
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Rename or archive anytime. Messages are stored for your eyes only.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!conv.archived ? (
              <form action={archiveConversationAction.bind(null, id)}>
                <Button type="submit" variant="secondary">
                  Archive
                </Button>
              </form>
            ) : null}
            <DeleteConversationForm conversationId={id} />
          </div>
        </div>
      </header>

      <Card className="space-y-3 border-border/80 p-4 sm:p-5">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Title</p>
        <form action={renameConversationAction.bind(null, id)} className="flex flex-col gap-3 sm:flex-row">
          <Input name="title" defaultValue={conv.title} placeholder="Conversation title" className="sm:flex-1" />
          <Button type="submit" variant="secondary" className="sm:w-auto">
            Save title
          </Button>
        </form>
      </Card>

      <SafetyAlert />
      <ChatWindow chatId={id} initialMessages={initialMessages} crisisCountry={country} />
      <CrisisResourcesPanel country={country} />
    </div>
  );
}
