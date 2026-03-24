import { revalidatePath } from "next/cache";

import { logoutAction } from "@/app/(auth)/actions";
import { AccountDataTools } from "@/components/account-data-tools";
import { PageHeader } from "@/components/page-header";
import { requireSession } from "@/lib/auth";
import { getProfile, getUserPreferences, upsertProfile, upsertUserPreferences } from "@/lib/db";
import { crisisCountries } from "@/lib/safety";
import { Button, Card, Input } from "@/components/ui";

const countryOptions = Object.keys(crisisCountries);

export default async function SettingsPage() {
  const session = await requireSession();
  const [profile, prefs] = await Promise.all([getProfile(session.userId), getUserPreferences(session.userId)]);

  async function saveSettings(formData: FormData) {
    "use server";
    const active = await requireSession();
    const preferredName = String(formData.get("preferredName") ?? "").trim();
    const tonePreference = String(formData.get("tonePreference") ?? "gentle").trim() || "gentle";
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

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Your account"
        title="Settings"
        description="Shape how CalmLane feels. We never sell your reflections. This is not a medical service."
      />

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
            <select
              id="tonePreference"
              name="tonePreference"
              defaultValue={profile?.tone_preference ?? "gentle"}
              className="select-app mt-2"
            >
              <option value="gentle">Gentle</option>
              <option value="direct">Direct</option>
              <option value="reflective">Reflective</option>
              <option value="structured">Structured</option>
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

      <AccountDataTools email={session.email} />

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
