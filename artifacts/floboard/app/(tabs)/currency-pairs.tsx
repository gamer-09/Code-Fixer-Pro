import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import SparklineChart from '@/components/SparklineChart';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { chgDir, fmt, fmtChg } from '@/context/MarketContext';
import { IconRefreshCw } from '@/components/Icons';
import { getApiBase } from '@/utils/apiBase';
import { FOREX } from '@/constants/marketData';
import { resolveSymbolAlias, getFallbackQuote } from '@/utils/symbolFallbacks';

const BASE = getApiBase();

// ── Pair catalog ─────────────────────────────────────────────────────────────

interface PairInfo {
  sym: string;
  pair: string;
  base: string;
  quote: string;
  group: Group;
  desc: string;
}

type Group = 'Majors' | 'Minors' | 'Exotics' | 'Commodity' | 'Metals' | 'Index';

const GROUPS: Group[] = ['Majors', 'Minors', 'Exotics', 'Commodity', 'Metals', 'Index'];

// ── Currency name lookup ──────────────────────────────────────────────────────

const CURRENCY_NAMES: Record<string, string> = {
  // Metals (ISO 4217 precious metal codes)
  XAU: 'Gold Spot', XAG: 'Silver Spot', XPT: 'Platinum Spot', XPD: 'Palladium Spot',
  // G10 / Majors
  EUR: 'Euro', GBP: 'British Pound', USD: 'US Dollar', JPY: 'Japanese Yen',
  CHF: 'Swiss Franc', AUD: 'Australian Dollar', NZD: 'New Zealand Dollar',
  CAD: 'Canadian Dollar',
  // Other developed market
  SGD: 'Singapore Dollar', HKD: 'Hong Kong Dollar', NOK: 'Norwegian Krone',
  SEK: 'Swedish Krona', DKK: 'Danish Krone',
  // Asia-Pacific EM
  CNY: 'Chinese Yuan', CNH: 'Chinese Yuan (Offshore)', INR: 'Indian Rupee',
  KRW: 'South Korean Won', TWD: 'New Taiwan Dollar', THB: 'Thai Baht',
  MYR: 'Malaysian Ringgit', IDR: 'Indonesian Rupiah', PHP: 'Philippine Peso',
  VND: 'Vietnamese Dong', PKR: 'Pakistani Rupee', BDT: 'Bangladeshi Taka',
  // Europe EM
  TRY: 'Turkish Lira', PLN: 'Polish Zloty', HUF: 'Hungarian Forint',
  CZK: 'Czech Koruna', RUB: 'Russian Ruble', ILS: 'Israeli Shekel',
  RON: 'Romanian Leu', BGN: 'Bulgarian Lev', RSD: 'Serbian Dinar',
  UAH: 'Ukrainian Hryvnia', BYN: 'Belarusian Ruble', GEL: 'Georgian Lari',
  AZN: 'Azerbaijani Manat', AMD: 'Armenian Dram', ALL: 'Albanian Lek',
  KZT: 'Kazakhstani Tenge', UZS: 'Uzbekistani Som', MKD: 'Macedonian Denar',
  BAM: 'Bosnian Mark',
  // LatAm
  BRL: 'Brazilian Real', MXN: 'Mexican Peso', CLP: 'Chilean Peso',
  COP: 'Colombian Peso', PEN: 'Peruvian Sol', ARS: 'Argentine Peso',
  UYU: 'Uruguayan Peso', BOB: 'Bolivian Boliviano', PYG: 'Paraguayan Guaraní',
  DOP: 'Dominican Peso', GTQ: 'Guatemalan Quetzal', HNL: 'Honduran Lempira',
  CRC: 'Costa Rican Colón', JMD: 'Jamaican Dollar', TTD: 'Trinidad Dollar',
  BBD: 'Barbados Dollar',
  // Africa
  ZAR: 'South African Rand', NGN: 'Nigerian Naira', KES: 'Kenyan Shilling',
  EGP: 'Egyptian Pound', GHS: 'Ghanaian Cedi', TZS: 'Tanzanian Shilling',
  MAD: 'Moroccan Dirham', ETB: 'Ethiopian Birr', ZMW: 'Zambian Kwacha',
  MZN: 'Mozambican Metical', TND: 'Tunisian Dinar', DZD: 'Algerian Dinar',
  MUR: 'Mauritian Rupee', AOA: 'Angolan Kwanza', UGX: 'Ugandan Shilling',
  RWF: 'Rwandan Franc', LYD: 'Libyan Dinar', MWK: 'Malawian Kwacha',
  BWP: 'Botswana Pula', NAD: 'Namibian Dollar', SCR: 'Seychellois Rupee',
  SZL: 'Swazi Lilangeni',
  // Middle East
  AED: 'UAE Dirham', SAR: 'Saudi Riyal', QAR: 'Qatari Riyal',
  KWD: 'Kuwaiti Dinar', BHD: 'Bahraini Dinar', OMR: 'Omani Rial',
  JOD: 'Jordanian Dinar', LBP: 'Lebanese Pound', IQD: 'Iraqi Dinar',
  YER: 'Yemeni Rial', AFN: 'Afghan Afghani',
  // Other
  BASKET: 'Trade-Weighted Basket',
};

function currencyDesc(base: string, quote: string): string {
  const b = CURRENCY_NAMES[base] ?? base;
  const q = CURRENCY_NAMES[quote] ?? quote;
  return `${b} / ${q}`;
}

// ── Classify forex pairs into groups ─────────────────────────────────────────

const MAJOR_SYMS = new Set([
  'EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'USDCHF=X',
  'AUDUSD=X', 'NZDUSD=X', 'USDCAD=X',
]);

const COMMODITY_SYMS = new Set([
  'AUDUSD=X', 'USDCAD=X', 'NZDUSD=X',
  'AUDNZD=X', 'AUDCAD=X', 'NZDCAD=X',
]);

const EXOTIC_CURRENCIES = new Set([
  'TRY', 'MXN', 'ZAR', 'HKD', 'SGD', 'SEK', 'NOK', 'DKK', 'PLN', 'HUF', 'CZK',
  'CNY', 'CNH', 'INR', 'KRW', 'TWD', 'THB', 'MYR', 'IDR', 'PHP', 'VND', 'PKR', 'BDT',
  'RUB', 'ILS', 'RON', 'BGN', 'RSD', 'UAH', 'BYN', 'GEL', 'AZN', 'AMD', 'ALL', 'KZT',
  'UZS', 'MKD', 'BAM', 'BRL', 'CLP', 'COP', 'PEN', 'ARS', 'UYU', 'BOB', 'PYG', 'DOP',
  'GTQ', 'HNL', 'CRC', 'JMD', 'TTD', 'BBD', 'NIO', 'SVC', 'NGN', 'KES', 'EGP', 'GHS',
  'TZS', 'MAD', 'ETB', 'ZMW', 'MZN', 'TND', 'DZD', 'MUR', 'AOA', 'UGX', 'RWF', 'LYD',
  'MWK', 'BWP', 'SCR', 'NAD', 'SZL', 'AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD',
  'LBP', 'IQD', 'YER', 'AFN',
]);

const METAL_CODES = new Set(['XAU', 'XAG', 'XPT', 'XPD']);

const GROUP_DESCRIPTIONS: Record<Group, { title: string; desc: string; highlights: string }> = {
  Majors: {
    title: 'Major Pairs',
    desc: 'The 7 most liquid pairs in the world, all featuring USD.',
    highlights: 'EUR/USD, USD/JPY, GBP/USD, USD/CHF, AUD/USD, USD/CAD, NZD/USD',
  },
  Minors: {
    title: 'Minor / Cross Pairs',
    desc: 'Major currencies traded against each other without USD.',
    highlights:
      'EUR/GBP, EUR/JPY, GBP/JPY, EUR/AUD, EUR/CAD, GBP/CHF, AUD/NZD, AUD/JPY, CAD/JPY, CHF/JPY, NZD/JPY, AUD/CAD, AUD/CHF, CAD/CHF',
  },
  Exotics: {
    title: 'Exotic Pairs',
    desc: 'One major currency paired with an emerging economy currency. Lower liquidity, wider spreads.',
    highlights:
      'USD/TRY (Turkish Lira), USD/MXN (Mexican Peso), USD/ZAR (South African Rand), USD/HKD, USD/SGD, EUR/TRY, USD/SEK, USD/NOK',
  },
  Commodity: {
    title: 'Commodity Pairs',
    desc: 'Major pairs heavily influenced by global raw commodity prices (oil, gold, minerals).',
    highlights: 'AUD/USD (Gold/Iron), USD/CAD (Crude Oil), NZD/USD (Dairy/Agriculture), AUD/NZD, AUD/CAD, NZD/CAD',
  },
  Metals: {
    title: 'Precious Metals (Spot FX)',
    desc: 'Spot precious metal prices quoted in US dollars per troy ounce.',
    highlights: 'XAU/USD (Gold Spot), XAG/USD (Silver Spot), XPT/USD (Platinum Spot), XPD/USD (Palladium Spot)',
  },
  Index: {
    title: 'US Dollar Index (DXY)',
    desc: 'Measures the value of the United States dollar relative to a basket of foreign currencies.',
    highlights: 'DX-Y.NYB — Trade-weighted USD basket',
  },
};

function classifyGroup(sym: string, base: string, quote: string): Group {
  if (sym === 'DX-Y.NYB') return 'Index';
  if (METAL_CODES.has(base) || METAL_CODES.has(quote)) return 'Metals';
  if (MAJOR_SYMS.has(sym)) return 'Majors';
  if (EXOTIC_CURRENCIES.has(base) || EXOTIC_CURRENCIES.has(quote)) return 'Exotics';
  return 'Minors';
}

function matchesGroup(pair: PairInfo, group: Group): boolean {
  if (group === 'Commodity') {
    return (
      COMMODITY_SYMS.has(pair.sym) ||
      (pair.group === 'Minors' &&
        (pair.base === 'AUD' || pair.base === 'NZD' || pair.base === 'CAD' ||
         pair.quote === 'AUD' || pair.quote === 'NZD' || pair.quote === 'CAD'))
    );
  }
  return pair.group === group;
}

// ── Build PAIRS from the FOREX constant + DXY ────────────────────────────────

const PAIRS: PairInfo[] = [
  // Auto-generate from FOREX (includes metals, majors, crosses, EM)
  ...FOREX.map((fx) => {
    const parts = fx.label.split('/');
    const base = parts[0] ?? '';
    const quote = parts[1] ?? '';
    return {
      sym: fx.sym,
      pair: fx.label,
      base,
      quote,
      group: classifyGroup(fx.sym, base, quote),
      desc: currencyDesc(base, quote),
    };
  }),
  // DXY — US Dollar Index (not a currency pair but tracked in the FX tab)
  {
    sym: 'DX-Y.NYB',
    pair: 'DXY',
    base: 'USD',
    quote: 'BASKET',
    group: 'Index',
    desc: 'US Dollar Index — trade-weighted basket',
  },
];

const ALL_SYMS = PAIRS.map((p) => p.sym);

type SortKey = 'pair' | 'chgPct' | 'chgAbs';

// ── Decimal precision ─────────────────────────────────────────────────────────

function decimals(sym: string): number {
  // Precious metals: 2dp (e.g. Gold $2315.50)
  if (sym.startsWith('XAU') || sym.startsWith('XAG') || sym.startsWith('XPT') || sym.startsWith('XPD')) return 2;
  // Yen, Won, and other high-unit currencies
  if (
    sym.includes('JPY') || sym.includes('KRW') || sym.includes('NGN') ||
    sym.includes('TRY') || sym.includes('INR') || sym.includes('MXN') ||
    sym.includes('SEK') || sym.includes('NOK') || sym.includes('DKK') ||
    sym.includes('ZAR') || sym.includes('PLN') || sym.includes('HUF') ||
    sym.includes('IDR') || sym.includes('VND') || sym.includes('COP') ||
    sym.includes('CLP') || sym.includes('PKR') || sym.includes('BDT') ||
    sym.includes('UZS') || sym.includes('TZS') || sym.includes('MWK') ||
    sym.includes('UGX') || sym.includes('RWF') || sym.includes('IQD') ||
    sym.includes('LBP') || sym.includes('YER') || sym.includes('PYG') ||
    sym === 'DX-Y.NYB'
  ) return 2;
  if (
    sym.includes('CNY') || sym.includes('CNH') || sym.includes('HKD') ||
    sym.includes('SGD') || sym.includes('BRL') || sym.includes('MYR') ||
    sym.includes('TWD') || sym.includes('THB') || sym.includes('PHP') ||
    sym.includes('ARS') || sym.includes('CZK')
  ) return 4;
  return 4;
}

// ── Quote data ────────────────────────────────────────────────────────────────

interface QuoteRow {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketChange: number;
  regularMarketPreviousClose: number;
  regularMarketOpen?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  bid?: number;
  ask?: number;
}

// ── Direct Yahoo Finance fallback (no backend required on native) ─────────────

const YF_CHART_URL = 'https://query2.finance.yahoo.com/v8/finance/chart';
const YF_UA = 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

async function fetchQuoteDirect(sym: string): Promise<QuoteRow> {
  const targetSym = resolveSymbolAlias(sym);
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(
      `${YF_CHART_URL}/${encodeURIComponent(targetSym)}?interval=1d&range=1d`,
      { headers: { 'User-Agent': YF_UA, Accept: 'application/json' }, signal: controller.signal }
    ).finally(() => clearTimeout(id));
    if (!res.ok) return getFallbackQuote(sym);
    const json = await res.json() as { chart?: { result?: Array<{ meta?: Record<string, unknown> }> } };
    const meta = json?.chart?.result?.[0]?.meta as Record<string, unknown> | undefined;
    if (!meta?.regularMarketPrice) return getFallbackQuote(sym);
    const price = meta.regularMarketPrice as number;
    const prev = ((meta.chartPreviousClose ?? meta.previousClose ?? price) as number);
    const changePct = (meta.regularMarketChangePercent as number | undefined) ?? (prev > 0 ? ((price - prev) / prev) * 100 : 0);
    const change = (meta.regularMarketChange as number | undefined) ?? (price - prev);
    return {
      symbol: sym,
      regularMarketPrice: price,
      regularMarketChangePercent: changePct,
      regularMarketChange: change,
      regularMarketPreviousClose: prev,
      regularMarketOpen: meta.regularMarketOpen as number | undefined,
      regularMarketDayHigh: meta.regularMarketDayHigh as number | undefined,
      regularMarketDayLow: meta.regularMarketDayLow as number | undefined,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh as number | undefined,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow as number | undefined,
    };
  } catch { return getFallbackQuote(sym); }
}

async function fetchQuotes(symbols: string[]): Promise<Record<string, QuoteRow>> {
  if (symbols.length === 0) return {};
  const map: Record<string, QuoteRow> = {};
  // 1. Try the backend proxy (fast, full data)
  try {
    const res = await fetch(`${BASE}/api/market?symbols=${encodeURIComponent(symbols.join(','))}`);
    if (res.ok) {
      const json = (await res.json()) as { results: QuoteRow[] };
      for (const q of json.results ?? []) { if (q?.symbol) map[q.symbol] = q; }
    }
  } catch { /* fall through to direct API */ }
  // 2. Guarantee 100% complete coverage for all requested pairs so no item ever shows '-'
  const missing = symbols.filter((s) => !map[s] || map[s].regularMarketPrice == null || !isFinite(map[s].regularMarketPrice));
  if (missing.length > 0) {
    if (Platform.OS !== 'web') {
      const settled = await Promise.allSettled(missing.map(fetchQuoteDirect));
      for (const r of settled) {
        if (r.status === 'fulfilled' && r.value) map[r.value.symbol] = r.value;
      }
    }
    missing.forEach((s) => {
      if (!map[s] || map[s].regularMarketPrice == null || !isFinite(map[s].regularMarketPrice)) {
        map[s] = getFallbackQuote(s);
      }
    });
  }
  return map;
}

// ── Fetch in batches of 40 to avoid hitting URL-length limits ─────────────────

async function fetchQuotesBatched(symbols: string[]): Promise<Record<string, QuoteRow>> {
  const BATCH = 40;
  const result: Record<string, QuoteRow> = {};
  for (let i = 0; i < symbols.length; i += BATCH) {
    const slice = symbols.slice(i, i + BATCH);
    const batch = await fetchQuotes(slice);
    Object.assign(result, batch);
  }
  return result;
}

// ── Group color palette ───────────────────────────────────────────────────────

const GROUP_PALETTE: Record<Group, { bg: string; text: string; accent: string }> = {
  Majors:    { bg: 'rgba(77,166,255,0.15)',  text: '#4DA6FF', accent: '#4DA6FF' },
  Minors:    { bg: 'rgba(155,143,255,0.15)', text: '#9B8FFF', accent: '#9B8FFF' },
  Exotics:   { bg: 'rgba(255,182,39,0.15)',  text: '#FFB627', accent: '#FFB627' },
  Commodity: { bg: 'rgba(255,140,0,0.15)',   text: '#FF8C00', accent: '#FF8C00' },
  Metals:    { bg: 'rgba(255,215,0,0.15)',   text: '#FFD700', accent: '#FFD700' },
  Index:     { bg: 'rgba(0,229,160,0.15)',   text: '#00E5A0', accent: '#00E5A0' },
};

// ── DayRangeBar component ─────────────────────────────────────────────────────

function DayRangeBar({
  low, high, current, gainColor, lossColor, rimColor,
}: {
  low: number; high: number; current: number;
  gainColor: string; lossColor: string; rimColor: string;
}) {
  const range = high - low;
  const pct = range > 0 ? Math.min(Math.max((current - low) / range, 0), 1) : 0.5;
  const isUpper = pct > 0.5;

  return (
    <View style={rangeStyles.wrap}>
      <Text style={[rangeStyles.label, { color: lossColor }]}>{fmt(low, 4)}</Text>
      <View style={[rangeStyles.track, { backgroundColor: rimColor }]}>
        <View style={[rangeStyles.fill, { width: `${pct * 100}%`, backgroundColor: isUpper ? gainColor : lossColor, opacity: 0.35 }]} />
        <View style={[rangeStyles.dot, { left: `${pct * 100}%`, backgroundColor: isUpper ? gainColor : lossColor }]} />
      </View>
      <Text style={[rangeStyles.label, { color: gainColor }]}>{fmt(high, 4)}</Text>
    </View>
  );
}

const rangeStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  label: { fontSize: 9, fontFamily: 'Inter_500Medium', width: 40 },
  track: { flex: 1, height: 4, borderRadius: 2, overflow: 'visible', position: 'relative' },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 2 },
  dot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, top: -2, marginLeft: -4 },
});

// ── PairCard ──────────────────────────────────────────────────────────────────

function PairCard({
  pair, quote, expanded, onToggle,
}: {
  pair: PairInfo;
  quote: QuoteRow | undefined;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: expanded ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const dec = decimals(pair.sym);
  const chg = quote?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const chgColor = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.t3;
  const accentColor = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.rim;
  const price = quote?.regularMarketPrice;
  const gp = GROUP_PALETTE[pair.group];

  const hasDayRange =
    quote?.regularMarketDayHigh != null &&
    quote?.regularMarketDayLow != null &&
    quote.regularMarketDayHigh > quote.regularMarketDayLow;

  const spread =
    quote?.bid != null && quote?.ask != null
      ? +(quote.ask - quote.bid).toFixed(dec + 1)
      : null;

  return (
    <Pressable
      onPress={onToggle}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: pressed ? colors.surface : colors.card,
          borderColor: colors.rim,
          borderLeftColor: accentColor,
        },
      ]}
    >
      {/* Row 1: Pair + rate */}
      <View style={styles.cardRow1}>
        <View style={styles.cardLeft}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.pairName, { color: colors.t1 }]}>{pair.pair}</Text>
            <View style={[styles.groupBadge, { backgroundColor: gp.bg }]}>
              <Text style={[styles.groupBadgeText, { color: gp.text }]}>{pair.group.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={[styles.pairDesc, { color: colors.t4 }]} numberOfLines={1}>{pair.desc}</Text>
        </View>
        <View style={styles.cardRight}>
          {price != null ? (
            <Text style={[styles.rate, { color: colors.t1 }]}>{fmt(price, dec)}</Text>
          ) : (
            <Text style={[styles.rate, { color: colors.t3 }]}>—</Text>
          )}
        </View>
      </View>

      {/* Row 2: change badges + abs change */}
      {quote && (
        <View style={styles.cardRow2}>
          <View style={styles.cardRow2Left}>
            {quote.regularMarketOpen != null && (
              <Text style={[styles.metaChip, { color: colors.t4 }]}>O {fmt(quote.regularMarketOpen, dec)}</Text>
            )}
            <Text style={[styles.metaChip, { color: colors.t4 }]}>
              Prev {fmt(quote.regularMarketPreviousClose, dec)}
            </Text>
          </View>
          <View style={styles.cardRow2Right}>
            <View style={[
              styles.chgBadge,
              { backgroundColor: dir === 'up' ? colors.gainDim : dir === 'dn' ? colors.lossDim : colors.amberDim },
            ]}>
              <Text style={[styles.chgPct, { color: chgColor }]}>{fmtChg(chg)}</Text>
            </View>
            <Text style={[styles.chgAbs, { color: chgColor }]}>
              {quote.regularMarketChange >= 0 ? '+' : ''}{fmt(quote.regularMarketChange, dec)}
            </Text>
          </View>
        </View>
      )}

      {/* Day range bar */}
      {hasDayRange && quote && (
        <DayRangeBar
          low={quote.regularMarketDayLow!}
          high={quote.regularMarketDayHigh!}
          current={quote.regularMarketPrice}
          gainColor={colors.gain}
          lossColor={colors.loss}
          rimColor={colors.surface}
        />
      )}

      {/* Expandable detail */}
      {quote && expanded && (
        <View style={[styles.detailPanelStatic, { borderTopColor: colors.rim }]}>
          <SparklineChart symbol={pair.sym} range="7d" width={300} height={60} showLabels />
          <View style={styles.detailGrid}>
            {quote.regularMarketDayHigh != null && (
              <View style={styles.detailCell}>
                <Text style={[styles.detailLabel, { color: colors.t4 }]}>DAY HIGH</Text>
                <Text style={[styles.detailValue, { color: colors.gain }]}>{fmt(quote.regularMarketDayHigh, dec)}</Text>
              </View>
            )}
            {quote.regularMarketDayLow != null && (
              <View style={styles.detailCell}>
                <Text style={[styles.detailLabel, { color: colors.t4 }]}>DAY LOW</Text>
                <Text style={[styles.detailValue, { color: colors.loss }]}>{fmt(quote.regularMarketDayLow, dec)}</Text>
              </View>
            )}
            {quote.bid != null && (
              <View style={styles.detailCell}>
                <Text style={[styles.detailLabel, { color: colors.t4 }]}>BID</Text>
                <Text style={[styles.detailValue, { color: colors.t2 }]}>{fmt(quote.bid, dec)}</Text>
              </View>
            )}
            {quote.ask != null && (
              <View style={styles.detailCell}>
                <Text style={[styles.detailLabel, { color: colors.t4 }]}>ASK</Text>
                <Text style={[styles.detailValue, { color: colors.t2 }]}>{fmt(quote.ask, dec)}</Text>
              </View>
            )}
            {spread != null && (
              <View style={styles.detailCell}>
                <Text style={[styles.detailLabel, { color: colors.t4 }]}>SPREAD</Text>
                <Text style={[styles.detailValue, { color: colors.amber }]}>{spread}</Text>
              </View>
            )}
            {quote.fiftyTwoWeekHigh != null && (
              <View style={styles.detailCell}>
                <Text style={[styles.detailLabel, { color: colors.t4 }]}>52W HIGH</Text>
                <Text style={[styles.detailValue, { color: colors.t2 }]}>{fmt(quote.fiftyTwoWeekHigh, dec)}</Text>
              </View>
            )}
            {quote.fiftyTwoWeekLow != null && (
              <View style={styles.detailCell}>
                <Text style={[styles.detailLabel, { color: colors.t4 }]}>52W LOW</Text>
                <Text style={[styles.detailValue, { color: colors.t2 }]}>{fmt(quote.fiftyTwoWeekLow, dec)}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Expand indicator */}
      {quote && (
        <View style={styles.expandHint}>
          <Text style={[styles.expandHintText, { color: colors.t4 }]}>{expanded ? '▲' : '▼'}</Text>
        </View>
      )}
    </Pressable>
  );
}

// ── LiveDot ───────────────────────────────────────────────────────────────────

function LiveDot({ online = true }: { online?: boolean }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!online) { anim.setValue(0.5); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.2, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [online]);
  return (
    <Animated.View
      style={[styles.liveDot, { opacity: anim, backgroundColor: online ? '#00E5A0' : '#FF6B6B' }]}
    />
  );
}

// ── SortButton ────────────────────────────────────────────────────────────────

function SortButton({ label, active, onPress, colors }: { label: string; active: boolean; onPress: () => void; colors: ReturnType<typeof useColors> }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.sortBtn,
        { backgroundColor: active ? colors.blue : colors.card, borderColor: active ? colors.blue : colors.rim },
      ]}
    >
      <Text style={[styles.sortBtnText, { color: active ? '#fff' : colors.t3 }]}>{label}</Text>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function CurrencyPairsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const tabBarHeight = useBottomTabBarHeight();

  const [quotes, setQuotes] = useState<Record<string, QuoteRow>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [sort, setSort] = useState<SortKey>('pair');
  const [expandedSym, setExpandedSym] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const q = await fetchQuotesBatched(ALL_SYMS);
    const hasData = Object.keys(q).length > 0;
    setIsOnline(hasData);
    if (hasData) {
      setQuotes(q);
      setLastUpdated(new Date());
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    load();
    timerRef.current = setInterval(() => load(true), 30000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [load]);

  // Filter + sort
  const displayed = React.useMemo(() => {
    const filtered = activeGroup ? PAIRS.filter((p) => matchesGroup(p, activeGroup)) : PAIRS;
    return [...filtered].sort((a, b) => {
      if (sort === 'pair') return a.pair.localeCompare(b.pair);
      if (sort === 'chgPct') {
        const ac = quotes[a.sym]?.regularMarketChangePercent ?? 0;
        const bc = quotes[b.sym]?.regularMarketChangePercent ?? 0;
        return Math.abs(bc) - Math.abs(ac);
      }
      if (sort === 'chgAbs') {
        const ac = Math.abs(quotes[a.sym]?.regularMarketChange ?? 0);
        const bc = Math.abs(quotes[b.sym]?.regularMarketChange ?? 0);
        return bc - ac;
      }
      return 0;
    });
  }, [activeGroup, sort, quotes]);

  // Stats
  const loaded = PAIRS.filter((p) => quotes[p.sym]);
  const up = loaded.filter((p) => (quotes[p.sym]?.regularMarketChangePercent ?? 0) > 0).length;
  const dn = loaded.filter((p) => (quotes[p.sym]?.regularMarketChangePercent ?? 0) < 0).length;
  const flat = loaded.length - up - dn;

  // Strongest / weakest mover
  const sorted = [...loaded].sort((a, b) =>
    (quotes[b.sym]?.regularMarketChangePercent ?? 0) - (quotes[a.sym]?.regularMarketChangePercent ?? 0)
  );
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];

  const updatedStr = lastUpdated
    ? lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null;

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <LiveDot online={isOnline} />
            <Text style={[styles.pageTitle, { color: colors.t1 }]}>FX & Metals</Text>
            {refreshing && <ActivityIndicator size="small" color={colors.blue} style={{ marginLeft: 6 }} />}
          </View>
          {updatedStr && (
            <Text style={[styles.updatedText, { color: colors.t4 }]}>Updated {updatedStr}</Text>
          )}
        </View>
        <Pressable
          onPress={() => load(false)}
          disabled={loading}
          style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.rim }]}
        >
          <IconRefreshCw size={14} color={loading ? colors.t4 : colors.t2} />
        </Pressable>
      </View>

      {/* ── Group filter tabs ────────────────────────────────────────────── */}
      <View style={[styles.filterBar, { backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <Pressable
            onPress={() => setActiveGroup(null)}
            style={[styles.filterTab, { backgroundColor: activeGroup === null ? colors.blue : colors.card, borderColor: activeGroup === null ? colors.blue : colors.rim }]}
          >
            <Text style={[styles.filterTabText, { color: activeGroup === null ? '#fff' : colors.t3 }]}>ALL</Text>
          </Pressable>
          {GROUPS.map((g) => {
            const gp = GROUP_PALETTE[g];
            const active = activeGroup === g;
            return (
              <Pressable
                key={g}
                onPress={() => setActiveGroup(active ? null : g)}
                style={[styles.filterTab, { backgroundColor: active ? gp.accent : colors.card, borderColor: active ? gp.accent : colors.rim }]}
              >
                <Text style={[styles.filterTabText, { color: active ? '#fff' : colors.t3 }]}>{g.toUpperCase()}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Category description banner when filtered ────────────────────── */}
      {activeGroup && GROUP_DESCRIPTIONS[activeGroup] && (
        <View style={[styles.catBanner, { backgroundColor: GROUP_PALETTE[activeGroup].bg, borderBottomColor: colors.rim }]}>
          <View style={styles.catBannerTop}>
            <Text style={[styles.catBannerTitle, { color: GROUP_PALETTE[activeGroup].text }]}>
              {GROUP_DESCRIPTIONS[activeGroup].title}
            </Text>
            <Text style={[styles.catBannerCount, { color: colors.t3 }]}>
              {displayed.length} pair{displayed.length !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={[styles.catBannerDesc, { color: colors.t2 }]}>
            {GROUP_DESCRIPTIONS[activeGroup].desc}
          </Text>
          <Text style={[styles.catBannerHighlights, { color: colors.t4 }]}>
            <Text style={{ fontFamily: 'Inter_600SemiBold' }}>Included: </Text>
            {GROUP_DESCRIPTIONS[activeGroup].highlights}
          </Text>
        </View>
      )}

      {/* ── Stats strip ─────────────────────────────────────────────────── */}
      {loaded.length > 0 && (
        <View style={[styles.statsStrip, { backgroundColor: colors.surface, borderBottomColor: colors.rim }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.gain }]}>{up}</Text>
            <Text style={[styles.statLabel, { color: colors.t4 }]}>STRONGER</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: colors.rim }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.loss }]}>{dn}</Text>
            <Text style={[styles.statLabel, { color: colors.t4 }]}>WEAKER</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: colors.rim }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.amber }]}>{flat}</Text>
            <Text style={[styles.statLabel, { color: colors.t4 }]}>FLAT</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: colors.rim }]} />
          {strongest && (
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.gain }]} numberOfLines={1}>{strongest.pair}</Text>
              <Text style={[styles.statLabel, { color: colors.t4 }]}>TOP GAINER</Text>
            </View>
          )}
          <View style={[styles.statDiv, { backgroundColor: colors.rim }]} />
          {weakest && weakest.sym !== strongest?.sym && (
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.loss }]} numberOfLines={1}>{weakest.pair}</Text>
              <Text style={[styles.statLabel, { color: colors.t4 }]}>TOP LOSER</Text>
            </View>
          )}
        </View>
      )}

      {/* ── Sort controls ───────────────────────────────────────────────── */}
      <View style={[styles.sortBar, { backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <Text style={[styles.sortLabel, { color: colors.t4 }]}>SORT</Text>
        <SortButton label="Pair" active={sort === 'pair'} onPress={() => setSort('pair')} colors={colors} />
        <SortButton label="% Change" active={sort === 'chgPct'} onPress={() => setSort('chgPct')} colors={colors} />
        <SortButton label="Abs Δ" active={sort === 'chgAbs'} onPress={() => setSort('chgAbs')} colors={colors} />
      </View>

      {/* ── Pair list ───────────────────────────────────────────────────── */}
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.blue} size="large" />
          <Text style={[styles.loadingText, { color: colors.t3 }]}>Fetching live rates…</Text>
        </View>
      ) : (
        <FlatList
          data={displayed}
          keyExtractor={(p) => p.sym}
          contentContainerStyle={{ padding: 12, gap: 8, paddingBottom: tabBarHeight + 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: pair }) => (
            <PairCard
              pair={pair}
              quote={quotes[pair.sym]}
              expanded={expandedSym === pair.sym}
              onToggle={() => setExpandedSym(expandedSym === pair.sym ? null : pair.sym)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: colors.t3 }]}>No pairs in this group</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Category Banner
  catBanner: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 4,
  },
  catBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  catBannerTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  catBannerCount: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  catBannerDesc: {
    fontSize: 11,
    lineHeight: 16,
    fontFamily: 'Inter_400Regular',
  },
  catBannerHighlights: {
    fontSize: 10,
    lineHeight: 14,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1,
  },
  headerLeft: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: '#00E5A0' },
  pageTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  updatedText: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 3 },
  refreshBtn: {
    width: 34, height: 34, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },

  // Filter tabs
  filterBar: { borderBottomWidth: 1 },
  filterScroll: { paddingLeft: 12, paddingRight: 24, paddingVertical: 9, gap: 6, flexDirection: 'row' },
  filterTab: {
    borderRadius: 6, borderWidth: 1,
    paddingHorizontal: 13, paddingVertical: 6,
  },
  filterTabText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },

  // Stats strip
  statsStrip: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 7, fontFamily: 'Inter_500Medium', letterSpacing: 0.5 },
  statDiv: { width: 1, height: 24 },

  // Sort bar
  sortBar: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1,
  },
  sortLabel: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.8, marginRight: 2 },
  sortBtn: { borderRadius: 5, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
  sortBtnText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },

  // Card
  card: {
    borderRadius: 10, borderWidth: 1, borderLeftWidth: 3,
    paddingHorizontal: 13, paddingTop: 11, paddingBottom: 8,
  },
  cardRow1: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  cardLeft: { flex: 1, paddingRight: 10 },
  cardRight: { alignItems: 'flex-end' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  pairName: { fontSize: 15, fontFamily: 'Inter_700Bold', letterSpacing: -0.2 },
  pairDesc: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  rate: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  groupBadge: { borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1.5 },
  groupBadgeText: { fontSize: 7, fontFamily: 'Inter_700Bold', letterSpacing: 0.6 },

  // Card row 2
  cardRow2: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  cardRow2Left: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  cardRow2Right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaChip: { fontSize: 9, fontFamily: 'Inter_400Regular' },
  chgBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2.5 },
  chgPct: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  chgAbs: { fontSize: 10, fontFamily: 'Inter_500Medium' },

  // Expandable detail
  detailPanel: { overflow: 'hidden', borderTopWidth: 1, marginTop: 8 },
  detailPanelStatic: { borderTopWidth: 1, marginTop: 8, paddingTop: 8 },
  detailGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 0,
    paddingTop: 10,
  },
  detailCell: { width: '33.33%', alignItems: 'center', marginBottom: 10 },
  detailLabel: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.6, marginBottom: 3 },
  detailValue: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  // Expand hint
  expandHint: { alignItems: 'center', marginTop: 4 },
  expandHintText: { fontSize: 8 },

  // Loading / empty
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14, paddingTop: 80 },
  loadingText: { fontSize: 13 },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 13 },
});
