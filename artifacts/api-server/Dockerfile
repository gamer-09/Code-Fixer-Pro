# syntax=docker/dockerfile:1
#
# FloBoard API server — production image.
# Works on any container host (Render, Railway, Fly.io, etc.).
#
# Build:    docker build -f artifacts/api-server/Dockerfile -t floboard-api .
# Run:      docker run -p 8080:8080 -e GEMINI_API_KEY=... floboard-api

FROM node:20.18.0 AS build
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# ── Install dependencies first (keeps this layer cached) ──────────────────────
# .npmrc is REQUIRED for the frozen install: it sets auto-install-peers=false,
# which must match the value recorded in pnpm-lock.yaml (otherwise pnpm aborts
# with ERR_PNPM_LOCKFILE_CONFIG_MISMATCH before downloading anything).
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml preinstall.mjs .npmrc ./
COPY lib/api-zod/package.json   lib/api-zod/
COPY lib/db/package.json        lib/db/
COPY artifacts/api-server/package.json artifacts/api-server/
# --filter with "..." pulls in the workspace deps (api-zod, db) without
# installing the whole monorepo (floboard, mockup-sandbox, etc.)
RUN pnpm install --filter @workspace/api-server... --frozen-lockfile

# ── Build the bundled server ───────────────────────────────────────────────────
COPY lib lib
COPY artifacts/api-server artifacts/api-server
RUN pnpm --filter @workspace/api-server run build

# ── Runtime image: only the bundled dist is needed ─────────────────────────────
FROM node:20.18.0-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/artifacts/api-server/dist ./dist

EXPOSE 8080
# PORT comes from the platform env (Render/Railway inject it automatically)
CMD ["node", "--enable-source-maps", "./dist/index.mjs"]
