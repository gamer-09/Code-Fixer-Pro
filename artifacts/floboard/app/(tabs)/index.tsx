import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import SparklineChart from '@/components/SparklineChart';
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
import { BONDS, COMMODITIES, CRYPTOS, EXTRA_SYMBOLS, FOREX, INDICES, SECTORS, STOCKS } from '@/constants/marketData';

function LivePulse({ online = true }: { online?: boolean }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!online) { anim.setValue(0.4); return; }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.25, duration: 900, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [online]);
  return (
    <Animated.View
      style={[
        styles.pulse,
        { opacity: anim, backgroundColor: online ? '#00E5A0' : '#FF6B6B' },
      ]}
    />
  );
}

function SectionHeader({ label, count, right }: { label: string; count?: number; right?: React.ReactNode }) {
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
      {right}
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

// ── Market Hours ──────────────────────────────────────────────────────────

interface Session { oh: number; om: number; ch: number; cm: number; }
interface Exchange {
  name: string;
  full: string;
  flag: string;
  tz: string;
  sessions: Session[];
  region: string;
  weekends?: number[]; // 0=Sun,6=Sat; default [0,6]
}

const EXCHANGES: Exchange[] = [
  // ── Americas
  { name: 'NYSE', full: 'New York Stock Exchange', flag: '🇺🇸', tz: 'America/New_York', sessions: [{ oh: 9, om: 30, ch: 16, cm: 0 }], region: 'Americas' },
  { name: 'NASDAQ', full: 'NASDAQ', flag: '🇺🇸', tz: 'America/New_York', sessions: [{ oh: 9, om: 30, ch: 16, cm: 0 }], region: 'Americas' },
  { name: 'TSX', full: 'Toronto Stock Exchange', flag: '🇨🇦', tz: 'America/Toronto', sessions: [{ oh: 9, om: 30, ch: 16, cm: 0 }], region: 'Americas' },
  { name: 'BMV', full: 'Bolsa Mexicana de Valores', flag: '🇲🇽', tz: 'America/Mexico_City', sessions: [{ oh: 8, om: 30, ch: 15, cm: 0 }], region: 'Americas' },
  { name: 'B3', full: 'B3 Brazil', flag: '🇧🇷', tz: 'America/Sao_Paulo', sessions: [{ oh: 10, om: 0, ch: 17, cm: 55 }], region: 'Americas' },
  { name: 'BYMA', full: 'Buenos Aires Stock Exchange', flag: '🇦🇷', tz: 'America/Argentina/Buenos_Aires', sessions: [{ oh: 11, om: 0, ch: 17, cm: 0 }], region: 'Americas' },
  // ── Europe
  { name: 'LSE', full: 'London Stock Exchange', flag: '🇬🇧', tz: 'Europe/London', sessions: [{ oh: 8, om: 0, ch: 16, cm: 30 }], region: 'Europe' },
  { name: 'XETRA', full: 'Deutsche Börse (Frankfurt)', flag: '🇩🇪', tz: 'Europe/Berlin', sessions: [{ oh: 9, om: 0, ch: 17, cm: 30 }], region: 'Europe' },
  { name: 'Euronext', full: 'Euronext Paris / Amsterdam', flag: '🇫🇷', tz: 'Europe/Paris', sessions: [{ oh: 9, om: 0, ch: 17, cm: 30 }], region: 'Europe' },
  { name: 'SIX', full: 'SIX Swiss Exchange', flag: '🇨🇭', tz: 'Europe/Zurich', sessions: [{ oh: 9, om: 0, ch: 17, cm: 30 }], region: 'Europe' },
  { name: 'OMX', full: 'OMX Stockholm', flag: '🇸🇪', tz: 'Europe/Stockholm', sessions: [{ oh: 9, om: 0, ch: 17, cm: 30 }], region: 'Europe' },
  { name: 'Oslo', full: 'Oslo Børs', flag: '🇳🇴', tz: 'Europe/Oslo', sessions: [{ oh: 9, om: 0, ch: 16, cm: 30 }], region: 'Europe' },
  { name: 'MOEX', full: 'Moscow Exchange', flag: '🇷🇺', tz: 'Europe/Moscow', sessions: [{ oh: 9, om: 50, ch: 18, cm: 50 }], region: 'Europe' },
  { name: 'WSE', full: 'Warsaw Stock Exchange', flag: '🇵🇱', tz: 'Europe/Warsaw', sessions: [{ oh: 9, om: 0, ch: 17, cm: 5 }], region: 'Europe' },
  { name: 'BVB', full: 'Bucharest Stock Exchange', flag: '🇷🇴', tz: 'Europe/Bucharest', sessions: [{ oh: 10, om: 0, ch: 18, cm: 0 }], region: 'Europe' },
  { name: 'IBEX', full: 'BME (Madrid)', flag: '🇪🇸', tz: 'Europe/Madrid', sessions: [{ oh: 9, om: 0, ch: 17, cm: 30 }], region: 'Europe' },
  // ── Asia-Pacific
  { name: 'TSE', full: 'Tokyo Stock Exchange', flag: '🇯🇵', tz: 'Asia/Tokyo', sessions: [{ oh: 9, om: 0, ch: 11, cm: 30 }, { oh: 12, om: 30, ch: 15, cm: 30 }], region: 'Asia-Pacific' },
  { name: 'SSE', full: 'Shanghai Stock Exchange', flag: '🇨🇳', tz: 'Asia/Shanghai', sessions: [{ oh: 9, om: 30, ch: 11, cm: 30 }, { oh: 13, om: 0, ch: 15, cm: 0 }], region: 'Asia-Pacific' },
  { name: 'HKEX', full: 'Hong Kong Exchange', flag: '🇭🇰', tz: 'Asia/Hong_Kong', sessions: [{ oh: 9, om: 30, ch: 12, cm: 0 }, { oh: 13, om: 0, ch: 16, cm: 0 }], region: 'Asia-Pacific' },
  { name: 'SGX', full: 'Singapore Exchange', flag: '🇸🇬', tz: 'Asia/Singapore', sessions: [{ oh: 9, om: 0, ch: 17, cm: 0 }], region: 'Asia-Pacific' },
  { name: 'BSE', full: 'BSE / NSE India', flag: '🇮🇳', tz: 'Asia/Kolkata', sessions: [{ oh: 9, om: 15, ch: 15, cm: 30 }], region: 'Asia-Pacific' },
  { name: 'ASX', full: 'Australian Securities Exchange', flag: '🇦🇺', tz: 'Australia/Sydney', sessions: [{ oh: 10, om: 0, ch: 16, cm: 0 }], region: 'Asia-Pacific' },
  { name: 'KRX', full: 'Korea Exchange', flag: '🇰🇷', tz: 'Asia/Seoul', sessions: [{ oh: 9, om: 0, ch: 15, cm: 30 }], region: 'Asia-Pacific' },
  { name: 'TWSE', full: 'Taiwan Stock Exchange', flag: '🇹🇼', tz: 'Asia/Taipei', sessions: [{ oh: 9, om: 0, ch: 13, cm: 30 }], region: 'Asia-Pacific' },
  { name: 'NZX', full: 'NZX New Zealand', flag: '🇳🇿', tz: 'Pacific/Auckland', sessions: [{ oh: 10, om: 0, ch: 17, cm: 0 }], region: 'Asia-Pacific' },
  { name: 'SET', full: 'Stock Exchange of Thailand', flag: '🇹🇭', tz: 'Asia/Bangkok', sessions: [{ oh: 10, om: 0, ch: 12, cm: 30 }, { oh: 14, om: 30, ch: 16, cm: 30 }], region: 'Asia-Pacific' },
  { name: 'IDX', full: 'Indonesia Stock Exchange', flag: '🇮🇩', tz: 'Asia/Jakarta', sessions: [{ oh: 9, om: 0, ch: 11, cm: 30 }, { oh: 13, om: 30, ch: 16, cm: 0 }], region: 'Asia-Pacific' },
  // ── Middle East & Africa
  { name: 'Tadawul', full: 'Saudi Exchange', flag: '🇸🇦', tz: 'Asia/Riyadh', sessions: [{ oh: 10, om: 0, ch: 15, cm: 0 }], weekends: [5, 6], region: 'Mid East & Africa' },
  { name: 'DFM', full: 'Dubai Financial Market', flag: '🇦🇪', tz: 'Asia/Dubai', sessions: [{ oh: 10, om: 0, ch: 14, cm: 0 }], weekends: [5, 6], region: 'Mid East & Africa' },
  { name: 'TASE', full: 'Tel Aviv Stock Exchange', flag: '🇮🇱', tz: 'Asia/Jerusalem', sessions: [{ oh: 9, om: 59, ch: 17, cm: 25 }], weekends: [5, 6], region: 'Mid East & Africa' },
  { name: 'JSE', full: 'Johannesburg Stock Exchange', flag: '🇿🇦', tz: 'Africa/Johannesburg', sessions: [{ oh: 9, om: 0, ch: 17, cm: 0 }], region: 'Mid East & Africa' },
  { name: 'EGX', full: 'Egyptian Exchange', flag: '🇪🇬', tz: 'Africa/Cairo', sessions: [{ oh: 10, om: 0, ch: 14, cm: 30 }], weekends: [5, 6], region: 'Mid East & Africa' },
  { name: 'NGX', full: 'Nigerian Exchange Group', flag: '🇳🇬', tz: 'Africa/Lagos', sessions: [{ oh: 9, om: 30, ch: 14, cm: 30 }], region: 'Mid East & Africa' },
];

function getLocalMinutes(tz: string): { minutes: number; weekday: number } {
  try {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false,
    }).formatToParts(now);
    const weekdayStr = parts.find((p) => p.type === 'weekday')?.value ?? '';
    const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const weekday = weekdayMap[weekdayStr] ?? 0;
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value ?? '0');
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value ?? '0');
    return { minutes: h * 60 + m, weekday };
  } catch { return { minutes: 0, weekday: 0 }; }
}

function getLocalTimeStr(tz: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true,
    }).format(new Date());
  } catch { return ''; }
}

interface ExchangeStatus {
  open: boolean;
  localTime: string;
  minutesToChange: number; // minutes until next open/close, 0 if unknown
  changeLabel: string;     // 'Opens' or 'Closes'
}

function getStatus(ex: Exchange): ExchangeStatus {
  const { minutes, weekday } = getLocalMinutes(ex.tz);
  const localTime = getLocalTimeStr(ex.tz);
  const weekends = ex.weekends ?? [0, 6];
  const isWeekend = weekends.includes(weekday);

  if (isWeekend) {
    return { open: false, localTime, minutesToChange: 0, changeLabel: 'Opens' };
  }

  for (const s of ex.sessions) {
    const start = s.oh * 60 + s.om;
    const end = s.ch * 60 + s.cm;
    if (minutes >= start && minutes < end) {
      return { open: true, localTime, minutesToChange: end - minutes, changeLabel: 'Closes' };
    }
  }

  // Find next session open
  const nextOpen = ex.sessions.map((s) => s.oh * 60 + s.om).filter((t) => t > minutes).sort((a, b) => a - b)[0];
  if (nextOpen != null) {
    return { open: false, localTime, minutesToChange: nextOpen - minutes, changeLabel: 'Opens' };
  }
  return { open: false, localTime, minutesToChange: 0, changeLabel: 'Opens' };
}

function fmtCountdown(mins: number): string {
  if (mins <= 0) return '';
  if (mins < 60) return `${mins}m`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function LiveStatusDot({ open }: { open: boolean }) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!open) { anim.setValue(0.4); return; }
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    ).start();
    return () => anim.stopAnimation();
  }, [open]);
  return <Animated.View style={[styles.hoursDot, { backgroundColor: open ? colors.gain : colors.t4, opacity: anim }]} />;
}

function MarketHoursSection() {
  const colors = useColors();
  const [statuses, setStatuses] = useState<ExchangeStatus[]>([]);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const update = () => {
      setNow(new Date());
      setStatuses(EXCHANGES.map(getStatus));
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  const openCount = statuses.filter((s) => s.open).length;
  const regions = Array.from(new Set(EXCHANGES.map((e) => e.region)));

  return (
    <View style={styles.section}>
      <SectionHeader
        label={`Market Hours`}
        right={
          <View style={styles.hoursCountWrap}>
            <View style={[styles.hoursOpenBadge, { backgroundColor: colors.gainDim }]}>
              <View style={[styles.hoursDotSmall, { backgroundColor: colors.gain }]} />
              <Text style={[styles.hoursOpenText, { color: colors.gain }]}>{openCount} open</Text>
            </View>
            <Text style={[styles.hoursTotalText, { color: colors.t4 }]}>/ {EXCHANGES.length}</Text>
          </View>
        }
      />
      {regions.map((region) => {
        const regionExchanges = EXCHANGES.filter((e) => e.region === region);
        return (
          <View key={region} style={styles.regionBlock}>
            <Text style={[styles.regionLabel, { color: colors.t4 }]}>{region.toUpperCase()}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
              {regionExchanges.map((ex, i) => {
                const s = statuses[EXCHANGES.indexOf(ex)];
                if (!s) return null;
                const countdown = fmtCountdown(s.minutesToChange);
                return (
                  <View
                    key={ex.name}
                    style={[
                      styles.hoursChip,
                      { backgroundColor: s.open ? colors.gainDim : colors.card, borderColor: s.open ? 'rgba(0,229,160,0.3)' : colors.rim },
                    ]}
                  >
                    <View style={styles.hoursChipTop}>
                      <Text style={styles.hoursFlag}>{ex.flag}</Text>
                      <LiveStatusDot open={s.open} />
                    </View>
                    <Text style={[styles.hoursName, { color: s.open ? colors.gain : colors.t2 }]}>{ex.name}</Text>
                    <Text style={[styles.hoursLocalTime, { color: s.open ? colors.gain : colors.t4 }]}>{s.localTime}</Text>
                    <Text style={[styles.hoursStatus, { color: s.open ? colors.gain : colors.t4 }]}>
                      {s.open ? 'OPEN' : 'CLOSED'}
                    </Text>
                    {countdown !== '' && (
                      <Text style={[styles.hoursCountdown, { color: s.open ? colors.amber : colors.t4 }]}>
                        {s.changeLabel} {countdown}
                      </Text>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        );
      })}
    </View>
  );
}

// ── Macro Pulse Ribbon ────────────────────────────────────────────────────

const RIBBON_SYMBOLS = [
  { sym: '^GSPC', label: 'S&P 500' },
  { sym: '^IXIC', label: 'Nasdaq' },
  { sym: 'BTC-USD', label: 'Bitcoin' },
  { sym: 'GC=F', label: 'Gold' },
  { sym: 'DX-Y.NYB', label: 'DXY' },
  { sym: '^TNX', label: '10Y' },
];

function MacroRibbon() {
  const colors = useColors();
  const { data } = useMarket();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ribbonScroll}>
      {RIBBON_SYMBOLS.map(({ sym, label }) => {
        const d = data[sym];
        const chg = d?.regularMarketChangePercent ?? 0;
        const dir = chgDir(chg);
        const col = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.amber;
        const arrow = dir === 'up' ? '▲' : dir === 'dn' ? '▼' : '—';
        return (
          <View key={sym} style={[styles.ribbonChip, { backgroundColor: colors.card, borderColor: colors.rim }]}>
            <Text style={[styles.ribbonLabel, { color: colors.t4 }]}>{label}</Text>
            <Text style={[styles.ribbonVal, { color: colors.t1 }]}>
              {d ? (sym === '^TNX' || sym === '^VIX' ? `${fmt(d.regularMarketPrice, 2)}%` : sym === 'DX-Y.NYB' ? fmt(d.regularMarketPrice, 2) : sym === '^GSPC' || sym === '^IXIC' ? fmt(d.regularMarketPrice, 0) : sym === 'BTC-USD' ? `$${fmt(d.regularMarketPrice, 0)}` : `$${fmt(d.regularMarketPrice)}`) : '—'}
            </Text>
            {d && <Text style={[styles.ribbonArrow, { color: col }]}>{arrow} {Math.abs(chg).toFixed(1)}%</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ── Sector Heatmap ────────────────────────────────────────────────────────

function SectorTile({ sym, label }: { sym: string; label: string }) {
  const colors = useColors();
  const { data } = useMarket();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const abs = Math.abs(chg);

  let bg: string, textCol: string, borderCol: string;
  if (!d) { bg = colors.card; textCol = colors.t3; borderCol = colors.rim; }
  else if (dir === 'up') {
    bg = abs > 2 ? '#00E5A030' : abs > 1 ? '#00E5A01A' : '#00E5A00D';
    textCol = colors.gain; borderCol = 'rgba(0,229,160,0.2)';
  } else if (dir === 'dn') {
    bg = abs > 2 ? '#FF4D6A30' : abs > 1 ? '#FF4D6A1A' : '#FF4D6A0D';
    textCol = colors.loss; borderCol = 'rgba(255,77,106,0.2)';
  } else { bg = colors.amberDim; textCol = colors.amber; borderCol = colors.rim; }

  return (
    <View style={[styles.sectorTile, { backgroundColor: bg, borderColor: borderCol }]}>
      <Text style={[styles.sectorSym, { color: colors.t4 }]}>{sym}</Text>
      <Text style={[styles.sectorLabel, { color: colors.t2 }]} numberOfLines={2}>{label.replace(' SPDR', '').replace(' ETF', '')}</Text>
      <Text style={[styles.sectorChg, { color: textCol }]}>{d ? fmtChg(chg) : '—'}</Text>
    </View>
  );
}

function SectorsSection() {
  const colors = useColors();
  const { data } = useMarket();
  const loaded = SECTORS.filter((s) => data[s.sym]);
  const up = loaded.filter((s) => (data[s.sym]?.regularMarketChangePercent ?? 0) > 0).length;
  const dn = loaded.filter((s) => (data[s.sym]?.regularMarketChangePercent ?? 0) < 0).length;

  return (
    <View style={styles.section}>
      <SectionHeader
        label="S&P 500 Sectors"
        count={SECTORS.length}
        right={loaded.length > 0 ? (
          <View style={styles.adRatioWrap}>
            <Text style={[styles.adUp, { color: colors.gain }]}>{up}↑</Text>
            <Text style={[styles.adDn, { color: colors.loss }]}>{dn}↓</Text>
          </View>
        ) : undefined}
      />
      <View style={styles.sectorGrid}>
        {SECTORS.map((s) => (
          <SectorTile key={s.sym} sym={s.sym} label={s.label} />
        ))}
      </View>
    </View>
  );
}

// ── Bond Yields ────────────────────────────────────────────────────────────

function BondsSection() {
  const colors = useColors();
  const { data } = useMarket();

  const vix = data['^VIX'];
  const dxy = data['DX-Y.NYB'];
  const vixVal = vix?.regularMarketPrice;
  const dxyChg = dxy?.regularMarketChangePercent;

  const maxYield = Math.max(...BONDS.map((b) => data[b.sym]?.regularMarketPrice ?? 0), 6);
  const vixLevel = !vixVal ? 'neutral' : vixVal < 15 ? 'greed' : vixVal > 25 ? 'fear' : 'neutral';
  const vixColor = vixLevel === 'greed' ? colors.gain : vixLevel === 'fear' ? colors.loss : colors.amber;
  const vixLabel = vixLevel === 'greed' ? 'LOW FEAR' : vixLevel === 'fear' ? 'HIGH FEAR' : 'NEUTRAL';

  return (
    <View style={styles.section}>
      <SectionHeader label="Bond Yields & Volatility" />
      <View style={[styles.bondsCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
        <Text style={[styles.bondsTitle, { color: colors.t4 }]}>US TREASURY YIELD CURVE</Text>
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
              <Text style={[styles.yieldChg, { color: barCol }]}>
                {d ? (chg >= 0 ? `+${fmt(Math.abs(chg), 1)}` : `-${fmt(Math.abs(chg), 1)}`) : ''}
              </Text>
            </View>
          );
        })}
        <View style={[styles.macroRow, { borderTopColor: colors.rim }]}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroLabel, { color: colors.t4 }]}>VIX</Text>
            <Text style={[styles.macroVal, { color: vixColor }]}>{vixVal != null ? fmt(vixVal, 1) : '—'}</Text>
            <View style={[styles.macroTagWrap, { backgroundColor: vixLevel === 'fear' ? colors.lossDim : vixLevel === 'greed' ? colors.gainDim : colors.amberDim }]}>
              <Text style={[styles.macroTag, { color: vixColor }]}>{vixVal ? vixLabel : 'N/A'}</Text>
            </View>
          </View>
          <View style={[styles.macroDivider, { backgroundColor: colors.rim }]} />
          <View style={styles.macroItem}>
            <Text style={[styles.macroLabel, { color: colors.t4 }]}>US DOLLAR INDEX</Text>
            <Text style={[styles.macroVal, { color: chgDir(dxyChg) === 'up' ? colors.gain : chgDir(dxyChg) === 'dn' ? colors.loss : colors.t1 }]}>
              {dxy?.regularMarketPrice != null ? fmt(dxy.regularMarketPrice, 2) : '—'}
            </Text>
            <Text style={[styles.macroTag, { color: colors.t4 }]}>{dxyChg != null ? fmtChg(dxyChg) : ''}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ── Top Movers ────────────────────────────────────────────────────────────

function MoversSection() {
  const colors = useColors();
  const { data } = useMarket();
  const [moverTab, setMoverTab] = useState<'All' | 'Stocks' | 'Crypto' | 'Forex'>('All');

  const universe = useMemo(() => {
    if (moverTab === 'Stocks') {
      return STOCKS.map((s) => ({ sym: s.sym, name: s.name }));
    }
    if (moverTab === 'Crypto') {
      return CRYPTOS.map((c) => ({ sym: c.sym, name: c.name }));
    }
    if (moverTab === 'Forex') {
      return FOREX.map((f) => ({ sym: f.sym, name: f.label }));
    }
    return [
      ...STOCKS.map((s) => ({ sym: s.sym, name: s.name })),
      ...CRYPTOS.map((c) => ({ sym: c.sym, name: c.name })),
      ...FOREX.map((f) => ({ sym: f.sym, name: f.label })),
      ...COMMODITIES.map((c) => ({ sym: c.sym, name: c.label })),
    ];
  }, [moverTab]);

  const loaded = universe.filter((s) => data[s.sym] != null);
  if (loaded.length < 4) return null;

  const sorted = [...loaded].sort(
    (a, b) => (data[b.sym]?.regularMarketChangePercent ?? 0) - (data[a.sym]?.regularMarketChangePercent ?? 0)
  );
  const gainers = sorted.slice(0, 5);
  const losers = sorted.slice(-5).reverse();

  const MoverRow = ({ sym, name, col }: { sym: string; name: string; col: string }) => {
    const d = data[sym];
    const chg = d?.regularMarketChangePercent ?? 0;
    return (
      <View style={[styles.moverRow, { borderBottomColor: colors.rim }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.moverSym, { color: colors.t1 }]}>{sym}</Text>
          <Text style={[styles.moverName, { color: colors.t4 }]} numberOfLines={1}>{name}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[styles.moverChg, { color: col }]}>{fmtChg(chg)}</Text>
          <Text style={[styles.moverPrice, { color: colors.t3 }]}>
            ${fmt(d?.regularMarketPrice, sym.includes('=X') || sym.includes('/') ? 4 : 2)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.section}>
      <View style={styles.secHdRow}>
        <SectionHeader label="Today's Top Movers" />
        <View style={styles.moverTabs}>
          {(['All', 'Stocks', 'Crypto', 'Forex'] as const).map((t) => {
            const active = moverTab === t;
            return (
              <Pressable
                key={t}
                onPress={() => setMoverTab(t)}
                style={[
                  styles.moverTabBtn,
                  {
                    backgroundColor: active ? colors.blue : colors.card,
                    borderColor: active ? colors.blue : colors.rim,
                  },
                ]}
              >
                <Text style={[styles.moverTabBtnText, { color: active ? '#fff' : colors.t3 }]}>
                  {t}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.moversGrid}>
        <View style={[styles.moversCol, { backgroundColor: colors.card, borderColor: 'rgba(0,229,160,0.2)' }]}>
          <View style={[styles.moversColHd, { borderBottomColor: colors.rim }]}>
            <View style={[styles.moversDot, { backgroundColor: colors.gain }]} />
            <Text style={[styles.moversColTitle, { color: colors.gain }]}>GAINERS</Text>
          </View>
          {gainers.map((s) => <MoverRow key={s.sym} sym={s.sym} name={s.name} col={colors.gain} />)}
        </View>
        <View style={[styles.moversCol, { backgroundColor: colors.card, borderColor: 'rgba(255,77,106,0.2)' }]}>
          <View style={[styles.moversColHd, { borderBottomColor: colors.rim }]}>
            <View style={[styles.moversDot, { backgroundColor: colors.loss }]} />
            <Text style={[styles.moversColTitle, { color: colors.loss }]}>LOSERS</Text>
          </View>
          {losers.map((s) => <MoverRow key={s.sym} sym={s.sym} name={s.name} col={colors.loss} />)}
        </View>
      </View>
    </View>
  );
}

// ── Index Cards ───────────────────────────────────────────────────────────

function IndexCard({ sym, name, region }: { sym: string; name: string; region: string }) {
  const colors = useColors();
  const { data } = useMarket();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const accent = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.rim;
  const accentBg = dir === 'up' ? colors.gainDim : dir === 'dn' ? colors.lossDim : 'transparent';

  return (
    <View style={[styles.idxCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <View style={[styles.idxAccent, { backgroundColor: accent }]} />
      <View style={styles.idxBody}>
        <Text style={[styles.idxRegion, { color: colors.t4 }]}>{region}</Text>
        <Text style={[styles.idxName, { color: colors.t2 }]} numberOfLines={1}>{name}</Text>
        <Text style={[styles.idxPrice, { color: colors.t1 }]}>{d ? fmt(d.regularMarketPrice, 0) : '—'}</Text>
        {d && (
          <View style={[styles.idxBadge, { backgroundColor: accentBg }]}>
            <Text style={[styles.idxBadgeText, { color: accent }]}>{fmtChg(chg)}</Text>
          </View>
        )}
        <SparklineChart symbol={sym} range="7d" width={110} height={36} color={d ? accent : undefined} />
      </View>
    </View>
  );
}

// ── Forex Chips ───────────────────────────────────────────────────────────

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
      <SparklineChart symbol={sym} range="7d" width={90} height={30} color={col} />
    </View>
  );
}

// ── Commodity Cards ───────────────────────────────────────────────────────

function CommodityCard({ sym, label, unit }: { sym: string; label: string; unit: string }) {
  const colors = useColors();
  const { data } = useMarket();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const col = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.amber;
  return (
    <View style={[styles.comCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <Text style={[styles.comName, { color: colors.t4 }]}>{label}</Text>
      <Text style={[styles.comPrice, { color: colors.amber }]}>{d ? `$${fmt(d.regularMarketPrice)}` : '—'}</Text>
      <Text style={[styles.comUnit, { color: colors.t4 }]}>{unit}</Text>
      {d && <ChangeBadge value={chg} />}
      <SparklineChart symbol={sym} range="7d" width={90} height={30} color={col} />
    </View>
  );
}

// ── Stock Table ───────────────────────────────────────────────────────────

function StockRow({ sym, name, even }: { sym: string; name: string; even: boolean }) {
  const colors = useColors();
  const { data } = useMarket();
  const { settings } = useSettings();
  const d = data[sym];
  const chg = d?.regularMarketChangePercent ?? 0;
  const dir = chgDir(chg);
  const chgColor = dir === 'up' ? colors.gain : dir === 'dn' ? colors.loss : colors.t2;
  const dec = settings.priceDecimals;

  return (
    <View style={[styles.stockRow, { backgroundColor: even ? colors.surface : 'transparent', borderBottomColor: colors.rim }]}>
      <View style={styles.stockInfo}>
        <Text style={[styles.stockSym, { color: colors.t1 }]}>{sym}</Text>
        <Text style={[styles.stockName, { color: colors.t4 }]} numberOfLines={1}>{name}</Text>
      </View>
      <Text style={[styles.stockPrice, { color: colors.t1 }]}>{d ? `$${fmt(d.regularMarketPrice, dec)}` : '—'}</Text>
      <Text style={[styles.stockChg, { color: chgColor }]}>{d ? fmtChg(chg) : '—'}</Text>
      <Text style={[styles.stockMcap, { color: colors.t3 }]}>{d ? fmtMcap(d.marketCap, settings.compactNumbers) : '—'}</Text>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────

export default function MarketsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { loading, lastUpdated, refresh, isOnline, serverError } = useMarket();
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
          <LivePulse online={isOnline} />
          <Text style={[styles.logoText, { color: colors.t1 }]}>FloBoard</Text>
          <View style={[
            styles.liveChip,
            isOnline
              ? { backgroundColor: colors.gainDim, borderColor: 'rgba(0,229,160,0.2)' }
              : { backgroundColor: colors.lossDim, borderColor: 'rgba(255,107,107,0.25)' },
          ]}>
            <Text style={[styles.liveText, { color: isOnline ? colors.gain : colors.loss }]}>
              {isOnline ? 'LIVE' : 'OFFLINE'}
            </Text>
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

      {/* Server error banner */}
      {serverError != null && (
        <View style={[styles.serverErrorBanner, { backgroundColor: '#FF6B6B22', borderBottomColor: '#FF6B6B55' }]}>
          <Text style={[styles.serverErrorText, { color: '#FF6B6B' }]}>
            ⚠️  API server not running — all values show —
          </Text>
          <Text style={[styles.serverErrorHint, { color: colors.t3 }]}>
            In a terminal: pnpm --filter @workspace/api-server run dev{'\n'}
            Then see LOCAL_DEV.md for full setup.
          </Text>
        </View>
      )}

      {/* Macro ribbon */}
      <View style={[styles.ribbonBar, { backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <MacroRibbon />
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
        <MoversSection />
        <BondsSection />

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
              <Text style={[styles.thText, { color: colors.t4, flex: 2 }]}>COMPANY</Text>
              <Text style={[styles.thText, { color: colors.t4, textAlign: 'right' }]}>PRICE</Text>
              <Text style={[styles.thText, { color: colors.t4, textAlign: 'right' }]}>CHG%</Text>
              <Text style={[styles.thText, { color: colors.t4, flex: 1.2, textAlign: 'right' }]}>MKT CAP</Text>
            </View>
            {STOCKS.map((s, i) => (
              <StockRow key={s.sym} sym={s.sym} name={s.name} even={i % 2 === 1} />
            ))}
          </View>
        </View>

        {lastUpdated && (
          <Text style={[styles.updated, { color: colors.t4 }]}>
            Last updated {lastUpdated.toLocaleTimeString()}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1,
  },
  ribbonBar: { borderBottomWidth: 1 },
  ribbonScroll: { paddingHorizontal: 12, paddingVertical: 8, gap: 6 },
  ribbonChip: {
    borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6,
    alignItems: 'center', minWidth: 72,
  },
  ribbonLabel: { fontSize: 7, fontFamily: 'Inter_700Bold', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 2 },
  ribbonVal: { fontSize: 11, fontFamily: 'Inter_700Bold' },
  ribbonArrow: { fontSize: 9, fontFamily: 'Inter_500Medium', marginTop: 1 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoText: { fontSize: 18, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
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
  adRatioWrap: { flexDirection: 'row', gap: 6 },
  adUp: { fontSize: 9, fontFamily: 'Inter_700Bold' },
  adDn: { fontSize: 9, fontFamily: 'Inter_700Bold' },
  badge: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, alignSelf: 'flex-start' },
  badgeText: { fontSize: 10, fontFamily: 'Inter_500Medium' },

  // Market Hours
  hoursCountWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hoursOpenBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  hoursDotSmall: { width: 5, height: 5, borderRadius: 3 },
  hoursOpenText: { fontSize: 9, fontFamily: 'Inter_700Bold' },
  hoursTotalText: { fontSize: 9, fontFamily: 'Inter_400Regular' },
  regionBlock: { marginBottom: 8 },
  regionLabel: { fontSize: 7, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, marginBottom: 6, textTransform: 'uppercase', paddingLeft: 2 },
  hoursChip: {
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8,
    width: 96, gap: 3,
  },
  hoursChipTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  hoursFlag: { fontSize: 14 },
  hoursDot: { width: 6, height: 6, borderRadius: 3 },
  hoursName: { fontSize: 11, fontFamily: 'Inter_700Bold', letterSpacing: 0.3 },
  hoursLocalTime: { fontSize: 9, fontFamily: 'Inter_500Medium' },
  hoursStatus: { fontSize: 7, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  hoursCountdown: { fontSize: 8, fontFamily: 'Inter_500Medium' },

  // Sectors
  sectorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  sectorTile: { width: '31%', borderRadius: 8, borderWidth: 1, padding: 10 },
  sectorSym: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.5, marginBottom: 3 },
  sectorLabel: { fontSize: 10, fontFamily: 'Inter_500Medium', marginBottom: 5, lineHeight: 13 },
  sectorChg: { fontSize: 14, fontFamily: 'Inter_700Bold' },

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
  macroItem: { flex: 1, alignItems: 'center', gap: 3 },
  macroLabel: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  macroVal: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  macroTagWrap: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  macroTag: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 0.8 },
  macroDivider: { width: 1, marginVertical: 4 },

  // Movers
  secHdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 8,
  },
  moverTabs: {
    flexDirection: 'row',
    gap: 5,
    flexWrap: 'wrap',
  },
  moverTabBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  moverTabBtnText: {
    fontSize: 10,
    fontFamily: 'Inter_600SemiBold',
  },
  moversGrid: { flexDirection: 'row', gap: 8 },
  moversCol: { flex: 1, borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  moversColHd: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 10, paddingBottom: 8, borderBottomWidth: 1 },
  moversDot: { width: 5, height: 5, borderRadius: 3 },
  moversColTitle: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1 },
  moverRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderBottomWidth: 1 },
  moverSym: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  moverName: { fontSize: 8, marginTop: 1, maxWidth: 90 },
  moverChg: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  moverPrice: { fontSize: 9, fontFamily: 'Inter_400Regular', marginTop: 1 },

  // Indices
  idxGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  idxCard: { width: '47.5%', borderRadius: 8, borderWidth: 1, flexDirection: 'row', overflow: 'hidden' },
  idxAccent: { width: 3, alignSelf: 'stretch' },
  idxBody: { flex: 1, padding: 11 },
  idxRegion: { fontSize: 7, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 },
  idxName: { fontSize: 11, fontFamily: 'Inter_500Medium', marginBottom: 6 },
  idxPrice: { fontSize: 17, fontFamily: 'Inter_700Bold', letterSpacing: -0.5, marginBottom: 4 },
  idxBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2, alignSelf: 'flex-start' },
  idxBadgeText: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },

  // Forex
  fxChip: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  fxPair: { fontSize: 11, fontFamily: 'Inter_600SemiBold', letterSpacing: 0.3 },
  fxRate: { fontSize: 11, fontFamily: 'Inter_700Bold' },

  // Commodities
  comCard: { borderRadius: 8, borderWidth: 1, padding: 11, minWidth: 110 },
  comName: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 },
  comPrice: { fontSize: 15, fontFamily: 'Inter_700Bold', marginBottom: 1 },
  comUnit: { fontSize: 8, marginBottom: 6 },

  // Stocks
  tableWrap: { borderRadius: 8, borderWidth: 1, overflow: 'hidden' },
  tableHead: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 7, borderBottomWidth: 1 },
  thText: { flex: 1, fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1, textTransform: 'uppercase' },
  stockRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1 },
  stockInfo: { flex: 2 },
  stockSym: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  stockName: { fontSize: 9, marginTop: 1, maxWidth: 110 },
  stockPrice: { flex: 1, fontSize: 12, fontFamily: 'Inter_500Medium', textAlign: 'right' },
  stockChg: { flex: 1, fontSize: 11, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  stockMcap: { flex: 1.2, fontSize: 10, textAlign: 'right' },

  updated: { textAlign: 'center', fontSize: 10, marginTop: 12, marginBottom: 6 },
  serverErrorBanner: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  serverErrorText: { fontSize: 12, fontFamily: 'Inter_600SemiBold', marginBottom: 4 },
  serverErrorHint: { fontSize: 10, fontFamily: 'Inter_400Regular', lineHeight: 15 },
});
