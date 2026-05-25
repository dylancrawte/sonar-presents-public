import { BodyScrollView } from "@/components/ui/BodyScrollView";
import { TrackPlayerHome } from "@/components/home/track-player";
import { ActivityIndicator, Platform, StyleSheet, View, TouchableOpacity } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemedView } from "@/components/themed-view";
import { FilterRow } from "@/components/home/filter-row";
import { InfoCard } from "@/components/home/info-card";
import { useClerk } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import Button from "@/components/ui/button";
import { handleTrackPause, handleQueueTrackSelect } from "@/controllers/track-player-controller";
import { useSongs } from "@/hooks/cache/use-songs";
import { useQueue, useQueueStore } from "@/store/queue";
import TrackPlayer, { Track, useActiveTrack } from "react-native-track-player";
import { Image, ImageBackground } from "expo-image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { genreIconData } from "@/hooks/cache/use-icon-images";
import { Ionicons } from "@expo/vector-icons";
import { artworkHost, logSkipPerf, msSinceSkipPress } from "@/lib/skip-performance-debug";

export default function HomeScreen() {
  const theme = useColorScheme() ?? "light";

  const [filtersVisible, setFiltersVisible] = useState(false);
  const [genre1, setGenre1] = useState(null);
  const [genre2, setGenre2] = useState(null);
  const [androidFallbackActiveTrack, setAndroidFallbackActiveTrack] = useState<Track | null>(null);

  const { activeQueueId, setActiveQueueId } = useQueue();
  const queueOffset = useRef(0);
  const skipNextGenreReset = useRef(true);

  const { fetchedSongs, isSongsLoading } = useSongs();
  
  const { signOut } = useClerk();

  const router = useRouter();

  const handleSignOut = async () => {
      await signOut();
      router.replace("/(auth)");
      };
  

  // genre1 / 2 label constants hold the string name of the genres
  const genre1Label = genre1 != null ? genreIconData[genre1]?.lable : null;
  const genre2Label = genre2 != null ? genreIconData[genre2]?.lable : null;



  // TODO: add filtering by genre2 (when there is a queue feature)
  const filteredSongs = genre1Label
    ? fetchedSongs?.filter(song => song.genre?.includes(genre1Label))
    : fetchedSongs;

  const queueSongs = useMemo(
    () => filteredSongs ?? fetchedSongs ?? [],
    [filteredSongs, fetchedSongs],
  );

  const activeTrack = useActiveTrack();
  const effectiveActiveTrack =
    Platform.OS === "android"
      ? (androidFallbackActiveTrack ?? activeTrack)
      : activeTrack;
  const isHomeQueue = activeQueueId?.startsWith('home');
  const [lastHomeTrack, setLastHomeTrack] = useState<Track | null>(null);

  const { optimisticTrack, optimisticQueueId, setOptimisticTrack } = useQueue();
  const homeOptimisticTrack =
    optimisticQueueId?.startsWith("home") ? optimisticTrack : null;
  const selectedTrack = (isHomeQueue && effectiveActiveTrack)
    ? effectiveActiveTrack as unknown as (typeof queueSongs)[number]
    : (lastHomeTrack as unknown as (typeof queueSongs)[number]) ?? queueSongs[0];

  const syncAndroidActiveTrackFallback = useCallback(async () => {
    if (Platform.OS !== "android") return;

    // Android event delivery is unreliable in this app; poll getter briefly after nav actions.
    // Only local "what's actually playing" state is updated here — never touch optimisticTrack,
    // which represents user intent and must not be clobbered by a stale getter during queue changes.
    const retryDelaysMs = [0, 120, 300];
    for (const delayMs of retryDelaysMs) {
      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      const current = await TrackPlayer.getActiveTrack();
      if (current) {
        const since = msSinceSkipPress();
        if (since != null && since < 4000) {
          logSkipPerf("androidFallbackSync:hit", {
            attemptDelayMs: delayMs,
            title: current.title ?? null,
          });
        }
        setAndroidFallbackActiveTrack(current);
        return;
      }
    }
    {
      const sinceSkip = msSinceSkipPress();
      if (sinceSkip != null && sinceSkip < 4000) {
        logSkipPerf("androidFallbackSync:missedAllRetries", {});
      }
    }
  }, []);

  /** Changing genre clears the queue and start a new one (home-genre) */
  useEffect(() => {
    const genre1LabelNow = genre1 != null ? genreIconData[genre1]?.lable ?? null : null;

    if (skipNextGenreReset.current) {
      skipNextGenreReset.current = false;
      return;
    }

    // Always drop the home preview on genre change so the home screen previews the
    // first song of the newly-filtered list, regardless of which queue is currently active.
    setLastHomeTrack(null);

    const queueId = useQueueStore.getState().activeQueueId;

    // if we're not in any of the home queues, don't touch the native player
    if (!queueId?.startsWith("home")) {
      return;
    }

    // else, reset the player and clear the queue state
    void (async () => {
      await TrackPlayer.reset();
      useQueueStore.getState().setActiveQueueId(null);
      useQueueStore.getState().setOptimisticTrack(null);
      queueOffset.current = 0;
    })();
  }, [genre1]);

  const handleTrackSelect = (track: typeof selectedTrack) => {
    if (!track) return;

    const queueId = genre1Label ? `home-${genre1Label}` : 'home';
    setOptimisticTrack(track, queueId);

    handleQueueTrackSelect({
      selectedTrack: track,
      queueSongs,
      queueId,
      activeQueueId,
      setActiveQueueId,
      queueOffset,
    });

  };

  const displayTrack = homeOptimisticTrack ?? selectedTrack;

  const prevDisplayUrlRef = useRef<string | null>(null);
  useEffect(() => {
    const url = displayTrack?.url ?? null;
    if (url === prevDisplayUrlRef.current) return;
    prevDisplayUrlRef.current = url;
    const source = homeOptimisticTrack
      ? "homeOptimisticTrack"
      : (isHomeQueue && effectiveActiveTrack)
        ? "effectiveActiveTrack"
        : lastHomeTrack
          ? "lastHomeTrack"
          : "queueSongs[0]";
    logSkipPerf("home:displayTrackChanged", {
      source,
      title: displayTrack?.title ?? null,
      artworkHost: artworkHost(displayTrack?.artwork),
      isHomeQueue,
      activeQueueId,
      hookActiveTitle: activeTrack?.title ?? null,
      effectiveTitle: effectiveActiveTrack?.title ?? null,
    });
  }, [
    displayTrack,
    homeOptimisticTrack,
    isHomeQueue,
    effectiveActiveTrack,
    lastHomeTrack,
    activeTrack,
    activeQueueId,
  ]);

  /** Native queue from `handleQueueTrackSelect` is [current, …after, …before]; skip uses the same order. */
  const queueNavEnabled = queueSongs.length > 1 && isHomeQueue;

  /** Sync optimistic + warm image cache without awaiting the native bridge (big win on Android). */
  const primeHomeSkipNext = useCallback((): boolean => {
    if (!activeQueueId?.startsWith("home") || queueSongs.length < 2) return false;
    const currentUrl =
      homeOptimisticTrack?.url
      ?? effectiveActiveTrack?.url
      ?? activeTrack?.url;
    if (!currentUrl) return false;
    const idx = queueSongs.findIndex((s) => s.url === currentUrl);
    if (idx < 0) return false;
    const next = queueSongs[(idx + 1) % queueSongs.length];
    setOptimisticTrack(next as Parameters<typeof setOptimisticTrack>[0], activeQueueId);
    const art = next.artwork;
    if (typeof art === "string" && art.length > 0) {
      void Image.prefetch(art);
    }
    return true;
  }, [
    activeQueueId,
    queueSongs,
    homeOptimisticTrack,
    effectiveActiveTrack,
    activeTrack,
    setOptimisticTrack,
  ]);

  const primeHomeSkipPrev = useCallback((): boolean => {
    if (!activeQueueId?.startsWith("home") || queueSongs.length < 2) return false;
    const currentUrl =
      homeOptimisticTrack?.url
      ?? effectiveActiveTrack?.url
      ?? activeTrack?.url;
    if (!currentUrl) return false;
    const idx = queueSongs.findIndex((s) => s.url === currentUrl);
    if (idx < 0) return false;
    const n = queueSongs.length;
    const prev = queueSongs[(idx - 1 + n) % n];
    setOptimisticTrack(prev as Parameters<typeof setOptimisticTrack>[0], activeQueueId);
    const art = prev.artwork;
    if (typeof art === "string" && art.length > 0) {
      void Image.prefetch(art);
    }
    return true;
  }, [
    activeQueueId,
    queueSongs,
    homeOptimisticTrack,
    effectiveActiveTrack,
    activeTrack,
    setOptimisticTrack,
  ]);

  // Only clear optimistic when native active track matches what we're showing optimistically.
  // Clearing on any activeTrack update makes Android flash back to stale metadata after skip.
  useEffect(() => {
    if (!activeTrack) return;
    if (Platform.OS === "android") {
      setAndroidFallbackActiveTrack(activeTrack);
    }
    {
      const since = msSinceSkipPress();
      if (since != null && since < 4000) {
        logSkipPerf("home:useActiveTrack", {
          title: activeTrack.title ?? null,
          urlMatchOptimistic:
            useQueueStore.getState().optimisticTrack?.url === activeTrack.url,
        });
      }
    }
    const opt = useQueueStore.getState().optimisticTrack;
    if (
      opt &&
      activeTrack.url &&
      opt.url &&
      activeTrack.url === opt.url
    ) {
      logSkipPerf("home:clearOptimistic(nativeCaughtUp)", {
        title: activeTrack.title ?? null,
      });
      setOptimisticTrack(null);
    }
  }, [activeTrack, setOptimisticTrack]);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    if (!isHomeQueue) return;
    if (homeOptimisticTrack != null) return;
    void syncAndroidActiveTrackFallback();
  }, [isHomeQueue, homeOptimisticTrack, syncAndroidActiveTrackFallback]);

  // queueSongs is read via a ref so that a genre-driven queueSongs change does NOT
  // re-trigger this effect. Otherwise: picking a new genre while still in a home queue
  // causes queueSongs to update, re-fires this effect with the currently-playing
  // track, and — if that track happens to belong to the new genre's list too —
  // immediately re-writes lastHomeTrack AFTER the genre-reset effect cleared it.
  const queueSongsRef = useRef(queueSongs);
  useEffect(() => {
    queueSongsRef.current = queueSongs;
  }, [queueSongs]);

  useEffect(() => {
    if (!isHomeQueue) return;
    if (!displayTrack) return;
    // Guard against the brief window where activeQueueId hasn't flipped yet but
    // the native active track has already changed to a different queue's song
    // (e.g., user taps a liked song while the home queue was active).
    const belongsToHomeQueue = queueSongsRef.current.some((song) => song.url === displayTrack.url);
    if (!belongsToHomeQueue) return;
    setLastHomeTrack(displayTrack as unknown as Track);
  }, [isHomeQueue, displayTrack]);

  return (
    <ThemedView style={styles.screen}>
      <ImageBackground
        source={
          theme === "light"
            ? require("@/assets/images/vinyl-light.png")
            : require("@/assets/images/vinyl-dark-with-blue-2.png")
        }
        style={styles.background}
      >
      
      <BodyScrollView
        contentContainerStyle={styles.scrollContent}
        style={styles.scroll}
      >
        <View style={styles.topBar}>
          {filtersVisible ? (
            <View style={styles.topBarRightCluster}>
              <FilterRow genre1={genre1} setGenre1={setGenre1} genre2={genre2} setGenre2={setGenre2} />
              <TouchableOpacity onPress={() => setFiltersVisible(false)} style={styles.filterToggle}>
                <Ionicons name="close" size={34} color={theme === "light" ? "#333" : "#fff"} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setFiltersVisible(true)} style={styles.filterToggle}>
              <Ionicons name="menu" size={34} color={theme === "light" ? "#333" : "#fff"} />
            </TouchableOpacity>
          )}
        </View>

        {isSongsLoading ? (
          <View style={styles.songsLoading} accessibilityLabel="Loading music library">
            <ActivityIndicator size="large" color={theme === "light" ? "#333" : "#fff"} />
          </View>
        ) : (
          <>
            <TrackPlayerHome
              track={displayTrack}
              onTrackSelect={(t) => t && handleTrackSelect(t)}
              onTrackPause={() => handleTrackPause()}
              isActiveQueue={isHomeQueue}
              queueNavEnabled={queueNavEnabled}
              onQueueNavComplete={() => void syncAndroidActiveTrackFallback()}
              primeSkipNext={primeHomeSkipNext}
              primeSkipPrev={primeHomeSkipPrev}
            />

            <InfoCard track={displayTrack} />
          </>
        )}

        <View style={{ alignItems: "center", marginTop: 20, marginBottom: 40 }}>
          <Button style ={{ paddingHorizontal: 64 }} onPress={handleSignOut}>Sign Out</Button>
        </View>

      </BodyScrollView>
      </ImageBackground>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingHorizontal: 8,
    minHeight: 56,
    width: "100%",
  },
  /** Genre dropdown + close sit together on the right (same as hamburger-only). */
  topBarRightCluster: {
    flexDirection: "row",
    alignItems: "center",
    maxWidth: "100%",
  },
  filterToggle: {
    padding: 12,
    minWidth: 48,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  songsLoading: {
    minHeight: 360,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
});
