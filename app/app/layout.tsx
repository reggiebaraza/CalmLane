import { AppShell } from "@/components/app-shell";
import { AppThemeClass } from "@/components/app-theme";
import { requireSession } from "@/lib/auth";
import { getBillingContext } from "@/lib/billing/context";
import { getUserPreferences } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();
  const [prefs, billing] = await Promise.all([
    getUserPreferences(session.userId),
    getBillingContext(session.userId),
  ]);
  const dark = prefs?.dark_mode === true;
  return (
    <>
      <AppThemeClass dark={dark} />
      <AppShell planLabel={billing.planLabel}>{children}</AppShell>
    </>
  );
}
