import { useEffect, useRef } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    RatingType,
    RepeatMode,
} from "react-native-track-player";

const mediaControls = [
    Capability.Play,
    Capability.Pause,
    Capability.SkipToNext,
    Capability.SkipToPrevious,
    Capability.Stop,
];

async function ensureAndroidNotificationPermission() {
    if (Platform.OS !== "android" || Number(Platform.Version) < 33) return;
    const perm =
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        ?? "android.permission.POST_NOTIFICATIONS";
    await PermissionsAndroid.request(perm);
}

const setupPlayer = async () => {
    await ensureAndroidNotificationPermission();

    await TrackPlayer.setupPlayer({
        maxCacheSize: 1024 * 10,
    });

    await TrackPlayer.updateOptions({
        ratingType: RatingType.Heart,
        capabilities: mediaControls,
        // Android: collapsed notification + lock screen compact actions (iOS ignores these).
        notificationCapabilities: mediaControls,
        compactCapabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
        ],
        android: {
            // Keeps foreground playback service + media notification when app is swiped away.
            appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
        },
    });

    await TrackPlayer.setVolume(1);
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
}

export const useSetupTrackPlayer = ({ onLoad }: { onLoad?: () => void }) => {
    const isInitialized = useRef(false);
    
    useEffect(() => {
        setupPlayer().then(() => {
            isInitialized.current = true;
            onLoad?.();
        })
        .catch((error) => {
            isInitialized.current = false;
            console.error(error);
        });
    }, [onLoad])
}