/**
 * API base URL for the FloBoard backend proxy.
 * On web, always points to the hosted API server.
 */
export function getApiBase(): string {
  // Allow env override for local dev
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl) return envUrl

  // Production API server
  return 'https://floboard-api.onrender.com'
}
