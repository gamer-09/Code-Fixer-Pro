import React, { useState, useRef, useEffect } from 'react'
import { useColors } from '../hooks/useColors'
import { useSettings } from '../context/SettingsContext'
import { useMarket } from '../context/MarketContext'

interface Message { role: 'user' | 'assistant'; content: string }

function generateFallbackAiResponse(query: string, risk: string): string {
  const r = (risk || 'moderate').toLowerCase()
  const dateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const q = query.trim().toLowerCase()

  if (/^(hi|hello|hey|yo|help|thanks|thank you|what is floboard|who are you)[.!?]*$/i.test(q)) {
    return `Hello! I'm **FloAI**, your AI financial advisor built into FloBoard.\n\nWe can chat about financial topics, or ask me to analyze any stock, crypto, or forex pair. I'll adjust to your **${r.toUpperCase()}** risk profile.`
  }

  if (/gold|gc=f|silver|si=f|xau|xag|metal/i.test(q)) {
    return `### FloAI [${r.toUpperCase()} MODE] Analysis (${dateStr})\n\n**Gold / Precious Metals**\n\nAs a ${r} investor, Gold (${r === 'aggressive' ? 'focus on momentum breakouts' : r === 'conservative' ? 'focus on capital preservation with 5-10% allocation' : 'balanced 5-8% portfolio allocation as a hedge'}). Monitor DXY resistance and Treasury yield shifts for direction.`
  }

  if (/btc|bitcoin|eth|ethereum|sol|solana|crypto/i.test(q)) {
    return `### FloAI [${r.toUpperCase()} MODE] Analysis (${dateStr})\n\n**Bitcoin / Crypto**\n\n${r === 'aggressive' ? 'Allocate 15-20% to core Layer-1 assets (BTC, ETH, SOL). Target breakout entries.' : r === 'conservative' ? 'Keep crypto exposure under 3% — BTC only. Prioritize Treasury yields.' : 'Maintain 5-10% allocation via DCA on pullbacks. Quarterly rebalancing.'}`
  }

  if (/aapl|nvda|msft|tsla|stock|share|equity/i.test(q)) {
    return `### FloAI [${r.toUpperCase()} MODE] Analysis (${dateStr})\n\n**Stock / Equity Analysis**\n\n${r === 'aggressive' ? 'Overweight AI/semiconductor leaders (NVDA, AVGO, AMD). Enter on volume breakouts.' : r === 'conservative' ? 'Prioritize dividend aristocrats (JNJ, PG, COST) with beta < 0.85. Fixed income cushion 50-60%.' : 'Core index allocation 50-60% via SPY/QQQ. Supplement with quality mega-caps.'}`
  }

  if (/eurusd|usdjpy|forex|fx|currency|dollar|dxy/i.test(q)) {
    return `### FloAI [${r.toUpperCase()} MODE] Analysis (${dateStr})\n\n**Forex / Currencies**\n\n${r === 'aggressive' ? 'Trade momentum breakouts around central bank announcements. Ride carry-trade trends.' : r === 'conservative' ? 'Avoid speculative FX. Anchor reserves in T-bills. Use FX only to hedge international equity.' : 'Track G10 majors alongside DXY. Pair domestic equities with international ETFs.'}`
  }

  return `### FloAI [${r.toUpperCase()} MODE] Analysis (${dateStr})\n\n**General Market Outlook**\n\nBased on your ${r} profile:\n${r === 'aggressive' ? '- Focus on high-beta growth and AI infrastructure leaders\n- Accept higher volatility for market-leading returns\n- Monitor breakout patterns and volume surges' : r === 'conservative' ? '- Prioritize capital preservation and dividend compounding\n- 50-60% in sovereign debt\n- Blue-chip defensive sectors (XLP, XLU)' : '- Balanced 60/40 equity-to-bond allocation\n- Core index funds with quality mega-caps\n- Quarterly rebalancing discipline'}`
}

export default function AdvisorScreen() {
  const c = useColors()
  const { settings, updateSetting } = useSettings()
  const { data } = useMarket()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: Message = { role: 'user', content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    // Try Gemini API first
    if (settings.geminiApiKey) {
      try {
        const marketContext = Object.entries(data).slice(0, 20).map(([sym, q]) => `${sym}: $${q.regularMarketPrice} (${q.regularMarketChangePercent >= 0 ? '+' : ''}${q.regularMarketChangePercent.toFixed(2)}%)`).join('\n')
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${settings.geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: `You are FloAI, a financial advisor. Risk mode: ${settings.riskProfile.toUpperCase()}.\n\nCurrent market data:\n${marketContext}\n\nUser: ${text}` }] }],
          }),
        })
        if (res.ok) {
          const json = await res.json()
          const reply = json.candidates?.[0]?.content?.parts?.[0]?.text
          if (reply) {
            setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
            setLoading(false)
            return
          }
        }
      } catch { /* fall through to fallback */ }
    }

    // Fallback
    setTimeout(() => {
      const reply = generateFallbackAiResponse(text, settings.riskProfile)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      setLoading(false)
    }, 500)
  }

  return (
    <div className="page-container" style={{ background: c.void, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div className="page-title">FloAI Advisor</div>
          <div className="page-subtitle">Powered by Gemini · {settings.riskProfile.toUpperCase()} mode</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {(['conservative','moderate','aggressive'] as const).map((r) => (
            <button key={r} onClick={() => updateSetting('riskProfile', r)} style={{ padding: '3px 8px', borderRadius: 6, border: `1px solid ${settings.riskProfile === r ? c.gain : c.rim}`, background: settings.riskProfile === r ? c.gainDim : c.card, color: settings.riskProfile === r ? c.gain : c.t3, fontSize: 9, fontWeight: 600, cursor: 'pointer' }}>
              {r.slice(0, 3).toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: 40, color: c.t4 }}>
            <div style={{ fontSize: 14, marginBottom: 8 }}>💬</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.t2, marginBottom: 4 }}>Ask FloAI anything</div>
            <div style={{ fontSize: 11 }}>Try: "What is the outlook for Gold?" or "Should I buy Bitcoin?"</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
            <div style={{ padding: '10px 14px', borderRadius: 12, background: msg.role === 'user' ? c.blue : c.card, border: `1px solid ${msg.role === 'user' ? 'transparent' : c.rim}`, color: c.t1, fontSize: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {msg.content.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: 12, background: c.card, border: `1px solid ${c.rim}`, color: c.t4, fontSize: 12 }}>
            <div className="spinner" style={{ width: 16, height: 16 }} />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '10px 14px', borderTop: `1px solid ${c.rim}`, background: c.base, display: 'flex', gap: 8 }}>
        <input
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about markets, stocks, crypto..."
          style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: `1px solid ${c.rim}`, background: c.surface, color: c.t1, fontSize: 12, outline: 'none' }}
        />
        <button onClick={sendMessage} disabled={loading || !input.trim()} style={{ padding: '10px 18px', borderRadius: 10, border: 'none', background: c.gain, color: '#080B10', fontWeight: 700, fontSize: 12, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading || !input.trim() ? 0.5 : 1 }}>
          Send
        </button>
      </div>
    </div>
  )
}
