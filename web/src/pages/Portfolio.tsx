import React, { useState, useEffect } from 'react'
import { useColors } from '../hooks/useColors'
import { useSettings } from '../context/SettingsContext'
import { useMarket } from '../context/MarketContext'
import { chgDir, fmt, fmtChg, fmtMcap } from '../context/MarketContext'

interface Holding { id: string; symbol: string; shares: number; avgPrice: number }

const STORAGE_KEY = 'floboard:holdings'

function loadHoldings(): Holding[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveHoldings(h: Holding[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(h)) } catch { /* ignore */ }
}

export default function PortfolioScreen() {
  const c = useColors()
  const { settings } = useSettings()
  const { data } = useMarket()
  const [holdings, setHoldings] = useState<Holding[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [sym, setSym] = useState('')
  const [shares, setShares] = useState('')
  const [avgPrice, setAvgPrice] = useState('')

  useEffect(() => { setHoldings(loadHoldings()) }, [])

  const addHolding = () => {
    if (!sym.trim() || !shares || !avgPrice) return
    const newH: Holding = { id: Date.now().toString(), symbol: sym.trim().toUpperCase(), shares: parseFloat(shares), avgPrice: parseFloat(avgPrice) }
    const next = [...holdings, newH]
    setHoldings(next)
    saveHoldings(next)
    setSym(''); setShares(''); setAvgPrice('')
    setShowAdd(false)
  }

  const removeHolding = (id: string) => {
    const next = holdings.filter((h) => h.id !== id)
    setHoldings(next)
    saveHoldings(next)
  }

  const totalValue = holdings.reduce((sum, h) => sum + (data[h.symbol]?.regularMarketPrice ?? h.avgPrice) * h.shares, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.avgPrice * h.shares, 0)
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  return (
    <div className="page-container" style={{ background: c.void }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">Portfolio</div>
          <div className="page-subtitle">{holdings.length} holdings</div>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${c.gain}`, background: c.gainDim, color: c.gain, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
          {showAdd ? 'Cancel' : '+ Add Holding'}
        </button>
      </div>
      <div style={{ padding: 14 }}>
        {/* Summary */}
        {holdings.length > 0 && (
          <div className="card" style={{ marginBottom: 12, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div><div style={{ fontSize: 8, fontWeight: 700, color: c.t4, letterSpacing: 0.8 }}>TOTAL VALUE</div><div style={{ fontSize: 20, fontWeight: 700, color: c.t1 }}>${fmt(totalValue)}</div></div>
            <div><div style={{ fontSize: 8, fontWeight: 700, color: c.t4, letterSpacing: 0.8 }}>TOTAL P&L</div><div style={{ fontSize: 20, fontWeight: 700, color: totalPnl >= 0 ? c.gain : c.loss }}>{totalPnl >= 0 ? '+' : ''}{fmtMcap(totalPnl)}</div></div>
            <div><div style={{ fontSize: 8, fontWeight: 700, color: c.t4, letterSpacing: 0.8 }}>TOTAL RETURN</div><div style={{ fontSize: 20, fontWeight: 700, color: totalPnlPct >= 0 ? c.gain : c.loss }}>{fmtChg(totalPnlPct)}</div></div>
          </div>
        )}

        {/* Add Form */}
        {showAdd && (
          <div className="card" style={{ marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input value={sym} onChange={(e) => setSym(e.target.value)} placeholder="Symbol (e.g. AAPL, BTC-USD)" style={{ padding: '8px 12px', borderRadius: 6, border: `1px solid ${c.rim}`, background: c.surface, color: c.t1, fontSize: 12, outline: 'none' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={shares} onChange={(e) => setShares(e.target.value)} placeholder="Shares" type="number" style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: `1px solid ${c.rim}`, background: c.surface, color: c.t1, fontSize: 12, outline: 'none' }} />
              <input value={avgPrice} onChange={(e) => setAvgPrice(e.target.value)} placeholder="Avg Price" type="number" style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: `1px solid ${c.rim}`, background: c.surface, color: c.t1, fontSize: 12, outline: 'none' }} />
            </div>
            <button onClick={addHolding} style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: c.gain, color: '#080B10', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Add Holding</button>
          </div>
        )}

        {/* Holdings List */}
        {holdings.length === 0 && !showAdd && (
          <div style={{ textAlign: 'center', padding: 40, color: c.t4 }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>💼</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.t2 }}>No holdings yet</div>
            <div style={{ fontSize: 11, marginTop: 4 }}>Tap "Add Holding" to start tracking your portfolio</div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {holdings.map((h) => {
            const d = data[h.symbol]
            const price = d?.regularMarketPrice ?? h.avgPrice
            const value = price * h.shares
            const cost = h.avgPrice * h.shares
            const pnl = value - cost
            const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
            const chg = d?.regularMarketChangePercent ?? 0
            return (
              <div key={h.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: 8, border: `1px solid ${c.rim}`, background: c.card, gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.t1 }}>{h.symbol}</div>
                  <div style={{ fontSize: 9, color: c.t4 }}>{h.shares} shares @ ${fmt(h.avgPrice)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.t1 }}>${fmt(value)}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: pnl >= 0 ? c.gain : c.loss }}>{pnl >= 0 ? '+' : ''}{fmtMcap(pnl)} ({fmtChg(pnlPct)})</div>
                </div>
                <button onClick={() => removeHolding(h.id)} style={{ padding: '4px 8px', borderRadius: 4, border: `1px solid ${c.lossDim}`, background: 'transparent', color: c.loss, fontSize: 10, cursor: 'pointer' }}>✕</button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
