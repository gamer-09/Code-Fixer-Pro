import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { chgDir, fmt, fmtChg, fmtMcap, useMarket } from '@/context/MarketContext';
import { useSettings } from '@/context/SettingsContext';
import { CRYPTOS } from '@/constants/marketData';

type SortKey = 'default' | 'change' | 'change_asc' | 'mcap' | 'price';
type Group = 'All' | 'Top' | 'DeFi' | 'Meme';

const GROUP_SYMS: Record<Group, string[] | null> = {
  All: null,
  Top: ['BTC-USD', 'ETH-USD', 'BNB-USD', 'SOL-USD', 'XRP-USD', 'ADA-USD', 'AVAX-USD', 'DOT-USD'],
  DeFi: ['LINK-USD', 'ATOM-USD', 'NEAR-USD', 'INJ-USD', 'OP-USD', 'ARB11841-USD', 'SUI20947-USD', 'APT21794-USD', 'ICP-USD', 'FIL-USD'],
  Meme: ['DOGE-USD', 'SHIB-USD', 'PEPE24478-USD', 'WIF-USD', 'BONK-USD', 'FLOKI-USD'],
};

function AnimatedLiveDot() {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return <Animated.View style={[styles.liveDot, { opacity: anim }]} />;
}

function DayRangeBar({
  low, high, current, color,
}: { low: number; high: number; current: number; color: string }) {
  const colors = useColors();
  if (!low || !high || high <= low) return null;
  const pct = Math.min(1, Math.max(0, (current - low) / (high - low)));
  return (
    <View style={styles.rangeWrap}>
      <View style={[styles.rangeTrack, { backgroundColor: colors.surface }]}>
        <View style={[styles.rangeFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
        <View style={[styles.rangeThumb, { left: `${pct * 100}%` as any, backgroundColor: color }]} />
      </View>
    </View>
  );
}

function CryptoRow({
  sym,
  label,
  name,
  color,
  expanded,
  onToggle,
}: {
  sym: string;
  label: string;
  name: string;
  color: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const colors = useColors();
  const { data } = useMarket();
  const { settings } = useSettings();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const chgCol = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.amber;
  const price = d?.regularMarketPrice;
  const priceStr = price == null ? '—' : price > 1000 ? `$${fmt(price, 0)}` : price < 0.01 ? `$${price.toFixed(6)}` : `$${fmt(price, settings.priceDecimals)}`;

  return (
    <Pressable onPress={onToggle}>
      {({ pressed }) => (
        <View style={[styles.rowWrap, { backgroundColor: pressed ? colors.surface : colors.card, borderColor: expanded ? color + '33' : colors.rim }]}>
          <View style={[styles.rowAccent, { backgroundColor: expanded ? color : 'transparent' }]} />
          <View style={styles.rowBody}>
            <View style={styles.rowMain}>
              {/* Icon + Name */}
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
                  <Text style={[styles.iconText, { color }]}>{label.slice(0, 2)}</Text>
                </View>
                <View style={styles.rowNames}>
                  <Text style={[styles.rowSym, { color: colors.t1 }]}>{label}</Text>
                  <Text style={[styles.rowName, { color: colors.t4 }]} numberOfLines={1}>{name}</Text>
                </View>
              </View>

              {/* Price + Change */}
              <View style={styles.rowRight}>
                <Text style={[styles.rowPrice, { color: colors.t1 }]}>{priceStr}</Text>
                <View style={[styles.changeBadge, { backgroundColor: dir === 'up' ? colors.gainDim : dir === 'dn' ? colors.lossDim : colors.amberDim }]}>
                  <Text style={[styles.changeText, { color: chgCol }]}>{d ? fmtChg(chg) : '—'}</Text>
                </View>
              </View>
            </View>

            {/* Day range bar */}
            {d && d.regularMarketDayLow != null && d.regularMarketDayHigh != null && (
              <DayRangeBar
                low={d.regularMarketDayLow}
                high={d.regularMarketDayHigh}
                current={d.regularMarketPrice}
                color={chgCol}
              />
            )}

            {/* Expanded detail */}
            {expanded && d && (
              <View style={[styles.expandPanel, { borderTopColor: colors.rim + '66' }]}>
                <View style={styles.expandGrid}>
                  <View style={styles.expandItem}>
                    <Text style={[styles.expandLabel, { color: colors.t4 }]}>OPEN</Text>
                    <Text style={[styles.expandVal, { color: colors.t2 }]}>
                      {d.regularMarketOpen != null ? (d.regularMarketOpen > 1000 ? `$${fmt(d.regularMarketOpen, 0)}` : `$${fmt(d.regularMarketOpen)}`) : '—'}
                    </Text>
                  </View>
                  <View style={styles.expandItem}>
                    <Text style={[styles.expandLabel, { color: colors.t4 }]}>24H HIGH</Text>
                    <Text style={[styles.expandVal, { color: colors.gain }]}>
                      {d.regularMarketDayHigh != null ? (d.regularMarketDayHigh > 1000 ? `$${fmt(d.regularMarketDayHigh, 0)}` : `$${fmt(d.regularMarketDayHigh)}`) : '—'}
                    </Text>
                  </View>
                  <View style={styles.expandItem}>
                    <Text style={[styles.expandLabel, { color: colors.t4 }]}>24H LOW</Text>
                    <Text style={[styles.expandVal, { color: colors.loss }]}>
                      {d.regularMarketDayLow != null ? (d.regularMarketDayLow > 1000 ? `$${fmt(d.regularMarketDayLow, 0)}` : `$${fmt(d.regularMarketDayLow)}`) : '—'}
                    </Text>
                  </View>
                  <View style={styles.expandItem}>
                    <Text style={[styles.expandLabel, { color: colors.t4 }]}>MKT CAP</Text>
                    <Text style={[styles.expandVal, { color: colors.amber }]}>{fmtMcap(d.marketCap, settings.compactNumbers)}</Text>
                  </View>
                  <View style={styles.expandItem}>
                    <Text style={[styles.expandLabel, { color: colors.t4 }]}>PREV CLOSE</Text>
                    <Text style={[styles.expandVal, { color: colors.t2 }]}>
                      {d.regularMarketPreviousClose != null ? (d.regularMarketPreviousClose > 1000 ? `$${fmt(d.regularMarketPreviousClose, 0)}` : `$${fmt(d.regularMarketPreviousClose)}`) : '—'}
                    </Text>
                  </View>
                  <View style={styles.expandItem}>
                    <Text style={[styles.expandLabel, { color: colors.t4 }]}>ABS CHANGE</Text>
                    <Text style={[styles.expandVal, { color: chgCol }]}>
                      {d.regularMarketChange != null ? (d.regularMarketChange >= 0 ? '+' : '') + (d.regularMarketChange > 100 ? fmt(d.regularMarketChange, 0) : fmt(d.regularMarketChange)) : '—'}
                    </Text>
                  </View>
                </View>
                {d.fiftyTwoWeekHigh != null && d.fiftyTwoWeekLow != null && (
                  <Text style={[styles.weekRange, { color: colors.t4 }]}>
                    52W  {d.fiftyTwoWeekLow > 1000 ? `$${fmt(d.fiftyTwoWeekLow, 0)}` : `$${fmt(d.fiftyTwoWeekLow)}`}
                    {'  –  '}
                    {d.fiftyTwoWeekHigh > 1000 ? `$${fmt(d.fiftyTwoWeekHigh, 0)}` : `$${fmt(d.fiftyTwoWeekHigh)}`}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function CryptoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data } = useMarket();
  const { settings } = useSettings();
  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const tabBarHeight = useBottomTabBarHeight();

  const [sortKey, setSortKey] = useState<SortKey>('default');
  const [group, setGroup] = useState<Group>('All');
  const [expandedSym, setExpandedSym] = useState<string | null>(null);

  const GROUPS: Group[] = ['All', 'Top', 'DeFi', 'Meme'];
  const SORTS: { key: SortKey; label: string }[] = [
    { key: 'default', label: 'Default' },
    { key: 'change', label: '% ↓' },
    { key: 'change_asc', label: '% ↑' },
    { key: 'mcap', label: 'MCap' },
  ];

  const filteredAndSorted = useMemo(() => {
    let list = [...CRYPTOS];
    const allowed = GROUP_SYMS[group];
    if (allowed) list = list.filter((c) => allowed.includes(c.sym));
    if (sortKey === 'change') list.sort((a, b) => (data[b.sym]?.regularMarketChangePercent ?? 0) - (data[a.sym]?.regularMarketChangePercent ?? 0));
    else if (sortKey === 'change_asc') list.sort((a, b) => (data[a.sym]?.regularMarketChangePercent ?? 0) - (data[b.sym]?.regularMarketChangePercent ?? 0));
    else if (sortKey === 'mcap') list.sort((a, b) => (data[b.sym]?.marketCap ?? 0) - (data[a.sym]?.marketCap ?? 0));
    else if (sortKey === 'price') list.sort((a, b) => (data[b.sym]?.regularMarketPrice ?? 0) - (data[a.sym]?.regularMarketPrice ?? 0));
    return list;
  }, [CRYPTOS, data, sortKey, group]);

  const loaded = CRYPTOS.filter((c) => data[c.sym]);
  const up = loaded.filter((c) => (data[c.sym]?.regularMarketChangePercent ?? 0) > 0).length;
  const dn = loaded.filter((c) => (data[c.sym]?.regularMarketChangePercent ?? 0) < 0).length;
  const flat = loaded.length - up - dn;
  const totalCap = loaded.reduce((acc, c) => acc + (data[c.sym]?.marketCap ?? 0), 0);
  const btcCap = data['BTC-USD']?.marketCap ?? 0;
  const btcDom = totalCap > 0 ? (btcCap / totalCap) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <View>
          <Text style={[styles.pageTitle, { color: colors.t1 }]}>Crypto</Text>
          <Text style={[styles.subTitle, { color: colors.t4 }]}>{filteredAndSorted.length} assets</Text>
        </View>
        <View style={[styles.liveChip, { backgroundColor: colors.gainDim, borderColor: 'rgba(0,229,160,0.2)' }]}>
          <AnimatedLiveDot />
          <Text style={[styles.liveText, { color: colors.gain }]}>LIVE</Text>
        </View>
      </View>

      {/* Stats strip */}
      {loaded.length > 0 && (
        <View style={[styles.statsStrip, { backgroundColor: colors.card, borderBottomColor: colors.rim }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.gain }]}>{up}</Text>
            <Text style={[styles.statLabel, { color: colors.t4 }]}>Gaining</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: colors.rim }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.loss }]}>{dn}</Text>
            <Text style={[styles.statLabel, { color: colors.t4 }]}>Declining</Text>
          </View>
          <View style={[styles.statDiv, { backgroundColor: colors.rim }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: colors.amber }]}>{flat}</Text>
            <Text style={[styles.statLabel, { color: colors.t4 }]}>Flat</Text>
          </View>
          {totalCap > 0 && (
            <>
              <View style={[styles.statDiv, { backgroundColor: colors.rim }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.t1 }]}>{fmtMcap(totalCap, settings.compactNumbers)}</Text>
                <Text style={[styles.statLabel, { color: colors.t4 }]}>Total Cap</Text>
              </View>
              <View style={[styles.statDiv, { backgroundColor: colors.rim }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statVal, { color: colors.amber }]}>{btcDom.toFixed(1)}%</Text>
                <Text style={[styles.statLabel, { color: colors.t4 }]}>BTC Dom.</Text>
              </View>
            </>
          )}
        </View>
      )}

      {/* Group + Sort filters */}
      <View style={[styles.controls, { backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <View style={styles.controlRow}>
          {GROUPS.map((g) => (
            <Pressable
              key={g}
              onPress={() => setGroup(g)}
              style={[styles.filterChip, { backgroundColor: group === g ? colors.blue : colors.card, borderColor: group === g ? colors.blue : colors.rim }]}
            >
              <Text style={[styles.filterText, { color: group === g ? '#fff' : colors.t3 }]}>{g}</Text>
            </Pressable>
          ))}
          <View style={[styles.controlDivider, { backgroundColor: colors.rim }]} />
          {SORTS.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setSortKey(s.key)}
              style={[styles.filterChip, { backgroundColor: sortKey === s.key ? colors.surface : 'transparent', borderColor: sortKey === s.key ? colors.rim : 'transparent' }]}
            >
              <Text style={[styles.filterText, { color: sortKey === s.key ? colors.t1 : colors.t4 }]}>{s.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filteredAndSorted}
        keyExtractor={(c) => c.sym}
        contentContainerStyle={{ padding: 10, gap: 4, paddingBottom: tabBarHeight + 8 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: c }) => (
          <CryptoRow
            sym={c.sym}
            label={c.label}
            name={c.name}
            color={c.color}
            expanded={expandedSym === c.sym}
            onToggle={() => setExpandedSym((prev) => (prev === c.sym ? null : c.sym))}
          />
        )}
      />
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
  liveChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20,
    borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#00E5A0' },
  liveText: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  statsStrip: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 8, fontFamily: 'Inter_500Medium', marginTop: 1, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDiv: { width: 1, height: 24 },
  controls: { paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1 },
  controlRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'nowrap' },
  filterChip: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  filterText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  controlDivider: { width: 1, height: 18, marginHorizontal: 4 },

  // Row
  rowWrap: {
    borderRadius: 10, borderWidth: 1, flexDirection: 'row', overflow: 'hidden', marginBottom: 0,
  },
  rowAccent: { width: 3 },
  rowBody: { flex: 1, padding: 12 },
  rowMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  rowNames: { flex: 1 },
  rowSym: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  rowName: { fontSize: 10, marginTop: 2 },
  rowRight: { alignItems: 'flex-end', gap: 4, minWidth: 90 },
  rowPrice: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  changeBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
  changeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },

  // Range bar
  rangeWrap: { marginTop: 8 },
  rangeTrack: { height: 3, borderRadius: 2, overflow: 'visible' },
  rangeFill: { height: '100%', borderRadius: 2 },
  rangeThumb: { position: 'absolute', top: -2.5, width: 8, height: 8, borderRadius: 4, marginLeft: -4 },

  // Expand panel
  expandPanel: { marginTop: 10, paddingTop: 10, borderTopWidth: 1 },
  expandGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  expandItem: { width: '30%', minWidth: 80 },
  expandLabel: { fontSize: 7, fontFamily: 'Inter_700Bold', letterSpacing: 0.8, marginBottom: 3, textTransform: 'uppercase' },
  expandVal: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  weekRange: { fontSize: 9, fontFamily: 'Inter_500Medium', marginTop: 10 },
});
