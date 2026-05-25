/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';


export const Colors = {
  textMuted: '#9ca3af',
  
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const homeColors = {
  light: {
    background: '#111111',
    layer1: '#E7E7E7',
    floatingPlayer: '#D9D9D9',
    buttonBlue: '#EDF0FF',
    borderBlue: '#5A65FF',
    buttonPurple: '#D4C8DE'
  },
  dark: {
    background: '#111111',
    layer1: '#363535',
    floatingPlayer: '#4B4A4A',
    buttonBlue: '#111C48',
    borderBlue: '#5A65FF',
    buttonPurple: '#2A1F33'
  }
}

/**
 * While `true`, `hooks/use-color-scheme` always returns `"dark"` (for testing), but all
 * light/dark branches in the app still run — set to `false` to follow the device again.
 */
export const forceDarkColorSchemeForTesting = true;

