/**
 * Builds the base URL for the API server.
 *
 * Priority order:
 *   1. EXPO_PUBLIC_API_URL — full URL including protocol and port, e.g.
 *      http://localhost:5000 or http://192.168.1.42:5000
 *      Use this when running locally so you never have to think about
 *      protocol or port separately.
 *   2. EXPO_PUBLIC_DOMAIN — bare hostname[:port], e.g. localhost:5000
 *      Legacy variable kept for Replit compatibility. Local-looking values
 *      (localhost, 127.x.x.x, LAN IPs) get http://, everything else https://.
 *
 * If neither is set the app defaults to http://localhost:5000 (local dev only).
 *
 * PRODUCTION NOTE: In a production EAS build (Play Store / App Store) market data
 * loads automatically via the direct Yahoo Finance API — no backend needed.
 * News, Earnings, and AI Chat require a deployed backend. Set EXPO_PUBLIC_API_URL
 * in your EAS build profile (eas.json → build.<profile>.env) to enable them.
 */
export function getApiBase(): string {
  // Full-URL override (preferred for local dev)
  const fullUrl = process.env.EXPO_PUBLIC_API_URL;
  if (fullUrl) return fullUrl;

  // Legacy domain-only variable
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (!domain) return 'http://localhost:5000';

  const isLocal =
    domain.startsWith('localhost') ||
    domain.startsWith('127.0.0.1') ||
    /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(domain);

  return isLocal ? `http://${domain}` : `https://${domain}`;
}
