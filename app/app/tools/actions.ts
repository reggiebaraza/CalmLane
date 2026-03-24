"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth";
import { getBillingContext } from "@/lib/billing/context";
import { canUseToolSlug } from "@/lib/plans";
import { saveToolSession } from "@/lib/db";

export async function startToolSession(toolTitle: string, toolSlug: string, formData: FormData) {
  void formData;
  const active = await requireSession();
  const billing = await getBillingContext(active.userId);
  if (!canUseToolSlug(toolSlug, billing.entitlements)) {
    redirect("/pricing?reason=tool");
  }
  const name = toolTitle.trim();
  if (!name) return;
  await saveToolSession({
    userId: active.userId,
    toolName: name,
    metadata: { startedFrom: "tools-page", slug: toolSlug },
  });
  revalidatePath("/app/tools");
  revalidatePath("/app");
}
