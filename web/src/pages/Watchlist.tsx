import React, { useState, useEffect, useMemo } from 'react'
import SparklineChart from '../components/SparklineChart'
import { useColors } from '../hooks/useColors'
import { useSettings } from '../context/SettingsContext'
import { useMarket } from '../context/MarketContext'
import { chgDir, fmt, fmtChg, fmtMcap } from '../context/MarketContext'

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
  const c = useColors()
  const { settings } = useSettings()
  const { data } = useMarket()
  const [watchlist, setWatchlist] = useState<string[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => { setWatchlist(loadWatchlist()) }, [])

  const addSymbol = (sym: string) => {
    if (!watchlist.includes(sym)) {
      const next = [...watchlist, sym]
      setWatchlist(next)
      saveWatchlist(next)
    }
    setShowAdd(false)
    setSearch('')
  }

  const removeSymbol = (sym: string) => {
    const next = watchlist.filter((s) => s !== sym)
    setWatchlist(next)
    saveWatchlist(next)
  }

  const sorted = useMemo(() => {
    const items = watchlist.map((sym) => {
      const cat = CATALOG.find((c) => c.sym === sym)
      return { sym, name: cat?.name ?? sym }
    })
    if (settings.watchlistSort === 'change') {
      items.sort((a, b) => (data[b.sym]?.regularMarketChangePercent ?? 0) - (data[a.sym]?.regularMarketChangePercent ?? 0))
    } else if (settings.watchlistSort === 'alpha') {
      items.sort((a, b) => a.sym.localeCompare(b.sym))
    }
    return items
  }, [watchlist, settings.watchlistSort, data])

  const searchResults = useMemo(() => {
    if (!search) return []
    const q = search.toLowerCase()
    return CATALOG.filter((cat) => (cat.sym.toLowerCase().includes(q) || cat.name.toLowerCase().includes(q)) && !watchlist.includes(cat.sym)).slice(0, 10)
  }, [search, watchlist])

  return (
    <div className="page-container" style={{ background: c.void }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Watchlist</div>
          <div className="page-subtitle">{watchlist.length} symbols tracked</div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${c.gain}`, background: c.gainDim, color: c.gain, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      </div>
      <div style={{ padding: 14 }}>
        {/* Add Search */}
        {showAdd && (
          <div style={{ marginBottom: 12 }}>
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search symbols (e.g. AAPL, BTC-USD, GC=F)..."
              autoFocus
              style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${c.rim}`, background: c.surface, color: c.t1, fontSize: 12, outline: 'none', marginBottom: 6 }}
            />
            {searchResults.length > 0 && (
              <div style={{ borderRadius: 8, border: `1px solid ${c.rim}`, background: c.card, overflow: 'hidden' }}>
                {searchResults.map((cat) => (
                  <button key={cat.sym} onClick={() => addSymbol(cat.sym)} style={{ display: 'block', width: '100%', padding: '8px 12px', border: 'none', background: 'transparent', color: c.t1, fontSize: 12, textAlign: 'left', cursor: 'pointer', borderBottom: `1px solid ${c.rim}` }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = c.surface)}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontWeight: 600 }}>{cat.sym}</span> <span style={{ color: c.t4, fontSize: 10 }}>· {cat.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Watchlist */}
        {watchlist.length === 0 && !showAdd && (
          <div style={{ textAlign: 'center', padding: 40, color: c.t4 }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>⭐</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.t2 }}>No watchlist symbols</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Tap "+ Add" to start tracking symbols</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sorted.map(({ sym, name }) => {
            const d = data[sym]
            const chg = d?.regularMarketChangePercent ?? 0
            const dir = chgDir(chg)
            const col = dir === 'up' ? c.gain : dir === 'dn' ? c.loss : c.t2
            return (
              <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${c.rim}`, background: c.card }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.t1 }}>{sym}</div>
                  <div style={{ fontSize: 9, color: c.t4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                </div>
                <SparklineChart symbol={sym} range="7d" width={64} height={28} color={col} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.t1 }}>{d ? `$${fmt(d.regularMarketPrice, 2)}` : '—'}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: col }}>{d ? fmtChg(chg) : '—'}</div>
                </div>
                <button onClick={() => removeSymbol(sym)} style={{ padding: '4px 8px', borderRadius: 4, border: `1px solid ${c.lossDim}`, background: 'transparent', color: c.loss, fontSize: 10, cursor: 'pointer' }}>✕</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
