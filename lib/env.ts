import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_CHAT_MODEL: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_MODEL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_PREMIUM_MONTHLY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

export const env = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_CHAT_MODEL: process.env.OPENAI_CHAT_MODEL,
  GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
  GOOGLE_GENERATIVE_AI_MODEL: process.env.GOOGLE_GENERATIVE_AI_MODEL,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_PREMIUM_MONTHLY: process.env.STRIPE_PRICE_PREMIUM_MONTHLY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
});

export const hasOpenAI = Boolean(env.OPENAI_API_KEY);
export const hasGoogleGemini = Boolean(env.GOOGLE_GENERATIVE_AI_API_KEY);
export const hasChatLlm = hasOpenAI || hasGoogleGemini;
export const hasSupabase = Boolean(env.NEXT_PUBLIC_SUPABASE_URL && env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export const hasStripe =
  Boolean(env.STRIPE_SECRET_KEY) &&
  Boolean(env.STRIPE_PRICE_PREMIUM_MONTHLY) &&
  Boolean(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export const hasStripeWebhook = Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_WEBHOOK_SECRET);
