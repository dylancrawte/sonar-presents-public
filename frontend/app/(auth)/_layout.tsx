import { homeColors } from "@/constants/theme";
import { useAuth } from "@clerk/clerk-expo";
import { Stack, Redirect } from "expo-router";

export default function AuthRoutesLayout() {
    const { isLoaded, isSignedIn } = useAuth();

    if (!isLoaded) return null;
    if (isSignedIn) {
        return <Redirect href='/(index)'/>
    }
    return (
        <Stack
        screenOptions={{
            ...(process.env.EXPO_OS !== "ios"
              ? {}
              : {
                  headerLargeTitle: true,
                  headerTransparent: true,
                  //headerBlurEffect: "systemChromeMaterial",
                  headerLargeTitleShadowVisible: false,
                  headerShadowVisible: true,
                  headerLargeStyle: {
                    backgroundColor: homeColors.light.background,
                  },
                }),
          }}
        >
            <Stack.Screen
              name='index'
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name='sign-up'
              options={{
                headerTitle: 'Sign Up',
                headerBackTitle: 'Sign In',
                headerBackButtonDisplayMode: 'default',
              }}
            />
            <Stack.Screen
              name='reset-password'
              options={{
                headerTitle: 'Reset Password',
                headerBackTitle: 'Sign In',
                headerBackButtonDisplayMode: 'default',
              }}
            />
        </Stack>
    )
}