import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";
import { getStripe } from "@/lib/billing/stripe";
import { env, hasStripe } from "@/lib/env";
import { createSupabaseAdminClient, hasServiceRoleKey } from "@/lib/supabase/admin";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!hasStripe || !hasServiceRoleKey()) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .from("customer_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", session.userId)
    .maybeSingle();

  const customerId = row?.stripe_customer_id as string | null | undefined;
  if (!customerId) {
    return NextResponse.json(
      { error: "No billing account yet. Start with Premium checkout first." },
      { status: 400 },
    );
  }

  const appUrl = (env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/app/settings#billing`,
  });

  return NextResponse.json({ url: portal.url });
}
