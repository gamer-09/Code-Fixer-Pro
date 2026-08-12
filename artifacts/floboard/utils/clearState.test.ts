import { describe, expect, it } from 'vitest';
import {
  resolveSymbolsAfterClear,
  shouldClearTab,
  shouldClearHoldings,
} from './clearState';

/**
 * Regression guards for the bug: "Clear Watchlist" in Settings accidentally
 * wiped the preset lists (Tech & AI, Crypto, FX & Metals) along with the
 * custom ⭐ Favorites list. Preset lists must always fall back to their own
 * default symbols; only the custom Favorites list is ever emptied.
 */

const PRESET_TECH = ['AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOGL', 'META', 'TSLA', 'PLTR'];
const PRESET_CRYPTO = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD', 'DOGE-USD'];

describe('shouldClearTab', () => {
  it('returns true only for the Favorites tab when a clear was requested', () => {
    expect(shouldClearTab('Favorites', 1)).toBe(true);
    expect(shouldClearTab('Favorites', 2)).toBe(true);
  });

  it('returns false for preset tabs even when a clear was requested', () => {
    expect(shouldClearTab('Tech', 1)).toBe(false);
    expect(shouldClearTab('Crypto', 3)).toBe(false);
    expect(shouldClearTab('Macro', 1)).toBe(false);
  });

  it('returns false when no clear has been requested', () => {
    expect(shouldClearTab('Favorites', 0)).toBe(false);
    expect(shouldClearTab('Tech', 0)).toBe(false);
  });
});

describe('resolveSymbolsAfterClear', () => {
  it('empties the custom Favorites list when a clear was requested', () => {
    const result = resolveSymbolsAfterClear({
      activeTab: 'Favorites',
      clearWatchlistKey: 1,
      stored: ['AAPL', 'BTC-USD'],
      defaultSyms: [],
    });
    expect(result).toEqual([]);
  });

  it('never wipes the Tech preset list on a clear — falls back to its defaults', () => {
    const result = resolveSymbolsAfterClear({
      activeTab: 'Tech',
      clearWatchlistKey: 1,
      stored: null,
      defaultSyms: PRESET_TECH,
    });
    expect(result).toEqual(PRESET_TECH);
    expect(result).not.toEqual([]);
  });

  it('keeps the Crypto preset list intact even after a Favorites clear', () => {
    const result = resolveSymbolsAfterClear({
      activeTab: 'Crypto',
      clearWatchlistKey: 1,
      stored: null,
      defaultSyms: PRESET_CRYPTO,
    });
    expect(result).toEqual(PRESET_CRYPTO);
  });

  it('preserves a preset list that the user has customized (stored symbols)', () => {
    const stored = ['BTC-USD', 'ETH-USD', 'DOGE-USD'];
    const result = resolveSymbolsAfterClear({
      activeTab: 'Crypto',
      clearWatchlistKey: 1,
      stored,
      defaultSyms: PRESET_CRYPTO,
    });
    expect(result).toEqual(stored);
  });

  it('returns stored Favorites when no clear was requested', () => {
    const stored = ['AAPL', 'NVDA'];
    const result = resolveSymbolsAfterClear({
      activeTab: 'Favorites',
      clearWatchlistKey: 0,
      stored,
      defaultSyms: [],
    });
    expect(result).toEqual(stored);
  });
});

describe('shouldClearHoldings', () => {
  it('clears holdings only when a clear was requested', () => {
    expect(shouldClearHoldings(0)).toBe(false);
    expect(shouldClearHoldings(1)).toBe(true);
    expect(shouldClearHoldings(4)).toBe(true);
  });
});
