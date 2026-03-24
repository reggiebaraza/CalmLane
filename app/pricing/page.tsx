import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { PlanComparisonSection } from "@/components/billing/plan-comparison";
import { Card, LinkButton } from "@/components/ui";

const billingFaq = [
  {
    q: "Can I stay on Free?",
    a: "Yes. Free is designed to be genuinely useful — not a hollow trial. Upgrade only when you want more room to reflect.",
  },
  {
    q: "What payment methods does Stripe support?",
    a: "Cards and other methods your Stripe account enables. Charges are handled by Stripe; we do not store your full card details.",
  },
  {
    q: "How do I cancel?",
    a: "Open Settings → Billing → Manage subscription to use the secure Stripe billing portal. You keep Premium access through the period you already paid for when applicable.",
  },
  {
    q: "Are crisis resources paywalled?",
    a: "No. Crisis hints, safety-aware responses, and urgent-help entry points stay available on every plan.",
  },
  {
    q: "Is this therapy?",
    a: "No. CalmLane is AI-supported reflection and coping skills — not licensed mental health care.",
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-16">
      <header className="mb-12 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="font-display text-xl font-medium tracking-tight text-foreground">
          CalmLane
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2"
          >
            Log in
          </Link>
          <LinkButton href="/signup">Create account</LinkButton>
        </div>
      </header>

      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Pricing</p>
        <h1 className="font-display mt-3 text-3xl font-medium tracking-tight text-foreground md:text-4xl">
          Calm support, clear boundaries
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
          Choose Free to build a habit, or Premium when you want deeper continuity, search, and the full tool library.
          No guilt trips — upgrade when it feels right for you.
        </p>
      </div>

      <div className="mt-14">
        <PlanComparisonSection />
      </div>

      <section className="mt-20" aria-labelledby="billing-faq">
        <h2 id="billing-faq" className="font-display text-center text-2xl font-medium tracking-tight text-foreground">
          Billing questions
        </h2>
        <div className="mx-auto mt-8 grid max-w-3xl gap-3">
          {billingFaq.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-border/80 bg-card px-5 py-4 shadow-sm open:shadow-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-left font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown
                  className="h-4 w-4 shrink-0 text-muted-foreground transition group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <Card className="mt-16 border-border/80 text-center">
        <p className="font-display text-lg font-medium text-foreground">Already using CalmLane?</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage your plan in the app under Settings → Billing after you log in.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <LinkButton href="/app">Open app</LinkButton>
          <LinkButton href="/" variant="secondary">
            Back home
          </LinkButton>
        </div>
      </Card>

      <footer className="mt-16 border-t border-border pt-8 text-center text-sm text-muted-foreground">
        <Link href="/privacy" className="underline-offset-4 hover:underline">
          Privacy
        </Link>
        <span className="mx-2">·</span>
        <Link href="/terms" className="underline-offset-4 hover:underline">
          Terms
        </Link>
      </footer>
    </main>
  );
}
