import { Colors } from "@/constants/theme"
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons"
import { Platform, Pressable, View, ViewStyle } from "react-native"
import TrackPlayer, { useIsPlaying } from "react-native-track-player"
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useQueueStore } from "@/store/queue";
import { useEffect, useState } from "react";
import { logSkipPerf, markSkipPress } from "@/lib/skip-performance-debug";


type PlayerControlsProps = {
    style?: ViewStyle
}

type PlayerButtonProps = {
    style?: ViewStyle
    iconSize?: number
    disabled?: boolean
    onQueueNavComplete?: () => void | Promise<void>
    /** If set (e.g. home queue), run before getQueue; return true if optimistic was set. */
    primeOptimistic?: () => boolean
}

export const PlayPauseButton = ({style, iconSize}: PlayerButtonProps) => {
    const {playing} = useIsPlaying()
    const [androidPlaying, setAndroidPlaying] = useState(false);

    const colorScheme = useColorScheme()
    const isPlayingIcon = Platform.OS === "android" ? androidPlaying : playing;

    const readPlaybackState = async () => {
        const playbackState = await TrackPlayer.getPlaybackState();
        const stateValue =
            typeof playbackState === "string" ? playbackState : playbackState?.state;
        return stateValue === "playing" || stateValue === "buffering";
    };

    useEffect(() => {
        if (Platform.OS !== "android") return;

        let mounted = true;
        const syncFromNative = async () => {
            try {
                const nextPlaying = await readPlaybackState();
                if (mounted) {
                    setAndroidPlaying(nextPlaying);
                }
            } catch {
                // swallow — fallback poller; next tick will retry
            }
        };

        void syncFromNative();
        const intervalId = setInterval(() => {
            void syncFromNative();
        }, 500);

        return () => {
            mounted = false;
            clearInterval(intervalId);
        };
    }, []);

    const handleTogglePlayback = async () => {
        const isPlayingNow = await readPlaybackState();

        if (isPlayingNow) {
            await TrackPlayer.pause();
            if (Platform.OS === "android") {
                setAndroidPlaying(false);
            }
        } else {
            await TrackPlayer.play();
            if (Platform.OS === "android") {
                setAndroidPlaying(true);
            }
        }
    }

    return (
        <View style={[{ height: iconSize }, style]}>
            <Pressable
                onPress={handleTogglePlayback}>

                <FontAwesome name={isPlayingIcon ? "pause" : "play"} size={iconSize} color={colorScheme === 'dark' ? Colors.dark.text : Colors.light.text} />

            </Pressable>
        </View>
    )
}

export const SkipToNextButton = ({ iconSize = 30, disabled, onQueueNavComplete, primeOptimistic }: PlayerButtonProps) => {
    const colorScheme = useColorScheme()
    const color = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text

    const handleSkipToNext = async () => {
        markSkipPress();
        logSkipPerf("skipNext:press");
        const t0 = globalThis.performance?.now?.() ?? Date.now();
        const queueId = useQueueStore.getState().activeQueueId;

        let primed = primeOptimistic?.() === true;
        if (primed) {
            logSkipPerf("skipNext:optimisticPrimeSync", { source: "queueSongs" });
            // Yield one frame so Zustand/React can commit title/artwork before the heavy native skip.
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => resolve());
            });
        } else {
            try {
                const queue = await TrackPlayer.getQueue();
                const idx = await TrackPlayer.getActiveTrackIndex();
                const dtReadQueue = (globalThis.performance?.now?.() ?? Date.now()) - t0;
                if (queue.length > 0 && idx != null && idx >= 0) {
                    const nextIdx = (idx + 1) % queue.length;
                    const nextTrack = queue[nextIdx];
                    if (nextTrack) {
                        useQueueStore.getState().setOptimisticTrack(nextTrack as any, queueId);
                        logSkipPerf("skipNext:optimisticSet", {
                            dtReadQueueMs: Math.round(dtReadQueue),
                            nextTitle: nextTrack.title ?? null,
                            nextIdx,
                            queueLen: queue.length,
                        });
                    }
                }
            } catch (e) {
                logSkipPerf("skipNext:readQueueFailed", { error: String(e) });
            }
        }

        const t1 = globalThis.performance?.now?.() ?? Date.now();
        await TrackPlayer.skipToNext();
        logSkipPerf("skipNext:nativeSkipDone", {
            dtSkipToNextMs: Math.round((globalThis.performance?.now?.() ?? Date.now()) - t1),
        });
        await onQueueNavComplete?.();
        logSkipPerf("skipNext:fullHandlerDone", {
            dtTotalMs: Math.round((globalThis.performance?.now?.() ?? Date.now()) - t0),
        });
    };

    return (
        <Pressable
            disabled={disabled}
            onPress={handleSkipToNext}
            style={({ pressed }) => [{ opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}
        >
            <FontAwesome6 name="forward" size={iconSize} color={color} />
        </Pressable>
    )
}

export const SkipToPreviousButton = ({ iconSize = 30, disabled, onQueueNavComplete, primeOptimistic }: PlayerButtonProps) => {
    const colorScheme = useColorScheme()
    const color = colorScheme === 'dark' ? Colors.dark.text : Colors.light.text

    const handleSkipToPrevious = async () => {
        markSkipPress();
        logSkipPerf("skipPrev:press");
        const t0 = globalThis.performance?.now?.() ?? Date.now();
        const queueId = useQueueStore.getState().activeQueueId;

        let primedPrev = primeOptimistic?.() === true;
        if (primedPrev) {
            logSkipPerf("skipPrev:optimisticPrimeSync", { source: "queueSongs" });
            await new Promise<void>((resolve) => {
                requestAnimationFrame(() => resolve());
            });
        } else {
            try {
                const queue = await TrackPlayer.getQueue();
                const idx = await TrackPlayer.getActiveTrackIndex();
                const dtReadQueue = (globalThis.performance?.now?.() ?? Date.now()) - t0;
                if (queue.length > 0 && idx != null && idx >= 0) {
                    const prevIdx = (idx - 1 + queue.length) % queue.length;
                    const prevTrack = queue[prevIdx];
                    if (prevTrack) {
                        useQueueStore.getState().setOptimisticTrack(prevTrack as any, queueId);
                        logSkipPerf("skipPrev:optimisticSet", {
                            dtReadQueueMs: Math.round(dtReadQueue),
                            prevTitle: prevTrack.title ?? null,
                            prevIdx,
                            queueLen: queue.length,
                        });
                    }
                }
            } catch (e) {
                logSkipPerf("skipPrev:readQueueFailed", { error: String(e) });
            }
        }

        const t1 = globalThis.performance?.now?.() ?? Date.now();
        await TrackPlayer.skipToPrevious();
        logSkipPerf("skipPrev:nativeSkipDone", {
            dtSkipToPrevMs: Math.round((globalThis.performance?.now?.() ?? Date.now()) - t1),
        });
        await onQueueNavComplete?.();
        logSkipPerf("skipPrev:fullHandlerDone", {
            dtTotalMs: Math.round((globalThis.performance?.now?.() ?? Date.now()) - t0),
        });
    }

    return (
        <Pressable
            disabled={disabled}
            onPress={handleSkipToPrevious}
            style={({ pressed }) => [{ opacity: disabled ? 0.45 : pressed ? 0.7 : 1 }]}
        >
            <FontAwesome6 name="backward" size={iconSize} color={color} />
        </Pressable>
    )
}
