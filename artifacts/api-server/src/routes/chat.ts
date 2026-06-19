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

const KEYWORD_MAP: Array<[RegExp, string[]]> = [
  [/\bbtc\b|bitcoin/i, ["BTC-USD"]],
  [/\beth\b|ethereum/i, ["ETH-USD"]],
  [/\bbnb\b|binance/i, ["BNB-USD"]],
  [/\bsol\b|solana/i, ["SOL-USD"]],
  [/\bxrp\b|ripple/i, ["XRP-USD"]],
  [/\bdoge\b|dogecoin/i, ["DOGE-USD"]],
  [/\bapple\b|\baapl\b/i, ["AAPL"]],
  [/\bmicrosoft\b|\bmsft\b/i, ["MSFT"]],
  [/\bgoogle\b|\bgoogl\b|\balphabet\b/i, ["GOOGL"]],
  [/\bamazon\b|\bamzn\b/i, ["AMZN"]],
  [/\btesla\b|\btsla\b/i, ["TSLA"]],
  [/\bnvidia\b|\bnvda\b/i, ["NVDA"]],
  [/\bmeta\b|\bfacebook\b/i, ["META"]],
  [/\bnetflix\b|\bnflx\b/i, ["NFLX"]],
  [/\bsp500\b|s&p 500|s&p500|s&p/i, ["^GSPC"]],
  [/\bnasdaq\b|\bixic\b/i, ["^IXIC"]],
  [/\bdow jones\b|\bdji\b/i, ["^DJI"]],
  [/\bgold\b/i, ["GC=F"]],
  [/\bsilver\b/i, ["SI=F"]],
  [/\boil\b|crude/i, ["CL=F"]],
  [/\binflation\b/i, ["^TNX", "TIP"]],
  [/\binterest rate/i, ["^TNX"]],
  [/\bbond/i, ["^TNX"]],
  [/\bmarket\b|movers|stocks today/i, ["^GSPC", "^IXIC"]],
  [/\bcrypto\b/i, ["BTC-USD", "ETH-USD"]],
];

function extractSymbols(query: string): string[] {
  const found: string[] = [];
  for (const [pattern, symbols] of KEYWORD_MAP) {
    if (pattern.test(query)) {
      for (const s of symbols) {
        if (!found.includes(s)) found.push(s);
      }
    }
  }
  return found;
}

async function getQuoteInfo(symbol: string): Promise<string | null> {
  try {
    const detail = await yf.quoteSummary(symbol, { modules: ["price"] });
    const price = detail.price;
    if (!price) return null;
    const name = price.shortName || price.longName || symbol;
    const current = price.regularMarketPrice;
    const change = price.regularMarketChangePercent;
    const open = price.regularMarketOpen;
    const high = price.regularMarketDayHigh;
    const low = price.regularMarketDayLow;
    const mktCap = price.marketCap;

    let line = `${name} (${symbol})\n`;
    line += `  Price: ${fmt(current)}  ${arrow(change)} ${fmtPct(change)} today\n`;
    if (open != null) line += `  Open: ${fmt(open)}   High: ${fmt(high)}   Low: ${fmt(low)}\n`;
    if (mktCap != null) line += `  Market Cap: ${fmt(mktCap)}`;
    return line;
  } catch {
    return null;
  }
}

async function buildSearchResponse(userQuery: string): Promise<string> {
  const query = userQuery.trim();
  const lines: string[] = [];

  const knownSymbols = extractSymbols(query);

  if (knownSymbols.length > 0) {
    const quoteLines = await Promise.all(knownSymbols.slice(0, 3).map(getQuoteInfo));
    const valid = quoteLines.filter(Boolean) as string[];
    if (valid.length > 0) {
      lines.push("Here's the latest data:\n");
      lines.push(...valid);
    }
  }

  try {
    const searchTerm = knownSymbols.length > 0 ? knownSymbols[0] : query;
    const searchResults = await yf.search(searchTerm, { quotesCount: 0, newsCount: 5 });
    const news = (searchResults.news ?? []).slice(0, 4);

    if (news.length > 0) {
      if (lines.length > 0) lines.push("");
      lines.push("📰 Latest news:");
      for (const article of news) {
        const title = (article as { title?: string }).title;
        const publisher = (article as { publisher?: string }).publisher;
        if (title) {
          let entry = `• ${title}`;
          if (publisher) entry += `  (${publisher})`;
          lines.push(entry);
        }
      }
    }

    if (lines.length === 0 && knownSymbols.length === 0) {
      const fallback = await yf.search(query, { quotesCount: 3, newsCount: 3 });
      const fQuotes = fallback.quotes ?? [];
      const fNews = (fallback.news ?? []).slice(0, 3);

      if (fQuotes.length > 0) {
        lines.push(`Results for "${query}":\n`);
        for (const q of fQuotes.slice(0, 2)) {
          if (!("symbol" in q) || !q.symbol) continue;
          const info = await getQuoteInfo(q.symbol);
          if (info) lines.push(info);
        }
      }
      if (fNews.length > 0) {
        if (lines.length > 0) lines.push("");
        lines.push("📰 Related news:");
        for (const a of fNews) {
          const title = (a as { title?: string }).title;
          if (title) lines.push(`• ${title}`);
        }
      }
    }
  } catch {
    // ignore news errors
  }

  if (lines.length === 0) {
    lines.push(`No results found for "${query}".`);
    lines.push("\nTry asking about a specific stock (e.g. Apple, Tesla), crypto (Bitcoin, Ethereum), or index (S&P 500, Nasdaq).");
  } else {
    lines.push("\n⚠️ Informational only — not personal financial advice.");
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
    await new Promise((r) => setTimeout(r, 15));
  }

  res.write("data: [DONE]\n\n");
  res.end();
});

export default router;
