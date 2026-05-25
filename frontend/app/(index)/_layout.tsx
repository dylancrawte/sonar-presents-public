import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { Tabs } from "expo-router";
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Ionicons } from '@expo/vector-icons';
import { View } from "react-native";
import { BottomTabBar, BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { FloatingPlayer } from "@/components/floating-player";
import { iosRootHeaderOptions } from "@/constants/ios-root-header";

/**
 * Custom tab bar that renders the FloatingPlayer anchored to the real tab bar's top edge
 * (bottom: "100%" of the tab bar container) on every device. The floating player is absolutely
 * positioned so it doesn't contribute to the measured tab bar height — screens continue to scroll
 * underneath it just like before.
 */
function TabBarWithFloatingPlayer(props: BottomTabBarProps) {
  return (
    <View>
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "100%",
        }}
      >
        <FloatingPlayer style={{ marginHorizontal: 8 }} />
      </View>
      <BottomTabBar {...props} />
    </View>
  );
}

export default function HomeRoutesLayout() {
  return (
    <Tabs
      screenOptions={{
        ...iosRootHeaderOptions,
      }}
      tabBar={(props) => <TabBarWithFloatingPlayer {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
        }}/>
      <Tabs.Screen
        name="likes"
        options={{
          title: 'Likes',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="playlist"
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? "index";
          const isPlaylistHome = routeName === "index";
          return {
            // List: tab header shows large title. Detail: tab header off so the nested stack
            // can show a real native header (back title only works on a Stack header).
            headerShown: isPlaylistHome,
            title: isPlaylistHome ? "Playlists" : "",
            tabBarLabel: "Playlists",
            ...(process.env.EXPO_OS === "ios"
              ? { headerLargeTitle: isPlaylistHome }
              : {}),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? "musical-notes" : "musical-notes-outline"}
                color={color}
                size={size}
              />
            ),
          };
        }}
      />
    </Tabs>
  );
}
