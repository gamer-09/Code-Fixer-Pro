import { useWindowDimensions } from 'react-native';

/**
 * Returns dynamic screen dimensions, breakpoint helpers, and responsive
 * scaling functions so FloBoard automatically adjusts to ANY phone screen
 * (small iOS/Android devices, standard screens, large Ultra/Max devices, or tablets)
 * rather than relying on fixed pixel sizes.
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isSmall = width < 360;
  const isMedium = width >= 360 && width < 400;
  const isLarge = width >= 400;

  // Scale a pixel value based on phone width relative to a standard 375px screen
  const scale = (val: number) => Math.round((width / 375) * val);
  const clampScale = (val: number, min: number, max: number) =>
    Math.max(min, Math.min(max, Math.round((width / 375) * val)));

  return {
    width,
    height,
    isSmall,
    isMedium,
    isLarge,
    scale,
    clampScale,
    // Dynamic sparkline dimensions for list rows across Markets, Crypto, and Watchlist
    sparkW: Math.max(50, Math.min(84, Math.floor(width * 0.18))),
    sparkH: Math.max(26, Math.min(36, Math.floor(width * 0.088))),
    // Dynamic chart dimensions for full-screen InteractiveChartModal
    modalChartW: Math.max(260, Math.min(width - 32, 420)),
    modalChartH: Math.max(180, Math.min(height * 0.32, 280)),
  };
}
