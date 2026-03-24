import { NextResponse } from "next/server";
import { z } from "zod";

import { clearSession, getSession } from "@/lib/auth";
import { createSupabaseAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";

const bodySchema = z.object({
  confirmEmail: z.string().email(),
});

/**
 * Permanently deletes the authenticated user (Auth + cascaded public.* rows per FK).
 * Requires SUPABASE_SERVICE_ROLE_KEY. Client must send JSON { confirmEmail } matching the signed-in email.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasServiceRoleKey()) {
    return NextResponse.json(
      { error: "Account deletion is not configured. Add SUPABASE_SERVICE_ROLE_KEY on the server." },
      { status: 503 },
    );
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const a = parsed.data.confirmEmail.trim().toLowerCase();
  const b = session.email.trim().toLowerCase();
  if (a !== b) {
    return NextResponse.json({ error: "Email does not match this account." }, { status: 400 });
  }

  try {
    const admin = createSupabaseAdminClient();
    const { error } = await admin.auth.admin.deleteUser(session.userId);
    if (error) {
      console.error("admin deleteUser", error);
      return NextResponse.json({ error: "Could not delete account. Try again or contact support." }, { status: 500 });
    }

    await clearSession();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("account delete", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
