import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconRefreshCw } from '@/components/Icons';
import { useColors } from '@/hooks/useColors';
import { chgDir, fmt, fmtChg, fmtMcap, useMarket } from '@/context/MarketContext';
import { useSettings } from '@/context/SettingsContext';
import { BONDS, COMMODITIES, FOREX, INDICES, MACRO, SECTORS, STOCKS } from '@/constants/marketData';

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
    <Animated.View style={[styles.pulse, { opacity: anim }]} />
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

// ── FEATURE 1: Market Hours ────────────────────────────────────────────────

const EXCHANGES = [
  { name: 'NYSE', tz: 'America/New_York', oh: 9, om: 30, ch: 16, cm: 0 },
  { name: 'LSE', tz: 'Europe/London', oh: 8, om: 0, ch: 16, cm: 30 },
  { name: 'TSE', tz: 'Asia/Tokyo', oh: 9, om: 0, ch: 15, cm: 30 },
  { name: 'SSE', tz: 'Asia/Shanghai', oh: 9, om: 30, ch: 15, cm: 0 },
  { name: 'BSE', tz: 'Asia/Kolkata', oh: 9, om: 15, ch: 15, cm: 30 },
  { name: 'ASX', tz: 'Australia/Sydney', oh: 10, om: 0, ch: 16, cm: 0 },
];

function isOpen(tz: string, oh: number, om: number, ch: number, cm: number): boolean {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      weekday: 'short',
      hour12: false,
    }).formatToParts(new Date());
    const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';
    if (weekday === 'Sat' || weekday === 'Sun') return false;
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0');
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0');
    const now = h * 60 + m;
    return now >= oh * 60 + om && now < ch * 60 + cm;
  } catch {
    return false;
  }
}

function MarketHoursSection() {
  const colors = useColors();
  const [statuses, setStatuses] = useState<boolean[]>([]);

  useEffect(() => {
    const update = () => setStatuses(EXCHANGES.map((e) => isOpen(e.tz, e.oh, e.om, e.ch, e.cm)));
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  const open = statuses.filter(Boolean).length;

  return (
    <View style={styles.section}>
      <SectionHeader label={`Market Hours — ${open} of ${EXCHANGES.length} Open`} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        {EXCHANGES.map((ex, i) => {
          const live = statuses[i] ?? false;
          return (
            <View
              key={ex.name}
              style={[
                styles.hoursChip,
                {
                  backgroundColor: live ? colors.gainDim : colors.card,
                  borderColor: live ? 'rgba(0,229,160,0.25)' : colors.rim,
                },
              ]}
            >
              <View style={[styles.hoursDot, { backgroundColor: live ? colors.gain : colors.t4 }]} />
              <Text style={[styles.hoursName, { color: live ? colors.gain : colors.t3 }]}>{ex.name}</Text>
              <Text style={[styles.hoursStatus, { color: live ? colors.gain : colors.t4 }]}>
                {live ? 'OPEN' : 'CLOSED'}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ── FEATURE 2: S&P Sector Heatmap ─────────────────────────────────────────

function SectorTile({ sym, label }: { sym: string; label: string }) {
  const colors = useColors();
  const { data } = useMarket();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const abs = Math.abs(chg);

  let bg: string;
  let textCol: string;
  if (!d) {
    bg = colors.card;
    textCol = colors.t3;
  } else if (dir === 'up') {
    bg = abs > 1.5 ? '#00E5A022' : '#00E5A011';
    textCol = colors.gain;
  } else if (dir === 'dn') {
    bg = abs > 1.5 ? '#FF4D6A22' : '#FF4D6A11';
    textCol = colors.loss;
  } else {
    bg = colors.amberDim;
    textCol = colors.amber;
  }

  return (
    <View style={[styles.sectorTile, { backgroundColor: bg, borderColor: d ? (dir === 'up' ? 'rgba(0,229,160,0.2)' : dir === 'dn' ? 'rgba(255,77,106,0.2)' : colors.rim) : colors.rim }]}>
      <Text style={[styles.sectorSym, { color: colors.t4 }]}>{sym}</Text>
      <Text style={[styles.sectorLabel, { color: colors.t2 }]} numberOfLines={1}>{label}</Text>
      <Text style={[styles.sectorChg, { color: textCol }]}>
        {d ? fmtChg(chg) : '—'}
      </Text>
    </View>
  );
}

function SectorsSection() {
  return (
    <View style={styles.section}>
      <SectionHeader label="S&P 500 Sectors" count={SECTORS.length} />
      <View style={styles.sectorGrid}>
        {SECTORS.map((s) => (
          <SectorTile key={s.sym} sym={s.sym} label={s.label} />
        ))}
      </View>
    </View>
  );
}

// ── FEATURE 3: Bond Yields + VIX + DXY ────────────────────────────────────

function BondsSection() {
  const colors = useColors();
  const { data } = useMarket();

  const vix = data['^VIX'];
  const dxy = data['DX-Y.NYB'];
  const vixVal = vix?.regularMarketPrice;
  const vixChg = vix?.regularMarketChangePercent;
  const dxyVal = dxy?.regularMarketPrice;
  const dxyChg = dxy?.regularMarketChangePercent;

  const maxYield = Math.max(
    ...BONDS.map((b) => data[b.sym]?.regularMarketPrice ?? 0),
    6
  );

  const vixLevel = !vixVal ? 'neutral' : vixVal < 15 ? 'greed' : vixVal > 25 ? 'fear' : 'neutral';
  const vixColor = vixLevel === 'greed' ? colors.gain : vixLevel === 'fear' ? colors.loss : colors.amber;
  const vixLabel = vixLevel === 'greed' ? 'LOW FEAR' : vixLevel === 'fear' ? 'HIGH FEAR' : 'NEUTRAL';

  return (
    <View style={styles.section}>
      <SectionHeader label="Bond Yields & Volatility" />
      <View style={[styles.bondsCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
        <Text style={[styles.bondsTitle, { color: colors.t3 }]}>US TREASURY YIELD CURVE</Text>
        {BONDS.map((b) => {
          const d = data[b.sym];
          const y = d?.regularMarketPrice;
          const pct = maxYield > 0 ? ((y ?? 0) / maxYield) * 100 : 0;
          const chg = d?.regularMarketChangePercent ?? 0;
          const dir = chgDir(chg);
          const barCol = dir === 'up' ? colors.loss : dir === 'dn' ? colors.gain : colors.amber;
          return (
            <View key={b.sym} style={styles.yieldRow}>
              <Text style={[styles.yieldLabel, { color: colors.t3 }]}>{b.label}</Text>
              <View style={[styles.yieldTrack, { backgroundColor: colors.surface }]}>
                <View style={[styles.yieldBar, { width: `${pct}%`, backgroundColor: barCol }]} />
              </View>
              <Text style={[styles.yieldVal, { color: colors.t1 }]}>
                {y != null ? `${fmt(y, 2)}%` : '—'}
              </Text>
              <Text style={[styles.yieldChg, { color: dir === 'up' ? colors.loss : dir === 'dn' ? colors.gain : colors.amber }]}>
                {d ? (chg >= 0 ? `+${fmt(Math.abs(chg), 1)}` : `-${fmt(Math.abs(chg), 1)}`) : ''}
              </Text>
            </View>
          );
        })}

        <View style={[styles.macroRow, { borderTopColor: colors.rim }]}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroLabel, { color: colors.t4 }]}>VIX</Text>
            <Text style={[styles.macroVal, { color: vixColor }]}>
              {vixVal != null ? fmt(vixVal, 1) : '—'}
            </Text>
            <Text style={[styles.macroTag, { color: vixColor }]}>{vixVal ? vixLabel : ''}</Text>
          </View>
          <View style={[styles.macroDivider, { backgroundColor: colors.rim }]} />
          <View style={styles.macroItem}>
            <Text style={[styles.macroLabel, { color: colors.t4 }]}>US DOLLAR INDEX</Text>
            <Text style={[styles.macroVal, { color: chgDir(dxyChg) === 'up' ? colors.gain : chgDir(dxyChg) === 'dn' ? colors.loss : colors.t1 }]}>
              {dxyVal != null ? fmt(dxyVal, 2) : '—'}
            </Text>
            <Text style={[styles.macroTag, { color: colors.t4 }]}>
              {dxyChg != null ? fmtChg(dxyChg) : ''}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── FEATURE 4: Top Day Movers ──────────────────────────────────────────────

function MoversSection() {
  const colors = useColors();
  const { data } = useMarket();

  const loaded = STOCKS.filter((s) => data[s.sym] != null);
  if (loaded.length < 3) return null;

  const sorted = [...loaded].sort(
    (a, b) => (data[b.sym]?.regularMarketChangePercent ?? 0) - (data[a.sym]?.regularMarketChangePercent ?? 0)
  );
  const gainers = sorted.slice(0, 4);
  const losers = sorted.slice(-4).reverse();

  const MoverRow = ({ sym, name, col }: { sym: string; name: string; col: string }) => {
    const d = data[sym];
    const chg = d?.regularMarketChangePercent ?? 0;
    return (
      <View style={[styles.moverRow, { borderBottomColor: colors.rim }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.moverSym, { color: colors.t1 }]}>{sym}</Text>
          <Text style={[styles.moverName, { color: colors.t4 }]}>{name}</Text>
        </View>
        <Text style={[styles.moverPrice, { color: colors.t2 }]}>${fmt(d?.regularMarketPrice)}</Text>
        <Text style={[styles.moverChg, { color: col }]}>{fmtChg(chg)}</Text>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <SectionHeader label="Today's Top Movers" />
      <View style={styles.moversGrid}>
        <View style={[styles.moversCol, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={[styles.moversColTitle, { color: colors.gain }]}>▲ GAINERS</Text>
          {gainers.map((s) => (
            <MoverRow key={s.sym} sym={s.sym} name={s.name} col={colors.gain} />
          ))}
        </View>
        <View style={[styles.moversCol, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={[styles.moversColTitle, { color: colors.loss }]}>▼ LOSERS</Text>
          {losers.map((s) => (
            <MoverRow key={s.sym} sym={s.sym} name={s.name} col={colors.loss} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ── Existing section components ────────────────────────────────────────────

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
      <Text style={[styles.idxPrice, { color: colors.t1 }]}>{d ? fmt(d.regularMarketPrice) : '—'}</Text>
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
      <Text style={[styles.fxRate, { color: colors.t1 }]}>{d ? fmt(d.regularMarketPrice, 4) : '—'}</Text>
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
  const { settings } = useSettings();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const chgColor = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.t2;
  const dec = settings.priceDecimals;

  return (
    <View style={[styles.stockRow, { borderBottomColor: colors.rim }]}>
      <View style={styles.stockInfo}>
        <Text style={[styles.stockSym, { color: colors.t1 }]}>{sym}</Text>
        <Text style={[styles.stockName, { color: colors.t4 }]}>{name}</Text>
        {d && d.regularMarketDayHigh != null && d.regularMarketDayLow != null && (
          <Text style={[styles.stockHiLo, { color: colors.t4 }]}>
            H ${fmt(d.regularMarketDayHigh, dec)} · L ${fmt(d.regularMarketDayLow, dec)}
          </Text>
        )}
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={[styles.stockPrice, { color: colors.t1 }]}>{d ? `$${fmt(d.regularMarketPrice, dec)}` : '—'}</Text>
        <Text style={[styles.stockChg, { color: chgColor }]}>{d ? fmtChg(chg) : '—'}</Text>
        <Text style={[styles.stockMcap, { color: colors.t3 }]}>{d ? fmtMcap(d.marketCap, settings.compactNumbers) : '—'}</Text>
      </View>
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────

export default function MarketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loading, lastUpdated, refresh } = useMarket();
  const [clock, setClock] = useState('');
  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const tabBarHeight = useBottomTabBarHeight();

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
              : <IconRefreshCw size={13} color={colors.t2} />}
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: tabBarHeight + 8 }}
        showsVerticalScrollIndicator={false}
      >
        <MarketHoursSection />

        <View style={styles.section}>
          <SectionHeader label="Global Indices" count={INDICES.length} />
          <View style={styles.idxGrid}>
            {INDICES.map((idx) => <IndexCard key={idx.sym} {...idx} />)}
          </View>
        </View>

        <SectorsSection />
        <BondsSection />
        <MoversSection />

        <View style={styles.section}>
          <SectionHeader label="Foreign Exchange" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {FOREX.map((fx) => <ForexChip key={fx.sym} {...fx} />)}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <SectionHeader label="Commodities" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
            {COMMODITIES.map((c) => <CommodityCard key={c.sym} {...c} />)}
          </ScrollView>
        </View>

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
  liveChip: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2 },
  liveText: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  clock: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  refreshBtn: { width: 30, height: 30, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pulse: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#00E5A0', shadowColor: '#00E5A0', shadowOpacity: 0.8, shadowRadius: 6, elevation: 4 },
  scroll: { flex: 1 },
  section: { paddingHorizontal: 14, marginTop: 14 },
  secHd: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  secLabel: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1.4, textTransform: 'uppercase' },
  secCount: { borderRadius: 3, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },
  secLine: { flex: 1, height: 1 },
  hScroll: { paddingRight: 14, gap: 6 },

  // Market Hours
  hoursChip: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    gap: 4,
    minWidth: 68,
  },
  hoursDot: { width: 6, height: 6, borderRadius: 3 },
  hoursName: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
  hoursStatus: { fontSize: 7, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.8 },

  // Sectors
  sectorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sectorTile: {
    width: '31%',
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  sectorSym: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 0.5, marginBottom: 2 },
  sectorLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', marginBottom: 4 },
  sectorChg: { fontSize: 13, fontFamily: 'Inter_700Bold' },

  // Bonds
  bondsCard: { borderRadius: 8, borderWidth: 1, padding: 14, gap: 10 },
  bondsTitle: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1.2 },
  yieldRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  yieldLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold', width: 36 },
  yieldTrack: { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  yieldBar: { height: '100%', borderRadius: 3 },
  yieldVal: { fontSize: 12, fontFamily: 'Inter_700Bold', width: 48, textAlign: 'right' },
  yieldChg: { fontSize: 9, fontFamily: 'Inter_500Medium', width: 30, textAlign: 'right' },
  macroRow: { flexDirection: 'row', borderTopWidth: 1, paddingTop: 10, marginTop: 2 },
  macroItem: { flex: 1, alignItems: 'center', gap: 2 },
  macroLabel: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  macroVal: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  macroTag: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  macroDivider: { width: 1, marginVertical: 4 },

  // Movers
  moversGrid: { flexDirection: 'row', gap: 8 },
  moversCol: { flex: 1, borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  moversColTitle: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1, padding: 10, paddingBottom: 6 },
  moverRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderBottomWidth: 1 },
  moverSym: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  moverName: { fontSize: 8, marginTop: 1 },
  moverPrice: { fontSize: 10, fontFamily: 'Inter_500Medium', marginRight: 4 },
  moverChg: { fontSize: 11, fontFamily: 'Inter_700Bold', minWidth: 50, textAlign: 'right' },

  // Indices
  idxGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  idxCard: { width: '47.5%', borderRadius: 8, borderWidth: 1, borderBottomWidth: 2, padding: 11 },
  idxRegion: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  idxName: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 6 },
  idxPrice: { fontSize: 16, fontFamily: 'Inter_700Bold', letterSpacing: -0.5, marginBottom: 4 },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontFamily: 'Inter_500Medium' },

  // Forex
  fxChip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  fxPair: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 },
  fxRate: { fontSize: 11, fontFamily: 'Inter_700Bold' },

  // Commodities
  comCard: { borderRadius: 8, borderWidth: 1, padding: 11, minWidth: 110 },
  comName: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  comPrice: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  comUnit: { fontSize: 8, marginBottom: 6 },

  // Stocks
  tableWrap: { borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 1 },
  thText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase' },
  stockRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1 },
  stockInfo: { flex: 2 },
  stockSym: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  stockName: { fontSize: 9, marginTop: 1 },
  stockPrice: { flex: 1, fontSize: 12, fontFamily: 'Inter_500Medium', textAlign: 'right' },
  stockChg: { flex: 1, fontSize: 11, fontFamily: 'Inter_500Medium', textAlign: 'right' },
  stockMcap: { fontSize: 11 },
  stockHiLo: { fontSize: 9, fontFamily: 'Inter_500Medium', marginTop: 1 },

  updated: { textAlign: 'center', fontSize: 10, marginTop: 12, marginBottom: 4 },
});
