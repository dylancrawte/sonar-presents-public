import { Colors } from '@/constants/theme';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '../themed-text';

type ButtonVariant = 'filled' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
    onPress?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    children: React.ReactNode;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
    onPress,
    variant = "filled",
    size = "md",
    disabled = false,
    loading = false,
    children,
    style,
    textStyle,
}) => {
    const colourScheme = useColorScheme();
    const isDark = colourScheme === 'dark';

    const sizeStyles: Record<
    ButtonSize,
    { height: number; fontSize: number; padding: number }
  > = {
    sm: { height: 36, fontSize: 14, padding: 12 },
    md: { height: 44, fontSize: 16, padding: 16 },
    lg: { height: 55, fontSize: 18, padding: 20 },
  };

  const getVariantStyle = () => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    };

    switch (variant) {
        case "filled":
          return {
            ...baseStyle,
            backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
          };
        case "outline":
          return {
            ...baseStyle,
            backgroundColor: "transparent",
            borderWidth: 1,
            borderColor: isDark ? Colors.dark.tint : Colors.light.tint,
          };
        case "ghost":
          return {
            ...baseStyle,
            backgroundColor: "transparent",
          };
      }
    };

    const getTextColor = () => {
        if (disabled) {
          return isDark ? Colors.dark.icon : Colors.light.icon;
        }
    
        switch (variant) {
          case "filled":
            return isDark ? Colors.dark.text : Colors.light.text;
          case "outline":
          case "ghost":
            return Colors.light.tint;
        }
      };
    
    return (
        <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={[
            getVariantStyle(),
            {
                height: sizeStyles[size].height,
                paddingHorizontal: sizeStyles[size].padding,
                opacity: disabled ? 0.5 : 1,
            },
            style,
        ]}
        >
            {loading ? (
                <ActivityIndicator color={getTextColor()} />
            ) : (
                <ThemedText
                style={StyleSheet.flatten([
                  {
                    fontSize: sizeStyles[size].fontSize,
                    color: getTextColor(),
                    textAlign: "center",
                    marginBottom: 0,
                    fontWeight: "700",
                  },
                  textStyle,
                ])}
              >{children}
              </ThemedText>
            )}    
        </Pressable>
    );
};

export default Button;
