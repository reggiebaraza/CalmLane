"use client";

import { deleteJournalEntryAction } from "@/app/app/journal/actions";

export function DeleteJournalForm({ entryId }: { entryId: string }) {
  return (
    <form
      action={async () => {
        if (!confirm("Delete this journal entry? This cannot be undone.")) return;
        await deleteJournalEntryAction(entryId);
      }}
    >
      <button
        type="submit"
        className="rounded-lg px-2 py-1 text-xs font-medium text-red-700 underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60 focus-visible:ring-offset-2 dark:text-red-300 dark:focus-visible:ring-offset-card"
      >
        Delete
      </button>
    </form>
  );
}
