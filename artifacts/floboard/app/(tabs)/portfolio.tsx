import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
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

function getKnownSymbols(): string[] {
  return ALL_SYMBOLS;
}

function HoldingCard({ holding, onRemove }: { holding: Holding; onRemove: () => void }) {
  const colors = useColors();
  const { data } = useMarket();
  const d = data[holding.sym];
  const price = d?.regularMarketPrice ?? 0;
  const value = price * holding.qty;
  const costBasis = holding.cost * holding.qty;
  const pnl = value - costBasis;
  const pnlPct = costBasis > 0 ? ((value - costBasis) / costBasis) * 100 : 0;
  const dir = chgDir(d?.regularMarketChangePercent);
  const dayColor = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.amber;
  const pnlColor = pnl >= 0 ? colors.gain : colors.loss;

  return (
    <View style={[styles.holdCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <View style={styles.holdHd}>
        <View>
          <Text style={[styles.holdSym, { color: colors.t1 }]}>{holding.sym}</Text>
          <Text style={[styles.holdName, { color: colors.t3 }]}>{holding.name}</Text>
        </View>
        <Pressable onPress={onRemove} style={[styles.removeBtn, { borderColor: colors.rim }]}>
          <Feather name="trash-2" size={12} color={colors.loss} />
        </Pressable>
      </View>

      <View style={styles.holdStats}>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: colors.t4 }]}>Qty</Text>
          <Text style={[styles.statVal, { color: colors.t1 }]}>{holding.qty}</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: colors.t4 }]}>Price</Text>
          <Text style={[styles.statVal, { color: colors.t1 }]}>{price ? `$${fmt(price)}` : '—'}</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: colors.t4 }]}>Value</Text>
          <Text style={[styles.statVal, { color: colors.amber }]}>{value ? `$${fmt(value)}` : '—'}</Text>
        </View>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: colors.t4 }]}>Day</Text>
          <Text style={[styles.statVal, { color: dayColor }]}>
            {d ? fmtChg(d.regularMarketChangePercent) : '—'}
          </Text>
        </View>
      </View>

      {costBasis > 0 && (
        <View style={[styles.pnlRow, { backgroundColor: pnl >= 0 ? colors.gainDim : colors.lossDim, borderColor: pnl >= 0 ? 'rgba(0,229,160,0.12)' : 'rgba(255,77,106,0.12)' }]}>
          <Text style={[styles.pnlLabel, { color: pnlColor }]}>Unrealised P&L</Text>
          <Text style={[styles.pnlVal, { color: pnlColor }]}>
            {pnl >= 0 ? '+' : ''}${fmt(pnl)} ({pnlPct >= 0 ? '+' : ''}{fmt(pnlPct)}%)
          </Text>
        </View>
      )}
    </View>
  );
}

export default function PortfolioScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data } = useMarket();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [sym, setSym] = useState('');
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');
  const [addVisible, setAddVisible] = useState(false);
  const topPad = Platform.OS === 'web' ? 67 : insets.top;

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
    const knownSyms = getKnownSymbols();
    if (!upper || !knownSyms.includes(upper)) {
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
      saveHoldings([
        ...holdings,
        { sym: upper, name: resolveDisplayName(upper), qty: q, cost: c },
      ]);
    }

    setSym('');
    setQty('');
    setCost('');
    setAddVisible(false);
    Keyboard.dismiss();
  };

  const handleRemove = (i: number) => {
    const updated = holdings.filter((_, idx) => idx !== i);
    saveHoldings(updated);
  };

  const totalValue = holdings.reduce((acc, h) => {
    const price = data[h.sym]?.regularMarketPrice ?? 0;
    return acc + price * h.qty;
  }, 0);

  const totalCost = holdings.reduce((acc, h) => acc + h.cost * h.qty, 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPct = totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <Text style={[styles.pageTitle, { color: colors.t1 }]}>Portfolio</Text>
        <Pressable
          onPress={() => setAddVisible((v) => !v)}
          style={[styles.addBtn, { backgroundColor: addVisible ? colors.gain : colors.card, borderColor: addVisible ? 'transparent' : colors.rim }]}
        >
          <Feather name={addVisible ? 'x' : 'plus'} size={14} color={addVisible ? '#000' : colors.t2} />
          <Text style={[styles.addBtnText, { color: addVisible ? '#000' : colors.t2 }]}>
            {addVisible ? 'Close' : 'Add'}
          </Text>
        </Pressable>
      </View>

      {/* Summary bar */}
      {holdings.length > 0 && (
        <View style={[styles.summaryBar, { backgroundColor: colors.card, borderBottomColor: colors.rim }]}>
          <View style={styles.sumItem}>
            <Text style={[styles.sumLabel, { color: colors.t4 }]}>Total Value</Text>
            <Text style={[styles.sumValue, { color: colors.amber }]}>${fmt(totalValue)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.rim }]} />
          <View style={styles.sumItem}>
            <Text style={[styles.sumLabel, { color: colors.t4 }]}>Cost Basis</Text>
            <Text style={[styles.sumValue, { color: colors.t1 }]}>${fmt(totalCost)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.rim }]} />
          <View style={styles.sumItem}>
            <Text style={[styles.sumLabel, { color: colors.t4 }]}>P&L</Text>
            <Text style={[styles.sumValue, { color: totalPnl >= 0 ? colors.gain : colors.loss }]}>
              {totalPnl >= 0 ? '+' : ''}${fmt(totalPnl)} ({totalPnlPct >= 0 ? '+' : ''}{fmt(totalPnlPct)}%)
            </Text>
          </View>
        </View>
      )}

      {/* Add form */}
      {addVisible && (
        <View style={[styles.addForm, { backgroundColor: colors.surface, borderBottomColor: colors.rim }]}>
          <Text style={[styles.addTitle, { color: colors.t3 }]}>Add / Update Holding</Text>
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
              style={[styles.addInput, { backgroundColor: colors.card, borderColor: colors.rim, color: colors.t1, flex: 0.8 }]}
              value={qty}
              onChangeText={setQty}
              placeholder="Qty"
              placeholderTextColor={colors.t4}
              keyboardType="decimal-pad"
            />
            <TextInput
              style={[styles.addInput, { backgroundColor: colors.card, borderColor: colors.rim, color: colors.t1, flex: 1 }]}
              value={cost}
              onChangeText={setCost}
              placeholder="Avg cost"
              placeholderTextColor={colors.t4}
              keyboardType="decimal-pad"
            />
            <Pressable
              onPress={handleAdd}
              style={[styles.addSubmit, { backgroundColor: colors.gain }]}
            >
              <Feather name="check" size={16} color="#000" />
            </Pressable>
          </View>
          <Text style={[styles.addHint, { color: colors.t4 }]}>
            Known symbols: AAPL, MSFT, TSLA, BTC-USD, ETH-USD, EURUSD=X, GC=F, ^GSPC…
          </Text>
        </View>
      )}

      {holdings.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="briefcase" size={40} color={colors.t4} />
          <Text style={[styles.emptyTitle, { color: colors.t2 }]}>No holdings yet</Text>
          <Text style={[styles.emptyBody, { color: colors.t4 }]}>
            Tap "+ Add" to track stocks, crypto, indices, or forex pairs.
          </Text>
        </View>
      ) : (
        <FlatList
          data={holdings}
          keyExtractor={(h) => h.sym}
          renderItem={({ item, index }) => (
            <HoldingCard holding={item} onRemove={() => handleRemove(index)} />
          )}
          contentContainerStyle={{ padding: 14, paddingBottom: Platform.OS === 'web' ? 84 : 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  addBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  sumItem: { flex: 1, alignItems: 'center' },
  sumLabel: { fontSize: 9, fontFamily: 'Inter_400Regular', marginBottom: 2, textTransform: 'uppercase', letterSpacing: 0.5 },
  sumValue: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  divider: { width: 1, height: 30 },
  addForm: { padding: 14, borderBottomWidth: 1 },
  addTitle: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  addRow: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  addInput: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  addSubmit: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addHint: { fontSize: 10, marginTop: 6, lineHeight: 15 },
  holdCard: { borderRadius: 8, borderWidth: 1, padding: 12, marginBottom: 8 },
  holdHd: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  holdSym: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  holdName: { fontSize: 10, marginTop: 1 },
  removeBtn: { borderRadius: 6, borderWidth: 1, padding: 6 },
  holdStats: { flexDirection: 'row', gap: 6 },
  statCol: { flex: 1 },
  statLabel: { fontSize: 8, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  statVal: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  pnlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  pnlLabel: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  pnlVal: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 40 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyBody: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
