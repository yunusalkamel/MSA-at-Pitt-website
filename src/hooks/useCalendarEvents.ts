import { useEffect, useState } from "react";
import type { MSAEvent } from "@/data/events";
import { fetchEventsFromCalendar } from "@/services/eventsApi";

export function useCalendarEvents() {
  const [events, setEvents] = useState<MSAEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchEventsFromCalendar();
        if (!cancelled) setEvents(response);
      } catch (err) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Could not load events";
          setError(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { events, loading, error };
}
