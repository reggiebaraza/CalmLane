import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { LanguageModelV3 } from "@ai-sdk/provider";

import { env } from "@/lib/env";

export type ChatLlmProvider = "openai" | "google";

export function getChatLanguageModel(): { model: LanguageModelV3; provider: ChatLlmProvider } | null {
  if (env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const googleProvider = createGoogleGenerativeAI({
      apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
    });
    return {
      model: googleProvider(env.GOOGLE_GENERATIVE_AI_MODEL ?? "gemini-2.0-flash-lite"),
      provider: "google",
    };
  }
  if (env.OPENAI_API_KEY) {
    return {
      model: openai.chat(env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini"),
      provider: "openai",
    };
  }
  return null;
}
