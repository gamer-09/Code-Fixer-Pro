# FloBoard

A live world finance mobile app (Expo/React Native) with live market data, AI advisor, portfolio tracker, and news feed.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, proxied at /api)
- `pnpm --filter @workspace/floboard run dev` — run the Expo dev server (port 20736)
- Required env: `ANTHROPIC_API_KEY` — for FloAI chat feature

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54 / React Native 0.81.5, expo-router, @tanstack/react-query
- API: Express 5, `yahoo-finance2` (v3 — must `new YahooFinance()` to instantiate), `@anthropic-ai/sdk`
- Storage: AsyncStorage for portfolio persistence

## Where things live

- `artifacts/floboard/` — Expo mobile app
  - `app/(tabs)/` — 5 tab screens: index (Markets), crypto, news, advisor, portfolio
  - `context/MarketContext.tsx` — global market data, polling every 90s
  - `constants/marketData.ts` — all symbols (INDICES, STOCKS, CRYPTOS, COMMODITIES, FOREX)
  - `constants/colors.ts` — FloBoard dark theme tokens (uses `light` key as the dark theme)
  - `hooks/useColors.ts` — returns `colors.light` spread (the dark palette)
- `artifacts/api-server/` — Express 5 backend
  - `src/routes/market.ts` — Yahoo Finance proxy via `yahoo-finance2`
  - `src/routes/chat.ts` — Anthropic SSE streaming endpoint

## Architecture decisions

- Market data fetched server-side via `yahoo-finance2` to avoid CORS. Polls every 90s from mobile.
- AI chat streams via SSE (`/api/chat`) — mobile reads `response.body.getReader()`.
- Colors: `colors.ts` exports `{ light: {...}, radius }` but the "light" key IS the dark FloBoard palette.
- `yahoo-finance2` v3 default export is the **class** (not an instance). Must do `new YahooFinance()`.

## Product

- **Markets** tab: Global Indices (2-col grid), Forex chips, Commodities cards, Stocks table
- **Crypto** tab: 6 crypto cards (BTC, ETH, BNB, SOL, XRP, DOGE) with live prices
- **News** tab: 10 financial headlines, tap any to ask AI for analysis
- **Advisor** tab: FloAI — Anthropic Claude with live market context, SSE streaming chat
- **Portfolio** tab: Add holdings (symbol + qty + avg cost), tracks live P&L, persisted to AsyncStorage

## Gotchas

- `yahoo-finance2@3.15.3`: default export is the YahooFinance CLASS — call `new YahooFinance()` to get instance
- Colors `hooks/useColors.ts`: always uses `colors.light` (which is actually the dark FloBoard theme)
- Expo workflow ENOENT error on `jose_tmp_*` is transient — just restart the Expo workflow
- On web preview, `useNativeDriver` warnings are harmless — RCTAnimation is a native-only module

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See the `expo` skill for Expo-specific conventions
