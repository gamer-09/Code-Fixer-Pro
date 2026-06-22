import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

const BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : 'http://localhost:80';

// ── Pair catalog ─────────────────────────────────────────────────────────────

interface PairInfo {
  sym: string;
  pair: string;
  base: string;
  quote: string;
  group: 'Majors' | 'Minors' | 'Emerging' | 'Index';
  desc: string;
}

const PAIRS: PairInfo[] = [
  // Majors
  { sym: 'EURUSD=X', pair: 'EUR/USD', base: 'EUR', quote: 'USD', group: 'Majors', desc: 'Euro / US Dollar' },
  { sym: 'GBPUSD=X', pair: 'GBP/USD', base: 'GBP', quote: 'USD', group: 'Majors', desc: 'British Pound / US Dollar' },
  { sym: 'USDJPY=X', pair: 'USD/JPY', base: 'USD', quote: 'JPY', group: 'Majors', desc: 'US Dollar / Japanese Yen' },
  { sym: 'USDCHF=X', pair: 'USD/CHF', base: 'USD', quote: 'CHF', group: 'Majors', desc: 'US Dollar / Swiss Franc' },
  { sym: 'USDCAD=X', pair: 'USD/CAD', base: 'USD', quote: 'CAD', group: 'Majors', desc: 'US Dollar / Canadian Dollar' },
  { sym: 'AUDUSD=X', pair: 'AUD/USD', base: 'AUD', quote: 'USD', group: 'Majors', desc: 'Australian Dollar / US Dollar' },
  { sym: 'NZDUSD=X', pair: 'NZD/USD', base: 'NZD', quote: 'USD', group: 'Majors', desc: 'New Zealand Dollar / US Dollar' },
  // Minors
  { sym: 'EURGBP=X', pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', group: 'Minors', desc: 'Euro / British Pound' },
  { sym: 'EURJPY=X', pair: 'EUR/JPY', base: 'EUR', quote: 'JPY', group: 'Minors', desc: 'Euro / Japanese Yen' },
  { sym: 'EURAUD=X', pair: 'EUR/AUD', base: 'EUR', quote: 'AUD', group: 'Minors', desc: 'Euro / Australian Dollar' },
  { sym: 'EURCHF=X', pair: 'EUR/CHF', base: 'EUR', quote: 'CHF', group: 'Minors', desc: 'Euro / Swiss Franc' },
  { sym: 'EURNZD=X', pair: 'EUR/NZD', base: 'EUR', quote: 'NZD', group: 'Minors', desc: 'Euro / New Zealand Dollar' },
  { sym: 'GBPJPY=X', pair: 'GBP/JPY', base: 'GBP', quote: 'JPY', group: 'Minors', desc: 'British Pound / Japanese Yen' },
  { sym: 'GBPCHF=X', pair: 'GBP/CHF', base: 'GBP', quote: 'CHF', group: 'Minors', desc: 'British Pound / Swiss Franc' },
  { sym: 'GBPAUD=X', pair: 'GBP/AUD', base: 'GBP', quote: 'AUD', group: 'Minors', desc: 'British Pound / Australian Dollar' },
  { sym: 'GBPNZD=X', pair: 'GBP/NZD', base: 'GBP', quote: 'NZD', group: 'Minors', desc: 'British Pound / New Zealand Dollar' },
  { sym: 'AUDCAD=X', pair: 'AUD/CAD', base: 'AUD', quote: 'CAD', group: 'Minors', desc: 'Australian Dollar / Canadian Dollar' },
  { sym: 'AUDNZD=X', pair: 'AUD/NZD', base: 'AUD', quote: 'NZD', group: 'Minors', desc: 'Australian Dollar / New Zealand Dollar' },
  { sym: 'AUDJPY=X', pair: 'AUD/JPY', base: 'AUD', quote: 'JPY', group: 'Minors', desc: 'Australian Dollar / Japanese Yen' },
  { sym: 'CADJPY=X', pair: 'CAD/JPY', base: 'CAD', quote: 'JPY', group: 'Minors', desc: 'Canadian Dollar / Japanese Yen' },
  { sym: 'CHFJPY=X', pair: 'CHF/JPY', base: 'CHF', quote: 'JPY', group: 'Minors', desc: 'Swiss Franc / Japanese Yen' },
  { sym: 'NZDJPY=X', pair: 'NZD/JPY', base: 'NZD', quote: 'JPY', group: 'Minors', desc: 'New Zealand Dollar / Japanese Yen' },
  // Emerging
  { sym: 'USDCNY=X', pair: 'USD/CNY', base: 'USD', quote: 'CNY', group: 'Emerging', desc: 'US Dollar / Chinese Yuan' },
  { sym: 'USDINR=X', pair: 'USD/INR', base: 'USD', quote: 'INR', group: 'Emerging', desc: 'US Dollar / Indian Rupee' },
  { sym: 'USDBRL=X', pair: 'USD/BRL', base: 'USD', quote: 'BRL', group: 'Emerging', desc: 'US Dollar / Brazilian Real' },
  { sym: 'USDMXN=X', pair: 'USD/MXN', base: 'USD', quote: 'MXN', group: 'Emerging', desc: 'US Dollar / Mexican Peso' },
  { sym: 'USDKRW=X', pair: 'USD/KRW', base: 'USD', quote: 'KRW', group: 'Emerging', desc: 'US Dollar / South Korean Won' },
  { sym: 'USDSGD=X', pair: 'USD/SGD', base: 'USD', quote: 'SGD', group: 'Emerging', desc: 'US Dollar / Singapore Dollar' },
  { sym: 'USDHKD=X', pair: 'USD/HKD', base: 'USD', quote: 'HKD', group: 'Emerging', desc: 'US Dollar / Hong Kong Dollar' },
  { sym: 'USDZAR=X', pair: 'USD/ZAR', base: 'USD', quote: 'ZAR', group: 'Emerging', desc: 'US Dollar / South African Rand' },
  { sym: 'USDNGN=X', pair: 'USD/NGN', base: 'USD', quote: 'NGN', group: 'Emerging', desc: 'US Dollar / Nigerian Naira' },
  { sym: 'USDTRY=X', pair: 'USD/TRY', base: 'USD', quote: 'TRY', group: 'Emerging', desc: 'US Dollar / Turkish Lira' },
  { sym: 'USDSEK=X', pair: 'USD/SEK', base: 'USD', quote: 'SEK', group: 'Emerging', desc: 'US Dollar / Swedish Krona' },
  { sym: 'USDNOK=X', pair: 'USD/NOK', base: 'USD', quote: 'NOK', group: 'Emerging', desc: 'US Dollar / Norwegian Krone' },
  { sym: 'USDPLN=X', pair: 'USD/PLN', base: 'USD', quote: 'PLN', group: 'Emerging', desc: 'US Dollar / Polish Zloty' },
  // Index
  { sym: 'DX-Y.NYB', pair: 'DXY', base: 'USD', quote: 'BASKET', group: 'Index', desc: 'US Dollar Index — trade-weighted basket' },
];

const ALL_SYMS = PAIRS.map((p) => p.sym);
const GROUPS = ['Majors', 'Minors', 'Emerging', 'Index'] as const;
type Group = typeof GROUPS[number];
type SortKey = 'pair' | 'chgPct' | 'chgAbs';

// ── Decimal precision ─────────────────────────────────────────────────────────

function decimals(sym: string): number {
  if (
    sym.includes('JPY') || sym.includes('KRW') || sym.includes('NGN') ||
    sym.includes('TRY') || sym.includes('INR') || sym.includes('MXN') ||
    sym.includes('SEK') || sym.includes('NOK') || sym.includes('ZAR') ||
    sym.includes('PLN') || sym.includes('HUF') || sym === 'DX-Y.NYB'
  ) return 2;
  if (sym.includes('CNY') || sym.includes('HKD') || sym.includes('SGD') || sym.includes('BRL')) return 4;
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

async function fetchQuotes(symbols: string[]): Promise<Record<string, QuoteRow>> {
  if (symbols.length === 0) return {};
  try {
    const res = await fetch(`${BASE}/api/market?symbols=${encodeURIComponent(symbols.join(','))}`);
    if (!res.ok) return {};
    const json = (await res.json()) as { results: QuoteRow[] };
    const map: Record<string, QuoteRow> = {};
    for (const q of json.results ?? []) {
      if (q?.symbol) map[q.symbol] = q;
    }
    return map;
  } catch {
    return {};
  }
}

// ── Group color palette ───────────────────────────────────────────────────────

const GROUP_PALETTE: Record<Group, { bg: string; text: string; accent: string }> = {
  Majors:   { bg: 'rgba(77,166,255,0.15)',  text: '#4DA6FF', accent: '#4DA6FF' },
  Minors:   { bg: 'rgba(155,143,255,0.15)', text: '#9B8FFF', accent: '#9B8FFF' },
  Emerging: { bg: 'rgba(255,182,39,0.15)',  text: '#FFB627', accent: '#FFB627' },
  Index:    { bg: 'rgba(0,229,160,0.15)',   text: '#00E5A0', accent: '#00E5A0' },
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

  const detailHeight = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 86] });
  const detailOpacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });

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
      {quote && (
        <Animated.View style={[styles.detailPanel, { height: detailHeight, opacity: detailOpacity, borderTopColor: colors.rim }]}>
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
        </Animated.View>
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

function LiveDot() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.2, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[styles.liveDot, { opacity: anim }]} />;
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
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);
  const [sort, setSort] = useState<SortKey>('pair');
  const [expandedSym, setExpandedSym] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    const q = await fetchQuotes(ALL_SYMS);
    setQuotes(q);
    setLastUpdated(new Date());
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
    const filtered = activeGroup ? PAIRS.filter((p) => p.group === activeGroup) : PAIRS;
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
            <LiveDot />
            <Text style={[styles.pageTitle, { color: colors.t1 }]}>FX Pairs</Text>
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
  filterScroll: { paddingHorizontal: 12, paddingVertical: 9, gap: 6, flexDirection: 'row' },
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
