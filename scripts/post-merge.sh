#!/bin/bash
set -e

pnpm install --frozen-lockfile
pnpm --filter db push

if [ -n "$GITHUB_TOKEN" ]; then
  echo "Pushing main → ai-part on GitHub..."
  git push --force "https://${GITHUB_TOKEN}@github.com/gamer-09/Code-Fixer-Pro.git" main:ai-part
  echo "Pushing main → main on GitHub..."
  git push --force "https://${GITHUB_TOKEN}@github.com/gamer-09/Code-Fixer-Pro.git" main:main
  echo "Push complete."
else
  echo "GITHUB_TOKEN not set — skipping GitHub push."
fi
