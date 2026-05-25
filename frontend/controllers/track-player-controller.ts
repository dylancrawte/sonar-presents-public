import { Platform } from "react-native";
import TrackPlayer, { Track } from "react-native-track-player";
import { Song } from "@/api/song-library-api";

const QUEUE_ID_DEBUG = "[QUEUE_ID]";

export const handleTrackSelect = async (track: Song) => {
    await TrackPlayer.load(track as unknown as Track);
    await TrackPlayer.play();
}

export const handleTrackPause = async () => {
    await TrackPlayer.pause();
}

interface HandleQueueTrackSelectProps {
    selectedTrack: Song;
    queueSongs: Song[];
    queueId: string;
    activeQueueId: string | null;
    setActiveQueueId: (id: string) => void;
    queueOffset
}


export const handleQueueTrackSelect = async ({
    selectedTrack,
    queueSongs,
    queueId,
    activeQueueId,
    setActiveQueueId,
    queueOffset,
}: HandleQueueTrackSelectProps) => {
    const trackIndex = queueSongs.findIndex(track => track.url === selectedTrack.url);

    console.log(QUEUE_ID_DEBUG, "handleQueueTrackSelect:enter", {
        platform: Platform.OS,
        queueId,
        activeQueueId,
        trackIndex,
        queueSongsCount: queueSongs.length,
        selectedTitle: selectedTrack.title,
    });

    if (trackIndex === -1) return;

    const isChangingQueue = queueId !== activeQueueId;

    if (isChangingQueue) {
        // define tracks before and after current track, to then populate the queue.
        const beforeTracks = queueSongs.slice(0, trackIndex);
        const afterTracks = queueSongs.slice(trackIndex + 1);

        await TrackPlayer.reset();

        await TrackPlayer.add(selectedTrack as unknown as Track);
        await TrackPlayer.add(afterTracks as unknown as Track[]);
        await TrackPlayer.add(beforeTracks as unknown as Track[]);

        await TrackPlayer.play();

        queueOffset.current = trackIndex;
        setActiveQueueId(queueId);
    } else {
        const nextTrackIndex = trackIndex - queueOffset.current < 0
            ? queueSongs.length + trackIndex - queueOffset.current
            : trackIndex - queueOffset.current;

        await TrackPlayer.skip(nextTrackIndex);
        TrackPlayer.play();
    }
}
