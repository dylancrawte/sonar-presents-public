export const iosRootHeaderOptions =
  process.env.EXPO_OS !== "ios"
    ? {}
    : {
        headerLargeTitle: true,
        /** Opaque header: scene content sits below the bar; avoids double top inset with ScrollView automatic adjustment. */
        headerTransparent: false,
        headerBlurEffect: "systemChromeMaterial" as const,
        headerLargeTitleShadowVisible: false,
        headerShadowVisible: true,
        headerLargeStyle: {
          backgroundColor: "transparent",
        },
      };
