import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { IconRefreshCw, IconTrendingUp, IconZap } from '@/components/Icons';
import { useColors } from '@/hooks/useColors';
import { useSettings } from '@/context/SettingsContext';
import { fmt, fmtChg, chgDir } from '@/context/MarketContext';

const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;

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

function makeFetchNews(count: number) {
  return async (): Promise<NewsItem[]> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 12000);
    try {
      const res = await fetch(`${BASE}/api/news?count=${count}`, { signal: controller.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json() as { news: NewsItem[] };
      return data.news ?? [];
    } finally {
      clearTimeout(timer);
    }
  };
}

async function fetchEarnings(): Promise<EarningItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${BASE}/api/earnings`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { earnings: EarningItem[] };
    return data.earnings ?? [];
  } finally {
    clearTimeout(timer);
  }
}

function TagBadge({ tag }: { tag: NewsTag }) {
  const colors = useColors();
  const bg = tag === 'bull' ? colors.gainDim : tag === 'bear' ? colors.lossDim : colors.amberDim;
  const col = tag === 'bull' ? colors.gain : tag === 'bear' ? colors.loss : colors.amber;
  const label = tag === 'bull' ? 'BULLISH' : tag === 'bear' ? 'BEARISH' : 'NEUTRAL';
  return (
    <View style={[styles.tagBadge, { backgroundColor: bg }]}>
      <Text style={[styles.tagText, { color: col }]}>{label}</Text>
    </View>
  );
}

function NewsCard({ item }: { item: NewsItem }) {
  const colors = useColors();
  const handlePress = () => {
    const q = `Explain this news story and what it means for markets and personal investors: ${item.title}`;
    router.navigate({ pathname: '/(tabs)/advisor', params: { q } });
  };
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.newsCard,
        { backgroundColor: colors.card, borderColor: pressed ? colors.rim2 : colors.rim },
        pressed && { opacity: 0.88 },
      ]}
    >
      <View style={styles.newsMeta}>
        <Text style={[styles.newsSrc, { color: colors.t3 }]}>{item.src}</Text>
        <Text style={[styles.newsAge, { color: colors.t4 }]}>{item.age} ago</Text>
        <TagBadge tag={item.tag} />
      </View>
      <Text style={[styles.newsTitle, { color: colors.t1 }]}>{item.title}</Text>
      <Text style={[styles.newsImpact, { color: colors.t3 }]}>{item.impact}</Text>
      <View style={styles.newsHintRow}>
        <IconTrendingUp size={11} color={colors.t4} />
        <Text style={[styles.newsHint, { color: colors.t4 }]}>Tap to ask AI for analysis</Text>
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
  const urgency = days === 0 ? colors.amber : days <= 3 ? colors.blue : colors.t4;
  const label = isPast ? 'Reported' : days === 0 ? 'TODAY' : days === 1 ? 'Tomorrow' : `In ${days}d`;

  const handlePress = () => {
    const q = `${item.sym} earnings report: what are analysts expecting and what should investors watch for?`;
    router.navigate({ pathname: '/(tabs)/advisor', params: { q } });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.earningCard,
        { backgroundColor: colors.card, borderColor: pressed ? colors.rim2 : colors.rim },
        pressed && { opacity: 0.88 },
      ]}
    >
      <View style={styles.earningLeft}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[styles.earningSym, { color: colors.t1 }]}>{item.sym}</Text>
          {item.changePct != null && (
            <Text style={[styles.earningChg, { color: chgColor }]}>{fmtChg(item.changePct)}</Text>
          )}
        </View>
        <Text style={[styles.earningName, { color: colors.t4 }]} numberOfLines={1}>{item.name}</Text>
        <Text style={[styles.earningDate, { color: colors.t3 }]}>{formatEarningsDate(item.date)}</Text>
      </View>
      <View style={styles.earningRight}>
        <View style={[styles.earningDayBadge, { backgroundColor: days === 0 ? colors.amberDim : colors.blueDim, borderColor: days === 0 ? 'rgba(255,180,0,0.2)' : 'rgba(77,166,255,0.15)' }]}>
          <Text style={[styles.earningDayText, { color: urgency }]}>{label}</Text>
        </View>
        {item.epsEst != null && (
          <Text style={[styles.earningEps, { color: colors.t4 }]}>EPS est: {item.epsEst > 0 ? '+' : ''}{item.epsEst.toFixed(2)}</Text>
        )}
        {item.revenueEst != null && (
          <Text style={[styles.earningRev, { color: colors.t4 }]}>Rev est: {fmtRevenue(item.revenueEst)}</Text>
        )}
      </View>
    </Pressable>
  );
}

function EarningsSection() {
  const colors = useColors();
  const { data: earnings, isLoading, isError } = useQuery({
    queryKey: ['earnings'],
    queryFn: fetchEarnings,
    staleTime: 1000 * 60 * 30,
    retry: 1,
  });

  if (isError) return null;

  return (
    <View>
      <View style={styles.secHd}>
        <Text style={[styles.secLabel, { color: colors.t3 }]}>EARNINGS CALENDAR</Text>
        {earnings?.length != null && (
          <View style={[styles.countChip, { backgroundColor: colors.card, borderColor: colors.rim }]}>
            <Text style={{ color: colors.t4, fontSize: 9, fontFamily: 'Inter_500Medium' }}>{earnings.length} upcoming</Text>
          </View>
        )}
        <View style={[styles.secLine, { backgroundColor: colors.rim }]} />
      </View>

      {isLoading && (
        <View style={styles.earningLoader}>
          <ActivityIndicator size="small" color={colors.blue} />
          <Text style={[styles.earningLoadText, { color: colors.t4 }]}>Loading earnings…</Text>
        </View>
      )}

      {!isLoading && earnings?.length === 0 && (
        <Text style={[styles.earningEmpty, { color: colors.t4 }]}>No major earnings in the next 3 weeks.</Text>
      )}

      {earnings?.map((item) => <EarningCard key={`${item.sym}-${item.date}`} item={item} />)}
    </View>
  );
}

export default function NewsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, StatusBar.currentHeight ?? 0);
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
        <Text style={[styles.pageTitle, { color: colors.t1 }]}>News</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {!isLoading && (
            <View style={[styles.countChip, { backgroundColor: colors.card, borderColor: colors.rim }]}>
              <Text style={{ color: colors.t3, fontSize: 10, fontFamily: 'Inter_500Medium' }}>
                {items.length} stories
              </Text>
            </View>
          )}
          <Pressable
            onPress={() => refetch()}
            style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.rim }]}
          >
            {isFetching
              ? <ActivityIndicator size="small" color={colors.blue} />
              : <IconRefreshCw size={13} color={colors.t2} />}
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 14, paddingBottom: Platform.OS === 'web' ? 84 : 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.blue} />
        }
      >
        <View style={[styles.infoBanner, { backgroundColor: colors.blueDim, borderColor: 'rgba(77,166,255,0.15)' }]}>
          <IconZap size={13} color={colors.blue} />
          <Text style={[styles.infoText, { color: colors.t3 }]}>
            Live headlines — tap any story to ask FloAI for deeper analysis
          </Text>
        </View>

        <EarningsSection />

        <View style={[styles.secHd, { marginTop: 16 }]}>
          <Text style={[styles.secLabel, { color: colors.t3 }]}>MARKET NEWS</Text>
          <View style={[styles.secLine, { backgroundColor: colors.rim }]} />
        </View>

        {isLoading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.blue} size="large" />
            <Text style={[styles.loadingText, { color: colors.t3 }]}>Fetching live news…</Text>
          </View>
        )}

        {isError && !isLoading && (
          <View style={[styles.errorWrap, { backgroundColor: colors.card, borderColor: colors.rim }]}>
            <Text style={[styles.errorText, { color: colors.loss }]}>Failed to load news</Text>
            <Pressable onPress={() => refetch()} style={[styles.retryBtn, { backgroundColor: colors.card, borderColor: colors.rim }]}>
              <Text style={{ color: colors.blue, fontSize: 12 }}>Retry</Text>
            </Pressable>
          </View>
        )}

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
  countChip: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  refreshBtn: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  infoBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 8, borderWidth: 1, padding: 10, marginBottom: 10 },
  infoText: { fontSize: 11, flex: 1, lineHeight: 16 },
  secHd: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  secLabel: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1.4, textTransform: 'uppercase' },
  secLine: { flex: 1, height: 1 },
  loadingWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 13 },
  errorWrap: { borderRadius: 8, borderWidth: 1, padding: 16, alignItems: 'center', gap: 10 },
  errorText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  retryBtn: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 6 },
  newsCard: { borderRadius: 8, borderWidth: 1, padding: 12, marginBottom: 8 },
  newsMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  newsSrc: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.8, textTransform: 'uppercase' },
  newsAge: { fontSize: 8, fontFamily: 'Inter_400Regular' },
  tagBadge: { borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 },
  tagText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  newsTitle: { fontSize: 13, fontFamily: 'Inter_500Medium', lineHeight: 19, marginBottom: 4 },
  newsImpact: { fontSize: 11, lineHeight: 16, marginBottom: 6 },
  newsHintRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  newsHint: { fontSize: 10 },
  // Earnings
  earningLoader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 12 },
  earningLoadText: { fontSize: 11 },
  earningEmpty: { fontSize: 11, paddingVertical: 10, paddingBottom: 14 },
  earningCard: { borderRadius: 8, borderWidth: 1, padding: 12, marginBottom: 6, flexDirection: 'row', justifyContent: 'space-between' },
  earningLeft: { flex: 1, gap: 2 },
  earningSym: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  earningChg: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  earningName: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  earningDate: { fontSize: 10, fontFamily: 'Inter_500Medium', marginTop: 2 },
  earningRight: { alignItems: 'flex-end', gap: 4 },
  earningDayBadge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3 },
  earningDayText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  earningEps: { fontSize: 9, fontFamily: 'Inter_400Regular' },
  earningRev: { fontSize: 9, fontFamily: 'Inter_400Regular' },
});
