"use client";

import { useEffect, useId, useRef, useState } from "react";

const CONSENT_KEY = "calmlane-cookie-consent";

export function CookieConsent() {
  const titleId = useId();
  const acceptRef = useRef<HTMLButtonElement>(null);
  const [dismissed, setDismissed] = useState(false);
  const [ready, setReady] = useState(false);
  const [hasSavedChoice, setHasSavedChoice] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setHasSavedChoice(window.localStorage.getItem(CONSENT_KEY) !== null);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready || hasSavedChoice || dismissed) return;
    acceptRef.current?.focus();
  }, [ready, hasSavedChoice, dismissed]);

  if (!ready || hasSavedChoice || dismissed) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-2xl border border-border bg-card/95 p-4 text-card-foreground shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-card/90 dark:border-slate-600 dark:bg-slate-900/95"
    >
      <p id={titleId} className="text-sm font-medium text-foreground">
        Cookies & analytics
      </p>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
        We use essential cookies for sign-in. Optional analytics (e.g. Vercel) help us understand usage in aggregate.
        You can decline non-essential tracking here; adjust your deployment if you add more trackers.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          ref={acceptRef}
          type="button"
          className="rounded-xl bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
          onClick={() => {
            window.localStorage.setItem(CONSENT_KEY, "accepted");
            setDismissed(true);
          }}
        >
          Accept
        </button>
        <button
          type="button"
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background"
          onClick={() => {
            window.localStorage.setItem(CONSENT_KEY, "declined");
            setDismissed(true);
          }}
        >
          Essential only
        </button>
      </div>
    </div>
  );
}
