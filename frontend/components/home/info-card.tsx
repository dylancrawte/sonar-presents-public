import { Ionicons } from "@expo/vector-icons";
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View, ScrollView, Linking } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { homeColors } from "@/constants/theme";
import { Song } from "@/api/song-library-api";
import { useLikedSongs } from "@/hooks/cache/use-liked-songs";
import { useUser } from "@clerk/clerk-expo";
import { fontColour } from "@/constants/text";

export function InfoCard({ track }: { track: Song | undefined | null }) {
    const { user } = useUser();

    const { addLikedSongMutation, deleteLikedSongMutation, likedSongs } = useLikedSongs();
    
    const { width } = useWindowDimensions();
    const cardWidth = Math.min(width - 48, 400);

    const theme = useColorScheme() ?? 'light';

    const trackUrl = track?.url;
    const isLiked =
        trackUrl != null && trackUrl !== ''
            ? (likedSongs?.some(
                  (likedSong: Song) => likedSong?.url != null && likedSong.url === trackUrl
              ) ?? false)
            : false;

    const handleLikePress = async () => {
        if (!track?.url) return;
        try {
            const response = await addLikedSongMutation({ userID: user?.id, track });

            console.log("mutation response: ", response);

        } catch (error) {
            console.error('Error adding liked song:', error);
        }
    }

    const handleLikeRemovePress = async () => {
        if (!track?.url) return;
        try {
            if (!track.id) return;
            const response = await deleteLikedSongMutation({ userID: user?.id, songId: track.id });

            console.log("mutation response: ", response);
        } catch (error) {
            console.error('Error deleting liked song:', error);
        }
    }
    
    const socialLinkErrorAlert = () => {
        Alert.alert(
            "Unable to open link",
            "There is an issue with the social link provided for this artist."
        );
    };

    const handleSocialLinkPress = async () => {
        const website = track?.website?.trim();
        if (!website) return;
        try {
            const canOpen = await Linking.canOpenURL(website);
            if (!canOpen) {
                socialLinkErrorAlert();
                return;
            }
            await Linking.openURL(website);
        } catch {
            socialLinkErrorAlert();
        }
    };

    return (
        <View style={[styles.card, { width: cardWidth, alignSelf: "center" }, { backgroundColor: homeColors[theme].background + '80'}]}> 
        {/* The +80 reduces the opacity to 80%*/}
            
                <ThemedText type="title" style={styles.artist}>{track?.artist ?? "Artist"}</ThemedText>
                <ThemedText type="secondary" style={styles.title}>{track?.title ?? "-- Song Name --"}</ThemedText>
                <ScrollView style={{ maxHeight: 130, marginBottom: 12 }}>
                <ThemedText type="tertiary" style={styles.bioPlaceholder}>{track?.bio ?? "Bio"}</ThemedText>
            </ScrollView>

            <View style={styles.linksRow}>
            <View style={styles.linkCol}>
                <Pressable style={[styles.linkBtn]} onPress={handleSocialLinkPress}>
                <Ionicons name="person" size={20} color={fontColour[theme].button} />
                </Pressable>
            </View>
                <Pressable
                    onPress={() => isLiked ? handleLikeRemovePress() : handleLikePress()}
                    style={styles.likeWrap}
                    hitSlop={12}
                >
                    <Ionicons
                        name={isLiked ? "heart" : "heart-outline"}
                        size={32}
                        color={isLiked ? "#ef4444" : "#9CA3AF"}
                    />
                </Pressable> 
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    card: {
        marginTop: 20,
        paddingVertical: 20,
        paddingHorizontal: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(156, 163, 175, 0.4)",
    },
    artist: {
        textAlign: "center",
        marginBottom: 4,
    },
    title: {
        textAlign: "center",
        marginBottom: 12,
    },
      bioPlaceholder: {
        textAlign: "center",
        marginBottom: 16,
    },
    linksRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    linkCol: {
        gap: 10,
    },
    linkBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(156, 163, 175, 0.4)",
    },
    likeWrap: {
        padding: 8,
    },
})