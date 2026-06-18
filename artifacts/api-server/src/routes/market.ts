import YahooFinanceClass from "yahoo-finance2";
import { Router } from "express";

const router = Router();
// v3: default export is the class; must instantiate
// eslint-disable-next-line new-cap
const yf = new (YahooFinanceClass as unknown as new () => typeof YahooFinanceClass.prototype)();

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
    .slice(0, 40);

  if (symbols.length === 0) {
    res.json({ results: [] });
    return;
  }

  try {
    const settled = await Promise.allSettled(
      symbols.map((sym) =>
        (yf as unknown as { quote: (s: string, opts: object) => Promise<unknown> }).quote(sym, {
          fields: [
            "symbol",
            "regularMarketPrice",
            "regularMarketChangePercent",
            "regularMarketChange",
            "regularMarketPreviousClose",
            "marketCap",
            "regularMarketVolume",
          ],
        })
      )
    );

    const results = settled
      .filter((r) => r.status === "fulfilled" && r.value != null)
      .map((r) => (r as PromiseFulfilledResult<unknown>).value);

    res.json({ results });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch Yahoo Finance data");
    res.status(503).json({ error: "Failed to fetch market data" });
  }
});

export default router;
