import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ToolStepList } from "@/components/tool-step-list";
import { Card } from "@/components/ui";
import { requireSession } from "@/lib/auth";
import { getBillingContext } from "@/lib/billing/context";
import { canUseToolSlug } from "@/lib/plans";

const TOOL_CONTENT: Record<string, { title: string; steps: string[] }> = {
  "two-minute-reset": {
    title: "2-minute reset",
    steps: [
      "Set a gentle timer for two minutes. You can stop sooner if you need to.",
      "Feet on the floor. Notice contact and weight — no need to change anything.",
      "Breathe in through your nose for 4, out for 6 if that feels okay; otherwise just lengthen the exhale slightly.",
      "Name one thing you see and one sound you hear — simple anchors.",
      "When the timer ends, roll your shoulders once and choose your next small action.",
    ],
  },
  breathing: {
    title: "Breathing exercise",
    steps: [
      "Sit or stand comfortably. Soften your shoulders.",
      "Inhale through your nose for 4 counts.",
      "Hold gently for 2 counts (only if that feels okay).",
      "Exhale slowly through your mouth for 6 counts.",
      "Repeat 4–6 rounds at your own pace.",
    ],
  },
  grounding: {
    title: "Grounding exercise",
    steps: [
      "Name 5 things you can see.",
      "Name 4 things you can touch or feel.",
      "Name 3 things you can hear.",
      "Name 2 things you can smell or like the smell of.",
      "Name 1 thing you are grateful for or that is okay right now.",
    ],
  },
  reframing: {
    title: "Anxious thoughts reframing",
    steps: [
      "What is the thought that showed up?",
      "What evidence supports it? What evidence might soften it?",
      "If a friend felt this way, what might you say to them?",
      "What is one slightly kinder or more balanced sentence you can try?",
    ],
  },
  "self-compassion": {
    title: "Self-compassion prompts",
    steps: [
      "This is a moment of difficulty — many people feel this way sometimes.",
      "You are not alone in struggling; it does not make you less worthy.",
      "What do you need right now: rest, connection, boundaries, or comfort?",
      "One small compassionate action you can take in the next hour:",
    ],
  },
  sleep: {
    title: "Pre-sleep reflection",
    steps: [
      "Dim lights and put screens away if you can.",
      "Write one line on your mind onto paper, then close the notebook.",
      "Slow breathing: longer exhale than inhale, 5–8 rounds.",
      "Pick a calming word or phrase to repeat gently.",
    ],
  },
  panic: {
    title: "Panic support mini-flow",
    steps: [
      "You are safe enough to read this — the wave can pass.",
      "Feet on the floor. Press down gently and notice the support.",
      "Name where you are: city, room, one object near you.",
      "Slow exhale, then inhale — repeat at a pace that feels possible.",
      "If symptoms feel medical or severe, contact emergency services.",
    ],
  },
  "work-stress": {
    title: "Work stress decompression",
    steps: [
      "Pause for 60 seconds — no new tasks.",
      "Name the top stressor in one short phrase.",
      "What is truly due today vs what can wait?",
      "One 10-minute step you can take next:",
      "One boundary you could set kindly (even small):",
    ],
  },
  "conversation-prep": {
    title: "Difficult conversation prep",
    steps: [
      "Name the conversation in one neutral sentence (topic only, no story yet).",
      "What outcome would feel respectful to you, even if it is not perfect?",
      "What is one fact you want to state calmly, without proving you're right?",
      "What is one question you could ask to understand the other person's view?",
      "If tension rises, what pause phrase will you use (e.g. “I need a minute”)?",
    ],
  },
  relationships: {
    title: "Relationship reflection prompts",
    steps: [
      "What do I need from this connection right now?",
      "What feels unclear or unresolved?",
      "What is one thing I can communicate calmly and directly?",
      "What is one thing I can let be, for now?",
    ],
  },
};

export default async function ToolFlowPage({ params }: { params: Promise<{ slug: string }> }) {
  const session = await requireSession();
  const { slug } = await params;
  const tool = TOOL_CONTENT[slug];
  if (!tool) notFound();
  const billing = await getBillingContext(session.userId);
  if (!canUseToolSlug(slug, billing.entitlements)) {
    redirect("/pricing?reason=tool");
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <Link
        href="/app/tools"
        className="inline-flex text-sm font-medium text-accent underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2"
      >
        ← All tools
      </Link>
      <div>
        <h1 className="font-display text-[1.75rem] font-medium tracking-tight text-foreground md:text-[2rem]">
          {tool.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Go at your own pace. Skip or adapt any step.</p>
      </div>
      <Card>
        <ToolStepList steps={tool.steps} />
      </Card>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Guided self-help only — not therapy or medical advice. If you are in immediate danger, contact local emergency
        services.
      </p>
    </div>
  );
}
