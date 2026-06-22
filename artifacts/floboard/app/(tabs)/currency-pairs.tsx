import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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

// ── Currency Pair Catalog ───────────────────────────────────────────────────

interface PairInfo {
  sym: string;
  pair: string;
  base: string;
  quote: string;
  group: string;
  desc: string;
}

const PAIRS: PairInfo[] = [
  // ── Majors (USD-based)
  { sym: 'EURUSD=X', pair: 'EUR/USD', base: 'EUR', quote: 'USD', group: 'Majors', desc: 'Euro / US Dollar' },
  { sym: 'GBPUSD=X', pair: 'GBP/USD', base: 'GBP', quote: 'USD', group: 'Majors', desc: 'British Pound / US Dollar' },
  { sym: 'USDJPY=X', pair: 'USD/JPY', base: 'USD', quote: 'JPY', group: 'Majors', desc: 'US Dollar / Japanese Yen' },
  { sym: 'USDCHF=X', pair: 'USD/CHF', base: 'USD', quote: 'CHF', group: 'Majors', desc: 'US Dollar / Swiss Franc' },
  { sym: 'USDCAD=X', pair: 'USD/CAD', base: 'USD', quote: 'CAD', group: 'Majors', desc: 'US Dollar / Canadian Dollar' },
  { sym: 'AUDUSD=X', pair: 'AUD/USD', base: 'AUD', quote: 'USD', group: 'Majors', desc: 'Australian Dollar / US Dollar' },
  { sym: 'NZDUSD=X', pair: 'NZD/USD', base: 'NZD', quote: 'USD', group: 'Majors', desc: 'New Zealand Dollar / US Dollar' },
  // ── Minors (no USD)
  { sym: 'EURGBP=X', pair: 'EUR/GBP', base: 'EUR', quote: 'GBP', group: 'Minors', desc: 'Euro / British Pound' },
  { sym: 'EURJPY=X', pair: 'EUR/JPY', base: 'EUR', quote: 'JPY', group: 'Minors', desc: 'Euro / Japanese Yen' },
  { sym: 'GBPJPY=X', pair: 'GBP/JPY', base: 'GBP', quote: 'JPY', group: 'Minors', desc: 'British Pound / Japanese Yen' },
  { sym: 'EURCHF=X', pair: 'EUR/CHF', base: 'EUR', quote: 'CHF', group: 'Minors', desc: 'Euro / Swiss Franc' },
  { sym: 'GBPCHF=X', pair: 'GBP/CHF', base: 'GBP', quote: 'CHF', group: 'Minors', desc: 'British Pound / Swiss Franc' },
  { sym: 'AUDCAD=X', pair: 'AUD/CAD', base: 'AUD', quote: 'CAD', group: 'Minors', desc: 'Australian Dollar / Canadian Dollar' },
  { sym: 'AUDNZD=X', pair: 'AUD/NZD', base: 'AUD', quote: 'NZD', group: 'Minors', desc: 'Australian Dollar / New Zealand Dollar' },
  { sym: 'CADJPY=X', pair: 'CAD/JPY', base: 'CAD', quote: 'JPY', group: 'Minors', desc: 'Canadian Dollar / Japanese Yen' },
  // ── Emerging Markets
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
  // ── Dollar Index
  { sym: 'DX-Y.NYB', pair: 'DXY', base: 'USD', quote: 'BASKET', group: 'Index', desc: 'US Dollar Index (trade-weighted basket)' },
];

const ALL_PAIR_SYMS = PAIRS.map((p) => p.sym);
const GROUPS = ['Majors', 'Minors', 'Emerging', 'Index'] as const;

// Decimal precision per pair
function pairDecimals(sym: string): number {
  if (sym.includes('JPY') || sym.includes('KRW') || sym.includes('NGN') || sym.includes('TRY') || sym.includes('INR') || sym.includes('MXN') || sym.includes('SEK') || sym.includes('NOK') || sym.includes('ZAR') || sym === 'DX-Y.NYB') return 2;
  return 4;
}

interface QuoteRow {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChangePercent: number;
  regularMarketChange: number;
  regularMarketPreviousClose: number;
}

async function fetchPairQuotes(symbols: string[]): Promise<Record<string, QuoteRow>> {
  if (symbols.length === 0) return {};
  try {
    const res = await fetch(
      `${BASE}/api/market?symbols=${encodeURIComponent(symbols.join(','))}`
    );
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

// ── Components ──────────────────────────────────────────────────────────────

function GroupBadge({ group }: { group: string }) {
  const colors = useColors();
  const palette: Record<string, { bg: string; text: string }> = {
    Majors: { bg: '#4DA6FF22', text: '#4DA6FF' },
    Minors: { bg: '#9B8FFF22', text: '#9B8FFF' },
    Emerging: { bg: '#FFB40022', text: '#FFB400' },
    Index: { bg: '#00E5A022', text: '#00E5A0' },
  };
  const c = palette[group] ?? { bg: colors.card, text: colors.t3 };
  return (
    <View style={[styles.groupBadge, { backgroundColor: c.bg }]}>
      <Text style={[styles.groupText, { color: c.text }]}>{group.toUpperCase()}</Text>
    </View>
  );
}

function PairRow({
  pair,
  quote,
}: {
  pair: PairInfo;
  quote: QuoteRow | undefined;
}) {
  const colors = useColors();
  const chg = quote?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const chgColor =
    dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.t3;
  const dec = pairDecimals(pair.sym);
  const price = quote?.regularMarketPrice;
  const prevClose = quote?.regularMarketPreviousClose;

  return (
    <View
      style={[
        styles.pairRow,
        {
          backgroundColor: colors.card,
          borderColor: colors.rim,
          borderLeftColor:
            dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.rim,
        },
      ]}
    >
      <View style={styles.pairLeft}>
        <View style={styles.pairHeader}>
          <Text style={[styles.pairLabel, { color: colors.t1 }]}>{pair.pair}</Text>
          <GroupBadge group={pair.group} />
        </View>
        <Text
          style={[styles.pairDesc, { color: colors.t4 }]}
          numberOfLines={1}
        >
          {pair.desc}
        </Text>
        {prevClose != null && price != null && (
          <Text style={[styles.pairPrev, { color: colors.t4 }]}>
            Prev close: {fmt(prevClose, dec)}
          </Text>
        )}
      </View>

      <View style={styles.pairRight}>
        <Text style={[styles.pairRate, { color: colors.t1 }]}>
          {price != null ? fmt(price, dec) : '—'}
        </Text>
        {quote ? (
          <View
            style={[
              styles.chgBadge,
              {
                backgroundColor:
                  dir === 'up'
                    ? colors.gainDim
                    : dir === 'dn'
                    ? colors.lossDim
                    : colors.amberDim,
              },
            ]}
          >
            <Text style={[styles.chgText, { color: chgColor }]}>
              {fmtChg(chg)}
            </Text>
          </View>
        ) : (
          <Text style={[styles.chgText, { color: colors.t4 }]}>—</Text>
        )}
        {quote?.regularMarketChange != null && (
          <Text style={[styles.pairAbsChg, { color: chgColor }]}>
            {quote.regularMarketChange >= 0 ? '+' : ''}
            {fmt(quote.regularMarketChange, dec)}
          </Text>
        )}
      </View>
    </View>
  );
}

function SummaryBar({
  quotes,
}: {
  quotes: Record<string, QuoteRow>;
}) {
  const colors = useColors();
  const loaded = PAIRS.filter((p) => quotes[p.sym]);
  if (loaded.length === 0) return null;
  const up = loaded.filter((p) => (quotes[p.sym]?.regularMarketChangePercent ?? 0) > 0).length;
  const dn = loaded.filter((p) => (quotes[p.sym]?.regularMarketChangePercent ?? 0) < 0).length;
  const flat = loaded.length - up - dn;

  return (
    <View style={[styles.summaryBar, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryNum, { color: colors.gain }]}>{up}</Text>
        <Text style={[styles.summaryLbl, { color: colors.t4 }]}>Stronger</Text>
      </View>
      <View style={[styles.summaryDiv, { backgroundColor: colors.rim }]} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryNum, { color: colors.loss }]}>{dn}</Text>
        <Text style={[styles.summaryLbl, { color: colors.t4 }]}>Weaker</Text>
      </View>
      <View style={[styles.summaryDiv, { backgroundColor: colors.rim }]} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryNum, { color: colors.amber }]}>{flat}</Text>
        <Text style={[styles.summaryLbl, { color: colors.t4 }]}>Flat</Text>
      </View>
      <View style={[styles.summaryDiv, { backgroundColor: colors.rim }]} />
      <View style={styles.summaryItem}>
        <Text style={[styles.summaryNum, { color: colors.t2 }]}>{loaded.length}</Text>
        <Text style={[styles.summaryLbl, { color: colors.t4 }]}>Loaded</Text>
      </View>
    </View>
  );
}

// ── Main screen ─────────────────────────────────────────────────────────────

export default function CurrencyPairsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const tabBarHeight = useBottomTabBarHeight();
  const [quotes, setQuotes] = useState<Record<string, QuoteRow>>({});
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadQuotes = useCallback(async () => {
    setLoading(true);
    const q = await fetchPairQuotes(ALL_PAIR_SYMS);
    setQuotes(q);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadQuotes();
    timerRef.current = setInterval(loadQuotes, 60000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadQuotes]);

  const displayed = activeGroup
    ? PAIRS.filter((p) => p.group === activeGroup)
    : PAIRS;

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 8,
            backgroundColor: colors.base,
            borderBottomColor: colors.rim,
          },
        ]}
      >
        <View>
          <Text style={[styles.pageTitle, { color: colors.t1 }]}>
            Currency Pairs
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.t4 }]}>
            Live forex rates via Yahoo Finance
          </Text>
        </View>
        <View style={styles.headerRight}>
          {loading && (
            <ActivityIndicator size="small" color={colors.blue} />
          )}
          <Pressable
            onPress={loadQuotes}
            disabled={loading}
            style={[
              styles.refreshBtn,
              { backgroundColor: colors.card, borderColor: colors.rim },
            ]}
          >
            <IconRefreshCw size={13} color={colors.t2} />
          </Pressable>
        </View>
      </View>

      {/* Group filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.groupTabs}
        style={[styles.groupTabsWrap, { backgroundColor: colors.base, borderBottomColor: colors.rim }]}
      >
        <Pressable
          onPress={() => setActiveGroup(null)}
          style={[
            styles.groupTab,
            {
              backgroundColor: activeGroup === null ? colors.blue : colors.card,
              borderColor: activeGroup === null ? colors.blue : colors.rim,
            },
          ]}
        >
          <Text
            style={[
              styles.groupTabText,
              { color: activeGroup === null ? '#fff' : colors.t3 },
            ]}
          >
            ALL
          </Text>
        </Pressable>
        {GROUPS.map((g) => (
          <Pressable
            key={g}
            onPress={() => setActiveGroup(activeGroup === g ? null : g)}
            style={[
              styles.groupTab,
              {
                backgroundColor: activeGroup === g ? colors.blue : colors.card,
                borderColor: activeGroup === g ? colors.blue : colors.rim,
              },
            ]}
          >
            <Text
              style={[
                styles.groupTabText,
                { color: activeGroup === g ? '#fff' : colors.t3 },
              ]}
            >
              {g.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Summary */}
      <View style={{ paddingHorizontal: 14, paddingTop: 10 }}>
        <SummaryBar quotes={quotes} />
      </View>

      {/* Pair list */}
      <FlatList
        data={displayed}
        keyExtractor={(p) => p.sym}
        contentContainerStyle={{
          padding: 14,
          paddingTop: 8,
          paddingBottom: tabBarHeight + 8,
          gap: 6,
        }}
        ListEmptyComponent={
          loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.blue} size="large" />
              <Text style={[styles.loadingText, { color: colors.t3 }]}>
                Fetching live rates…
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item: pair }) => (
          <PairRow pair={pair} quote={quotes[pair.sym]} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  pageSubtitle: { fontSize: 10, fontFamily: 'Inter_400Regular', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupTabsWrap: { borderBottomWidth: 1, maxHeight: 52 },
  groupTabs: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
  },
  groupTab: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  groupTabText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 10,
    marginBottom: 2,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  summaryLbl: {
    fontSize: 8,
    fontFamily: 'Inter_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  summaryDiv: { width: 1, height: 28 },
  pairRow: {
    borderRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pairLeft: { flex: 1 },
  pairHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  pairLabel: { fontSize: 14, fontFamily: 'Inter_700Bold', letterSpacing: -0.2 },
  pairDesc: { fontSize: 10, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  pairPrev: { fontSize: 9, fontFamily: 'Inter_400Regular' },
  pairRight: { alignItems: 'flex-end', gap: 3, minWidth: 90 },
  pairRate: { fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  chgBadge: { borderRadius: 4, paddingHorizontal: 7, paddingVertical: 2 },
  chgText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  pairAbsChg: { fontSize: 9, fontFamily: 'Inter_400Regular' },
  groupBadge: { borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 },
  groupText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  loadingWrap: { alignItems: 'center', paddingVertical: 60, gap: 14 },
  loadingText: { fontSize: 13 },
});
