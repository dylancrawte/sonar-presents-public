import { Image } from "expo-image";
import {
  View,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
} from "react-native";
import { ThemedView } from "../themed-view";
import { TrackPlayerProps } from "@/hooks/home/use-song-picker";
import { PlayOverlay } from "../ui/play-overlay";
import TrackPlayer, { useIsPlaying } from "react-native-track-player";
import { useEffect, useState } from "react";
import { artworkHost, logSkipPerf, msSinceSkipPress } from "@/lib/skip-performance-debug";
import {
  SkipToPreviousButton,
  SkipToNextButton,
} from "@/components/player-controls";

const SKIP_ICON = 24;

export const TrackPlayerHome = ({
  track,
  onTrackSelect: handleTrackSelect,
  onTrackPause: handleTrackPause,
  isActiveQueue,
  queueNavEnabled = false,
  onQueueNavComplete,
  primeSkipNext,
  primeSkipPrev,
}: TrackPlayerProps) => {
  const imageUrl = track?.artwork;

  const { width } = useWindowDimensions();
  const artSize = Math.min(width - 48, 320);

  const { playing: globalPlaying } = useIsPlaying();
  const [androidPlaying, setAndroidPlaying] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    let mounted = true;
    const syncFromNative = async () => {
      try {
        const playbackState = await TrackPlayer.getPlaybackState();
        const stateValue =
          typeof playbackState === "string" ? playbackState : playbackState?.state;
        const isPlayingNow = stateValue === "playing" || stateValue === "buffering";

        if (mounted) {
          setAndroidPlaying(isPlayingNow);
        }
      } catch {
        // swallow — fallback poller; next tick will retry
      }
    };

    void syncFromNative();
    const intervalId = setInterval(() => {
      void syncFromNative();
    }, 500);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const playing = isActiveQueue && (Platform.OS === "android" ? androidPlaying : globalPlaying);

  const handleArtworkPress = async () => {
    if (playing) {
      handleTrackPause();
      return;
    }

    // If the Home queue is already active and paused, resume instead of re-selecting (which can restart).
    if (isActiveQueue) {
      await TrackPlayer.play();
      return;
    }

    if (track != null) {
      handleTrackSelect(track);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.playerRow}>
        <View style={styles.queueNavButton} accessibilityLabel="Previous track in queue">
          <SkipToPreviousButton
            iconSize={SKIP_ICON}
            disabled={!queueNavEnabled}
            onQueueNavComplete={onQueueNavComplete}
            primeOptimistic={primeSkipPrev}
          />
        </View>

        <Pressable
          style={[styles.artworkWrap, { width: artSize, height: artSize }]}
          onPress={() => void handleArtworkPress()}
        >
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={[styles.artwork, { width: artSize, height: artSize }]}
              contentFit="cover"
              priority="high"
              cachePolicy="memory-disk"
              onLoadStart={() => {
                const ms = msSinceSkipPress();
                if (ms != null && ms < 5000) {
                  logSkipPerf("home:artworkLoadStart", {
                    artworkHost: artworkHost(imageUrl),
                  });
                }
              }}
              onLoad={() => {
                const ms = msSinceSkipPress();
                if (ms != null && ms < 5000) {
                  logSkipPerf("home:artworkOnLoad", {
                    artworkHost: artworkHost(imageUrl),
                  });
                }
              }}
            />
          ) : (
            // TODO: add a placeholder image
            <View style={[styles.artworkPlaceholder, { width: artSize, height: artSize }]} />
          )}
          <PlayOverlay artworkSize={artSize} playing={playing} />
        </Pressable>

        <View style={styles.queueNavButton} accessibilityLabel="Next track in queue">
          <SkipToNextButton
            iconSize={SKIP_ICON}
            disabled={!queueNavEnabled}
            onQueueNavComplete={onQueueNavComplete}
            primeOptimistic={primeSkipNext}
          />
        </View>
      </View>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 16,
    backgroundColor: "transparent",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    maxWidth: "100%",
  },
  queueNavButton: {
    justifyContent: "center",
    alignItems: "center",
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(147, 51, 234, 0.6)",
    backgroundColor: "rgba(30, 27, 45, 0.95)",
  },
  filterLabel: {
    color: "#ECEDEE",
    fontSize: 15,
    fontWeight: "600",
  },
  artworkWrap: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "transparent",
    zIndex: 1,
  },
  artwork: {
    borderRadius: 16,
    zIndex: 2,
    opacity: 0.9,
  },
  artworkPlaceholder: {
    borderRadius: 16,
    backgroundColor: "rgba(128,128,128,0.3)",
  },
});
