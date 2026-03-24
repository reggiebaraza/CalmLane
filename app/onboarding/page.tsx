import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { upsertProfile, upsertUserPreferences } from "@/lib/db";
import { crisisCountries } from "@/lib/safety";
import { OnboardingEntrance } from "@/components/onboarding-entrance";
import { SiteAuthHeader } from "@/components/site-auth-header";
import { Button, Card, Input } from "@/components/ui";

const onboardingSchema = z.object({
  preferredName: z.string().optional(),
  pronouns: z.string().optional(),
  goals: z.string().optional(),
  tone: z.string().optional(),
  checkInFrequency: z.string().optional(),
  country: z.string().optional(),
});

const countries = Object.keys(crisisCountries);

export default async function OnboardingPage() {
  await requireSession();

  async function finishOnboarding(formData: FormData) {
    "use server";
    const active = await requireSession();
    const parsed = onboardingSchema.parse({
      preferredName: formData.get("preferredName"),
      pronouns: formData.get("pronouns"),
      goals: formData.get("goals"),
      tone: formData.get("tone"),
      checkInFrequency: formData.get("checkInFrequency"),
      country: formData.get("country"),
    });
    const goals = (parsed.goals ?? "")
      .split(",")
      .map((goal) => goal.trim())
      .filter(Boolean);
    await upsertProfile({
      userId: active.userId,
      preferredName: parsed.preferredName,
      pronouns: parsed.pronouns,
      goals,
      tonePreference: parsed.tone ?? "gentle",
      checkinFrequency: parsed.checkInFrequency,
      emergencyCountry: parsed.country?.toUpperCase() ?? "US",
    });
    await upsertUserPreferences({
      userId: active.userId,
      conversationStyle: parsed.tone === "gentle" ? "gentle listener" : `${parsed.tone ?? "gentle"} companion`,
    });
    redirect("/app");
  }

  return (
    <div className="relative mx-auto max-w-2xl px-4 py-10 sm:py-14">
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[min(100%,28rem)] -translate-x-1/2 rounded-full bg-accent/[0.07] blur-3xl"
        aria-hidden
      />
      <OnboardingEntrance>
        <SiteAuthHeader />
        <Card className="relative space-y-4 border-border/80 bg-card/95 shadow-lg">
          <div className="inline-flex rounded-full border border-border/80 bg-muted/20 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Step 1 of 1
          </div>
          <h1 className="font-display text-[1.85rem] font-medium leading-tight tracking-tight text-foreground md:text-[2.125rem]">
            Make this space feel like yours
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Everything here is optional — change it anytime in Settings. CalmLane is AI support, not therapy or crisis
            care.
          </p>
        </Card>
        <Card className="relative mt-6 border-border/80">
          <form action={finishOnboarding} className="grid gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="preferredName">
                  Preferred name
                </label>
                <Input id="preferredName" name="preferredName" placeholder="Optional" className="mt-2" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="pronouns">
                  Pronouns
                </label>
                <Input id="pronouns" name="pronouns" placeholder="Optional" className="mt-2" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="goals">
                What brings you here? (comma separated)
              </label>
              <Input id="goals" name="goals" placeholder="stress, sleep, anxiety, grief…" className="mt-2" />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="tone">
                  Chat tone
                </label>
                <select id="tone" name="tone" defaultValue="gentle" className="select-app mt-2">
                  <option value="gentle">Gentle</option>
                  <option value="direct">Direct</option>
                  <option value="reflective">Reflective</option>
                  <option value="structured">Structured</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground" htmlFor="checkInFrequency">
                  Reminder style (optional)
                </label>
                <Input
                  id="checkInFrequency"
                  name="checkInFrequency"
                  placeholder="e.g. weekday evenings"
                  className="mt-2"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="country">
                Crisis resource region
              </label>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Shown only when safety panels appear.</p>
              <select id="country" name="country" defaultValue="US" className="select-app mt-2">
                {countries.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="w-full md:w-auto">
              Continue to your dashboard
            </Button>
          </form>
        </Card>
      </OnboardingEntrance>
    </div>
  );
}
