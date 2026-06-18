import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { chgDir, fmt, fmtChg, fmtMcap, useMarket } from '@/context/MarketContext';
import { COMMODITIES, FOREX, INDICES, STOCKS } from '@/constants/marketData';

function LivePulse() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.3, duration: 1200, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: '#00E5A0', shadowColor: '#00E5A0', shadowOpacity: 0.8, shadowRadius: 6, elevation: 4 }, { opacity: anim }]} />
  );
}

function SectionHeader({ label, count }: { label: string; count?: number }) {
  const colors = useColors();
  return (
    <View style={styles.secHd}>
      <Text style={[styles.secLabel, { color: colors.t3 }]}>{label}</Text>
      {count != null && (
        <View style={[styles.secCount, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={{ color: colors.t4, fontSize: 9, fontFamily: 'Inter_500Medium' }}>{count}</Text>
        </View>
      )}
      <View style={[styles.secLine, { backgroundColor: colors.rim }]} />
    </View>
  );
}

function ChangeBadge({ value }: { value: number | null | undefined }) {
  const colors = useColors();
  const dir = chgDir(value);
  const bg = dir === 'up' ? colors.gainDim : dir === 'dn' ? colors.lossDim : colors.amberDim;
  const col = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.amber;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: col }]}>{fmtChg(value)}</Text>
    </View>
  );
}

function IndexCard({ sym, name, region }: { sym: string; name: string; region: string }) {
  const colors = useColors();
  const { data } = useMarket();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const accent = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.rim;

  return (
    <View style={[styles.idxCard, { backgroundColor: colors.card, borderColor: colors.rim, borderBottomColor: d ? accent : colors.rim }]}>
      <Text style={[styles.idxRegion, { color: colors.t3 }]}>{region}</Text>
      <Text style={[styles.idxName, { color: colors.t1 }]} numberOfLines={1}>{name}</Text>
      <Text style={[styles.idxPrice, { color: colors.t1 }]}>
        {d ? fmt(d.regularMarketPrice) : '—'}
      </Text>
      {d && <ChangeBadge value={chg} />}
    </View>
  );
}

function ForexChip({ sym, label }: { sym: string; label: string }) {
  const colors = useColors();
  const { data } = useMarket();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const col = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.amber;

  return (
    <View style={[styles.fxChip, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <Text style={[styles.fxPair, { color: colors.t2 }]}>{label}</Text>
      <Text style={[styles.fxRate, { color: colors.t1 }]}>
        {d ? fmt(d.regularMarketPrice, 4) : '—'}
      </Text>
      {d && (
        <View style={[styles.badge, { backgroundColor: dir === 'up' ? colors.gainDim : dir === 'dn' ? colors.lossDim : colors.amberDim }]}>
          <Text style={{ color: col, fontSize: 9, fontFamily: 'Inter_500Medium' }}>{fmtChg(chg)}</Text>
        </View>
      )}
    </View>
  );
}

function CommodityCard({ sym, label, unit }: { sym: string; label: string; unit: string }) {
  const colors = useColors();
  const { data } = useMarket();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  return (
    <View style={[styles.comCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <Text style={[styles.comName, { color: colors.t3 }]}>{label}</Text>
      <Text style={[styles.comPrice, { color: colors.amber }]}>{d ? fmt(d.regularMarketPrice) : '—'}</Text>
      <Text style={[styles.comUnit, { color: colors.t4 }]}>{unit}</Text>
      {d && <ChangeBadge value={chg} />}
    </View>
  );
}

function StockRow({ sym, name }: { sym: string; name: string }) {
  const colors = useColors();
  const { data } = useMarket();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const chgColor = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.t2;

  return (
    <View style={[styles.stockRow, { borderBottomColor: colors.rim }]}>
      <View style={styles.stockInfo}>
        <Text style={[styles.stockSym, { color: colors.t1 }]}>{sym}</Text>
        <Text style={[styles.stockName, { color: colors.t4 }]}>{name}</Text>
      </View>
      <Text style={[styles.stockPrice, { color: colors.t1 }]}>{d ? `$${fmt(d.regularMarketPrice)}` : '—'}</Text>
      <Text style={[styles.stockChg, { color: chgColor }]}>{d ? fmtChg(chg) : '—'}</Text>
      <Text style={[styles.stockMcap, { color: colors.t3 }]}>{d ? fmtMcap(d.marketCap) : '—'}</Text>
    </View>
  );
}

export default function MarketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loading, lastUpdated, refresh } = useMarket();
  const [clock, setClock] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const h = String(now.getUTCHours()).padStart(2, '0');
      const m = String(now.getUTCMinutes()).padStart(2, '0');
      const s = String(now.getUTCSeconds()).padStart(2, '0');
      setClock(`${h}:${m}:${s} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <View style={styles.logoRow}>
          <LivePulse />
          <Text style={[styles.logoText, { color: colors.t1 }]}>FloBoard</Text>
          <View style={[styles.liveChip, { backgroundColor: colors.gainDim, borderColor: 'rgba(0,229,160,0.2)' }]}>
            <Text style={[styles.liveText, { color: colors.gain }]}>LIVE</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.clock, { color: colors.t3 }]}>{clock}</Text>
          <Pressable
            onPress={refresh}
            disabled={loading}
            style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.rim }]}
          >
            {loading
              ? <ActivityIndicator size="small" color={colors.blue} />
              : <Feather name="refresh-cw" size={13} color={colors.t2} />}
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: Platform.OS === 'web' ? 84 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Indices */}
        <View style={styles.section}>
          <SectionHeader label="Global Indices" count={INDICES.length} />
          <View style={styles.idxGrid}>
            {INDICES.map((idx) => (
              <IndexCard key={idx.sym} {...idx} />
            ))}
          </View>
        </View>

        {/* Forex */}
        <View style={styles.section}>
          <SectionHeader label="Foreign Exchange" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {FOREX.map((fx) => (
              <ForexChip key={fx.sym} {...fx} />
            ))}
          </ScrollView>
        </View>

        {/* Commodities */}
        <View style={styles.section}>
          <SectionHeader label="Commodities" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {COMMODITIES.map((c) => (
              <CommodityCard key={c.sym} {...c} />
            ))}
          </ScrollView>
        </View>

        {/* Stocks */}
        <View style={styles.section}>
          <SectionHeader label="Major Stocks" count={STOCKS.length} />
          <View style={[styles.tableWrap, { backgroundColor: colors.card, borderColor: colors.rim }]}>
            <View style={[styles.tableHead, { backgroundColor: colors.surface, borderBottomColor: colors.rim }]}>
              <Text style={[styles.thText, { color: colors.t3, flex: 2 }]}>COMPANY</Text>
              <Text style={[styles.thText, { color: colors.t3, flex: 1, textAlign: 'right' }]}>PRICE</Text>
              <Text style={[styles.thText, { color: colors.t3, flex: 1, textAlign: 'right' }]}>CHG%</Text>
              <Text style={[styles.thText, { color: colors.t3, flex: 1.2, textAlign: 'right' }]}>MKT CAP</Text>
            </View>
            {STOCKS.map((s, i) => (
              <View key={s.sym} style={i < STOCKS.length - 1 ? undefined : { borderBottomWidth: 0 }}>
                <StockRow sym={s.sym} name={s.name} />
              </View>
            ))}
          </View>
        </View>

        {lastUpdated && (
          <Text style={[styles.updated, { color: colors.t4 }]}>
            Updated {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
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
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: -0.3 },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  liveText: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clock: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  refreshBtn: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 14, marginTop: 14 },
  secHd: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  secLabel: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1.4, textTransform: 'uppercase' },
  secCount: {
    borderRadius: 3,
    borderWidth: 1,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  secLine: { flex: 1, height: 1 },
  idxGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  idxCard: {
    width: '47.5%',
    borderRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 2,
    padding: 11,
  },
  idxRegion: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  idxName: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 6 },
  idxPrice: { fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: -0.5, marginBottom: 4 },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  hScroll: { paddingRight: 14, gap: 6 },
  fxChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  fxPair: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 },
  fxRate: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  comCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 11,
    minWidth: 110,
  },
  comName: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  comPrice: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  comUnit: { fontSize: 8, marginBottom: 6 },
  tableWrap: { borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 1 },
  thText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase' },
  stockRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1 },
  stockInfo: { flex: 2 },
  stockSym: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  stockName: { fontSize: 9, marginTop: 1 },
  stockPrice: { flex: 1, fontSize: 12, fontFamily: 'Inter_500Medium', textAlign: 'right' },
  stockChg: { flex: 1, fontSize: 11, fontFamily: 'Inter_500Medium', textAlign: 'right' },
  stockMcap: { flex: 1.2, fontSize: 11, textAlign: 'right' },
  updated: { textAlign: 'center', fontSize: 10, marginTop: 12, marginBottom: 4 },
});
