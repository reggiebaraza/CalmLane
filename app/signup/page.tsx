import Link from "next/link";

import { loginWithGoogleAction, signupAction } from "@/app/(auth)/actions";
import { SiteAuthHeader } from "@/components/site-auth-header";
import { Button, Card, Input } from "@/components/ui";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pending?: string }>;
}) {
  const { error, pending } = await searchParams;
  const errorMessage =
    error === "invalid"
      ? "Please use a valid email and a password with at least 8 characters."
      : error === "exists"
        ? "That email may already be registered. Try logging in or reset your password in Supabase Auth."
        : null;

  const pendingEmailMessage =
    pending === "email"
      ? "Check your inbox to confirm your email. After you confirm, you can log in and finish onboarding. If you do not see a message, check spam or ask your project admin whether confirmations are enabled."
      : null;

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <SiteAuthHeader />
      <Card className="w-full">
        <h1 className="text-2xl font-semibold tracking-tight">Create your CalmLane account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A private space for reflection. Not therapy — please read the disclaimer anytime.
        </p>
        {pendingEmailMessage ? (
          <p
            className="mt-3 rounded-lg border border-indigo-300/50 bg-indigo-50 px-3 py-2 text-sm text-indigo-950 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-100"
            role="status"
          >
            {pendingEmailMessage}
          </p>
        ) : null}
        {errorMessage ? (
          <p className="mt-3 rounded-lg border border-red-300/50 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <form action={signupAction} className="mt-5 space-y-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Preferred name
            <Input name="name" placeholder="Preferred name" required autoComplete="name" className="mt-1" />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Email
            <Input name="email" placeholder="you@example.com" type="email" required autoComplete="email" className="mt-1" />
          </label>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Password
            <Input
              name="password"
              placeholder="At least 8 characters"
              type="password"
              required
              autoComplete="new-password"
              minLength={8}
              className="mt-1"
            />
          </label>
          <Button className="w-full" type="submit">
            Create account
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
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent underline-offset-4 hover:underline">
            Log in
          </Link>
        </p>
      </Card>
    </div>
  );
}
