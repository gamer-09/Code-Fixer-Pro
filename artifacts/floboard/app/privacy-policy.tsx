import React from 'react';
import {
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
import Svg, { Line, Polyline } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="15 18 9 12 15 6" />
    </Svg>
  );
}

function Divider() {
  const colors = useColors();
  return <View style={[styles.divider, { backgroundColor: colors.rim }]} />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.blue }]}>{title}</Text>
      {children}
    </View>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  const colors = useColors();
  return <Text style={[styles.body, { color: colors.t3 }]}>{children}</Text>;
}

function Bullet({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={styles.bulletRow}>
      <View style={[styles.dot, { backgroundColor: colors.t4 }]} />
      <Text style={[styles.bulletText, { color: colors.t3 }]}>{text}</Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
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
        <Text style={[styles.pageTitle, { color: colors.t1 }]}>Privacy Policy</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.effective, { color: colors.t4 }]}>Effective date: July 26, 2026</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={[styles.intro, { color: colors.t2 }]}>
            FloBoard ("we", "our", or "the app") is committed to protecting your privacy.
            This policy explains what information is handled when you use FloBoard, and
            how it is stored and transmitted.
          </Text>
        </View>

        <Section title="1. No Account Required">
          <Body>
            FloBoard does not require you to create an account. You do not provide your name,
            email address, phone number, or any personally identifiable information to use the app.
          </Body>
        </Section>

        <Divider />

        <Section title="2. Data Stored on Your Device">
          <Body>
            All user-generated data is stored locally on your device using AsyncStorage and never
            transmitted to FloBoard's servers. This includes:
          </Body>
          <Bullet text="Your watchlist (stock and crypto symbols you add)" />
          <Bullet text="Your portfolio holdings and purchase prices" />
          <Bullet text="App preferences and settings" />
          <Bullet text="Your Gemini API key (see Section 3)" />
          <Bullet text="Your FloAI conversation history" />
          <Body>
            {'\n'}Clearing app data or uninstalling FloBoard permanently removes this data from your device.
            We have no copy of it and cannot restore it.
          </Body>
        </Section>

        <Divider />

        <Section title="3. Gemini API Key">
          <Body>
            If you choose to use the FloAI advisor feature, you provide a Google Gemini API key
            that you obtain directly from Google AI Studio. This key is:
          </Body>
          <Bullet text="Stored only on your device (never sent to FloBoard's servers)" />
          <Bullet text="Transmitted directly from your device to Google's Gemini API servers when you send a chat message" />
          <Bullet text="Subject to Google's own privacy policy and terms of service" />
          <Body>
            {'\n'}By entering a Gemini API key and using the FloAI chat, you acknowledge that your
            conversation messages and any financial context you provide are sent to Google's servers
            for processing. FloBoard does not log, store, or have access to these messages.
          </Body>
          <Body>
            {'\n'}You can remove your API key at any time from Settings → Gemini API Key → Remove.
          </Body>
        </Section>

        <Divider />

        <Section title="4. Market Data">
          <Body>
            FloBoard fetches publicly available market data (stock prices, cryptocurrency prices,
            foreign exchange rates, and financial news) from Yahoo Finance and other public data
            providers. This data is fetched on your behalf and displayed in the app. No personal
            data is included in these requests.
          </Body>
        </Section>

        <Divider />

        <Section title="5. No Analytics or Tracking">
          <Body>
            FloBoard does not use any analytics SDKs, crash-reporting services, advertising
            networks, or third-party tracking tools. We do not collect:
          </Body>
          <Bullet text="Usage statistics or screen-view events" />
          <Bullet text="Device identifiers or advertising IDs" />
          <Bullet text="IP addresses or location data" />
          <Bullet text="Behavioral or telemetry data of any kind" />
        </Section>

        <Divider />

        <Section title="6. Third-Party Services">
          <Body>
            FloBoard interacts with the following third-party services on your behalf. Their
            respective privacy policies govern how they handle data:
          </Body>
          <Bullet text="Google Gemini API — ai.google.dev/terms" />
          <Bullet text="Yahoo Finance — finance.yahoo.com" />
          <Body>
            {'\n'}FloBoard is not responsible for the privacy practices of these services.
          </Body>
        </Section>

        <Divider />

        <Section title="7. Children's Privacy">
          <Body>
            FloBoard is not directed at children under the age of 13. We do not knowingly collect
            any personal information from children. If you believe a child has used the app in a way
            that raises privacy concerns, please contact us.
          </Body>
        </Section>

        <Divider />

        <Section title="8. Changes to This Policy">
          <Body>
            We may update this Privacy Policy from time to time. When we do, we will update the
            effective date above. Continued use of FloBoard after any changes constitutes
            acceptance of the updated policy.
          </Body>
        </Section>

        <Divider />

        <Section title="9. Contact">
          <Body>
            If you have questions about this Privacy Policy or the app's data practices, you may
            reach the developer directly through the contact details on our Google Play Store listing.
          </Body>
        </Section>

        <View style={[styles.footer, { backgroundColor: colors.card, borderColor: colors.rim }]}>
          <Text style={[styles.footerText, { color: colors.t4 }]}>
            FloBoard v1.2 · All data stays on your device · No accounts · No tracking
          </Text>
        </View>
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
  content: { padding: 16, gap: 2 },
  effective: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 12, textAlign: 'center' },
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  intro: { fontSize: 13, lineHeight: 20, fontFamily: 'Inter_400Regular' },
  section: { paddingVertical: 16, gap: 8 },
  sectionTitle: { fontSize: 13, fontFamily: 'Inter_700Bold', marginBottom: 2 },
  body: { fontSize: 13, lineHeight: 20, fontFamily: 'Inter_400Regular' },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingLeft: 4 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 8, flexShrink: 0 },
  bulletText: { fontSize: 13, lineHeight: 20, fontFamily: 'Inter_400Regular', flex: 1 },
  divider: { height: 1 },
  footer: { borderRadius: 10, borderWidth: 1, padding: 14, marginTop: 16 },
  footerText: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center', lineHeight: 17 },
});
