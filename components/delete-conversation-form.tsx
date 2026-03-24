"use client";

import { deleteConversationAction } from "@/app/app/chat/actions";

import { Button } from "@/components/ui";

export function DeleteConversationForm({ conversationId }: { conversationId: string }) {
  return (
    <form
      action={async () => {
        if (!confirm("Delete this conversation and all messages? This cannot be undone.")) return;
        await deleteConversationAction(conversationId);
      }}
    >
      <Button type="submit" variant="danger" className="h-9 px-3 text-xs">
        Delete
      </Button>
    </form>
  );
}
