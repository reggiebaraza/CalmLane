import Link from "next/link";

import { FadeIn } from "@/components/fade-in";
import { PageHeader } from "@/components/page-header";
import { Card, LinkButton } from "@/components/ui";
import { requireSession } from "@/lib/auth";

export default async function BillingCanceledPage() {
  await requireSession();

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <FadeIn>
        <PageHeader
          eyebrow="Billing"
          title="Checkout canceled"
          description="No worries — nothing was charged. You can keep using CalmLane on the Free plan, or try again whenever you would like more room to reflect."
        />
      </FadeIn>
      <FadeIn delay={0.06}>
        <Card className="border-border/80">
          <div className="flex flex-wrap gap-3">
            <LinkButton href="/app">Return to app</LinkButton>
            <LinkButton href="/pricing" variant="secondary">
              Review plans
            </LinkButton>
          </div>
        </Card>
      </FadeIn>
      <p className="text-center text-sm text-muted-foreground">
        Questions? See{" "}
        <Link href="/pricing" className="font-medium text-accent underline-offset-4 hover:underline">
          Pricing
        </Link>{" "}
        or your account settings.
      </p>
    </div>
  );
}
