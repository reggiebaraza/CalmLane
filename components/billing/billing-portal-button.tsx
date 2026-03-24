"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function BillingPortalButton({
  children = "Manage subscription",
  className,
  variant = "secondary",
}: {
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "subtle" | "danger";
}) {
  const [busy, setBusy] = useState(false);

  async function openPortal() {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST", credentials: "include" });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) {
        toast.error(j.error ?? "Could not open billing portal.");
        return;
      }
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      toast.error("No portal URL returned.");
    } catch {
      toast.error("Network error opening billing.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={cn(className)}
      disabled={busy}
      onClick={() => void openPortal()}
    >
      {busy ? "Opening…" : children}
    </Button>
  );
}
