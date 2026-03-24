import { revalidatePath } from "next/cache";

import { logoutAction } from "@/app/(auth)/actions";
import { BillingPortalButton } from "@/components/billing/billing-portal-button";
import { UpgradeCheckoutButton } from "@/components/billing/upgrade-checkout-button";
import { AccountDataTools } from "@/components/account-data-tools";
import { PageHeader } from "@/components/page-header";
import { requireSession } from "@/lib/auth";
import { getBillingContext } from "@/lib/billing/context";
import { getProfile, getUserPreferences, upsertProfile, upsertUserPreferences } from "@/lib/db";
import { hasStripe } from "@/lib/env";
import { crisisCountries } from "@/lib/safety";
import { Button, Card, Input } from "@/components/ui";

const countryOptions = Object.keys(crisisCountries);

const toneLabels: Record<string, string> = {
  gentle: "Gentle",
  direct: "Direct",
  reflective: "Reflective",
  structured: "Structured",
};

export default async function SettingsPage() {
  const session = await requireSession();
  const [profile, prefs, billing] = await Promise.all([
    getProfile(session.userId),
    getUserPreferences(session.userId),
    getBillingContext(session.userId),
  ]);

  const sub = billing.subscription;
  const canOpenPortal = Boolean(sub?.stripe_customer_id);
  const chatCap = billing.entitlements.maxChatUserMessagesPerMonth;
  const chatUsageLine = Number.isFinite(chatCap)
    ? `${billing.usage.chatUserMessages} / ${chatCap} companion messages this month (UTC)`
    : "Unlimited companion messages this month";

  async function saveSettings(formData: FormData) {
    "use server";
    const active = await requireSession();
    const freshBilling = await getBillingContext(active.userId);
    const allowed = freshBilling.entitlements.allowedToneIds as readonly string[];

    const preferredName = String(formData.get("preferredName") ?? "").trim();
    let tonePreference = String(formData.get("tonePreference") ?? "gentle").trim() || "gentle";
    if (!allowed.includes(tonePreference)) {
      tonePreference = allowed[0] ?? "gentle";
    }
    const checkinFrequency = String(formData.get("checkinFrequency") ?? "").trim();
    const emergencyCountry = String(formData.get("emergencyCountry") ?? "US").trim().toUpperCase() || "US";
    const notificationsEnabled = formData.get("notificationsEnabled") === "on";
    const darkMode = formData.get("darkMode") === "on";

    await upsertProfile({
      userId: active.userId,
      preferredName: preferredName || undefined,
      tonePreference,
      checkinFrequency: checkinFrequency || undefined,
      emergencyCountry,
    });
    await upsertUserPreferences({
      userId: active.userId,
      conversationStyle: tonePreference === "gentle" ? "gentle listener" : `${tonePreference} companion`,
      notificationsEnabled,
      darkMode,
    });
    revalidatePath("/app/settings");
    revalidatePath("/app");
  }

  const defaultTone = profile?.tone_preference ?? "gentle";
  const safeDefaultTone = (billing.entitlements.allowedToneIds as readonly string[]).includes(defaultTone)
    ? defaultTone
    : billing.entitlements.allowedToneIds[0] ?? "gentle";

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Your account"
        title="Settings"
        description="Shape how CalmLane feels. We never sell your reflections. This is not a medical service."
      />

      <Card id="billing" className="scroll-mt-8 space-y-5 border-border/80">
        <div>
          <h2 className="font-display text-lg font-medium tracking-tight text-foreground">Billing</h2>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
            Plans and usage. Payments are processed securely by Stripe; we store subscription status in your Supabase
            project.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full border border-border/80 bg-muted/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-foreground">
            {billing.planLabel}
          </span>
          {sub?.status === "trialing" ? (
            <span className="text-xs text-muted-foreground">Trial active — details in the billing portal.</span>
          ) : null}
        </div>
        {sub?.status === "past_due" ? (
          <p className="rounded-xl border border-amber-200/80 bg-amber-50/40 px-4 py-3 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/25 dark:text-amber-100">
            We could not confirm your latest payment. You still have Premium access while Stripe retries. Update your
            payment method in the billing portal when you can.
          </p>
        ) : null}
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>{chatUsageLine}</li>
          <li>
            Journaling this month: {billing.usage.journalEntries}
            {Number.isFinite(billing.entitlements.maxJournalEntriesPerMonth)
              ? ` / ${billing.entitlements.maxJournalEntriesPerMonth}`
              : " (unlimited)"}
          </li>
          <li>
            Mood check-ins this month: {billing.usage.moodLogs}
            {Number.isFinite(billing.entitlements.maxMoodLogsPerMonth)
              ? ` / ${billing.entitlements.maxMoodLogsPerMonth}`
              : " (unlimited)"}
          </li>
        </ul>
        <div className="flex flex-wrap gap-3">
          {!billing.isPremium && hasStripe ? (
            <UpgradeCheckoutButton>Upgrade to Premium</UpgradeCheckoutButton>
          ) : null}
          {!billing.isPremium && !hasStripe ? (
            <p className="text-xs text-muted-foreground">Premium checkout is not configured on this server.</p>
          ) : null}
          {canOpenPortal ? <BillingPortalButton>Manage subscription</BillingPortalButton> : null}
        </div>
        <p className="text-xs text-muted-foreground">
          <a href="/pricing" className="font-medium text-accent underline-offset-4 hover:underline">
            Compare plans
          </a>{" "}
          · Cancel or update payment anytime through the portal.
        </p>
      </Card>

      <Card className="space-y-5 border-border/80">
        <form action={saveSettings} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="preferredName">
              Preferred name
            </label>
            <Input
              id="preferredName"
              name="preferredName"
              defaultValue={profile?.preferred_name ?? ""}
              placeholder="What should we call you?"
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="tonePreference">
              Companion tone
            </label>
            {!billing.isPremium ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Premium unlocks additional tones. On Free, Gentle stays available.
              </p>
            ) : null}
            <select
              id="tonePreference"
              name="tonePreference"
              defaultValue={safeDefaultTone}
              className="select-app mt-2"
            >
              {billing.entitlements.allowedToneIds.map((id) => (
                <option key={id} value={id}>
                  {toneLabels[id] ?? id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="checkinFrequency">
              Check-in rhythm (optional)
            </label>
            <Input
              id="checkinFrequency"
              name="checkinFrequency"
              defaultValue={profile?.checkin_frequency ?? ""}
              placeholder="e.g. weekday evenings, Sunday reset"
              className="mt-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="emergencyCountry">
              Crisis resources region
            </label>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Used only to show appropriate hotline hints in the app.
            </p>
            <select
              id="emergencyCountry"
              name="emergencyCountry"
              defaultValue={profile?.emergency_country ?? "US"}
              className="select-app mt-2"
            >
              {countryOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/10 p-4">
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                name="notificationsEnabled"
                defaultChecked={prefs?.notifications_enabled !== false}
                className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
              />
              Product tips and check-in reminders (in-app; email later if we add it)
            </label>
            <label className="flex cursor-pointer items-start gap-3 text-sm leading-relaxed">
              <input
                type="checkbox"
                name="darkMode"
                defaultChecked={prefs?.dark_mode === true}
                className="mt-0.5 h-4 w-4 rounded border-border text-accent focus:ring-accent/30"
              />
              Use dark theme in the app
            </label>
          </div>
          <Button type="submit">Save settings</Button>
        </form>
      </Card>

      <AccountDataTools email={session.email} allowExport={billing.entitlements.allowAccountDataExport} />

      <Card className="space-y-4 border-border/80">
        <h2 className="font-display text-lg font-medium tracking-tight text-foreground">Session</h2>
        <p className="text-sm text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{session.email}</span>
        </p>
        <form action={logoutAction}>
          <Button type="submit" variant="secondary">
            Log out
          </Button>
        </form>
      </Card>
    </div>
  );
}
