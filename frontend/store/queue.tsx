import { Platform } from "react-native";
import { create } from "zustand";
import { Song } from "@/api/song-library-api";

const QUEUE_ID_DEBUG = "[QUEUE_ID]";

/** Return a short caller trace (skip Error+this fn; keep the next few frames, trim file noise). */
function shortStack(): string {
    const raw = new Error().stack ?? "";
    return raw
        .split("\n")
        .slice(2, 6)
        .map((line) => line.trim().replace(/^at\s+/, ""))
        .join(" <- ");
}

type QueueStore = {
    activeQueueId: string | null;
    setActiveQueueId: (id: string) => void;
    optimisticTrack: Song | null;
    optimisticQueueId: string | null;
    setOptimisticTrack: (track: Song | null, queueId?: string | null) => void;
}

export const useQueueStore = create<QueueStore>()((set, get) => ({
    activeQueueId: null,
    setActiveQueueId: (id) => {
        const before = get().activeQueueId;
        console.log(QUEUE_ID_DEBUG, "setActiveQueueId", {
            platform: Platform.OS,
            from: before,
            to: id,
            caller: shortStack(),
        });
        set({ activeQueueId: id });
    },
    optimisticTrack: null,
    optimisticQueueId: null,
    setOptimisticTrack: (track, queueId) => {
        if (!track) {
            set({ optimisticTrack: null, optimisticQueueId: null });
            return;
        }

        const resolvedQueueId = queueId ?? get().activeQueueId;
        set({
            optimisticTrack: track,
            optimisticQueueId: resolvedQueueId,
        });
    },
}))

export const useQueue = () =>  useQueueStore((state) => state)
