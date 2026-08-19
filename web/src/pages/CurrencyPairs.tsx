import React, { useEffect, useState } from 'react'
import SparklineChart from '../components/SparklineChart'
import { useColors } from '../hooks/useColors'
import { chgDir, fmt, fmtChg, useMarket } from '../context/MarketContext'
import { getApiBase } from '../utils/apiBase'
import { resolveSymbolAlias, getFallbackQuote } from '../utils/symbolFallbacks'

const BASE = getApiBase()

type Group = 'All' | 'Majors' | 'Crosses' | 'Exotics' | 'Metals'

const MAJOR_SYMS = new Set(['EURUSD=X','GBPUSD=X','USDJPY=X','USDCHF=X','AUDUSD=X','NZDUSD=X','USDCAD=X'])
const METAL_SYMS = new Set(['XAUUSD=X','XAGUSD=X','XPTUSD=X','XPDUSD=X'])

interface PairInfo { sym: string; pair: string; base: string; quote: string; group: Group }

const PAIRS: PairInfo[] = [
  { sym: 'XAUUSD=X', pair: 'XAU/USD', base: 'XAU', quote: 'USD', group: 'Metals' },
  { sym: 'XAGUSD=X', pair: 'XAG/USD', base: 'XAG', quote: 'USD', group: 'Metals' },
  { sym: 'XPTUSD=X', pair: 'XPT/USD', base: 'XPT', quote: 'USD', group: 'Metals' },
  { sym: 'XPDUSD=X', pair: 'XPD/USD', base: 'XPD', quote: 'USD', group: 'Metals' },
  { sym: 'EURUSD=X', pair: 'EUR/USD', base: 'EUR', quote: 'USD', group: 'Majors' },
  { sym: 'GBPUSD=X', pair: 'GBP/USD', base: 'GBP', quote: 'USD', group: 'Majors' },
  { sym: 'USDJPY=X', pair: 'USD/JPY', base: 'USD', quote: 'JPY', group: 'Majors' },
  { sym: 'USDCHF=X', pair: 'USD/CHF', base: 'USD', quote: 'CHF', group: 'Majors' },
  { sym: 'AUDUSD=X', pair: 'AUD/USD', base: 'AUD', quote: 'USD', group: 'Majors' },
  { sym: 'NZDUSD=X', pair: 'NZD/USD', base: 'NZD', quote: 'USD', group: 'Majors' },
  { sym: 'USDCAD=X', pair: 'USD/CAD', base: 'USD', quote: 'CAD', group: 'Majors' },
  { sym: 'EURGBP=X', pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', group: 'Crosses' },
  { sym: 'EURJPY=X', pair: 'EUR/JPY', base: 'EUR', quote: 'JPY', group: 'Crosses' },
  { sym: 'EURCHF=X', pair: 'EUR/CHF', base: 'EUR', quote: 'CHF', group: 'Crosses' },
  { sym: 'EURAUD=X', pair: 'EUR/AUD', base: 'EUR', quote: 'AUD', group: 'Crosses' },
  { sym: 'EURCAD=X', pair: 'EUR/CAD', base: 'EUR', quote: 'CAD', group: 'Crosses' },
  { sym: 'EURNZD=X', pair: 'EUR/NZD', base: 'EUR', quote: 'NZD', group: 'Crosses' },
  { sym: 'GBPJPY=X', pair: 'GBP/JPY', base: 'GBP', quote: 'JPY', group: 'Crosses' },
  { sym: 'GBPCHF=X', pair: 'GBP/CHF', base: 'GBP', quote: 'CHF', group: 'Crosses' },
  { sym: 'GBPAUD=X', pair: 'GBP/AUD', base: 'GBP', quote: 'AUD', group: 'Crosses' },
  { sym: 'GBPCAD=X', pair: 'GBP/CAD', base: 'GBP', quote: 'CAD', group: 'Crosses' },
  { sym: 'AUDJPY=X', pair: 'AUD/JPY', base: 'AUD', quote: 'JPY', group: 'Crosses' },
  { sym: 'CADJPY=X', pair: 'CAD/JPY', base: 'CAD', quote: 'JPY', group: 'Crosses' },
  { sym: 'CHFJPY=X', pair: 'CHF/JPY', base: 'CHF', quote: 'JPY', group: 'Crosses' },
  { sym: 'USDTRY=X', pair: 'USD/TRY', base: 'USD', quote: 'TRY', group: 'Exotics' },
  { sym: 'USDMXN=X', pair: 'USD/MXN', base: 'USD', quote: 'MXN', group: 'Exotics' },
  { sym: 'USDZAR=X', pair: 'USD/ZAR', base: 'USD', quote: 'ZAR', group: 'Exotics' },
  { sym: 'USDBRL=X', pair: 'USD/BRL', base: 'USD', quote: 'BRL', group: 'Exotics' },
  { sym: 'USDINR=X', pair: 'USD/INR', base: 'USD', quote: 'INR', group: 'Exotics' },
  { sym: 'USDCNY=X', pair: 'USD/CNY', base: 'USD', quote: 'CNY', group: 'Exotics' },
  { sym: 'USDKRW=X', pair: 'USD/KRW', base: 'USD', quote: 'KRW', group: 'Exotics' },
  { sym: 'USDPLN=X', pair: 'USD/PLN', base: 'USD', quote: 'PLN', group: 'Exotics' },
  { sym: 'USDSEK=X', pair: 'USD/SEK', base: 'USD', quote: 'SEK', group: 'Exotics' },
]

function decimals(sym: string): number {
  if (sym.startsWith('XAU') || sym.startsWith('XAG') || sym.startsWith('XPT') || sym.startsWith('XPD')) return 2
  if (sym.includes('JPY') || sym.includes('KRW') || sym.includes('NGN') || sym.includes('TRY') || sym.includes('INR') || sym.includes('MXN')) return 2
  return 4
}

export default function CurrencyPairsScreen() {
  const c = useColors()
  const { data, loading, refresh } = useMarket()
  const [group, setGroup] = useState<Group>('All')
  const [search, setSearch] = useState('')

  const filtered = PAIRS.filter((p) => {
    if (group !== 'All' && p.group !== group) return false
    if (search) {
      const q = search.toLowerCase()
      if (!p.pair.toLowerCase().includes(q) && !p.base.toLowerCase().includes(q) && !p.quote.toLowerCase().includes(q)) return false
    }
    return true
  })

  return (
    <div className="page-container" style={{ background: c.void }}>
      <div className="page-header">
        <div className="page-title">FX Pairs</div>
        <div className="page-subtitle">Foreign exchange rates & precious metals</div>
      </div>
      <div style={{ padding: 14 }}>
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search pairs..."
          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${c.rim}`, background: c.surface, color: c.t1, fontSize: 12, outline: 'none', marginBottom: 10 }}
        />
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
          {(['All','Majors','Crosses','Exotics','Metals'] as const).map((g) => (
            <button key={g} onClick={() => setGroup(g)} style={{ padding: '3px 8px', borderRadius: 6, border: `1px solid ${group === g ? c.blue : c.rim}`, background: group === g ? c.blue : c.card, color: group === g ? '#fff' : c.t3, fontSize: 9, fontWeight: 600, cursor: 'pointer' }}>
              {g}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map((p) => {
            const d = data[p.sym]
            const chg = d?.regularMarketChangePercent ?? 0
            const dir = chgDir(chg)
            const col = dir === 'up' ? c.gain : dir === 'dn' ? c.loss : c.t2
            const dec = decimals(p.sym)
            return (
              <div key={p.sym} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${c.rim}`, borderLeftColor: col, background: c.card }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: c.t1 }}>{p.pair}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.5, padding: '1px 5px', borderRadius: 3, background: c.blueDim, color: c.blue }}>{p.group.toUpperCase()}</span>
                  </div>
                </div>
                <SparklineChart symbol={p.sym} range="7d" width={64} height={24} color={col} />
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.t1 }}>{d ? fmt(d.regularMarketPrice, dec) : '—'}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: col }}>{d ? fmtChg(chg) : '—'}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
