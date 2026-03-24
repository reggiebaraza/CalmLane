import type { PropsWithChildren, ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  className,
  children,
}: PropsWithChildren<{
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  className?: string;
}>) {
  return (
    <div
      className={cn(
        "mb-10 flex flex-col gap-8 border-b border-border/80 pb-10 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-2xl space-y-3">
        {eyebrow ? (
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-[1.75rem] font-medium leading-[1.15] tracking-tight text-foreground md:text-[2.125rem]">
          {title}
        </h1>
        {description ? (
          <div className="text-[0.9375rem] leading-relaxed text-muted-foreground md:text-base">{description}</div>
        ) : null}
      </div>
      {children ? <div className="shrink-0">{children}</div> : null}
    </div>
  );
}
