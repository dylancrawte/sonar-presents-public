import React from 'react';
import { render } from '@testing-library/react-native';

const mockUseAuth = jest.fn();

jest.mock('@clerk/clerk-expo', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('expo-router', () => {
  const { View, Text } = require('react-native');
  return {
    Redirect: ({ href }: { href: string }) => <Text testID="redirect">{href}</Text>,
    Stack: Object.assign(
      ({ children }: any) => <View testID="stack">{children}</View>,
      {
        Screen: ({ name }: { name: string }) => <View testID={`screen-${name}`} />,
      }
    ),
  };
});

import AuthRoutesLayout from '@/app/(auth)/_layout';

describe('Auth Layout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('redirects signed-in users to /(index)', () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: true });
    const { getByTestId } = render(<AuthRoutesLayout />);
    const redirect = getByTestId('redirect');
    expect(redirect).toBeTruthy();
    expect(redirect.props.children).toBe('/(index)');
  });
  
  it('returns null while auth state is loading', () => {
    mockUseAuth.mockReturnValue({ isLoaded: false, isSignedIn: false });
    const { toJSON } = render(<AuthRoutesLayout />);
    expect(toJSON()).toBeNull();
  });

  it('renders auth navigation stack for signed-out users', () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false });
    const { getByTestId, queryByTestId } = render(<AuthRoutesLayout />);
    expect(getByTestId('stack')).toBeTruthy();
    expect(queryByTestId('redirect')).toBeNull();
  });

  it('registers sign-in, sign-up, and reset-password screens', () => {
    mockUseAuth.mockReturnValue({ isLoaded: true, isSignedIn: false });
    const { getByTestId } = render(<AuthRoutesLayout />);
    expect(getByTestId('screen-index')).toBeTruthy();
    expect(getByTestId('screen-sign-up')).toBeTruthy();
    expect(getByTestId('screen-reset-password')).toBeTruthy();
  });
});
