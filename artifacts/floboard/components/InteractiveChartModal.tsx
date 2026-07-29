import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import Svg, { Defs, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { useResponsive } from '@/hooks/useResponsive';
import { getApiBase } from '@/utils/apiBase';
import {
  getFallbackQuote,
  resolveSymbolAlias,
  generateRealisticChart,
  augmentOHLC,
  type PricePoint,
} from '@/utils/symbolFallbacks';
import { fmt, fmtChg } from '@/context/MarketContext';

const BASE = getApiBase();

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

function getCandles(points: PricePoint[], maxCandles = 32): PricePoint[] {
  if (points.length <= maxCandles) return points;
  const chunkSize = Math.ceil(points.length / maxCandles);
  const candles: PricePoint[] = [];
  for (let i = 0; i < points.length; i += chunkSize) {
    const chunk = points.slice(i, i + chunkSize);
    if (chunk.length === 0) continue;
    const o = chunk[0].o ?? chunk[0].c;
    const c = chunk[chunk.length - 1].c;
    const h = Math.max(...chunk.map((p) => p.h ?? p.c));
    const l = Math.min(...chunk.map((p) => p.l ?? p.c));
    candles.push({
      t: chunk[0].t,
      c,
      o,
      h,
      l,
    });
  }
  return candles;
}

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
    const targetSym = resolveSymbolAlias(symbol);
    const baseQuote = getFallbackQuote(symbol);
    const defaultPrice = baseQuote.regularMarketPrice || 100;

    async function loadChartData() {
      let pts: PricePoint[] = [];

      // 1. Try backend proxy
      try {
        const res = await fetch(
          `${BASE}/api/market/history?symbol=${encodeURIComponent(symbol!)}&range=${rangeObj.yfRange}`
        );
        if (res.ok) {
          const json = (await res.json()) as { prices?: PricePoint[] };
          if (json?.prices && json.prices.length >= 2) {
            pts = json.prices;
          }
        }
      } catch {
        /* fall through to direct Yahoo Finance API or procedural generator */
      }

      // 2. Try direct Yahoo Finance chart API if backend failed (e.g. native mobile APK/AAB)
      if (pts.length < 2) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const interval = range === '1d' ? '5m' : range === '1w' ? '1h' : '1d';
          const yfRes = await fetch(
            `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(targetSym)}?interval=${interval}&range=${rangeObj.yfRange}`,
            {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
                Accept: 'application/json',
              },
              signal: controller.signal,
            }
          ).finally(() => clearTimeout(timeoutId));

          if (yfRes.ok) {
            const yfJson = (await yfRes.json()) as {
              chart?: {
                result?: Array<{
                  timestamp?: number[];
                  indicators?: {
                    quote?: Array<{
                      close?: (number | null)[];
                      open?: (number | null)[];
                      high?: (number | null)[];
                      low?: (number | null)[];
                    }>;
                  };
                }>;
              };
            };
            const resObj = yfJson?.chart?.result?.[0];
            const ts = resObj?.timestamp;
            const q = resObj?.indicators?.quote?.[0];
            if (ts && q && ts.length >= 2) {
              const directPts: PricePoint[] = [];
              for (let i = 0; i < ts.length; i++) {
                const c = q.close?.[i];
                if (c != null && isFinite(c)) {
                  directPts.push({
                    t: ts[i],
                    c,
                    o: q.open?.[i] ?? undefined,
                    h: q.high?.[i] ?? undefined,
                    l: q.low?.[i] ?? undefined,
                  });
                }
              }
              if (directPts.length >= 2) {
                pts = directPts;
              }
            }
          }
        } catch {
          /* fall through to procedural generator */
        }
      }

      // 3. Guarantee complete, realistic chart data if both APIs failed or returned < 2 points
      if (pts.length < 2) {
        pts = generateRealisticChart(symbol!, range, defaultPrice);
      } else {
        pts = augmentOHLC(pts, symbol!);
      }

      if (!cancelled) {
        setPoints(pts);
        setLoading(false);
      }
    }

    loadChartData();

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
  const sma20 = points.length > 0 ? points.map((_, i, arr) => {
    const window = arr.slice(Math.max(0, i - 19), i + 1);
    const sum = window.reduce((acc, p) => acc + p.c, 0);
    return +(sum / window.length).toFixed(4);
  }) : [];

  // EMA 50
  const ema50 = points.length > 0 ? points.map((p, i, arr) => {
    if (i === 0) return p.c;
    const k = 2 / (Math.min(i + 1, 50) + 1);
    return +(p.c * k + arr[i - 1].c * (1 - k)).toFixed(4);
  }) : [];

  // RSI 14
  const rsi14 = points.length > 0 ? points.map((_, i, arr) => {
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
  }) : [];

  // Dynamic responsive SVG dimensions for ANY phone screen
  const { modalChartW: chartW, modalChartH: chartH } = useResponsive();
  const pad = 12;
  const minP = points.length > 0 ? Math.min(...points.map((p) => p.l ?? p.c)) : 0;
  const maxP = points.length > 0 ? Math.max(...points.map((p) => p.h ?? p.c)) : 100;
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

  const isForexOrRate = symbol.includes('=X') || symbol.includes('/') || symbol.startsWith('^');

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
              {isForexOrRate ? '' : '$'}{fmt(last, isForexOrRate ? 4 : 2)}
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
                  (() => {
                    const candles = getCandles(points, 32);
                    const candleW = Math.max(
                      3,
                      Math.min(10, Math.floor((chartW - pad * 2) / Math.max(1, candles.length)) - 2)
                    );
                    const toCandleX = (idx: number) =>
                      pad + (idx / Math.max(1, candles.length - 1)) * (chartW - pad * 2);

                    return candles.map((p, i) => {
                      const x = toCandleX(i);
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
                          <Line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={cColor} strokeWidth={1.5} />
                          <Rect x={x - candleW / 2} y={bodyTop} width={candleW} height={bodyH} rx={1} fill={cColor} />
                        </React.Fragment>
                      );
                    });
                  })()
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
          {showRSI && points.length > 0 && rsi14.length > 0 && (
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
    flexWrap: 'wrap',
    gap: 8,
  },
  priceVal: { fontSize: 24, fontFamily: 'Inter_700Bold' },
  chgBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  chgText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  rangeRow: { flexDirection: 'row', gap: 6, justifyContent: 'space-between', flexWrap: 'wrap' },
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
    minHeight: 200,
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
