/** Plain-text first response when local risk is high/critical — LLM is not invoked. */
export function crisisFirstResponse(): string {
  return [
    "I'm really glad you reached out. What you're sharing sounds serious, and you deserve support from real people who can help right now — not from an AI chat.",
    "",
    "If you might be in immediate danger, or could hurt yourself or someone else, contact your local emergency number now.",
    "",
    "In the United States, you can call or text 988 for the Suicide & Crisis Lifeline. If you're outside the U.S., search for a crisis helpline in your country or go to the nearest emergency department.",
    "",
    "Is there someone you trust who you could be with or call, even for a few minutes?",
  ].join("\n");
}
