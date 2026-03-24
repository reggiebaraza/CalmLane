import { NextResponse } from "next/server";

import { buildUserExportPayload } from "@/lib/account-export";
import { getSession } from "@/lib/auth";
import { createSupabaseAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!hasServiceRoleKey()) {
    return NextResponse.json(
      { error: "Data export is not configured. Add SUPABASE_SERVICE_ROLE_KEY on the server." },
      { status: 503 },
    );
  }

  try {
    const admin = createSupabaseAdminClient();
    const payload = await buildUserExportPayload(admin, session.userId, session.email);
    const body = JSON.stringify(payload, null, 2);
    const filename = `calmlane-export-${new Date().toISOString().slice(0, 10)}.json`;
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("account export", e);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
