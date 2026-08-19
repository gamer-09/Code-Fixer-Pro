import React, { useMemo, useState } from 'react'
import SparklineChart from '../components/SparklineChart'
import { useColors } from '../hooks/useColors'
import { chgDir, fmt, fmtChg, fmtMcap, useMarket } from '../context/MarketContext'
import { CRYPTOS } from '../constants/marketData'

type SortKey = 'default' | 'change' | 'change_asc' | 'mcap' | 'price'
type Group = 'All' | 'Top' | 'Stable' | 'L1' | 'L2' | 'DeFi' | 'Meme' | 'AI'

const GROUP_SYMS: Record<Group, string[] | null> = {
  All: null,
  Top: ['USDT-USD','USDC-USD','BTC-USD','ETH-USD','BNB-USD','SOL-USD','XRP-USD','TON11419-USD','DOGE-USD','ADA-USD','AVAX-USD','DOT-USD','LINK-USD','MATIC-USD','LTC-USD','SHIB-USD','TRX-USD','HBAR-USD','WLD-USD','JUP29210-USD','PYTH-USD'],
  Stable: ['USDT-USD','USDC-USD','DAI-USD','WBTC-USD'],
  L1: ['BTC-USD','ETH-USD','SOL-USD','ADA-USD','AVAX-USD','DOT-USD','TON11419-USD','ATOM-USD','NEAR-USD','ICP-USD','ETC-USD','HBAR-USD','VET-USD','TRX-USD','XLM-USD','XMR-USD','LTC-USD','BCH-USD','ALGO-USD','FTM-USD','EGLD-USD','XTZ-USD','EOS-USD','ZEC-USD','MINA-USD','KAVA-USD','KAS-USD','CFX-USD','ROSE-USD','ONE-USD','WLD-USD'],
  L2: ['MATIC-USD','APT21794-USD','ARB11841-USD','OP-USD','SUI20947-USD','IMX-USD','STX-USD','SEI-USD'],
  DeFi: ['UNI7083-USD','AAVE-USD','MKR-USD','LDO-USD','INJ-USD','GRT-USD','CRV-USD','SNX-USD','CAKE-USD','DYDX-USD','PENDLE-USD','COMP5692-USD','ONDO-USD'],
  Meme: ['DOGE-USD','SHIB-USD','PEPE24478-USD','WIF-USD','BONK-USD','FLOKI-USD'],
  AI: ['RNDR-USD','FET-USD','TIA-USD','OCEAN-USD','TAO22974-USD','WLD-USD','HYPE32196-USD'],
}

export default function CryptoScreen() {
  const c = useColors()
  const { data, loading, refresh } = useMarket()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('default')
  const [group, setGroup] = useState<Group>('All')
  const [expandedSym, setExpandedSym] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let items = CRYPTOS
    if (group !== 'All' && GROUP_SYMS[group]) {
      const syms = new Set(GROUP_SYMS[group])
      items = items.filter((ct) => syms.has(ct.sym))
    }
    if (search) {
      const q = search.toLowerCase()
      items = items.filter((ct) => ct.sym.toLowerCase().includes(q) || ct.name.toLowerCase().includes(q) || ct.label.toLowerCase().includes(q))
    }
    if (sort === 'change') items = [...items].sort((a, b) => (data[b.sym]?.regularMarketChangePercent ?? 0) - (data[a.sym]?.regularMarketChangePercent ?? 0))
    if (sort === 'change_asc') items = [...items].sort((a, b) => (data[a.sym]?.regularMarketChangePercent ?? 0) - (data[b.sym]?.regularMarketChangePercent ?? 0))
    if (sort === 'mcap') items = [...items].sort((a, b) => (data[b.sym]?.marketCap ?? 0) - (data[a.sym]?.marketCap ?? 0))
    if (sort === 'price') items = [...items].sort((a, b) => (data[b.sym]?.regularMarketPrice ?? 0) - (data[a.sym]?.regularMarketPrice ?? 0))
    return items
  }, [search, sort, group, data])

  return (
    <div className="page-container" style={{ background: c.void }}>
      <div className="page-header">
        <div className="page-title">Crypto</div>
        <div className="page-subtitle">{CRYPTOS.length} cryptocurrencies tracked</div>
      </div>
      <div style={{ padding: 14 }}>
        {/* Search */}
        <input
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search crypto..."
          style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: `1px solid ${c.rim}`, background: c.surface, color: c.t1, fontSize: 12, outline: 'none', marginBottom: 10 }}
        />
        {/* Group filters */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
          {(['All','Top','L1','L2','DeFi','Meme','AI','Stable'] as const).map((g) => (
            <button key={g} onClick={() => setGroup(g)} style={{ padding: '3px 8px', borderRadius: 6, border: `1px solid ${group === g ? c.blue : c.rim}`, background: group === g ? c.blue : c.card, color: group === g ? '#fff' : c.t3, fontSize: 9, fontWeight: 600, cursor: 'pointer' }}>
              {g}
            </button>
          ))}
        </div>
        {/* Sort */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
          {([['default','Default'],['change','Top Gainers'],['change_asc','Top Losers'],['mcap','Market Cap'],['price','Price']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSort(key as SortKey)} style={{ padding: '3px 8px', borderRadius: 6, border: `1px solid ${sort === key ? c.gain : c.rim}`, background: sort === key ? c.gainDim : c.card, color: sort === key ? c.gain : c.t3, fontSize: 9, fontWeight: 600, cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
        {/* List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {filtered.map((ct) => {
            const d = data[ct.sym]
            const chg = d?.regularMarketChangePercent ?? 0
            const dir = chgDir(chg)
            const col = dir === 'up' ? c.gain : dir === 'dn' ? c.loss : c.t2
            const isExpanded = expandedSym === ct.sym
            return (
              <div key={ct.sym}>
                <div
                  onClick={() => setExpandedSym(isExpanded ? null : ct.sym)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, border: `1px solid ${c.rim}`, background: isExpanded ? c.surface : c.card, cursor: 'pointer' }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: ct.color || c.blueDim, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {ct.label.slice(0, 3)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: c.t1 }}>{ct.label}</div>
                    <div style={{ fontSize: 9, color: c.t4 }}>{ct.name}</div>
                  </div>
                  <SparklineChart symbol={ct.sym} range="7d" width={64} height={28} color={col} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: c.t1 }}>{d ? `$${fmt(d.regularMarketPrice, 2)}` : '—'}</div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: col }}>{d ? fmtChg(chg) : '—'}</div>
                  </div>
                </div>
                {isExpanded && d && (
                  <div style={{ padding: '10px 12px', borderLeft: `3px solid ${col}`, borderTop: `1px solid ${c.rim}`, borderBottom: `1px solid ${c.rim}`, background: c.surface, marginTop: -5, marginBottom: 4, borderRadius: '0 0 8px 8px' }}>
                    <SparklineChart symbol={ct.sym} range="7d" width={300} height={60} showLabels />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8, fontSize: 10 }}>
                      {d.regularMarketDayHigh != null && <div><div style={{ color: c.t4, fontSize: 8, fontWeight: 700 }}>DAY HIGH</div><div style={{ color: c.gain, fontWeight: 700 }}>{fmt(d.regularMarketDayHigh, 2)}</div></div>}
                      {d.regularMarketDayLow != null && <div><div style={{ color: c.t4, fontSize: 8, fontWeight: 700 }}>DAY LOW</div><div style={{ color: c.loss, fontWeight: 700 }}>{fmt(d.regularMarketDayLow, 2)}</div></div>}
                      <div><div style={{ color: c.t4, fontSize: 8, fontWeight: 700 }}>VOLUME</div><div style={{ color: c.t2, fontWeight: 700 }}>{d.regularMarketVolume?.toLocaleString()}</div></div>
                      {d.fiftyTwoWeekHigh != null && <div><div style={{ color: c.t4, fontSize: 8, fontWeight: 700 }}>52W HIGH</div><div style={{ color: c.t2 }}>{fmt(d.fiftyTwoWeekHigh, 2)}</div></div>}
                      {d.fiftyTwoWeekLow != null && <div><div style={{ color: c.t4, fontSize: 8, fontWeight: 700 }}>52W LOW</div><div style={{ color: c.t2 }}>{fmt(d.fiftyTwoWeekLow, 2)}</div></div>}
                      <div><div style={{ color: c.t4, fontSize: 8, fontWeight: 700 }}>MKT CAP</div><div style={{ color: c.t2, fontWeight: 700 }}>{fmtMcap(d.marketCap)}</div></div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
