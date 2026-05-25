import { addLikedSong, deleteLikedSong, fetchLikedSongs, Song } from "@/api/song-library-api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/clerk-expo";

export function useLikedSongs() {

    const queryClient = useQueryClient();

    const { user } = useUser();

    // fetch liked songs
    const { data: likedSongs } = useQuery({
        queryFn: () => fetchLikedSongs(user?.id),
        queryKey: ['liked-songs'],
    });

    // add liked song
    const { mutateAsync: addLikedSongMutation } = useMutation({
        mutationFn: ({ userID, track }: { userID: string; track: Song }) =>
            addLikedSong(userID, track),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liked-songs'] });
        }
    })

    // delete liked song
    const { mutateAsync: deleteLikedSongMutation } = useMutation({
        mutationFn: ({ userID, songId }: { userID: string; songId: string }) =>
            deleteLikedSong(userID, songId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['liked-songs'] });
        }
    })

    return { addLikedSongMutation, deleteLikedSongMutation, likedSongs }
}
