import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

const mockSignInCreate = jest.fn();
const mockSetActive = jest.fn();
const mockRouterReplace = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('@clerk/clerk-expo', () => ({
  useSignIn: () => ({
    signIn: { create: mockSignInCreate },
    setActive: mockSetActive,
    isLoaded: true,
  }),
  isClerkAPIResponseError: (err: any) => err?.clerkError === true,
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    push: mockRouterPush,
  }),
}));

jest.mock('@/components/ui/button', () => {
  const { View, Text } = require('react-native');
  const Comp = ({ children, onPress, disabled }: any) => (
    <View onPress={onPress} disabled={disabled} testID={`btn-${children}`}>
      <Text>{children}</Text>
    </View>
  );
  return { __esModule: true, default: Comp, Button: Comp };
});

jest.mock('@/components/ui/text-input', () => {
  const { TextInput: RNTextInput, Text, View } = require('react-native');
  const Comp = ({ label, ...props }: any) => (
    <View>
      {label && <Text>{label}</Text>}
      <RNTextInput {...props} />
    </View>
  );
  return { __esModule: true, default: Comp, TextInput: Comp };
});

jest.mock('@/components/themed-text', () => {
  const { Text } = require('react-native');
  return {
    ThemedText: ({ children, ...props }: any) => (
      <Text {...props}>{children}</Text>
    ),
  };
});

jest.mock('@/components/ui/BodyScrollView', () => {
  const { View } = require('react-native');
  return {
    BodyScrollView: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock('@expo/vector-icons', () => ({
  Ionicons: () => null,
}));

import SignInScreen from '@/app/(auth)/index';

describe('Sign In Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email and password input fields', () => {
    const { getByPlaceholderText } = render(<SignInScreen />);
    expect(getByPlaceholderText('Enter your email')).toBeTruthy();
    expect(getByPlaceholderText('Enter your password')).toBeTruthy();
  });

  it('disables sign in button when email and password are empty', () => {
    const { getByTestId } = render(<SignInScreen />);
    expect(getByTestId('btn-Sign In').props.disabled).toBe(true);
  });

  it('enables sign in button when both fields are filled', () => {
    const { getByPlaceholderText, getByTestId } = render(<SignInScreen />);
    fireEvent.changeText(
      getByPlaceholderText('Enter your email'),
      'user@test.com'
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'secret'
    );
    expect(getByTestId('btn-Sign In').props.disabled).toBe(false);
  });

  it('calls signIn.create and navigates to /(index) on success', async () => {
    mockSignInCreate.mockResolvedValue({
      status: 'complete',
      createdSessionId: 'sess_abc',
    });
    mockSetActive.mockResolvedValue(undefined);

    const { getByPlaceholderText, getByTestId } = render(<SignInScreen />);
    fireEvent.changeText(
      getByPlaceholderText('Enter your email'),
      'user@test.com'
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'secret'
    );
    fireEvent.press(getByTestId('btn-Sign In'));

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: 'user@test.com',
        password: 'secret',
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_abc' });
      expect(mockRouterReplace).toHaveBeenCalledWith('/(index)');
    });
  });

  it('does not navigate when sign in status is not complete', async () => {
    mockSignInCreate.mockResolvedValue({ status: 'needs_second_factor' });

    const { getByPlaceholderText, getByTestId } = render(<SignInScreen />);
    fireEvent.changeText(
      getByPlaceholderText('Enter your email'),
      'user@test.com'
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'secret'
    );
    fireEvent.press(getByTestId('btn-Sign In'));

    await waitFor(() => expect(mockSignInCreate).toHaveBeenCalled());
    expect(mockSetActive).not.toHaveBeenCalled();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('handles API errors without crashing', async () => {
    mockSignInCreate.mockRejectedValue({
      clerkError: true,
      errors: [{ longMessage: 'Invalid password' }],
    });

    const { getByPlaceholderText, getByTestId } = render(<SignInScreen />);
    fireEvent.changeText(
      getByPlaceholderText('Enter your email'),
      'user@test.com'
    );
    fireEvent.changeText(
      getByPlaceholderText('Enter your password'),
      'wrong'
    );
    fireEvent.press(getByTestId('btn-Sign In'));

    await waitFor(() => expect(mockSignInCreate).toHaveBeenCalled());
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it('navigates to sign-up page', () => {
    const { getByTestId } = render(<SignInScreen />);
    fireEvent.press(getByTestId('btn-Sign Up'));
    expect(mockRouterPush).toHaveBeenCalledWith('/sign-up');
  });

  it('navigates to reset-password page', () => {
    const { getByTestId } = render(<SignInScreen />);
    fireEvent.press(getByTestId('btn-Reset Password'));
    expect(mockRouterPush).toHaveBeenCalledWith('/reset-password');
  });
});
