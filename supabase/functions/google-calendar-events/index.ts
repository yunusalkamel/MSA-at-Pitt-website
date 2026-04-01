import { fetchGoogleCalendarEvents, GoogleCalendarError } from "./google-calendar-service.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
    if (!apiKey) {
      const errorPayload = {
        stage: "missing_secret",
        error: "Missing required secret: GOOGLE_CALENDAR_API_KEY",
      };
      console.error("[google-calendar-events]", errorPayload);
      return new Response(JSON.stringify(errorPayload), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const events = await fetchGoogleCalendarEvents(apiKey);
    return new Response(JSON.stringify({ stage: "success", count: events.length, events }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const errorPayload = {
      stage: error instanceof GoogleCalendarError ? error.stage : "edge_function",
      error: error instanceof Error ? error.message : "Unknown error",
      details: error instanceof GoogleCalendarError ? error.details : undefined,
    };

    console.error("[google-calendar-events]", errorPayload);
    return new Response(JSON.stringify(errorPayload), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
