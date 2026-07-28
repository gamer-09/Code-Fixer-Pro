import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { useMarket } from '@/context/MarketContext';
import { getApiBase } from '@/utils/apiBase';

const BASE = getApiBase();

interface PricePoint { t: number; c: number }

async function fetchHistory(symbol: string, range: string): Promise<PricePoint[]> {
  try {
    const res = await fetch(
      `${BASE}/api/market/history?symbol=${encodeURIComponent(symbol)}&range=${range}`
    );
    if (!res.ok) return [];
    const json = await res.json() as { prices?: PricePoint[] };
    return json.prices ?? [];
  } catch {
    return [];
  }
}

function buildPath(
  points: PricePoint[],
  width: number,
  height: number,
  pad = 3,
): { linePath: string; areaPath: string } {
  if (points.length < 2) return { linePath: '', areaPath: '' };
  const minP = Math.min(...points.map((p) => p.c));
  const maxP = Math.max(...points.map((p) => p.c));
  const range = maxP - minP || 1;
  const w = width - pad * 2;
  const h = height - pad * 2;
  const toX = (i: number) => pad + (i / (points.length - 1)) * w;
  const toY = (v: number) => pad + h - ((v - minP) / range) * h;

  const coords = points.map((p, i) => `${toX(i).toFixed(1)},${toY(p.c).toFixed(1)}`);
  const linePath = 'M' + coords.join('L');
  const areaPath =
    `M${pad.toFixed(1)},${(pad + h).toFixed(1)}` +
    `L${coords.join('L')}` +
    `L${(pad + w).toFixed(1)},${(pad + h).toFixed(1)}Z`;

  return { linePath, areaPath };
}

interface SparklineChartProps {
  symbol: string;
  range?: '1d' | '7d' | '1mo' | '3mo';
  width?: number;
  height?: number;
  /** Override line/fill color — defaults to green/red based on direction */
  color?: string;
  showLabels?: boolean;
}

export default function SparklineChart({
  symbol,
  range = '7d',
  width = 200,
  height = 56,
  color,
  showLabels = false,
}: SparklineChartProps) {
  const colors = useColors();
  const { refreshKey } = useMarket();
  const [points, setPoints] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchHistory(symbol, range).then((data) => {
      if (!cancelled) { setPoints(data); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [symbol, range, refreshKey]);

  if (loading) {
    return (
      <View style={[styles.wrap, { width, height }]}>
        <ActivityIndicator size="small" color={colors.t4} />
      </View>
    );
  }

  if (points.length < 2) {
    return (
      <View style={[styles.wrap, { width, height }]}>
        <Text style={[styles.noData, { color: colors.t4 }]}>No chart data</Text>
      </View>
    );
  }

  const first = points[0].c;
  const last = points[points.length - 1].c;
  const pct = ((last - first) / first) * 100;
  const isUp = pct >= 0;
  const lineColor = color ?? (isUp ? colors.gain : colors.loss);
  const gradId = `grad_${symbol.replace(/[^a-z0-9]/gi, '_')}_${range}`;

  const { linePath, areaPath } = buildPath(points, width, height);

  return (
    <View>
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
            <Stop offset="100%" stopColor={lineColor} stopOpacity={0} />
          </LinearGradient>
        </Defs>
        <Path d={areaPath} fill={`url(#${gradId})`} />
        <Path d={linePath} stroke={lineColor} strokeWidth={1.5} fill="none" strokeLinejoin="round" />
      </Svg>
      {showLabels && (
        <View style={styles.labels}>
          <Text style={[styles.labelRange, { color: colors.t4 }]}>
            {range === '1d' ? 'Today' : range === '7d' ? '7D' : range === '1mo' ? '1M' : '3M'}
          </Text>
          <Text style={[styles.labelPct, { color: lineColor }]}>
            {pct >= 0 ? '+' : ''}{pct.toFixed(2)}%
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  noData: { fontSize: 9, fontFamily: 'Inter_400Regular' },
  labels: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 2, marginTop: 1,
  },
  labelRange: { fontSize: 9, fontFamily: 'Inter_500Medium' },
  labelPct: { fontSize: 9, fontFamily: 'Inter_600SemiBold' },
});
