import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

const HERO_MIN_HEIGHT = 138;
const TILE = 86;
const FALLBACK_SURFACE = "#3a3a40";

export type PlaylistCardProps = {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** Track artwork URLs — e.g. first two songs from `fetchPlaylist` order. */
  artworkUrls?: [string | undefined, string | undefined];
  trackCount?: number;
  isLoading?: boolean;
  /** Hero background when art is missing or still loading behind placeholders. */
  backgroundColor?: string;
};

function ArtTile({
  uri,
  surfaceColor,
  style: tileStyle,
}: {
  uri?: string;
  surfaceColor: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.tile, { backgroundColor: surfaceColor }, tileStyle]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={120}
        />
      ) : (
        <View style={styles.tilePlaceholder}>
          <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.35)" />
        </View>
      )}
    </View>
  );
}

function buildSubtitle(trackCount: number | undefined): string | null {
  if (trackCount === undefined || trackCount <= 0) return null;
  return `${trackCount} track${trackCount === 1 ? "" : "s"}`;
}

export function PlaylistCard({
  title,
  onPress,
  style,
  artworkUrls = [undefined, undefined],
  trackCount,
  isLoading,
  backgroundColor = FALLBACK_SURFACE,
}: PlaylistCardProps) {
  const [backUrl, frontUrl] = artworkUrls;
  const subtitle = buildSubtitle(trackCount);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cardOuter,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={[styles.cardInner, { backgroundColor }]}>
        <View style={styles.hero}>
          {isLoading ? (
            <View style={styles.heroLoading}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.7)" />
            </View>
          ) : (
            <>
              <ArtTile
                uri={backUrl}
                surfaceColor={backgroundColor}
                style={styles.tileBack}
              />
              <ArtTile
                uri={frontUrl}
                surfaceColor={backgroundColor}
                style={styles.tileFront}
              />
            </>
          )}
        </View>

        <View style={styles.footer}>
          <Text
            style={styles.title}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.55}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    borderRadius: 14,
    minHeight: 224,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      default: {},
    }),
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  cardInner: {
    flex: 1,
    minHeight: 224,
    borderRadius: 14,
    overflow: "hidden",
  },
  hero: {
    minHeight: HERO_MIN_HEIGHT,
    position: "relative",
  },
  heroLoading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)",
  },
  tilePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  tileBack: {
    position: "absolute",
    left: 12,
    top: 16,
    zIndex: 0,
  },
  tileFront: {
    position: "absolute",
    right: 12,
    bottom: 10,
    zIndex: 1,
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.35)",
  },
  footer: {
    flex: 1,
    justifyContent: "flex-end",
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: "rgba(0,0,0,0.52)",
    minHeight: 78,
  },
  title: {
    alignSelf: "stretch",
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
    textShadowColor: "rgba(0,0,0,0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    marginTop: 4,
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
