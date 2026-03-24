"use server";

import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import { saveToolSession } from "@/lib/db";

export async function startToolSession(toolName: string, formData: FormData) {
  void formData;
  const active = await requireSession();
  const name = toolName.trim();
  if (!name) return;
  await saveToolSession({
    userId: active.userId,
    toolName: name,
    metadata: { startedFrom: "tools-page" },
  });
  revalidatePath("/app/tools");
  revalidatePath("/app");
}
