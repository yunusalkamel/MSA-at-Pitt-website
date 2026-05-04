import { useEffect, useState } from "react";
import { sanityClient } from "@/lib/sanity";

interface SanityState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  /** Becomes true once we've made at least one network attempt this session. */
  hydrated: boolean;
}

const CACHE_PREFIX = "msa-sanity-cache-v1:";
const CACHE_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 1 day — Sanity content updates infrequently

interface CachedPayload<T> {
  data: T;
  cachedAt: number;
}

function readCache<T>(query: string): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + query);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPayload<T>;
    if (Date.now() - parsed.cachedAt > CACHE_MAX_AGE_MS) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache<T>(query: string, data: T) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + query,
      JSON.stringify({ data, cachedAt: Date.now() } satisfies CachedPayload<T>),
    );
  } catch {
    /* ignore — quota / private mode */
  }
}

/**
 * Stale-while-revalidate Sanity fetch.
 *
 * Strategy:
 *   1. On mount, hydrate `data` synchronously from localStorage if present.
 *      This is what kills the bundled-fallback "flash" on first paint.
 *   2. Then fire a network request in the background; when it returns,
 *      replace `data` with the fresh payload and refresh the cache.
 *   3. On error, keep showing the cached data (or null) and surface `error`.
 *
 * Components should treat `data` as the source of truth — fall back to
 * hardcoded defaults only when `data` is null.
 */
export function useSanityData<T>(query: string, params?: Record<string, unknown>): SanityState<T> {
  // Build a stable cache key when params are present (e.g. `galleryAlbumBySlug`)
  const cacheKey = params ? `${query}::${JSON.stringify(params)}` : query;

  const [state, setState] = useState<SanityState<T>>(() => {
    const cached = readCache<T>(cacheKey);
    return {
      data: cached,
      loading: cached === null,
      error: null,
      hydrated: false,
    };
  });

  useEffect(() => {
    let cancelled = false;

    sanityClient
      .fetch<T>(query, params ?? {})
      .then((data) => {
        if (cancelled) return;
        setState({ data, loading: false, error: null, hydrated: true });
        writeCache(cacheKey, data);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setState((prev) => ({
          // Keep cached data visible on error — better than flickering to null
          data: prev.data,
          loading: false,
          error,
          hydrated: true,
        }));
        if (import.meta.env.DEV) {
          console.warn("[Sanity] Failed to fetch:", error.message);
        }
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return state;
}
