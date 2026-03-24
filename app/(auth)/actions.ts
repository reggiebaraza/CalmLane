"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { clearSession } from "@/lib/auth";
import { env } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2).optional(),
});

export async function signupAction(formData: FormData) {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
  });
  if (!parsed.success) redirect("/signup?error=invalid");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { name: parsed.data.name ?? "CalmLane User" },
    },
  });
  if (error) redirect("/signup?error=exists");
  if (!data.session) {
    redirect("/signup?pending=email");
  }
  redirect("/onboarding");
}

export async function loginAction(formData: FormData) {
  const parsed = authSchema.omit({ name: true }).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/login?error=invalid");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error) redirect("/login?error=invalid");
  redirect("/app");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function loginWithGoogleAction() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/app`,
      skipBrowserRedirect: true,
    },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}
