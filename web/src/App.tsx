import React, { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import ThemeSync from './components/ThemeSync'

const Markets = lazy(() => import('./pages/Markets'))
const Crypto = lazy(() => import('./pages/Crypto'))
const CurrencyPairs = lazy(() => import('./pages/CurrencyPairs'))
const News = lazy(() => import('./pages/News'))
const Advisor = lazy(() => import('./pages/Advisor'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Watchlist = lazy(() => import('./pages/Watchlist'))
const Help = lazy(() => import('./pages/Help'))
const Settings = lazy(() => import('./pages/Settings'))

function Loading() {
  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: 'var(--t3)' }}>
      <div className="spinner" />
    </div>
  )
}

export default function App() {
  return (
    <>
      <ThemeSync />
      <AppShell>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/markets" replace />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/crypto" element={<Crypto />} />
            <Route path="/fx" element={<CurrencyPairs />} />
            <Route path="/news" element={<News />} />
            <Route path="/advisor" element={<Advisor />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/help" element={<Help />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/markets" replace />} />
          </Routes>
        </Suspense>
      </AppShell>
    </>
  )
}
