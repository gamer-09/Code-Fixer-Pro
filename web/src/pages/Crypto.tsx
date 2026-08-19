import React, { useMemo, useState } from 'react'
import SparklineChart from '../components/SparklineChart'
import { SearchBox, Segmented } from '../components/ui'
import { CRYPTOS } from '../constants/marketData'
import { chgDir, fmt, fmtChg, fmtMcap, useMarket } from '../context/MarketContext'

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
  const { data } = useMarket()
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
    <div className="page">
      <div className="toolbar">
        <SearchBox value={search} onChange={setSearch} placeholder="Search coins, tickers, names…" />
        <Segmented
          value={group}
          onChange={(v) => setGroup(v as Group)}
          options={(['All','Top','L1','L2','DeFi','Meme','AI','Stable'] as const).map((g) => ({ label: g, value: g }))}
        />
        <Segmented
          tone="gain"
          value={sort}
          onChange={(v) => setSort(v as SortKey)}
          options={[
            { label: 'Default', value: 'default' },
            { label: 'Gainers', value: 'change' },
            { label: 'Losers', value: 'change_asc' },
            { label: 'Mkt Cap', value: 'mcap' },
            { label: 'Price', value: 'price' },
          ]}
        />
      </div>

      <div className="asset-list">
        {filtered.map((ct) => {
          const d = data[ct.sym]
          const chg = d?.regularMarketChangePercent ?? 0
          const dir = chgDir(chg)
          const col = dir === 'up' ? 'var(--gain)' : dir === 'dn' ? 'var(--loss)' : 'var(--t2)'
          const isExpanded = expandedSym === ct.sym
          return (
            <div key={ct.sym}>
              <div className="asset" onClick={() => setExpandedSym(isExpanded ? null : ct.sym)}>
                <div className="avatar" style={{ background: ct.color || 'var(--blue)' }}>{ct.label.slice(0, 3)}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="sym">{ct.label}</div>
                  <div className="muted">{ct.name}</div>
                </div>
                <div className="spark">
                  <SparklineChart symbol={ct.sym} range="7d" width={80} height={32} color={col} />
                </div>
                <div className="right">
                  <div className="mono" style={{ fontWeight: 700 }}>{d ? `$${fmt(d.regularMarketPrice, 2)}` : '—'}</div>
                  <div className="mono" style={{ fontSize: 12, fontWeight: 600, color: col, marginTop: 2 }}>{d ? fmtChg(chg) : '—'}</div>
                </div>
                <span style={{ color: 'var(--t4)', fontSize: 11 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>
              {isExpanded && d && (
                <div className="expand" style={{ borderLeftColor: col }}>
                  <SparklineChart symbol={ct.sym} range="7d" width={420} height={72} showLabels color={col} />
                  <div className="stat-grid">
                    {d.regularMarketDayHigh != null && <div><div className="stat-lab">Day high</div><div className="stat-val" style={{ color: 'var(--gain)' }}>{fmt(d.regularMarketDayHigh, 2)}</div></div>}
                    {d.regularMarketDayLow != null && <div><div className="stat-lab">Day low</div><div className="stat-val" style={{ color: 'var(--loss)' }}>{fmt(d.regularMarketDayLow, 2)}</div></div>}
                    <div><div className="stat-lab">Volume</div><div className="stat-val">{d.regularMarketVolume?.toLocaleString()}</div></div>
                    {d.fiftyTwoWeekHigh != null && <div><div className="stat-lab">52w high</div><div className="stat-val">{fmt(d.fiftyTwoWeekHigh, 2)}</div></div>}
                    {d.fiftyTwoWeekLow != null && <div><div className="stat-lab">52w low</div><div className="stat-val">{fmt(d.fiftyTwoWeekLow, 2)}</div></div>}
                    <div><div className="stat-lab">Mkt cap</div><div className="stat-val">{fmtMcap(d.marketCap)}</div></div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
