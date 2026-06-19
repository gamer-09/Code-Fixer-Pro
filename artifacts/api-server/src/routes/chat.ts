import { Router } from "express";
import YahooFinance from "yahoo-finance2";

const router = Router();
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}

function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "N/A";
  if (Math.abs(n) >= 1_000_000_000_000) return `$${(n / 1_000_000_000_000).toFixed(2)}T`;
  if (Math.abs(n) >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtPct(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return "N/A";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

function arrow(n: number | null | undefined): string {
  if (n == null) return "";
  return n >= 0 ? "▲" : "▼";
}

async function buildSearchResponse(userQuery: string): Promise<string> {
  const query = userQuery.trim();
  const lines: string[] = [];

  try {
    const searchResults = await yf.search(query, { quotesCount: 5, newsCount: 5 });

    const quotes = searchResults.quotes ?? [];
    const news = (searchResults.news ?? []).slice(0, 4);

    if (quotes.length > 0) {
      const topQuotes = quotes.slice(0, 3);
      const enriched: string[] = [];

      for (const q of topQuotes) {
        if (!("symbol" in q) || !q.symbol) continue;
        try {
          const detail = await yf.quoteSummary(q.symbol, {
            modules: ["price", "summaryDetail"],
          });

          const price = detail.price;
          if (!price) continue;

          const name = price.shortName || price.longName || q.symbol;
          const current = price.regularMarketPrice;
          const change = price.regularMarketChangePercent;
          const volume = price.regularMarketVolume;
          const mktCap = price.marketCap;

          let line = `**${name} (${q.symbol})**\n`;
          line += `  Price: ${fmt(current)} ${arrow(change)} ${fmtPct(change)}\n`;
          if (volume != null) line += `  Volume: ${volume.toLocaleString()}\n`;
          if (mktCap != null) line += `  Market Cap: ${fmt(mktCap)}`;
          enriched.push(line);
        } catch {
          if ("symbol" in q && "shortname" in q) {
            enriched.push(`**${(q as { shortname?: string }).shortname ?? q.symbol} (${q.symbol})**`);
          }
        }
      }

      if (enriched.length > 0) {
        lines.push(`Here's what I found for "${query}":\n`);
        lines.push(...enriched);
      }
    }

    if (news.length > 0) {
      if (lines.length > 0) lines.push("");
      lines.push("📰 Recent news:");
      for (const article of news) {
        const title = (article as { title?: string }).title;
        const publisher = (article as { publisher?: string }).publisher;
        const link = (article as { link?: string }).link;
        if (title) {
          let entry = `• ${title}`;
          if (publisher) entry += ` — ${publisher}`;
          lines.push(entry);
        }
      }
    }

    if (lines.length === 0) {
      lines.push(`I searched for "${query}" but didn't find specific results.`);
      lines.push("\nTry asking about a specific stock (e.g. 'Apple stock'), crypto (e.g. 'Bitcoin price'), or a market topic like 'S&P 500' or 'interest rates'.");
    } else {
      lines.push("\n⚠️ This is informational only — not personal financial advice.");
    }
  } catch (err) {
    lines.push(`I couldn't retrieve results for "${query}" right now. Please try again or rephrase your question.`);
  }

  return lines.join("\n");
}

router.post("/chat", async (req, res) => {
  const { messages } = req.body as {
    messages?: ChatMessageInput[];
  };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array is required" });
    return;
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

  if (!lastUserMessage?.content?.trim()) {
    res.status(400).json({ error: "No user message found" });
    return;
  }

  const responseText = await buildSearchResponse(lastUserMessage.content);

  if (req.query.stream === "false") {
    res.json({ content: responseText });
    return;
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const sendChunk = (data: object) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  const words = responseText.split(" ");
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? "" : " ") + words[i];
    sendChunk({ content: chunk });
    await new Promise((r) => setTimeout(r, 18));
  }

  res.write("data: [DONE]\n\n");
  res.end();
});

export default router;
