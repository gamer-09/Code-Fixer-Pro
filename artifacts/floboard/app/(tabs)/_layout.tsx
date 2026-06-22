import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Line, Path, Rect } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

function IconMarkets({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="10" width="4" height="11" rx="1" fill={color} />
      <Rect x="10" y="4" width="4" height="17" rx="1" fill={color} />
      <Rect x="17" y="7" width="4" height="14" rx="1" fill={color} />
    </Svg>
  );
}

function IconCrypto({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="M9 8h5a2 2 0 0 1 0 4H9M9 12h5.5a2 2 0 0 1 0 4H9" />
      <Line x1="11" y1="6" x2="11" y2="8" />
      <Line x1="13" y1="6" x2="13" y2="8" />
      <Line x1="11" y1="16" x2="11" y2="18" />
      <Line x1="13" y1="16" x2="13" y2="18" />
    </Svg>
  );
}

function IconNews({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z" />
      <Line x1="7" y1="9" x2="17" y2="9" />
      <Line x1="7" y1="13" x2="17" y2="13" />
      <Line x1="7" y1="17" x2="12" y2="17" />
    </Svg>
  );
}

function IconAdvisor({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </Svg>
  );
}

function IconPortfolio({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="2" y="7" width="20" height="14" rx="2" />
      <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </Svg>
  );
}

function IconCurrencyPairs({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="8" cy="12" r="5" />
      <Circle cx="16" cy="12" r="5" />
      <Line x1="11" y1="12" x2="13" y2="12" />
    </Svg>
  );
}

function IconWatchlist({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Svg>
  );
}

function IconSettings({ color, size }: { color: string; size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="3" />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.gain,
        tabBarInactiveTintColor: colors.t3,
        headerShown: false,
        tabBarStyle: {
          ...(isIOS ? { position: "absolute" as const } : {}),
          backgroundColor: isIOS ? "transparent" : colors.base,
          borderTopWidth: 1,
          borderTopColor: colors.rim,
          elevation: 8,
          paddingBottom: isWeb ? 0 : insets.bottom,
          height: isWeb ? 60 : 54 + insets.bottom,
        },
        tabBarBackground: isIOS
          ? () => <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
          : undefined,
        tabBarLabelStyle: {
          fontSize: 9,
          fontFamily: "Inter_600SemiBold",
          letterSpacing: 0.3,
        },
        tabBarIconStyle: { marginTop: 2 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Markets", tabBarIcon: ({ color }) => <IconMarkets color={color} size={21} /> }} />
      <Tabs.Screen name="crypto" options={{ title: "Crypto", tabBarIcon: ({ color }) => <IconCrypto color={color} size={21} /> }} />
      <Tabs.Screen name="currency-pairs" options={{ title: "FX Pairs", tabBarIcon: ({ color }) => <IconCurrencyPairs color={color} size={21} /> }} />
      <Tabs.Screen name="news" options={{ title: "News", tabBarIcon: ({ color }) => <IconNews color={color} size={21} /> }} />
      <Tabs.Screen name="advisor" options={{ title: "Advisor", tabBarIcon: ({ color }) => <IconAdvisor color={color} size={21} /> }} />
      <Tabs.Screen name="portfolio" options={{ title: "Portfolio", tabBarIcon: ({ color }) => <IconPortfolio color={color} size={21} /> }} />
      <Tabs.Screen name="watchlist" options={{ title: "Watchlist", tabBarIcon: ({ color }) => <IconWatchlist color={color} size={21} /> }} />
      <Tabs.Screen name="settings" options={{ title: "Settings", tabBarIcon: ({ color }) => <IconSettings color={color} size={21} /> }} />
    </Tabs>
  );
}
