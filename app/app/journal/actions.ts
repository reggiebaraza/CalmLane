"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import { deleteJournalEntry } from "@/lib/db";

export async function deleteJournalEntryAction(entryId: string, _formData?: FormData) {
  void _formData;
  const session = await requireSession();
  await deleteJournalEntry(session.userId, entryId);
  revalidatePath("/app/journal");
  revalidatePath("/app");
}
