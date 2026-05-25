import { FlatList, FlatListProps, Platform, View } from "react-native"
import { TrackListItem } from "./track-list-item";
import { utilStyles } from "@/styles";
import { useUser } from "@clerk/clerk-expo";
import { useLikedSongs } from "@/hooks/cache/use-liked-songs";
import { Song } from "@/api/song-library-api";
import { handleQueueTrackSelect } from "@/controllers/track-player-controller";
import { useQueue } from "@/store/queue";
import { useRef } from "react";

const QUEUE_ID_DEBUG = "[QUEUE_ID]";

export type TrackListProps = Partial<FlatListProps<Song>> & {
    /** When set, this list is shown and the player queue uses it. When omitted, liked songs from the cache hook are used. */
    songs?: Song[];
    /** Logical queue id for the track player and row highlight state. */
    queueId?: string;
};

export const TrackList = ({
    songs: songsProp,
    queueId = "liked-songs",
    ...flatListRest
}: TrackListProps) => {

    const { setOptimisticTrack } = useQueue();
    const {activeQueueId, setActiveQueueId} = useQueue();
    const queueOffset = useRef(0);
    const { user } = useUser();
    const { likedSongs = [], deleteLikedSongMutation } = useLikedSongs();

    const listData = songsProp !== undefined ? songsProp : likedSongs;
    const isLikedSource = songsProp === undefined;

    const handleTrackSelect = (selectedTrack: Song) =>
    {
        console.log(QUEUE_ID_DEBUG, "TrackList.handleTrackSelect", {
            platform: Platform.OS,
            queueId,
            activeQueueId,
            trackTitle: selectedTrack.title,
            listLength: listData.length,
        });
        setOptimisticTrack(selectedTrack, queueId);
        handleQueueTrackSelect({
            selectedTrack,
            queueSongs: listData,
            queueId,
            activeQueueId,
            setActiveQueueId,
            queueOffset,
        });
    }

    const itemDivider = () => (
        <View style={{...utilStyles.itemSeperator, marginVertical: 6, marginLeft: 60 }} />
    )

    const handleTrackRemove = async (track: Song) => {
        try {
            console.log("Sending User and Track: ", user?.id, track.url);
            if (!track.id) return;
            const response = await deleteLikedSongMutation({ userID: user?.id, songId: track.id });
            console.log("Delete track response: ", response);
        } catch (error) {
            console.error('Error deleting liked song:', error);
        }
    }
    
    return (
        <>
        <FlatList 
            {...flatListRest}
            data={listData}
            contentInsetAdjustmentBehavior="never"
            style={flatListRest.style}
            automaticallyAdjustsScrollIndicatorInsets
            contentContainerStyle={[
                { padding: 16 },
                flatListRest.contentContainerStyle,
            ]}
            ItemSeparatorComponent={itemDivider}
            keyExtractor={(item, index) => item.id ?? item.url ?? String(index)}
            renderItem={({item: track}) => (
            <TrackListItem 
                track={track}
                queueId={queueId}
                onTrackSelect={() => handleTrackSelect(track)}
                {...(isLikedSource ? { onRemove: (t) => handleTrackRemove(t) } : {})}
            />
        )}
        
        />
        </>
        
    )
}
