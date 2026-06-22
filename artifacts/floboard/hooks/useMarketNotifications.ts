import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef } from 'react';
import { useMarket, QuoteData } from '@/context/MarketContext';
import { useSettings } from '@/context/SettingsContext';
import { sendLocalNotification, areNotificationsSupported } from '@/utils/notifications';

const MAJOR_INDICES = [
  { sym: '^GSPC', name: 'S&P 500' },
  { sym: '^IXIC', name: 'Nasdaq' },
  { sym: '^DJI', name: 'Dow Jones' },
  { sym: 'BTC-USD', name: 'Bitcoin' },
];

const MOVE_THRESHOLD = 1.5; // % absolute day change to trigger market notification
const NEWS_STORAGE_KEY = '@floboard:lastNewsHeadline';
const HOLDINGS_KEY = '@floboard:holdings';

interface Holding {
  sym: string;
  name: string;
  qty: number;
  cost: number;
}

export function useMarketNotifications() {
  const { data, lastUpdated } = useMarket();
  const { settings } = useSettings();
  const prevDataRef = useRef<Record<string, QuoteData>>({});
  const notifiedPortfolioRef = useRef<Set<string>>(new Set());
  const notifiedMarketRef = useRef<Set<string>>(new Set());
  const firstLoadRef = useRef(true);

  useEffect(() => {
    if (!lastUpdated) return;
    if (!settings.notificationsEnabled) return;
    if (!areNotificationsSupported()) return;

    // Skip the very first load — only notify on subsequent refreshes
    if (firstLoadRef.current) {
      firstLoadRef.current = false;
      prevDataRef.current = data;
      return;
    }

    const prev = prevDataRef.current;

    // ── Portfolio alerts ─────────────────────────────────────
    if (settings.notifyPortfolio && settings.alertThreshold > 0) {
      AsyncStorage.getItem(HOLDINGS_KEY).then((raw) => {
        if (!raw) return;
        const holdings: Holding[] = JSON.parse(raw);
        for (const h of holdings) {
          const q = data[h.sym];
          if (!q) continue;
          const dayPct = Math.abs(q.regularMarketChangePercent ?? 0);
          if (dayPct >= settings.alertThreshold && !notifiedPortfolioRef.current.has(h.sym)) {
            notifiedPortfolioRef.current.add(h.sym);
            const dir = (q.regularMarketChangePercent ?? 0) >= 0 ? '▲' : '▼';
            const sign = (q.regularMarketChangePercent ?? 0) >= 0 ? '+' : '';
            sendLocalNotification(
              `${dir} ${h.sym} moved ${sign}${(q.regularMarketChangePercent ?? 0).toFixed(2)}%`,
              `${h.name} is now $${q.regularMarketPrice?.toFixed(2)} — your holding has triggered a day-change alert.`
            );
          }
        }
      }).catch(() => {});
    }

    // ── Major market moves ───────────────────────────────────
    if (settings.notifyMarketMoves) {
      for (const idx of MAJOR_INDICES) {
        const q = data[idx.sym];
        if (!q) continue;
        const dayPct = q.regularMarketChangePercent ?? 0;
        const key = `${idx.sym}:${dayPct >= 0 ? 'up' : 'dn'}`;
        if (Math.abs(dayPct) >= MOVE_THRESHOLD && !notifiedMarketRef.current.has(key)) {
          notifiedMarketRef.current.add(key);
          const dir = dayPct >= 0 ? '▲' : '▼';
          const sign = dayPct >= 0 ? '+' : '';
          sendLocalNotification(
            `${dir} ${idx.name} ${sign}${dayPct.toFixed(2)}% today`,
            `${idx.name} is at ${q.regularMarketPrice?.toLocaleString(undefined, { maximumFractionDigits: 2 })} — a significant move in today's session.`
          );
        }
      }
    }

    // ── News headline change ─────────────────────────────────
    if (settings.notifyNews) {
      const BASE = `https://${process.env.EXPO_PUBLIC_DOMAIN}`;
      fetch(`${BASE}/api/news?count=1`)
        .then((r) => r.json())
        .then(async (d: { news?: Array<{ title: string }> }) => {
          const headline = d.news?.[0]?.title;
          if (!headline) return;
          const last = await AsyncStorage.getItem(NEWS_STORAGE_KEY);
          if (last !== headline) {
            await AsyncStorage.setItem(NEWS_STORAGE_KEY, headline);
            // Don't notify on the first-ever check (no previous headline stored)
            if (last !== null) {
              sendLocalNotification(
                '📰 New financial news',
                headline
              );
            }
          }
        })
        .catch(() => {});
    }

    prevDataRef.current = data;
  }, [lastUpdated]);
}
