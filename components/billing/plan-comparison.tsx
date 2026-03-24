import Link from "next/link";
import { Check } from "lucide-react";

import { Card, LinkButton } from "@/components/ui";
import { cn } from "@/lib/utils";

const freeFeatures = [
  "Companion chat with a monthly message allowance",
  "Journaling and mood check-ins (monthly caps on Free)",
  "Core coping tools: reset, breathing, grounding, reframing, self-compassion, panic support",
  "Light insights from your streak and recent entries",
  "Crisis resources and safety-aware responses for everyone",
];

const premiumFeatures = [
  "Generous AI chat for ongoing reflection",
  "Unlimited journaling and mood history",
  "Full coping tools library including sleep, work stress, and conversation prep",
  "Advanced pattern summaries and weekly reflection prompts",
  "Searchable chat and journal history",
  "More companion tones and deeper conversation context",
  "Account data export (JSON)",
  "Priority-style access to longer conversation memory",
];

export function PlanComparisonSection({
  className,
  variant = "marketing",
}: {
  className?: string;
  variant?: "marketing" | "compact";
}) {
  const compact = variant === "compact";
  return (
    <section
      className={cn("grid gap-6 lg:grid-cols-2", className)}
      aria-labelledby="plan-comparison-heading"
    >
      <h2 id="plan-comparison-heading" className="sr-only">
        Free and Premium plans
      </h2>
      <Card className={cn("relative flex flex-col border-border/80", !compact && "lg:min-h-[28rem]")}>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Free</p>
        <h3 className="font-display mt-2 text-xl font-medium tracking-tight text-foreground">Foundations</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Enough room to build trust and a rhythm. Safety features and crisis pointers stay available on every plan.
        </p>
        <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
          {freeFeatures.map((f) => (
            <li key={f} className="flex gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8">
          {variant === "marketing" ? (
            <LinkButton href="/signup" variant="secondary" className="w-full sm:w-auto">
              Start free
            </LinkButton>
          ) : (
            <p className="text-xs text-muted-foreground">Your current plan if you have not upgraded.</p>
          )}
        </div>
      </Card>

      <Card
        className={cn(
          "relative flex flex-col border-accent/25 bg-gradient-to-br from-accent/[0.06] via-card to-card shadow-sm",
          !compact && "lg:min-h-[28rem]",
        )}
      >
        <span className="absolute right-5 top-5 rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-accent">
          Premium
        </span>
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Premium</p>
        <h3 className="font-display mt-2 text-xl font-medium tracking-tight text-foreground">More room to reflect</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Unlock depth, continuity, and personalization when you want more guided support — without pressure or tricks.
        </p>
        <ul className="mt-6 flex-1 space-y-3 text-sm text-muted-foreground">
          {premiumFeatures.map((f) => (
            <li key={f} className="flex gap-2.5">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          {variant === "marketing" ? (
            <>
              <LinkButton href="/login" className="w-full sm:w-auto">
                Log in to upgrade
              </LinkButton>
              <Link
                href="/signup"
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border/90 px-4 text-sm font-medium text-foreground transition hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 sm:w-auto"
              >
                Create account
              </Link>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Upgrade from Settings → Billing, or any upgrade prompt in the app.
            </p>
          )}
        </div>
      </Card>
    </section>
  );
}
