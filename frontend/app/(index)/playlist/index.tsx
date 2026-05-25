import { PlaylistCard } from "@/components/playlists/playlist-card";
import { BodyScrollView } from "@/components/ui/BodyScrollView";
import { fetchPlaylist } from "@/api/song-library-api";
import {
  PLAYLIST_SCROLL_BOTTOM_PADDING,
  PLAYLIST_SCROLL_HORIZONTAL_PADDING,
} from "@/constants/playlist-scroll-layout";
import { useQueries } from "@tanstack/react-query";
import { router } from "expo-router";
import { View, useWindowDimensions } from "react-native";

const GAP = 12;

const PLAYLISTS = [
  { id: "1", title: "Blast Me in the Car" },
  { id: "2", title: "Dopamine Hits" },
] as const;

export default function PlaylistIndexScreen() {
  const { width } = useWindowDimensions();
  const colWidth =
    (width - PLAYLIST_SCROLL_HORIZONTAL_PADDING * 2 - GAP) / 2;

  const playlistQueries = useQueries({
    queries: PLAYLISTS.map((p) => ({
      queryKey: ["playlist-songs", p.title] as const,
      queryFn: () => fetchPlaylist(p.title),
      staleTime: 5 * 60_000,
    })),
  });

  return (
    <BodyScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingHorizontal: PLAYLIST_SCROLL_HORIZONTAL_PADDING,
        paddingBottom: PLAYLIST_SCROLL_BOTTOM_PADDING,
        gap: GAP,
        paddingTop: PLAYLIST_SCROLL_HORIZONTAL_PADDING,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: GAP,
        }}
      >
        {PLAYLISTS.map((p, index) => {
          const query = playlistQueries[index];
          const songs = query.data ?? [];
          const a0 = songs[0]?.artwork?.trim();
          const a1 = songs[1]?.artwork?.trim();
          const artworkUrls: [string | undefined, string | undefined] = [
            a0 || undefined,
            a1 || undefined,
          ];

          return (
            <PlaylistCard
              key={p.id}
              style={{ width: colWidth, marginTop: 32 }}
              title={p.title}
              artworkUrls={artworkUrls}
              trackCount={songs.length}
              isLoading={query.isPending}
              onPress={() =>
                router.push({
                  pathname: "/playlist/[id]",
                  params: { id: p.id, title: p.title },
                })
              }
            />
          );
        })}
      </View>
    </BodyScrollView>
  );
}
