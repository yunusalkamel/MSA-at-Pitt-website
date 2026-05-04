import { useState, useEffect } from "react";
import { sanityClient } from "@/lib/sanity";

interface SanityState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Fetches data from Sanity using a GROQ query.
 * Falls back gracefully — `data` is null while loading or on error,
 * so every component should keep its hardcoded defaults as the fallback.
 *
 * Usage:
 *   const { data, loading } = useSanityData<FAQItem[]>(QUERIES.faqItems);
 */
export function useSanityData<T>(query: string): SanityState<T> {
  const [state, setState] = useState<SanityState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    sanityClient
      .fetch<T>(query)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null });
      })
      .catch((error) => {
        if (!cancelled) setState({ data: null, loading: false, error });
        console.warn("[Sanity] Failed to fetch:", error.message);
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  return state;
}
