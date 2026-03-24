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

  if (!hasStripe) {
    return NextResponse.json({ error: "Billing is not configured." }, { status: 503 });
  }

  if (!hasServiceRoleKey()) {
    return NextResponse.json(
      { error: "Billing requires SUPABASE_SERVICE_ROLE_KEY on the server." },
      { status: 503 },
    );
  }

  const stripe = getStripe();
  if (!stripe || !env.STRIPE_PRICE_PREMIUM_MONTHLY) {
    return NextResponse.json({ error: "Stripe is not fully configured." }, { status: 503 });
  }

  const appUrl = (env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

  const admin = createSupabaseAdminClient();
  const { data: row } = await admin
    .from("customer_subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", session.userId)
    .maybeSingle();

  let customerId = row?.stripe_customer_id as string | null | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.email || undefined,
      metadata: { supabase_user_id: session.userId },
    });
    customerId = customer.id;
    const { error: upsertErr } = await admin.from("customer_subscriptions").upsert(
      {
        user_id: session.userId,
        stripe_customer_id: customerId,
        plan: "free",
        status: "none",
      },
      { onConflict: "user_id" },
    );
    if (upsertErr) {
      console.error("[checkout] upsert customer row", upsertErr);
      return NextResponse.json({ error: "Could not prepare billing profile." }, { status: 500 });
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: session.userId,
    line_items: [{ price: env.STRIPE_PRICE_PREMIUM_MONTHLY, quantity: 1 }],
    success_url: `${appUrl}/app/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/app/billing/canceled`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { supabase_user_id: session.userId },
    },
    metadata: { supabase_user_id: session.userId },
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ error: "No checkout URL returned" }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
