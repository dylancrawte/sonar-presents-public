import { Platform } from "react-native";
import TrackPlayer, { Event, State } from "react-native-track-player";

export const playbackService = async () => {
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        void TrackPlayer.play();
    });

    TrackPlayer.addEventListener(Event.RemotePause, () => {
        void TrackPlayer.pause();
    });

    /**
     * Android: collapsed notification / some headsets send one combined play-pause action.
     * iOS native RNTrackPlayer only whitelists `remote-play` / `remote-pause` (no `remote-play-pause`) — subscribing there crashes.
     */
    if (Platform.OS === "android") {
        TrackPlayer.addEventListener("remote-play-pause" as Event, async () => {
            const { state } = await TrackPlayer.getPlaybackState();
            if (state === State.Playing) {
                await TrackPlayer.pause();
            } else {
                await TrackPlayer.play();
            }
        });
    }

    TrackPlayer.addEventListener(Event.RemoteNext, () => {
        void TrackPlayer.skipToNext();
    });

    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        void TrackPlayer.skipToPrevious();
    });

    TrackPlayer.addEventListener(Event.RemoteStop, () => {
        void TrackPlayer.stop();
    });
};