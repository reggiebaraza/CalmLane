"use client";

import { useEffect } from "react";

/** Applies saved dark preference inside the app shell (class-based dark mode). */
export function AppThemeClass({ dark }: { dark: boolean }) {
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    return () => {
      document.documentElement.classList.remove("dark");
    };
  }, [dark]);
  return null;
}
