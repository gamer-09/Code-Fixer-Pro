import { useColorScheme } from "react-native";
import colors from "@/constants/colors";
import { useSettings } from "@/context/SettingsContext";

/**
 * Returns the design tokens for the current active theme ('dark' | 'light' | 'oled').
 * Reads from SettingsContext and dynamically returns the matching color palette.
 */
export function useColors() {
  let theme = "dark";
  try {
    const { settings } = useSettings();
    if (settings?.theme) theme = settings.theme;
  } catch { /* outside provider fallback */ }

  const scheme = useColorScheme();
  if (!theme) theme = scheme === "dark" ? "dark" : "dark";

  const palette =
    theme === "light"
      ? colors.light
      : theme === "oled"
      ? colors.oled
      : colors.dark;
  return { ...palette, radius: colors.radius };
}
