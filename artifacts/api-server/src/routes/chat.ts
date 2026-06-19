import OpenAI from "openai";
import { Router } from "express";

const router = Router();

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

router.post("/chat", async (req, res) => {
  const { messages, systemPrompt } = req.body as {
    messages?: ChatMessageInput[];
    systemPrompt?: string;
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  const validMessages = messages.filter(
    (m) =>
      m &&
      typeof m.role === "string" &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.trim().length > 0
  );

  if (validMessages.length === 0) {
    res.status(400).json({ error: "No valid messages provided" });
    return;
  }

  const system =
    systemPrompt ??
    "You are FloAI, an expert financial advisor. Provide educational, balanced financial information. Always note this is informational only, not personal financial advice.";

  const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: system },
    ...validMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // ?stream=false → return a single JSON response (used on native)
  if (req.query.stream === "false") {
    try {
      const response = await getClient().chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        messages: openaiMessages,
      });

      const text = response.choices[0]?.message?.content ?? "No response received.";
      res.json({ content: text });
    } catch (err) {
      req.log.error({ err }, "OpenAI non-stream error");
      res.status(500).json({ error: "AI service error. Please try again." });
    }
    return;
  }

  // Default: SSE streaming (used on web)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendChunk = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const stream = await getClient().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: openaiMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        sendChunk({ content: delta });
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    req.log.error({ err }, "OpenAI streaming error");
    sendChunk({ error: "AI service error. Please try again." });
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

export default router;
