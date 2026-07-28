import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingModal } from "@/components/OnboardingModal";
import { MarketProvider } from "@/context/MarketContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { useMarketNotifications } from "@/hooks/useMarketNotifications";
import { setupNotificationHandler } from "@/utils/notifications";

// Set up notification handler once at module load
setupNotificationHandler();

// Inner component that mounts the notification watcher (needs MarketProvider + SettingsProvider context)
function NotificationsMount() {
  useMarketNotifications();
  return null;
}

// Suppress fontfaceobserver's 6000ms timeout unhandled rejection on web.
if (Platform.OS === "web" && typeof window !== "undefined") {
  window.addEventListener("unhandledrejection", (event) => {
    const msg = String((event.reason as { message?: string })?.message ?? "");
    if (msg.includes("timeout") || msg.includes("fontface")) {
      event.preventDefault();
    }
  });
}

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="about" options={{ headerShown: false }} />
      <Stack.Screen name="privacy-policy" options={{ headerShown: false }} />
      <Stack.Screen name="terms-of-use" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const [timedOut, setTimedOut] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      setTimedOut(true);
      SplashScreen.hideAsync().catch(() => {});
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError && !timedOut) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <SettingsProvider>
          <QueryClientProvider client={queryClient}>
            <MarketProvider>
              <NotificationsMount />
              <GestureHandlerRootView>
                <KeyboardProvider>
                  <RootLayoutNav />
                  <OnboardingModal />
                </KeyboardProvider>
              </GestureHandlerRootView>
            </MarketProvider>
          </QueryClientProvider>
        </SettingsProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
