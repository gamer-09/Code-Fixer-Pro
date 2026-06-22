import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  AlertThreshold,
  EarningsWindow,
  NewsCount,
  PriceDecimals,
  RefreshInterval,
  RiskProfile,
  WatchlistSort,
  useSettings,
} from '@/context/SettingsContext';
import { areNotificationsSupported, requestNotificationPermissions } from '@/utils/notifications';

function SectionHeader({ label, desc }: { label: string; desc?: string }) {
  const colors = useColors();
  return (
    <View style={styles.secHd}>
      <View style={styles.secTop}>
        <Text style={[styles.secLabel, { color: colors.blue }]}>{label}</Text>
        <View style={[styles.secLine, { backgroundColor: colors.rim }]} />
      </View>
      {desc && <Text style={[styles.secDesc, { color: colors.t4 }]}>{desc}</Text>}
    </View>
  );
}

function OptionRow<T extends string | number>({
  label,
  desc,
  options,
  value,
  onSelect,
  format,
}: {
  label: string;
  desc?: string;
  options: T[];
  value: T;
  onSelect: (v: T) => void;
  format?: (v: T) => string;
}) {
  const colors = useColors();
  const fmt = format ?? String;
  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <View style={styles.rowLeft}>
        <Text style={[styles.rowLabel, { color: colors.t2 }]}>{label}</Text>
        {desc && <Text style={[styles.rowDesc, { color: colors.t4 }]}>{desc}</Text>}
      </View>
      <View style={styles.optionGroup}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <Pressable
              key={String(opt)}
              onPress={() => onSelect(opt)}
              style={[
                styles.optionBtn,
                {
                  backgroundColor: active ? colors.blue : colors.surface,
                  borderColor: active ? colors.blue : colors.rim,
                },
              ]}
            >
              <Text style={[styles.optionText, { color: active ? '#fff' : colors.t3 }]}>
                {fmt(opt)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  description,
  value,
  onToggle,
  disabled,
}: {
  label: string;
  description?: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.rim, opacity: disabled ? 0.45 : 1 }]}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={[styles.rowLabel, { color: colors.t2 }]}>{label}</Text>
        {description && <Text style={[styles.rowDesc, { color: colors.t4 }]}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={disabled ? undefined : onToggle}
        thumbColor={value ? colors.blue : colors.t4}
        trackColor={{ false: colors.rim, true: `${colors.blue}55` }}
        ios_backgroundColor={colors.rim}
      />
    </View>
  );
}

function ActionRow({
  label,
  description,
  buttonLabel,
  onPress,
  destructive,
}: {
  label: string;
  description: string;
  buttonLabel: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  const colors = useColors();
  return (
    <View style={[styles.actionRow, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <View style={styles.actionRowText}>
        <Text style={[styles.rowLabel, { color: colors.t2 }]}>{label}</Text>
        <Text style={[styles.rowDesc, { color: colors.t4 }]}>{description}</Text>
      </View>
      <Pressable
        onPress={onPress}
        style={[
          styles.actionBtn,
          { backgroundColor: destructive ? colors.lossDim : colors.surface, borderColor: destructive ? 'rgba(255,77,106,0.3)' : colors.rim },
        ]}
      >
        <Text style={[styles.actionBtnText, { color: destructive ? colors.loss : colors.blue }]}>
          {buttonLabel}
        </Text>
      </Pressable>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.rim }]}>
      <Text style={[styles.rowLabel, { color: colors.t3 }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.t4 }]}>{value}</Text>
    </View>
  );
}

const RISK_LABELS: Record<RiskProfile, string> = {
  conservative: 'Conservative',
  moderate: 'Moderate',
  aggressive: 'Aggressive',
};

const RISK_DESCRIPTIONS: Record<RiskProfile, string> = {
  conservative: 'FloAI focuses on capital preservation, low volatility, bonds, and dividend stocks.',
  moderate: 'FloAI balances growth and stability, covering a broad range of assets.',
  aggressive: 'FloAI focuses on high-growth assets, emerging markets, and higher-risk opportunities.',
};

const SORT_LABELS: Record<WatchlistSort, string> = {
  change: '% Change',
  alpha: 'A–Z',
  added: 'Date Added',
};

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const { settings, updateSetting, triggerClearChat, resetAllSettings } = useSettings();
  const notifSupported = areNotificationsSupported();

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Permission required',
          'Please enable notifications for FloBoard in your device Settings to receive alerts.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    updateSetting('notificationsEnabled', enabled);
  };

  const handleClearChat = () => {
    Alert.alert('Clear Chat', 'This will clear the FloAI conversation history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => triggerClearChat() },
    ]);
  };

  const handleClearPortfolio = () => {
    Alert.alert('Clear Portfolio', 'This will permanently delete all your holdings. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete All', style: 'destructive', onPress: () => AsyncStorage.removeItem('@floboard:holdings') },
    ]);
  };

  const handleClearWatchlist = () => {
    Alert.alert('Clear Watchlist', 'This will remove all symbols from your watchlist. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => AsyncStorage.removeItem('@floboard:watchlist') },
    ]);
  };

  const handleResetSettings = () => {
    Alert.alert('Reset Settings', 'This will restore all settings to their defaults.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetAllSettings },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <Text style={[styles.pageTitle, { color: colors.t1 }]}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ padding: 16, paddingBottom: Platform.OS === 'web' ? 84 : 120 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── AI & Analysis ──────────────────────────────────────────── */}
        <SectionHeader label="AI & ANALYSIS" desc="Shapes how FloAI interprets data and frames its advice." />

        <View style={[styles.riskCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={[styles.riskTitle, { color: colors.t3 }]}>INVESTOR RISK PROFILE</Text>
          <View style={styles.riskBtns}>
            {(['conservative', 'moderate', 'aggressive'] as RiskProfile[]).map((r) => {
              const active = settings.riskProfile === r;
              const col = r === 'conservative' ? colors.blue : r === 'moderate' ? colors.amber : colors.loss;
              return (
                <Pressable
                  key={r}
                  onPress={() => updateSetting('riskProfile', r)}
                  style={[
                    styles.riskBtn,
                    { borderColor: active ? col : colors.rim, backgroundColor: active ? `${col}22` : colors.surface },
                  ]}
                >
                  <Text style={[styles.riskBtnText, { color: active ? col : colors.t3 }]}>
                    {RISK_LABELS[r]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.riskDesc, { color: colors.t4 }]}>
            {RISK_DESCRIPTIONS[settings.riskProfile]}
          </Text>
        </View>

        {/* ── Market Data ────────────────────────────────────────────── */}
        <SectionHeader label="MARKET DATA" />
        <OptionRow<RefreshInterval>
          label="Refresh interval"
          desc="How often live prices are re-fetched from Yahoo Finance."
          options={[30, 60, 90, 300]}
          value={settings.refreshInterval}
          onSelect={(v) => updateSetting('refreshInterval', v)}
          format={(v) => v === 300 ? '5 min' : `${v}s`}
        />
        <ToggleRow
          label="Show extended hours"
          description="Display pre-market and after-hours price data where available."
          value={settings.showExtendedHours}
          onToggle={(v) => updateSetting('showExtendedHours', v)}
        />

        {/* ── Display ───────────────────────────────────────────────── */}
        <SectionHeader label="DISPLAY" />
        <OptionRow<PriceDecimals>
          label="Price decimal places"
          desc="Number of decimal places shown for prices and yields."
          options={[2, 4]}
          value={settings.priceDecimals}
          onSelect={(v) => updateSetting('priceDecimals', v)}
          format={(v) => `${v} dp`}
        />
        <ToggleRow
          label="Compact large numbers"
          description="Show market caps as $1.2T instead of $1,200,000,000,000."
          value={settings.compactNumbers}
          onToggle={(v) => updateSetting('compactNumbers', v)}
        />

        {/* ── News ──────────────────────────────────────────────────── */}
        <SectionHeader label="NEWS" />
        <OptionRow<NewsCount>
          label="Headlines per load"
          desc="Number of live headlines shown in the News tab."
          options={[10, 15, 20]}
          value={settings.newsCount}
          onSelect={(v) => updateSetting('newsCount', v)}
          format={(v) => `${v}`}
        />

        {/* ── Earnings Calendar ─────────────────────────────────────── */}
        <SectionHeader label="EARNINGS CALENDAR" desc="Controls how far ahead upcoming earnings are shown in the News tab." />
        <OptionRow<EarningsWindow>
          label="Earnings look-ahead"
          options={[2, 4, 8]}
          value={settings.earningsWindow}
          onSelect={(v) => updateSetting('earningsWindow', v)}
          format={(v) => `${v} wks`}
        />

        {/* ── Watchlist ─────────────────────────────────────────────── */}
        <SectionHeader label="WATCHLIST" />
        <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={[styles.rowLabel, { color: colors.t2 }]}>Sort order</Text>
          <View style={styles.optionGroup}>
            {(['change', 'alpha', 'added'] as WatchlistSort[]).map((s) => {
              const active = settings.watchlistSort === s;
              return (
                <Pressable
                  key={s}
                  onPress={() => updateSetting('watchlistSort', s)}
                  style={[
                    styles.optionBtn,
                    { backgroundColor: active ? colors.blue : colors.surface, borderColor: active ? colors.blue : colors.rim },
                  ]}
                >
                  <Text style={[styles.optionText, { color: active ? '#fff' : colors.t3 }]}>
                    {SORT_LABELS[s]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Portfolio ─────────────────────────────────────────────── */}
        <SectionHeader label="PORTFOLIO ALERTS" />
        <OptionRow<AlertThreshold>
          label="Day-change alert threshold"
          desc="Highlight a holding card when its daily move exceeds this."
          options={[0, 3, 5, 10]}
          value={settings.alertThreshold}
          onSelect={(v) => updateSetting('alertThreshold', v)}
          format={(v) => v === 0 ? 'Off' : `≥${v}%`}
        />

        {/* ── Notifications ─────────────────────────────────────────── */}
        <SectionHeader label="NOTIFICATIONS" />
        {!notifSupported ? (
          <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.rim }]}>
            <Text style={[styles.rowDesc, { color: colors.t4, flex: 1 }]}>
              Push notifications require a standalone build (Play Store / App Store). Not supported in Expo Go.
            </Text>
          </View>
        ) : (
          <>
            <ToggleRow
              label="Enable notifications"
              description="Receive alerts when data changes in the app."
              value={settings.notificationsEnabled}
              onToggle={handleToggleNotifications}
            />
            <ToggleRow
              label="Portfolio alerts"
              description="Notify when a holding's day move crosses your alert threshold."
              value={settings.notifyPortfolio}
              onToggle={(v) => updateSetting('notifyPortfolio', v)}
              disabled={!settings.notificationsEnabled}
            />
            <ToggleRow
              label="Major market moves"
              description="Notify when S&P 500, Nasdaq, or Bitcoin moves ≥1.5% intraday."
              value={settings.notifyMarketMoves}
              onToggle={(v) => updateSetting('notifyMarketMoves', v)}
              disabled={!settings.notificationsEnabled}
            />
            <ToggleRow
              label="Breaking news"
              description="Notify when a new top financial headline is detected."
              value={settings.notifyNews}
              onToggle={(v) => updateSetting('notifyNews', v)}
              disabled={!settings.notificationsEnabled}
            />
          </>
        )}

        {/* ── Data & Privacy ────────────────────────────────────────── */}
        <SectionHeader label="DATA & PRIVACY" />
        <ActionRow
          label="Clear AI chat history"
          description="Removes all messages from the FloAI conversation."
          buttonLabel="Clear Chat"
          onPress={handleClearChat}
        />
        <ActionRow
          label="Clear watchlist"
          description="Removes all symbols from your personal watchlist."
          buttonLabel="Clear Watchlist"
          onPress={handleClearWatchlist}
          destructive
        />
        <ActionRow
          label="Clear portfolio"
          description="Permanently deletes all your tracked holdings."
          buttonLabel="Delete Holdings"
          onPress={handleClearPortfolio}
          destructive
        />

        {/* ── Advanced ──────────────────────────────────────────────── */}
        <SectionHeader label="ADVANCED" />
        <ActionRow
          label="Reset all settings"
          description="Restores all settings to their factory defaults."
          buttonLabel="Reset"
          onPress={handleResetSettings}
          destructive
        />

        {/* ── About ─────────────────────────────────────────────────── */}
        <SectionHeader label="ABOUT" />
        <InfoRow label="App" value="FloBoard v1.1" />
        <InfoRow label="Market data" value="Yahoo Finance (live)" />
        <InfoRow label="AI advisor" value="Google Gemini 2.5 Flash" />
        <InfoRow label="Refresh" value={settings.refreshInterval === 300 ? 'Every 5 min' : `Every ${settings.refreshInterval}s`} />
        <InfoRow label="Risk profile" value={RISK_LABELS[settings.riskProfile]} />
        <InfoRow label="Watchlist sort" value={SORT_LABELS[settings.watchlistSort]} />

        <View style={[styles.disclaimer, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={[styles.disclaimerText, { color: colors.t4 }]}>
            FloBoard is for informational and educational purposes only. Nothing in this app constitutes personal financial or investment advice. Market data may be delayed. Always conduct your own research before making investment decisions.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: 1 },
  pageTitle: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  scroll: { flex: 1 },
  secHd: { marginTop: 22, marginBottom: 8 },
  secTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  secLabel: { fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1.4 },
  secLine: { flex: 1, height: 1 },
  secDesc: { fontSize: 10, lineHeight: 15, paddingHorizontal: 2 },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 6,
    gap: 8,
  },
  rowLeft: { flex: 1 },
  rowLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  rowDesc: { fontSize: 11, marginTop: 2, lineHeight: 16 },
  infoValue: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  optionGroup: { flexDirection: 'row', gap: 4, flexShrink: 1, flexWrap: 'wrap', justifyContent: 'flex-end' },
  optionBtn: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 9, paddingVertical: 5 },
  optionText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  // Risk card
  riskCard: { borderRadius: 10, borderWidth: 1, padding: 14, marginBottom: 6 },
  riskTitle: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1, marginBottom: 10 },
  riskBtns: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  riskBtn: { flex: 1, borderRadius: 8, borderWidth: 1, paddingVertical: 9, alignItems: 'center' },
  riskBtnText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  riskDesc: { fontSize: 11, lineHeight: 17 },
  // Action rows
  actionRow: {
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 6, flexDirection: 'row', alignItems: 'center', gap: 12,
  },
  actionRowText: { flex: 1 },
  actionBtn: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  actionBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  disclaimer: { borderRadius: 10, borderWidth: 1, padding: 14, marginTop: 4 },
  disclaimerText: { fontSize: 11, lineHeight: 17 },
});
