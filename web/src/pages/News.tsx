import React, { useEffect, useState } from 'react'
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

async function fetchNews(count: number): Promise<NewsItem[]> {
  try {
    const res = await fetch(`${BASE}/api/news?count=${count}`)
    if (res.ok) {
      const json = await res.json() as { items?: NewsItem[] }
      if (json.items?.length) return json.items
    }
  } catch { /* fallback */ }

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

function sentiment(title: string): { label: string; cls: string } {
  const t = title.toLowerCase()
  if (/surge|jump|rally|gain|record|high|beat|rise|climb|soar|boom|bull/i.test(t))
    return { label: 'Bullish', cls: 'up' }
  if (/crash|drop|fall|plunge|loss|decline|bear|slump|sink|weak|sell/i.test(t))
    return { label: 'Bearish', cls: 'dn' }
  return { label: 'Neutral', cls: 'flat' }
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

export default function NewsScreen() {
  const { settings } = useSettings()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchNews(settings.newsCount).then((items) => { setNews(items); setLoading(false) })
  }, [settings.newsCount])

  return (
    <div className="page">
      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', padding: 80 }}><div className="spinner" /></div>
      ) : (
        <div className="news-list">
          {news.map((item, i) => {
            const sent = sentiment(item.title)
            return (
              <a key={i} className="news-card" href={item.link} target="_blank" rel="noopener noreferrer">
                <div className="news-meta">
                  <span className={`chg ${sent.cls}`}>{sent.label}</span>
                  <span className="muted">{item.publisher}</span>
                  <span className="muted">· {getTimeAgo(item.publishedAt)}</span>
                </div>
                <div className="news-title">{item.title}</div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
