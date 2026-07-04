# Code-Fixer-Pro

A pnpm monorepo built around **FloBoard** — a mobile-first, AI-assisted financial markets dashboard — along with the backend API that powers it and a supporting UI/mockup sandbox.

> Branch: `ai-part` — adds the AI market advisor (chat) endpoint alongside the existing market data, news, and earnings routes.

## What's in here

This repo is a **pnpm workspace**, meaning it holds several independent packages that share code and dependencies.

```
Code-Fixer-Pro/
├── artifacts/
│   ├── api-server/       # Express API — market data, news, earnings, AI chat
│   ├── floboard/         # React Native / Expo app — the FloBoard mobile client
│   └── mockup-sandbox/   # Vite + React UI sandbox for prototyping components/screens
├── lib/
│   ├── api-client-react/ # Shared React Query hooks for talking to api-server
│   ├── api-spec/         # OpenAPI spec + Orval codegen config
│   ├── api-zod/          # Shared Zod schemas/types
│   └── db/               # Drizzle ORM + PostgreSQL schema and client
├── scripts/              # Misc workspace scripts
├── pnpm-workspace.yaml   # Workspace + dependency catalog config
└── package.json          # Root scripts (typecheck, build)
```

### Packages at a glance

| Package | What it is |
|---|---|
| `@workspace/api-server` | Express 5 API server. Fetches live market/crypto/news/earnings data via `yahoo-finance2`, and serves an AI chat/advisor endpoint (`routes/chat.ts`) that answers market questions using Google's Gemini API. |
| `@workspace/floboard` | The main product — an Expo/React Native app with tabs for Portfolio, Watchlist, Crypto, Currency Pairs, News, an AI Advisor chat, and Settings. |
| `@workspace/mockup-sandbox` | A Vite-powered React canvas (shadcn/ui + Radix) used for prototyping screens and components in isolation. |
| `@workspace/api-client-react` | Shared `@tanstack/react-query` hooks used by client apps to call the API. |
| `@workspace/api-spec` | OpenAPI spec, with Orval used to generate typed hooks/schemas from it. |
| `@workspace/api-zod` | Shared Zod validation schemas/types used across server and clients. |
| `@workspace/db` | Drizzle ORM setup for PostgreSQL (schema currently a template — no tables defined yet). |

## Prerequisites

- **Node.js 24+**
- **pnpm 9** (the repo pins `packageManager: pnpm@9.15.4` — using [corepack](https://nodejs.org/api/corepack.html) is the easiest way to match this exactly)
- A **PostgreSQL** database (only required if/when you use `@workspace/db`)
- A **Gemini API key** (only required to run the AI chat/advisor feature in `api-server`)

## Getting started

1. **Clone and check out this branch**

   ```bash
   git clone https://github.com/gamer-09/Code-Fixer-Pro.git
   cd Code-Fixer-Pro
   git checkout ai-part
   ```

2. **Enable the pinned pnpm version**

   ```bash
   corepack enable
   corepack prepare pnpm@9.15.4 --activate
   ```

3. **Install dependencies** (installs for every package in the workspace)

   ```bash
   pnpm install
   ```

4. **Set environment variables**

   For the API server (`artifacts/api-server`), set:

   | Variable | Required for | Notes |
   |---|---|---|
   | `PORT` | Server to start at all | The server throws on startup if this is missing |
   | `GEMINI_API_KEY` | AI chat/advisor endpoint | Used to call the Gemini `generateContent` API |
   | `DATABASE_URL` | `@workspace/db` scripts | Postgres connection string — not needed unless you're touching the DB package |

   For the FloBoard app (`artifacts/floboard`), set:

   | Variable | Purpose |
   |---|---|
   | `EXPO_PUBLIC_DOMAIN` | The host FloBoard calls for market data, news, and the AI advisor (should point at wherever `api-server` is running) |

   You can put these in a `.env` file at the root of each package, or export them in your shell before running the dev scripts.

5. **Run things**

   From the repo root:

   ```bash
   # Full monorepo typecheck
   pnpm run typecheck

   # Typecheck + build every package
   pnpm run build
   ```

   Run an individual package with `pnpm --filter <package-name> run <script>`:

   ```bash
   # Start the API server (build + run)
   pnpm --filter @workspace/api-server run dev

   # Start the FloBoard Expo app
   pnpm --filter @workspace/floboard run dev

   # Start the mockup sandbox (Vite dev server)
   pnpm --filter @workspace/mockup-sandbox run dev

   # Regenerate typed API hooks/schemas from the OpenAPI spec
   pnpm --filter @workspace/api-spec run codegen

   # Push DB schema to Postgres (only once @workspace/db has real tables)
   pnpm --filter @workspace/db run push
   ```

## Key scripts (root)

| Command | Description |
|---|---|
| `pnpm run typecheck` | Typechecks all shared libs, then every package that has a `typecheck` script |
| `pnpm run build` | Runs `typecheck`, then builds every package that has a `build` script |

## AI Advisor feature (this branch)

`artifacts/api-server/src/routes/chat.ts` is the AI-powered piece added on `ai-part`:

- Accepts a user's message and conversation history.
- Detects tickers/crypto symbols mentioned in the message (via keyword matching) and pulls live quotes for them from Yahoo Finance to give the model real numbers to work with.
- Sends the enriched prompt to Gemini (`gemini-2.5-flash`) and streams/returns the response.
- Surfaced in FloBoard's **Advisor** tab (`artifacts/floboard/app/(tabs)/advisor.tsx`), which lets users ask natural-language market questions and get contextual answers.

## Notes

- Dependency versions shared across packages are centralized in the `catalog:` section of `pnpm-workspace.yaml` — update a dependency there once rather than in every package.
- `pnpm-workspace.yaml` also enforces a minimum npm package release age (1 day) as a supply-chain security measure; only add exclusions for fully trusted publishers.
- The `@workspace/db` schema (`lib/db/src/schema/index.ts`) is currently just a template — no tables have been defined yet.
- `artifacts/floboard` and `artifacts/api-server` were originally developed on Replit; some scripts reference Replit-specific env vars (`REPLIT_DEV_DOMAIN`, etc.) for that environment's dev proxy, but the app runs fine outside Replit as long as `EXPO_PUBLIC_DOMAIN` / `PORT` are set as described above.
