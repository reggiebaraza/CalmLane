import Link from "next/link";

import { loginAction, loginWithGoogleAction } from "@/app/(auth)/actions";
import { SiteAuthHeader } from "@/components/site-auth-header";
import { Button, Card, Input } from "@/components/ui";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage =
    error === "invalid"
      ? "Check your email and password and try again."
      : error === "oauth"
        ? "Google sign-in could not start. Try again or use email."
        : null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <SiteAuthHeader />
      <Card className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          CalmLane is AI emotional support, not professional therapy or crisis care.
        </p>
        {errorMessage ? (
          <p className="mt-3 rounded-lg border border-red-300/50 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <form action={loginAction} className="mt-5 space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
            <Input name="email" placeholder="you@example.com" type="email" required autoComplete="email" className="mt-1" />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Password
            <Input
              name="password"
              placeholder="Password"
              type="password"
              required
              autoComplete="current-password"
              className="mt-1"
            />
          </label>
          <Button className="w-full" type="submit">
            Log in
          </Button>
        </form>
        <form action={loginWithGoogleAction}>
          <button
            type="submit"
            className="mt-3 w-full rounded-xl border border-border px-4 py-2 text-sm text-foreground transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/70 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-card"
          >
            Continue with Google
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link href="/signup" className="font-medium text-accent underline-offset-4 hover:underline">
            Create account
          </Link>
        </p>
      </Card>
    </div>
  );
}
