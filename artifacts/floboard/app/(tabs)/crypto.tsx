import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { chgDir, fmt, fmtChg, fmtMcap, useMarket } from '@/context/MarketContext';
import { CRYPTOS } from '@/constants/marketData';

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

function CryptoCard({ sym, label, name, color }: { sym: string; label: string; name: string; color: string }) {
  const colors = useColors();
  const { data } = useMarket();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const chgBg = dir === 'up' ? colors.gainDim : dir === 'dn' ? colors.lossDim : colors.amberDim;
  const chgCol = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.amber;
  const price = d?.regularMarketPrice;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <View style={styles.cardHd}>
        <View style={[styles.iconBox, { backgroundColor: color + '22' }]}>
          <Text style={[styles.iconText, { color }]}>{label.slice(0, 2)}</Text>
        </View>
        {d && (
          <View style={[styles.badge, { backgroundColor: chgBg }]}>
            <Text style={[styles.badgeText, { color: chgCol }]}>{fmtChg(chg)}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.symLabel, { color: colors.t3 }]}>{label} · {name}</Text>
      <Text style={[styles.price, { color: colors.t1 }]}>
        {price != null ? (price > 999 ? `$${fmt(price, 0)}` : `$${fmt(price)}`) : '—'}
      </Text>
      <Text style={[styles.mcap, { color: colors.t4 }]}>
        {d ? `Mkt cap: ${fmtMcap(d.marketCap)}` : ''}
      </Text>
    </View>
  );
}

export default function CryptoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data } = useMarket();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

  const btc = data['BTC-USD'];
  const eth = data['ETH-USD'];

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <Text style={[styles.pageTitle, { color: colors.t1 }]}>Crypto</Text>
        <View style={[styles.liveChip, { backgroundColor: colors.gainDim, borderColor: 'rgba(0,229,160,0.2)' }]}>
          <View style={[styles.liveDot, { backgroundColor: colors.gain }]} />
          <Text style={[styles.liveText, { color: colors.gain }]}>LIVE</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 14, paddingBottom: Platform.OS === 'web' ? 84 : 100 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader label="Cryptocurrency Markets" count={CRYPTOS.length} />
        <View style={styles.grid}>
          {CRYPTOS.map((c) => (
            <CryptoCard key={c.sym} {...c} />
          ))}
        </View>

        {(btc || eth) && (
          <>
            <SectionHeader label="Market Context" />
            <View style={[styles.contextCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
              {btc && (
                <Text style={[styles.contextText, { color: colors.t2 }]}>
                  <Text style={{ color: colors.t1, fontFamily: 'Inter_600SemiBold' }}>Bitcoin</Text>
                  {' '}is trading at{' '}
                  <Text style={{ color: colors.amber, fontFamily: 'Inter_600SemiBold' }}>${fmt(btc.regularMarketPrice, 0)}</Text>
                  {' '}— {btc.regularMarketChangePercent >= 0 ? 'up' : 'down'}{' '}
                  {Math.abs(btc.regularMarketChangePercent).toFixed(2)}% today.
                </Text>
              )}
              {eth && (
                <Text style={[styles.contextText, { color: colors.t2, marginTop: 6 }]}>
                  <Text style={{ color: colors.t1, fontFamily: 'Inter_600SemiBold' }}>Ethereum</Text>
                  {' '}sits at{' '}
                  <Text style={{ color: colors.amber, fontFamily: 'Inter_600SemiBold' }}>${fmt(eth.regularMarketPrice)}</Text>.
                </Text>
              )}
              <Text style={[styles.contextHint, { color: colors.t3 }]}>
                Tap any quick question in the Advisor tab to get AI context on what these moves mean.
              </Text>
            </View>
          </>
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
  pageTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: { width: 5, height: 5, borderRadius: 3 },
  liveText: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  scroll: { flex: 1 },
  secHd: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  secLabel: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1.4, textTransform: 'uppercase' },
  secCount: { borderRadius: 3, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },
  secLine: { flex: 1, height: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  card: {
    width: '47.5%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
  },
  cardHd: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  iconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontFamily: 'Inter_500Medium' },
  symLabel: { fontSize: 9, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.5, marginBottom: 3 },
  price: { fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: -0.5, marginBottom: 4 },
  mcap: { fontSize: 9, fontFamily: 'Inter_400Regular' },
  contextCard: { borderRadius: 8, borderWidth: 1, padding: 14, marginBottom: 10 },
  contextText: { fontSize: 13, lineHeight: 20 },
  contextHint: { fontSize: 11, marginTop: 10, lineHeight: 17 },
});
