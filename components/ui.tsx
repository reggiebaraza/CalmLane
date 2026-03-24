"use client";

import { cva, type VariantProps } from "class-variance-authority";
import Link from "next/link";
import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/80 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-background",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-foreground shadow-sm hover:brightness-[1.06] active:brightness-[0.98]",
        secondary:
          "border border-border/90 bg-card text-foreground shadow-sm hover:bg-muted/25 active:bg-muted/35",
        subtle: "bg-muted/30 text-foreground hover:bg-muted/45",
        danger: "bg-red-700 text-white shadow-sm hover:bg-red-600",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />;
}

export function LinkButton({
  href,
  className,
  variant = "primary",
  children,
}: PropsWithChildren<{ href: string; className?: string; variant?: "primary" | "secondary" }>) {
  return (
    <Link href={href} className={cn(buttonVariants({ variant }), className)}>
      {children}
    </Link>
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass rounded-2xl border border-border/90 bg-card p-6 text-card-foreground shadow-[0_1px_2px_rgba(28,25,23,0.04)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.35)]",
        className,
      )}
      {...props}
    />
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20",
        props.className,
      )}
    />
  );
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20",
        props.className,
      )}
    />
  );
}
