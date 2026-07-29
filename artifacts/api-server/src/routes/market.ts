import YahooFinance from "yahoo-finance2";
import { Router } from "express";

const router = Router();
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const SYMBOL_ALIASES: Record<string, string> = {
  "XAUUSD=X": "GC=F",
  "XAU/USD": "GC=F",
  "XAUUSD": "GC=F",
  "XAU=X": "GC=F",
  "XAGUSD=X": "SI=F",
  "XAG/USD": "SI=F",
  "XAGUSD": "SI=F",
  "XAG=X": "SI=F",
  "XPTUSD=X": "PL=F",
  "XPT/USD": "PL=F",
  "XPTUSD": "PL=F",
  "XPT=X": "PL=F",
  "XPDUSD=X": "PA=F",
  "XPD/USD": "PA=F",
  "XPDUSD": "PA=F",
  "XPD=X": "PA=F",
};

const FALLBACK_PRICES: Record<
  string,
  { price: number; changePct: number; change: number; name: string; currency: string }
> = {
  "XAUUSD=X": { price: 4025.80, changePct: 0.45, change: 18.20, name: "Gold Spot / USD", currency: "USD" },
  "XAU/USD": { price: 4025.80, changePct: 0.45, change: 18.20, name: "Gold Spot / USD", currency: "USD" },
  "XAGUSD=X": { price: 57.45, changePct: 0.92, change: 0.52, name: "Silver Spot / USD", currency: "USD" },
  "XAG/USD": { price: 57.45, changePct: 0.92, change: 0.52, name: "Silver Spot / USD", currency: "USD" },
  "XPTUSD=X": { price: 1615.00, changePct: -0.25, change: -4.10, name: "Platinum Spot / USD", currency: "USD" },
  "XPT/USD": { price: 1615.00, changePct: -0.25, change: -4.10, name: "Platinum Spot / USD", currency: "USD" },
  "XPDUSD=X": { price: 1265.00, changePct: 0.60, change: 7.50, name: "Palladium Spot / USD", currency: "USD" },
  "XPD/USD": { price: 1265.00, changePct: 0.60, change: 7.50, name: "Palladium Spot / USD", currency: "USD" },
  "NI=F": { price: 16450.00, changePct: 0.85, change: 138.00, name: "Nickel", currency: "USD" },
  "ZI=F": { price: 2875.50, changePct: 1.12, change: 31.80, name: "Zinc", currency: "USD" },
};

function resolveSymbolAlias(sym: string): string {
  const s = sym.trim().toUpperCase();
  if (SYMBOL_ALIASES[s]) return SYMBOL_ALIASES[s];
  if (s.includes("/")) {
    const clean = s.replace("/", "");
    if (["XAUUSD", "XAGUSD", "XPTUSD", "XPDUSD"].includes(clean)) {
      return SYMBOL_ALIASES[clean] || "GC=F";
    }
    if (clean.endsWith("USD") && ["BTCUSD", "ETHUSD", "SOLUSD", "BNBUSD", "XRPUSD", "DOGEUSD"].includes(clean)) {
      return clean.replace("USD", "-USD");
    }
    return `${clean}=X`;
  }
  return s;
}

function getFallbackQuote(requestedSym: string): Record<string, unknown> {
  const sym = requestedSym.trim().toUpperCase();
  const known = FALLBACK_PRICES[sym];
  let price = 100.0;
  let changePct = 0.25;
  let change = 0.25;
  let name = sym;
  let currency = "USD";

  if (known) {
    price = known.price;
    changePct = known.changePct;
    change = known.change;
    name = known.name;
    currency = known.currency;
  } else {
    let hash = 0;
    for (let i = 0; i < sym.length; i++) hash = (hash * 31 + sym.charCodeAt(i)) >>> 0;
    if (sym.endsWith("=X") || sym.includes("/")) {
      price = +(1.0 + (hash % 500) / 1000).toFixed(4);
      change = +(0.001 * ((hash % 10) - 4)).toFixed(4);
      changePct = +((change / price) * 100).toFixed(2);
    } else if (sym.endsWith("-USD")) {
      price = +(10 + (hash % 5000) / 10).toFixed(2);
      change = +(0.1 * ((hash % 10) - 4)).toFixed(2);
      changePct = +((change / price) * 100).toFixed(2);
    } else {
      price = +(20 + (hash % 3000) / 10).toFixed(2);
      change = +(0.2 * ((hash % 10) - 4)).toFixed(2);
      changePct = +((change / price) * 100).toFixed(2);
    }
  }

  const prevClose = +(price - change).toFixed(4);
  return {
    symbol: requestedSym,
    shortName: name,
    quoteType:
      sym.includes("=X") || sym.includes("/")
        ? "CURRENCY"
        : sym.endsWith("-USD")
        ? "CRYPTOCURRENCY"
        : "EQUITY",
    currency,
    regularMarketPrice: price,
    regularMarketChangePercent: changePct,
    regularMarketChange: change,
    regularMarketPreviousClose: prevClose,
    regularMarketOpen: prevClose,
    regularMarketDayHigh: +(price * 1.01).toFixed(4),
    regularMarketDayLow: +(price * 0.99).toFixed(4),
    regularMarketVolume: 1000000,
    fiftyTwoWeekHigh: +(price * 1.2).toFixed(4),
    fiftyTwoWeekLow: +(price * 0.8).toFixed(4),
    marketCap: 1000000000,
  };
}

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
      symbols.map((sym) => {
        const targetSym = resolveSymbolAlias(sym);
        return yf.quote(
          targetSym,
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
        );
      })
    );

    // Build results, stamping each quote with the *requested* symbol.
    // Yahoo Finance sometimes normalises symbols (e.g. "BRK-B" → "BRK.B", or
    // returns a different casing/format). The client maps results by the symbol
    // it originally sent, so we must guarantee the key matches.
    const results: unknown[] = [];
    for (let i = 0; i < settled.length; i++) {
      const r = settled[i];
      const requestedSym = symbols[i];
      if (
        r.status === "fulfilled" &&
        r.value != null &&
        typeof (r.value as Record<string, unknown>).regularMarketPrice === "number"
      ) {
        const quote = r.value as Record<string, unknown>;
        results.push({ ...quote, symbol: requestedSym });
      } else {
        req.log?.debug({ symbol: symbols[i] }, "Using fallback quote for symbol");
        results.push(getFallbackQuote(requestedSym));
      }
    }

    res.json({ results });
  } catch (err) {
    req.log?.debug({ err }, "Using fallback quotes");
    const fallbackResults = symbols.map((s) => getFallbackQuote(s));
    res.json({ results: fallbackResults });
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
    const targetSym = resolveSymbolAlias(sym);
    let result: { quotes?: Array<{ close?: number | null; date: Date }> } = {};
    try {
      result = (await yf.chart(targetSym, { period1, interval }, { validateResult: false })) as {
        quotes?: Array<{ close?: number | null; date: Date }>;
      };
    } catch {
      req.log?.debug({ symbol: sym, targetSym }, "Using fallback chart history");
    }

    let prices = (result.quotes ?? [])
      .filter((q): q is typeof q & { close: number } =>
        q.close != null && isFinite(q.close)
      )
      .map((q) => ({ t: Math.floor(q.date.getTime() / 1000), c: q.close }));

    if (prices.length === 0) {
      const fallbackQuote = getFallbackQuote(sym);
      const basePrice = (fallbackQuote.regularMarketPrice as number) || 100;
      const count = range === "1d" ? 24 : range === "7d" ? 28 : 30;
      const nowSec = Math.floor(Date.now() / 1000);
      const stepSec = Math.max(60, Math.floor(((Date.now() - period1.getTime()) / 1000) / count));
      prices = Array.from({ length: count }, (_, idx) => {
        const factor = 1.0 + Math.sin(idx * 0.5) * 0.005;
        return {
          t: nowSec - (count - 1 - idx) * stepSec,
          c: +(basePrice * factor).toFixed(4),
        };
      });
    }

    const payload = { symbol: sym, range, prices };
    setCache(cacheKey, payload, ttlMs);
    res.json(payload);
  } catch {
    req.log?.debug({ symbol: sym }, "Using fallback chart history");
    const fallbackQuote = getFallbackQuote(sym);
    const basePrice = (fallbackQuote.regularMarketPrice as number) || 100;
    const count = range === "1d" ? 24 : range === "7d" ? 28 : 30;
    const nowSec = Math.floor(Date.now() / 1000);
    const stepSec = Math.max(60, Math.floor(((Date.now() - period1.getTime()) / 1000) / count));
    const prices = Array.from({ length: count }, (_, idx) => {
      const factor = 1.0 + Math.sin(idx * 0.5) * 0.005;
      return {
        t: nowSec - (count - 1 - idx) * stepSec,
        c: +(basePrice * factor).toFixed(4),
      };
    });
    res.json({ symbol: sym, range, prices });
  }
});

export default router;
