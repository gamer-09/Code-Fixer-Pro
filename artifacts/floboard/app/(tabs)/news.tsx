import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { IconRefreshCw, IconTrendingUp, IconZap } from '@/components/Icons';
import { useColors } from '@/hooks/useColors';

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

async function fetchNews(): Promise<NewsItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${BASE}/api/news`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json() as { news: NewsItem[] };
    return data.news ?? [];
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

export default function NewsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const [refreshing, setRefreshing] = useState(false);

  const { data: news, isLoading, isError, refetch } = useQuery({
    queryKey: ['news'],
    queryFn: fetchNews,
    staleTime: 5 * 60 * 1000,
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
            {isLoading
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

        {items.map((item, i) => (
          <NewsCard key={i} item={item} />
        ))}
      </ScrollView>
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
  countChip: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3 },
  refreshBtn: {
    width: 28, height: 28, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
  },
  infoText: { fontSize: 11, flex: 1, lineHeight: 16 },
  loadingWrap: { alignItems: 'center', paddingVertical: 40, gap: 12 },
  loadingText: { fontSize: 13 },
  errorWrap: { borderRadius: 8, borderWidth: 1, padding: 16, alignItems: 'center', gap: 10 },
  errorText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  retryBtn: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 6 },
  newsCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  newsMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  newsSrc: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.8, textTransform: 'uppercase' },
  newsAge: { fontSize: 8, fontFamily: 'Inter_400Regular' },
  tagBadge: { borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 },
  tagText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  newsTitle: { fontSize: 13, fontFamily: 'Inter_500Medium', lineHeight: 19, marginBottom: 4 },
  newsImpact: { fontSize: 11, lineHeight: 16, marginBottom: 6 },
  newsHintRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  newsHint: { fontSize: 10 },
});
