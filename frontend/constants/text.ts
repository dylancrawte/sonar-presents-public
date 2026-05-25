import { Platform } from "react-native";

export const fontSize = {
    title: 17,
    secondary: 15,
    tertiary: 12,
    button: 15,
    tabBar: 10
}

export const fontColour = {
    light: {
        title: '#000000',
        secondary: '#323131',
        tertiary: '#737272',
        button: '#000000',
        tabBar: '#000000',
    },
    dark: {
        title: '#FFFFFF',
        secondary: '#C5C5C5',
        tertiary: '#A0A0A0',
        button: '#E9E9E9',
        tabBar: '#FFFFFF',
    }
}

export const Fonts = Platform.select({
    ios: {
      /** iOS `UIFontDescriptorSystemDesignDefault` */
      sans: 'system-ui',
      /** iOS `UIFontDescriptorSystemDesignSerif` */
      serif: 'ui-serif',
      /** iOS `UIFontDescriptorSystemDesignRounded` */
      rounded: 'ui-rounded',
      /** iOS `UIFontDescriptorSystemDesignMonospaced` */
      mono: 'ui-monospace',
    },
    default: {
      sans: 'normal',
      serif: 'serif',
      rounded: 'normal',
      mono: 'monospace',
    },
    web: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      serif: "Georgia, 'Times New Roman', serif",
      rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
      mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    },
  });
