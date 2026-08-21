import React, { useEffect, useState } from 'react'
import { EmptyState } from '../components/ui'
import { fmt, fmtChg, fmtMcap, useMarket } from '../context/MarketContext'
import { useSettings } from '../context/SettingsContext'

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
  const { data } = useMarket()
  const { settings } = useSettings()
  const [holdings, setHoldings] = useState<Holding[]>(loadHoldings)
  const [showAdd, setShowAdd] = useState(false)
  const [sym, setSym] = useState('')
  const [shares, setShares] = useState('')
  const [avgPrice, setAvgPrice] = useState('')

  useEffect(() => { setHoldings(loadHoldings()) }, [])
  useEffect(() => {
    if (settings.clearPortfolioKey > 0) setHoldings([])
  }, [settings.clearPortfolioKey])

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
    <div className="page">
      <div className="toolbar" style={{ justifyContent: 'space-between' }}>
        <p className="muted" style={{ maxWidth: 560 }}>
          Simulated tracker only. Add positions you want to follow — FloBoard never connects to a bank and never asks you to deposit money.
        </p>
        <button className="btn btn-ghost" onClick={() => setShowAdd(!showAdd)}>{showAdd ? 'Cancel' : '+ Add holding'}</button>
      </div>

      {holdings.length > 0 && (
        <div className="kpi-summary">
          <div className="kpi">
            <div className="kpi-label">Total value</div>
            <div className="kpi-val">${fmt(totalValue)}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Total P&amp;L</div>
            <div className="kpi-val" style={{ color: totalPnl >= 0 ? 'var(--gain)' : 'var(--loss)' }}>{totalPnl >= 0 ? '+' : ''}{fmtMcap(totalPnl)}</div>
          </div>
          <div className="kpi">
            <div className="kpi-label">Total return</div>
            <div className="kpi-val" style={{ color: totalPnlPct >= 0 ? 'var(--gain)' : 'var(--loss)' }}>{fmtChg(totalPnlPct)}</div>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="panel form-card">
          <input className="field" value={sym} onChange={(e) => setSym(e.target.value)} placeholder="Symbol (e.g. AAPL, BTC-USD)" />
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="field" value={shares} onChange={(e) => setShares(e.target.value)} placeholder="Shares / units" type="number" />
            <input className="field" value={avgPrice} onChange={(e) => setAvgPrice(e.target.value)} placeholder="Average price" type="number" />
          </div>
          <button className="btn btn-primary" onClick={addHolding}>Save holding</button>
        </div>
      )}

      {holdings.length === 0 && !showAdd && (
        <EmptyState
          icon="◎"
          title="No holdings yet"
          hint="Add a symbol, quantity, and average price to start tracking. Nothing here is a real brokerage account."
          action={<button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => setShowAdd(true)}>+ Add holding</button>}
        />
      )}

      <div className="asset-list">
        {holdings.map((h) => {
          const d = data[h.symbol]
          const price = d?.regularMarketPrice ?? h.avgPrice
          const value = price * h.shares
          const cost = h.avgPrice * h.shares
          const pnl = value - cost
          const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
          return (
            <div key={h.id} className="asset fx" style={{ cursor: 'default' }}>
              <div>
                <div className="sym">{h.symbol}</div>
                <div className="muted">{h.shares} units @ ${fmt(h.avgPrice)}</div>
              </div>
              <div className="right">
                <div className="mono" style={{ fontWeight: 700 }}>${fmt(value)}</div>
                <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: pnl >= 0 ? 'var(--gain)' : 'var(--loss)', marginTop: 2 }}>
                  {pnl >= 0 ? '+' : ''}{fmtMcap(pnl)} ({fmtChg(pnlPct)})
                </div>
              </div>
              <button className="btn btn-danger btn-sm" onClick={() => removeHolding(h.id)}>Remove</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
