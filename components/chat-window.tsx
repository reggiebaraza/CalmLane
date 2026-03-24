"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BookMarked, Copy, Info, Loader2, MessageCircle, RefreshCcw } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { saveChatExcerptToJournalDirect } from "@/app/app/chat/actions";
import { CrisisResourcesPanel } from "@/components/safety-alert";
import { Button, Card, Textarea } from "@/components/ui";

const SUGGESTED_PROMPTS = [
  "I'm feeling overwhelmed and need to slow down.",
  "Something happened today that's still on my mind.",
  "I'd like help naming what I'm feeling.",
  "Can we try a short grounding exercise together?",
];

export type ChatMessageVM = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export function ChatWindow({
  chatId,
  initialMessages,
  crisisCountry = "US",
}: {
  chatId: string;
  initialMessages: ChatMessageVM[];
  crisisCountry?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [showCrisis, setShowCrisis] = useState(false);
  const [llmOffline, setLlmOffline] = useState(false);
  const [messages, setMessages] = useState<ChatMessageVM[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      const userMessage: ChatMessageVM = {
        id: crypto.randomUUID(),
        role: "user",
        content: input.trim(),
      };
      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setInput("");
      setIsLoading(true);
      setSendError(null);
      setLlmOffline(false);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ conversationId: chatId, content: userMessage.content }),
        });

        const risk = response.headers.get("x-calmlane-risk");
        if (risk === "high" || risk === "critical") {
          setShowCrisis(true);
        }
        if (response.headers.get("x-calmlane-runtime") === "offline") {
          setLlmOffline(true);
        }

        if (!response.ok) {
          const errText = response.status === 401 ? "Please sign in again." : "Something went wrong. Try again.";
          setSendError(errText);
          setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
          setInput(userMessage.content);
          return;
        }

        if (response.headers.get("x-calmlane-stream") === "1" && response.body) {
          const assistantId = crypto.randomUUID();
          setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let assistantText = "";
          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              assistantText += decoder.decode(value, { stream: true });
              const chunk = assistantText;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: chunk } : m)),
              );
            }
            assistantText += decoder.decode();
            setMessages((prev) =>
              prev.map((m) => (m.id === assistantId ? { ...m, content: assistantText } : m)),
            );
          } catch {
            setSendError("Stream interrupted. Your message was saved; try sending a follow-up.");
            setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          }
        } else {
          const text = await response.text();
          setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: text }]);
        }
      } catch {
        setSendError("Network error. Check your connection and try again.");
        setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
        setInput(userMessage.content);
      } finally {
        setIsLoading(false);
      }
    },
    [chatId, input, isLoading, messages],
  );

  function regenerate() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setInput(lastUser.content);
  }

  async function copyLastAssistant() {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant?.content) {
      toast.message("Nothing to copy yet.");
      return;
    }
    try {
      await navigator.clipboard.writeText(lastAssistant.content);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Could not copy");
    }
  }

  async function saveLastToJournal() {
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant?.content?.trim()) {
      toast.message("Send a message first to save a reflection.");
      return;
    }
    const result = await saveChatExcerptToJournalDirect(lastAssistant.content);
    if (result.ok) toast.success("Saved to your journal");
    else toast.error(result.error ?? "Could not save");
  }

  function applySuggestion(text: string) {
    setInput(text);
  }

  return (
    <Card className="space-y-5 p-5 sm:p-6">
      <div className="flex gap-3 rounded-2xl border border-border/80 bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent opacity-90" aria-hidden />
        <p>
          <span className="font-medium text-foreground/90">AI companion.</span> Not therapy, crisis care, or medical
          advice. For urgent help, use the resources on this page when shown.
        </p>
      </div>

      {llmOffline ? (
        <p
          className="rounded-2xl border border-amber-500/35 bg-amber-50/90 px-4 py-3 text-sm leading-relaxed text-amber-950 dark:bg-amber-950/25 dark:text-amber-50"
          role="status"
        >
          The AI service is temporarily unavailable. You can still use journaling, mood check-ins, and coping tools. If
          you self-host, add an API key in environment variables and restart.
        </p>
      ) : null}

      {showCrisis ? (
        <div className="space-y-3">
          <CrisisResourcesPanel country={crisisCountry} />
        </div>
      ) : null}

      {sendError ? (
        <p
          className="rounded-2xl border border-red-400/35 bg-red-50/90 px-4 py-3 text-sm text-red-950 dark:bg-red-950/30 dark:text-red-50"
          role="alert"
        >
          {sendError}
        </p>
      ) : null}

      <div
        className="min-h-[min(280px,42vh)] space-y-4 overflow-y-auto rounded-2xl border border-border/50 bg-background/40 px-3 py-4 sm:min-h-[min(360px,50vh)] sm:px-4 md:max-h-[min(520px,58vh)]"
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-10 text-center sm:py-14">
            <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
              <div
                className="absolute inset-0 rounded-full bg-accent/[0.07]"
                aria-hidden
              />
              <div
                className="absolute inset-4 rounded-full border border-border/60"
                aria-hidden
              />
              <MessageCircle
                className="relative z-[1] h-9 w-9 text-muted-foreground/55"
                strokeWidth={1.25}
                aria-hidden
              />
            </div>
            <p className="font-display text-base font-medium text-foreground">Begin when you are ready</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Choose a gentle opener or write your own first line. There is no wrong way to start.
            </p>
            <div className="mt-8 flex w-full max-w-lg flex-wrap justify-center gap-2">
              {SUGGESTED_PROMPTS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => applySuggestion(p)}
                  className="max-w-full rounded-full border border-border/90 bg-card px-4 py-2 text-left text-xs leading-snug text-foreground shadow-sm transition hover:border-accent/35 hover:bg-accent/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 sm:text-[0.8125rem]"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : null}
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={reduceMotion ? false : { opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] as const }}
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                message.role === "user"
                  ? "max-w-[min(100%,34rem)] rounded-2xl rounded-br-md bg-accent px-4 py-3 text-[0.9375rem] leading-[1.65] text-accent-foreground shadow-sm"
                  : "max-w-[min(100%,36rem)] rounded-2xl rounded-bl-md border border-border/70 bg-card/90 px-4 py-3 text-[0.9375rem] leading-[1.65] text-card-foreground shadow-sm"
              }
            >
              <span className="whitespace-pre-wrap break-words">{message.content}</span>
            </div>
          </motion.div>
        ))}
        {isLoading ? (
          <p className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-accent" aria-hidden />
            <span>CalmLane is thinking…</span>
          </p>
        ) : null}
      </div>

      <form onSubmit={sendMessage} className="space-y-3">
        <label className="sr-only" htmlFor="calmlane-chat-input">
          Your message
        </label>
        <Textarea
          id="calmlane-chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share what feels present right now…"
          rows={4}
          disabled={isLoading}
          className="min-h-[5.5rem] resize-y"
        />
        <div className="flex flex-wrap gap-2">
          <Button type="submit" variant="primary" disabled={isLoading || !input.trim()} aria-busy={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Sending
              </>
            ) : (
              "Send"
            )}
          </Button>
          <Button type="button" variant="secondary" onClick={regenerate} disabled={isLoading}>
            <RefreshCcw className="h-4 w-4" aria-hidden />
            Reuse last prompt
          </Button>
          <Button type="button" variant="secondary" onClick={() => void copyLastAssistant()} disabled={isLoading}>
            <Copy className="h-4 w-4" aria-hidden />
            Copy last reply
          </Button>
          <Button type="button" variant="secondary" onClick={() => void saveLastToJournal()} disabled={isLoading}>
            <BookMarked className="h-4 w-4" aria-hidden />
            Save reply to journal
          </Button>
        </div>
      </form>

      <div className="flex gap-3 rounded-2xl border border-dashed border-border/70 bg-muted/10 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
        <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center" aria-hidden>
          <span className="h-1.5 w-1.5 rounded-full bg-accent/45" />
        </span>
        <p>
          After you chat, a quick mood check-in or a two-minute grounding tool can help your nervous system settle —
          small steps count.
        </p>
      </div>
    </Card>
  );
}
