"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LifeBuoy, Menu, Sparkles, X } from "lucide-react";
import type { PropsWithChildren } from "react";
import { useState } from "react";

import { cn } from "@/lib/utils";

type AppShellProps = PropsWithChildren<{
  planLabel?: string;
}>;

const nav = [
  ["Overview", "/app"],
  ["Chat", "/app/chat"],
  ["Journal", "/app/journal"],
  ["Mood", "/app/mood"],
  ["Tools", "/app/tools"],
  ["Insights", "/app/insights"],
  ["Settings", "/app/settings"],
] as const;

function NavLinks({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <nav className="space-y-0.5" aria-label="Main">
      {nav.map(([label, href]) => {
        const active =
          href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "block rounded-xl px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-card",
              active
                ? "bg-accent/10 font-medium text-foreground shadow-[inset_3px_0_0_0_var(--accent)]"
                : "text-muted-foreground hover:bg-muted/25 hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, planLabel = "Free" }: AppShellProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl gap-6 px-4 py-5 sm:py-7 md:gap-8 md:px-6 lg:px-8">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-accent-foreground"
      >
        Skip to main content
      </a>
      <aside className="hidden w-[17rem] shrink-0 md:block">
        <div className="sticky top-6 flex flex-col overflow-hidden rounded-2xl border border-border/90 bg-card/90 shadow-[0_1px_3px_rgba(28,25,23,0.06)] backdrop-blur-md dark:shadow-[0_1px_3px_rgba(0,0,0,0.4)]">
          <div className="border-b border-border/60 bg-gradient-to-br from-accent/[0.06] to-transparent px-5 py-6">
            <div className="flex items-start gap-3">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/12 text-accent"
                aria-hidden
              >
                <Sparkles className="h-5 w-5 stroke-[1.5]" />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">CalmLane</p>
                <h2 className="font-display mt-1.5 text-lg font-medium leading-snug tracking-tight text-foreground">
                  Your calm space
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  Supportive AI for reflection — not therapy or crisis care.
                </p>
                <p className="mt-3">
                  <span className="inline-flex items-center rounded-full border border-border/80 bg-muted/20 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">
                    {planLabel}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div className="px-3 py-4">
            <NavLinks pathname={pathname} />
            <Link
              href="/app/chat"
              className="mt-5 flex items-center gap-2.5 rounded-xl border border-rose-200/80 bg-rose-50/90 px-3 py-2.5 text-sm text-rose-900 transition hover:bg-rose-100/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60 focus-visible:ring-offset-2 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100 dark:hover:bg-rose-950/60 dark:focus-visible:ring-offset-card"
            >
              <LifeBuoy className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
              <span className="font-medium">Need urgent help?</span>
            </Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="mb-5 flex items-center justify-between gap-3 md:hidden">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border/90 bg-card px-3.5 py-2.5 text-sm font-medium shadow-sm transition hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
            onClick={() => setMobileOpen(true)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-drawer"
          >
            <Menu className="h-4 w-4 text-muted-foreground" aria-hidden />
            Menu
          </button>
          <Link
            href="/app/chat"
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200/90 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/45 dark:text-rose-100"
          >
            <LifeBuoy className="h-3.5 w-3.5" aria-hidden />
            Urgent help
          </Link>
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              key="mobile-drawer"
              id="mobile-drawer"
              className="fixed inset-0 z-50 md:hidden"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
            >
              <button
                type="button"
                className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              />
              <motion.div
                initial={reduceMotion ? false : { x: -300 }}
                animate={{ x: 0 }}
                exit={reduceMotion ? undefined : { x: -300 }}
                transition={{ type: "spring", stiffness: 340, damping: 36 }}
                className="absolute left-0 top-0 flex h-full w-[min(100%,300px)] flex-col border-r border-border/90 bg-card shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-border/60 px-4 py-4">
                  <div>
                    <p className="font-display text-base font-medium text-foreground">CalmLane</p>
                    <p className="text-xs text-muted-foreground">Navigate</p>
                    <p className="mt-1.5">
                      <span className="inline-flex rounded-full border border-border/80 bg-muted/20 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        {planLabel}
                      </span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-xl p-2 text-muted-foreground transition hover:bg-muted/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-4">
                  <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
                  <Link
                    href="/app/chat"
                    onClick={() => setMobileOpen(false)}
                    className="mt-6 flex items-center gap-2 rounded-xl border border-rose-200/80 bg-rose-50 px-3 py-2.5 text-sm text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-100"
                  >
                    <LifeBuoy className="h-4 w-4" aria-hidden />
                    Need urgent help?
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main id="main-content" className="min-w-0 flex-1 scroll-mt-6 pb-10 md:pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
