/**
 * Pure decision helpers for the "Clear Watchlist" / "Clear Portfolio" actions.
 *
 * Kept free of React/AsyncStorage so the exact same logic can be unit-tested
 * in isolation. The screens call these helpers and apply the result.
 *
 * Regression guard: clearing the custom ⭐ Favorites list must NEVER wipe the
 * preset lists (Tech & AI, Crypto, FX & Metals). The preset lists carry their
 * own default symbols and fall back to them when the user has no saved edits —
 * only the custom Favorites tab is ever emptied by a clear action.
 */

export interface ResolveSymbolsParams {
  /** The id of the currently active watchlist tab, e.g. "Favorites". */
  activeTab: string;
  /** Bumped by triggerClearWatchlist(); > 0 means "a clear was requested". */
  clearWatchlistKey: number;
  /** The user's saved symbols for this tab, or null if nothing stored yet. */
  stored: string[] | null;
  /** The preset default symbols for this tab (empty for Favorites). */
  defaultSyms: string[];
}

/**
 * Returns the symbol list a watchlist tab should show after a clear request.
 *
 * - Favorites (the custom list) is emptied when a clear was requested.
 * - Every other tab keeps its stored symbols, or falls back to its preset
 *   defaults — it is never wiped by the clear action.
 */
export function resolveSymbolsAfterClear({
  activeTab,
  clearWatchlistKey,
  stored,
  defaultSyms,
}: ResolveSymbolsParams): string[] {
  const shouldClearFavorites = activeTab === 'Favorites' && clearWatchlistKey > 0;
  if (shouldClearFavorites) {
    return [];
  }
  return stored ?? defaultSyms;
}

/** True when a pending clear request applies to the given tab. */
export function shouldClearTab(activeTab: string, clearWatchlistKey: number): boolean {
  return activeTab === 'Favorites' && clearWatchlistKey > 0;
}

/** Portfolio holdings are wiped entirely when a clear was requested. */
export function shouldClearHoldings(clearPortfolioKey: number): boolean {
  return clearPortfolioKey > 0;
}
