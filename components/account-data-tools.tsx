"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button, Card, Input } from "@/components/ui";

export function AccountDataTools({ email }: { email: string }) {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);

  async function exportData() {
    setBusy("export");
    try {
      const res = await fetch("/api/account/export", { credentials: "include" });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(j.error ?? "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `calmlane-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch {
      toast.error("Export failed");
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount() {
    if (confirmEmail.trim().toLowerCase() !== email.trim().toLowerCase()) {
      toast.error("Type your email exactly to confirm deletion.");
      return;
    }
    if (!confirm("This permanently deletes your CalmLane account and associated data. Continue?")) return;
    setBusy("delete");
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmEmail: confirmEmail.trim() }),
      });
      const j = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !j.ok) {
        toast.error(j.error ?? "Could not delete account");
        return;
      }
      toast.success("Account deleted");
      window.location.href = "/";
    } catch {
      toast.error("Delete failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="space-y-5 border-amber-200/70 bg-amber-50/20 dark:border-amber-900/45 dark:bg-amber-950/15">
      <div>
        <h2 className="font-display text-lg font-medium tracking-tight text-foreground">Your data</h2>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
          Download a JSON copy of your journal, mood logs, chats, and preferences. If export is unavailable, your
          deployment needs the Supabase service role configured on the server only — it is never sent to the browser.
          Deleting your account removes your sign-in; related data is cleared according to your database rules.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" disabled={busy !== null} onClick={() => void exportData()}>
          {busy === "export" ? "Preparing…" : "Download JSON export"}
        </Button>
      </div>
      <div className="rounded-xl border border-border/80 p-3">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">Delete account</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Type your account email <span className="font-medium text-foreground">{email}</span> to confirm, then delete.
        </p>
        <Input
          className="mt-2"
          type="email"
          autoComplete="email"
          placeholder="Your email"
          value={confirmEmail}
          onChange={(e) => setConfirmEmail(e.target.value)}
          aria-label="Confirm email for account deletion"
        />
        <Button type="button" variant="danger" className="mt-3" disabled={busy !== null} onClick={() => void deleteAccount()}>
          {busy === "delete" ? "Deleting…" : "Delete my account permanently"}
        </Button>
      </div>
    </Card>
  );
}
