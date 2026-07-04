# FloBoard — Code-Fixer-Pro

An AI-assisted financial markets dashboard, built as a pnpm monorepo: a React Native/Expo mobile app, an Express API backing it with live market data, and a Vite-based sandbox for prototyping screens.

**Branch:** `ai-part` — adds the AI market advisor (chat) feature on top of the core market data, news, and earnings API.

---

## Table of contents

- [Overview](#overview)
- [Monorepo layout](#monorepo-layout)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Running each app](#running-each-app)
- [Environment variables](#environment-variables)
- [The AI advisor (this branch)](#the-ai-advisor-this-branch)
- [Useful root scripts](#useful-root-scripts)
- [Notes & gotchas](#notes--gotchas)

---

## Overview

FloBoard is a dark-themed mobile app for tracking markets, with tabs for:

- **Markets** — overview / portfolio
- **Watchlist** — tracked stocks
- **Crypto** — crypto prices
- **Currency Pairs** — FX rates
- **News** — market news feed
- **Advisor** — AI chat that answers market questions using live quotes
- **Settings**

It's backed by an Express API (`api-server`) that wraps Yahoo Finance for quotes/news/earnings, and Gemini for the AI advisor.

## Monorepo layout

```
Code-Fixer-Pro/
├── artifacts/
│   ├── api-server/       # Express API: market, news, earnings, AI chat routes
│   ├── floboard/         # Expo / React Native app (the FloBoard client)
│   └── mockup-sandbox/   # Vite + React + shadcn/ui sandbox for prototyping UI
├── lib/
│   ├── api-client-react/ # Shared React Query hooks for calling api-server
│   ├── api-spec/         # OpenAPI spec + Orval codegen config
│   ├── api-zod/          # Shared Zod schemas/types
│   └── db/               # Drizzle ORM + PostgreSQL (schema is currently a template)
├── scripts/              # Misc workspace scripts
├── pnpm-workspace.yaml    # Workspace packages + shared dependency "catalog"
└── package.json           # Root scripts (typecheck, build)
```

| Package | Role |
|---|---|
| `@workspace/api-server` | Express 5 API. Live quotes/crypto via `yahoo-finance2`, news, earnings calendar, and the Gemini-powered chat/advisor endpoint. |
| `@workspace/floboard` | The FloBoard mobile app (Expo Router, React Native 0.81, Reanimated). |
| `@workspace/mockup-sandbox` | Standalone Vite app for building/previewing UI components and screen mockups. |
| `@workspace/api-client-react` | `@tanstack/react-query` hooks shared by client apps. |
| `@workspace/api-spec` | OpenAPI spec; `orval` generates typed hooks/schemas from it into `api-client-react` / `api-zod`. |
| `@workspace/api-zod` | Shared Zod validation schemas. |
| `@workspace/db` | Drizzle ORM setup for Postgres. |

## Prerequisites

- Node.js 24+
- pnpm 9 — the repo pins `pnpm@9.15.4`, easiest via [corepack](https://nodejs.org/api/corepack.html)
- PostgreSQL (only if you're working with `@workspace/db`)
- A Gemini API key (only if you're running the AI advisor)
- Expo Go app or an emulator, if you want to run FloBoard on a device

## Setup

```bash
git clone https://github.com/gamer-09/Code-Fixer-Pro.git
cd Code-Fixer-Pro
git checkout ai-part

corepack enable
corepack prepare pnpm@9.15.4 --activate

pnpm install
```

## Running each app

```bash
# API server — builds then starts (port comes from $PORT)
pnpm --filter @workspace/api-server run dev

# FloBoard — Expo dev server
pnpm --filter @workspace/floboard run dev

# Mockup sandbox — Vite dev server
pnpm --filter @workspace/mockup-sandbox run dev

# Regenerate typed API hooks/schemas from the OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Push DB schema to Postgres
pnpm --filter @workspace/db run push
```

## Environment variables

**`artifacts/api-server`**

| Variable | Required for | Notes |
|---|---|---|
| `PORT` | Starting the server at all | Server throws on boot if missing |
| `GEMINI_API_KEY` | `/api/chat` (AI advisor) | Calls Gemini's `generateContent` API |
| `DATABASE_URL` | `@workspace/db` scripts | Postgres connection string |

**`artifacts/floboard`**

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_DOMAIN` | Host the app calls for market data, news, and the advisor — point it at wherever `api-server` runs |

Set these in a `.env` file per package, or export them in your shell before running `dev`.

## The AI advisor (this branch)

`artifacts/api-server/src/routes/chat.ts` is the feature added on `ai-part`:

1. Takes the user's message + conversation history.
2. Scans the message for tickers/crypto symbols it recognizes and fetches live quotes for them from Yahoo Finance.
3. Passes the enriched context to Gemini (`gemini-2.5-flash`) and returns the reply.

It's surfaced in the FloBoard app's **Advisor** tab (`artifacts/floboard/app/(tabs)/advisor.tsx`), where users can ask free-form questions like "is now a good time to buy Bitcoin?" and get answers grounded in real prices.

## Useful root scripts

| Command | Description |
|---|---|
| `pnpm run typecheck` | Typechecks shared libs, then every package with a `typecheck` script |
| `pnpm run build` | `typecheck`, then builds every package with a `build` script |

## Notes & gotchas

- Shared dependency versions live in the `catalog:` block of `pnpm-workspace.yaml` — bump a version there once instead of per-package.
- `pnpm-workspace.yaml` enforces a 1-day minimum release age on new npm packages (supply-chain protection). Only add exclusions for fully trusted publishers.
- `@workspace/db`'s schema (`lib/db/src/schema/index.ts`) is currently just a template — no real tables yet.
- Some scripts (e.g. FloBoard's `dev` script) reference Replit-specific env vars (`REPLIT_DEV_DOMAIN`, `REPL_ID`) used for Replit's dev proxy during original development. The app works outside Replit as long as `EXPO_PUBLIC_DOMAIN` / `PORT` are set as described above.
