import { fetchCalendarEventsFromPublicIcs, CalendarFeedError } from "./google-calendar-service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const events = await fetchCalendarEventsFromPublicIcs();

    return new Response(JSON.stringify({ stage: "success", source: "public_ics", count: events.length, events }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorPayload = {
      stage: error instanceof CalendarFeedError ? error.stage : "edge_function",
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
