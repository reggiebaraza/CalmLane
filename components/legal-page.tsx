import Link from "next/link";
import type { PropsWithChildren } from "react";

export function LegalPage({ title, children }: PropsWithChildren<{ title: string }>) {
  return (
    <div className="min-h-screen bg-background">
      <a
        href="#legal-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:text-accent-foreground"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-10 border-b border-border/80 bg-card/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link
            href="/"
            className="text-sm font-medium text-accent underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2"
          >
            ← CalmLane home
          </Link>
          <nav className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Legal">
            <Link href="/privacy" className="hover:text-foreground focus-visible:outline-none focus-visible:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground focus-visible:outline-none focus-visible:underline">
              Terms
            </Link>
            <Link href="/disclaimer" className="hover:text-foreground focus-visible:outline-none focus-visible:underline">
              Disclaimer
            </Link>
          </nav>
        </div>
      </header>
      <main
        id="legal-content"
        className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14"
      >
        <h1 className="font-display text-3xl font-medium tracking-tight text-foreground md:text-4xl">{title}</h1>
        <div className="prose-legal mt-8 space-y-6 text-sm leading-relaxed text-muted-foreground md:text-base">
          {children}
        </div>
      </main>
    </div>
  );
}
