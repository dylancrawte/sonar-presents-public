import { useEffect, useState } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

import { forceDarkColorSchemeForTesting } from '@/constants/theme';

/**
 * Same behavior as native: supports static rendering on web (hydration), unless dark is forced.
 */
export function useColorScheme() {
  if (forceDarkColorSchemeForTesting) {
    return 'dark' as const;
  }

  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return 'light';
}
