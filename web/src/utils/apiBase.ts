/**
 * FloBoard backend on Render. api.floboard.app no longer resolves.
 */
const RENDER = 'https://floboard-api.onrender.com'

export function getApiBase(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined
  if (envUrl) return envUrl.replace(/\/$/, '')
  try {
    const saved = localStorage.getItem('floboard:apiBase')
    if (saved && saved.includes('onrender.com')) return saved.replace(/\/$/, '')
  } catch { /* ignore */ }
  return RENDER
}

export async function resolveApiBase(): Promise<string> {
  const base = getApiBase()
  try {
    localStorage.setItem('floboard:apiBase', base)
  } catch { /* ignore */ }
  return base
}
