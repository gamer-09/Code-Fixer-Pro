import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import TabBar from './components/TabBar'

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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#4A5568' }}>
      <div className="spinner" />
    </div>
  )
}

export default function App() {
  return (
    <div className="app-shell">
      <main className="app-content">
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Markets />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/crypto" element={<Crypto />} />
            <Route path="/fx" element={<CurrencyPairs />} />
            <Route path="/news" element={<News />} />
            <Route path="/advisor" element={<Advisor />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/help" element={<Help />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </main>
      <TabBar />
    </div>
  )
}
