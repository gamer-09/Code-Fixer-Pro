import React from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

function ChevronRightIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="9 18 15 12 9 6" />
    </Svg>
  );
}

function ShieldIcon({ color }: { color: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

function FileIcon({ color }: { color: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <Polyline points="14 2 14 8 20 8" />
    </Svg>
  );
}

function PlayStoreIcon({ color }: { color: string }) {
  return (
    <Svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M3 20.5v-17c0-.59.34-1.11.84-1.35l9.85 9.85-9.85 9.85c-.5-.25-.84-.76-.84-1.35z" />
      <Path d="M16.81 15.12L6.05 21.34l8.49-8.49 2.27 2.27z" />
      <Path d="M20.16 10.81c.34.27.59.69.59 1.19s-.22.9-.57 1.18l-2.29 1.32-2.5-2.5 2.5-2.5 2.27 1.31z" />
      <Path d="M6.05 2.66l10.76 6.22-2.27 2.27-8.49-8.49z" />
    </Svg>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.rim }]}>
      <Text style={[styles.infoLabel, { color: colors.t4 }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.t2 }]}>{value}</Text>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.linkRow,
        { backgroundColor: pressed ? colors.surface : colors.card, borderColor: colors.rim },
      ]}
    >
      <View style={[styles.linkIcon, { backgroundColor: colors.surface }]}>{icon}</View>
      <Text style={[styles.linkLabel, { color: colors.t2 }]}>{label}</Text>
      <ChevronRightIcon color={colors.t4} />
    </Pressable>
  );
}

function FeaturePill({ label }: { label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.rim }]}>
      <Text style={[styles.pillText, { color: colors.t3 }]}>{label}</Text>
    </View>
  );
}

export default function AboutScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const topPad = Platform.OS === 'web' ? 67 : Math.max(insets.top, StatusBar.currentHeight ?? 0);

  return (
    <View style={[styles.container, { backgroundColor: colors.void }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.base, borderBottomColor: colors.rim }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <BackIcon color={colors.t3} />
        </Pressable>
        <Text style={[styles.pageTitle, { color: colors.t1 }]}>About FloBoard</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* Hero card */}
        <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <View style={[styles.appIconWrap, { backgroundColor: colors.surface, borderColor: colors.rim }]}>
            <Svg width={36} height={36} viewBox="0 0 24 24" fill="none">
              <Rect x="3" y="10" width="4" height="11" rx="1" fill={colors.blue} />
              <Rect x="10" y="4" width="4" height="17" rx="1" fill={colors.gain} />
              <Rect x="17" y="7" width="4" height="14" rx="1" fill={colors.blue} opacity="0.7" />
            </Svg>
          </View>
          <Text style={[styles.appName, { color: colors.t1 }]}>FloBoard</Text>
          <Text style={[styles.appTagline, { color: colors.t4 }]}>Your personal financial intelligence app</Text>
          <Text style={[styles.appVersion, { color: colors.t4 }]}>Version 1.1</Text>
        </View>

        {/* Features */}
        <Text style={[styles.groupLabel, { color: colors.blue }]}>WHAT'S INSIDE</Text>
        <View style={styles.pillWrap}>
          <FeaturePill label="Live Markets" />
          <FeaturePill label="Crypto Prices" />
          <FeaturePill label="FX Pairs" />
          <FeaturePill label="Financial News" />
          <FeaturePill label="FloAI Advisor" />
          <FeaturePill label="Portfolio Tracker" />
          <FeaturePill label="Watchlist" />
          <FeaturePill label="Earnings Calendar" />
        </View>

        {/* App info */}
        <Text style={[styles.groupLabel, { color: colors.blue }]}>APP INFO</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <InfoRow label="Version" value="1.1.0" />
          <InfoRow label="Market data" value="Yahoo Finance (live)" />
          <InfoRow label="AI advisor" value="Google Gemini 2.5 Flash" />
          <InfoRow label="Data storage" value="On-device only (AsyncStorage)" />
          <InfoRow label="Accounts required" value="None" />
          <InfoRow label="Analytics / tracking" value="None" />
        </View>

        {/* Legal links */}
        <Text style={[styles.groupLabel, { color: colors.blue }]}>LEGAL</Text>
        <LinkRow
          icon={<ShieldIcon color={colors.blue} />}
          label="Privacy Policy"
          onPress={() => router.push('/privacy-policy')}
        />
        <LinkRow
          icon={<FileIcon color={colors.blue} />}
          label="Terms of Use"
          onPress={() => router.push('/terms-of-use')}
        />
        <LinkRow
          icon={<PlayStoreIcon color={colors.t3} />}
          label="Rate & Contact on Google Play Store"
          onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.floboard.app')}
        />

        {/* Financial disclaimer */}
        <Text style={[styles.groupLabel, { color: colors.blue }]}>IMPORTANT DISCLAIMER</Text>
        <View style={[styles.disclaimerCard, { backgroundColor: colors.card, borderColor: `${colors.amber}44` }]}>
          <Text style={[styles.disclaimerHeading, { color: colors.amber }]}>
            ⚠️  Not Financial Advice
          </Text>
          <Text style={[styles.disclaimerBody, { color: colors.t3 }]}>
            FloBoard is provided for <Text style={styles.bold}>informational and educational purposes only</Text>.
            Nothing in this app — including the FloAI advisor — constitutes personal financial advice,
            investment advice, trading advice, or any other type of professional financial guidance.
          </Text>
          <Text style={[styles.disclaimerBody, { color: colors.t3, marginTop: 10 }]}>
            Market data may be delayed or inaccurate. Past performance of any asset is not indicative
            of future results. You should <Text style={styles.bold}>always conduct your own independent research</Text>{' '}
            and consult a qualified financial professional before making any investment decision.
          </Text>
          <Text style={[styles.disclaimerBody, { color: colors.t3, marginTop: 10 }]}>
            The developers of FloBoard accept <Text style={styles.bold}>no liability</Text> for any
            financial losses, missed opportunities, or decisions made based on information displayed
            in this app.
          </Text>
        </View>

        {/* No warranty */}
        <View style={[styles.warrantyCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={[styles.warrantyHeading, { color: colors.t3 }]}>No Warranty</Text>
          <Text style={[styles.warrantyBody, { color: colors.t4 }]}>
            FloBoard is provided "as is" without warranty of any kind, express or implied, including
            but not limited to accuracy, completeness, reliability, or suitability for a particular
            purpose. Use at your own risk.
          </Text>
        </View>

        {/* Limitation of liability */}
        <View style={[styles.warrantyCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={[styles.warrantyHeading, { color: colors.t3 }]}>Limitation of Liability</Text>
          <Text style={[styles.warrantyBody, { color: colors.t4 }]}>
            To the fullest extent permitted by applicable law, the developers of FloBoard shall not
            be liable for any direct, indirect, incidental, consequential, special, or exemplary
            damages arising from your use of this app, including but not limited to financial losses,
            data loss, or loss of profits, even if advised of the possibility of such damages.
          </Text>
        </View>

        {/* Third-party attributions */}
        <Text style={[styles.groupLabel, { color: colors.blue }]}>THIRD-PARTY SERVICES</Text>
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <InfoRow label="Yahoo Finance" value="Market & crypto data" />
          <InfoRow label="Google Gemini" value="AI chat (your key, your data)" />
          <InfoRow label="Expo / React Native" value="App framework" />
        </View>

        <Text style={[styles.copyright, { color: colors.t4 }]}>
          © 2026 FloBoard · All rights reserved
        </Text>
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
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 36, alignItems: 'center' },
  pageTitle: { fontSize: 17, fontFamily: 'Inter_700Bold' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 6 },

  heroCard: {
    borderRadius: 16, borderWidth: 1, padding: 24,
    alignItems: 'center', marginBottom: 8, gap: 6,
  },
  appIconWrap: {
    width: 72, height: 72, borderRadius: 18, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  appName: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  appTagline: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  appVersion: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 2 },

  groupLabel: {
    fontSize: 9, fontFamily: 'Inter_700Bold', letterSpacing: 1.4,
    marginTop: 16, marginBottom: 8, paddingHorizontal: 2,
  },

  pillWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  pill: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  pillText: { fontSize: 11, fontFamily: 'Inter_500Medium' },

  infoCard: { borderRadius: 12, borderWidth: 1, overflow: 'hidden', marginBottom: 4 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1,
  },
  infoLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  infoValue: { fontSize: 12, fontFamily: 'Inter_500Medium' },

  linkRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 6,
  },
  linkIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  linkLabel: { flex: 1, fontSize: 14, fontFamily: 'Inter_500Medium' },

  disclaimerCard: {
    borderRadius: 12, borderWidth: 1, padding: 16, marginBottom: 4,
  },
  disclaimerHeading: { fontSize: 13, fontFamily: 'Inter_700Bold', marginBottom: 10 },
  disclaimerBody: { fontSize: 12, lineHeight: 19, fontFamily: 'Inter_400Regular' },
  bold: { fontFamily: 'Inter_700Bold' },

  warrantyCard: {
    borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 4, gap: 6,
  },
  warrantyHeading: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  warrantyBody: { fontSize: 11, lineHeight: 17, fontFamily: 'Inter_400Regular' },

  copyright: {
    fontSize: 11, fontFamily: 'Inter_400Regular',
    textAlign: 'center', marginTop: 12,
  },
});
