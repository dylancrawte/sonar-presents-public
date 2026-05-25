import { Ionicons } from "@expo/vector-icons"
import { Image } from "expo-image"
import { Pressable, StyleSheet, TouchableHighlight, View } from "react-native"
import { Song } from "@/api/song-library-api"
import { ThemedText } from "../themed-text"
import { PlayOverlay } from "../ui/play-overlay"
import { useActiveTrack, useIsPlaying } from "react-native-track-player"
import { useQueue } from "@/store/queue"

type TrackListItemProps = {
    track: Song;
    queueId: string;
    onTrackSelect: (track: Song) => void;
    onRemove?: (track: Song) => void;
}

export const TrackListItem = ({track, queueId, onTrackSelect, onRemove: handleTrackRemove}: TrackListItemProps) => {
    const activeTrack = useActiveTrack();
    const { playing } = useIsPlaying();
    const { activeQueueId, optimisticTrack, optimisticQueueId } = useQueue();
    const isActive = (activeQueueId === queueId && activeTrack?.url === track.url && !!playing)
    || (optimisticQueueId === queueId && optimisticTrack?.url === track.url);
    
    return (
        <TouchableHighlight onPress={() => onTrackSelect(track)}>
            <View style={[styles.trackItemContainer]}>
                <View style={styles.artworkWrap}>
                    <Image source={{
                            uri: track.artwork,
                            // Fast Image allows a priority here
                        }}
                        style={{
                            ...styles.trackArtwork,
                            opacity: isActive ? 0.6 : 1
                        }}
                    />
                    <PlayOverlay artworkSize={75} playing={isActive} />
                </View>
                {/* Track title + artist */}
                {/* There is dummy isActive logic to test the active text style */}
                <View style={[styles.trackInfo]}>
                    <ThemedText
                        numberOfLines={1}
                        type="secondary"
                        style={isActive ? styles.activeText : undefined}
                    >
                        {track.artist}
                    </ThemedText>
                    <ThemedText
                        numberOfLines={1}
                        type="tertiary"
                        style={isActive ? styles.activeText : undefined}
                    >
                        {track.title}
                    </ThemedText>
                </View>
                {handleTrackRemove && (
                    <Pressable onPress={() => handleTrackRemove(track)} hitSlop={8}>
                        <Ionicons name="remove-circle-outline" size={24} color="#888" />
                    </Pressable>
                )}
            </View>
        </TouchableHighlight>
    )
}

const styles = StyleSheet.create({
    artworkWrap: {
        width: 50,
        height: 50,
        borderRadius: 8,
        overflow: "hidden",
    },
    trackArtwork: {
        width: 50,
        height: 50,
        borderRadius: 8,
    },
    activeText: {
        fontWeight: '700',
    },
    trackItemContainer: {
        flexDirection: 'row',
        columnGap: 14,
        alignItems: 'center',
        paddingRight: 20,
        marginVertical: 5,
    },
    trackInfo: {
        flex: 1,
    },
    removeButton: {
        marginLeft: 'auto',
    }
})