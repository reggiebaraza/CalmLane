import Link from "next/link";

import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";
import { Button, Card, LinkButton } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { listToolSessions } from "@/lib/db";

import { startToolSession } from "./actions";

const tools = [
  { slug: "two-minute-reset", title: "2-minute reset", href: "/app/tools/two-minute-reset" },
  { slug: "breathing", title: "Breathing exercise", href: "/app/tools/breathing" },
  { slug: "grounding", title: "Grounding exercise", href: "/app/tools/grounding" },
  { slug: "reframing", title: "Anxious thoughts reframing", href: "/app/tools/reframing" },
  { slug: "self-compassion", title: "Self-compassion prompts", href: "/app/tools/self-compassion" },
  { slug: "sleep", title: "Pre-sleep reflection", href: "/app/tools/sleep" },
  { slug: "panic", title: "Panic support mini-flow", href: "/app/tools/panic" },
  { slug: "work-stress", title: "Work stress decompression", href: "/app/tools/work-stress" },
  { slug: "conversation-prep", title: "Difficult conversation prep", href: "/app/tools/conversation-prep" },
  { slug: "relationships", title: "Relationship reflection prompts", href: "/app/tools/relationships" },
] as const;

const toolBlurbs: Record<(typeof tools)[number]["slug"], string> = {
  "two-minute-reset": "A timed, body-first pause you can finish between meetings.",
  breathing: "Slow inhales and longer exhales — adjust counts to what feels safe.",
  grounding: "5-4-3-2-1 anchors when your mind feels untethered.",
  reframing: "Gentle questions to loosen sticky thoughts — not forced positivity.",
  "self-compassion": "Language for hard moments without turning against yourself.",
  sleep: "Wind-down steps when your head will not quiet at night.",
  panic: "Short sequence while a wave passes; escalate to real help if needed.",
  "work-stress": "Name the load, sort today vs later, pick one small next step.",
  "conversation-prep": "Clarify intent, facts, and a pause phrase before you speak.",
  relationships: "Reflect on needs, clarity, and what you can say calmly.",
};

export default async function ToolsPage() {
  const session = await requireSession();
  const recent = await listToolSessions(session.userId, 12);

  return (
    <div className="space-y-10">
      <FadeIn>
        <PageHeader
          eyebrow="Guided support"
          title="Coping tools"
          description="Short flows you can finish in minutes — on their own or before chat and journaling. Not a substitute for therapy or emergency care."
        />
      </FadeIn>

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool, i) => (
          <FadeIn key={tool.slug} delay={0.04 + i * 0.02}>
            <Card className="flex h-full flex-col border-border/80 transition-shadow duration-300 hover:border-accent/15 hover:shadow-md">
              <h2 className="font-display text-lg font-medium tracking-tight text-foreground">{tool.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{toolBlurbs[tool.slug]}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <form action={startToolSession.bind(null, tool.title)}>
                  <Button type="submit" variant="secondary">
                    Save to history
                  </Button>
                </form>
                <LinkButton href={tool.href}>Open guided flow</LinkButton>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>

      {recent.length > 0 ? (
        <FadeIn delay={0.12}>
          <Card className="border-border/80">
            <h2 className="font-display text-lg font-medium tracking-tight text-foreground">Recent sessions</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              A light history of tools you started from this page.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {recent.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-0.5 border-b border-border/50 pb-2 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="font-medium text-foreground">{row.tool_name}</span>
                  <time className="text-xs tabular-nums">{new Date(row.created_at).toLocaleString()}</time>
                </li>
              ))}
            </ul>
          </Card>
        </FadeIn>
      ) : null}

      <p className="text-center text-sm text-muted-foreground">
        <Link
          href="/app/insights"
          className="font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
        >
          See how mood and journaling fit together
        </Link>
      </p>
    </div>
  );
}
