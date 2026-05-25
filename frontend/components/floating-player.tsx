import { Image, StyleSheet, Pressable, View, ViewProps, Platform } from "react-native";
import TrackPlayer, { Track, useActiveTrack } from "react-native-track-player"
import { PlayPauseButton, SkipToNextButton } from "@/components/player-controls";
import { useLastActiveTrack } from "@/hooks/react-native-track-player-setup/use-last-active-track";
import { router } from "expo-router";
import { homeColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ThemedText } from "./themed-text";
import { useQueue } from "@/store/queue";
import { useState } from "react";

export const FloatingPlayer = ({ style }: ViewProps) => {
    const { optimisticTrack } = useQueue();
    const activeTrack = useActiveTrack()
    const lastActiveTrack = useLastActiveTrack();
    const [androidFallbackTrack, setAndroidFallbackTrack] = useState<Track | null>(null);

    const theme = useColorScheme() ?? 'light';    

    // optimisticTrack is strictly user intent (set only by tap / skip handlers). Showing it
    // immediately covers the window where activeQueueId hasn't caught up to the just-tapped
    // queue — especially visible on Android where native events lag. Once cleared, we fall
    // through to the real active track (or Android getter fallback / last active).
    const displayedTrack =
        optimisticTrack
        ?? activeTrack
        ?? (Platform.OS === "android" ? androidFallbackTrack : null)
        ?? lastActiveTrack

    if(!displayedTrack) return null;

    const handleFloatingPlayerPress = () => {
        router.push("/(index)")
        // TODO: add modal
    }

    // Android getter poll only — never writes optimisticTrack (user intent).
    const handleQueueNavComplete = async () => {
        if (Platform.OS !== "android") return;

        const retryDelaysMs = [0, 120, 300];
        for (const delayMs of retryDelaysMs) {
            if (delayMs > 0) {
                await new Promise((resolve) => setTimeout(resolve, delayMs));
            }

            const current = await TrackPlayer.getActiveTrack();
            if (current) {
                setAndroidFallbackTrack(current as Track);
                return;
            }
        }
    }

    return (
        <Pressable onPress={handleFloatingPlayerPress}
        style={[
            styles.container, style, { backgroundColor: homeColors[theme].layer1 }
        ]}>
            <>
                <Image source={{ uri: displayedTrack.artwork }} style={styles.trackArtwork}></Image>
            </>

            <View style={styles.trackTitleContainer}>
                <ThemedText type="secondary">
                    {displayedTrack.artist}
                </ThemedText>
                <ThemedText type="tertiary">
                    {displayedTrack.title}
                </ThemedText>
            </View>

            <View style={styles.trackControlsContainer}>
                <PlayPauseButton iconSize={24}/>
                <SkipToNextButton iconSize={22} onQueueNavComplete={handleQueueNavComplete} />
            </View>

        </Pressable>

        
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        padding: 8,
        borderRadius: 16,
        paddingVertical: 10,
    },
    trackArtwork: {
        width: 40,
        height: 40,
        borderRadius: 8,
    },
    trackTitle: {
        paddingLeft: 10,
    },
    trackTitleContainer: {
        flex: 1,
        overflow: 'hidden',
        marginLeft: 10,
    },
    trackControlsContainer: {
        flexDirection: "row",
        alignItems: "center",
        columnGap: 20,
        marginRight: 16,
        paddingLeft: 16,
    }
})