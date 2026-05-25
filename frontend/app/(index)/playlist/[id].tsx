import { TrackList } from "@/components/songs/track-list";
import { screenPadding } from "@/constants/tokens";
import { fetchPlaylist } from "@/api/song-library-api";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useLayoutEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

function paramToString(value: string | string[] | undefined) {
  if (value === undefined) return "";
  return Array.isArray(value) ? (value[0] ?? "") : value;
}

export default function PlaylistDetailScreen() {
  const navigation = useNavigation();

  const { title: titleParam, id: idParam } = useLocalSearchParams<{
    title?: string | string[];
    id?: string | string[];
  }>();
  const headerTitle = paramToString(titleParam);
  const playlistId = paramToString(idParam);
  const playlistKey = headerTitle;

  useLayoutEffect(() => {
    navigation.setOptions({ title: headerTitle || "Playlist" });
  }, [navigation, headerTitle]);

  const {
    data: playlistSongs,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["playlist-songs", playlistKey],
    queryFn: () => fetchPlaylist(playlistKey),
    enabled: !!playlistKey.trim(),
  });

  const queueId =
    playlistId !== "" ? `playlist:${playlistId}` : `playlist:${playlistKey}`;

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: screenPadding.horizontal,
      }}
    >
      {!playlistKey.trim() ? (
        <Text style={[styles.message, { marginTop: 24 }]}>
          Missing playlist name.
        </Text>
      ) : isPending ? (
        <ActivityIndicator
          style={{ marginTop: 32 }}
          accessibilityLabel="Loading playlist"
        />
      ) : isError ? (
        <Text style={[styles.message, { marginTop: 24 }]}>
          Could not load this playlist.
        </Text>
      ) : !playlistSongs?.length ? (
        <Text style={[styles.message, { marginTop: 24 }]}>
          No songs in this playlist yet.
        </Text>
      ) : (
        <TrackList songs={playlistSongs} queueId={queueId} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  message: {
    color: "#9ca3af",
  },
});
