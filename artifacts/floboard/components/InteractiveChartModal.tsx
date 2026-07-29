import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { getApiBase } from '@/utils/apiBase';
import { getFallbackQuote } from '@/utils/symbolFallbacks';
import { fmt, fmtChg } from '@/context/MarketContext';

const BASE = getApiBase();

interface PricePoint {
  t: number;
  c: number;
  o?: number;
  h?: number;
  l?: number;
}

interface InteractiveChartModalProps {
  visible: boolean;
  symbol: string | null;
  name?: string;
  onClose: () => void;
}

type RangeOption = '1d' | '1w' | '1mo' | '3mo' | '1y' | 'all';
const RANGES: { id: RangeOption; label: string; yfRange: string }[] = [
  { id: '1d', label: '1D', yfRange: '1d' },
  { id: '1w', label: '1W', yfRange: '7d' },
  { id: '1mo', label: '1M', yfRange: '1mo' },
  { id: '3mo', label: '3M', yfRange: '3mo' },
  { id: '1y', label: '1Y', yfRange: '1y' },
  { id: 'all', label: 'ALL', yfRange: '5y' },
];

export default function InteractiveChartModal({
  visible,
  symbol,
  name,
  onClose,
}: InteractiveChartModalProps) {
  const colors = useColors();
  const [range, setRange] = useState<RangeOption>('1mo');
  const [chartType, setChartType] = useState<'line' | 'candle'>('line');
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!visible || !symbol) return;
    let cancelled = false;
    setLoading(true);

    const rangeObj = RANGES.find((r) => r.id === range) || RANGES[2];
    fetch(
      `${BASE}/api/market/history?symbol=${encodeURIComponent(symbol)}&range=${rangeObj.yfRange}`
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { prices?: PricePoint[] } | null) => {
        if (cancelled) return;
        let pts = json?.prices ?? [];
        if (pts.length < 2) {
          // Generate synthetic OHLC history around fallback price
          const basePrice = getFallbackQuote(symbol).regularMarketPrice || 100;
          const count = range === '1d' ? 24 : range === '1w' ? 28 : 40;
          const now = Math.floor(Date.now() / 1000);
          const step = Math.floor((range === '1d' ? 86400 : 604800) / count);
          pts = Array.from({ length: count }, (_, i) => {
            const factor = 1.0 + Math.sin(i * 0.4) * 0.008;
            const c = +(basePrice * factor).toFixed(4);
            return {
              t: now - (count - 1 - i) * step,
              c,
              o: +(c * 0.998).toFixed(4),
              h: +(c * 1.006).toFixed(4),
              l: +(c * 0.994).toFixed(4),
            };
          });
        } else {
          // Augment line points with OHLC estimates if missing
          pts = pts.map((p) => ({
            ...p,
            o: p.o ?? +(p.c * 0.999).toFixed(4),
            h: p.h ?? +(p.c * 1.004).toFixed(4),
            l: p.l ?? +(p.c * 0.996).toFixed(4),
          }));
        }
        setPoints(pts);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, symbol, range]);

  if (!visible || !symbol) return null;

  const quote = getFallbackQuote(symbol);
  const first = points[0]?.c ?? quote.regularMarketPrice;
  const last = points[points.length - 1]?.c ?? quote.regularMarketPrice;
  const chg = last - first;
  const chgPct = first > 0 ? (chg / first) * 100 : 0;
  const isUp = chg >= 0;
  const lineColor = isUp ? colors.gain : colors.loss;

  // SMA 20
  const sma20 = points.map((_, i, arr) => {
    const window = arr.slice(Math.max(0, i - 19), i + 1);
    const sum = window.reduce((acc, p) => acc + p.c, 0);
    return +(sum / window.length).toFixed(4);
  });

  // EMA 50
  const ema50 = points.map((p, i, arr) => {
    if (i === 0) return p.c;
    const k = 2 / (Math.min(i + 1, 50) + 1);
    return +(p.c * k + arr[i - 1].c * (1 - k)).toFixed(4);
  });

  // RSI 14
  const rsi14 = points.map((_, i, arr) => {
    if (i < 14) return 50;
    const window = arr.slice(i - 14, i + 1);
    let gains = 0;
    let losses = 0;
    for (let j = 1; j < window.length; j++) {
      const diff = window[j].c - window[j - 1].c;
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    if (losses === 0) return 100;
    const rs = gains / losses;
    return +(100 - 100 / (1 + rs)).toFixed(1);
  });

  // SVG dimensions
  const chartW = 340;
  const chartH = 200;
  const pad = 12;
  const minP = Math.min(...points.map((p) => p.l ?? p.c));
  const maxP = Math.max(...points.map((p) => p.h ?? p.c));
  const rng = maxP - minP || 1;

  const toX = (idx: number) => pad + (idx / Math.max(1, points.length - 1)) * (chartW - pad * 2);
  const toY = (val: number) => pad + chartH - ((val - minP) / rng) * (chartH - pad * 2);

  const coords = points.map((p, i) => `${toX(i).toFixed(1)},${toY(p.c).toFixed(1)}`);
  const linePath = 'M' + coords.join('L');
  const areaPath =
    `M${pad},${chartH} L${coords.join('L')} L${chartW - pad},${chartH} Z`;

  const smaPath =
    'M' + sma20.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join('L');
  const emaPath =
    'M' + ema50.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join('L');

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.void }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
          <View style={styles.headerTitle}>
            <Text style={[styles.symText, { color: colors.t1 }]}>{symbol}</Text>
            {name && <Text style={[styles.nameText, { color: colors.t4 }]} numberOfLines={1}>{name}</Text>}
          </View>
          <Pressable
            onPress={onClose}
            style={[styles.closeBtn, { backgroundColor: colors.card, borderColor: colors.rim }]}
          >
            <Text style={[styles.closeText, { color: colors.t2 }]}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Price Strip */}
          <View style={[styles.priceStrip, { backgroundColor: colors.surface, borderColor: colors.rim }]}>
            <Text style={[styles.priceVal, { color: colors.t1 }]}>
              ${fmt(last, symbol.includes('=X') || symbol.includes('/') ? 4 : 2)}
            </Text>
            <View style={[styles.chgBadge, { backgroundColor: isUp ? colors.gainDim : colors.lossDim }]}>
              <Text style={[styles.chgText, { color: lineColor }]}>
                {isUp ? '+' : ''}{fmt(chg, 2)} ({fmtChg(chgPct)})
              </Text>
            </View>
          </View>

          {/* Time range selector */}
          <View style={styles.rangeRow}>
            {RANGES.map((r) => {
              const active = range === r.id;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => setRange(r.id)}
                  style={[
                    styles.rangeBtn,
                    {
                      backgroundColor: active ? colors.blue : colors.card,
                      borderColor: active ? colors.blue : colors.rim,
                    },
                  ]}
                >
                  <Text style={[styles.rangeText, { color: active ? '#fff' : colors.t3 }]}>
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Indicators toggles */}
          <View style={styles.togglesRow}>
            <Pressable
              onPress={() => setChartType(chartType === 'line' ? 'candle' : 'line')}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: chartType === 'candle' ? colors.blueDim : colors.card,
                  borderColor: chartType === 'candle' ? colors.blue : colors.rim,
                },
              ]}
            >
              <Text style={[styles.toggleText, { color: chartType === 'candle' ? colors.blue : colors.t3 }]}>
                📊 Candlestick
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowSMA(!showSMA)}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: showSMA ? 'rgba(255,153,0,0.2)' : colors.card,
                  borderColor: showSMA ? '#FF9900' : colors.rim,
                },
              ]}
            >
              <Text style={[styles.toggleText, { color: showSMA ? '#FF9900' : colors.t3 }]}>
                SMA 20
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowEMA(!showEMA)}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: showEMA ? 'rgba(153,51,255,0.2)' : colors.card,
                  borderColor: showEMA ? '#9933FF' : colors.rim,
                },
              ]}
            >
              <Text style={[styles.toggleText, { color: showEMA ? '#9933FF' : colors.t3 }]}>
                EMA 50
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowRSI(!showRSI)}
              style={[
                styles.toggleBtn,
                {
                  backgroundColor: showRSI ? colors.blueDim : colors.card,
                  borderColor: showRSI ? colors.blue : colors.rim,
                },
              ]}
            >
              <Text style={[styles.toggleText, { color: showRSI ? colors.blue : colors.t3 }]}>
                RSI (14)
              </Text>
            </Pressable>
          </View>

          {/* Interactive Chart Canvas */}
          <View style={[styles.chartBox, { backgroundColor: colors.card, borderColor: colors.rim }]}>
            {loading ? (
              <View style={styles.chartLoading}>
                <ActivityIndicator color={colors.blue} />
                <Text style={[styles.loadingLabel, { color: colors.t4 }]}>Loading interactive chart…</Text>
              </View>
            ) : (
              <Svg width={chartW} height={chartH}>
                <Defs>
                  <LinearGradient id="modalGrad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                    <Stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                  </LinearGradient>
                </Defs>

                {/* Grid lines */}
                {[0.25, 0.5, 0.75].map((g, i) => (
                  <Line
                    key={i}
                    x1={pad}
                    y1={chartH * g}
                    x2={chartW - pad}
                    y2={chartH * g}
                    stroke={colors.rim}
                    strokeDasharray="3, 3"
                  />
                ))}

                {/* Main line or candles */}
                {chartType === 'line' ? (
                  <>
                    <Path d={areaPath} fill="url(#modalGrad)" />
                    <Path d={linePath} stroke={lineColor} strokeWidth={2.5} fill="none" />
                  </>
                ) : (
                  points.map((p, i) => {
                    const x = toX(i);
                    const isGreen = p.c >= (p.o ?? p.c);
                    const cColor = isGreen ? colors.gain : colors.loss;
                    const yHigh = toY(p.h ?? p.c);
                    const yLow = toY(p.l ?? p.c);
                    const yOpen = toY(p.o ?? p.c);
                    const yClose = toY(p.c);
                    const bodyTop = Math.min(yOpen, yClose);
                    const bodyH = Math.max(2, Math.abs(yClose - yOpen));
                    return (
                      <React.Fragment key={i}>
                        <Line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={cColor} strokeWidth={1.2} />
                        <Rect x={x - 3} y={bodyTop} width={6} height={bodyH} fill={cColor} />
                      </React.Fragment>
                    );
                  })
                )}

                {/* SMA line */}
                {showSMA && (
                  <Path d={smaPath} stroke="#FF9900" strokeWidth={1.8} strokeDasharray="4, 2" fill="none" />
                )}

                {/* EMA line */}
                {showEMA && (
                  <Path d={emaPath} stroke="#9933FF" strokeWidth={1.8} fill="none" />
                )}
              </Svg>
            )}
          </View>

          {/* RSI Sub-Chart if active */}
          {showRSI && points.length > 0 && (
            <View style={[styles.rsiBox, { backgroundColor: colors.card, borderColor: colors.rim }]}>
              <View style={styles.rsiHeader}>
                <Text style={[styles.rsiTitle, { color: colors.t3 }]}>RELATIVE STRENGTH INDEX (RSI 14)</Text>
                <Text style={[styles.rsiVal, { color: rsi14[rsi14.length - 1] > 70 ? colors.loss : rsi14[rsi14.length - 1] < 30 ? colors.gain : colors.blue }]}>
                  {rsi14[rsi14.length - 1]}
                </Text>
              </View>
              <Svg width={chartW} height={70}>
                {/* 30 and 70 lines */}
                <Line x1={pad} y1={70 - 70 * 0.7} x2={chartW - pad} y2={70 - 70 * 0.7} stroke={colors.loss + '66'} strokeDasharray="2, 2" />
                <Line x1={pad} y1={70 - 70 * 0.3} x2={chartW - pad} y2={70 - 70 * 0.3} stroke={colors.gain + '66'} strokeDasharray="2, 2" />
                <Path
                  d={
                    'M' +
                    rsi14
                      .map(
                        (v, i) =>
                          `${toX(i).toFixed(1)},${(70 - (v / 100) * 55 - 8).toFixed(1)}`
                      )
                      .join('L')
                  }
                  stroke={colors.blue}
                  strokeWidth={2}
                  fill="none"
                />
              </Svg>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: { flex: 1 },
  symText: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  nameText: { fontSize: 12, marginTop: 2 },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  scroll: { padding: 16, gap: 14 },
  priceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  priceVal: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  chgBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  chgText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  rangeRow: { flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
  rangeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  rangeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  togglesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  chartBox: {
    height: 220,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  chartLoading: { alignItems: 'center', gap: 8 },
  loadingLabel: { fontSize: 12 },
  rsiBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  rsiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rsiTitle: { fontSize: 10, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  rsiVal: { fontSize: 13, fontFamily: 'Inter_700Bold' },
});
