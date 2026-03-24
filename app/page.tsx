import Link from "next/link";
import { Check, Shield } from "lucide-react";

import { AnimatedHero } from "@/components/animated-hero";
import { LandingStaggerGrid, LandingStaggerItem } from "@/components/landing-stagger";
import { Card, LinkButton } from "@/components/ui";

const pillars = [
  {
    title: "How it works",
    body: "Short chats, journaling, mood check-ins, and guided tools — so you can slow down, name what you feel, and pick one doable next step.",
  },
  {
    title: "Privacy and trust",
    body: "Your reflections stay with your account. We are explicit that this is not a substitute for licensed clinicians or emergency responders.",
  },
  {
    title: "Mood tracking",
    body: "Light check-ins to notice patterns over time. For self-awareness only — never for diagnosis or treatment decisions.",
  },
  {
    title: "Journaling",
    body: "Write without an audience. Prompts are suggestions; the page is yours. Nothing here trains a public model on your behalf in this codebase.",
  },
  {
    title: "Coping tools",
    body: "Breathing, grounding, reframing, and more — short flows you can finish before your next meeting or message.",
  },
  {
    title: "Safety first",
    body: "When language suggests serious risk, we prioritize crisis resources and plain-spoken limits of AI support.",
  },
] as const;

const faq = [
  {
    q: "Is this therapy?",
    a: "No. CalmLane is an AI companion for reflection and coping skills. It is not delivered by licensed therapists, physicians, or crisis teams.",
  },
  {
    q: "Will you diagnose me?",
    a: "No. The product avoids clinical labels and does not assess mental health conditions.",
  },
  {
    q: "What if I'm in danger?",
    a: "Call your local emergency number now and reach someone you trust who can stay with you. Inside the app you will also see regional crisis lines when relevant.",
  },
  {
    q: "Can I use this instead of medication or therapy?",
    a: "CalmLane can sit alongside self-care, but it does not replace treatment you choose with a qualified professional.",
  },
] as const;

export default function Home() {
  return (
    <main id="marketing-main" className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-14">
      <a
        href="#hero-heading"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <header className="mb-12 flex flex-wrap items-center justify-between gap-4">
        <p className="font-display text-xl font-medium tracking-tight text-foreground">CalmLane</p>
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

      <AnimatedHero>
        <section className="mb-16 text-center" aria-labelledby="hero-heading">
          <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5 text-accent" aria-hidden />
            AI support · clear boundaries · privacy-minded
          </p>
          <h1
            id="hero-heading"
            className="font-display mx-auto max-w-3xl text-4xl font-medium tracking-tight text-foreground md:text-[3.25rem] md:leading-[1.12]"
          >
            Support for the moment you&apos;re in.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            CalmLane is a calm space for conversation, journaling, mood check-ins, and coping tools. It is{" "}
            <span className="font-medium text-foreground">not</span> therapy, medical advice, or an emergency service.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <LinkButton href="/signup">Start free</LinkButton>
            <Link
              href="/disclaimer"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border px-4 text-sm font-medium transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2"
            >
              Read disclaimer
            </Link>
          </div>
        </section>
      </AnimatedHero>

      <LandingStaggerGrid className="mb-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map((item) => (
          <LandingStaggerItem key={item.title}>
            <Card className="h-full border-border/80 transition-shadow duration-300 hover:border-accent/12 hover:shadow-md">
              <h3 className="font-display text-base font-medium text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </Card>
          </LandingStaggerItem>
        ))}
      </LandingStaggerGrid>

      <section className="mb-16 grid gap-6 md:grid-cols-2" aria-labelledby="trust-heading">
        <h2 id="trust-heading" className="sr-only">
          Trust and pricing
        </h2>
        <Card className="border-border/80 md:col-span-1">
          <h3 className="font-display text-lg font-medium text-foreground">Built for emotional safety</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              Clear AI boundaries — no dependency language or pretend-human claims.
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              Risk-aware chat behavior with regional crisis hints when appropriate.
            </li>
            <li className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              Data tied to your account; secured by your Supabase project policies.
            </li>
          </ul>
        </Card>
        <Card className="border-border/80 md:col-span-1">
          <h3 className="font-display text-lg font-medium text-foreground">Straightforward access</h3>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Core experiences are free in this release. If paid options appear later, they will be labeled clearly and
            will not change crisis resources or safety copy.
          </p>
        </Card>
      </section>

      <section className="space-y-4" aria-labelledby="faq-heading">
        <h2 id="faq-heading" className="font-display text-2xl font-medium tracking-tight text-foreground">
          Common questions
        </h2>
        <LandingStaggerGrid className="grid gap-3 md:grid-cols-2">
          {faq.map((item) => (
            <LandingStaggerItem key={item.q}>
              <Card>
                <p className="font-medium text-foreground">{item.q}</p>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.a}</p>
              </Card>
            </LandingStaggerItem>
          ))}
        </LandingStaggerGrid>
      </section>

      <footer className="mt-16 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground focus-visible:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground focus-visible:underline">
            Terms
          </Link>
          <Link href="/disclaimer" className="hover:text-foreground focus-visible:underline">
            Disclaimer
          </Link>
        </div>
        <Link
          href="/login"
          className="text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
        >
          Already have an account? Log in
        </Link>
      </footer>
    </main>
  );
}
