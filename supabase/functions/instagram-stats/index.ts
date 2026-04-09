const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FALLBACK_COUNT = "2.5K+";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Instagram aggressively blocks server-side scraping (429).
  // Return the known follower count directly.
  return new Response(JSON.stringify({ count: FALLBACK_COUNT }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
