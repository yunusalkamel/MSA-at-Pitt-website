import {
  fetchAndClassifyBlocks,
  normalizeBlocks,
  CalendarFeedError,
  type ClassifiedBlock,
} from "./google-calendar-service.ts";
import { classifyWithGemini } from "./classify-ai.ts";
import { getCachedTagsBatch, setCachedTags, type CachedClassification } from "./tag-cache.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IMPLEMENTATION = "ics_no_key_v4";
// Max new Gemini calls per invocation — prevents 429 floods when many events appear at once.
// Uncapped events fall back to rules-based tags and get AI-classified on future requests.
const MAX_GEMINI_CALLS_PER_INVOCATION = 8;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute in-memory cache

let cachedResponse: string | null = null;
let cacheTimestamp = 0;

/**
 * For blocks that need AI, checks the DB cache first, then calls Gemini for uncached ones.
 * Mutates the classification field on each block in-place.
 * Never throws — any failure silently keeps the rules-based result.
 */
async function applyAiClassification(
  candidates: ClassifiedBlock[],
): Promise<void> {
  if (candidates.length === 0) return;
  console.log(`[ai] ${candidates.length} events need classification`);

  // Build cache lookup entries using the ICS UID and LAST-MODIFIED fields
  const cacheEntries = candidates.map((c) => ({
    id: c.block.UID || c.block.DTSTART || "unknown",
    updated: c.block["LAST-MODIFIED"] || "",
  }));

  let cachedResults = new Map<string, CachedClassification>();
  try {
    cachedResults = await getCachedTagsBatch(cacheEntries);
  } catch {
    // Cache read failure is non-fatal
  }

  const uncachedCandidates = candidates.filter((c) => !cachedResults.has(c.block.UID || c.block.DTSTART || "unknown"));
  const uncachedCount = uncachedCandidates.length;
  const geminiCallCount = Math.min(uncachedCount, MAX_GEMINI_CALLS_PER_INVOCATION);
  console.log(`[ai] ${cachedResults.size} cache hits, ${uncachedCount} need Gemini (capped at ${geminiCallCount}, ~${Math.ceil(geminiCallCount * 2.2)}s)`);

  // Process each candidate sequentially to avoid Gemini rate limits (429).
  // Cache hits are instant; only uncached events actually call Gemini (capped per invocation).
  let geminiCallsMade = 0;
  for (const item of candidates) {
    const eventId = item.block.UID || item.block.DTSTART || "unknown";
    const eventUpdated = item.block["LAST-MODIFIED"] || "";

    // Cache hit — use stored AI result, no network call needed
    const cached = cachedResults.get(eventId);
    if (cached) {
      item.classification = {
        ...item.classification,
        audience: cached.audience,
        categories: cached.categories,
        isSignature: cached.isSignature,
        confidence: cached.confidence,
        tagSource: "ai",
      };
      item.needsAI = false;
      continue;
    }

    // No cache — call Gemini only if under the per-invocation cap
    if (geminiCallsMade >= MAX_GEMINI_CALLS_PER_INVOCATION) {
      item.classification = { ...item.classification, tagSource: "uncategorized" };
      item.needsAI = false;
      continue;
    }

    geminiCallsMade++;
    const title = item.block.SUMMARY || "";
    const description = item.block.DESCRIPTION || "";
    const location = item.block.LOCATION || "";
    const start = item.block.DTSTART || "";

    const aiResult = await classifyWithGemini({ title, description, location, start });

    if (aiResult && aiResult.confidence >= 0.7) {
      // Store in DB so this event is never sent to Gemini again
      try {
        await setCachedTags(eventId, eventUpdated, aiResult, title);
      } catch {
        // Cache write failure is non-fatal
      }
      item.classification = {
        ...item.classification,
        audience: aiResult.audience,
        categories: aiResult.categories,
        isSignature: aiResult.isSignature,
        confidence: aiResult.confidence,
        tagSource: "ai",
      };
    } else {
      item.classification = {
        ...item.classification,
        tagSource: "uncategorized",
      };
    }
    item.needsAI = false;

    // 2200ms between calls keeps us at ~27 RPM, safely under Gemini free tier (30 RPM).
    // With ~30 events this adds ~66s on first load; after that everything is cached.
    await new Promise((r) => setTimeout(r, 2200));
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const now = Date.now();

    // Return in-memory cached response if still fresh
    if (cachedResponse && now - cacheTimestamp < CACHE_TTL_MS) {
      return new Response(cachedResponse, {
        headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "HIT" },
      });
    }

    // 1. Fetch ICS feed + sync classify all events (hashtags → rules)
    const classifiedBlocks = await fetchAndClassifyBlocks();

    // 2. Collect all blocks that need AI classification (no date window restriction)
    const aiCandidates = classifiedBlocks.filter((b) => b.needsAI);

    // 3. Apply AI classification (checks DB cache first, calls Gemini for misses)
    await applyAiClassification(aiCandidates);

    // 4. Normalize all blocks into final MSAEvent objects
    const events = normalizeBlocks(classifiedBlocks);

    const body = JSON.stringify({
      stage: "success",
      source: "public_ics",
      implementation: IMPLEMENTATION,
      count: events.length,
      events,
    });

    // Update in-memory cache
    cachedResponse = body;
    cacheTimestamp = now;

    return new Response(body, {
      headers: { ...corsHeaders, "Content-Type": "application/json", "X-Cache": "MISS" },
    });
  } catch (error) {
    // Serve stale cache rather than an error when available
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
