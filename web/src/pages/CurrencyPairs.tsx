import React, { useMemo, useState } from 'react'
import SparklineChart from '../components/SparklineChart'
import { SearchBox, Segmented } from '../components/ui'
import { chgDir, fmt, fmtChg, useMarket } from '../context/MarketContext'

type Group = 'All' | 'Majors' | 'Crosses' | 'Exotics' | 'Metals'

interface PairInfo { sym: string; pair: string; base: string; quote: string; group: Exclude<Group, 'All'> }

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
  const { data } = useMarket()
  const [group, setGroup] = useState<Group>('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => PAIRS.filter((p) => {
    if (group !== 'All' && p.group !== group) return false
    if (search) {
      const q = search.toLowerCase()
      if (!p.pair.toLowerCase().includes(q) && !p.base.toLowerCase().includes(q) && !p.quote.toLowerCase().includes(q)) return false
    }
    return true
  }), [group, search])

  return (
    <div className="page">
      <div className="toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search pairs — EUR, JPY, gold…" />
        <Segmented
          value={group}
          onChange={(v) => setGroup(v as Group)}
          options={(['All','Majors','Crosses','Exotics','Metals'] as const).map((g) => ({ label: g, value: g }))}
        />
      </div>

      <div className="asset-list">
        {filtered.map((p) => {
          const d = data[p.sym]
          const chg = d?.regularMarketChangePercent ?? 0
          const dir = chgDir(chg)
          const col = dir === 'up' ? 'var(--gain)' : dir === 'dn' ? 'var(--loss)' : 'var(--t2)'
          return (
            <div key={p.sym} className="asset fx" style={{ borderLeft: `3px solid ${col}` }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="sym">{p.pair}</span>
                  <span className="tag" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>{p.group}</span>
                </div>
              </div>
              <div className="spark">
                <SparklineChart symbol={p.sym} range="7d" width={80} height={28} color={col} />
              </div>
              <div className="right">
                <div className="mono" style={{ fontWeight: 700, fontSize: 15 }}>{d ? fmt(d.regularMarketPrice, decimals(p.sym)) : '—'}</div>
                <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: col, marginTop: 2 }}>{d ? fmtChg(chg) : '—'}</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
