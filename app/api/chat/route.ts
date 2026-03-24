import { streamText } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

import { crisisFirstResponse } from "@/lib/chat-crisis";
import { getBillingContext } from "@/lib/billing/context";
import { incrementChatUserMessageUsage, chatQuotaExceeded } from "@/lib/billing/usage";
import { getSession } from "@/lib/auth";
import {
  createChat,
  getConversation,
  insertChatMessages,
  listMessagesForConversation,
  logSafetyEvent,
  updateConversationTitle,
} from "@/lib/db";
import { getChatLanguageModel } from "@/lib/llm";
import { SUPPORTIVE_SYSTEM_PROMPT } from "@/lib/prompts";
import { classifyRiskLocally } from "@/lib/safety";

const payloadSchema = z.object({
  conversationId: z.string().uuid().optional(),
  content: z.string().min(1).max(24000),
});

function buildConversationContext(
  messages: Array<{ role: string; content: string }>,
  maxTurns: number,
) {
  return messages
    .slice(-maxTurns)
    .map((m) => `${m.role}: ${m.content}`)
    .join("\n");
}

function offlineSupportReply(latestUser: string, riskElevated: boolean) {
  if (riskElevated) {
    return crisisFirstResponse();
  }
  const trimmed = latestUser.trim().slice(0, 280);
  const echo = trimmed.length > 0 ? ` You shared: "${trimmed}"` : "";
  return (
    `Thanks for opening up.${echo}\n\n` +
    "I'm having trouble reaching the AI service right now, but I'm still here with you.\n\n" +
    "Right now: what's one small thing that might help you feel even a little more grounded in the next few minutes?"
  );
}

function derivedTitle(content: string) {
  const line = content.trim().split("\n")[0]?.trim() ?? "";
  if (!line) return "New reflection";
  return line.length > 72 ? `${line.slice(0, 69)}…` : line;
}

async function maybeRenameFromFirstMessage(
  userId: string,
  conversationId: string,
  userContent: string,
) {
  const conv = await getConversation(userId, conversationId);
  if (!conv || conv.title !== "New reflection") return;
  await updateConversationTitle(userId, conversationId, derivedTitle(userContent));
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload." }, { status: 400 });

  const { content, conversationId: incomingConversationId } = parsed.data;
  const risk = classifyRiskLocally(content);

  if (risk.riskLevel === "high" || risk.riskLevel === "critical") {
    await logSafetyEvent({
      userId: session.userId,
      source: "chat",
      riskLevel: risk.riskLevel,
      category: risk.category,
    });
  }

  const billing = await getBillingContext(session.userId);
  const isCrisis = risk.riskLevel === "high" || risk.riskLevel === "critical";

  if (!isCrisis && chatQuotaExceeded(billing.entitlements, billing.usage.chatUserMessages)) {
    return NextResponse.json(
      {
        error: "limit_reached",
        code: "chat_monthly_limit",
        message:
          "You have reached your monthly message allowance on the Free plan. Upgrade when you want more room to reflect.",
      },
      { status: 402 },
    );
  }

  let conversationId = incomingConversationId ?? null;
  if (conversationId) {
    const conv = await getConversation(session.userId, conversationId);
    if (!conv) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }
  } else {
    conversationId = await createChat(session.userId);
  }

  await insertChatMessages(session.userId, conversationId, [{ role: "user", content }]);
  await maybeRenameFromFirstMessage(session.userId, conversationId, content);

  if (!isCrisis) {
    try {
      await incrementChatUserMessageUsage();
    } catch (e) {
      console.error("[chat] usage increment", e);
    }
  }

  const headers = new Headers();
  headers.set("x-calmlane-risk", risk.riskLevel);
  headers.set("x-calmlane-safety-category", risk.category);
  if (!incomingConversationId) {
    headers.set("x-calmlane-conversation-id", conversationId);
  }

  if (isCrisis) {
    const text = crisisFirstResponse();
    await insertChatMessages(session.userId, conversationId, [{ role: "assistant", content: text }]);
    headers.set("x-calmlane-runtime", "crisis-static");
    return new Response(text, { status: 200, headers });
  }

  const llm = getChatLanguageModel();
  if (!llm) {
    const text = offlineSupportReply(content, false);
    await insertChatMessages(session.userId, conversationId, [{ role: "assistant", content: text }]);
    headers.set("x-calmlane-runtime", "offline");
    return new Response(text, { status: 200, headers });
  }

  const historyRows = await listMessagesForConversation(
    session.userId,
    conversationId,
    billing.entitlements.maxMessagesLoadedPerChat,
  );
  const context = buildConversationContext(
    historyRows.map((r) => ({ role: r.role, content: r.content })),
    billing.entitlements.maxContextTurnsForLlm,
  );

  const userId = session.userId;

  try {
    const result = streamText({
      model: llm.model,
      system: SUPPORTIVE_SYSTEM_PROMPT,
      prompt: context,
      maxRetries: 0,
      async onFinish({ text }) {
        const reply = text.trim() || offlineSupportReply(content, false);
        await insertChatMessages(userId, conversationId!, [{ role: "assistant", content: reply }]);
      },
    });
    headers.set("x-calmlane-runtime", llm.provider);
    headers.set("x-calmlane-stream", "1");
    return result.toTextStreamResponse({ status: 200, headers });
  } catch {
    const fallback = offlineSupportReply(content, false);
    await insertChatMessages(session.userId, conversationId, [{ role: "assistant", content: fallback }]);
    headers.set("x-calmlane-runtime", "offline");
    return new Response(fallback, { status: 200, headers });
  }
}
