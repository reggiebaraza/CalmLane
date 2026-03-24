export type CompanionTone = "gentle" | "direct" | "reflective" | "structured";

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type ChatMessage = {
  id: string;
  chatId: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
};

export type JournalEntry = {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  aiReflection?: string;
  createdAt: string;
};

export type MoodLog = {
  id: string;
  userId: string;
  mood: string;
  intensity: number;
  emotions: string[];
  notes?: string;
  createdAt: string;
};

export type SafetyEvent = {
  id: string;
  userId: string;
  riskLevel: RiskLevel;
  category:
    | "self-harm"
    | "harm-to-others"
    | "abuse"
    | "psychosis"
    | "medical"
    | "other";
  source: "chat" | "journal";
  createdAt: string;
};
