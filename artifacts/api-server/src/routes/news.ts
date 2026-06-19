import YahooFinanceClass from "yahoo-finance2";
import { Router } from "express";

const router = Router();
const yf = new (YahooFinanceClass as unknown as new () => {
  search: (q: string, opts: object, qOpts: object) => Promise<unknown>;
})();

interface NewsItem {
  src: string;
  title: string;
  tag: "bull" | "bear" | "neutral";
  age: string;
  impact: string;
  url?: string;
}

function relativeAge(publishedMs: number): string {
  const diff = Date.now() - publishedMs;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function guessTag(title: string): "bull" | "bear" | "neutral" {
  const t = title.toLowerCase();
  const bullWords = ["surge", "soar", "rally", "gain", "record", "beat", "rise", "jump", "high", "boost", "profit", "growth", "strong", "optimis", "recover", "upturn", "bullish", "expan"];
  const bearWords = ["fall", "drop", "crash", "decline", "loss", "miss", "slump", "tumble", "sink", "low", "weak", "concern", "risk", "warn", "cut", "layoff", "recession", "bearish", "contract", "sell-off"];
  const bullScore = bullWords.filter(w => t.includes(w)).length;
  const bearScore = bearWords.filter(w => t.includes(w)).length;
  if (bullScore > bearScore) return "bull";
  if (bearScore > bullScore) return "bear";
  return "neutral";
}

function guessImpact(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("fed") || t.includes("interest rate") || t.includes("inflation")) return "Bond yields and rate-sensitive sectors in focus";
  if (t.includes("bitcoin") || t.includes("crypto") || t.includes("ethereum")) return "Crypto market sentiment affected";
  if (t.includes("oil") || t.includes("energy") || t.includes("opec")) return "Energy sector and fuel costs in focus";
  if (t.includes("gold") || t.includes("silver") || t.includes("precious")) return "Precious metals and safe-haven demand in focus";
  if (t.includes("china") || t.includes("asia") || t.includes("japan")) return "Asian markets and emerging market exposure affected";
  if (t.includes("tech") || t.includes("ai") || t.includes("nvidia") || t.includes("semiconductor")) return "Technology sector sentiment affected";
  if (t.includes("bank") || t.includes("finance") || t.includes("jpmorgan") || t.includes("goldman")) return "Financial sector and credit markets in focus";
  if (t.includes("dollar") || t.includes("forex") || t.includes("currency")) return "FX markets and export-heavy companies affected";
  if (t.includes("earnings") || t.includes("revenue") || t.includes("profit")) return "Equity valuations and sector rotation in focus";
  return "Broader market sentiment affected";
}

router.get("/news", async (req, res) => {
  const queries = ["stock market", "finance economy", "crypto bitcoin", "federal reserve", "earnings"];

  try {
    const allNews: NewsItem[] = [];
    const seen = new Set<string>();

    const results = await Promise.allSettled(
      queries.map((q) =>
        yf.search(q, { newsCount: 6, quotesCount: 0, enableNavLinks: false }, { validateResult: false })
      )
    );

    for (const r of results) {
      if (r.status !== "fulfilled") continue;
      const data = r.value as { news?: Array<{ title?: string; publisher?: string; providerPublishTime?: number; link?: string }> };
      if (!data?.news) continue;
      for (const n of data.news) {
        if (!n.title || seen.has(n.title)) continue;
        seen.add(n.title);
        allNews.push({
          src: n.publisher ?? "News",
          title: n.title,
          tag: guessTag(n.title),
          age: n.providerPublishTime ? relativeAge(n.providerPublishTime * 1000) : "?",
          impact: guessImpact(n.title),
          url: n.link,
        });
      }
    }

    // Sort by recency if we have timestamps — newest first, cap at 20
    const final = allNews.slice(0, 20);
    res.json({ news: final });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch news");
    res.status(503).json({ error: "Failed to fetch news" });
  }
});

export default router;
