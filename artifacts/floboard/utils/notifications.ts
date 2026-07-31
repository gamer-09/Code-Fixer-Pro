import Constants from 'expo-constants';
import { Platform } from 'react-native';

// expo-notifications push functionality was removed from Expo Go in SDK 53.
// It works correctly in standalone production builds (Play Store / App Store)
// and in development builds, but NOT in Expo Go.
// We guard every call behind this check so Expo Go stays error-free.

export function areNotificationsSupported(): boolean {
  if (Platform.OS === 'web') return false;
  // appOwnership === 'expo' means the app is running inside Expo Go
  if (Constants.appOwnership === 'expo') return false;
  return true;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!areNotificationsSupported()) return true;
  try {
    const Notifications = await import('expo-notifications');
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted || existing.status === 'granted') return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted || requested.status === 'granted';
  } catch {
    return true;
  }
}

export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  if (!areNotificationsSupported()) return;
  try {
    const Notifications = await import('expo-notifications');
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: data ?? {}, sound: true },
      trigger: null,
    });
  } catch {}
}

export function setupNotificationHandler() {
  if (!areNotificationsSupported()) return;
  try {
    // Dynamic import so Expo Go never even evaluates the module
    import('expo-notifications').then((Notifications) => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }).catch(() => {});
  } catch {}
}
