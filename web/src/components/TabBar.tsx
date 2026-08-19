import React from 'react'
import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/markets', label: 'Markets', icon: 'markets' },
  { to: '/crypto', label: 'Crypto', icon: 'crypto' },
  { to: '/fx', label: 'FX Pairs', icon: 'fx' },
  { to: '/news', label: 'News', icon: 'news' },
  { to: '/advisor', label: 'Advisor', icon: 'advisor' },
  { to: '/portfolio', label: 'Portfolio', icon: 'portfolio' },
  { to: '/watchlist', label: 'Watchlist', icon: 'watchlist' },
  { to: '/help', label: 'Help', icon: 'help' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

function TabIcon({ icon, color }: { icon: string; color: string }) {
  const s = { width: 21, height: 21, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (icon) {
    case 'markets': return <svg {...s}><rect x="3" y="10" width="4" height="11" rx="1" fill={color}/><rect x="10" y="4" width="4" height="17" rx="1" fill={color}/><rect x="17" y="7" width="4" height="14" rx="1" fill={color}/></svg>
    case 'crypto': return <svg {...s}><circle cx="12" cy="12" r="10"/><path d="M9 8h5a2 2 0 0 1 0 4H9M9 12h5.5a2 2 0 0 1 0 4H9"/><line x1="11" y1="6" x2="11" y2="8"/><line x1="13" y1="6" x2="13" y2="8"/><line x1="11" y1="16" x2="11" y2="18"/><line x1="13" y1="16" x2="13" y2="18"/></svg>
    case 'fx': return <svg {...s}><circle cx="8" cy="12" r="5"/><circle cx="16" cy="12" r="5"/><line x1="11" y1="12" x2="13" y2="12"/></svg>
    case 'news': return <svg {...s}><path d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><line x1="7" y1="9" x2="17" y2="9"/><line x1="7" y1="13" x2="17" y2="13"/><line x1="7" y1="17" x2="12" y2="17"/></svg>
    case 'advisor': return <svg {...s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    case 'portfolio': return <svg {...s}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
    case 'watchlist': return <svg {...s}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
    case 'help': return <svg {...s}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    case 'settings': return <svg {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    default: return null
  }
}

export default function TabBar() {
  return (
    <nav className="tab-bar">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          className={({ isActive }) => `tab-item ${isActive ? 'active' : ''}`}
        >
          <TabIcon icon={tab.icon} color="currentColor" />
          <span className="tab-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
