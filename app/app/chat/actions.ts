"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import {
  createChat,
  createJournalEntry,
  deleteConversation,
  setConversationArchived,
  updateConversationTitle,
} from "@/lib/db";

export async function startNewChatAction(_formData?: FormData) {
  void _formData;
  const session = await requireSession();
  const id = await createChat(session.userId);
  redirect(`/app/chat/${id}`);
}

const titleSchema = z.string().trim().min(1).max(120);

export async function renameConversationAction(conversationId: string, formData: FormData) {
  const session = await requireSession();
  const parsed = titleSchema.safeParse(String(formData.get("title") ?? ""));
  if (!parsed.success) return;
  await updateConversationTitle(session.userId, conversationId, parsed.data);
  revalidatePath(`/app/chat/${conversationId}`);
  revalidatePath("/app/chat");
}

export async function archiveConversationAction(conversationId: string, _formData?: FormData) {
  void _formData;
  const session = await requireSession();
  await setConversationArchived(session.userId, conversationId, true);
  revalidatePath("/app/chat");
  revalidatePath(`/app/chat/${conversationId}`);
}

export async function unarchiveConversationAction(conversationId: string, _formData?: FormData) {
  void _formData;
  const session = await requireSession();
  await setConversationArchived(session.userId, conversationId, false);
  revalidatePath("/app/chat");
  revalidatePath(`/app/chat/${conversationId}`);
}

export async function deleteConversationAction(conversationId: string, _formData?: FormData) {
  void _formData;
  const session = await requireSession();
  await deleteConversation(session.userId, conversationId);
  revalidatePath("/app/chat");
  redirect("/app/chat");
}

const journalFromChatSchema = z.object({
  excerpt: z.string().trim().min(3).max(12000),
});

export async function saveChatExcerptToJournalDirect(
  excerpt: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await requireSession();
  const parsed = journalFromChatSchema.safeParse({ excerpt });
  if (!parsed.success) return { ok: false, error: "Could not save that text." };
  await createJournalEntry({
    userId: session.userId,
    title: "From a chat reflection",
    content: parsed.data.excerpt,
  });
  revalidatePath("/app/journal");
  revalidatePath("/app");
  return { ok: true as const };
}
