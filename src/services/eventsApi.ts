import { supabase } from "@/integrations/supabase/client";
import type { MSAEvent } from "@/data/events";

export async function fetchEventsFromCalendar(): Promise<MSAEvent[]> {
  const { data, error } = await supabase.functions.invoke<{ events: MSAEvent[] }>("google-calendar-events", {
    method: "GET",
  });

  if (error) {
    throw new Error(error.message || "Unable to load calendar events");
  }

  if (!data?.events || !Array.isArray(data.events)) {
    throw new Error("Calendar response did not include a valid events array");
  }

  return data.events;
}
