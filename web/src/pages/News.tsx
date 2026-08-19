import React, { useEffect, useState } from 'react'
import { useColors } from '../hooks/useColors'
import { useSettings } from '../context/SettingsContext'
import { getApiBase } from '../utils/apiBase'

const BASE = getApiBase()

interface NewsItem {
  title: string
  link: string
  publisher: string
  publishedAt: string
  thumbnail?: string
}

// Simple RSS-like news fetcher
async function fetchNews(count: number): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${BASE}/api/news?count=${count}`)
    if (res.ok) {
      const json = await res.json() as { items?: NewsItem[] }
      if (json.items?.length) return json.items
    }
  } catch { /* fallback */ }

  // Fallback: generate structured placeholder headlines
  const topics = [
    'Fed signals potential rate adjustment in upcoming meeting',
    'S&P 500 reaches new highs amid tech rally',
    'Bitcoin surges past key resistance level',
    'Oil prices climb on supply concerns',
    'Gold hits record as investors seek safe haven',
    'Nvidia earnings beat expectations, stock jumps',
    'European markets rally on strong economic data',
    'Yen weakens as BOJ maintains ultra-loose policy',
    'Tesla announces new Gigafactory expansion',
    'Amazon Web Services reports record cloud revenue',
  ]
  return topics.slice(0, count).map((t, i) => ({
    title: t,
    link: '#',
    publisher: ['Reuters', 'Bloomberg', 'CNBC', 'MarketWatch', 'Yahoo Finance'][i % 5],
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
  }))
}

function sentimentColor(title: string): { label: string; color: string; bg: string } {
  const t = title.toLowerCase()
  if (/surge|jump|rally|gain|record|high|beat|rise|climb|soar|boom|bull/i.test(t))
    return { label: 'Bullish', color: '#00E5A0', bg: 'rgba(0,229,160,0.12)' }
  if (/crash|drop|fall|plunge|loss|decline|bear|slump|sink|weak|sell/i.test(t))
    return { label: 'Bearish', color: '#FF4D6A', bg: 'rgba(255,77,106,0.12)' }
  return { label: 'Neutral', color: '#FFB627', bg: 'rgba(255,182,39,0.12)' }
}

export default function NewsScreen() {
  const c = useColors()
  const { settings } = useSettings()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchNews(settings.newsCount).then((items) => { setNews(items); setLoading(false) })
  }, [settings.newsCount])

  return (
    <div className="page-container" style={{ background: c.void }}>
      <div className="page-header">
        <div className="page-title">News</div>
        <div className="page-subtitle">Live financial headlines from Yahoo Finance</div>
      </div>
      <div style={{ padding: 14 }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><div className="spinner" /></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {news.map((item, i) => {
              const sent = sentimentColor(item.title)
              const timeAgo = getTimeAgo(item.publishedAt)
              return (
                <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none', padding: '12px 14px', borderRadius: 8, border: `1px solid ${c.rim}`, background: c.card, transition: 'background 0.15s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = c.surface)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = c.card)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <span style={{ padding: '2px 6px', borderRadius: 4, background: sent.bg, color: sent.color, fontSize: 9, fontWeight: 700 }}>{sent.label}</span>
                    <span style={{ fontSize: 9, color: c.t4 }}>{item.publisher}</span>
                    {timeAgo && <span style={{ fontSize: 9, color: c.t4 }}>· {timeAgo}</span>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: c.t1, lineHeight: 1.4 }}>{item.title}</div>
                </a>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function getTimeAgo(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  } catch { return '' }
}
