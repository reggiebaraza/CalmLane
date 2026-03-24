import { revalidatePath } from "next/cache";
import { Heart } from "lucide-react";
import { z } from "zod";

import { requireSession } from "@/lib/auth";
import { createMoodLog, listMoodLogs } from "@/lib/db";
import { EmptyState } from "@/components/empty-state";
import { MoodIntensityChart } from "@/components/mood-chart";
import { MoodIntensitySlider } from "@/components/mood-intensity-slider";
import { PageHeader } from "@/components/page-header";
import { Button, Card, Input, Textarea } from "@/components/ui";

const moodSchema = z.object({
  mood: z.string().min(2),
  intensity: z.coerce.number().int().min(1).max(10),
  emotions: z.string().optional(),
  notes: z.string().optional(),
});

export default async function MoodPage() {
  const session = await requireSession();
  const logs = await listMoodLogs(session.userId, 21);

  async function saveMood(formData: FormData) {
    "use server";
    const active = await requireSession();
    const parsed = moodSchema.parse({
      mood: formData.get("mood"),
      intensity: formData.get("intensity"),
      emotions: formData.get("emotions"),
      notes: formData.get("notes"),
    });
    await createMoodLog({
      userId: active.userId,
      mood: parsed.mood,
      intensity: parsed.intensity,
      emotions: (parsed.emotions ?? "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
      notes: parsed.notes?.trim() ? parsed.notes.trim() : undefined,
    });
    revalidatePath("/app/mood");
    revalidatePath("/app");
    revalidatePath("/app/insights");
  }

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="Self-awareness"
        title="Mood check-ins"
        description="Track patterns over time for reflection — not for diagnosis or treatment decisions."
      />

      <Card className="space-y-5 border-border/80">
        <form id="mood-form" action={saveMood} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="mood-custom">
              How would you name this moment?
            </label>
            <Input
              id="mood-custom"
              name="mood"
              placeholder="e.g. calm, anxious, hopeful, numb…"
              className="mt-2"
              required
            />
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Use your own words — there is no wrong answer.</p>
          </div>
          <MoodIntensitySlider />
          <Input name="emotions" placeholder="Emotion tags (comma separated, optional)" />
          <Textarea name="notes" rows={3} placeholder="Optional note — what else is true right now?" />
          <Button type="submit">Save check-in</Button>
        </form>
      </Card>

      <Card className="space-y-5 border-border/80">
        <h2 className="font-display text-lg font-medium tracking-tight text-foreground">Recent trend</h2>
        <MoodIntensityChart logs={logs} />
        <div className="space-y-2">
          {logs.length === 0 ? (
            <EmptyState icon={Heart} title="No check-ins yet" className="border-0 bg-muted/10 py-10">
              When you log how you feel, a gentle chart appears here. One entry is enough to begin.
            </EmptyState>
          ) : null}
          {logs.slice(0, 8).map((log) => (
            <div
              key={log.id}
              className="rounded-xl border border-border/70 bg-background/40 px-4 py-3 text-sm transition hover:border-accent/15"
            >
              <span className="font-medium text-foreground">{log.mood}</span>
              <span className="text-muted-foreground"> · intensity {log.intensity}/10</span>
              {log.notes ? <p className="mt-1.5 text-muted-foreground line-clamp-2 leading-relaxed">{log.notes}</p> : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
