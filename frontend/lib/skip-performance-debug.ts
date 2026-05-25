import { Platform } from "react-native";

/** Grep logs: `[SKIP_PERF]` — compare iOS vs Android when diagnosing skip / artwork latency. */
export const SKIP_PERF_TAG = "[SKIP_PERF]";

function perfNow(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

/** Set when user taps skip next/previous (home controls). Resets correlation for “ms since skip”. */
let lastSkipPressMs = 0;

export function markSkipPress(): void {
  lastSkipPressMs = perfNow();
}

export function msSinceSkipPress(): number | null {
  if (!lastSkipPressMs) return null;
  return perfNow() - lastSkipPressMs;
}

export function logSkipPerf(phase: string, extra?: Record<string, unknown>): void {
  console.log(SKIP_PERF_TAG, phase, {
    platform: Platform.OS,
    t: perfNow(),
    msSinceSkipPress: msSinceSkipPress(),
    ...extra,
  });
}

/** Short host for logs (CDN vs origin) without dumping full URLs. */
export function artworkHost(artworkUrl: string | undefined | null): string | null {
  if (!artworkUrl) return null;
  try {
    return new URL(artworkUrl).hostname;
  } catch {
    return "(invalid)";
  }
}
