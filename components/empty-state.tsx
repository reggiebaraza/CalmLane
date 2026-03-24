import type { LucideIcon } from "lucide-react";
import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  className,
}: PropsWithChildren<{
  icon?: LucideIcon;
  title: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl border border-dashed border-border/90 bg-muted/15 px-6 py-14 text-center",
        className,
      )}
    >
      {Icon ? (
        <div
          className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent"
          aria-hidden
        >
          <Icon className="h-7 w-7 stroke-[1.35]" />
        </div>
      ) : null}
      <h3 className="font-display text-lg font-medium tracking-tight text-foreground">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{children}</p>
      {action ? <div className="mt-8 w-full max-w-xs">{action}</div> : null}
    </div>
  );
}
