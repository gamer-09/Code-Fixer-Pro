import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ALL_SYMBOLS } from '../constants/marketData'
import { useSettings } from './SettingsContext'
import { getApiBase, resolveApiBase } from '../utils/apiBase'
import { resolveSymbolAlias, getFallbackQuote, getFallbackMcap } from '../utils/symbolFallbacks'
import { fmt, fmtChg, fmtMcap, chgDir } from '../utils/format'

export { fmt, fmtChg, fmtMcap, chgDir }

export interface QuoteData {
  symbol: string
  shortName?: string
  quoteType?: string
  currency?: string
  regularMarketPrice: number
  regularMarketChangePercent: number
  regularMarketChange: number
  regularMarketPreviousClose: number
  regularMarketOpen?: number
  regularMarketDayHigh?: number
  regularMarketDayLow?: number
  regularMarketVolume: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  marketCap: number
  preMarketPrice?: number
  preMarketChangePercent?: number
  postMarketPrice?: number
  postMarketChangePercent?: number
  bid?: number
  ask?: number
}

interface MarketContextType {
  data: Record<string, QuoteData>
  loading: boolean
  lastUpdated: Date | null
  isOnline: boolean
  serverError: string | null
  refresh: () => void
  refreshKey: number
}

const MarketContext = createContext<MarketContextType>({
  data: {},
  loading: true,
  lastUpdated: null,
  isOnline: true,
  serverError: null,
  refresh: () => {},
  refreshKey: 0,
})

function apiBase() {
  return getApiBase()
}

const YF_CHART = 'https://query2.finance.yahoo.com/v8/finance/chart'
const NATIVE_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

function fetchWithTimeout(url: string, options: RequestInit = {}, ms = 15000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(id))
}

async function fetchViaProxy(symbols: string[]): Promise<QuoteData[] | null> {
  try {
    const res = await fetchWithTimeout(
      `${apiBase()}/api/market?symbols=${encodeURIComponent(symbols.join(','))}`,
      {},
      15000
    )
    if (!res.ok) return []
    const json = await res.json() as { results: QuoteData[] }
    return json.results ?? []
  } catch (err: unknown) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase()
    const isConnectionError =
      msg.includes('failed to fetch') || msg.includes('networkerror') ||
      msg.includes('econnrefused') || msg.includes('err_connection_refused') ||
      msg.includes('aborted') || msg.includes('abort')
    if (isConnectionError) return null
    return []
  }
}

async function fetchOneChart(sym: string): Promise<{ quote: QuoteData; live: boolean }> {
  const targetSym = resolveSymbolAlias(sym)
  try {
    const res = await fetchWithTimeout(
      `${YF_CHART}/${encodeURIComponent(targetSym)}?interval=1d&range=1d&includePrePost=true`,
      { headers: { 'User-Agent': NATIVE_UA, Accept: 'application/json' } },
      10000
    )
    if (!res.ok) return { quote: getFallbackQuote(sym), live: false }
    const json = await res.json() as { chart?: { result?: Array<{ meta?: Record<string, unknown> }> } }
    const meta = json?.chart?.result?.[0]?.meta as Record<string, number & string> | undefined
    if (!meta?.regularMarketPrice) return { quote: getFallbackQuote(sym), live: false }

    const price = meta.regularMarketPrice as number
    const prev = (meta.chartPreviousClose ?? meta.previousClose ?? price) as number
    const changePct = (meta.regularMarketChangePercent as number) ?? (prev > 0 ? ((price - prev) / prev) * 100 : 0)
    const change = (meta.regularMarketChange as number) ?? (price - prev)

    const quote: QuoteData = {
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
      marketCap: (meta.marketCap as number) || getFallbackMcap(sym),
    }
    return { quote, live: true }
  } catch {
    return { quote: getFallbackQuote(sym), live: false }
  }
}

async function fetchChartBatch(symbols: string[], concurrency = 8): Promise<{ results: QuoteData[]; hadNetworkSuccess: boolean }> {
  const results: QuoteData[] = []
  let hadNetworkSuccess = false
  for (let i = 0; i < symbols.length; i += concurrency) {
    const slice = symbols.slice(i, i + concurrency)
    const settled = await Promise.allSettled(slice.map(fetchOneChart))
    for (const r of settled) {
      if (r.status === 'fulfilled' && r.value) {
        results.push(r.value.quote)
        if (r.value.live) hadNetworkSuccess = true
      }
    }
  }
  return { results, hadNetworkSuccess }
}

async function fetchBatch(symbols: string[]): Promise<{ results: QuoteData[]; hadNetworkSuccess: boolean }> {
  let results: QuoteData[] | null = await fetchViaProxy(symbols)
  let hadNetworkSuccess = results !== null && results.length > 0

  if (results === null) {
    // Server unreachable — on web, try direct Yahoo Finance as fallback
    const direct = await fetchChartBatch(symbols)
    results = direct.results
    hadNetworkSuccess = direct.hadNetworkSuccess
  }

  const foundMap = new Map<string, QuoteData>()
  for (const q of results ?? []) foundMap.set(q.symbol, q)

  const completeResults: QuoteData[] = []
  for (const sym of symbols) {
    const existing = foundMap.get(sym)
    if (existing && existing.regularMarketPrice != null && isFinite(existing.regularMarketPrice)) {
      completeResults.push(existing)
    } else {
      completeResults.push(getFallbackQuote(sym))
    }
  }

  return { results: completeResults, hadNetworkSuccess }
}

function getNetworkOnline(): boolean {
  if (typeof navigator !== 'undefined') return navigator.onLine
  return true
}

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<Record<string, QuoteData>>({})
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isOnline, setIsOnline] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const loadingRef = useRef(false)
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { settings } = useSettings()
  const refreshMs = settings.refreshInterval * 1000

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    setIsOnline(navigator.onLine)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const scheduleRetry = useCallback((fn: () => void) => {
    if (retryRef.current) return
    retryRef.current = setTimeout(() => { retryRef.current = null; fn() }, 15000)
  }, [])

  const loadData = useCallback(async () => {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)

    try {
      const BATCH = 20
      const allResults: QuoteData[] = []
      let onlineCount = 0

      for (let i = 0; i < ALL_SYMBOLS.length; i += BATCH) {
        const batch = ALL_SYMBOLS.slice(i, i + BATCH)
        const { results, hadNetworkSuccess } = await fetchBatch(batch)
        allResults.push(...results)
        if (hadNetworkSuccess) onlineCount++
      }

      const map: Record<string, QuoteData> = {}
      allResults.forEach((q) => {
        if (q?.symbol && q.regularMarketPrice != null && isFinite(q.regularMarketPrice)) {
          map[q.symbol] = q
        }
      })
      ALL_SYMBOLS.forEach((s) => {
        if (!map[s]) map[s] = getFallbackQuote(s)
      })

      setData(map)
      setLastUpdated(new Date())
      setIsOnline(onlineCount > 0)
      setServerError(null)
      setRefreshKey((k) => k + 1)
      if (retryRef.current) { clearTimeout(retryRef.current); retryRef.current = null }
    } catch {
      setData((prev) => {
        if (Object.keys(prev).length === 0) {
          const fallbackMap: Record<string, QuoteData> = {}
          ALL_SYMBOLS.forEach((s) => { fallbackMap[s] = getFallbackQuote(s) })
          return fallbackMap
        }
        return prev
      })
      setIsOnline(false)
      setLastUpdated(new Date())
      scheduleRetry(() => { loadData() })
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [scheduleRetry])

  useEffect(() => {
    void resolveApiBase().then(() => loadData())
    const interval = setInterval(loadData, refreshMs)
    return () => {
      clearInterval(interval)
      if (retryRef.current) clearTimeout(retryRef.current)
    }
  }, [loadData, refreshMs])

  return (
    <MarketContext.Provider value={{ data, loading, lastUpdated, isOnline, serverError, refresh: loadData, refreshKey }}>
      {children}
    </MarketContext.Provider>
  )
}

export function useMarket() {
  return useContext(MarketContext)
}
