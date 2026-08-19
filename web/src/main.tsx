import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import { SettingsProvider } from './context/SettingsContext'
import { MarketProvider } from './context/MarketContext'
import './index.css'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SettingsProvider>
          <MarketProvider>
            <App />
          </MarketProvider>
        </SettingsProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
)
