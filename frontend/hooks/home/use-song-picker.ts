import { Song } from "@/api/song-library-api";

export type TrackPlayerProps = {
    track: Song | undefined | null;
    onTrackSelect: (track: Song | undefined | null) => void;
    onTrackPause: () => void;
    isActiveQueue: boolean;
    /** When false, skip buttons are dimmed (e.g. single track or home queue not loaded yet). */
    queueNavEnabled?: boolean;
    /** Optional callback after queue next/previous completes (used for platform fallbacks). */
    onQueueNavComplete?: () => void | Promise<void>;
    /**
     * Home queue only: run synchronously at skip press *before* any native bridge call.
     * Sets optimistic track from `queueSongs` order (matches native [current, …after, …before] wrap)
     * so title/artwork update immediately on Android without awaiting getQueue().
     */
    /** Return true if optimistic was set from queueSongs (else skip handler falls back to getQueue). */
    primeSkipNext?: () => boolean;
    primeSkipPrev?: () => boolean;
};