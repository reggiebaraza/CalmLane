"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function UpgradeCheckoutButton({
  children = "Upgrade to Premium",
  className,
  variant = "primary",
}: {
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "subtle" | "danger";
}) {
  const [busy, setBusy] = useState(false);

  async function startCheckout() {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST", credentials: "include" });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok) {
        toast.error(j.error ?? "Checkout could not start.");
        return;
      }
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      toast.error("No checkout URL returned.");
    } catch {
      toast.error("Network error starting checkout.");
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
      onClick={() => void startCheckout()}
    >
      {busy ? "Redirecting…" : children}
    </Button>
  );
}
