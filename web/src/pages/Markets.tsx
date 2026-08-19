import React, { useEffect, useMemo, useRef, useState } from 'react'
import SparklineChart from '../components/SparklineChart'
import { useColors } from '../hooks/useColors'
import { chgDir, fmt, fmtChg, fmtMcap, useMarket } from '../context/MarketContext'
import { useSettings } from '../context/SettingsContext'
import { BONDS, COMMODITIES, CRYPTOS, EXTRA_SYMBOLS, FOREX, INDICES, SECTORS, STOCKS } from '../constants/marketData'

function SectionHeader({ label, count, right }: { label: string; count?: number; right?: React.ReactNode }) {
  const c = useColors()
  return (
    <div className="section-header">
      <span className="section-label" style={{ color: c.t3 }}>{label}</span>
      {count != null && <span className="section-count">{count}</span>}
      <div className="section-line" style={{ background: c.rim }} />
      {right}
    </div>
  )
}

function ChangeBadge({ value }: { value: number | null | undefined }) {
  const c = useColors()
  const dir = chgDir(value)
  const bg = dir === 'up' ? c.gainDim : dir === 'dn' ? c.lossDim : c.amberDim
  const col = dir === 'up' ? c.gain : dir === 'dn' ? c.loss : c.amber
  return <span className="badge" style={{ background: bg, color: col }}>{fmtChg(value)}</span>
}

// ── Macro Ribbon ────────────────────────────────────────────────────────
const RIBBON_SYMBOLS = [
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: '^IXIC', label: 'Nasdaq' },
  { sym: 'BTC-USD', label: 'Bitcoin' },
  { sym: 'GC=F', label: 'Gold' },
  { sym: 'DX-Y.NYB', label: 'DXY' },
  { sym: '^TNX', label: '10Y' },
]

function MacroRibbon() {
  const c = useColors()
  const { data } = useMarket()
  return (
    <div style={{ display: 'flex', gap: 6, padding: '8px 12px', overflowX: 'auto', borderBottom: `1px solid ${c.rim}` }}>
      {RIBBON_SYMBOLS.map(({ sym, label }) => {
        const d = data[sym]
        const chg = d?.regularMarketChangePercent ?? 0
        const dir = chgDir(chg)
        const col = dir === 'up' ? c.gain : dir === 'dn' ? c.loss : c.amber
        const arrow = dir === 'up' ? '▲' : dir === 'dn' ? '▼' : '—'
        return (
          <div key={sym} style={{ borderRadius: 8, border: `1px solid ${c.rim}`, background: c.card, padding: '6px 10px', minWidth: 72, textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: c.t4 }}>{label}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: c.t1 }}>
              {d ? (sym === '^TNX' ? `${fmt(d.regularMarketPrice, 2)}%` : sym === 'DX-Y.NYB' ? fmt(d.regularMarketPrice, 2) : sym === 'BTC-USD' ? `$${fmt(d.regularMarketPrice, 0)}` : fmt(d.regularMarketPrice, 0)) : '—'}
            </div>
            {d && <div style={{ fontSize: 9, fontWeight: 500, color: col, marginTop: 1 }}>{arrow} {Math.abs(chg).toFixed(1)}%</div>}
          </div>
        )
      })}
    </div>
  )
}

// ── Index Card ──────────────────────────────────────────────────────────
function IndexCard({ sym, name, region }: { sym: string; name: string; region: string }) {
  const c = useColors()
  const { data } = useMarket()
  const d = data[sym]
  const chg = d?.regularMarketChangePercent ?? 0
  const dir = chgDir(chg)
  const accent = dir === 'up' ? c.gain : dir === 'dn' ? c.loss : c.rim
  const accentBg = dir === 'up' ? c.gainDim : dir === 'dn' ? c.lossDim : 'transparent'
  return (
    <div style={{ width: 'calc(50% - 3px)', background: c.card, border: `1px solid ${c.rim}`, borderRadius: 8, display: 'flex', overflow: 'hidden' }}>
      <div style={{ width: 3, background: accent, alignSelf: 'stretch' }} />
      <div style={{ flex: 1, padding: 11 }}>
        <div style={{ fontSize: 7, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: c.t4, marginBottom: 2 }}>{region}</div>
        <div style={{ fontSize: 11, fontWeight: 500, color: c.t2, marginBottom: 6 }}>{name}</div>
        <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.5, color: c.t1, marginBottom: 4 }}>{d ? fmt(d.regularMarketPrice, 0) : '—'}</div>
        {d && <span className="badge" style={{ background: accentBg, color: accent, fontSize: 10, fontWeight: 600 }}>{fmtChg(chg)}</span>}
        <SparklineChart symbol={sym} range="7d" width={110} height={36} color={d ? accent : undefined} />
      </div>
    </div>
  )
}

// ── Sector Tile ─────────────────────────────────────────────────────────
function SectorTile({ sym, label }: { sym: string; label: string }) {
  const c = useColors()
  const { data } = useMarket()
  const d = data[sym]
  const chg = d?.regularMarketChangePercent ?? 0
  const dir = chgDir(chg)
  const abs = Math.abs(chg)
  let bg: string, textCol: string, borderCol: string
  if (!d) { bg = c.card; textCol = c.t3; borderCol = c.rim }
  else if (dir === 'up') { bg = abs > 2 ? '#00E5A030' : abs > 1 ? '#00E5A01A' : '#00E5A00D'; textCol = c.gain; borderCol = 'rgba(0,229,160,0.2)' }
  else if (dir === 'dn') { bg = abs > 2 ? '#FF4D6A30' : abs > 1 ? '#FF4D6A1A' : '#FF4D6A0D'; textCol = c.loss; borderCol = 'rgba(255,77,106,0.2)' }
  else { bg = c.amberDim; textCol = c.amber; borderCol = c.rim }
  return (
    <div style={{ width: 'calc(33.3% - 4px)', background: bg, border: `1px solid ${borderCol}`, borderRadius: 8, padding: 10 }}>
      <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.5, color: c.t4, marginBottom: 3 }}>{sym}</div>
      <div style={{ fontSize: 10, fontWeight: 500, color: c.t2, marginBottom: 5, lineHeight: 1.3 }}>{label.replace(' SPDR', '').replace(' ETF', '')}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: textCol }}>{d ? fmtChg(chg) : '—'}</div>
    </div>
  )
}

// ── Bond Yields ─────────────────────────────────────────────────────────
function BondsSection() {
  const c = useColors()
  const { data } = useMarket()
  const vix = data['^VIX']
  const dxy = data['DX-Y.NYB']
  const vixVal = vix?.regularMarketPrice
  const dxyChg = dxy?.regularMarketChangePercent
  const maxYield = Math.max(...BONDS.map((b) => data[b.sym]?.regularMarketPrice ?? 0), 6)
  const vixLevel = !vixVal ? 'neutral' : vixVal < 15 ? 'greed' : vixVal > 25 ? 'fear' : 'neutral'
  const vixColor = vixLevel === 'greed' ? c.gain : vixLevel === 'fear' ? c.loss : c.amber
  const vixLabel = vixLevel === 'greed' ? 'LOW FEAR' : vixLevel === 'fear' ? 'HIGH FEAR' : 'NEUTRAL'

  return (
    <div className="section">
      <SectionHeader label="Bond Yields & Volatility" />
      <div className="card" style={{ gap: 10, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1.2, color: c.t4 }}>US TREASURY YIELD CURVE</div>
        {BONDS.map((b) => {
          const d = data[b.sym]
          const y = d?.regularMarketPrice
          const pct = maxYield > 0 ? ((y ?? 0) / maxYield) * 100 : 0
          const chg = d?.regularMarketChangePercent ?? 0
          const dir = chgDir(chg)
          const barCol = dir === 'up' ? c.loss : dir === 'dn' ? c.gain : c.amber
          return (
            <div key={b.sym} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 10, fontWeight: 600, width: 36, color: c.t3 }}>{b.label}</span>
              <div style={{ flex: 1, height: 5, borderRadius: 3, background: c.surface, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, width: `${pct}%`, background: barCol }} />
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, width: 48, textAlign: 'right', color: c.t1 }}>{y != null ? `${fmt(y, 2)}%` : '—'}</span>
              <span style={{ fontSize: 9, fontWeight: 500, width: 30, textAlign: 'right', color: barCol }}>
                {d ? (chg >= 0 ? `+${fmt(Math.abs(chg), 1)}` : `-${fmt(Math.abs(chg), 1)}`) : ''}
              </span>
            </div>
          )
        })}
        <div style={{ display: 'flex', borderTop: `1px solid ${c.rim}`, paddingTop: 10, marginTop: 2, gap: 12 }}>
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, color: c.t4 }}>VIX</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: vixColor }}>{vixVal != null ? fmt(vixVal, 1) : '—'}</div>
            <span className="badge" style={{ background: vixLevel === 'fear' ? c.lossDim : vixLevel === 'greed' ? c.gainDim : c.amberDim, color: vixColor }}>{vixVal ? vixLabel : 'N/A'}</span>
          </div>
          <div style={{ width: 1, background: c.rim, margin: '4px 0' }} />
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, color: c.t4 }}>US DOLLAR INDEX</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: chgDir(dxyChg) === 'up' ? c.gain : chgDir(dxyChg) === 'dn' ? c.loss : c.t1 }}>
              {dxy?.regularMarketPrice != null ? fmt(dxy.regularMarketPrice, 2) : '—'}
            </div>
            <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 0.8, color: c.t4 }}>{dxyChg != null ? fmtChg(dxyChg) : ''}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Movers ──────────────────────────────────────────────────────────────
function MoversSection() {
  const c = useColors()
  const { data } = useMarket()
  const [moverTab, setMoverTab] = useState<'All' | 'Stocks' | 'Crypto' | 'Forex'>('All')
  const universe = useMemo(() => {
    if (moverTab === 'Stocks') return STOCKS.map((s) => ({ sym: s.sym, name: s.name }))
    if (moverTab === 'Crypto') return CRYPTOS.map((ct) => ({ sym: ct.sym, name: ct.name }))
    if (moverTab === 'Forex') return FOREX.map((f) => ({ sym: f.sym, name: f.label }))
    return [...STOCKS.map((s) => ({ sym: s.sym, name: s.name })), ...CRYPTOS.map((ct) => ({ sym: ct.sym, name: ct.name })), ...FOREX.map((f) => ({ sym: f.sym, name: f.label })), ...COMMODITIES.map((co) => ({ sym: co.sym, name: co.label }))]
  }, [moverTab])

  const loaded = universe.filter((s) => data[s.sym] != null)
  if (loaded.length < 4) return null
  const sorted = [...loaded].sort((a, b) => (data[b.sym]?.regularMarketChangePercent ?? 0) - (data[a.sym]?.regularMarketChangePercent ?? 0))
  const gainers = sorted.slice(0, 5)
  const losers = sorted.slice(-5).reverse()

  return (
    <div className="section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <SectionHeader label="Today's Top Movers" />
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {(['All', 'Stocks', 'Crypto', 'Forex'] as const).map((t) => {
            const active = moverTab === t
            return (
              <button key={t} onClick={() => setMoverTab(t)} style={{ padding: '4px 9px', borderRadius: 6, border: `1px solid ${active ? c.blue : c.rim}`, background: active ? c.blue : c.card, color: active ? '#fff' : c.t3, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
                {t}
              </button>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[{ title: 'GAINERS', items: gainers, col: c.gain, borderCol: 'rgba(0,229,160,0.2)' }, { title: 'LOSERS', items: losers, col: c.loss, borderCol: 'rgba(255,77,106,0.2)' }].map(({ title, items, col, borderCol }) => (
          <div key={title} style={{ flex: 1, background: c.card, border: `1px solid ${borderCol}`, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 10px 8px', borderBottom: `1px solid ${c.rim}` }}>
              <div style={{ width: 5, height: 5, borderRadius: 3, background: col }} />
              <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, color: col }}>{title}</span>
            </div>
            {items.map((s) => {
              const d = data[s.sym]
              const chg = d?.regularMarketChangePercent ?? 0
              return (
                <div key={s.sym} style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderBottom: `1px solid ${c.rim}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: c.t1 }}>{s.sym}</div>
                    <div style={{ fontSize: 8, color: c.t4, marginTop: 1, maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: col }}>{fmtChg(chg)}</div>
                    <div style={{ fontSize: 9, color: c.t3, marginTop: 1 }}>${fmt(d?.regularMarketPrice, s.sym.includes('=X') || s.sym.includes('/') ? 4 : 2)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Stock Table ─────────────────────────────────────────────────────────
function StockRow({ sym, name, even }: { sym: string; name: string; even: boolean }) {
  const c = useColors()
  const { data } = useMarket()
  const { settings } = useSettings()
  const d = data[sym]
  const chg = d?.regularMarketChangePercent ?? 0
  const dir = chgDir(chg)
  const chgColor = dir === 'up' ? c.gain : dir === 'dn' ? c.loss : c.t2
  return (
    <tr style={{ background: even ? c.surface : 'transparent' }}>
      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${c.rim}` }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: c.t1 }}>{sym}</div>
        <div style={{ fontSize: 9, color: c.t4, marginTop: 1 }}>{name}</div>
      </td>
      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${c.rim}`, textAlign: 'right', fontSize: 12, fontWeight: 500, color: c.t1 }}>${d ? fmt(d.regularMarketPrice, settings.priceDecimals) : '—'}</td>
      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${c.rim}`, textAlign: 'right', fontSize: 11, fontWeight: 600, color: chgColor }}>{d ? fmtChg(chg) : '—'}</td>
      <td style={{ padding: '9px 12px', borderBottom: `1px solid ${c.rim}`, textAlign: 'right', fontSize: 10, color: c.t3 }}>{d ? fmtMcap(d.marketCap, settings.compactNumbers) : '—'}</td>
    </tr>
  )
}

// ── Market Hours (simplified for web) ───────────────────────────────────
function MarketHoursSection() {
  const c = useColors()
  const [now, setNow] = useState(new Date())
  useEffect(() => { const id = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(id) }, [])

  return (
    <div className="section">
      <SectionHeader label="Market Hours" />
      <div className="card" style={{ fontSize: 10, color: c.t3 }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div>🇺🇸 NYSE/NASDAQ: {isMarketOpen('America/New_York') ? <span style={{ color: c.gain }}>OPEN</span> : <span style={{ color: c.t4 }}>CLOSED</span>}</div>
          <div>🇬🇧 LSE: {isMarketOpen('Europe/London') ? <span style={{ color: c.gain }}>OPEN</span> : <span style={{ color: c.t4 }}>CLOSED</span>}</div>
          <div>🇯🇵 TSE: {isMarketOpen('Asia/Tokyo') ? <span style={{ color: c.gain }}>OPEN</span> : <span style={{ color: c.t4 }}>CLOSED</span>}</div>
        </div>
        <div style={{ marginTop: 6, fontSize: 8, color: c.t4 }}>Crypto 24/7 · Forex Sun 5pm – Fri 5pm ET</div>
      </div>
    </div>
  )
}

function isMarketOpen(tz: string): boolean {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false }).formatToParts(new Date())
    const weekdayStr = parts.find((p) => p.type === 'weekday')?.value ?? ''
    if (weekdayStr === 'Sun' || weekdayStr === 'Sat') return false
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0')
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0')
    const mins = h * 60 + m
    return mins >= 570 && mins < 960 // 9:30 - 16:00
  } catch { return false }
}

// ── Main ────────────────────────────────────────────────────────────────
export default function MarketsScreen() {
  const c = useColors()
  const { loading, lastUpdated, refresh, isOnline } = useMarket()
  const [clock, setClock] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setClock(`${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')} UTC`)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="page-container" style={{ background: c.void }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="pulse-dot" style={{ background: isOnline ? c.gain : c.loss }} />
          <span className="page-title">FloBoard</span>
          <span style={{ borderRadius: 20, border: `1px solid ${isOnline ? 'rgba(0,229,160,0.2)' : 'rgba(255,107,107,0.25)'}`, background: isOnline ? c.gainDim : c.lossDim, padding: '2px 8px', fontSize: 9, fontWeight: 700, letterSpacing: 1, color: isOnline ? c.gain : c.loss }}>
            {isOnline ? 'LIVE' : 'OFFLINE'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: c.t3 }}>{clock}</span>
          <button onClick={refresh} disabled={loading} style={{ width: 30, height: 30, borderRadius: 6, border: `1px solid ${c.rim}`, background: c.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: c.t2 }}>
            {loading ? <div className="spinner" style={{ width: 13, height: 13 }} /> : '↻'}
          </button>
        </div>
      </div>

      <MacroRibbon />

      <div style={{ padding: '0 14px', paddingBottom: 24 }}>
        <MarketHoursSection />

        {/* Global Indices */}
        <div className="section">
          <SectionHeader label="Global Indices" count={INDICES.length} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {INDICES.map((idx) => <IndexCard key={idx.sym} {...idx} />)}
          </div>
        </div>

        {/* Sectors */}
        <div className="section">
          <SectionHeader label="S&P 500 Sectors" count={SECTORS.length} />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SECTORS.map((s) => <SectorTile key={s.sym} sym={s.sym} label={s.label} />)}
          </div>
        </div>

        <MoversSection />
        <BondsSection />

        {/* Forex */}
        <div className="section">
          <SectionHeader label="Foreign Exchange" />
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {FOREX.map((fx) => {
              const d = useMarket().data[fx.sym]
              const chg = d?.regularMarketChangePercent ?? 0
              const dir = chgDir(chg)
              const col = dir === 'up' ? c.gain : dir === 'dn' ? c.loss : c.amber
              return (
                <div key={fx.sym} style={{ borderRadius: 20, border: `1px solid ${c.rim}`, background: c.card, padding: '7px 12px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: c.t2, letterSpacing: 0.3 }}>{fx.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: c.t1 }}>{d ? fmt(d.regularMarketPrice, 4) : '—'}</span>
                  {d && <span className="badge" style={{ background: dir === 'up' ? c.gainDim : dir === 'dn' ? c.lossDim : c.amberDim, color: col, fontSize: 9 }}>{fmtChg(chg)}</span>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Commodities */}
        <div className="section">
          <SectionHeader label="Commodities" />
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
            {COMMODITIES.map((co) => {
              const d = useMarket().data[co.sym]
              const chg = d?.regularMarketChangePercent ?? 0
              const dir = chgDir(chg)
              const col = dir === 'up' ? c.gain : dir === 'dn' ? c.loss : c.amber
              return (
                <div key={co.sym} style={{ borderRadius: 8, border: `1px solid ${c.rim}`, background: c.card, padding: 11, minWidth: 110, flexShrink: 0 }}>
                  <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: c.t4, marginBottom: 3 }}>{co.label}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: c.amber, marginBottom: 1 }}>{d ? `$${fmt(d.regularMarketPrice)}` : '—'}</div>
                  <div style={{ fontSize: 8, color: c.t4, marginBottom: 6 }}>{co.unit}</div>
                  {d && <ChangeBadge value={chg} />}
                </div>
              )
            })}
          </div>
        </div>

        {/* Major Stocks */}
        <div className="section">
          <SectionHeader label="Major Stocks" count={STOCKS.length} />
          <div style={{ borderRadius: 8, border: `1px solid ${c.rim}`, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', flex: 2 }}>COMPANY</th>
                  <th style={{ textAlign: 'right' }}>PRICE</th>
                  <th style={{ textAlign: 'right' }}>CHG%</th>
                  <th style={{ textAlign: 'right' }}>MKT CAP</th>
                </tr>
              </thead>
              <tbody>
                {STOCKS.map((s, i) => <StockRow key={s.sym} sym={s.sym} name={s.name} even={i % 2 === 1} />)}
              </tbody>
            </table>
          </div>
        </div>

        {lastUpdated && (
          <div style={{ textAlign: 'center', fontSize: 10, color: c.t4, marginTop: 12, marginBottom: 6 }}>
            Last updated {lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>
    </div>
  )
}
