import Anthropic from "@anthropic-ai/sdk";
import { Router } from "express";

const router = Router();

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
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

  const anthropicMessages = validMessages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // ?stream=false → return a single JSON response (used on native where
  // the Streams API / ReadableStream is not reliable in Expo Go).
  if (req.query.stream === "false") {
    try {
      const response = await getClient().messages.create({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        system,
        messages: anthropicMessages,
      });

      const text =
        response.content
          .filter((b) => b.type === "text")
          .map((b) => (b as { type: "text"; text: string }).text)
          .join("") || "No response received.";

      res.json({ content: text });
    } catch (err) {
      req.log.error({ err }, "Anthropic non-stream error");
      res.status(500).json({ error: "AI service error. Please try again." });
    }
    return;
  }

  // Default: SSE streaming (used on web).
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendChunk = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const stream = await getClient().messages.stream({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system,
      messages: anthropicMessages,
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        sendChunk({ content: event.delta.text });
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (err) {
    req.log.error({ err }, "Anthropic streaming error");
    sendChunk({ error: "AI service error. Please try again." });
    res.write("data: [DONE]\n\n");
    res.end();
  }
});

export default router;
