import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { ALL_SYMBOLS } from '@/constants/marketData';
import { useSettings } from '@/context/SettingsContext';
import { getApiBase } from '@/utils/apiBase';
import { resolveSymbolAlias, getFallbackQuote } from '@/utils/symbolFallbacks';

export interface QuoteData {
  symbol: string;
  shortName?: string;
  quoteType?: string;
  currency?: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketChange: number;
  regularMarketPreviousClose: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  regularMarketVolume: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap: number;
  preMarketPrice?: number;
  preMarketChangePercent?: number;
  postMarketPrice?: number;
  postMarketChangePercent?: number;
  bid?: number;
  ask?: number;
}

interface MarketContextType {
  data: Record<string, QuoteData>;
  loading: boolean;
  lastUpdated: Date | null;
  isOnline: boolean;
  /** Non-null when the API server cannot be reached — contains a human-readable message. */
  serverError: string | null;
  refresh: () => void;
  refreshKey: number;
}

const MarketContext = createContext<MarketContextType>({
  data: {},
  loading: true,
  lastUpdated: null,
  isOnline: true,
  serverError: null,
  refresh: () => {},
  refreshKey: 0,
});

const IS_NATIVE = Platform.OS !== 'web';

const API_BASE = getApiBase();

const YF_CHART = 'https://query2.finance.yahoo.com/v8/finance/chart';

const NATIVE_UA =
  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

/** Cross-platform fetch with timeout (AbortSignal.timeout is not in Hermes/RN) */
function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 15000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Returns the quote array on success, or `null` when the API server is
 * unreachable (connection refused / network error / timeout).
 * An empty array means the server responded but returned no data.
 */
async function fetchViaProxy(symbols: string[]): Promise<QuoteData[] | null> {
  try {
    const res = await fetchWithTimeout(
      `${API_BASE}/api/market?symbols=${encodeURIComponent(symbols.join(','))}`,
      {},
      15000
    );
    if (!res.ok) return [];
    const json = await res.json() as { results: QuoteData[] };
    return json.results ?? [];
  } catch (err: unknown) {
    // Distinguish a connection-level failure from other errors.
    // On web: "Failed to fetch" / "NetworkError" / "ERR_CONNECTION_REFUSED"
    // On native: "Network request failed"
    // On abort: "AbortError" (our own timeout)
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();
    const isConnectionError =
      msg.includes('failed to fetch') ||
      msg.includes('network request failed') ||
      msg.includes('networkerror') ||
      msg.includes('econnrefused') ||
      msg.includes('err_connection_refused') ||
      msg.includes('aborted') ||
      msg.includes('abort');
    if (isConnectionError) {
      return null; // signal "server unreachable"
    }
    return [];
  }
}

async function fetchOneChart(sym: string): Promise<QuoteData> {
  const targetSym = resolveSymbolAlias(sym);
  try {
    const res = await fetchWithTimeout(
      `${YF_CHART}/${encodeURIComponent(targetSym)}?interval=1d&range=1d&includePrePost=true`,
      {
        headers: {
          'User-Agent': NATIVE_UA,
          Accept: 'application/json',
        },
      },
      10000
    );
    if (!res.ok) return getFallbackQuote(sym);
    const json = await res.json() as {
      chart?: { result?: Array<{ meta?: Record<string, unknown> }> };
    };
    const meta = json?.chart?.result?.[0]?.meta as Record<string, number & string> | undefined;
    if (!meta?.regularMarketPrice) return getFallbackQuote(sym);

    const price = meta.regularMarketPrice as number;
    const prev = (meta.chartPreviousClose ?? meta.previousClose ?? price) as number;

    // Use Yahoo Finance's own official change values — never calculate them ourselves
    const changePct = (meta.regularMarketChangePercent as number) ?? (prev > 0 ? ((price - prev) / prev) * 100 : 0);
    const change = (meta.regularMarketChange as number) ?? (price - prev);

    return {
      symbol: sym,
      shortName: (meta.shortName as unknown as string) ?? undefined,
      quoteType: (meta.instrumentType as unknown as string) ?? undefined,
      currency: (meta.currency as unknown as string) ?? undefined,
      regularMarketPrice: price,
      regularMarketChangePercent: changePct,
      regularMarketChange: change,
      regularMarketPreviousClose: prev,
      regularMarketOpen: (meta.regularMarketOpen as number) ?? undefined,
      regularMarketDayHigh: (meta.regularMarketDayHigh as number) ?? undefined,
      regularMarketDayLow: (meta.regularMarketDayLow as number) ?? undefined,
      regularMarketVolume: (meta.regularMarketVolume as number) ?? 0,
      fiftyTwoWeekHigh: (meta.fiftyTwoWeekHigh as number) ?? undefined,
      fiftyTwoWeekLow: (meta.fiftyTwoWeekLow as number) ?? undefined,
      marketCap: (meta.marketCap as number) ?? 0,
      preMarketPrice: (meta.preMarketPrice as number) ?? undefined,
      preMarketChangePercent: (meta.preMarketChangePercent as number) ?? undefined,
      postMarketPrice: (meta.postMarketPrice as number) ?? undefined,
      postMarketChangePercent: (meta.postMarketChangePercent as number) ?? undefined,
    };
  } catch {
    return getFallbackQuote(sym);
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

/**
 * Thrown only on web when the proxy server is unreachable.
 * On native the app falls back to the direct Yahoo Finance API instead,
 * so this error never surfaces in a production APK/AAB.
 */
class ServerUnreachableError extends Error {
  constructor() { super('API server unreachable'); this.name = 'ServerUnreachableError'; }
}

async function fetchBatch(symbols: string[]): Promise<QuoteData[]> {
  // Always try the backend proxy first (fast, works on web, may work on native)
  let results: QuoteData[] | null = await fetchViaProxy(symbols);

  if (results === null) {
    // Server unreachable.
    // On native (production APK/AAB): fall back to the direct Yahoo Finance v8 chart API.
    // This guarantees market data loads for Play Store users without a self-hosted backend.
    if (IS_NATIVE) {
      results = await fetchChartBatch(symbols);
    } else {
      // On web (developer environment): surface the error so they know to start the server.
      throw new ServerUnreachableError();
    }
  }

  // Ensure every requested symbol has a quote so no item ever shows '-' ('—')
  const foundMap = new Map<string, QuoteData>();
  for (const q of results ?? []) {
    foundMap.set(q.symbol, q);
  }

  const completeResults: QuoteData[] = [];
  for (const sym of symbols) {
    const existing = foundMap.get(sym);
    if (existing && existing.regularMarketPrice != null && isFinite(existing.regularMarketPrice)) {
      completeResults.push(existing);
    } else {
      completeResults.push(getFallbackQuote(sym));
    }
  }

  return completeResults;
}

/** Returns true when the device has a usable network connection. */
function getNetworkOnline(): boolean {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    return navigator.onLine;
  }
  // On native we can't reliably check without NetInfo; optimistically assume online
  // until a fetch actually fails.
  return true;
}

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const loadingRef = useRef(false);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { settings } = useSettings();
  const refreshMs = settings.refreshInterval * 1000;

  // Track browser online/offline events on web
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const scheduleRetry = useCallback((fn: () => void) => {
    if (retryRef.current) return; // already scheduled
    retryRef.current = setTimeout(() => {
      retryRef.current = null;
      fn();
    }, 15000);
  }, []);

  const loadData = useCallback(async () => {
    // Guard: skip if a fetch is already in progress
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);

    try {
      const BATCH = 20;
      const allResults: QuoteData[] = [];

      for (let i = 0; i < ALL_SYMBOLS.length; i += BATCH) {
        const batch = ALL_SYMBOLS.slice(i, i + BATCH);
        const results = await fetchBatch(batch);
        allResults.push(...results);
      }

      if (allResults.length > 0) {
        // Good fetch — update data and clear any previous error
        const map: Record<string, QuoteData> = {};
        allResults.forEach((q) => {
          if (q?.symbol) map[q.symbol] = q;
        });
        setData(map);
        setLastUpdated(new Date());
        setIsOnline(true);
        setServerError(null);
        setRefreshKey((k) => k + 1);
        // Clear any pending retry
        if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null; }
      } else {
        // API returned no results — check real network state rather than assuming offline.
        // The device may be online but Yahoo Finance / the proxy is temporarily unavailable.
        setIsOnline(getNetworkOnline());
        // Keep the previous data visible (stale) instead of clearing it
        scheduleRetry(() => { loadData(); });
      }
    } catch (err: unknown) {
      if (err instanceof ServerUnreachableError) {
        // API server is not running — show a clear, actionable message
        setServerError(
          `Cannot reach the API server at ${API_BASE}.\n\n` +
          `Make sure it is running:\n` +
          `  pnpm --filter @workspace/api-server run dev\n\n` +
          `See LOCAL_DEV.md for full setup instructions.`
        );
        setIsOnline(getNetworkOnline());
      }
      // Keep stale data visible, retry in 15 s
      scheduleRetry(() => { loadData(); });
    } finally {
      // Always release the lock so subsequent interval ticks can run
      setLoading(false);
      loadingRef.current = false;
    }
  }, [scheduleRetry]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, refreshMs);
    return () => {
      clearInterval(interval);
      if (retryRef.current) clearTimeout(retryRef.current);
    };
  }, [loadData, refreshMs]);

  return (
    <MarketContext.Provider value={{ data, loading, lastUpdated, isOnline, serverError, refresh: loadData, refreshKey }}>
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

export function fmtMcap(v: number | null | undefined, compact = true): string {
  if (!v) return '—';
  if (!compact) {
    return '$' + Number(v).toLocaleString('en-US', { maximumFractionDigits: 0 });
  }
  if (v > 1e12) return '$' + fmt(v / 1e12, 2) + 'T';
  if (v > 1e9) return '$' + fmt(v / 1e9, 1) + 'B';
  return '$' + fmt(v / 1e6, 0) + 'M';
}

export function chgDir(n: number | null | undefined): 'up' | 'dn' | 'flat' {
  if (n == null) return 'flat';
  return n > 0 ? 'up' : n < 0 ? 'dn' : 'flat';
}
