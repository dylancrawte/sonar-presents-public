import { fetchSongs } from "@/api/song-library-api";
import { useQuery } from "@tanstack/react-query";

export function useSongs() {
    const { data: fetchedSongs = [], isPending } = useQuery({
        queryKey: ['songs'],
        queryFn: () => fetchSongs(),
        staleTime: 5 * 60_000,
    });

    return { fetchedSongs, isSongsLoading: isPending };
}