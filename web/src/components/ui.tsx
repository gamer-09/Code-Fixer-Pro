import React from 'react'
import { chgDir, fmtChg } from '../context/MarketContext'

export function Section({
  label,
  count,
  right,
  children,
}: {
  label: string
  count?: number
  right?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="section">
      <div className="section-head">
        <h2 className="section-label">{label}</h2>
        {count != null && <span className="count-pill">{count}</span>}
        <div className="section-line" />
        {right}
      </div>
      {children}
    </section>
  )
}

export function ChangeBadge({ value }: { value: number | null | undefined }) {
  const dir = chgDir(value)
  return <span className={`chg ${dir}`}>{fmtChg(value)}</span>
}

export function EmptyState({
  icon,
  title,
  hint,
  action,
}: {
  icon: React.ReactNode
  title: string
  hint: string
  action?: React.ReactNode
}) {
  return (
    <div className="empty">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-hint">{hint}</div>
      {action}
    </div>
  )
}

export function Segmented({
  options,
  value,
  onChange,
  tone = 'blue',
}: {
  options: { label: string; value: string }[]
  value: string
  onChange: (v: string) => void
  tone?: 'blue' | 'gain'
}) {
  return (
    <div className="seg">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`seg-btn ${tone} ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="search">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="7" />
        <path d="M20 20l-3-3" />
      </svg>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
    </div>
  )
}

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`toggle ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="toggle-knob" />
    </button>
  )
}

export function OptionGroup({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string | number }[]
  value: string | number
  onChange: (v: string | number) => void
}) {
  return (
    <div className="seg">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          className={`seg-btn gain ${value === opt.value ? 'active' : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
