import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Slot, SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { tokenCache } from '@/cache';
import { useCallback, useEffect } from 'react';
import { useSetupTrackPlayer } from '@/hooks/react-native-track-player-setup/use-setup-track-player';
import { useLogTrackPlayerState } from '@/hooks/react-native-track-player-setup/use-log-track-player-state';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fetchSongs } from '@/api/song-library-api';
import TrackPlayer from 'react-native-track-player';
import { playbackService } from '@/constants/playbackService';

SplashScreen.preventAutoHideAsync();

TrackPlayer.registerPlaybackService(() => playbackService);

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  console.error('Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in frontend/.env (see .env.example)');
}

const queryClient = new QueryClient();

function SongsWarmCache() {
  useEffect(() => {
    void queryClient.prefetchQuery({
      queryKey: ['songs'],
      queryFn: fetchSongs,
    });
  }, []);
  return null;
}

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const handleTrackPlayerLoad = useCallback(() => {
    SplashScreen.hideAsync();
  }, []);

  useSetupTrackPlayer({
    onLoad: handleTrackPlayerLoad,
  });

  useLogTrackPlayerState();

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <SongsWarmCache />
        <ClerkLoaded>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Slot />
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
          </ThemeProvider>
        </ClerkLoaded>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
