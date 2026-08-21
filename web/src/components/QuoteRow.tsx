import React, { useState } from 'react'
import SparklineChart from './SparklineChart'
import { chgDir, fmt, fmtChg, useMarket } from '../context/MarketContext'

export default function QuoteRow({
  sym,
  name,
  unit,
  decimals = 2,
  prefix = '$',
}: {
  sym: string
  name: string
  unit?: string
  decimals?: number
  prefix?: string
}) {
  const { data } = useMarket()
  const [open, setOpen] = useState(false)
  const d = data[sym]
  const chg = d?.regularMarketChangePercent ?? 0
  const dir = chgDir(chg)
  const col = dir === 'up' ? 'var(--gain)' : dir === 'dn' ? 'var(--loss)' : 'var(--t2)'
  return (
    <div>
      <div className="asset fav" onClick={() => setOpen(!open)} style={{ cursor: 'pointer' }}>
        <div className="avatar" style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}>
          {sym.replace(/[^A-Z0-9]/gi, '').slice(0, 2) || '•'}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="sym">{name}</div>
          <div className="muted">{sym}{unit ? ` · ${unit}` : ''}</div>
        </div>
        <div className="spark">
          <SparklineChart symbol={sym} range="7d" width={80} height={32} color={col} />
        </div>
        <div className="right">
          <div className="mono" style={{ fontWeight: 700 }}>{d ? `${prefix}${fmt(d.regularMarketPrice, decimals)}` : '—'}</div>
          <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: col, marginTop: 2 }}>{d ? fmtChg(chg) : '—'}</div>
        </div>
        <span style={{ color: 'var(--t4)', fontSize: 11 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && d && (
        <div className="expand">
          <SparklineChart symbol={sym} range="7d" width={420} height={72} showLabels color={col} />
          <div className="stat-grid">
            {d.regularMarketDayHigh != null && <div><div className="stat-lab">Day high</div><div className="stat-val" style={{ color: 'var(--gain)' }}>{prefix}{fmt(d.regularMarketDayHigh, decimals)}</div></div>}
            {d.regularMarketDayLow != null && <div><div className="stat-lab">Day low</div><div className="stat-val" style={{ color: 'var(--loss)' }}>{prefix}{fmt(d.regularMarketDayLow, decimals)}</div></div>}
            {d.regularMarketPreviousClose != null && <div><div className="stat-lab">Prev close</div><div className="stat-val">{prefix}{fmt(d.regularMarketPreviousClose, decimals)}</div></div>}
          </div>
        </div>
      )}
    </div>
  )
}
