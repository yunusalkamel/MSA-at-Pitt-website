import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CACHE_KEY = "instagram_followers";
const CACHE_TTL_HOURS = 6;
const INSTAGRAM_USERNAME = "msa.at.pitt";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function fetchFollowerCount(): Promise<string | null> {
  try {
    const res = await fetch(
      `https://www.instagram.com/${INSTAGRAM_USERNAME}/`,
      { headers: { "User-Agent": "Mozilla/5.0 (compatible; MSABot/1.0)" } }
    );
    if (!res.ok) return null;
    const text = await res.text();
    const match = text.match(/"edge_followed_by":\{"count":(\d+)\}/);
    if (match) {
      const count = parseInt(match[1]);
      if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
      return String(count);
    }
    return null;
  } catch { return null; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: cached } = await supabase
      .from("kv_store")
      .select("value, updated_at")
      .eq("key", CACHE_KEY)
      .single();

    const cacheAge = cached?.updated_at
      ? (Date.now() - new Date(cached.updated_at).getTime()) / 3600000
      : 999;

    if (cached && cacheAge < CACHE_TTL_HOURS) {
      return new Response(JSON.stringify({ count: cached.value }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fresh = await fetchFollowerCount();
    const value = fresh ?? cached?.value ?? "1.4K";

    if (fresh) {
      await supabase.from("kv_store").upsert(
        { key: CACHE_KEY, value: fresh, updated_at: new Date().toISOString() },
        { onConflict: "key" }
      );
    }

    return new Response(JSON.stringify({ count: value }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ count: "1.4K" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
