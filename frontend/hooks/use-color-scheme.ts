import { useColorScheme as useRNColorScheme } from 'react-native';

import { forceDarkColorSchemeForTesting } from '@/constants/theme';

export function useColorScheme() {
  if (forceDarkColorSchemeForTesting) {
    return 'dark' as const;
  }
  return useRNColorScheme();
}
