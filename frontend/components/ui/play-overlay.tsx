import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet } from "react-native";
import { useIsPlaying } from "react-native-track-player";

type PlayOverlayProps = {
  artworkSize: number;
  playing?: boolean
};

export const PlayOverlay = ({ artworkSize, playing: playingOverride }: PlayOverlayProps) => {
  const circleSize = Math.round(artworkSize * 0.225);
  const iconSize = Math.round(circleSize * 0.5);

  const {playing: globalPlaying} = useIsPlaying()
  const playing = playingOverride ?? globalPlaying

  return (
    <View style={styles.overlay} pointerEvents="none">
      <View
        style={[
          styles.circle,
          {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
          },
        ]}
      >
        {playing ? (
          <Ionicons name="pause" size={iconSize} color="#fff" style={styles.pauseIcon} />
        ) : (
          <Ionicons name="play" size={iconSize} color="#fff" style={styles.playIcon} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    backgroundColor: "rgba(216, 216, 216, 0.25)",
  },
  circle: {
    backgroundColor: "rgba(182, 179, 179, 0.5)",
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    paddingLeft: 2,
  },
  pauseIcon: {
    paddingRight: 1,
  },
});
