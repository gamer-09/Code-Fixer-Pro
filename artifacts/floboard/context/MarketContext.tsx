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

const IS_NATIVE = Platform.OS !== 'web';

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : 'http://localhost:80';

const YF_CHART = 'https://query2.finance.yahoo.com/v8/finance/chart';

const NATIVE_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

/** Cross-platform fetch with timeout (AbortSignal.timeout is not in Hermes/RN) */
function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

async function fetchViaProxy(symbols: string[]): Promise<QuoteData[]> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/api/market?symbols=${encodeURIComponent(symbols.join(','))}`,
      {},
      15000
    );
    if (!res.ok) return [];
    const json = await res.json() as { results: QuoteData[] };
    return json.results ?? [];
  } catch {
    return [];
  }
}

async function fetchOneChart(sym: string): Promise<QuoteData | null> {
  try {
    const res = await fetchWithTimeout(
      `${YF_CHART}/${encodeURIComponent(sym)}?interval=1d&range=1d&includePrePost=false`,
      {
        headers: {
          'User-Agent': NATIVE_UA,
          Accept: 'application/json',
        },
      },
      10000
    );
    if (!res.ok) return null;
    const json = await res.json() as {
      chart?: { result?: Array<{ meta?: Record<string, unknown> }> };
    };
    const meta = json?.chart?.result?.[0]?.meta as Record<string, number> | undefined;
    if (!meta?.regularMarketPrice) return null;
    const prev = (meta.chartPreviousClose ?? meta.previousClose ?? meta.regularMarketPrice) as number;
    const price = meta.regularMarketPrice as number;
    const change = price - prev;
    const changePct = prev > 0 ? (change / prev) * 100 : 0;
    return {
      symbol: (meta.symbol as unknown as string) ?? sym,
      regularMarketPrice: price,
      regularMarketChangePercent: changePct,
      regularMarketChange: change,
      regularMarketPreviousClose: prev,
      marketCap: (meta.marketCap ?? 0) as number,
      regularMarketVolume: (meta.regularMarketVolume ?? 0) as number,
    };
  } catch {
    return null;
  }
}

async function fetchChartBatch(symbols: string[], concurrency = 8): Promise<QuoteData[]> {
  const results: QuoteData[] = [];
  for (let i = 0; i < symbols.length; i += concurrency) {
    const slice = symbols.slice(i, i + concurrency);
    const settled = await Promise.allSettled(slice.map(fetchOneChart));
    for (const r of settled) {
      if (r.status === 'fulfilled' && r.value) results.push(r.value);
    }
  }
  return results;
}

async function fetchBatch(symbols: string[]): Promise<QuoteData[]> {
  // Always try the backend proxy first (fast, works on web, may work on native)
  const proxy = await fetchViaProxy(symbols);
  if (proxy.length > 0) return proxy;

  // Native fallback: Yahoo Finance v8 chart API per symbol (no crumb/auth needed)
  if (IS_NATIVE) {
    return fetchChartBatch(symbols);
  }
  return [];
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

    const BATCH = 20;
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
