export const ALIASES: Record<string, string> = {
  '/currency-pairs': '/fx',
  '/pairs': '/fx',
  '/forex': '/fx',
  '/fx-pairs': '/fx',
  '/currency': '/fx',
  '/currencies': '/fx',
  '/metals': '/fx',
  '/ai': '/advisor',
  '/floai': '/advisor',
  '/flo-ai': '/advisor',
  '/chat': '/advisor',
  '/assistant': '/advisor',
  '/gemini': '/advisor',
  '/favorites': '/watchlist',
  '/favourites': '/watchlist',
  '/stars': '/watchlist',
  '/holdings': '/portfolio',
  '/positions': '/portfolio',
  '/tracker': '/portfolio',
  '/overview': '/markets',
  '/home': '/markets',
  '/market': '/markets',
  '/stocks': '/markets',
  '/indices': '/markets',
  '/index': '/markets',
  '/about': '/help',
  '/faq': '/help',
  '/support': '/help',
  '/prefs': '/settings',
  '/preferences': '/settings',
  '/config': '/settings',
  '/options': '/settings',
  '/yields': '/rates',
  '/yield': '/rates',
  '/bonds': '/rates',
  '/oil': '/energy',
  '/crude': '/energy',
  '/hyg': '/credit',
  '/base-metals': '/copper',
}

export const PAGE_PATHS = [
  '/markets',
  '/crypto',
  '/fx',
  '/rates',
  '/energy',
  '/credit',
  '/copper',
  '/news',
  '/advisor',
  '/portfolio',
  '/watchlist',
  '/help',
  '/settings',
] as const

/** Strip trailing slashes, force a leading slash, lowercase. */
export function normalizePath(pathname: string): string {
  let path = pathname || '/'
  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/+$/, '') || '/'
  return path.toLowerCase()
}

/** Map aliases and the empty route onto the live page path. */
export function canonicalPath(pathname: string): string {
  const path = normalizePath(pathname)
  if (path === '/' || path === '/index.html') return '/markets'
  return ALIASES[path] ?? path
}
