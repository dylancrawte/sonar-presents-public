import { iosRootHeaderOptions } from "@/constants/ios-root-header";
import { Stack } from "expo-router";

export default function PlaylistStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Playlists",
        ...iosRootHeaderOptions,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Playlists",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: true,
          title: "",
          headerBackTitle: "Playlists",
          ...iosRootHeaderOptions,
          ...(process.env.EXPO_OS === "ios"
            ? { headerLargeTitle: false }
            : {}),
        }}
      />
    </Stack>
  );
}
