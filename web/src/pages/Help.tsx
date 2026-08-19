import React, { useState } from 'react'
import { useColors } from '../hooks/useColors'

interface HelpSection {
  id: string; title: string; accentKey: 'gain' | 'blue' | 'amber' | 'loss'
  items: { q: string; a: string }[]
}

const SECTIONS: HelpSection[] = [
  {
    id: 'gemini', title: 'Getting Your Gemini API Key', accentKey: 'amber',
    items: [
      { q: 'What is the Gemini API Key?', a: 'FloAI is powered by Google Gemini 2.5 Flash. You need a personal API key to use it — like a password for the AI.' },
      { q: 'How do I get a free key?', a: '1. Visit aistudio.google.com/apikey\n2. Sign in with your Google account\n3. Click "Create API Key"\n4. Copy the key (starts with "AIza…")\n5. Open FloBoard → Settings → Gemini API Key and paste it in' },
      { q: 'Is my key safe?', a: 'Your key is stored only in your browser\'s local storage. It never leaves your device.' },
      { q: 'What happens without a key?', a: 'All market data tabs work perfectly without a key. Only the FloAI Advisor chat requires one.' },
    ],
  },
  {
    id: 'markets', title: 'Markets Tab', accentKey: 'gain',
    items: [
      { q: 'What does the Markets tab show?', a: 'Live prices for global indices, commodities, US Treasury yields, sector ETFs, top stocks, and forex — all from Yahoo Finance.' },
      { q: 'How current is the data?', a: 'Prices refresh automatically every 90 seconds (configurable in Settings).' },
      { q: 'What do the colors mean?', a: 'Green = up on the day. Red = down. Amber = flat or near-unchanged.' },
    ],
  },
  {
    id: 'crypto', title: 'Crypto Tab', accentKey: 'amber',
    items: [
      { q: 'What cryptocurrencies are tracked?', a: 'Bitcoin, Ethereum, Solana, BNB, XRP, Cardano, Dogecoin, and 80+ more — all with live USD prices.' },
      { q: 'Are crypto prices 24/7?', a: 'Yes — crypto markets never close, so prices update around the clock.' },
    ],
  },
  {
    id: 'advisor', title: 'FloAI Advisor Tab', accentKey: 'gain',
    items: [
      { q: 'What can FloAI do?', a: 'FloAI answers questions about stocks, crypto, indices, forex, earnings, and investing — with real market data.' },
      { q: 'What is the Risk Profile?', a: 'Conservative, Moderate, or Aggressive. FloAI tailors its responses accordingly.' },
      { q: 'Is this financial advice?', a: 'No — FloAI provides educational information only. Always do your own research.' },
    ],
  },
  {
    id: 'portfolio', title: 'Portfolio Tab', accentKey: 'gain',
    items: [
      { q: 'Does this require bank login?', a: 'No! It\'s 100% simulated. You record shares and cost basis manually.' },
      { q: 'Is my data private?', a: 'Yes — all data is stored in your browser\'s local storage and never leaves your device.' },
    ],
  },
  {
    id: 'settings', title: 'Settings Reference', accentKey: 'blue',
    items: [
      { q: 'Refresh Interval', a: 'How often data refreshes: 30s, 60s, 90s (default), or 5 min.' },
      { q: 'Theme', a: 'Switch between Dark (Slate), Light, and OLED (Pure Black).' },
      { q: 'Reset All Settings', a: 'Restores all preferences to defaults. Watchlist and portfolio are not affected.' },
    ],
  },
]

function QAItem({ q, a }: { q: string; a: string }) {
  const c = useColors()
  const [open, setOpen] = useState(false)
  return (
    <div onClick={() => setOpen(!open)} style={{ padding: 12, borderRadius: 8, border: `1px solid ${c.rim}`, background: open ? c.surface : 'transparent', cursor: 'pointer', marginBottom: 4 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: c.t2, flex: 1, lineHeight: 1.5 }}>{q}</span>
        <span style={{ fontSize: 9, color: c.t4, marginTop: 4 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && <div style={{ fontSize: 12, lineHeight: 1.6, marginTop: 8, color: c.t3 }}>{a}</div>}
    </div>
  )
}

export default function HelpScreen() {
  const c = useColors()
  const [expanded, setExpanded] = useState<string | null>(null)
  return (
    <div className="page-container" style={{ background: c.void }}>
      <div className="page-header">
        <div className="page-title">Help</div>
        <div className="page-subtitle">How to use FloBoard</div>
      </div>
      <div style={{ padding: 16 }}>
        {/* Quick start */}
        <div style={{ borderRadius: 12, border: `1px solid rgba(0,229,160,0.2)`, background: c.gainDim, padding: 16, marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: c.gain, marginBottom: 8 }}>Quick Start</div>
          <div style={{ fontSize: 13, lineHeight: 1.6, color: c.t2 }}>
            FloBoard gives you live market data for stocks, crypto, forex, and news — all free, no account needed.<br /><br />
            To unlock the <strong style={{ color: c.t1 }}>FloAI Advisor</strong> chat, add a free Gemini API key in{' '}
            <strong style={{ color: c.t1 }}>Settings → Gemini API Key</strong>.
          </div>
        </div>

        {SECTIONS.map((s) => {
          const accent = c[s.accentKey]
          const isExpanded = expanded === s.id
          return (
            <div key={s.id} style={{ borderRadius: 12, border: `1px solid ${c.rim}`, background: c.card, marginBottom: 8, overflow: 'hidden' }}>
              <div onClick={() => setExpanded(isExpanded ? null : s.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, cursor: 'pointer' }}>
                <div style={{ width: 36, height: 36, borderRadius: 9, border: `1px solid ${accent}30`, background: `${accent}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, fontSize: 16 }}>
                  {s.id === 'gemini' ? '🔑' : s.id === 'markets' ? '📊' : s.id === 'crypto' ? '₿' : s.id === 'advisor' ? '🧠' : s.id === 'portfolio' ? '💼' : '⚙️'}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: c.t1, flex: 1 }}>{s.title}</span>
                <span style={{ fontSize: 10, color: c.t4 }}>{isExpanded ? '▲' : '▼'}</span>
              </div>
              {isExpanded && (
                <div style={{ padding: '0 14px 10px' }}>
                  {s.items.map((item, i) => <QAItem key={i} q={item.q} a={item.a} />)}
                </div>
              )}
            </div>
          )
        })}

        <div style={{ borderTop: `1px solid ${c.rim}`, paddingTop: 16, marginTop: 8, textAlign: 'center' }}>
          <span style={{ fontSize: 11, lineHeight: 1.7, color: c.t4 }}>
            FloBoard v1.0 · Market data from Yahoo Finance · AI by Google Gemini<br />
            For informational use only — not financial advice.
          </span>
        </div>
      </div>
    </div>
  )
}
