import { Text, type TextProps } from 'react-native';
import { fontColour, fontSize } from '@/constants/text';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'title' | 'secondary' | 'tertiary' | 'button' | 'tabBar';
};

export function ThemedText({
  style,
  type,
  ...rest
}: ThemedTextProps) {
  const theme = useColorScheme() ?? 'light';

  return (
    <Text
      style={[
        type === 'title' ? { color: fontColour[theme].title, fontSize: fontSize.title } : undefined,
        type === 'secondary' ? { color: fontColour[theme].secondary, fontSize: fontSize.secondary } : undefined,
        type === 'tertiary' ? { color: fontColour[theme].tertiary, fontSize: fontSize.tertiary } : undefined,
        type === 'button' ? { color: fontColour[theme].button, fontSize: fontSize.button } : undefined,
        type === 'tabBar' ? { color: fontColour[theme].tabBar, fontSize: fontSize.tabBar } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

// const styles = StyleSheet.create({
//   default: {
//     fontSize: 16,
//     lineHeight: 24,
//   },
//   defaultSemiBold: {
//     fontSize: 16,
//     lineHeight: 24,
//     fontWeight: '600',
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     lineHeight: 32,
//   },
//   subtitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   link: {
//     lineHeight: 30,
//     fontSize: 16,
//     color: '#0a7ea4',
//   },
// });
