import Link from "next/link";

export function SiteAuthHeader() {
  return (
    <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-6">
      <Link
        href="/"
        className="font-display text-lg font-medium tracking-tight text-foreground transition hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2"
      >
        CalmLane
      </Link>
      <nav className="flex flex-wrap gap-4 text-xs text-muted-foreground" aria-label="Legal">
        <Link href="/disclaimer" className="hover:text-foreground focus-visible:underline">
          Disclaimer
        </Link>
        <Link href="/privacy" className="hover:text-foreground focus-visible:underline">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-foreground focus-visible:underline">
          Terms
        </Link>
      </nav>
    </header>
  );
}
