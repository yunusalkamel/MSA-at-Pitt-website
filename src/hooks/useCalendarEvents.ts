import { useCallback, useEffect, useState } from "react";
import type { MSAEvent } from "@/data/events";
import { fetchEventsFromCalendar } from "@/services/eventsApi";

const CACHE_KEY = "msa-calendar-events-v1";
const CACHE_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

interface CachedPayload {
  events: MSAEvent[];
  syncedAt: number;
}

function readCache(): CachedPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload;
    if (!parsed?.events || typeof parsed.syncedAt !== "number") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(events: MSAEvent[]) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ events, syncedAt: Date.now() } satisfies CachedPayload),
    );
  } catch {
    /* ignore storage failures (private mode, quota, etc.) */
  }
}

export function useCalendarEvents() {
  const [events, setEvents] = useState<MSAEvent[]>(() => readCache()?.events ?? []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(
    () => readCache()?.syncedAt ?? null,
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchEventsFromCalendar();
      setEvents(response);
      const now = Date.now();
      setLastSyncedAt(now);
      writeCache(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not load events";
      setError(message);
      // Keep any cached events visible — don't blank the page on transient failure
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const cached = readCache();
    const isFresh = cached && Date.now() - cached.syncedAt < CACHE_MAX_AGE_MS;
    if (isFresh) {
      setLoading(false);
    } else {
      void (async () => {
        if (cancelled) return;
        await load();
      })();
    }
    const interval = setInterval(() => void load(), CACHE_MAX_AGE_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [load]);

  return { events, loading, error, lastSyncedAt, refresh: load };
}
