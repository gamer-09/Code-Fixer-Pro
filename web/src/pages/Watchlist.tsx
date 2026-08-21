import React, { useEffect, useMemo, useState } from 'react'
import SparklineChart from '../components/SparklineChart'
import { EmptyState, SearchBox } from '../components/ui'
import { chgDir, fmt, fmtChg, useMarket } from '../context/MarketContext'
import { useSettings } from '../context/SettingsContext'
import { getApiBase } from '../utils/apiBase'

const STORAGE_KEY = 'floboard:watchlist'

function loadWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveWatchlist(syms: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(syms)) } catch { /* ignore */ }
}

const CATALOG = [
  { sym: 'AAPL', name: 'Apple' }, { sym: 'MSFT', name: 'Microsoft' }, { sym: 'NVDA', name: 'Nvidia' },
  { sym: 'GOOGL', name: 'Alphabet' }, { sym: 'AMZN', name: 'Amazon' }, { sym: 'META', name: 'Meta' },
  { sym: 'TSLA', name: 'Tesla' }, { sym: 'BTC-USD', name: 'Bitcoin' }, { sym: 'ETH-USD', name: 'Ethereum' },
  { sym: 'GC=F', name: 'Gold Futures' }, { sym: 'SI=F', name: 'Silver Futures' }, { sym: 'CL=F', name: 'Crude Oil' },
  { sym: 'EURUSD=X', name: 'EUR/USD' }, { sym: 'GBPUSD=X', name: 'GBP/USD' }, { sym: 'USDJPY=X', name: 'USD/JPY' },
  { sym: 'SOL-USD', name: 'Solana' }, { sym: 'XRP-USD', name: 'Ripple' }, { sym: 'DOGE-USD', name: 'Dogecoin' },
  { sym: '^GSPC', name: 'S&P 500' }, { sym: '^IXIC', name: 'Nasdaq' }, { sym: '^DJI', name: 'Dow Jones' },
]

export default function WatchlistScreen() {
  const { settings } = useSettings()
  const { data, ensureSymbols } = useMarket()
  const [watchlist, setWatchlist] = useState<string[]>(loadWatchlist)
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [remote, setRemote] = useState<{ sym: string; name: string }[]>([])

  useEffect(() => {
    if (settings.clearWatchlistKey > 0) {
      setWatchlist([])
      saveWatchlist([])
    }
  }, [settings.clearWatchlistKey])

  useEffect(() => {
    if (watchlist.length) ensureSymbols(watchlist)
  }, [watchlist, ensureSymbols])

  useEffect(() => {
    const q = search.trim()
    if (q.length < 1) {
      setRemote([])
      return
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/search?q=${encodeURIComponent(q)}`)
        if (!res.ok) return
        const json = await res.json() as { results?: { sym: string; name: string }[] }
        const have = new Set(watchlist.map((s) => s.toUpperCase()))
        setRemote(
          (json.results ?? [])
            .filter((r) => r.sym && !have.has(r.sym.toUpperCase()))
            .slice(0, 8)
            .map((r) => ({ sym: r.sym.toUpperCase(), name: r.name })),
        )
      } catch { /* ignore */ }
    }, 280)
    return () => clearTimeout(t)
  }, [search, watchlist])

  const addSymbol = (sym: string) => {
    const clean = sym.trim().toUpperCase()
    if (!clean) return
    if (!watchlist.includes(clean)) {
      const next = [...watchlist, clean]
      setWatchlist(next)
      saveWatchlist(next)
      ensureSymbols([clean])
    }
    setShowAdd(false)
    setSearch('')
    setRemote([])
  }

  const addCustom = () => addSymbol(search)

  const removeSymbol = (sym: string) => {
    const next = watchlist.filter((s) => s !== sym)
    setWatchlist(next)
    saveWatchlist(next)
  }

  const sorted = useMemo(() => {
    const items = watchlist.map((sym) => {
      const cat = CATALOG.find((c) => c.sym === sym)
      const remoteHit = remote.find((r) => r.sym === sym)
      return { sym, name: cat?.name ?? remoteHit?.name ?? data[sym]?.shortName ?? sym }
    })
    if (settings.watchlistSort === 'change') {
      items.sort((a, b) => (data[b.sym]?.regularMarketChangePercent ?? 0) - (data[a.sym]?.regularMarketChangePercent ?? 0))
    } else if (settings.watchlistSort === 'alpha') {
      items.sort((a, b) => a.sym.localeCompare(b.sym))
    }
    return items
  }, [watchlist, settings.watchlistSort, data, remote])

  const searchResults = useMemo(() => {
    if (!search) return []
    const q = search.toLowerCase()
    const local = CATALOG.filter((cat) => (cat.sym.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) && !watchlist.includes(cat.sym))
    const have = new Set([...local.map((c) => c.sym), ...watchlist])
    const extra = remote.filter((r) => !have.has(r.sym))
    return [...local, ...extra].slice(0, 10)
  }, [search, watchlist, remote])

  return (
    <div className="page">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <span className="muted">{watchlist.length} favorite{watchlist.length === 1 ? '' : 's'}</span>
        <button className="btn btn-ghost" onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Cancel' : '+ Add favorite'}</button>
      </div>

      {showAdd && (
        <div className="panel form-card">
          <SearchBox value={search} onChange={setSearch} placeholder="Search AAPL, Bitcoin, gold…" />
          {searchResults.length > 0 && (
            <div className="panel">
              {searchResults.map((cat) => (
                <button
                  key={cat.sym}
                  type="button"
                  onClick={() => addSymbol(cat.sym)}
                  style={{ display: 'block', width: '100%', padding: '10px 14px', border: 'none', background: 'transparent', color: 'var(--t1)', textAlign: 'left', borderBottom: '1px solid var(--rim)' }}
                >
                  <strong>{cat.sym}</strong> <span className="muted">· {cat.name}</span>
                </button>
              ))}
            </div>
          )}
          {search.trim() && (
            <button className="btn btn-primary" onClick={addCustom}>Add “{search.trim().toUpperCase()}”</button>
          )}
        </div>
      )}

      {watchlist.length === 0 && !showAdd && (
        <EmptyState
          icon="★"
          title="No favorites yet"
          hint="Pin the symbols you care about. Settings → Clear Favorites only empties this list."
          action={<button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>+ Add favorite</button>}
        />
      )}

      <div className="asset-list">
        {sorted.map(({ sym, name }) => {
          const d = data[sym]
          const chg = d?.regularMarketChangePercent ?? 0
          const dir = chgDir(chg)
          const col = dir === 'up' ? 'var(--gain)' : dir === 'dn' ? 'var(--loss)' : 'var(--t2)'
          return (
            <div key={sym} className="asset fav" style={{ cursor: 'default' }}>
              <div className="avatar" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>{sym.slice(0, 2)}</div>
              <div style={{ minWidth: 0 }}>
                <div className="sym">{sym}</div>
                <div className="muted">{name}</div>
              </div>
              <div className="spark">
                <SparklineChart symbol={sym} range="7d" width={80} height={32} color={col} />
              </div>
              <div className="right">
                <div className="mono" style={{ fontWeight: 700 }}>{d ? `$${fmt(d.regularMarketPrice, 2)}` : '—'}</div>
                <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: col, marginTop: 2 }}>{d ? fmtChg(chg) : '—'}</div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => removeSymbol(sym)}>✕</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
