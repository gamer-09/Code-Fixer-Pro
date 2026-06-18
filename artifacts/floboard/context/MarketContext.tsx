import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
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

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : 'http://localhost:80';

async function fetchBatch(symbols: string[]): Promise<QuoteData[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/market?symbols=${encodeURIComponent(symbols.join(','))}`,
      { signal: AbortSignal.timeout(15000) }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return (json.results as QuoteData[]) || [];
  } catch {
    return [];
  }
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
      map[q.symbol] = q;
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
