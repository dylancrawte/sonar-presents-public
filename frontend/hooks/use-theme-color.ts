/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  // If the color is provided in the props, use it
  if (colorFromProps) {
    return colorFromProps;
  } else {
    // If the color is not provided in the props, use the default colour from current theme
    return Colors[theme][colorName];
  }
}
