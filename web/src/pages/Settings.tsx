import React from 'react'
import { useColors } from '../hooks/useColors'
import { useSettings, type RefreshInterval, type NewsCount, type RiskProfile, type WatchlistSort, type PriceDecimals, type AppTheme } from '../context/SettingsContext'

function SettingRow({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  const c = useColors()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: `1px solid ${c.rim}` }}>
      <div style={{ flex: 1, marginRight: 12 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: c.t1 }}>{label}</div>
        {desc && <div style={{ fontSize: 10, color: c.t4, marginTop: 2 }}>{desc}</div>}
      </div>
      {children}
    </div>
  )
}

function OptionGroup({ options, value, onChange }: { options: { label: string; value: string | number }[]; value: string | number; onChange: (v: any) => void }) {
  const c = useColors()
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {options.map((opt) => (
        <button key={String(opt.value)} onClick={() => onChange(opt.value)} style={{ padding: '4px 10px', borderRadius: 6, border: `1px solid ${value === opt.value ? c.gain : c.rim}`, background: value === opt.value ? c.gainDim : c.card, color: value === opt.value ? c.gain : c.t3, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const c = useColors()
  return (
    <div onClick={() => onChange(!checked)} style={{ width: 40, height: 22, borderRadius: 11, background: checked ? c.gain : c.rim, cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: checked ? 20 : 2, transition: 'left 0.2s' }} />
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  const c = useColors()
  return <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: c.t4, marginTop: 16, marginBottom: 4 }}>{title}</div>
}

export default function SettingsScreen() {
  const c = useColors()
  const { settings, updateSetting, triggerClearChat, triggerClearWatchlist, triggerClearPortfolio, resetAllSettings } = useSettings()

  return (
    <div className="page-container" style={{ background: c.void }}>
      <div className="page-header">
        <div className="page-title">Settings</div>
        <div className="page-subtitle">Configure your FloBoard experience</div>
      </div>
      <div style={{ padding: 16 }}>
        {/* Display */}
        <SectionTitle title="Display" />
        <SettingRow label="App Theme" desc="Choose your visual style">
          <OptionGroup options={[{ label: 'Dark', value: 'dark' as AppTheme }, { label: 'Light', value: 'light' as AppTheme }, { label: 'OLED', value: 'oled' as AppTheme }]} value={settings.theme} onChange={(v) => updateSetting('theme', v)} />
        </SettingRow>
        <SettingRow label="Price Decimals" desc="Decimal places for prices">              <OptionGroup options={[{ label: '2', value: 2 }, { label: '4', value: 4 }]} value={settings.priceDecimals} onChange={(v) => updateSetting('priceDecimals', v as PriceDecimals)} />
        </SettingRow>
        <SettingRow label="Compact Numbers" desc="Shorten large numbers (e.g. $1.2T)">
          <Toggle checked={settings.compactNumbers} onChange={(v) => updateSetting('compactNumbers', v)} />
        </SettingRow>

        {/* Data */}
        <SectionTitle title="Data" />
        <SettingRow label="Refresh Interval" desc="How often market data updates">              <OptionGroup options={[{ label: '30s', value: 30 }, { label: '60s', value: 60 }, { label: '90s', value: 90 }, { label: '5m', value: 300 }]} value={settings.refreshInterval} onChange={(v) => updateSetting('refreshInterval', v as RefreshInterval)} />
        </SettingRow>
        <SettingRow label="News Headlines" desc="Number of headlines to load">              <OptionGroup options={[{ label: '10', value: 10 }, { label: '15', value: 15 }, { label: '20', value: 20 }]} value={settings.newsCount} onChange={(v) => updateSetting('newsCount', v as NewsCount)} />
        </SettingRow>

        {/* FloAI */}
        <SectionTitle title="FloAI Advisor" />
        <SettingRow label="Risk Profile" desc="How FloAI frames its analysis">
          <OptionGroup options={[{ label: '🛡 Conservative', value: 'conservative' as RiskProfile }, { label: '⚖️ Moderate', value: 'moderate' as RiskProfile }, { label: '🚀 Aggressive', value: 'aggressive' as RiskProfile }]} value={settings.riskProfile} onChange={(v) => updateSetting('riskProfile', v)} />
        </SettingRow>
        <SettingRow label="Gemini API Key" desc={settings.geminiApiKey ? '••••••••' + settings.geminiApiKey.slice(-4) : 'Not set — using offline fallback'}>
          <input
            value={settings.geminiApiKey}
            onChange={(e) => updateSetting('geminiApiKey', e.target.value)}
            placeholder="AIza..."
            style={{ width: 200, padding: '6px 10px', borderRadius: 6, border: `1px solid ${c.rim}`, background: c.surface, color: c.t1, fontSize: 11, outline: 'none' }}
          />
        </SettingRow>

        {/* Watchlist */}
        <SectionTitle title="Watchlist" />
        <SettingRow label="Sort Order" desc="How watchlist items are sorted">
          <OptionGroup options={[{ label: '% Chg', value: 'change' as WatchlistSort }, { label: 'A-Z', value: 'alpha' as WatchlistSort }, { label: 'Recent', value: 'added' as WatchlistSort }]} value={settings.watchlistSort} onChange={(v) => updateSetting('watchlistSort', v)} />
        </SettingRow>

        {/* Data & Privacy */}
        <SectionTitle title="Data & Privacy" />
        <SettingRow label="Clear AI Chat History" desc="Remove all FloAI messages">
          <button onClick={triggerClearChat} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${c.loss}`, background: 'transparent', color: c.loss, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>Clear</button>
        </SettingRow>
        <SettingRow label="Clear Watchlist" desc="Remove all tracked symbols">
          <button onClick={triggerClearWatchlist} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${c.loss}`, background: 'transparent', color: c.loss, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>Clear</button>
        </SettingRow>
        <SettingRow label="Delete Portfolio" desc="Remove all holdings">
          <button onClick={triggerClearPortfolio} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${c.loss}`, background: 'transparent', color: c.loss, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
        </SettingRow>

        <SectionTitle title="Advanced" />
        <SettingRow label="Reset All Settings" desc="Restore factory defaults">
          <button onClick={resetAllSettings} style={{ padding: '6px 14px', borderRadius: 6, border: `1px solid ${c.loss}`, background: c.lossDim, color: c.loss, fontSize: 10, fontWeight: 600, cursor: 'pointer' }}>Reset</button>
        </SettingRow>

        <div style={{ textAlign: 'center', fontSize: 10, color: c.t4, marginTop: 20 }}>FloBoard v1.0 · Settings stored locally in your browser</div>
      </div>
    </div>
  )
}
