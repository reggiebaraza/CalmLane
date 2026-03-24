import { AlertTriangle } from "lucide-react";

import { Card } from "@/components/ui";
import { crisisCountries } from "@/lib/safety";

export function CrisisResourcesPanel({ country = "US" }: { country?: string }) {
  const resources = crisisCountries[country] ?? crisisCountries.US;
  return (
    <Card className="border-rose-300 bg-rose-50/70 dark:bg-rose-950/20">
      <div className="mb-2 flex items-center gap-2 text-rose-800 dark:text-rose-200">
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
        <h3 className="font-semibold">If you might be in danger</h3>
      </div>
      <p className="text-sm text-rose-900/90 dark:text-rose-200 leading-relaxed">
        CalmLane cannot respond in real time like a crisis service. If harm may be imminent, contact emergency
        services where you are and reach a trusted person who can stay with you.
      </p>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-rose-900/95 dark:text-rose-100/90">
        <li>Emergency number (region): {resources.emergency}</li>
        <li>{resources.hotline}</li>
        {resources.text ? <li>{resources.text}</li> : null}
        <li>If you can, go somewhere safe and stay with someone you trust.</li>
      </ul>
      <p className="mt-3 text-xs text-rose-900/80 dark:text-rose-200/80">
        Hotlines vary by country; verify numbers for your area. This panel is informational, not a substitute for local
        services.
      </p>
    </Card>
  );
}

export function SafetyAlert() {
  return (
    <Card className="border-border/80 bg-muted/10">
      <p className="text-sm leading-relaxed text-muted-foreground">
        CalmLane is an AI companion for reflection and coping. It is not a therapist, doctor, or emergency service and
        does not diagnose conditions. If you are unsafe, use emergency resources — not this chat alone.
      </p>
    </Card>
  );
}
