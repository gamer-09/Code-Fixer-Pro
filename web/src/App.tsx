import React, { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import AppShell from './components/AppShell'
import ThemeSync from './components/ThemeSync'
import Advisor from './pages/Advisor'

const Markets = lazy(() => import('./pages/Markets'))
const Crypto = lazy(() => import('./pages/Crypto'))
const CurrencyPairs = lazy(() => import('./pages/CurrencyPairs'))
const News = lazy(() => import('./pages/News'))
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

function AppRoutes() {
  const loc = useLocation()
  if (loc.pathname.length > 1 && loc.pathname.endsWith('/')) {
    return <Navigate to={`${loc.pathname.replace(/\/+$/, '')}${loc.search}`} replace />
  }
  const path = loc.pathname.replace(/\/+$/, '') || '/'
  const onAdvisor = path === '/advisor'

  return (
    <>
      <div style={{ display: onAdvisor ? 'none' : 'block', height: onAdvisor ? 0 : '100%', overflow: onAdvisor ? 'hidden' : undefined }}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/markets" replace />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/crypto" element={<Crypto />} />
            <Route path="/fx" element={<CurrencyPairs />} />
            <Route path="/currency-pairs" element={<Navigate to="/fx" replace />} />
            <Route path="/pairs" element={<Navigate to="/fx" replace />} />
            <Route path="/news" element={<News />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/favorites" element={<Navigate to="/watchlist" replace />} />
            <Route path="/favourites" element={<Navigate to="/watchlist" replace />} />
            <Route path="/help" element={<Help />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/ai" element={<Navigate to="/advisor" replace />} />
            <Route path="/floai" element={<Navigate to="/advisor" replace />} />
            <Route path="/chat" element={<Navigate to="/advisor" replace />} />
            <Route path="/advisor" element={null} />
            <Route path="*" element={<Navigate to="/markets" replace />} />
          </Routes>
        </Suspense>
      </div>
      <div
        className="chat-keep"
        style={{
          display: onAdvisor ? 'flex' : 'none',
          height: '100%',
          flexDirection: 'column',
          minHeight: 0,
        }}
      >
        <Advisor />
      </div>
    </>
  )
}

export default function App() {
  return (
    <>
      <ThemeSync />
      <AppShell>
        <AppRoutes />
      </AppShell>
    </>
  )
}
