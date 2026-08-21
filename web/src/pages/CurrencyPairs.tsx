import React, { useMemo, useState } from 'react'
import SparklineChart from '../components/SparklineChart'
import { SearchBox, Segmented } from '../components/ui'
import { FOREX } from '../constants/marketData'
import { chgDir, fmt, fmtChg, useMarket } from '../context/MarketContext'

type Group = 'All' | 'Majors' | 'Crosses' | 'Exotics' | 'Metals'

interface PairInfo { sym: string; pair: string; base: string; quote: string; group: Exclude<Group, 'All'> }

const MAJORS = new Set(['EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'USDCHF=X', 'AUDUSD=X', 'NZDUSD=X', 'USDCAD=X'])
const EXOTIC = /TRY|MXN|ZAR|BRL|INR|CNY|CNH|KRW|PLN|HUF|CZK|SEK|NOK|DKK|RUB|ILS|CLP|COP|PEN|ARS|NGN|KES|EGP|GHS|TZS|MAD|AED|SAR|QAR|KWD|BHD|OMR|JOD|HKD|TWD|THB|MYR|IDR|PHP|VND|PKR|BDT|RON|BGN/

function classify(sym: string): Exclude<Group, 'All'> {
  if (/^XAU|^XAG|^XPT|^XPD/.test(sym)) return 'Metals'
  if (MAJORS.has(sym)) return 'Majors'
  if (EXOTIC.test(sym)) return 'Exotics'
  return 'Crosses'
}

const PAIRS: PairInfo[] = FOREX.map((f) => {
  const pair = f.label.includes('/') ? f.label : f.label.replace(/(.{3})(.{3})/, '$1/$2')
  const [base, quote] = pair.split('/')
  return { sym: f.sym, pair, base: base || f.sym.slice(0, 3), quote: quote || f.sym.slice(3, 6), group: classify(f.sym) }
})

function decimals(sym: string): number {
  if (sym.startsWith('XAU') || sym.startsWith('XAG') || sym.startsWith('XPT') || sym.startsWith('XPD')) return 2
  if (sym.includes('JPY') || sym.includes('KRW') || sym.includes('NGN') || sym.includes('TRY') || sym.includes('INR') || sym.includes('MXN') || sym.includes('HUF') || sym.includes('CLP') || sym.includes('IDR') || sym.includes('VND')) return 2
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
      if (!p.pair.toLowerCase().includes(q) && !p.base.toLowerCase().includes(q) && !p.quote.toLowerCase().includes(q) && !p.sym.toLowerCase().includes(q)) return false
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
          options={(['All', 'Majors', 'Crosses', 'Exotics', 'Metals'] as const).map((g) => ({ label: g, value: g }))}
        />
      </div>

      {filtered.length === 0 && <div className="muted" style={{ padding: 20 }}>No pairs match that search.</div>}

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
