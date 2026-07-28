import YahooFinance from "yahoo-finance2";
import { Router } from "express";

const router = Router();
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

// ── In-memory chart history cache ─────────────────────────────────────────
// Prevents the ~100-request burst on app startup from hitting Yahoo Finance
// rate limits. TTL: 60 s for intraday (1d), 5 min for daily/weekly ranges.
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}
const historyCache = new Map<string, CacheEntry>();

function getCached(key: string): unknown | null {
  const entry = historyCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    historyCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: unknown, ttlMs: number): void {
  historyCache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

router.get("/market", async (req, res) => {
  const raw = req.query.symbols;
  if (!raw || typeof raw !== "string") {
    res.status(400).json({ error: "symbols query param required" });
    return;
  }

  const symbols = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 200);

  if (symbols.length === 0) {
    res.json({ results: [] });
    return;
  }

  try {
    const settled = await Promise.allSettled(
      symbols.map((sym) =>
        yf.quote(
          sym,
          {
            fields: [
              "symbol",
              "shortName",
              "quoteType",
              "currency",
              "regularMarketPrice",
              "regularMarketChangePercent",
              "regularMarketChange",
              "regularMarketPreviousClose",
              "regularMarketOpen",
              "regularMarketDayHigh",
              "regularMarketDayLow",
              "regularMarketVolume",
              "fiftyTwoWeekHigh",
              "fiftyTwoWeekLow",
              "marketCap",
              "preMarketPrice",
              "preMarketChangePercent",
              "postMarketPrice",
              "postMarketChangePercent",
              "bid",
              "ask",
            ],
          },
          // Skip schema validation — futures & forex cause loud warnings but data is valid
          { validateResult: false }
        )
      )
    );

    // Build results, stamping each quote with the *requested* symbol.
    // Yahoo Finance sometimes normalises symbols (e.g. "BRK-B" → "BRK.B", or
    // returns a different casing/format). The client maps results by the symbol
    // it originally sent, so we must guarantee the key matches.
    const results: unknown[] = [];
    for (let i = 0; i < settled.length; i++) {
      const r = settled[i];
      if (r.status === "fulfilled" && r.value != null) {
        const quote = r.value as Record<string, unknown>;
        const requestedSym = symbols[i];
        // Override the symbol field so the client's lookup always matches
        results.push({ ...quote, symbol: requestedSym });
      } else if (r.status === "rejected") {
        req.log.error(
          { symbol: symbols[i], err: r.reason },
          "Yahoo Finance quote failed for symbol",
        );
      }
    }

    if (results.length === 0 && symbols.length > 0) {
      req.log.warn(
        { requestedCount: symbols.length },
        "All Yahoo Finance quotes failed — check network/firewall access to query1/query2.finance.yahoo.com",
      );
    }

    res.json({ results });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch Yahoo Finance data");
    res.status(503).json({ error: "Failed to fetch market data" });
  }
});

// ── Historical chart data ─────────────────────────────────────────────────

router.get("/market/history", async (req, res) => {
  const sym = req.query.symbol;
  const range = typeof req.query.range === "string" ? req.query.range : "7d";

  if (!sym || typeof sym !== "string") {
    res.status(400).json({ error: "symbol param required" });
    return;
  }

  // Map range string to period1 Date and interval for yahoo-finance2 chart()
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  let period1: Date;
  let interval: "5m" | "1h" | "1d";

  switch (range) {
    case "1d":
      period1 = new Date(now - msPerDay);
      interval = "5m";
      break;
    case "1mo":
      period1 = new Date(now - 30 * msPerDay);
      interval = "1d";
      break;
    case "3mo":
      period1 = new Date(now - 90 * msPerDay);
      interval = "1d";
      break;
    case "7d":
    default:
      period1 = new Date(now - 7 * msPerDay);
      interval = "1h";
      break;
  }

  // TTL: 60 s for intraday (5m bars), 5 min for daily/hourly
  const ttlMs = interval === "5m" ? 60_000 : 5 * 60_000;
  const cacheKey = `${sym}:${range}`;
  const cached = getCached(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  try {
    const result = await yf.chart(sym, { period1, interval }, { validateResult: false });

    const prices = (result.quotes ?? [])
      .filter((q): q is typeof q & { close: number } =>
        q.close != null && isFinite(q.close)
      )
      .map((q) => ({ t: Math.floor(q.date.getTime() / 1000), c: q.close }));

    const payload = { symbol: sym, range, prices };
    setCache(cacheKey, payload, ttlMs);
    res.json(payload);
  } catch (err) {
    req.log.error({ err }, "Failed to fetch chart history");
    res.status(503).json({ error: "Failed to fetch chart data" });
  }
});

export default router;
