import Link from "next/link";

import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";
import { Card, LinkButton } from "@/components/ui";
import { requireSession } from "@/lib/auth";

export default async function BillingSuccessPage() {
  await requireSession();

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <FadeIn>
        <PageHeader
          eyebrow="Billing"
          title="You are all set"
          description="Thank you for supporting CalmLane. If Premium is not visible immediately, wait a few seconds — your plan updates as soon as our billing partner confirms the subscription."
        />
      </FadeIn>
      <FadeIn delay={0.06}>
        <Card className="border-border/80">
          <p className="text-sm leading-relaxed text-muted-foreground">
            You can manage or cancel anytime from Settings → Billing. Crisis resources and safety features stay
            available on every plan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <LinkButton href="/app">Back to overview</LinkButton>
            <LinkButton href="/app/settings#billing" variant="secondary">
              Billing settings
            </LinkButton>
          </div>
        </Card>
      </FadeIn>
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/app/chat" className="font-medium text-accent underline-offset-4 hover:underline">
          Continue to chat
        </Link>
      </p>
    </div>
  );
}
