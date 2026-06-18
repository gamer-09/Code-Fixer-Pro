import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { ALL_SYMBOLS } from '@/constants/marketData';

export interface QuoteData {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketChange: number;
  regularMarketPreviousClose: number;
  marketCap: number;
  regularMarketVolume: number;
}

interface MarketContextType {
  data: Record<string, QuoteData>;
  loading: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

const MarketContext = createContext<MarketContextType>({
  data: {},
  loading: true,
  lastUpdated: null,
  refresh: () => {},
});

// On web: route through backend proxy (to avoid CORS).
// On native: call Yahoo Finance directly (no CORS enforcement on native).
const IS_NATIVE = Platform.OS !== 'web';

const WEB_API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : 'http://localhost:80';

const YF_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YF_CHART_URL = 'https://query2.finance.yahoo.com/v8/finance/chart';

const NATIVE_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  Accept: 'application/json, */*',
  'Accept-Language': 'en-US,en;q=0.9',
};

/** Fetch a batch via backend proxy (web only) */
async function fetchViaProxy(symbols: string[]): Promise<QuoteData[]> {
  try {
    const res = await fetch(
      `${WEB_API_BASE}/api/market?symbols=${encodeURIComponent(symbols.join(','))}`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results as QuoteData[]) || [];
  } catch {
    return [];
  }
}

/** Fetch a batch via Yahoo Finance v7 quote API (native) */
async function fetchViaYahooV7(symbols: string[]): Promise<QuoteData[]> {
  try {
    const fields = 'regularMarketPrice,regularMarketChangePercent,regularMarketChange,regularMarketPreviousClose,marketCap,regularMarketVolume';
    const url = `${YF_QUOTE_URL}?symbols=${encodeURIComponent(symbols.join(','))}&fields=${fields}&corsDomain=finance.yahoo.com&formatted=false`;
    const res = await fetch(url, {
      headers: NATIVE_HEADERS,
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return [];
    const json = await res.json();
    return (json?.quoteResponse?.result ?? []) as QuoteData[];
  } catch {
    return [];
  }
}

/** Fetch a single symbol via Yahoo Finance v8 chart API (native fallback) */
async function fetchOneViaChart(sym: string): Promise<QuoteData | null> {
  try {
    const url = `${YF_CHART_URL}/${encodeURIComponent(sym)}?interval=1d&range=1d&includePrePost=false`;
    const res = await fetch(url, {
      headers: NATIVE_HEADERS,
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json?.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice;
    const change = meta.regularMarketPrice - prev;
    const changePct = prev > 0 ? (change / prev) * 100 : 0;
    return {
      symbol: meta.symbol ?? sym,
      regularMarketPrice: meta.regularMarketPrice ?? 0,
      regularMarketChangePercent: changePct,
      regularMarketChange: change,
      regularMarketPreviousClose: prev,
      marketCap: meta.marketCap ?? 0,
      regularMarketVolume: meta.regularMarketVolume ?? 0,
    };
  } catch {
    return null;
  }
}

async function fetchBatch(symbols: string[]): Promise<QuoteData[]> {
  if (!IS_NATIVE) {
    return fetchViaProxy(symbols);
  }

  // Try v7 batch first (faster)
  const v7Results = await fetchViaYahooV7(symbols);
  if (v7Results.length > 0) return v7Results;

  // Fall back to v8 chart per-symbol (slower but more reliable)
  const chartResults = await Promise.allSettled(symbols.map(fetchOneViaChart));
  return chartResults
    .filter((r): r is PromiseFulfilledResult<QuoteData> => r.status === 'fulfilled' && r.value !== null)
    .map((r) => r.value);
}

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const loadingRef = useRef(false);

  const loadData = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    const BATCH = IS_NATIVE ? 15 : 20;
    const allResults: QuoteData[] = [];

    for (let i = 0; i < ALL_SYMBOLS.length; i += BATCH) {
      const batch = ALL_SYMBOLS.slice(i, i + BATCH);
      const results = await fetchBatch(batch);
      allResults.push(...results);
    }

    const map: Record<string, QuoteData> = {};
    allResults.forEach((q) => {
      if (q?.symbol) map[q.symbol] = q;
    });

    setData(map);
    setLastUpdated(new Date());
    setLoading(false);
    loadingRef.current = false;
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 90_000);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <MarketContext.Provider value={{ data, loading, lastUpdated, refresh: loadData }}>
      {children}
    </MarketContext.Provider>
  );
}

export function useMarket() {
  return useContext(MarketContext);
}

export function fmt(n: number | null | undefined, decimals = 2): string {
  if (n == null) return '—';
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function fmtChg(n: number | null | undefined): string {
  if (n == null) return '—';
  return (n >= 0 ? '+' : '') + fmt(n) + '%';
}

export function fmtMcap(v: number | null | undefined): string {
  if (!v) return '—';
  if (v > 1e12) return '$' + fmt(v / 1e12, 2) + 'T';
  if (v > 1e9) return '$' + fmt(v / 1e9, 1) + 'B';
  return '$' + fmt(v / 1e6, 0) + 'M';
}

export function chgDir(n: number | null | undefined): 'up' | 'dn' | 'flat' {
  if (n == null) return 'flat';
  return n > 0 ? 'up' : n < 0 ? 'dn' : 'flat';
}
