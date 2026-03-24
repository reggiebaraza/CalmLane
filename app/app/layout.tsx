import { AppShell } from "@/components/app-shell";
import { AppThemeClass } from "@/components/app-theme";
import { requireSession } from "@/lib/auth";
import { getUserPreferences } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();
  const prefs = await getUserPreferences(session.userId);
  const dark = prefs?.dark_mode === true;
  return (
    <>
      <AppThemeClass dark={dark} />
      <AppShell>{children}</AppShell>
    </>
  );
}
