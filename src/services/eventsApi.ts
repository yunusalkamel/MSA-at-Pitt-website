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

function getSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

  if (!url || !publishableKey) {
    throw new Error(
      "Supabase config missing: VITE_SUPABASE_URL and/or VITE_SUPABASE_PUBLISHABLE_KEY are not set. The Edge Function cannot be reached.",
    );
  }

  return { url, publishableKey };
}

async function probeFunctionEndpoint(functionUrl: string, publishableKey: string): Promise<string> {
  try {
    const response = await fetch(functionUrl, {
      method: "GET",
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
      },
    });

    if (response.status === 404) {
      return `Function endpoint not found (404) at ${functionUrl}. This usually means the function is not deployed under the name \"${EDGE_FUNCTION_NAME}\".`;
    }

    if (response.status === 401 || response.status === 403) {
      return `Function endpoint responded with ${response.status} at ${functionUrl}. This usually indicates project URL/key mismatch or incorrect publishable key.`;
    }

    if (response.status >= 500) {
      const text = await response.text();
      return `Function endpoint reached but returned ${response.status}: ${text}`;
    }

    return `Function endpoint is reachable at ${functionUrl}, but supabase.functions.invoke failed. Check SDK/network middleware.`;
  } catch (error) {
    return `Network failure reaching ${functionUrl}: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function fetchEventsFromCalendar(): Promise<MSAEvent[]> {
  const { url, publishableKey } = getSupabaseConfig();

  const { data, error } = await supabase.functions.invoke<EventsResponse | ErrorResponse>(EDGE_FUNCTION_NAME, {
    method: "GET",
  });

  if (error) {
    const functionUrl = `${url.replace(/\/$/, "")}/functions/v1/${EDGE_FUNCTION_NAME}`;
    const probeDetails = await probeFunctionEndpoint(functionUrl, publishableKey);
    throw new Error(
      `Calendar fetch failed at edge invoke (${EDGE_FUNCTION_NAME}): ${error.message} | ${probeDetails}`,
    );
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
