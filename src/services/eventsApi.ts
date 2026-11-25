import { fetchPublicFunction } from "@/services/publicFunctions";
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

let activeRequest: Promise<MSAEvent[]> | undefined;

export function fetchEventsFromCalendar() {
  activeRequest ??= loadEvents().finally(() => { activeRequest = undefined; });
  return activeRequest;
}

async function loadEvents(): Promise<MSAEvent[]> {
  const response = await fetchPublicFunction(EDGE_FUNCTION_NAME);
  const data: EventsResponse | ErrorResponse | null = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(formatError(data?.stage, (data as ErrorResponse | null)?.error || `HTTP ${response.status}`, (data as ErrorResponse | null)?.details));
  }
  if (!data || !("stage" in data)) {
    throw new Error("Calendar fetch failed: Edge Function returned an unexpected payload");
  }

  if (data.stage !== "success") {
    throw new Error(formatError(data.stage, (data as ErrorResponse).error, (data as ErrorResponse).details));
  }

  const successData = data as EventsResponse;
  if (!Array.isArray(successData.events)) {
    throw new Error("Calendar fetch failed: success payload missing events array");
  }

  return successData.events;
}
