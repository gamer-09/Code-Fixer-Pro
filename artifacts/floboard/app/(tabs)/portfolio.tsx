import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useCallback, useEffect, useState } from 'react';
import { useSettings } from '@/context/SettingsContext';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconBriefcase, IconCheck, IconPlus, IconRefreshCw, IconTrash2, IconX } from '@/components/Icons';
import { useColors } from '@/hooks/useColors';
import { chgDir, fmt, fmtChg, fmtMcap, useMarket } from '@/context/MarketContext';
import { ALL_SYMBOLS, CRYPTOS, INDICES, STOCKS } from '@/constants/marketData';

const STORAGE_KEY = '@floboard:holdings';

interface Holding {
  sym: string;
  name: string;
  qty: number;
  cost: number;
}

function resolveDisplayName(sym: string): string {
  const stock = STOCKS.find((s) => s.sym === sym);
  if (stock) return stock.name;
  const crypto = CRYPTOS.find((c) => c.sym === sym);
  if (crypto) return crypto.name;
  const idx = INDICES.find((i) => i.sym === sym);
  if (idx) return idx.name;
  return sym;
}

function HoldingCard({
  holding,
  onRemove,
  totalPortfolioValue,
}: {
  holding: Holding;
  onRemove: () => void;
  totalPortfolioValue: number;
}) {
  const colors = useColors();
  const { data } = useMarket();
  const { settings } = useSettings();
  const d = data[holding.sym];
  const price = d?.regularMarketPrice ?? 0;
  const value = price * holding.qty;
  const costBasis = holding.cost * holding.qty;
  const pnl = value - costBasis;
  const pnlPct = costBasis > 0 ? ((value - costBasis) / costBasis) * 100 : 0;
  const dir = chgDir(d?.regularMarketChangePercent);
  const dayColor = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.amber;
  const pnlColor = pnl >= 0 ? colors.gain : colors.loss;
  const allocPct = totalPortfolioValue > 0 ? (value / totalPortfolioValue) * 100 : 0;

  const alertThreshold = settings.alertThreshold;
  const dayChangePct = Math.abs(d?.regularMarketChangePercent ?? 0);
  const isAlerted = alertThreshold > 0 && d && dayChangePct >= alertThreshold;
  const alertColor = dir === 'up' ? colors.gain : colors.loss;

  return (
    <View style={[
      styles.holdCard,
      { backgroundColor: colors.card, borderColor: isAlerted ? alertColor : colors.rim },
      isAlerted && { borderWidth: 1.5 },
    ]}>
      {/* Left accent based on day direction */}
      <View style={[styles.holdAccent, { backgroundColor: dayColor }]} />

      <View style={styles.holdInner}>
        {/* Header row */}
        <View style={styles.holdHd}>
          <View style={styles.holdHdLeft}>
            <View style={styles.holdSymRow}>
              <Text style={[styles.holdSym, { color: colors.t1 }]}>{holding.sym}</Text>
              {allocPct > 0 && (
                <View style={[styles.allocBadge, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.allocText, { color: colors.t3 }]}>{allocPct.toFixed(1)}%</Text>
                </View>
              )}
              {isAlerted && (
                <View style={[styles.alertBadge, { backgroundColor: alertColor + '22' }]}>
                  <Text style={[styles.alertBadgeText, { color: alertColor }]}>ALERT</Text>
                </View>
              )}
            </View>
            <Text style={[styles.holdName, { color: colors.t4 }]}>{holding.name}</Text>
          </View>
          <Pressable onPress={onRemove} style={[styles.removeBtn, { borderColor: colors.rim }]}>
            <IconTrash2 size={12} color={colors.loss} />
          </Pressable>
        </View>

        {/* Stats row */}
        <View style={[styles.holdStats, { borderTopColor: colors.rim, borderBottomColor: colors.rim }]}>
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: colors.t4 }]}>Qty</Text>
            <Text style={[styles.statVal, { color: colors.t1 }]}>{holding.qty}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.rim }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: colors.t4 }]}>Price</Text>
            <Text style={[styles.statVal, { color: colors.t1 }]}>
              {price ? `$${fmt(price, settings.priceDecimals)}` : '—'}
            </Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.rim }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: colors.t4 }]}>Value</Text>
            <Text style={[styles.statVal, { color: colors.amber }]}>{value ? `$${fmt(value)}` : '—'}</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.rim }]} />
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: colors.t4 }]}>Today</Text>
            <Text style={[styles.statVal, { color: dayColor }]}>
              {d ? fmtChg(d.regularMarketChangePercent) : '—'}
            </Text>
          </View>
        </View>

        {/* P&L bar */}
        {costBasis > 0 && (
          <View style={styles.pnlSection}>
            <View style={styles.pnlRow}>
              <Text style={[styles.pnlLabel, { color: pnlColor }]}>Unrealised P&L</Text>
              <Text style={[styles.pnlVal, { color: pnlColor }]}>
                {pnl >= 0 ? '+' : ''}${fmt(Math.abs(pnl))} ({pnlPct >= 0 ? '+' : ''}{fmt(pnlPct)}%)
              </Text>
            </View>
            {/* Visual P&L bar */}
            <View style={[styles.pnlTrack, { backgroundColor: colors.surface }]}>
              <View
                style={[
                  styles.pnlFill,
                  {
                    width: `${Math.min(100, Math.abs(pnlPct) / 2)}%`,
                    backgroundColor: pnlColor,
                  },
                ]}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, loading: marketLoading, refresh: marketRefresh } = useMarket();
  const { settings } = useSettings();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [sym, setSym] = useState('');
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, StatusBar.currentHeight ?? 0);
  const tabBarHeight = useBottomTabBarHeight();

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) setHoldings(JSON.parse(raw));
    });
  }, []);

  const saveHoldings = useCallback((h: Holding[]) => {
    setHoldings(h);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(h));
  }, []);

  const handleAdd = () => {
    const upper = sym.trim().toUpperCase();
    if (!upper || !ALL_SYMBOLS.includes(upper)) {
      Alert.alert('Unknown symbol', `"${upper}" is not in our data set. Try symbols like AAPL, BTC-USD, EURUSD=X.`);
      return;
    }
    const q = parseFloat(qty);
    if (!q || q <= 0) {
      Alert.alert('Invalid qty', 'Please enter a positive quantity.');
      return;
    }
    const c = parseFloat(cost) || 0;
    const existing = holdings.findIndex((h) => h.sym === upper);
    if (existing >= 0) {
      const updated = [...holdings];
      updated[existing] = { ...updated[existing], qty: q, cost: c };
      saveHoldings(updated);
    } else {
      saveHoldings([...holdings, { sym: upper, name: resolveDisplayName(upper), qty: q, cost: c }]);
    }
    setSym(''); setQty(''); setCost('');
    setAddVisible(false);
    Keyboard.dismiss();
  };

  const handleRemove = (i: number) => {
    saveHoldings(holdings.filter((_, idx) => idx !== i));
  };

  const totalValue = holdings.reduce((acc, h) => acc + (data[h.sym]?.regularMarketPrice ?? 0) * h.qty, 0);
  const totalCost = holdings.reduce((acc, h) => acc + h.cost * h.qty, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;
  const pnlColor = totalPnl >= 0 ? colors.gain : colors.loss;

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <Text style={[styles.pageTitle, { color: colors.t1 }]}>Portfolio</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Pressable
            onPress={marketRefresh}
            disabled={marketLoading}
            style={[styles.refreshBtn, { backgroundColor: colors.card, borderColor: colors.rim }]}
          >
            {marketLoading
              ? <ActivityIndicator size="small" color={colors.blue} />
              : <IconRefreshCw size={13} color={colors.t2} />}
          </Pressable>
          <Pressable
            onPress={() => setAddVisible((v) => !v)}
            style={[
              styles.addBtn,
              { backgroundColor: addVisible ? colors.gain : colors.card, borderColor: addVisible ? 'transparent' : colors.rim },
            ]}
          >
            {addVisible ? <IconX size={13} color="#000" /> : <IconPlus size={13} color={colors.t2} />}
            <Text style={[styles.addBtnText, { color: addVisible ? '#000' : colors.t2 }]}>
              {addVisible ? 'Close' : 'Add'}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Summary banner */}
      {holdings.length > 0 && (
        <View style={[styles.summaryBanner, { backgroundColor: colors.card, borderBottomColor: colors.rim }]}>
          <View style={styles.summaryMain}>
            <View style={styles.summaryBlock}>
              <Text style={[styles.summaryBig, { color: colors.amber }]}>${fmt(totalValue)}</Text>
              <Text style={[styles.summaryCaption, { color: colors.t4 }]}>TOTAL VALUE</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.rim }]} />
            <View style={styles.summaryBlock}>
              <Text style={[styles.summaryBig, { color: colors.t2 }]}>${fmt(totalCost)}</Text>
              <Text style={[styles.summaryCaption, { color: colors.t4 }]}>COST BASIS</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.rim }]} />
            <View style={styles.summaryBlock}>
              <Text style={[styles.summaryBig, { color: pnlColor }]}>
                {totalPnl >= 0 ? '+' : ''}{fmt(totalPnlPct)}%
              </Text>
              <Text style={[styles.summaryCaption, { color: colors.t4 }]}>UNREALISED P&L</Text>
            </View>
          </View>
          {/* P&L absolute */}
          <View style={[styles.pnlAbsRow, { backgroundColor: totalPnl >= 0 ? colors.gainDim : colors.lossDim, borderTopColor: totalPnl >= 0 ? 'rgba(0,229,160,0.1)' : 'rgba(255,77,106,0.1)' }]}>
            <Text style={[styles.pnlAbsText, { color: pnlColor }]}>
              {totalPnl >= 0 ? '▲' : '▼'} {totalPnl >= 0 ? '+' : ''}${fmt(Math.abs(totalPnl))} unrealised
            </Text>
            <Text style={[styles.holdingCount, { color: pnlColor }]}>{holdings.length} position{holdings.length !== 1 ? 's' : ''}</Text>
          </View>
        </View>
      )}

      {/* Add form */}
      {addVisible && (
        <View style={[styles.addForm, { backgroundColor: colors.surface, borderBottomColor: colors.rim }]}>
          <Text style={[styles.addTitle, { color: colors.t4 }]}>ADD / UPDATE HOLDING</Text>
          <View style={styles.addRow}>
            <TextInput
              style={[styles.addInput, { backgroundColor: colors.card, borderColor: colors.rim, color: colors.t1, flex: 1.2 }]}
              value={sym}
              onChangeText={(t) => setSym(t.toUpperCase())}
              placeholder="Symbol (e.g. AAPL)"
              placeholderTextColor={colors.t4}
              autoCapitalize="characters"
            />
            <TextInput
              style={[styles.addInput, { backgroundColor: colors.card, borderColor: colors.rim, color: colors.t1, flex: 0.7 }]}
              value={qty}
              onChangeText={setQty}
              placeholder="Qty"
              placeholderTextColor={colors.t4}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.addInput, { backgroundColor: colors.card, borderColor: colors.rim, color: colors.t1, flex: 0.9 }]}
              value={cost}
              onChangeText={setCost}
              placeholder="Avg cost"
              placeholderTextColor={colors.t4}
              keyboardType="decimal-pad"
            />
            <Pressable onPress={handleAdd} style={[styles.addSubmit, { backgroundColor: colors.gain }]}>
              <IconCheck size={16} color="#000" />
            </Pressable>
          </View>
          <Text style={[styles.addHint, { color: colors.t4 }]}>
            Supports: AAPL, MSFT, BTC-USD, ETH-USD, EURUSD=X, GC=F, ^GSPC…
          </Text>
        </View>
      )}

      {holdings.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.card, borderColor: colors.rim }]}>
            <IconBriefcase size={32} color={colors.t3} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.t2 }]}>No holdings yet</Text>
          <Text style={[styles.emptyBody, { color: colors.t4 }]}>
            Tap "+ Add" above to track stocks, crypto, indices, or forex with live P&L.
          </Text>
        </View>
      ) : (
        <FlatList
          data={holdings}
          keyExtractor={(h) => h.sym}
          renderItem={({ item, index }) => (
            <HoldingCard
              holding={item}
              onRemove={() => handleRemove(index)}
              totalPortfolioValue={totalValue}
            />
          )}
          contentContainerStyle={{ padding: 12, paddingBottom: tabBarHeight + 8, gap: 8 }}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  refreshBtn: {
    width: 30, height: 30, borderRadius: 8, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 11, paddingVertical: 7,
  },
  addBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },

  // Summary banner
  summaryBanner: { borderBottomWidth: 1 },
  summaryMain: { flexDirection: 'row', alignItems: 'center' },
  summaryBlock: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  summaryBig: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  summaryCaption: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.8, marginTop: 3 },
  summaryDivider: { width: 1, height: 36 },
  pnlAbsRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8, borderTopWidth: 1,
  },
  pnlAbsText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  holdingCount: { fontSize: 10, fontFamily: 'Inter_500Medium' },

  // Add form
  addForm: { padding: 14, borderBottomWidth: 1 },
  addTitle: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, marginBottom: 10, textTransform: 'uppercase' },
  addRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  addInput: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 10, fontSize: 12, fontFamily: 'Inter_400Regular' },
  addSubmit: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  addHint: { fontSize: 10, marginTop: 8, lineHeight: 15 },

  // Holding card
  holdCard: {
    borderRadius: 10, borderWidth: 1, flexDirection: 'row', overflow: 'hidden',
  },
  holdAccent: { width: 3 },
  holdInner: { flex: 1, padding: 12 },
  holdHd: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  holdHdLeft: { flex: 1 },
  holdSymRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  holdSym: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  holdName: { fontSize: 10 },
  allocBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  allocText: { fontSize: 9, fontFamily: 'Inter_600SemiBold' },
  alertBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  alertBadgeText: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  removeBtn: { borderRadius: 6, borderWidth: 1, padding: 6 },
  holdStats: {
    flexDirection: 'row', alignItems: 'center',
    borderTopWidth: 1, borderBottomWidth: 1, paddingVertical: 8, marginBottom: 10,
  },
  statCol: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 7, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3, fontFamily: 'Inter_700Bold' },
  statVal: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  statDivider: { width: 1, height: 28 },
  pnlSection: {},
  pnlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  pnlLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  pnlVal: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  pnlTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  pnlFill: { height: '100%', borderRadius: 2 },

  // Empty state
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyBody: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
