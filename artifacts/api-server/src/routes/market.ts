import YahooFinanceClass from "yahoo-finance2";
import { Router } from "express";

const router = Router();
// v3: default export is the class — must instantiate
const yf = new (YahooFinanceClass as unknown as new () => {
  quote: (
    sym: string,
    opts: object,
    qOpts: object
  ) => Promise<unknown>;
})();

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
        yf.quote(
          sym,
          {
            fields: [
              "symbol",
              "regularMarketPrice",
              "regularMarketChangePercent",
              "regularMarketChange",
              "regularMarketPreviousClose",
              "marketCap",
              "regularMarketVolume",
            ],
          },
          // Skip schema validation — futures & forex cause loud warnings but data is valid
          { validateResult: false }
        )
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
