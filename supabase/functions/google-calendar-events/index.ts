import { fetchCalendarEventsFromPublicIcs, CalendarFeedError } from "./google-calendar-service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IMPLEMENTATION = "ics_no_key_v2";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cachedResponse: string | null = null;
let cacheTimestamp = 0;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const now = Date.now();

    // Return cached response if still fresh
    if (cachedResponse && now - cacheTimestamp < CACHE_TTL_MS) {
      return new Response(cachedResponse, {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    const events = await fetchCalendarEventsFromPublicIcs();

    const body = JSON.stringify({
      stage: "success",
      source: "public_ics",
      implementation: IMPLEMENTATION,
      count: events.length,
      events,
    });

    // Update cache
    cachedResponse = body;
    cacheTimestamp = now;

    return new Response(body, {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error) {
    // If we have a stale cache, serve it rather than error
    if (cachedResponse) {
      return new Response(cachedResponse, {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "STALE" },
      });
    }

    const errorPayload = {
      stage: error instanceof CalendarFeedError ? error.stage : "edge_function",
      source: "public_ics",
      implementation: IMPLEMENTATION,
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof CalendarFeedError ? error.details : undefined,
    };

    console.error("[google-calendar-events]", errorPayload);

    return new Response(JSON.stringify(errorPayload), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
