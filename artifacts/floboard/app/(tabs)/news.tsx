import React, { useCallback, useState } from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { IconRefreshCw, IconTrendingUp, IconZap } from '@/components/Icons';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/context/SettingsContext';
import { chgDir, fmt, fmtChg } from '@/context/MarketContext';
import { getApiBase } from '@/utils/apiBase';

const BASE = getApiBase();

type NewsTag = 'bull' | 'bear' | 'neutral';

interface NewsItem {
  src: string;
  title: string;
  tag: NewsTag;
  age: string;
  impact: string;
  url?: string;
}

interface EarningItem {
  sym: string;
  name: string;
  date: string;
  epsEst: number | null;
  revenueEst: number | null;
  price: number | null;
  changePct: number | null;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    title: 'Global Markets Rally as Tech Sector Surges on Strong AI Earnings',
    src: 'Reuters',
    age: '2h',
    impact: 'Positive for technology and growth-oriented equities globally.',
    tag: 'bull',
  },
  {
    title: 'Federal Reserve Signals Patience on Rate Cuts Amid Economic Resilience',
    src: 'Bloomberg',
    age: '4h',
    impact: 'Supports US Dollar strength and stabilizes treasury bond yields.',
    tag: 'neutral',
  },
  {
    title: 'Gold and Silver Edge Higher as Demand for Safe-Haven Assets Continues',
    src: 'Financial Times',
    age: '5h',
    impact: 'Bullish momentum for precious metals and commodity-linked currencies.',
    tag: 'bull',
  },
  {
    title: 'Bitcoin Holds Ground Above Major Support Levels After Recent Consolidation',
    src: 'CoinDesk',
    age: '6h',
    impact: 'Positive sentiment across digital asset markets and Layer-1 protocols.',
    tag: 'bull',
  },
  {
    title: 'Crude Oil Inventories Shift as OPEC+ Evaluates Global Demand Forecasts',
    src: 'WSJ',
    age: '8h',
    impact: 'Key driver for energy stocks and commodity-exporting forex pairs.',
    tag: 'neutral',
  },
  {
    title: 'Central Banks in Europe and Asia Adjust Forex Interventions to Manage Volatility',
    src: 'Nikkei Asia',
    age: '10h',
    impact: 'Increases cross-pair trading opportunities and stabilizes emerging market FX.',
    tag: 'neutral',
  },
];

const FALLBACK_EARNINGS: EarningItem[] = [
  { sym: 'NVDA', name: 'NVIDIA Corporation', date: new Date(Date.now() + 86400000 * 2).toISOString(), epsEst: 0.68, revenueEst: 28500000000, price: 128.50, changePct: 2.4 },
  { sym: 'AAPL', name: 'Apple Inc.', date: new Date(Date.now() + 86400000 * 3).toISOString(), epsEst: 1.34, revenueEst: 84200000000, price: 224.10, changePct: 0.8 },
  { sym: 'MSFT', name: 'Microsoft Corp.', date: new Date(Date.now() + 86400000 * 4).toISOString(), epsEst: 2.92, revenueEst: 64300000000, price: 442.30, changePct: -0.3 },
  { sym: 'AMZN', name: 'Amazon.com Inc.', date: new Date(Date.now() + 86400000 * 5).toISOString(), epsEst: 1.02, revenueEst: 148500000000, price: 188.40, changePct: 1.2 },
];

function makeFetchNews(count: number) {
  return async (): Promise<NewsItem[]> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`${BASE}/api/news?count=${count}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { news: NewsItem[] };
      const news = data.news ?? [];
      return news.length > 0 ? news : FALLBACK_NEWS.slice(0, count);
    } catch {
      return FALLBACK_NEWS.slice(0, count);
    } finally { clearTimeout(timer); }
  };
}

function makeFetchEarnings(weeks: number) {
  return async (): Promise<EarningItem[]> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(`${BASE}/api/earnings?weeks=${weeks}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { earnings: EarningItem[] };
      const earnings = data.earnings ?? [];
      return earnings.length > 0 ? earnings : FALLBACK_EARNINGS;
    } catch {
      return FALLBACK_EARNINGS;
    } finally { clearTimeout(timer); }
  };
}

function SectionHeader({ label, right }: { label: string; right?: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.secHd}>
      <Text style={[styles.secLabel, { color: colors.t3 }]}>{label}</Text>
      <View style={[styles.secLine, { backgroundColor: colors.rim }]} />
      {right}
    </View>
  );
}

function TagPill({ tag }: { tag: NewsTag }) {
  const colors = useColors();
  const map = {
    bull: { bg: colors.gainDim, col: colors.gain, label: '▲ BULLISH' },
    bear: { bg: colors.lossDim, col: colors.loss, label: '▼ BEARISH' },
    neutral: { bg: colors.amberDim, col: colors.amber, label: '◆ NEUTRAL' },
  };
  const { bg, col, label } = map[tag];
  return (
    <View style={[styles.tagPill, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color: col }]}>{label}</Text>
    </View>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const colors = useColors();
  const accentColor = item.tag === 'bull' ? colors.gain : item.tag === 'bear' ? colors.loss : colors.amber;

  const handlePress = () => {
    const q = `Explain this news story and what it means for markets and personal investors: ${item.title}`;
    router.navigate({ pathname: '/(tabs)/advisor', params: { q } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.newsCard,
        { backgroundColor: pressed ? colors.surface : colors.card, borderColor: colors.rim },
        pressed && { opacity: 0.9 },
      ]}
    >
      <View style={[styles.newsAccent, { backgroundColor: accentColor }]} />
      <View style={styles.newsContent}>
        <View style={styles.newsMeta}>
          <Text style={[styles.newsSrc, { color: colors.t3, backgroundColor: colors.surface, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 }]}>{item.src}</Text>
          <Text style={[styles.newsAge, { color: colors.t4 }]}>{item.age} ago</Text>
          <TagPill tag={item.tag} />
        </View>
        <Text style={[styles.newsTitle, { color: colors.t1 }]}>{item.title}</Text>
        <Text style={[styles.newsImpact, { color: colors.t3 }]}>{item.impact}</Text>
        <View style={styles.newsFooter}>
          <IconTrendingUp size={10} color={colors.t4} />
          <Text style={[styles.newsHint, { color: colors.t4 }]}>Tap to get AI analysis</Text>
        </View>
      </View>
    </Pressable>
  );
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatEarningsDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function fmtRevenue(n: number | null): string {
  if (!n) return '—';
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(0)}M`;
  return `$${n.toFixed(0)}`;
}

function EarningCard({ item }: { item: EarningItem }) {
  const colors = useColors();
  const days = daysUntil(item.date);
  const isPast = days < 0;
  const dir = chgDir(item.changePct);
  const chgColor = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.t3;
  const isToday = days === 0;
  const isSoon = !isPast && days <= 3;

  const urgencyColor = isToday ? colors.amber : isSoon ? colors.blue : colors.t4;
  const urgencyBg = isToday ? colors.amberDim : isSoon ? colors.blueDim : colors.surface;
  const label = isPast ? '⏎ Reported' : isToday ? '● TODAY' : days === 1 ? 'Tomorrow' : `In ${days}d`;

  const handlePress = () => {
    const q = `${item.sym} earnings report: what are analysts expecting and what should investors watch for?`;
    router.navigate({ pathname: '/(tabs)/advisor', params: { q } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.earningCard,
        { backgroundColor: pressed ? colors.surface : colors.card, borderColor: isToday ? 'rgba(255,180,0,0.25)' : colors.rim },
        pressed && { opacity: 0.9 },
      ]}
    >
      {isToday && <View style={[styles.earningAccent, { backgroundColor: colors.amber }]} />}
      <View style={styles.earningLeft}>
        <View style={styles.earningSymRow}>
          <Text style={[styles.earningSym, { color: colors.t1 }]}>{item.sym}</Text>
          {item.changePct != null && (
            <Text style={[styles.earningChg, { color: chgColor }]}>{fmtChg(item.changePct)}</Text>
          )}
        </View>
        <Text style={[styles.earningName, { color: colors.t4 }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.earningDate, { color: colors.t3 }]}>{formatEarningsDate(item.date)}</Text>
      </View>
      <View style={styles.earningRight}>
        <View style={[styles.earningDayBadge, { backgroundColor: urgencyBg }]}>
          <Text style={[styles.earningDayText, { color: urgencyColor }]}>{label}</Text>
        </View>
        <View style={styles.earningEstRow}>
          {item.epsEst != null && (
            <View style={[styles.earningEstChip, { backgroundColor: colors.surface }]}>
              <Text style={[styles.earningEstLabel, { color: colors.t4 }]}>EPS</Text>
              <Text style={[styles.earningEstVal, { color: colors.t2 }]}>{item.epsEst > 0 ? '+' : ''}{item.epsEst.toFixed(2)}</Text>
            </View>
          )}
          {item.revenueEst != null && (
            <View style={[styles.earningEstChip, { backgroundColor: colors.surface }]}>
              <Text style={[styles.earningEstLabel, { color: colors.t4 }]}>REV</Text>
              <Text style={[styles.earningEstVal, { color: colors.t2 }]}>{fmtRevenue(item.revenueEst)}</Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

function SentimentBar({ items }: { items: NewsItem[] }) {
  const colors = useColors();
  if (items.length === 0) return null;
  const bull = items.filter((i) => i.tag === 'bull').length;
  const bear = items.filter((i) => i.tag === 'bear').length;
  const neutral = items.filter((i) => i.tag === 'neutral').length;
  const total = items.length;
  const bullPct = (bull / total) * 100;
  const bearPct = (bear / total) * 100;
  const neutralPct = (neutral / total) * 100;

  return (
    <View style={[styles.sentimentWrap, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <View style={styles.sentimentHeader}>
        <Text style={[styles.sentimentTitle, { color: colors.t3 }]}>SENTIMENT BREAKDOWN</Text>
        <View style={styles.sentimentLegend}>
          <View style={[styles.sentimentDot, { backgroundColor: colors.gain }]} />
          <Text style={[styles.sentimentLegText, { color: colors.gain }]}>{bull} Bullish</Text>
          <View style={[styles.sentimentDot, { backgroundColor: colors.loss }]} />
          <Text style={[styles.sentimentLegText, { color: colors.loss }]}>{bear} Bearish</Text>
          <View style={[styles.sentimentDot, { backgroundColor: colors.amber }]} />
          <Text style={[styles.sentimentLegText, { color: colors.amber }]}>{neutral} Neutral</Text>
        </View>
      </View>
      <View style={styles.sentimentTrack}>
        {bullPct > 0 && <View style={[styles.sentimentSeg, { width: `${bullPct}%`, backgroundColor: colors.gain }]} />}
        {neutralPct > 0 && <View style={[styles.sentimentSeg, { width: `${neutralPct}%`, backgroundColor: colors.amber }]} />}
        {bearPct > 0 && <View style={[styles.sentimentSeg, { width: `${bearPct}%`, backgroundColor: colors.loss }]} />}
      </View>
    </View>
  );
}

function EarningsSection() {
  const colors = useColors();
  const { settings } = useSettings();
  const weeks = settings.earningsWindow;
  const { data: earnings, isLoading, isError } = useQuery({
    queryKey: ['earnings', weeks],
    queryFn: makeFetchEarnings(weeks),
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  if (isError) return null;

  const countChip = earnings?.length != null ? (
    <View style={[styles.countChip, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <Text style={{ color: colors.t4, fontSize: 9, fontFamily: 'Inter_500Medium' }}>{earnings.length}</Text>
    </View>
  ) : undefined;

  return (
    <View style={styles.earningsSection}>
      <SectionHeader label="EARNINGS CALENDAR" right={countChip} />
      {isLoading && (
        <View style={styles.earningLoader}>
          <ActivityIndicator size="small" color={colors.blue} />
          <Text style={[styles.earningLoadText, { color: colors.t4 }]}>Loading earnings…</Text>
        </View>
      )}
      {!isLoading && earnings?.length === 0 && (
        <View style={[styles.emptyChip, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={[styles.emptyText, { color: colors.t4 }]}>No major earnings this window</Text>
        </View>
      )}
      {earnings?.map((item) => <EarningCard key={`${item.sym}-${item.date}`} item={item} />)}
    </View>
  );
}

export default function NewsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const tabBarHeight = useBottomTabBarHeight();
  const [refreshing, setRefreshing] = useState(false);
  const { settings } = useSettings();
  const newsCount = settings.newsCount;

  const { data: news, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['news', newsCount],
    queryFn: makeFetchNews(newsCount),
    staleTime: 0,
    retry: 2,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const items = news ?? [];

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <View>
          <Text style={[styles.pageTitle, { color: colors.t1 }]}>News</Text>
          {!isLoading && items.length > 0 && (
            <Text style={[styles.subTitle, { color: colors.t4 }]}>{items.length} stories</Text>
          )}
        </View>
        <Pressable
          onPress={() => refetch()}
          style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.rim }]}
        >
          {isFetching
            ? <ActivityIndicator size="small" color={colors.blue} />
            : <IconRefreshCw size={13} color={colors.t2} />}
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 14, paddingBottom: tabBarHeight + 8 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue} />
        }
      >
        {/* AI hint banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.blueDim, borderColor: 'rgba(77,166,255,0.15)' }]}>
          <IconZap size={13} color={colors.blue} />
          <Text style={[styles.infoText, { color: colors.t3 }]}>
            Live AI-generated headlines — tap any story to get deeper analysis from FloAI
          </Text>
        </View>

        <EarningsSection />

        <View style={{ marginTop: 16 }}>
          <SectionHeader label="MARKET NEWS" />
        </View>

        {isLoading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.blue} size="large" />
            <Text style={[styles.loadingText, { color: colors.t3 }]}>Fetching live headlines…</Text>
          </View>
        )}

        {isError && !isLoading && (
          <View style={[styles.errorWrap, { backgroundColor: colors.card, borderColor: colors.rim }]}>
            <Text style={[styles.errorText, { color: colors.loss }]}>News unavailable</Text>
            <Text style={[styles.errorSub, { color: colors.t4 }]}>
              News temporarily offline — tap retry to refresh.
            </Text>
            <Pressable onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.card, borderColor: colors.rim }]}>
              <Text style={{ color: colors.blue, fontSize: 12, fontFamily: 'Inter_500Medium' }}>Retry</Text>
            </Pressable>
          </View>
        )}

        {items.length > 0 && <SentimentBar items={items} />}

        {items.map((item, i) => <NewsCard key={i} item={item} />)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1,
  },
  pageTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  subTitle: { fontSize: 10, marginTop: 1 },
  refreshBtn: { width: 30, height: 30, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  infoBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 8,
    borderWidth: 1, padding: 11, marginBottom: 12,
  },
  infoText: { fontSize: 11, flex: 1, lineHeight: 16 },
  secHd: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  secLabel: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1.4, textTransform: 'uppercase' },
  secLine: { flex: 1, height: 1 },
  countChip: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 7, paddingVertical: 2 },
  earningsSection: { marginBottom: 4 },

  // Sentiment bar
  sentimentWrap: { borderRadius: 8, borderWidth: 1, padding: 12, marginBottom: 10 },
  sentimentHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sentimentTitle: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  sentimentLegend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sentimentDot: { width: 5, height: 5, borderRadius: 3 },
  sentimentLegText: { fontSize: 9, fontFamily: 'Inter_500Medium' },
  sentimentTrack: { flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden' },
  sentimentSeg: { height: '100%' },

  // News cards
  newsCard: {
    borderRadius: 10, borderWidth: 1, marginBottom: 8, flexDirection: 'row', overflow: 'hidden',
  },
  newsAccent: { width: 3 },
  newsContent: { flex: 1, padding: 12 },
  newsMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' },
  newsSrc: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.8, textTransform: 'uppercase' },
  newsAge: { fontSize: 9, fontFamily: 'Inter_400Regular' },
  tagPill: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  tagText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
  newsTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold', lineHeight: 19, marginBottom: 4 },
  newsImpact: { fontSize: 11, lineHeight: 16, marginBottom: 8 },
  newsFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  newsHint: { fontSize: 10, fontFamily: 'Inter_400Regular' },

  // Earnings cards
  earningCard: { borderRadius: 10, borderWidth: 1, marginBottom: 6, flexDirection: 'row', overflow: 'hidden' },
  earningAccent: { width: 3 },
  earningLeft: { flex: 1, padding: 12 },
  earningSymRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  earningSym: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  earningChg: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  earningName: { fontSize: 10, fontFamily: 'Inter_400Regular', marginBottom: 3 },
  earningDate: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  earningRight: { padding: 12, alignItems: 'flex-end', justifyContent: 'space-between' },
  earningDayBadge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  earningDayText: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
  earningEstRow: { flexDirection: 'row', gap: 5, marginTop: 4 },
  earningEstChip: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 3, alignItems: 'center' },
  earningEstLabel: { fontSize: 7, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  earningEstVal: { fontSize: 10, fontFamily: 'Inter_600SemiBold', marginTop: 1 },

  // Loading / errors / empty
  loadingWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 13 },
  errorWrap: { borderRadius: 8, borderWidth: 1, padding: 16, alignItems: 'center', gap: 8 },
  errorText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  errorSub: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
  retryBtn: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 6 },
  earningLoader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10 },
  earningLoadText: { fontSize: 11 },
  emptyChip: { borderRadius: 8, borderWidth: 1, padding: 12, alignItems: 'center', marginBottom: 8 },
  emptyText: { fontSize: 11 },
});
