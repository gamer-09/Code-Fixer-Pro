import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Svg, { Circle, Line, Path, Polyline, Rect } from 'react-native-svg';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/context/SettingsContext';

const ONBOARDING_KEY = '@floboard:onboarded_v1';

// ── Icons ─────────────────────────────────────────────────────────────────

function IconMarkets({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="10" width="4" height="11" rx="1" fill={color} />
      <Rect x="10" y="4" width="4" height="17" rx="1" fill={color} />
      <Rect x="17" y="7" width="4" height="14" rx="1" fill={color} />
    </Svg>
  );
}

function IconChart({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="3" y="10" width="4" height="11" rx="1" />
      <Rect x="10" y="4" width="4" height="17" rx="1" />
      <Rect x="17" y="7" width="4" height="14" rx="1" />
    </Svg>
  );
}

function IconAdvisor({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

function IconStar({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function IconBriefcase({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="2" y="7" width="20" height="14" rx="2" />
      <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </Svg>
  );
}

function IconKey({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="8" cy="15" r="4" />
      <Path d="M11.7 11.7L20 4" />
      <Path d="M18 6l2 2" />
      <Path d="M15 9l2 2" />
    </Svg>
  );
}

function IconShield({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Svg>
  );
}

function IconChevron({ color, open }: { color: string; open: boolean }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
    >
      <Polyline points="6 9 12 15 18 9" />
    </Svg>
  );
}

function IconCheck({ color }: { color: string }) {
  return (
    <Svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <Polyline points="20 6 9 17 4 12" />
    </Svg>
  );
}

// ── Feature Row ───────────────────────────────────────────────────────────

function Feature({ icon, label, desc, accentColor }: { icon: React.ReactNode; label: string; desc: string; accentColor: string }) {
  const colors = useColors();
  return (
    <View style={styles.feature}>
      <View style={[styles.featureIcon, { backgroundColor: `${accentColor}18`, borderColor: `${accentColor}30` }]}>
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.featureLabel, { color: colors.t1 }]}>{label}</Text>
        <Text style={[styles.featureDesc, { color: colors.t4 }]}>{desc}</Text>
      </View>
    </View>
  );
}

// ── Expandable Legal Section ───────────────────────────────────────────────

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.legalSection, { borderColor: colors.rim, backgroundColor: colors.surface }]}>
      <Pressable onPress={() => setOpen((v) => !v)} style={styles.legalSectionHeader}>
        <Text style={[styles.legalSectionTitle, { color: colors.t2 }]}>{title}</Text>
        <IconChevron color={colors.t4} open={open} />
      </Pressable>
      {open && (
        <View style={[styles.legalSectionBody, { borderTopColor: colors.rim }]}>
          {children}
        </View>
      )}
    </View>
  );
}

function LegalBody({ children }: { children: string }) {
  const colors = useColors();
  return <Text style={[styles.legalBody, { color: colors.t3 }]}>{children}</Text>;
}

function LegalBullet({ text }: { text: string }) {
  const colors = useColors();
  return (
    <View style={styles.legalBulletRow}>
      <View style={[styles.legalDot, { backgroundColor: colors.t4 }]} />
      <Text style={[styles.legalBulletText, { color: colors.t3 }]}>{text}</Text>
    </View>
  );
}

// ── Onboarding Content ────────────────────────────────────────────────────

interface OnboardingModalProps {
  onDone: () => void;
}

function OnboardingContent({ onDone }: OnboardingModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSetting } = useSettings();
  const [page, setPage] = useState(0);
  const [keyDraft, setKeyDraft] = useState('');
  const [keySaved, setKeySaved] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleSaveKey = () => {
    const trimmed = keyDraft.trim();
    if (trimmed.length > 0) {
      updateSetting('geminiApiKey', trimmed);
      setKeySaved(true);
    }
  };

  const markDone = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, '1');
    onDone();
  };

  // ── Page 0: Welcome ──────────────────────────────────────────────────────
  const WelcomePage = (
    <View key="welcome" style={styles.page}>
      <View style={[styles.logoBadge, { backgroundColor: colors.gainDim, borderColor: 'rgba(0,229,160,0.2)' }]}>
        <Text style={[styles.logoText, { color: colors.gain }]}>FloBoard v1.2</Text>
      </View>
      <Text style={[styles.welcomeTitle, { color: colors.t1 }]}>Your live market dashboard</Text>
      <Text style={[styles.welcomeSubtitle, { color: colors.t3 }]}>
        Real-time stocks, crypto, forex, interactive charts, and an AI financial advisor — all in one place.
      </Text>
      <View style={styles.features}>
        <Feature icon={<IconMarkets color={colors.gain} />} label="Live Global Markets" desc="Stocks, 88+ cryptos, FX pairs, indices, commodities & Treasury yields" accentColor={colors.gain} />
        <Feature icon={<IconChart color={colors.blue} />} label="Interactive Candlesticks" desc="OHLC candlestick charts, 1D–ALL ranges, SMA 20, EMA 50 & RSI 14 overlays" accentColor={colors.blue} />
        <Feature icon={<IconAdvisor color={colors.blue} />} label="Risk-Tailored FloAI" desc="AI advisor adapts to Conservative, Moderate & Aggressive risk modes" accentColor={colors.blue} />
        <Feature icon={<IconStar color={colors.amber} />} label="Multi-List Watchlists" desc="Track custom symbols across Favorites, Tech & AI, Crypto, and FX & Metals" accentColor={colors.amber} />
        <Feature icon={<IconBriefcase color={colors.gain} />} label="100% Simulated Portfolio" desc="Track P&L, asset allocation & dividend yields — no deposits or bank info needed" accentColor={colors.gain} />
      </View>
    </View>
  );

  // ── Page 1: Legal & Disclaimer ───────────────────────────────────────────
  const LegalPage = (
    <View key="legal" style={styles.page}>
      <View style={[styles.legalHeaderRow]}>
        <View style={[styles.legalIconWrap, { backgroundColor: `${colors.amber}22`, borderColor: `${colors.amber}44` }]}>
          <IconShield color={colors.amber} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.welcomeTitle, { color: colors.t1, fontSize: 18 }]}>Legal & Disclaimer</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.t3, fontSize: 12, marginTop: 2 }]}>
            Please read before using FloBoard
          </Text>
        </View>
      </View>

      {/* Financial disclaimer — always visible */}
      <View style={[styles.disclaimerBox, { backgroundColor: `${colors.amber}12`, borderColor: `${colors.amber}44` }]}>
        <Text style={[styles.disclaimerHeading, { color: colors.amber }]}>⚠️  Not Financial Advice</Text>
        <Text style={[styles.disclaimerText, { color: colors.t3 }]}>
          FloBoard is for <Text style={styles.bold}>informational and educational purposes only</Text>. Nothing in this app — including the FloAI advisor — constitutes investment advice. Market data may be delayed. Always conduct your own research and consult a qualified financial professional before making any investment decision.{'\n\n'}The developers accept <Text style={styles.bold}>no liability</Text> for financial losses arising from use of this app.
        </Text>
      </View>

      {/* Privacy Policy — expandable */}
      <LegalSection title="Privacy Policy">
        <LegalBody>FloBoard does not collect or store any personal data on its servers. All your data (watchlist, portfolio, settings) stays on your device only.</LegalBody>
        <LegalBullet text="No account required — ever" />
        <LegalBullet text="100% simulated portfolio — no deposits, money, or bank info needed" />
        <LegalBullet text="No analytics, no tracking, no ad networks" />
        <LegalBullet text="Gemini API key stored on-device only; transmitted to Google when you chat" />
        <LegalBullet text="Market data fetched from Yahoo Finance on your behalf" />
        <LegalBullet text="Uninstalling the app permanently deletes all your data" />
        <Pressable onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.floboard.app')} style={styles.legalLink}>
          <Text style={[styles.legalLinkText, { color: colors.blue }]}>View Privacy Policy on Google Play →</Text>
        </Pressable>
      </LegalSection>

      {/* Terms of Use — expandable */}
      <LegalSection title="Terms of Use">
        <LegalBody>By using FloBoard you agree to the following key terms:</LegalBody>
        <LegalBullet text="The app is provided 'as is' with no warranty of any kind" />
        <LegalBullet text="Market data may be inaccurate, incomplete, or delayed" />
        <LegalBullet text="FloAI responses may contain errors — never rely on them for trading decisions" />
        <LegalBullet text="The developers are not liable for any financial losses from using this app" />
        <LegalBullet text="You use FloBoard at your own risk" />
        <LegalBullet text="You must not use the app for any unlawful purpose" />
        <Pressable onPress={() => Linking.openURL('https://play.google.com/store/apps/details?id=com.floboard.app')} style={styles.legalLink}>
          <Text style={[styles.legalLinkText, { color: colors.blue }]}>View Terms of Use on Google Play →</Text>
        </Pressable>
      </LegalSection>

      {/* About FloBoard — expandable */}
      <LegalSection title="About FloBoard">
        <LegalBody>FloBoard v1.2 — A personal financial intelligence app built with React Native / Expo.</LegalBody>
        <LegalBullet text="Market data: Yahoo Finance (live, may be delayed 15–20 min)" />
        <LegalBullet text="AI advisor: Google Gemini 2.5 Flash (your key, your data)" />
        <LegalBullet text="Storage: on-device only via AsyncStorage" />
        <LegalBullet text="No accounts · No tracking · No ads" />
        <LegalBullet text="Available exclusively on Google Play Store for Android" />
      </LegalSection>

      {/* Accept checkbox */}
      <Pressable onPress={() => setAccepted((v) => !v)} style={styles.acceptRow}>
        <View style={[
          styles.checkbox,
          {
            backgroundColor: accepted ? colors.gain : 'transparent',
            borderColor: accepted ? colors.gain : colors.rim,
          },
        ]}>
          {accepted && <IconCheck color="#000" />}
        </View>
        <Text style={[styles.acceptText, { color: colors.t2 }]}>
          I have read and accept the Terms of Use, Privacy Policy, and understand this app does not provide financial advice.
        </Text>
      </Pressable>
    </View>
  );

  // ── Page 2: Gemini API Key ───────────────────────────────────────────────
  const KeyPage = (
    <View key="key" style={styles.page}>
      <View style={[styles.keyIconWrap, { backgroundColor: colors.amberDim, borderColor: 'rgba(255,182,39,0.25)' }]}>
        <IconKey color={colors.amber} />
      </View>
      <Text style={[styles.welcomeTitle, { color: colors.t1 }]}>Enable FloAI Chat</Text>
      <Text style={[styles.welcomeSubtitle, { color: colors.t3 }]}>
        FloAI runs on Google Gemini. Add your free API key to unlock the advisor. You can also skip and add it later in Settings.
      </Text>

      <View style={[styles.stepsCard, { backgroundColor: colors.card, borderColor: colors.rim }]}>
        <Text style={[styles.stepsTitle, { color: colors.t3 }]}>HOW TO GET A FREE KEY</Text>
        {[
          'Go to aistudio.google.com/apikey',
          'Sign in with your Google account',
          'Click "Create API Key"',
          'Copy the key and paste it below',
        ].map((step, i) => (
          <View key={i} style={styles.step}>
            <View style={[styles.stepNum, { backgroundColor: colors.blue + '22', borderColor: colors.blue + '44' }]}>
              <Text style={[styles.stepNumText, { color: colors.blue }]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.t2 }]}>{step}</Text>
          </View>
        ))}
        <Pressable
          onPress={() => Linking.openURL('https://aistudio.google.com/apikey')}
          style={[styles.getKeyBtn, { backgroundColor: colors.blue + '18', borderColor: colors.blue + '44' }]}
        >
          <Text style={[styles.getKeyBtnText, { color: colors.blue }]}>Open Google AI Studio →</Text>
        </Pressable>
      </View>

      {keySaved ? (
        <View style={[styles.savedBadge, { backgroundColor: colors.gainDim, borderColor: 'rgba(0,229,160,0.25)' }]}>
          <Text style={[styles.savedText, { color: colors.gain }]}>✓  Key saved — FloAI is ready!</Text>
        </View>
      ) : (
        <View style={styles.keyInputArea}>
          <TextInput
            style={[styles.keyInput, {
              backgroundColor: colors.surface,
              borderColor: keyDraft.length > 0 ? colors.blue + '66' : colors.rim,
              color: colors.t1,
            }]}
            value={keyDraft}
            onChangeText={setKeyDraft}
            placeholder="Paste your Gemini API key here..."
            placeholderTextColor={colors.t4}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry
          />
          <Pressable
            onPress={handleSaveKey}
            disabled={keyDraft.trim().length === 0}
            style={[styles.saveKeyBtn, {
              backgroundColor: keyDraft.trim().length > 0 ? colors.gain + '22' : colors.surface,
              borderColor: keyDraft.trim().length > 0 ? 'rgba(0,229,160,0.35)' : colors.rim,
            }]}
          >
            <Text style={[styles.saveKeyBtnText, { color: keyDraft.trim().length > 0 ? colors.gain : colors.t4 }]}>Save Key</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  const PAGES = [WelcomePage, LegalPage, KeyPage];
  const isLastPage = page === PAGES.length - 1;
  const canAdvanceFromLegal = page !== 1 || accepted;

  return (
    <View style={[styles.modal, { backgroundColor: colors.base, borderColor: colors.rim }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
        {PAGES[page]}
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.nav, { borderTopColor: colors.rim, paddingBottom: Math.max(16, insets.bottom + 16) }]}>
        {/* Page dots */}
        <View style={styles.dots}>
          {PAGES.map((_, i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === page ? colors.gain : colors.rim }]} />
          ))}
        </View>

        <View style={styles.navBtns}>
          {page > 0 && (
            <Pressable
              onPress={() => setPage((p) => p - 1)}
              style={[styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.rim }]}
            >
              <Text style={[styles.navBtnText, { color: colors.t3 }]}>Back</Text>
            </Pressable>
          )}

          {isLastPage ? (
            <>
              {!keySaved && (
                <Pressable
                  onPress={markDone}
                  style={[styles.navBtn, { backgroundColor: colors.surface, borderColor: colors.rim }]}
                >
                  <Text style={[styles.navBtnText, { color: colors.t3 }]}>Skip for now</Text>
                </Pressable>
              )}
              <Pressable
                onPress={markDone}
                style={[styles.navBtn, styles.navBtnPrimary, { backgroundColor: colors.gain }]}
              >
                <Text style={[styles.navBtnText, { color: '#000' }]}>Get Started</Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              onPress={() => canAdvanceFromLegal && setPage((p) => p + 1)}
              style={[
                styles.navBtn, styles.navBtnPrimary,
                {
                  backgroundColor: canAdvanceFromLegal ? colors.gain : colors.rim,
                  opacity: canAdvanceFromLegal ? 1 : 0.5,
                },
              ]}
            >
              <Text style={[styles.navBtnText, { color: canAdvanceFromLegal ? '#000' : colors.t4 }]}>
                {page === 1 ? 'I Accept →' : 'Next'}
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

export function OnboardingModal() {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((val) => {
      if (!val) setVisible(true);
      setChecked(true);
    });
  }, []);

  if (!checked) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <OnboardingContent onDone={() => setVisible(false)} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.75)',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    maxHeight: '92%',
  },
  modalScroll: { padding: 24 },
  page: { gap: 14 },

  // Welcome page
  logoBadge: { alignSelf: 'flex-start', borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6 },
  logoText: { fontSize: 13, fontFamily: 'Inter_700Bold', letterSpacing: 0.5 },
  welcomeTitle: { fontSize: 22, fontFamily: 'Inter_700Bold', lineHeight: 30 },
  welcomeSubtitle: { fontSize: 14, lineHeight: 21 },
  features: { gap: 10, marginTop: 4 },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  featureIcon: { width: 34, height: 34, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  featureLabel: { fontSize: 13, fontFamily: 'Inter_600SemiBold', marginBottom: 2 },
  featureDesc: { fontSize: 11, lineHeight: 16 },

  // Legal page
  legalHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  legalIconWrap: { width: 40, height: 40, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  disclaimerBox: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  disclaimerHeading: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  disclaimerText: { fontSize: 12, lineHeight: 19, fontFamily: 'Inter_400Regular' },
  bold: { fontFamily: 'Inter_700Bold' },
  legalSection: { borderRadius: 10, borderWidth: 1, overflow: 'hidden' },
  legalSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  legalSectionTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  legalSectionBody: { borderTopWidth: 1, padding: 12, gap: 8 },
  legalBody: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular' },
  legalBulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  legalDot: { width: 4, height: 4, borderRadius: 2, marginTop: 7, flexShrink: 0 },
  legalBulletText: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular', flex: 1 },
  legalLink: { marginTop: 4 },
  legalLinkText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  acceptRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 4 },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  acceptText: { fontSize: 12, lineHeight: 18, fontFamily: 'Inter_400Regular', flex: 1 },

  // Key page
  keyIconWrap: { width: 48, height: 48, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepsCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 10 },
  stepsTitle: { fontSize: 8, fontFamily: 'Inter_700Bold', letterSpacing: 1.2, marginBottom: 4 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepNum: { width: 22, height: 22, borderRadius: 11, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  stepText: { fontSize: 12, lineHeight: 18, flex: 1 },
  getKeyBtn: { marginTop: 4, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, alignSelf: 'flex-start' },
  getKeyBtnText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  keyInputArea: { gap: 8 },
  keyInput: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, fontFamily: 'Inter_400Regular' },
  saveKeyBtn: { borderRadius: 9, borderWidth: 1, paddingVertical: 12, alignItems: 'center' },
  saveKeyBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  savedBadge: { borderRadius: 10, borderWidth: 1, padding: 14, alignItems: 'center' },
  savedText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },

  // Navigation
  nav: { borderTopWidth: 1, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  navBtns: { flexDirection: 'row', gap: 8 },
  navBtn: { borderRadius: 9, borderWidth: 1, paddingHorizontal: 18, paddingVertical: 10 },
  navBtnPrimary: { borderWidth: 0 },
  navBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
});
