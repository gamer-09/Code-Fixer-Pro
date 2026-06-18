import React from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { NEWS } from '@/constants/marketData';

type NewsTag = 'bull' | 'bear' | 'neutral';

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

function NewsCard({ item }: { item: (typeof NEWS)[0] }) {
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
        <Feather name="trending-up" size={11} color={colors.t4} />
        <Text style={[styles.newsHint, { color: colors.t4 }]}>Tap to ask AI for analysis</Text>
      </View>
    </Pressable>
  );
}

export default function NewsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <Text style={[styles.pageTitle, { color: colors.t1 }]}>News</Text>
        <View style={[styles.countChip, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={{ color: colors.t3, fontSize: 10, fontFamily: 'Inter_500Medium' }}>{NEWS.length} stories</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 14, paddingBottom: Platform.OS === 'web' ? 84 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.infoBanner, { backgroundColor: colors.blueDim, borderColor: 'rgba(77,166,255,0.15)' }]}>
          <Feather name="zap" size={13} color={colors.blue} />
          <Text style={[styles.infoText, { color: colors.t3 }]}>
            Tap any headline to ask the AI advisor for deeper analysis
          </Text>
        </View>

        {NEWS.map((item, i) => (
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
