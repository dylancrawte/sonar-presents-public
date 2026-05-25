import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockSignOut = jest.fn();
const mockRouterReplace = jest.fn();

jest.mock('@clerk/clerk-expo', () => ({
  useClerk: () => ({ signOut: mockSignOut }),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
}));

jest.mock('@/hooks/cache/use-songs', () => ({
  useSongs: () => ({ fetchedSongs: [], isSongsLoading: false }),
}));

jest.mock('@/controllers/track-player', () => ({
  handleTrackSelect: jest.fn(),
}));

jest.mock('@/components/ui/BodyScrollView', () => {
  const { View } = require('react-native');
  return {
    BodyScrollView: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('@/components/home/track-player', () => ({
  TrackPlayerHome: () => null,
}));

jest.mock('@/components/themed-view', () => {
  const { View } = require('react-native');
  return {
    ThemedView: ({ children, ...props }: any) => (
      <View {...props}>{children}</View>
    ),
  };
});

jest.mock('@/components/home/filter-row', () => ({
  FilterRow: () => null,
}));

jest.mock('@/components/home/info-card', () => ({
  InfoCard: () => null,
}));

jest.mock('@/components/ui/button', () => {
  const { Pressable, Text } = require('react-native');
  const Comp = ({ children, onPress, disabled }: any) => (
    <Pressable onPress={onPress} disabled={disabled} testID={`btn-${children}`}>
      <Text>{children}</Text>
    </Pressable>
  );
  return { __esModule: true, default: Comp, Button: Comp };
});

jest.mock('expo-image', () => {
  const { View } = require('react-native');
  return {
    ImageBackground: ({ children }: any) => <View>{children}</View>,
  };
});

import HomeScreen from '@/app/(index)/index';

describe('Sign Out', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sign out button', () => {
    const { getByText } = render(<HomeScreen />);
    expect(getByText('Sign Out')).toBeTruthy();
  });

  it('calls signOut and navigates to /(auth)', async () => {
    mockSignOut.mockResolvedValue(undefined);

    const { getByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId('btn-Sign Out'));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockRouterReplace).toHaveBeenCalledWith('/(auth)');
    });
  });

  it('calls signOut before navigating to clear the session', async () => {
    const callOrder: string[] = [];
    mockSignOut.mockImplementation(async () => {
      callOrder.push('signOut');
    });
    mockRouterReplace.mockImplementation(() => {
      callOrder.push('navigate');
    });

    const { getByTestId } = render(<HomeScreen />);
    fireEvent.press(getByTestId('btn-Sign Out'));

    await waitFor(() => {
      expect(callOrder).toEqual(['signOut', 'navigate']);
    });
  });
});
