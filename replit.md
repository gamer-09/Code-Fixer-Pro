# FloBoard

A financial market tracking mobile app (Expo/React Native) with a live-data Express backend.

## Run & Operate

- `pnpm --filter @workspace/floboard run dev` — run the Expo dev server (port 20736)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo 54 / React Native 0.81.5, Expo Router
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Market Data: Yahoo Finance (yahoo-finance2)
- AI Chat: Google Gemini 2.5 Flash (user-supplied key stored in-app)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/floboard/` — Expo mobile app
  - `app/(tabs)/` — tab screens (markets, crypto, currency, news, advisor, portfolio, watchlist, settings, help)
  - `context/MarketContext.tsx` — live market data polling + YF fallback
  - `context/SettingsContext.tsx` — user settings (AsyncStorage)
  - `constants/marketData.ts` — symbol lists for indices, stocks, crypto, forex, etc.
  - `utils/apiBase.ts` — resolves API base URL from env vars
- `artifacts/api-server/` — Express backend
  - `src/routes/market.ts` — Yahoo Finance quote + chart history proxy
  - `src/routes/chat.ts` — Gemini AI streaming chat (user key passed in request)
  - `src/routes/news.ts` — Yahoo Finance news feed
  - `src/routes/earnings.ts` — earnings calendar
- `lib/api-spec/openapi.yaml` — OpenAPI spec (health only; market routes use direct fetch)

## Architecture decisions

- Market data: Mobile app uses the API proxy on web; falls back to direct Yahoo Finance v8 chart API on native if the server is unreachable. This makes the Play Store APK self-contained.
- AI Chat: Gemini API key is entered by the user in-app Settings and sent with each request. No server-side key required.
- No database needed for core features — all user data (watchlist, portfolio holdings, settings) is stored in AsyncStorage.

## Product

FloBoard is a comprehensive financial market dashboard for mobile. Features:
- Real-time indices, stocks, crypto, forex, commodities, bonds
- Sector heatmap, top movers, market hours for 30+ global exchanges
- AI financial advisor (FloAI) powered by Gemini with live market context
- Portfolio tracker with P&L and alerts
- Watchlist with custom symbols
- Financial news feed with sentiment tags
- Earnings calendar

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- The Expo dev script must set REPLIT_EXPO_DEV_DOMAIN env vars explicitly — plain `expo start` won't route correctly on Replit.
- Metro config blocks yahoo-finance2's `_tmp_*` postinstall dirs to prevent ENOENT watch errors.
- On native builds (APK/AAB), market data loads via direct YF chart API even with no backend running. News, earnings, and AI chat still need the deployed backend.
- `SplashScreen.hideAsync()` has a 4s timeout fallback in `_layout.tsx` to prevent white-screen hangs if font loading stalls.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
