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
import Svg, { Polyline } from 'react-native-svg';
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

export default function TermsOfUseScreen() {
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
        <Text style={[styles.pageTitle, { color: colors.t1 }]}>Terms of Use</Text>
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
            Please read these Terms of Use carefully before using FloBoard. By using the app, you
            agree to be bound by these terms. If you do not agree, do not use FloBoard.
          </Text>
        </View>

        <Section title="1. Acceptance of Terms">
          <Body>
            By downloading, installing, or using FloBoard, you agree to these Terms of Use and
            our Privacy Policy. These terms apply to all users of the app.
          </Body>
        </Section>

        <Divider />

        <Section title="2. Not Financial Advice">
          <Body>
            FloBoard is an informational tool only. Nothing in this app constitutes:
          </Body>
          <Bullet text="Financial, investment, or trading advice of any kind" />
          <Bullet text="A recommendation to buy, sell, or hold any security or asset" />
          <Bullet text="A solicitation or offer to buy or sell any financial instrument" />
          <Bullet text="Professional financial, legal, or tax guidance" />
          <Body>
            {'\n'}You acknowledge that all investment decisions you make are solely your own
            responsibility. Always consult a qualified financial professional before making
            investment decisions.
          </Body>
        </Section>

        <Divider />

        <Section title="3. Accuracy of Data">
          <Body>
            Market data displayed in FloBoard is sourced from third-party providers (including
            Yahoo Finance) and may be:
          </Body>
          <Bullet text="Delayed by 15–20 minutes or more" />
          <Bullet text="Inaccurate or incomplete" />
          <Bullet text="Temporarily unavailable due to provider outages" />
          <Body>
            {'\n'}FloBoard makes no representations or warranties regarding the accuracy,
            completeness, timeliness, or reliability of any market data displayed in the app.
            Do not rely on this data for time-sensitive trading decisions.
          </Body>
        </Section>

        <Divider />

        <Section title="4. AI Advisor (FloAI)">
          <Body>
            The FloAI feature is powered by Google Gemini and is provided for educational and
            informational purposes only. You acknowledge that:
          </Body>
          <Bullet text="AI responses may contain errors, hallucinations, or outdated information" />
          <Bullet text="FloAI is not a licensed financial advisor" />
          <Bullet text="You supply your own Gemini API key and are bound by Google's terms" />
          <Bullet text="Conversations are sent directly to Google's servers per your request" />
          <Body>
            {'\n'}FloBoard is not responsible for any actions taken based on FloAI responses.
          </Body>
        </Section>

        <Divider />

        <Section title="5. Permitted Use">
          <Body>
            You may use FloBoard for personal, non-commercial purposes. You agree not to:
          </Body>
          <Bullet text="Use the app for any unlawful purpose" />
          <Bullet text="Attempt to reverse-engineer or decompile the app beyond what is permitted by applicable law" />
          <Bullet text="Use the app to make automated financial decisions without human oversight" />
          <Bullet text="Redistribute the app or its data without permission" />
        </Section>

        <Divider />

        <Section title="6. No Warranty">
          <Body>
            FloBoard is provided "as is" and "as available" without any warranty of any kind,
            whether express or implied. We do not warrant that:
          </Body>
          <Bullet text="The app will be error-free or uninterrupted" />
          <Bullet text="Market data will be accurate or up to date" />
          <Bullet text="The app will meet your specific requirements" />
        </Section>

        <Divider />

        <Section title="7. Limitation of Liability">
          <Body>
            To the maximum extent permitted by law, FloBoard's developers shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages, including but
            not limited to:
          </Body>
          <Bullet text="Financial losses from investment decisions" />
          <Bullet text="Loss of data or profits" />
          <Bullet text="Loss of use or goodwill" />
          <Body>
            {'\n'}This limitation applies regardless of the theory of liability, even if we have been
            advised of the possibility of such damages. Our total liability to you for any claim
            shall not exceed the amount you paid for the app (which is $0 for a free app).
          </Body>
        </Section>

        <Divider />

        <Section title="8. Third-Party Services">
          <Body>
            FloBoard integrates with third-party services (Yahoo Finance, Google Gemini). Your use
            of these services is subject to their respective terms and privacy policies. FloBoard
            is not responsible for the content, accuracy, or availability of these services.
          </Body>
        </Section>

        <Divider />

        <Section title="9. Intellectual Property">
          <Body>
            FloBoard and its original content, features, and functionality are owned by the
            developer and protected by applicable intellectual property laws. The app is
            distributed exclusively through the Google Play Store.
          </Body>
        </Section>

        <Divider />

        <Section title="10. Changes to Terms">
          <Body>
            We reserve the right to modify these terms at any time. Changes will be reflected by
            an updated effective date. Continued use of FloBoard after any changes constitutes
            acceptance of the revised terms.
          </Body>
        </Section>

        <Divider />

        <Section title="11. Governing Law">
          <Body>
            These terms shall be governed by and construed in accordance with applicable law.
            Any disputes arising from these terms or your use of FloBoard shall be resolved in
            the appropriate courts of the applicable jurisdiction.
          </Body>
        </Section>

        <Divider />

        <Section title="12. Contact">
          <Body>
            For questions about these Terms of Use, contact the developer through the contact
            details on our Google Play Store listing.
          </Body>
        </Section>

        <Pressable
          onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.floboard.app')}
          style={[styles.storeBtn, { backgroundColor: colors.card, borderColor: colors.rim }]}
        >
          <Text style={[styles.storeBtnText, { color: colors.blue }]}>
            Rate & Contact on Google Play Store →
          </Text>
        </Pressable>

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
  storeBtn: { borderRadius: 10, borderWidth: 1, padding: 14, marginTop: 16, alignItems: 'center' },
  storeBtnText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  copyright: { fontSize: 11, fontFamily: 'Inter_400Regular', textAlign: 'center', marginTop: 12 },
});
