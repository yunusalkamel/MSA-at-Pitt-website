import { supabase } from "@/integrations/supabase/client";
import type { MSAEvent } from "@/data/events";

const EDGE_FUNCTION_NAME = "google-calendar-events";

type EventsResponse = {
  stage: "success";
  count: number;
  events: MSAEvent[];
};

type ErrorResponse = {
  stage?: string;
  error?: string;
  details?: string;
};

function formatError(stage: string | undefined, error: string | undefined, details: string | undefined) {
  return `Calendar fetch failed${stage ? ` at ${stage}` : ""}: ${error || "Unknown error"}${details ? ` | ${details}` : ""}`;
}

export async function fetchEventsFromCalendar(): Promise<MSAEvent[]> {
  const { data, error } = await supabase.functions.invoke<EventsResponse | ErrorResponse>(EDGE_FUNCTION_NAME, {
    method: "GET",
  });

  if (error) {
    throw new Error(`Calendar fetch failed at edge invoke (${EDGE_FUNCTION_NAME}): ${error.message}`);
  }

  if (!data || !("stage" in data)) {
    throw new Error("Calendar fetch failed: Edge Function returned an unexpected payload");
  }

  if (data.stage !== "success") {
    throw new Error(formatError(data.stage, (data as ErrorResponse).error, (data as ErrorResponse).details));
  }

  if (!Array.isArray(data.events)) {
    throw new Error("Calendar fetch failed: success payload missing events array");
  }

  return data.events;
}
