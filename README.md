# FloBoard

FloBoard is a mobile/web financial markets dashboard built with React Native + Expo, backed by an
Express API server that pulls live data from Yahoo Finance. This repo is a pnpm workspace
monorepo containing the app, the API server, and a few shared internal libraries.

## What's in the app

- **Home** — a live global market snapshot: major indices, today's top gainers/losers, and a
  Market Hours widget showing open/closed status for 30 stock exchanges across the Americas,
  Europe, Asia-Pacific, and the Middle East/Africa (with real timezone-aware session tracking).
- **Watchlist** — multiple custom watchlists with search, covering stocks, crypto, forex, and
  commodities.
- **FX & Metals** — 90+ currency pairs (majors, minors, and emerging-market crosses) plus a
  dedicated Metals group for spot gold/silver/platinum/palladium.
- **Crypto** — ~80 coins grouped by category (stablecoins, mega/large-caps, Layer 2, DeFi, AI
  tokens, gaming/Web3, meme coins).
- **News** — market headlines tagged bullish/bearish/neutral.
- **Portfolio** — simulated position tracking and analytics (no real brokerage connection —
  everything here is for tracking/practice, not real trades).
- **FloAI Advisor** — an AI chat assistant (Google Gemini) for market questions.
- **Settings** — theme (dark/light/OLED), notification preferences, and an audit of every toggle
  in the app.

Market data also covers commodities (precious metals, energy, grains, softs, industrial metals),
all 11 S&P 500 GICS sector ETFs, and the Treasury yield curve (3-Mo through 30-Yr).

If the live Yahoo Finance call ever fails (rate limits, network issues, etc.), the API server
falls back to cached/simulated data so the app never shows blank values — it logs the real reason
for the failure server-side instead of surfacing an empty screen.

## Repo layout

```
artifacts/
  floboard/       # the Expo/React Native app described above
  api-server/     # Express API — quotes, news, earnings, chat (FloAI), proxied from Yahoo Finance
  mockup-sandbox/ # unrelated Replit sandbox project, not part of the FloBoard app
lib/
  db/                 # Postgres schema (Drizzle ORM) — optional locally, see below
  api-spec/           # OpenAPI spec shared by the generated clients below
  api-client-react/   # generated React Query client, consumed by floboard
  api-zod/            # generated Zod types, consumed by api-server
scripts/          # misc workspace-level scripts
```

## Requirements

- Node.js 24+
- **pnpm** — this repo only works with pnpm (npm/yarn are actively blocked by a preinstall check)
- [Expo Go](https://expo.dev/go) on your phone, or a simulator, if you want to run FloBoard on a
  device instead of the web

## Setup

```bash
git clone https://github.com/gamer-09/Code-Fixer-Pro.git
cd Code-Fixer-Pro
pnpm install
```

That's the whole install — no `.env` file is required to get market data working locally. A
Postgres `DATABASE_URL` is only needed if you want persistent storage; without one, the DB layer
falls back to a local default connection string and simply won't connect (this doesn't block the
app from running).

## Running it locally

You need two terminals — one for the API server, one for the app.

**Terminal 1 — API server:**
```bash
pnpm --filter @workspace/api-server run dev
```
Starts on `http://localhost:5000` by default.

**Terminal 2 — FloBoard:**
```bash
pnpm --filter @workspace/floboard run dev:local
```
This points the app at your local API server automatically. Once Metro Bundler starts, either
scan the QR code with Expo Go, or press `w` to open the web version.

Other floboard scripts, if you need them:
- `dev` — plain `expo start`, no API server env var set (use if you already have `EXPO_PUBLIC_API_URL`
  configured another way)
- `dev:tunnel` — `expo start --tunnel`, for testing on a device that isn't on the same network
- `dev:replit` — the Replit-specific variant (wires up Replit's proxy/domain env vars); not needed
  for local development

## FloAI (optional)

The AI chat tab needs a Gemini API key. Either set `GEMINI_API_KEY` in the api-server's
environment, or paste a free Gemini key directly into the app's **Settings** tab — no restart
required either way.

## Workspace-wide commands

Run from the repo root:
```bash
pnpm run typecheck   # typechecks all shared libs + apps
pnpm run build        # typecheck, then build everything that has a build script
```

## Notes for Windows users

Everything above is written to work in `cmd.exe`, PowerShell, and bash without modification — the
old Unix-only shell syntax (`export VAR=val && ...`, `sh -c '...'`) has been replaced with
`cross-env` and plain Node scripts throughout. If you hit a `pnpm install` error about ignored
build scripts, run the exact `pnpm install` command above again after a fresh `git pull` — that's
config that lives in `pnpm-workspace.yaml`, not something you need to approve interactively.
