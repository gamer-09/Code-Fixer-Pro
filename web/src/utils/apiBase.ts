/**
 * API base URL for the FloBoard backend proxy.
 * Tries known hosts (custom domain, Render) and remembers the first healthy one.
 */
const DEFAULTS = [
  'https://api.floboard.app',
  'https://floboard-api.onrender.com',
]

let cached: string | null = null

function savedBase(): string | null {
  try {
    const v = localStorage.getItem('floboard:apiBase')
    return v && v.startsWith('http') ? v.replace(/\/$/, '') : null
  } catch {
    return null
  }
}

function remember(base: string) {
  cached = base
  try { localStorage.setItem('floboard:apiBase', base) } catch { /* ignore */ }
}

export function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined
  if (envUrl) return envUrl.replace(/\/$/, '')
  if (cached) return cached
  return savedBase() || DEFAULTS[DEFAULTS.length - 1]
}

export async function resolveApiBase(): Promise<string> {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '')
  const list = [...new Set([envUrl, savedBase(), cached, ...DEFAULTS].filter(Boolean) as string[])]
  for (const base of list) {
    try {
      const res = await fetch(`${base}/api/healthz`, { signal: AbortSignal.timeout(5000) })
      if (res.ok) {
        remember(base)
        return base
      }
    } catch { /* try next */ }
  }
  const fallback = list[list.length - 1] || DEFAULTS[DEFAULTS.length - 1]
  remember(fallback)
  return fallback
}
