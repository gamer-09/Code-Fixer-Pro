import Constants from 'expo-constants';

/**
 * Builds the base URL for the API server.
 *
 * Priority order:
 *   1. EXPO_PUBLIC_API_URL — full URL including protocol and port, e.g.
 *      http://localhost:8080 or http://192.168.1.42:8080
 *   2. EXPO_PUBLIC_DOMAIN — bare hostname[:port], e.g. localhost:8080
 *   3. Automatic Expo Go detection — when running on a phone in Expo Go,
 *      automatically detects the developer PC Wi-Fi IP from Metro (e.g. 192.168.1.100:8080)
 *   4. Default — http://localhost:8080 (port 8080 where api-server runs)
 */
export function getApiBase(): string {
  // Full-URL override (preferred for local dev)
  const fullUrl = process.env.EXPO_PUBLIC_API_URL;
  if (fullUrl) return fullUrl;

  // Legacy domain-only variable
  const domain = process.env.EXPO_PUBLIC_DOMAIN;
  if (domain) {
    const isLocal =
      domain.startsWith('localhost') ||
      domain.startsWith('127.0.0.1') ||
      /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.)/.test(domain);

    return isLocal ? `http://${domain}` : `https://${domain}`;
  }

  // Automatically detect developer PC Wi-Fi IP address when running in Expo Go on mobile
  try {
    const hostUri = Constants.expoConfig?.hostUri || (Constants as unknown as { manifest?: { hostUri?: string } }).manifest?.hostUri;
    if (hostUri) {
      const ip = hostUri.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1' && ip !== '0.0.0.0') {
        return `http://${ip}:8080`;
      }
    }
  } catch { /* ignore */ }

  return 'http://localhost:8080';
}
