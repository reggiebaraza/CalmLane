import { z } from "zod";

import type { RiskLevel } from "@/lib/types";

const riskSchema = z.object({
  riskLevel: z.enum(["low", "moderate", "high", "critical"]),
  category: z.enum([
    "self-harm",
    "harm-to-others",
    "abuse",
    "psychosis",
    "medical",
    "other",
  ]),
  rationale: z.string().min(1),
});

const dangerPatterns: Array<{
  regex: RegExp;
  risk: RiskLevel;
  category: z.infer<typeof riskSchema>["category"];
}> = [
  { regex: /\b(kill myself|end my life|suicide plan)\b/i, risk: "critical", category: "self-harm" },
  { regex: /\b(cut myself|self harm|hurt myself)\b/i, risk: "high", category: "self-harm" },
  { regex: /\b(kill them|hurt someone|violent plan)\b/i, risk: "critical", category: "harm-to-others" },
  { regex: /\b(being abused|unsafe at home|domestic violence)\b/i, risk: "high", category: "abuse" },
  { regex: /\b(hearing voices|seeing things|not real)\b/i, risk: "high", category: "psychosis" },
  { regex: /\b(chest pain|can't breathe|overdose|seizure)\b/i, risk: "critical", category: "medical" },
];

export function classifyRiskLocally(input: string) {
  for (const pattern of dangerPatterns) {
    if (pattern.regex.test(input)) {
      return riskSchema.parse({
        riskLevel: pattern.risk,
        category: pattern.category,
        rationale: "Keyword safety heuristic triggered.",
      });
    }
  }
  return riskSchema.parse({
    riskLevel: "low",
    category: "other",
    rationale: "No high-risk patterns detected.",
  });
}

export const crisisCountries: Record<string, { emergency: string; hotline: string; text?: string }> = {
  US: { emergency: "911", hotline: "988 Suicide & Crisis Lifeline", text: "Text or call 988" },
  UK: { emergency: "999", hotline: "Samaritans 116 123" },
  CA: { emergency: "911", hotline: "Talk Suicide Canada 1-833-456-4566" },
  AU: { emergency: "000", hotline: "Lifeline 13 11 14" },
  IN: { emergency: "112", hotline: "Tele-MANAS 14416 or 1-800-891-4416" },
};
